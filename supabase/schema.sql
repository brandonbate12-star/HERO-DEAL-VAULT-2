-- Hero Deal Vault Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'founder' CHECK (role IN ('admin', 'founder', 'scout')),
  avatar_url TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  linkedin TEXT DEFAULT '',
  organization TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Deals table
CREATE TABLE public.deals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  startup_name TEXT NOT NULL DEFAULT '',
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  scout_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  founder_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  source_type TEXT NOT NULL DEFAULT 'founder_direct' CHECK (source_type IN ('founder_direct', 'scout_manual', 'scout_invite', 'admin')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'screening', 'prepping_to_distribute', 'distributed', 'feedback', 'intro_meeting', 'deal_lost')),
  completion_percentage INTEGER NOT NULL DEFAULT 0,
  readiness_label TEXT NOT NULL DEFAULT 'Early' CHECK (readiness_label IN ('Early', 'In Progress', 'Investor Ready')),
  sections JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Status history table
CREATE TABLE public.status_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE NOT NULL,
  old_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES public.users(id) ON DELETE SET NULL NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Internal notes table
CREATE TABLE public.internal_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE NOT NULL,
  admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL NOT NULL,
  note_body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invites table
CREATE TABLE public.invites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  scout_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  founder_email TEXT NOT NULL,
  startup_name TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  token TEXT NOT NULL UNIQUE,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ
);

-- Generated assets table
CREATE TABLE public.generated_assets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('pdf', 'email_teaser', 'whatsapp_intro', 'social_summary')),
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_deals_owner_id ON public.deals(owner_id);
CREATE INDEX idx_deals_scout_id ON public.deals(scout_id);
CREATE INDEX idx_deals_founder_id ON public.deals(founder_id);
CREATE INDEX idx_deals_status ON public.deals(status);
CREATE INDEX idx_status_history_deal_id ON public.status_history(deal_id);
CREATE INDEX idx_internal_notes_deal_id ON public.internal_notes(deal_id);
CREATE INDEX idx_invites_token ON public.invites(token);
CREATE INDEX idx_invites_scout_id ON public.invites(scout_id);
CREATE INDEX idx_generated_assets_deal_id ON public.generated_assets(deal_id);

-- Row Level Security Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_assets ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can read all users" ON public.users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Deals policies
CREATE POLICY "Admins can do anything with deals" ON public.deals
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Founders can view own deals" ON public.deals
  FOR SELECT USING (owner_id = auth.uid() OR founder_id = auth.uid());

CREATE POLICY "Founders can create deals" ON public.deals
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Founders can update own deals" ON public.deals
  FOR UPDATE USING (owner_id = auth.uid() OR founder_id = auth.uid());

CREATE POLICY "Scouts can view sourced deals" ON public.deals
  FOR SELECT USING (scout_id = auth.uid() OR owner_id = auth.uid());

CREATE POLICY "Scouts can create deals" ON public.deals
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Scouts can update own deals" ON public.deals
  FOR UPDATE USING (owner_id = auth.uid());

-- Status history policies
CREATE POLICY "Admins can manage status history" ON public.status_history
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can view status history for their deals" ON public.status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.deals
      WHERE deals.id = status_history.deal_id
      AND (deals.owner_id = auth.uid() OR deals.founder_id = auth.uid() OR deals.scout_id = auth.uid())
    )
  );

-- Internal notes policies (admin only)
CREATE POLICY "Admins can manage internal notes" ON public.internal_notes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Invites policies
CREATE POLICY "Scouts can manage own invites" ON public.invites
  FOR ALL USING (scout_id = auth.uid());

CREATE POLICY "Admins can manage all invites" ON public.invites
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Anyone can read invites by token" ON public.invites
  FOR SELECT USING (true);

-- Generated assets policies
CREATE POLICY "Admins can manage generated assets" ON public.generated_assets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Deal owners can view generated assets" ON public.generated_assets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.deals
      WHERE deals.id = generated_assets.deal_id
      AND (deals.owner_id = auth.uid() OR deals.founder_id = auth.uid() OR deals.scout_id = auth.uid())
    )
  );

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user profile
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
