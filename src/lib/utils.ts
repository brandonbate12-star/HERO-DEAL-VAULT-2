import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { DealSections, ReadinessLabel } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface SectionCompletion {
  name: string
  label: string
  percentage: number
  filledFields: number
  totalFields: number
}

export function calculateDealCompletion(sections: DealSections): {
  overall: number
  readiness: ReadinessLabel
  sections: SectionCompletion[]
} {
  const sectionConfigs: { key: keyof DealSections; label: string; requiredFields: string[] }[] = [
    {
      key: 'core_info',
      label: 'Core Information',
      requiredFields: ['startup_name', 'one_line_description', 'full_business_overview', 'headquarters', 'industry'],
    },
    {
      key: 'founder_team',
      label: 'Founder & Team',
      requiredFields: ['founder_name', 'founder_bios', 'team_credibility'],
    },
    {
      key: 'problem_solution',
      label: 'Problem & Solution',
      requiredFields: ['problem_statement', 'solution_summary', 'why_now', 'differentiation'],
    },
    {
      key: 'market',
      label: 'Market',
      requiredFields: ['target_customer', 'geography', 'tam_usd', 'competitors'],
    },
    {
      key: 'product_traction',
      label: 'Product & Traction',
      requiredFields: ['product_stage', 'traction_metrics'],
    },
    {
      key: 'capital_snapshot',
      label: 'Capital Snapshot',
      requiredFields: ['current_round', 'raise_amount', 'instrument_type', 'use_of_funds'],
    },
    {
      key: 'investment_case',
      label: 'Investment Case',
      requiredFields: ['why_now', 'growth_drivers', 'key_risks', 'why_hero_should_care'],
    },
    {
      key: 'distribution_assets',
      label: 'Distribution Assets',
      requiredFields: [],
    },
  ]

  const sectionResults: SectionCompletion[] = sectionConfigs.map(config => {
    const sectionData = sections[config.key] as unknown as Record<string, unknown>
    const fields = config.requiredFields.length > 0 ? config.requiredFields : Object.keys(sectionData)
    const totalFields = fields.length
    if (totalFields === 0) return { name: config.key, label: config.label, percentage: 100, filledFields: 0, totalFields: 0 }

    const filledFields = fields.filter(field => {
      const val = sectionData[field]
      if (Array.isArray(val)) return val.length > 0
      return val !== '' && val !== null && val !== undefined
    }).length

    return {
      name: config.key,
      label: config.label,
      percentage: Math.round((filledFields / totalFields) * 100),
      filledFields,
      totalFields,
    }
  })

  const overall = Math.round(
    sectionResults.reduce((sum, s) => sum + s.percentage, 0) / sectionResults.length
  )

  let readiness: ReadinessLabel = 'Early'
  if (overall >= 80) readiness = 'Investor Ready'
  else if (overall >= 40) readiness = 'In Progress'

  return { overall, readiness, sections: sectionResults }
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function generateInviteToken(): string {
  return crypto.randomUUID()
}
