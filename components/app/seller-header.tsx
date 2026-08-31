import { Suspense } from 'react'
import Link from 'next/link'
import { Building2, LayoutDashboard, Plus, Settings } from 'lucide-react'
import { getSessionProfile } from '@/lib/auth'
import { getUnreadCount } from '@/lib/queries'
import { MessagesNavItem } from './messages-nav-item'
import { MobileTabBar } from './mobile-tab-bar'
import { DashboardTabs } from './dashboard-tabs'

const NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Add property', href: '/dashboard/add-property', icon: Plus },
]

export async function SellerHeader({ active }: { active: string }) {
  const { userId } = await getSessionProfile()
  const unread = userId ? await getUnreadCount(userId) : 0
  const onDashboard = active === '/dashboard'

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm sm:size-10">
              <Building2 size={18} />
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-primary sm:text-[10px] sm:tracking-[0.3em]">
                Seller portal
              </p>
              <p className="font-serif text-lg leading-tight tracking-tight sm:text-xl">Majada</p>
            </div>
          </Link>

          <nav className="flex items-center gap-2 rounded-full border border-border bg-muted/60 p-1.5 max-md:hidden">
            {NAV.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                  active === href
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
            <MessagesNavItem
              href="/dashboard/messages"
              active={active === '/dashboard/messages'}
              initialUnread={unread}
              currentUserId={userId ?? ''}
            />
            <Link
              href="/dashboard?tab=settings"
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Settings size={15} />
              Settings
            </Link>
          </nav>

          {!onDashboard && (
            <Link
              href="/dashboard?tab=settings"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted md:hidden"
            >
              <Settings size={15} />
              Settings
            </Link>
          )}
        </div>

        {/* Mobile: the four dashboard views live up here, right under the logo. */}
        {onDashboard && (
          <div className="border-t border-border bg-card/95 md:hidden">
            <Suspense fallback={<div className="h-11" />}>
              <DashboardTabs variant="header" />
            </Suspense>
          </div>
        )}
      </header>

      <MobileTabBar role="seller" currentUserId={userId ?? ''} initialUnread={unread} />
    </>
  )
}
