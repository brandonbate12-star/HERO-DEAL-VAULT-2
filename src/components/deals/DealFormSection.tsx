'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DealFormSectionProps {
  title: string
  description?: string
  completionPercentage?: number
  children: React.ReactNode
  defaultOpen?: boolean
}

export default function DealFormSection({
  title,
  description,
  completionPercentage,
  children,
  defaultOpen = false,
}: DealFormSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const isComplete = completionPercentage !== undefined && completionPercentage === 100

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isComplete ? (
            <CheckCircle size={20} className="text-green-500" />
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
          )}
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {completionPercentage !== undefined && (
            <span className={cn(
              'text-xs font-medium px-2 py-1 rounded-full',
              isComplete ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            )}>
              {completionPercentage}%
            </span>
          )}
          {isOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </div>
      </button>
      {isOpen && (
        <div className="p-5 pt-0 border-t border-gray-100">
          <div className="pt-5 space-y-4">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}
