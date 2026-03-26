'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Deal, DealStatus, DEAL_STATUS_LABELS } from '@/types'
import DealCard from '@/components/dashboard/DealCard'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { PlusCircle, Search, Filter } from 'lucide-react'

export default function DealsPage() {
  const { user } = useAuth()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<DealStatus | ''>('')
  const supabase = createClient()

  useEffect(() => {
    const fetchDeals = async () => {
      if (!user) return

      let query = supabase.from('deals').select('*').order('updated_at', { ascending: false })

      if (user.role === 'founder') {
        query = query.or(`owner_id.eq.${user.id},founder_id.eq.${user.id}`)
      } else if (user.role === 'scout') {
        query = query.or(`owner_id.eq.${user.id},scout_id.eq.${user.id}`)
      }

      if (statusFilter) {
        query = query.eq('status', statusFilter)
      }

      const { data } = await query
      setDeals((data as Deal[]) || [])
      setLoading(false)
    }

    fetchDeals()
  }, [user, supabase, statusFilter])

  const filteredDeals = deals.filter(d => {
    if (!search) return true
    const name = d.sections?.core_info?.startup_name || d.startup_name || ''
    return name.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'admin' ? 'All Deals' : 'My Deals'}
          </h1>
          <p className="text-gray-500 mt-1">{filteredDeals.length} deals</p>
        </div>
        <Link href="/deals/new">
          <Button>
            <PlusCircle size={16} className="mr-2" />
            New Deal
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
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
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as DealStatus | '')}
            className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hero-purple/20 focus:border-hero-purple appearance-none"
          >
            <option value="">All Statuses</option>
            {Object.entries(DEAL_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="h-2 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filteredDeals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDeals.map(deal => (
            <DealCard
              key={deal.id}
              deal={deal}
              founderView={user?.role === 'founder'}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No deals found.</p>
        </div>
      )}
    </div>
  )
}
