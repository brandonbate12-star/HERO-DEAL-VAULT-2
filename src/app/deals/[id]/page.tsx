'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Deal, DealSections, StatusHistory, InternalNote, DEAL_STATUS_LABELS, DealStatus, GeneratedAsset } from '@/types'
import { calculateDealCompletion, formatDate } from '@/lib/utils'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import StatusBadge from '@/components/ui/StatusBadge'
import ProgressBar from '@/components/ui/ProgressBar'
import { useParams, useRouter } from 'next/navigation'
import {
  Edit3, Download, Mail, MessageSquare, Globe, ArrowLeft,
  Clock, FileText, Share2, Trash2, Building2
} from 'lucide-react'
import Link from 'next/link'

export default function DealDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [deal, setDeal] = useState<Deal | null>(null)
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([])
  const [notes, setNotes] = useState<InternalNote[]>([])
  const [newNote, setNewNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [newStatus, setNewStatus] = useState<DealStatus | ''>('')
  const [generatingPdf, setGeneratingPdf] = useState(false)

  const isAdmin = user?.role === 'admin'
  const isFounder = user?.role === 'founder'

  useEffect(() => {
    const fetchDeal = async () => {
      const { data } = await supabase
        .from('deals')
        .select('*')
        .eq('id', id)
        .single()

      if (data) {
        setDeal(data as Deal)
        setNewStatus(data.status)
      }

      // Fetch status history
      const { data: history } = await supabase
        .from('status_history')
        .select('*')
        .eq('deal_id', id)
        .order('created_at', { ascending: false })

      setStatusHistory((history as StatusHistory[]) || [])

      // Fetch notes if admin
      if (user?.role === 'admin') {
        const { data: notesData } = await supabase
          .from('internal_notes')
          .select('*')
          .eq('deal_id', id)
          .order('created_at', { ascending: false })

        setNotes((notesData as InternalNote[]) || [])
      }

      setLoading(false)
    }

    if (id) fetchDeal()
  }, [id, supabase, user])

  const handleStatusChange = async () => {
    if (!deal || !newStatus || newStatus === deal.status) return

    await supabase
      .from('status_history')
      .insert({
        deal_id: deal.id,
        old_status: deal.status,
        new_status: newStatus,
        changed_by: user!.id,
      })

    await supabase
      .from('deals')
      .update({ status: newStatus })
      .eq('id', deal.id)

    setDeal({ ...deal, status: newStatus })
    setStatusHistory([
      {
        id: crypto.randomUUID(),
        deal_id: deal.id,
        old_status: deal.status,
        new_status: newStatus,
        changed_by: user!.id,
        created_at: new Date().toISOString(),
      },
      ...statusHistory,
    ])
  }

  const handleAddNote = async () => {
    if (!newNote.trim() || !deal) return

    const { data } = await supabase
      .from('internal_notes')
      .insert({
        deal_id: deal.id,
        admin_id: user!.id,
        note_body: newNote,
      })
      .select()
      .single()

    if (data) {
      setNotes([data as InternalNote, ...notes])
      setNewNote('')
    }
  }

  const generateEmailTeaser = () => {
    if (!deal?.sections) return ''
    const s = deal.sections as DealSections
    return `Subject: Investment Opportunity - ${s.core_info.startup_name}

Hi,

I'd like to introduce you to ${s.core_info.startup_name}, ${s.core_info.one_line_description}.

${s.core_info.full_business_overview}

Key Highlights:
- Industry: ${s.core_info.industry}
- Stage: ${s.product_traction.product_stage}
- Round: ${s.capital_snapshot.current_round} - raising ${s.capital_snapshot.raise_amount}
- Instrument: ${s.capital_snapshot.instrument_type?.toUpperCase()}
${s.product_traction.traction_metrics ? `- Traction: ${s.product_traction.traction_metrics}` : ''}

Team: ${s.founder_team.founder_name}${s.founder_team.co_founders ? `, ${s.founder_team.co_founders}` : ''}

Why Now: ${s.investment_case.why_now}

${s.core_info.website ? `Website: ${s.core_info.website}` : ''}

Happy to share more details or set up a call with the founder.

Best regards`
  }

  const generateWhatsAppIntro = () => {
    if (!deal?.sections) return ''
    const s = deal.sections as DealSections
    return `*${s.core_info.startup_name}* - ${s.core_info.one_line_description}

${s.core_info.industry} | ${s.capital_snapshot.current_round} | Raising ${s.capital_snapshot.raise_amount}

Founded by ${s.founder_team.founder_name}
${s.product_traction.traction_metrics ? `Traction: ${s.product_traction.traction_metrics}` : ''}

${s.core_info.website || ''}`
  }

  const handleGeneratePDF = async () => {
    setGeneratingPdf(true)
    try {
      const { default: jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      const s = deal!.sections as DealSections
      let y = 20

      // Header
      doc.setFontSize(24)
      doc.setTextColor(124, 58, 237)
      doc.text('Hero Deal Vault', 20, y)
      y += 15

      doc.setFontSize(18)
      doc.setTextColor(0, 0, 0)
      doc.text(s.core_info.startup_name || 'Untitled', 20, y)
      y += 8

      doc.setFontSize(11)
      doc.setTextColor(100, 100, 100)
      doc.text(s.core_info.one_line_description || '', 20, y, { maxWidth: 170 })
      y += 15

      const addSection = (title: string, fields: [string, string][]) => {
        if (y > 260) { doc.addPage(); y = 20 }
        doc.setFontSize(14)
        doc.setTextColor(124, 58, 237)
        doc.text(title, 20, y)
        y += 8
        doc.setFontSize(10)
        doc.setTextColor(0, 0, 0)

        fields.forEach(([label, value]) => {
          if (!value) return
          if (y > 270) { doc.addPage(); y = 20 }
          doc.setFont('helvetica', 'bold')
          doc.text(`${label}:`, 20, y)
          doc.setFont('helvetica', 'normal')
          const lines = doc.splitTextToSize(value, 130)
          doc.text(lines, 60, y)
          y += Math.max(lines.length * 5, 7)
        })
        y += 5
      }

      addSection('Core Information', [
        ['Industry', s.core_info.industry],
        ['HQ', s.core_info.headquarters],
        ['Founded', s.core_info.year_founded],
        ['Website', s.core_info.website],
        ['Model', s.core_info.business_model_types?.join(', ')],
      ])

      addSection('Team', [
        ['Founder', s.founder_team.founder_name],
        ['Co-Founders', s.founder_team.co_founders],
        ['Credibility', s.founder_team.team_credibility],
      ])

      addSection('Problem & Solution', [
        ['Problem', s.problem_solution.problem_statement],
        ['Solution', s.problem_solution.solution_summary],
        ['Why Now', s.problem_solution.why_now],
        ['Differentiation', s.problem_solution.differentiation],
      ])

      addSection('Market', [
        ['Target', s.market.target_customer],
        ['Geography', s.market.geography],
        ['TAM', s.market.tam_usd],
        ['SAM', s.market.sam_usd],
        ['Competitors', s.market.competitors],
      ])

      addSection('Product & Traction', [
        ['Stage', s.product_traction.product_stage],
        ['Users', s.product_traction.current_users],
        ['Revenue', s.product_traction.revenue_status],
        ['Traction', s.product_traction.traction_metrics],
      ])

      addSection('Capital Snapshot', [
        ['Round', s.capital_snapshot.current_round],
        ['Raising', s.capital_snapshot.raise_amount],
        ['Instrument', s.capital_snapshot.instrument_type?.toUpperCase()],
        ['Use of Funds', s.capital_snapshot.use_of_funds],
      ])

      addSection('Investment Case', [
        ['Why Now', s.investment_case.why_now],
        ['Growth', s.investment_case.growth_drivers],
        ['Risks', s.investment_case.key_risks],
        ['Why Hero', s.investment_case.why_hero_should_care],
      ])

      // Footer
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text('Generated by Hero Deal Vault | Confidential', 20, 285)

      doc.save(`${s.core_info.startup_name || 'deal'}-deal-card.pdf`)
    } catch (err) {
      console.error('PDF generation failed:', err)
    }
    setGeneratingPdf(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-hero-purple border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!deal) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-gray-900">Deal not found</h2>
        <Link href="/deals" className="text-hero-purple mt-4 inline-block">Back to deals</Link>
      </div>
    )
  }

  const sections = deal.sections as DealSections
  const completion = calculateDealCompletion(sections)

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-hero-purple/10 rounded-xl flex items-center justify-center">
              <Building2 size={24} className="text-hero-purple" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {sections.core_info?.startup_name || deal.startup_name || 'Untitled Deal'}
              </h1>
              <p className="text-gray-500">{sections.core_info?.one_line_description}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={deal.status} founderView={isFounder} />
          <Link href={`/deals/${deal.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit3 size={14} className="mr-1" /> Edit
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Progress */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-3">Deal Readiness Progress</h3>
            <ProgressBar value={completion.overall} size="lg" />
            <div className="grid grid-cols-4 gap-3 mt-4">
              {completion.sections.map(s => (
                <div key={s.name} className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 truncate">{s.label}</div>
                  <div className="text-sm font-semibold text-gray-800 mt-0.5">{s.percentage}%</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Core Info */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Core Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Industry:</span> <span className="font-medium">{sections.core_info?.industry || '-'}</span></div>
              <div><span className="text-gray-500">HQ:</span> <span className="font-medium">{sections.core_info?.headquarters || '-'}</span></div>
              <div><span className="text-gray-500">Founded:</span> <span className="font-medium">{sections.core_info?.year_founded || '-'}</span></div>
              <div><span className="text-gray-500">Website:</span> <span className="font-medium">{sections.core_info?.website || '-'}</span></div>
              <div className="col-span-2"><span className="text-gray-500">Model:</span> <span className="font-medium">{sections.core_info?.business_model_types?.join(', ') || '-'}</span></div>
            </div>
            {sections.core_info?.full_business_overview && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{sections.core_info.full_business_overview}</p>
              </div>
            )}
          </Card>

          {/* Team */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Founder & Team</h3>
            <div className="space-y-3 text-sm">
              <div><span className="text-gray-500">Founder:</span> <span className="font-medium">{sections.founder_team?.founder_name || '-'}</span></div>
              {sections.founder_team?.co_founders && <div><span className="text-gray-500">Co-Founders:</span> <span className="font-medium">{sections.founder_team.co_founders}</span></div>}
              {sections.founder_team?.founder_bios && <div className="pt-2"><p className="text-gray-600 whitespace-pre-wrap">{sections.founder_team.founder_bios}</p></div>}
              {sections.founder_team?.team_credibility && <div className="pt-2"><span className="text-gray-500">Why credible:</span><p className="text-gray-600 mt-1">{sections.founder_team.team_credibility}</p></div>}
            </div>
          </Card>

          {/* Problem & Solution */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Problem & Solution</h3>
            <div className="space-y-4 text-sm">
              {sections.problem_solution?.problem_statement && <div><span className="text-gray-500 font-medium">Problem:</span><p className="text-gray-700 mt-1">{sections.problem_solution.problem_statement}</p></div>}
              {sections.problem_solution?.solution_summary && <div><span className="text-gray-500 font-medium">Solution:</span><p className="text-gray-700 mt-1">{sections.problem_solution.solution_summary}</p></div>}
              {sections.problem_solution?.why_now && <div><span className="text-gray-500 font-medium">Why Now:</span><p className="text-gray-700 mt-1">{sections.problem_solution.why_now}</p></div>}
              {sections.problem_solution?.differentiation && <div><span className="text-gray-500 font-medium">Differentiation:</span><p className="text-gray-700 mt-1">{sections.problem_solution.differentiation}</p></div>}
            </div>
          </Card>

          {/* Market */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Market</h3>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div><span className="text-gray-500">Target:</span> <span className="font-medium">{sections.market?.target_customer || '-'}</span></div>
              <div><span className="text-gray-500">Geography:</span> <span className="font-medium">{sections.market?.geography || '-'}</span></div>
              <div><span className="text-gray-500">TAM:</span> <span className="font-medium">{sections.market?.tam_usd || '-'}</span></div>
              <div><span className="text-gray-500">SAM:</span> <span className="font-medium">{sections.market?.sam_usd || '-'}</span></div>
            </div>
            {sections.market?.competitors && <p className="text-sm"><span className="text-gray-500">Competitors:</span> {sections.market.competitors}</p>}
            {sections.market?.defensibility && <p className="text-sm mt-2"><span className="text-gray-500">Moat:</span> {sections.market.defensibility}</p>}
          </Card>

          {/* Capital Snapshot */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Capital Snapshot</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Round:</span> <span className="font-medium">{sections.capital_snapshot?.current_round || '-'}</span></div>
              <div><span className="text-gray-500">Raising:</span> <span className="font-medium">{sections.capital_snapshot?.raise_amount || '-'}</span></div>
              <div><span className="text-gray-500">Instrument:</span> <span className="font-medium uppercase">{sections.capital_snapshot?.instrument_type || '-'}</span></div>
              <div><span className="text-gray-500">Target Ownership:</span> <span className="font-medium">{sections.capital_snapshot?.target_ownership || '-'}</span></div>
            </div>
            {sections.capital_snapshot?.use_of_funds && (
              <p className="text-sm mt-4"><span className="text-gray-500">Use of funds:</span> {sections.capital_snapshot.use_of_funds}</p>
            )}
          </Card>

          {/* Investment Case */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Investment Case</h3>
            <div className="space-y-3 text-sm">
              {sections.investment_case?.why_now && <div><span className="text-gray-500 font-medium">Why Now:</span><p className="text-gray-700 mt-1">{sections.investment_case.why_now}</p></div>}
              {sections.investment_case?.growth_drivers && <div><span className="text-gray-500 font-medium">Growth Drivers:</span><p className="text-gray-700 mt-1">{sections.investment_case.growth_drivers}</p></div>}
              {sections.investment_case?.key_risks && <div><span className="text-gray-500 font-medium">Key Risks:</span><p className="text-gray-700 mt-1">{sections.investment_case.key_risks}</p></div>}
              {sections.investment_case?.why_hero_should_care && <div><span className="text-gray-500 font-medium">Why Hero:</span><p className="text-gray-700 mt-1">{sections.investment_case.why_hero_should_care}</p></div>}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleGeneratePDF} disabled={generatingPdf}>
                <Download size={14} className="mr-2" />
                {generatingPdf ? 'Generating...' : 'Download PDF'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  const text = generateEmailTeaser()
                  navigator.clipboard.writeText(text)
                  alert('Email teaser copied to clipboard!')
                }}
              >
                <Mail size={14} className="mr-2" />
                Copy Email Teaser
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  const text = generateWhatsAppIntro()
                  navigator.clipboard.writeText(text)
                  alert('WhatsApp intro copied to clipboard!')
                }}
              >
                <MessageSquare size={14} className="mr-2" />
                Copy WhatsApp Intro
              </Button>
              {isAdmin && (
                <Link href={`/deals/${deal.id}/public`} className="block">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Globe size={14} className="mr-2" />
                    View Public Page
                  </Button>
                </Link>
              )}
            </div>
          </Card>

          {/* Deal Info */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Deal Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Source</span>
                <span className="font-medium capitalize">{deal.source_type.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="font-medium">{formatDate(deal.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Updated</span>
                <span className="font-medium">{formatDate(deal.updated_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Readiness</span>
                <Badge variant={
                  completion.readiness === 'Investor Ready' ? 'success' :
                  completion.readiness === 'In Progress' ? 'warning' : 'default'
                }>
                  {completion.readiness}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Admin: Status Control */}
          {isAdmin && (
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Pipeline Status</h3>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as DealStatus)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3"
              >
                {Object.entries(DEAL_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <Button
                size="sm"
                className="w-full"
                onClick={handleStatusChange}
                disabled={newStatus === deal.status}
              >
                Update Status
              </Button>
            </Card>
          )}

          {/* Status History */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">
              <Clock size={14} className="inline mr-1" />
              Status History
            </h3>
            {statusHistory.length > 0 ? (
              <div className="space-y-3">
                {statusHistory.map(h => (
                  <div key={h.id} className="text-sm border-l-2 border-hero-purple/20 pl-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={h.old_status as DealStatus} />
                      <span className="text-gray-400">→</span>
                      <StatusBadge status={h.new_status as DealStatus} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(h.created_at)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No status changes yet</p>
            )}
          </Card>

          {/* Admin: Internal Notes */}
          {isAdmin && (
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">
                <FileText size={14} className="inline mr-1" />
                Internal Notes
              </h3>
              <div className="space-y-3 mb-4">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
                  rows={3}
                />
                <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>
                  Add Note
                </Button>
              </div>
              {notes.map(note => (
                <div key={note.id} className="text-sm p-3 bg-yellow-50 rounded-lg mb-2">
                  <p className="text-gray-700">{note.note_body}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(note.created_at)}</p>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
