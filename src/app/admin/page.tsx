'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Deal, DealStatus, DEAL_STATUS_LABELS, DEAL_STATUS_COLORS, DealSections } from '@/types'
import StatusBadge from '@/components/ui/StatusBadge'
import ProgressBar from '@/components/ui/ProgressBar'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Search, Filter, BarChart3, ArrowUpDown } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminPipelinePage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<DealStatus | ''>('')
  const [sortField, setSortField] = useState<'updated_at' | 'completion_percentage' | 'startup_name'>('updated_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    const fetchDeals = async () => {
      let query = supabase.from('deals').select('*').order(sortField, { ascending: sortDir === 'asc' })

      if (statusFilter) {
        query = query.eq('status', statusFilter)
      }

      const { data } = await query
      setDeals((data as Deal[]) || [])
      setLoading(false)
    }

    fetchDeals()
  }, [user, supabase, statusFilter, sortField, sortDir, router])

  const filteredDeals = deals.filter(d => {
    if (!search) return true
    const name = (d.sections as DealSections)?.core_info?.startup_name || d.startup_name || ''
    return name.toLowerCase().includes(search.toLowerCase())
  })

  // Pipeline stats
  const statusCounts = deals.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (user?.role !== 'admin') return null

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
          <p className="text-gray-500 mt-1">Manage all deals across the platform</p>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-gray-400" />
          <span className="text-sm text-gray-500">{deals.length} total deals</span>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {Object.entries(DEAL_STATUS_LABELS).map(([status, label]) => (
          <button
            key={status}
            onClick={() => setStatusFilter(statusFilter === status ? '' : status as DealStatus)}
            className={`p-3 rounded-lg border text-center transition-all ${
              statusFilter === status
                ? 'border-hero-purple bg-hero-purple/5'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <p className="text-2xl font-bold text-gray-900">{statusCounts[status] || 0}</p>
            <p className="text-xs text-gray-500 mt-1 truncate">{label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search deals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-hero-purple/20 focus:border-hero-purple"
          />
        </div>
        <select
          value={`${sortField}-${sortDir}`}
          onChange={(e) => {
            const [field, dir] = e.target.value.split('-')
            setSortField(field as typeof sortField)
            setSortDir(dir as 'asc' | 'desc')
          }}
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="updated_at-desc">Recently Updated</option>
          <option value="updated_at-asc">Oldest First</option>
          <option value="completion_percentage-desc">Highest Completion</option>
          <option value="completion_percentage-asc">Lowest Completion</option>
        </select>
      </div>

      {/* Deals Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Startup</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Source</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Completion</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Round</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Updated</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td colSpan={6} className="px-4 py-4">
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-full" />
                  </td>
                </tr>
              ))
            ) : filteredDeals.length > 0 ? (
              filteredDeals.map(deal => {
                const sections = deal.sections as DealSections
                return (
                  <tr
                    key={deal.id}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/deals/${deal.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {sections?.core_info?.startup_name || deal.startup_name || 'Untitled'}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-[200px]">
                        {sections?.core_info?.one_line_description}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={deal.status} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600 capitalize">
                        {deal.source_type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-24">
                        <ProgressBar value={deal.completion_percentage} size="sm" showLabel={false} />
                        <span className="text-xs text-gray-500">{deal.completion_percentage}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {sections?.capital_snapshot?.current_round || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(deal.updated_at)}
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-500">
                  No deals found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
