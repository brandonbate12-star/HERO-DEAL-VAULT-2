import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  className?: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function ProgressBar({ value, className, showLabel = true, size = 'md' }: ProgressBarProps) {
  const color = value >= 80 ? 'bg-green-500' : value >= 40 ? 'bg-hero-purple' : 'bg-yellow-500'

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-500">Completion</span>
          <span className="font-medium text-gray-700">{value}%</span>
        </div>
      )}
      <div
        className={cn(
          'w-full bg-gray-100 rounded-full overflow-hidden',
          { 'h-1.5': size === 'sm', 'h-2.5': size === 'md', 'h-4': size === 'lg' }
        )}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  )
}
