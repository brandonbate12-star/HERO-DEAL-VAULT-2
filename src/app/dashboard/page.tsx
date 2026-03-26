'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Deal } from '@/types'
import StatsCard from '@/components/dashboard/StatsCard'
import DealCard from '@/components/dashboard/DealCard'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { FileText, PlusCircle, TrendingUp, Clock, CheckCircle, Users } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
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
      // Admin sees all deals by default (RLS handles this)

      const { data } = await query
      setDeals((data as Deal[]) || [])
      setLoading(false)
    }

    fetchDeals()
  }, [user, supabase])

  if (!user) return null

  const totalDeals = deals.length
  const completedDeals = deals.filter(d => d.completion_percentage >= 80).length
  const avgCompletion = totalDeals > 0
    ? Math.round(deals.reduce((sum, d) => sum + d.completion_percentage, 0) / totalDeals)
    : 0
  const recentDeals = deals.slice(0, 6)

  const isFounder = user.role === 'founder'
  const isScout = user.role === 'scout'
  const isAdmin = user.role === 'admin'

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Admin Dashboard' : `Welcome back, ${user.name || 'there'}`}
          </h1>
          <p className="text-gray-500 mt-1">
            {isAdmin && 'Overview of all deals in the pipeline'}
            {isFounder && 'Track your deal progress and raise journey'}
            {isScout && 'Manage your sourced deals and referrals'}
          </p>
        </div>
        <Link href="/deals/new">
          <Button>
            <PlusCircle size={16} className="mr-2" />
            {isScout ? 'Source Deal' : 'New Deal'}
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title={isAdmin ? 'Total Deals' : 'My Deals'}
          value={totalDeals}
          icon={FileText}
        />
        <StatsCard
          title="Investor Ready"
          value={completedDeals}
          icon={CheckCircle}
        />
        <StatsCard
          title="Avg. Completion"
          value={`${avgCompletion}%`}
          icon={TrendingUp}
        />
        <StatsCard
          title={isAdmin ? 'In Pipeline' : 'In Progress'}
          value={deals.filter(d => !['deal_lost', 'new'].includes(d.status)).length}
          icon={isAdmin ? Users : Clock}
        />
      </div>

      {/* Recent Deals */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {isAdmin ? 'Recent Deals' : 'Your Deals'}
        </h2>
        {totalDeals > 6 && (
          <Link href="/deals" className="text-sm text-hero-purple hover:text-hero-purple-dark">
            View all
          </Link>
        )}
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
      ) : recentDeals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentDeals.map(deal => (
            <DealCard key={deal.id} deal={deal} founderView={isFounder} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No deals yet</h3>
          <p className="text-gray-500 mb-6">
            {isFounder && 'Create your first deal to get started on your raise journey.'}
            {isScout && 'Source your first deal or invite a founder.'}
            {isAdmin && 'No deals have been created yet.'}
          </p>
          <Link href="/deals/new">
            <Button>
              <PlusCircle size={16} className="mr-2" />
              Create Deal
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
