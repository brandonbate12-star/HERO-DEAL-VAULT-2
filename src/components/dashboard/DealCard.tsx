'use client'

import { Deal } from '@/types'
import Card from '@/components/ui/Card'
import StatusBadge from '@/components/ui/StatusBadge'
import ProgressBar from '@/components/ui/ProgressBar'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { ArrowRight, Building2 } from 'lucide-react'

interface DealCardProps {
  deal: Deal
  founderView?: boolean
}

export default function DealCard({ deal, founderView = false }: DealCardProps) {
  const startupName = deal.sections?.core_info?.startup_name || deal.startup_name || 'Untitled Deal'
  const description = deal.sections?.core_info?.one_line_description || ''
  const industry = deal.sections?.core_info?.industry || ''

  return (
    <Link href={`/deals/${deal.id}`}>
      <Card className="hover:shadow-md hover:border-hero-purple/20 transition-all cursor-pointer group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-hero-purple/10 rounded-lg flex items-center justify-center">
              <Building2 size={18} className="text-hero-purple" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{startupName}</h3>
              {industry && <p className="text-xs text-gray-500">{industry}</p>}
            </div>
          </div>
          <StatusBadge status={deal.status} founderView={founderView} />
        </div>

        {description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{description}</p>
        )}

        <ProgressBar value={deal.completion_percentage} size="sm" />

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            Updated {formatDate(deal.updated_at)}
          </span>
          <span className="text-xs text-hero-purple font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            View Deal <ArrowRight size={12} />
          </span>
        </div>
      </Card>
    </Link>
  )
}
