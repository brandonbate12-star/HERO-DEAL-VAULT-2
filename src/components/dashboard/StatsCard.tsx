import Card from '@/components/ui/Card'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: { value: number; positive: boolean }
}

export default function StatsCard({ title, value, icon: Icon, description }: StatsCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {description && (
            <p className="text-xs text-gray-400 mt-1">{description}</p>
          )}
        </div>
        <div className="w-10 h-10 bg-hero-purple/10 rounded-lg flex items-center justify-center">
          <Icon size={20} className="text-hero-purple" />
        </div>
      </div>
    </Card>
  )
}
