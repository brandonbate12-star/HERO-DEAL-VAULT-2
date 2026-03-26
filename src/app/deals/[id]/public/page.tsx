'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Deal, DealSections } from '@/types'
import { useParams } from 'next/navigation'
import { Building2, Globe, MapPin, Calendar, Briefcase, Users, Target, DollarSign, TrendingUp, Shield } from 'lucide-react'

export default function PublicDealPage() {
  const { id } = useParams()
  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchDeal = async () => {
      const { data } = await supabase
        .from('deals')
        .select('*')
        .eq('id', id)
        .single()

      if (data) setDeal(data as Deal)
      setLoading(false)
    }
    if (id) fetchDeal()
  }, [id, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-hero-purple border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!deal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Deal not found or not publicly available.</p>
      </div>
    )
  }

  const s = deal.sections as DealSections

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-hero-dark text-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="flex items-center gap-2 text-hero-purple-light text-sm mb-4">
            <Shield size={14} />
            <span>Hero Deal Vault</span>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-hero-purple/20 rounded-2xl flex items-center justify-center">
              <Building2 size={32} className="text-hero-purple-light" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{s.core_info?.startup_name || 'Untitled'}</h1>
              <p className="text-gray-300 mt-2 text-lg">{s.core_info?.one_line_description}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
                {s.core_info?.industry && <span className="flex items-center gap-1"><Briefcase size={14} />{s.core_info.industry}</span>}
                {s.core_info?.headquarters && <span className="flex items-center gap-1"><MapPin size={14} />{s.core_info.headquarters}</span>}
                {s.core_info?.year_founded && <span className="flex items-center gap-1"><Calendar size={14} />Founded {s.core_info.year_founded}</span>}
                {s.core_info?.website && <a href={s.core_info.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-hero-purple-light hover:text-hero-purple"><Globe size={14} />Website</a>}
              </div>
            </div>
          </div>

          {/* Capital Banner */}
          <div className="grid grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Round', value: s.capital_snapshot?.current_round },
              { label: 'Raising', value: s.capital_snapshot?.raise_amount },
              { label: 'Instrument', value: s.capital_snapshot?.instrument_type?.toUpperCase() },
              { label: 'Stage', value: s.product_traction?.product_stage },
            ].map(({ label, value }) => value && (
              <div key={label} className="glass-card p-4 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
                <p className="text-lg font-bold mt-1 capitalize">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {s.core_info?.full_business_overview && (
          <section className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Business Overview</h2>
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{s.core_info.full_business_overview}</p>
            {s.core_info?.business_model_types?.length > 0 && (
              <div className="flex gap-2 mt-4">
                {s.core_info.business_model_types.map(m => (
                  <span key={m} className="px-3 py-1 bg-purple-50 text-hero-purple text-sm rounded-full">{m}</span>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Team */}
        <section className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Users size={20} className="text-hero-purple" /> Team</h2>
          <div className="space-y-3 text-gray-600">
            {s.founder_team?.founder_name && <p><strong>Founder:</strong> {s.founder_team.founder_name}</p>}
            {s.founder_team?.co_founders && <p><strong>Co-Founders:</strong> {s.founder_team.co_founders}</p>}
            {s.founder_team?.founder_bios && <p className="whitespace-pre-wrap">{s.founder_team.founder_bios}</p>}
            {s.founder_team?.team_credibility && <p><strong>Why credible:</strong> {s.founder_team.team_credibility}</p>}
          </div>
        </section>

        {/* Problem & Solution */}
        <section className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Target size={20} className="text-hero-purple" /> Problem & Solution</h2>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">The Problem</h3>
              <p className="text-gray-600">{s.problem_solution?.problem_statement}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Our Solution</h3>
              <p className="text-gray-600">{s.problem_solution?.solution_summary}</p>
            </div>
          </div>
          {s.problem_solution?.why_now && (
            <div className="mt-6 p-4 bg-purple-50 rounded-lg">
              <p className="text-sm"><strong className="text-hero-purple">Why Now:</strong> {s.problem_solution.why_now}</p>
            </div>
          )}
        </section>

        {/* Market */}
        <section className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp size={20} className="text-hero-purple" /> Market</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {s.market?.target_customer && <div className="p-3 bg-gray-50 rounded-lg"><span className="text-xs text-gray-500 uppercase">Target</span><p className="font-medium mt-1">{s.market.target_customer}</p></div>}
            {s.market?.geography && <div className="p-3 bg-gray-50 rounded-lg"><span className="text-xs text-gray-500 uppercase">Geography</span><p className="font-medium mt-1">{s.market.geography}</p></div>}
            {s.market?.tam_usd && <div className="p-3 bg-gray-50 rounded-lg"><span className="text-xs text-gray-500 uppercase">TAM</span><p className="font-medium mt-1">{s.market.tam_usd}</p></div>}
            {s.market?.sam_usd && <div className="p-3 bg-gray-50 rounded-lg"><span className="text-xs text-gray-500 uppercase">SAM</span><p className="font-medium mt-1">{s.market.sam_usd}</p></div>}
          </div>
          {s.market?.competitors && <p className="text-gray-600"><strong>Competitors:</strong> {s.market.competitors}</p>}
          {s.market?.defensibility && <p className="text-gray-600 mt-2"><strong>Moat:</strong> {s.market.defensibility}</p>}
        </section>

        {/* Capital */}
        <section className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><DollarSign size={20} className="text-hero-purple" /> Capital Snapshot</h2>
          <div className="grid grid-cols-3 gap-4">
            {s.capital_snapshot?.current_round && <div className="p-3 bg-gray-50 rounded-lg"><span className="text-xs text-gray-500 uppercase">Round</span><p className="font-medium mt-1">{s.capital_snapshot.current_round}</p></div>}
            {s.capital_snapshot?.raise_amount && <div className="p-3 bg-gray-50 rounded-lg"><span className="text-xs text-gray-500 uppercase">Raising</span><p className="font-medium mt-1">{s.capital_snapshot.raise_amount}</p></div>}
            {s.capital_snapshot?.instrument_type && <div className="p-3 bg-gray-50 rounded-lg"><span className="text-xs text-gray-500 uppercase">Instrument</span><p className="font-medium mt-1 uppercase">{s.capital_snapshot.instrument_type}</p></div>}
          </div>
          {s.capital_snapshot?.use_of_funds && <p className="text-gray-600 mt-4"><strong>Use of Funds:</strong> {s.capital_snapshot.use_of_funds}</p>}
        </section>

        {/* Investment Case */}
        {s.investment_case?.why_hero_should_care && (
          <section className="bg-hero-dark text-white rounded-xl p-8">
            <h2 className="text-xl font-bold mb-4">Investment Case</h2>
            <div className="space-y-4 text-gray-300">
              {s.investment_case?.why_now && <div><h3 className="text-hero-purple-light font-semibold mb-1">Why Now</h3><p>{s.investment_case.why_now}</p></div>}
              {s.investment_case?.growth_drivers && <div><h3 className="text-hero-purple-light font-semibold mb-1">Growth Drivers</h3><p>{s.investment_case.growth_drivers}</p></div>}
              {s.investment_case?.key_risks && <div><h3 className="text-hero-purple-light font-semibold mb-1">Key Risks</h3><p>{s.investment_case.key_risks}</p></div>}
              {s.investment_case?.why_hero_should_care && <div><h3 className="text-hero-purple-light font-semibold mb-1">Why Invest</h3><p>{s.investment_case.why_hero_should_care}</p></div>}
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="text-center py-8 text-gray-400 text-sm">
          <p>Presented via Hero Deal Vault</p>
        </div>
      </div>
    </div>
  )
}
