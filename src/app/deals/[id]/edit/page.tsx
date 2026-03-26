'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Deal, DealSections, getEmptyDealSections, InstrumentType } from '@/types'
import { calculateDealCompletion } from '@/lib/utils'
import DealFormSection from '@/components/deals/DealFormSection'
import { Input, Textarea, Select } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import ProgressBar from '@/components/ui/ProgressBar'
import Badge from '@/components/ui/Badge'
import { useParams, useRouter } from 'next/navigation'
import { Save, ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'

const BUSINESS_MODEL_OPTIONS = ['B2B', 'B2C', 'B2B2C', 'Marketplace', 'SaaS', 'Fintech Infrastructure', 'Hardware', 'Other']

export default function EditDealPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [sections, setSections] = useState<DealSections>(getEmptyDealSections())
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDeal = async () => {
      const { data } = await supabase
        .from('deals')
        .select('*')
        .eq('id', id)
        .single()

      if (data) {
        const dealSections = data.sections as DealSections
        setSections({ ...getEmptyDealSections(), ...dealSections })
      }
      setLoading(false)
    }

    if (id) fetchDeal()
  }, [id, supabase])

  const completion = calculateDealCompletion(sections)

  const updateSection = <K extends keyof DealSections>(
    sectionKey: K,
    field: keyof DealSections[K],
    value: unknown
  ) => {
    setSections(prev => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], [field]: value },
    }))
    setSaved(false)
  }

  const toggleBusinessModel = (model: string) => {
    const current = sections.core_info.business_model_types
    const updated = current.includes(model) ? current.filter(m => m !== model) : [...current, model]
    updateSection('core_info', 'business_model_types', updated)
  }

  const handleSave = async () => {
    setSaving(true)
    const newCompletion = calculateDealCompletion(sections)

    await supabase
      .from('deals')
      .update({
        startup_name: sections.core_info.startup_name || 'Untitled Deal',
        sections,
        completion_percentage: newCompletion.overall,
        readiness_label: newCompletion.readiness,
      })
      .eq('id', id)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const sectionCompletion = (key: string) =>
    completion.sections.find(s => s.name === key)?.percentage ?? 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-hero-purple border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href={`/deals/${id}`} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Deal</h1>
            <p className="text-gray-500 mt-1">{sections.core_info.startup_name || 'Untitled'}</p>
          </div>
        </div>
        <Badge variant={
          completion.readiness === 'Investor Ready' ? 'success' :
          completion.readiness === 'In Progress' ? 'warning' : 'default'
        }>
          {completion.readiness}
        </Badge>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-gray-900">Deal Readiness Progress</h2>
          <span className="text-2xl font-bold text-hero-purple">{completion.overall}%</span>
        </div>
        <ProgressBar value={completion.overall} showLabel={false} size="md" />
      </div>

      <div className="space-y-4">
        {/* Core Info */}
        <DealFormSection title="Core Information" completionPercentage={sectionCompletion('core_info')} defaultOpen={true}>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Startup Name" value={sections.core_info.startup_name} onChange={(e) => updateSection('core_info', 'startup_name', e.target.value)} required />
            <Input label="Website" value={sections.core_info.website} onChange={(e) => updateSection('core_info', 'website', e.target.value)} />
          </div>
          <Input label="One-Line Description" value={sections.core_info.one_line_description} onChange={(e) => updateSection('core_info', 'one_line_description', e.target.value)} required />
          <Textarea label="Full Business Overview" value={sections.core_info.full_business_overview} onChange={(e) => updateSection('core_info', 'full_business_overview', e.target.value)} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Headquarters" value={sections.core_info.headquarters} onChange={(e) => updateSection('core_info', 'headquarters', e.target.value)} required />
            <Input label="Year Founded" value={sections.core_info.year_founded} onChange={(e) => updateSection('core_info', 'year_founded', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Industry" value={sections.core_info.industry} onChange={(e) => updateSection('core_info', 'industry', e.target.value)} required />
            <Input label="Sub-Sector" value={sections.core_info.sub_sector} onChange={(e) => updateSection('core_info', 'sub_sector', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Model Type</label>
            <div className="flex flex-wrap gap-2">
              {BUSINESS_MODEL_OPTIONS.map(model => (
                <button key={model} type="button" onClick={() => toggleBusinessModel(model)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${sections.core_info.business_model_types.includes(model) ? 'bg-hero-purple text-white border-hero-purple' : 'bg-white text-gray-600 border-gray-300 hover:border-hero-purple'}`}>
                  {model}
                </button>
              ))}
            </div>
          </div>
          <Textarea label="Business Model Explanation" value={sections.core_info.business_model_explanation} onChange={(e) => updateSection('core_info', 'business_model_explanation', e.target.value)} />
        </DealFormSection>

        {/* Team */}
        <DealFormSection title="Founder & Team" completionPercentage={sectionCompletion('founder_team')}>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Founder Name" value={sections.founder_team.founder_name} onChange={(e) => updateSection('founder_team', 'founder_name', e.target.value)} required />
            <Input label="Co-Founders" value={sections.founder_team.co_founders} onChange={(e) => updateSection('founder_team', 'co_founders', e.target.value)} />
          </div>
          <Textarea label="Key Team Members" value={sections.founder_team.key_team_members} onChange={(e) => updateSection('founder_team', 'key_team_members', e.target.value)} />
          <Textarea label="Founder Bios" value={sections.founder_team.founder_bios} onChange={(e) => updateSection('founder_team', 'founder_bios', e.target.value)} required />
          <Textarea label="Why This Team is Credible" value={sections.founder_team.team_credibility} onChange={(e) => updateSection('founder_team', 'team_credibility', e.target.value)} required />
          <Input label="Team Strengths" value={sections.founder_team.team_strengths} onChange={(e) => updateSection('founder_team', 'team_strengths', e.target.value)} />
          <Input label="Gaps / Hiring Needs" value={sections.founder_team.gaps_hiring_needs} onChange={(e) => updateSection('founder_team', 'gaps_hiring_needs', e.target.value)} />
        </DealFormSection>

        {/* Problem & Solution */}
        <DealFormSection title="Problem & Solution" completionPercentage={sectionCompletion('problem_solution')}>
          <Textarea label="Problem Statement" value={sections.problem_solution.problem_statement} onChange={(e) => updateSection('problem_solution', 'problem_statement', e.target.value)} required />
          <Textarea label="Solution Summary" value={sections.problem_solution.solution_summary} onChange={(e) => updateSection('problem_solution', 'solution_summary', e.target.value)} required />
          <Textarea label="Why Now" value={sections.problem_solution.why_now} onChange={(e) => updateSection('problem_solution', 'why_now', e.target.value)} required />
          <Textarea label="Customer Pain Point" value={sections.problem_solution.customer_pain_point} onChange={(e) => updateSection('problem_solution', 'customer_pain_point', e.target.value)} />
          <Textarea label="Differentiation" value={sections.problem_solution.differentiation} onChange={(e) => updateSection('problem_solution', 'differentiation', e.target.value)} required />
        </DealFormSection>

        {/* Market */}
        <DealFormSection title="Market" completionPercentage={sectionCompletion('market')}>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Target Customer" value={sections.market.target_customer} onChange={(e) => updateSection('market', 'target_customer', e.target.value)} required />
            <Input label="Geography" value={sections.market.geography} onChange={(e) => updateSection('market', 'geography', e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="TAM (USD)" value={sections.market.tam_usd} onChange={(e) => updateSection('market', 'tam_usd', e.target.value)} required />
            <Input label="SAM (USD)" value={sections.market.sam_usd} onChange={(e) => updateSection('market', 'sam_usd', e.target.value)} />
          </div>
          <Textarea label="Market Insight & Wedge" value={sections.market.market_insight} onChange={(e) => updateSection('market', 'market_insight', e.target.value)} />
          <Textarea label="Competitors" value={sections.market.competitors} onChange={(e) => updateSection('market', 'competitors', e.target.value)} required />
          <Textarea label="Defensibility / Moat" value={sections.market.defensibility} onChange={(e) => updateSection('market', 'defensibility', e.target.value)} />
        </DealFormSection>

        {/* Product & Traction */}
        <DealFormSection title="Product & Traction" completionPercentage={sectionCompletion('product_traction')}>
          <Select label="Product Stage" value={sections.product_traction.product_stage}
            onChange={(e) => updateSection('product_traction', 'product_stage', (e.target as HTMLSelectElement).value)}
            options={[
              { value: 'idea', label: 'Idea' }, { value: 'prototype', label: 'Prototype' },
              { value: 'mvp', label: 'MVP' }, { value: 'beta', label: 'Beta' },
              { value: 'launched', label: 'Launched' }, { value: 'scaling', label: 'Scaling' },
            ]} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Current Users" value={sections.product_traction.current_users} onChange={(e) => updateSection('product_traction', 'current_users', e.target.value)} />
            <Input label="Revenue Status" value={sections.product_traction.revenue_status} onChange={(e) => updateSection('product_traction', 'revenue_status', e.target.value)} />
          </div>
          <Textarea label="Traction Metrics" value={sections.product_traction.traction_metrics} onChange={(e) => updateSection('product_traction', 'traction_metrics', e.target.value)} required />
          <Input label="Milestones" value={sections.product_traction.milestones_achieved} onChange={(e) => updateSection('product_traction', 'milestones_achieved', e.target.value)} />
          <Textarea label="Roadmap (12 months)" value={sections.product_traction.roadmap_12_months} onChange={(e) => updateSection('product_traction', 'roadmap_12_months', e.target.value)} />
          <Input label="Demo Link" value={sections.product_traction.demo_link} onChange={(e) => updateSection('product_traction', 'demo_link', e.target.value)} />
        </DealFormSection>

        {/* Capital Snapshot */}
        <DealFormSection title="Capital Snapshot" completionPercentage={sectionCompletion('capital_snapshot')}>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Current Round" value={sections.capital_snapshot.current_round} onChange={(e) => updateSection('capital_snapshot', 'current_round', e.target.value)} required />
            <Input label="Raise Amount" value={sections.capital_snapshot.raise_amount} onChange={(e) => updateSection('capital_snapshot', 'raise_amount', e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Instrument Type" value={sections.capital_snapshot.instrument_type}
              onChange={(e) => updateSection('capital_snapshot', 'instrument_type', (e.target as HTMLSelectElement).value as InstrumentType)}
              options={[{ value: 'safe', label: 'SAFE' }, { value: 'equity', label: 'Equity' }, { value: 'convertible_note', label: 'Convertible Note' }]} required />
            <Input label="Target Ownership" value={sections.capital_snapshot.target_ownership} onChange={(e) => updateSection('capital_snapshot', 'target_ownership', e.target.value)} />
          </div>
          <Textarea label="Use of Funds" value={sections.capital_snapshot.use_of_funds} onChange={(e) => updateSection('capital_snapshot', 'use_of_funds', e.target.value)} required />
          {sections.capital_snapshot.instrument_type === 'safe' && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-purple-50 rounded-lg">
              <Input label="Valuation Cap" value={sections.capital_snapshot.valuation_cap} onChange={(e) => updateSection('capital_snapshot', 'valuation_cap', e.target.value)} />
              <Input label="Discount" value={sections.capital_snapshot.discount} onChange={(e) => updateSection('capital_snapshot', 'discount', e.target.value)} />
            </div>
          )}
          {sections.capital_snapshot.instrument_type === 'equity' && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-purple-50 rounded-lg">
              <Input label="Pre-Money Valuation" value={sections.capital_snapshot.pre_money_valuation} onChange={(e) => updateSection('capital_snapshot', 'pre_money_valuation', e.target.value)} />
              <Input label="Round Lead Status" value={sections.capital_snapshot.round_lead_status} onChange={(e) => updateSection('capital_snapshot', 'round_lead_status', e.target.value)} />
            </div>
          )}
          {sections.capital_snapshot.instrument_type === 'convertible_note' && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-purple-50 rounded-lg">
              <Input label="Cap" value={sections.capital_snapshot.note_cap} onChange={(e) => updateSection('capital_snapshot', 'note_cap', e.target.value)} />
              <Input label="Discount" value={sections.capital_snapshot.note_discount} onChange={(e) => updateSection('capital_snapshot', 'note_discount', e.target.value)} />
              <Input label="Maturity" value={sections.capital_snapshot.maturity} onChange={(e) => updateSection('capital_snapshot', 'maturity', e.target.value)} />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Previous Funding" value={sections.capital_snapshot.previous_funding} onChange={(e) => updateSection('capital_snapshot', 'previous_funding', e.target.value)} />
            <Input label="Previous Investors" value={sections.capital_snapshot.previous_investors} onChange={(e) => updateSection('capital_snapshot', 'previous_investors', e.target.value)} />
          </div>
          <Input label="Runway" value={sections.capital_snapshot.runway} onChange={(e) => updateSection('capital_snapshot', 'runway', e.target.value)} />
        </DealFormSection>

        {/* Investment Case */}
        <DealFormSection title="Investment Case" completionPercentage={sectionCompletion('investment_case')}>
          <Textarea label="Why Now" value={sections.investment_case.why_now} onChange={(e) => updateSection('investment_case', 'why_now', e.target.value)} required />
          <Textarea label="Growth Drivers" value={sections.investment_case.growth_drivers} onChange={(e) => updateSection('investment_case', 'growth_drivers', e.target.value)} required />
          <Textarea label="Key Risks" value={sections.investment_case.key_risks} onChange={(e) => updateSection('investment_case', 'key_risks', e.target.value)} required />
          <Textarea label="Mitigants" value={sections.investment_case.mitigants} onChange={(e) => updateSection('investment_case', 'mitigants', e.target.value)} />
          <Textarea label="Expansion Opportunity" value={sections.investment_case.expansion_opportunity} onChange={(e) => updateSection('investment_case', 'expansion_opportunity', e.target.value)} />
          <Textarea label="Why Hero Should Care" value={sections.investment_case.why_hero_should_care} onChange={(e) => updateSection('investment_case', 'why_hero_should_care', e.target.value)} required />
        </DealFormSection>

        {/* Distribution Assets */}
        <DealFormSection title="Distribution Assets & Media" completionPercentage={sectionCompletion('distribution_assets')}>
          <Input label="Deck URL" value={sections.distribution_assets.deck_url} onChange={(e) => updateSection('distribution_assets', 'deck_url', e.target.value)} />
          <Input label="One-Pager URL" value={sections.distribution_assets.one_pager_url} onChange={(e) => updateSection('distribution_assets', 'one_pager_url', e.target.value)} />
          <Input label="Social Links" value={sections.distribution_assets.social_links} onChange={(e) => updateSection('distribution_assets', 'social_links', e.target.value)} />
          <Input label="Founder Video URL" value={sections.distribution_assets.founder_video_url} onChange={(e) => updateSection('distribution_assets', 'founder_video_url', e.target.value)} />
        </DealFormSection>
      </div>

      {/* Save Bar */}
      <div className="flex items-center justify-between mt-8 p-4 bg-white rounded-xl border border-gray-200 sticky bottom-4">
        <p className="text-sm text-gray-500">
          Deal Readiness: <span className="font-medium text-gray-900">{completion.overall}%</span>
        </p>
        <div className="flex items-center gap-3">
          {saved && <span className="text-green-600 text-sm flex items-center gap-1"><Check size={14} /> Saved</span>}
          <Button onClick={handleSave} disabled={saving}>
            <Save size={16} className="mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
