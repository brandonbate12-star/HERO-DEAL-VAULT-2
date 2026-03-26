import { cn } from '@/lib/utils'
import { DealStatus, DEAL_STATUS_LABELS, DEAL_STATUS_COLORS, FOUNDER_STATUS_LABELS } from '@/types'

interface StatusBadgeProps {
  status: DealStatus
  founderView?: boolean
  className?: string
}

export default function StatusBadge({ status, founderView = false, className }: StatusBadgeProps) {
  const label = founderView ? FOUNDER_STATUS_LABELS[status] : DEAL_STATUS_LABELS[status]
  const colorClass = DEAL_STATUS_COLORS[status]

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
        colorClass,
        className
      )}
    >
      {label}
    </span>
  )
}
