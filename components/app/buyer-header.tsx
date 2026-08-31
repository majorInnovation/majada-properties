import Link from 'next/link'
import { Bookmark, Home, Settings } from 'lucide-react'
import { getSessionProfile } from '@/lib/auth'
import { getUnreadCount } from '@/lib/queries'
import { MessagesNavItem } from './messages-nav-item'
import { BuyerMobileNav } from './buyer-mobile-nav'

const NAV = [
  { label: 'Overview', href: '/buyer', icon: Home },
  { label: 'Saved homes', href: '/buyer/saved', icon: Bookmark },
]

export async function BuyerHeader({ active }: { active: string }) {
  const { userId } = await getSessionProfile()
  const unread = userId ? await getUnreadCount(userId) : 0

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4 lg:px-8">
        <Link href="/buyer" className="flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm sm:size-10">
            <Home size={18} />
          </div>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-primary sm:text-[10px] sm:tracking-[0.3em]">
              Buyer portal
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
            href="/buyer/messages"
            active={active === '/buyer/messages'}
            initialUnread={unread}
            currentUserId={userId ?? ''}
          />
          <Link
            href="/buyer/settings"
            className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
              active === '/buyer/settings'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Settings size={15} />
            Settings
          </Link>
        </nav>
      </div>

      {/* Phones: the portal nav lives up here instead of a bottom bar. */}
      <div className="border-t border-border bg-card/95 md:hidden">
        <BuyerMobileNav currentUserId={userId ?? ''} initialUnread={unread} />
      </div>
    </header>
  )
}
