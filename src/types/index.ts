export type UserRole = 'admin' | 'founder' | 'scout'

export type DealStatus =
  | 'new'
  | 'screening'
  | 'prepping_to_distribute'
  | 'distributed'
  | 'feedback'
  | 'intro_meeting'
  | 'deal_lost'

export type ReadinessLabel = 'Early' | 'In Progress' | 'Investor Ready'

export type SourceType = 'founder_direct' | 'scout_manual' | 'scout_invite' | 'admin'

export type InstrumentType = 'safe' | 'equity' | 'convertible_note' | ''

export type InviteStatus = 'pending' | 'accepted' | 'expired'

export type AssetType = 'pdf' | 'email_teaser' | 'whatsapp_intro' | 'social_summary'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar_url?: string
  bio?: string
  phone?: string
  linkedin?: string
  organization?: string
  created_at: string
  updated_at: string
}

export interface Deal {
  id: string
  startup_name: string
  owner_id: string
  scout_id?: string
  founder_id?: string
  source_type: SourceType
  status: DealStatus
  completion_percentage: number
  readiness_label: ReadinessLabel
  sections: DealSections
  created_at: string
  updated_at: string
  // Joined fields
  owner?: User
  scout?: User
  founder?: User
}

export interface DealSections {
  core_info: CoreInfoSection
  founder_team: FounderTeamSection
  problem_solution: ProblemSolutionSection
  market: MarketSection
  product_traction: ProductTractionSection
  capital_snapshot: CapitalSnapshotSection
  investment_case: InvestmentCaseSection
  distribution_assets: DistributionAssetsSection
}

export interface CoreInfoSection {
  startup_name: string
  logo_url: string
  one_line_description: string
  full_business_overview: string
  website: string
  headquarters: string
  year_founded: string
  industry: string
  sub_sector: string
  business_model_types: string[]
  business_model_explanation: string
}

export interface FounderTeamSection {
  founder_name: string
  co_founders: string
  key_team_members: string
  founder_bios: string
  team_credibility: string
  team_strengths: string
  gaps_hiring_needs: string
}

export interface ProblemSolutionSection {
  problem_statement: string
  solution_summary: string
  why_now: string
  customer_pain_point: string
  differentiation: string
}

export interface MarketSection {
  target_customer: string
  geography: string
  tam_usd: string
  sam_usd: string
  market_insight: string
  competitors: string
  defensibility: string
}

export interface ProductTractionSection {
  product_stage: string
  current_users: string
  revenue_status: string
  traction_metrics: string
  milestones_achieved: string
  roadmap_12_months: string
  demo_link: string
}

export interface CapitalSnapshotSection {
  current_round: string
  raise_amount: string
  instrument_type: InstrumentType
  target_ownership: string
  use_of_funds: string
  previous_funding: string
  previous_investors: string
  runway: string
  // SAFE fields
  valuation_cap: string
  discount: string
  // Equity fields
  pre_money_valuation: string
  round_lead_status: string
  // Convertible note fields
  note_cap: string
  note_discount: string
  maturity: string
}

export interface InvestmentCaseSection {
  why_now: string
  growth_drivers: string
  key_risks: string
  mitigants: string
  expansion_opportunity: string
  why_hero_should_care: string
}

export interface DistributionAssetsSection {
  deck_url: string
  one_pager_url: string
  social_links: string
  founder_video_url: string
  key_images: string
}

export interface StatusHistory {
  id: string
  deal_id: string
  old_status: DealStatus
  new_status: DealStatus
  changed_by: string
  created_at: string
}

export interface InternalNote {
  id: string
  deal_id: string
  admin_id: string
  note_body: string
  created_at: string
  admin?: User
}

export interface Invite {
  id: string
  scout_id: string
  founder_email: string
  startup_name: string
  status: InviteStatus
  token: string
  deal_id?: string
  created_at: string
  accepted_at?: string
}

export interface GeneratedAsset {
  id: string
  deal_id: string
  asset_type: AssetType
  content: string
  created_at: string
}

export function getEmptyDealSections(): DealSections {
  return {
    core_info: {
      startup_name: '',
      logo_url: '',
      one_line_description: '',
      full_business_overview: '',
      website: '',
      headquarters: '',
      year_founded: '',
      industry: '',
      sub_sector: '',
      business_model_types: [],
      business_model_explanation: '',
    },
    founder_team: {
      founder_name: '',
      co_founders: '',
      key_team_members: '',
      founder_bios: '',
      team_credibility: '',
      team_strengths: '',
      gaps_hiring_needs: '',
    },
    problem_solution: {
      problem_statement: '',
      solution_summary: '',
      why_now: '',
      customer_pain_point: '',
      differentiation: '',
    },
    market: {
      target_customer: '',
      geography: '',
      tam_usd: '',
      sam_usd: '',
      market_insight: '',
      competitors: '',
      defensibility: '',
    },
    product_traction: {
      product_stage: '',
      current_users: '',
      revenue_status: '',
      traction_metrics: '',
      milestones_achieved: '',
      roadmap_12_months: '',
      demo_link: '',
    },
    capital_snapshot: {
      current_round: '',
      raise_amount: '',
      instrument_type: '',
      target_ownership: '',
      use_of_funds: '',
      previous_funding: '',
      previous_investors: '',
      runway: '',
      valuation_cap: '',
      discount: '',
      pre_money_valuation: '',
      round_lead_status: '',
      note_cap: '',
      note_discount: '',
      maturity: '',
    },
    investment_case: {
      why_now: '',
      growth_drivers: '',
      key_risks: '',
      mitigants: '',
      expansion_opportunity: '',
      why_hero_should_care: '',
    },
    distribution_assets: {
      deck_url: '',
      one_pager_url: '',
      social_links: '',
      founder_video_url: '',
      key_images: '',
    },
  }
}

export const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  new: 'New',
  screening: 'Screening',
  prepping_to_distribute: 'Prepping to Distribute',
  distributed: 'Distributed',
  feedback: 'Feedback',
  intro_meeting: 'Intro Meeting',
  deal_lost: 'Deal Lost',
}

export const DEAL_STATUS_COLORS: Record<DealStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  screening: 'bg-yellow-100 text-yellow-800',
  prepping_to_distribute: 'bg-purple-100 text-purple-800',
  distributed: 'bg-green-100 text-green-800',
  feedback: 'bg-orange-100 text-orange-800',
  intro_meeting: 'bg-indigo-100 text-indigo-800',
  deal_lost: 'bg-red-100 text-red-800',
}

export const FOUNDER_STATUS_LABELS: Record<DealStatus, string> = {
  new: 'Submitted',
  screening: 'Under Review',
  prepping_to_distribute: 'Being Prepared',
  distributed: 'Shared with Investors',
  feedback: 'Investor Feedback',
  intro_meeting: 'Meeting Scheduled',
  deal_lost: 'Not Progressing',
}
