'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { BarChart3, Building2, MessageSquareText, Settings } from 'lucide-react'

export const DASHBOARD_VIEWS = ['overview', 'listings', 'inquiries', 'settings'] as const
export type DashboardView = (typeof DASHBOARD_VIEWS)[number]

const ICONS = {
  overview: BarChart3,
  listings: Building2,
  inquiries: MessageSquareText,
  settings: Settings,
} as const

export function useDashboardView(): DashboardView {
  const params = useSearchParams()
  const raw = params.get('tab')
  return (DASHBOARD_VIEWS as readonly string[]).includes(raw ?? '')
    ? (raw as DashboardView)
    : 'overview'
}

/**
 * URL-driven (`?tab=`) view switcher for the seller dashboard. Rendered both in
 * the sticky header on mobile and inline on larger screens.
 */
export function DashboardTabs({
  variant = 'inline',
}: {
  variant?: 'inline' | 'header'
}) {
  const router = useRouter()
  const active = useDashboardView()

  const select = (v: DashboardView) => {
    const qs = v === 'overview' ? '/dashboard' : `/dashboard?tab=${v}`
    router.replace(qs, { scroll: false })
  }

  if (variant === 'header') {
    return (
      <div className="flex items-stretch gap-1 overflow-x-auto px-3 py-2 [&::-webkit-scrollbar]:hidden">
        {DASHBOARD_VIEWS.map((v) => {
          const Icon = ICONS[v]
          const on = active === v
          return (
            <button
              key={v}
              onClick={() => select(v)}
              aria-current={on ? 'page' : undefined}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium capitalize transition-colors ${
                on ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              <Icon size={14} />
              {v}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <nav className="flex gap-1 overflow-x-auto rounded-full border border-border bg-muted/60 p-1.5 sm:gap-2 [&::-webkit-scrollbar]:hidden">
      {DASHBOARD_VIEWS.map((v) => {
        const on = active === v
        return (
          <button
            key={v}
            onClick={() => select(v)}
            aria-current={on ? 'page' : undefined}
            className={`shrink-0 rounded-full px-3 py-2 text-sm font-medium capitalize transition-colors sm:px-4 ${
              on ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {v}
          </button>
        )
      })}
    </nav>
  )
}
