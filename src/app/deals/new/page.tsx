'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { DealSections, getEmptyDealSections, InstrumentType, SourceType } from '@/types'
import { calculateDealCompletion } from '@/lib/utils'
import DealFormSection from '@/components/deals/DealFormSection'
import { Input, Textarea, Select } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import ProgressBar from '@/components/ui/ProgressBar'
import Badge from '@/components/ui/Badge'
import { Save, Send, UserPlus } from 'lucide-react'

const BUSINESS_MODEL_OPTIONS = ['B2B', 'B2C', 'B2B2C', 'Marketplace', 'SaaS', 'Fintech Infrastructure', 'Hardware', 'Other']

export default function NewDealPage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [sections, setSections] = useState<DealSections>(getEmptyDealSections())
  const [saving, setSaving] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteFounderName, setInviteFounderName] = useState('')

  const isScout = user?.role === 'scout'
  const completion = calculateDealCompletion(sections)

  const updateSection = <K extends keyof DealSections>(
    sectionKey: K,
    field: keyof DealSections[K],
    value: unknown
  ) => {
    setSections(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [field]: value,
      },
    }))
  }

  const toggleBusinessModel = (model: string) => {
    const current = sections.core_info.business_model_types
    const updated = current.includes(model)
      ? current.filter(m => m !== model)
      : [...current, model]
    updateSection('core_info', 'business_model_types', updated)
  }

  const handleSave = async (submit: boolean = false) => {
    if (!user) return
    setSaving(true)

    const sourceType: SourceType = isScout
      ? (showInvite ? 'scout_invite' : 'scout_manual')
      : user.role === 'admin' ? 'admin' : 'founder_direct'

    const newCompletion = calculateDealCompletion(sections)

    const dealData = {
      startup_name: sections.core_info.startup_name || 'Untitled Deal',
      owner_id: user.id,
      scout_id: isScout ? user.id : null,
      founder_id: !isScout ? user.id : null,
      source_type: sourceType,
      status: 'new' as const,
      completion_percentage: newCompletion.overall,
      readiness_label: newCompletion.readiness,
      sections,
    }

    const { data: deal, error } = await supabase
      .from('deals')
      .insert(dealData)
      .select()
      .single()

    if (error) {
      console.error('Error creating deal:', error)
      setSaving(false)
      return
    }

    // If scout invite flow, create invite
    if (showInvite && inviteEmail && deal) {
      const token = crypto.randomUUID()
      await supabase.from('invites').insert({
        scout_id: user.id,
        founder_email: inviteEmail,
        startup_name: sections.core_info.startup_name,
        token,
        deal_id: deal.id,
        status: 'pending',
      })
    }

    setSaving(false)
    router.push(`/deals/${deal.id}`)
  }

  const sectionCompletion = (key: string) =>
    completion.sections.find(s => s.name === key)?.percentage ?? 0

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isScout ? 'Source a Deal' : 'Create New Deal'}
          </h1>
          <p className="text-gray-500 mt-1">Fill in the sections below to build your deal card</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={
            completion.readiness === 'Investor Ready' ? 'success' :
            completion.readiness === 'In Progress' ? 'warning' : 'default'
          }>
            {completion.readiness}
          </Badge>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-gray-900">Deal Readiness Progress</h2>
          <span className="text-2xl font-bold text-hero-purple">{completion.overall}%</span>
        </div>
        <ProgressBar value={completion.overall} showLabel={false} size="md" />
        <div className="grid grid-cols-4 gap-2 mt-4">
          {completion.sections.slice(0, 8).map(s => (
            <div key={s.name} className="text-center">
              <div className="text-xs text-gray-500 truncate">{s.label}</div>
              <div className="text-sm font-medium text-gray-700">{s.percentage}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scout Invite Option */}
      {isScout && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Invite Founder</h3>
              <p className="text-sm text-gray-500">Optionally invite the founder to complete this deal</p>
            </div>
            <Button
              variant={showInvite ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setShowInvite(!showInvite)}
            >
              <UserPlus size={14} className="mr-1" />
              {showInvite ? 'Invited' : 'Invite'}
            </Button>
          </div>
          {showInvite && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Input
                label="Founder Name"
                value={inviteFounderName}
                onChange={(e) => setInviteFounderName(e.target.value)}
                placeholder="Jane Doe"
              />
              <Input
                label="Founder Email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="founder@startup.com"
              />
            </div>
          )}
        </div>
      )}

      {/* Form Sections */}
      <div className="space-y-4">
        {/* Section A: Core Information */}
        <DealFormSection
          title="Core Information"
          description="Basic details about the startup"
          completionPercentage={sectionCompletion('core_info')}
          defaultOpen={true}
        >
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Startup Name"
              value={sections.core_info.startup_name}
              onChange={(e) => updateSection('core_info', 'startup_name', e.target.value)}
              placeholder="Acme Inc."
              required
            />
            <Input
              label="Website"
              value={sections.core_info.website}
              onChange={(e) => updateSection('core_info', 'website', e.target.value)}
              placeholder="https://acme.com"
            />
          </div>
          <Input
            label="One-Line Description"
            value={sections.core_info.one_line_description}
            onChange={(e) => updateSection('core_info', 'one_line_description', e.target.value)}
            placeholder="A brief description of what the startup does"
            required
          />
          <Textarea
            label="Full Business Overview"
            value={sections.core_info.full_business_overview}
            onChange={(e) => updateSection('core_info', 'full_business_overview', e.target.value)}
            placeholder="Detailed description of the business, its model, and value proposition"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Headquarters"
              value={sections.core_info.headquarters}
              onChange={(e) => updateSection('core_info', 'headquarters', e.target.value)}
              placeholder="Cape Town, South Africa"
              required
            />
            <Input
              label="Year Founded"
              value={sections.core_info.year_founded}
              onChange={(e) => updateSection('core_info', 'year_founded', e.target.value)}
              placeholder="2023"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Industry"
              value={sections.core_info.industry}
              onChange={(e) => updateSection('core_info', 'industry', e.target.value)}
              placeholder="Fintech"
              required
            />
            <Input
              label="Sub-Sector"
              value={sections.core_info.sub_sector}
              onChange={(e) => updateSection('core_info', 'sub_sector', e.target.value)}
              placeholder="Payments"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Model Type</label>
            <div className="flex flex-wrap gap-2">
              {BUSINESS_MODEL_OPTIONS.map(model => (
                <button
                  key={model}
                  type="button"
                  onClick={() => toggleBusinessModel(model)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    sections.core_info.business_model_types.includes(model)
                      ? 'bg-hero-purple text-white border-hero-purple'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-hero-purple'
                  }`}
                >
                  {model}
                </button>
              ))}
            </div>
          </div>
          <Textarea
            label="Business Model Explanation"
            value={sections.core_info.business_model_explanation}
            onChange={(e) => updateSection('core_info', 'business_model_explanation', e.target.value)}
            placeholder="Explain how the business makes money"
          />
        </DealFormSection>

        {/* Section B: Founder & Team */}
        <DealFormSection
          title="Founder & Team"
          description="Who is building this"
          completionPercentage={sectionCompletion('founder_team')}
        >
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Founder Name"
              value={sections.founder_team.founder_name}
              onChange={(e) => updateSection('founder_team', 'founder_name', e.target.value)}
              required
            />
            <Input
              label="Co-Founders"
              value={sections.founder_team.co_founders}
              onChange={(e) => updateSection('founder_team', 'co_founders', e.target.value)}
              placeholder="Names separated by commas"
            />
          </div>
          <Textarea
            label="Key Team Members"
            value={sections.founder_team.key_team_members}
            onChange={(e) => updateSection('founder_team', 'key_team_members', e.target.value)}
            placeholder="Name - Role - Background"
          />
          <Textarea
            label="Founder Bios"
            value={sections.founder_team.founder_bios}
            onChange={(e) => updateSection('founder_team', 'founder_bios', e.target.value)}
            required
          />
          <Textarea
            label="Why This Team is Credible"
            value={sections.founder_team.team_credibility}
            onChange={(e) => updateSection('founder_team', 'team_credibility', e.target.value)}
            required
          />
          <Input
            label="Team Strengths"
            value={sections.founder_team.team_strengths}
            onChange={(e) => updateSection('founder_team', 'team_strengths', e.target.value)}
          />
          <Input
            label="Gaps / Hiring Needs"
            value={sections.founder_team.gaps_hiring_needs}
            onChange={(e) => updateSection('founder_team', 'gaps_hiring_needs', e.target.value)}
          />
        </DealFormSection>

        {/* Section C: Problem & Solution */}
        <DealFormSection
          title="Problem & Solution"
          description="The pain point and your answer"
          completionPercentage={sectionCompletion('problem_solution')}
        >
          <Textarea
            label="Problem Statement"
            value={sections.problem_solution.problem_statement}
            onChange={(e) => updateSection('problem_solution', 'problem_statement', e.target.value)}
            required
          />
          <Textarea
            label="Solution Summary"
            value={sections.problem_solution.solution_summary}
            onChange={(e) => updateSection('problem_solution', 'solution_summary', e.target.value)}
            required
          />
          <Textarea
            label="Why Now"
            value={sections.problem_solution.why_now}
            onChange={(e) => updateSection('problem_solution', 'why_now', e.target.value)}
            helperText="Why is now the right time for this solution?"
            required
          />
          <Textarea
            label="Customer Pain Point"
            value={sections.problem_solution.customer_pain_point}
            onChange={(e) => updateSection('problem_solution', 'customer_pain_point', e.target.value)}
          />
          <Textarea
            label="Differentiation"
            value={sections.problem_solution.differentiation}
            onChange={(e) => updateSection('problem_solution', 'differentiation', e.target.value)}
            required
          />
        </DealFormSection>

        {/* Section D: Market */}
        <DealFormSection
          title="Market"
          description="Market size and competitive landscape"
          completionPercentage={sectionCompletion('market')}
        >
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Target Customer"
              value={sections.market.target_customer}
              onChange={(e) => updateSection('market', 'target_customer', e.target.value)}
              required
            />
            <Input
              label="Geography"
              value={sections.market.geography}
              onChange={(e) => updateSection('market', 'geography', e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="TAM (USD)"
              value={sections.market.tam_usd}
              onChange={(e) => updateSection('market', 'tam_usd', e.target.value)}
              placeholder="$1B"
              required
            />
            <Input
              label="SAM (USD)"
              value={sections.market.sam_usd}
              onChange={(e) => updateSection('market', 'sam_usd', e.target.value)}
              placeholder="$200M"
            />
          </div>
          <Textarea
            label="Market Insight & Wedge"
            value={sections.market.market_insight}
            onChange={(e) => updateSection('market', 'market_insight', e.target.value)}
          />
          <Textarea
            label="Competitors"
            value={sections.market.competitors}
            onChange={(e) => updateSection('market', 'competitors', e.target.value)}
            required
          />
          <Textarea
            label="Defensibility / Moat"
            value={sections.market.defensibility}
            onChange={(e) => updateSection('market', 'defensibility', e.target.value)}
          />
        </DealFormSection>

        {/* Section E: Product & Traction */}
        <DealFormSection
          title="Product & Traction"
          description="Current stage and metrics"
          completionPercentage={sectionCompletion('product_traction')}
        >
          <Select
            label="Product Stage"
            value={sections.product_traction.product_stage}
            onChange={(e) => updateSection('product_traction', 'product_stage', (e.target as HTMLSelectElement).value)}
            options={[
              { value: 'idea', label: 'Idea' },
              { value: 'prototype', label: 'Prototype' },
              { value: 'mvp', label: 'MVP' },
              { value: 'beta', label: 'Beta' },
              { value: 'launched', label: 'Launched' },
              { value: 'scaling', label: 'Scaling' },
            ]}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Current Users / Customers"
              value={sections.product_traction.current_users}
              onChange={(e) => updateSection('product_traction', 'current_users', e.target.value)}
            />
            <Input
              label="Revenue Status"
              value={sections.product_traction.revenue_status}
              onChange={(e) => updateSection('product_traction', 'revenue_status', e.target.value)}
              placeholder="Pre-revenue, $10K MRR, etc."
            />
          </div>
          <Textarea
            label="Traction Metrics"
            value={sections.product_traction.traction_metrics}
            onChange={(e) => updateSection('product_traction', 'traction_metrics', e.target.value)}
            helperText="Key metrics showing growth and market validation"
            required
          />
          <Input
            label="Milestones Achieved"
            value={sections.product_traction.milestones_achieved}
            onChange={(e) => updateSection('product_traction', 'milestones_achieved', e.target.value)}
          />
          <Textarea
            label="Roadmap (Next 12 Months)"
            value={sections.product_traction.roadmap_12_months}
            onChange={(e) => updateSection('product_traction', 'roadmap_12_months', e.target.value)}
          />
          <Input
            label="Product Demo Link"
            value={sections.product_traction.demo_link}
            onChange={(e) => updateSection('product_traction', 'demo_link', e.target.value)}
            placeholder="https://..."
          />
        </DealFormSection>

        {/* Section F: Capital Snapshot */}
        <DealFormSection
          title="Capital Snapshot"
          description="Funding round details"
          completionPercentage={sectionCompletion('capital_snapshot')}
        >
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Current Funding Round"
              value={sections.capital_snapshot.current_round}
              onChange={(e) => updateSection('capital_snapshot', 'current_round', e.target.value)}
              placeholder="Pre-Seed, Seed, Series A"
              required
            />
            <Input
              label="Raise Amount"
              value={sections.capital_snapshot.raise_amount}
              onChange={(e) => updateSection('capital_snapshot', 'raise_amount', e.target.value)}
              placeholder="$500,000"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Instrument Type"
              value={sections.capital_snapshot.instrument_type}
              onChange={(e) => updateSection('capital_snapshot', 'instrument_type', (e.target as HTMLSelectElement).value as InstrumentType)}
              options={[
                { value: 'safe', label: 'SAFE' },
                { value: 'equity', label: 'Equity' },
                { value: 'convertible_note', label: 'Convertible Note' },
              ]}
              required
            />
            <Input
              label="Target Ownership"
              value={sections.capital_snapshot.target_ownership}
              onChange={(e) => updateSection('capital_snapshot', 'target_ownership', e.target.value)}
              placeholder="10-15%"
            />
          </div>
          <Textarea
            label="Use of Funds"
            value={sections.capital_snapshot.use_of_funds}
            onChange={(e) => updateSection('capital_snapshot', 'use_of_funds', e.target.value)}
            required
          />

          {/* Instrument-specific fields */}
          {sections.capital_snapshot.instrument_type === 'safe' && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-purple-50 rounded-lg">
              <Input
                label="Valuation Cap"
                value={sections.capital_snapshot.valuation_cap}
                onChange={(e) => updateSection('capital_snapshot', 'valuation_cap', e.target.value)}
                placeholder="$5M"
              />
              <Input
                label="Discount"
                value={sections.capital_snapshot.discount}
                onChange={(e) => updateSection('capital_snapshot', 'discount', e.target.value)}
                placeholder="20%"
              />
            </div>
          )}

          {sections.capital_snapshot.instrument_type === 'equity' && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-purple-50 rounded-lg">
              <Input
                label="Pre-Money Valuation"
                value={sections.capital_snapshot.pre_money_valuation}
                onChange={(e) => updateSection('capital_snapshot', 'pre_money_valuation', e.target.value)}
                placeholder="$4M"
              />
              <Input
                label="Round Lead Status"
                value={sections.capital_snapshot.round_lead_status}
                onChange={(e) => updateSection('capital_snapshot', 'round_lead_status', e.target.value)}
                placeholder="Lead secured / Seeking lead"
              />
            </div>
          )}

          {sections.capital_snapshot.instrument_type === 'convertible_note' && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-purple-50 rounded-lg">
              <Input
                label="Cap"
                value={sections.capital_snapshot.note_cap}
                onChange={(e) => updateSection('capital_snapshot', 'note_cap', e.target.value)}
                placeholder="$5M"
              />
              <Input
                label="Discount"
                value={sections.capital_snapshot.note_discount}
                onChange={(e) => updateSection('capital_snapshot', 'note_discount', e.target.value)}
                placeholder="20%"
              />
              <Input
                label="Maturity"
                value={sections.capital_snapshot.maturity}
                onChange={(e) => updateSection('capital_snapshot', 'maturity', e.target.value)}
                placeholder="18 months"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Previous Funding Raised"
              value={sections.capital_snapshot.previous_funding}
              onChange={(e) => updateSection('capital_snapshot', 'previous_funding', e.target.value)}
              placeholder="$200K"
            />
            <Input
              label="Previous Investors"
              value={sections.capital_snapshot.previous_investors}
              onChange={(e) => updateSection('capital_snapshot', 'previous_investors', e.target.value)}
            />
          </div>
          <Input
            label="Runway"
            value={sections.capital_snapshot.runway}
            onChange={(e) => updateSection('capital_snapshot', 'runway', e.target.value)}
            placeholder="6 months"
          />
        </DealFormSection>

        {/* Section G: Investment Case */}
        <DealFormSection
          title="Investment Case"
          description="Why this is an investable opportunity"
          completionPercentage={sectionCompletion('investment_case')}
        >
          <Textarea
            label="Why Now"
            value={sections.investment_case.why_now}
            onChange={(e) => updateSection('investment_case', 'why_now', e.target.value)}
            required
          />
          <Textarea
            label="Growth Drivers"
            value={sections.investment_case.growth_drivers}
            onChange={(e) => updateSection('investment_case', 'growth_drivers', e.target.value)}
            required
          />
          <Textarea
            label="Key Risks"
            value={sections.investment_case.key_risks}
            onChange={(e) => updateSection('investment_case', 'key_risks', e.target.value)}
            required
          />
          <Textarea
            label="Mitigants"
            value={sections.investment_case.mitigants}
            onChange={(e) => updateSection('investment_case', 'mitigants', e.target.value)}
          />
          <Textarea
            label="Expansion Opportunity"
            value={sections.investment_case.expansion_opportunity}
            onChange={(e) => updateSection('investment_case', 'expansion_opportunity', e.target.value)}
          />
          <Textarea
            label="Why Hero Should Care"
            value={sections.investment_case.why_hero_should_care}
            onChange={(e) => updateSection('investment_case', 'why_hero_should_care', e.target.value)}
            required
          />
        </DealFormSection>

        {/* Section H: Distribution Assets */}
        <DealFormSection
          title="Distribution Assets & Media"
          description="Supporting materials (all optional)"
          completionPercentage={sectionCompletion('distribution_assets')}
        >
          <Input
            label="Deck URL"
            value={sections.distribution_assets.deck_url}
            onChange={(e) => updateSection('distribution_assets', 'deck_url', e.target.value)}
            placeholder="Link to pitch deck"
          />
          <Input
            label="One-Pager URL"
            value={sections.distribution_assets.one_pager_url}
            onChange={(e) => updateSection('distribution_assets', 'one_pager_url', e.target.value)}
            placeholder="Link to one-pager"
          />
          <Input
            label="Social Links"
            value={sections.distribution_assets.social_links}
            onChange={(e) => updateSection('distribution_assets', 'social_links', e.target.value)}
            placeholder="Twitter, LinkedIn, etc."
          />
          <Input
            label="Founder Video URL"
            value={sections.distribution_assets.founder_video_url}
            onChange={(e) => updateSection('distribution_assets', 'founder_video_url', e.target.value)}
            placeholder="Link to video pitch"
          />
        </DealFormSection>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-8 p-4 bg-white rounded-xl border border-gray-200 sticky bottom-4">
        <p className="text-sm text-gray-500">
          Deal Readiness: <span className="font-medium text-gray-900">{completion.overall}%</span>
          {' - '}
          <span className={
            completion.readiness === 'Investor Ready' ? 'text-green-600' :
            completion.readiness === 'In Progress' ? 'text-yellow-600' : 'text-gray-600'
          }>
            {completion.readiness}
          </span>
        </p>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
            <Save size={16} className="mr-2" />
            Save Draft
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving}>
            <Send size={16} className="mr-2" />
            {saving ? 'Saving...' : 'Submit Deal'}
          </Button>
        </div>
      </div>
    </div>
  )
}
