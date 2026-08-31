import Link from 'next/link'
import { Bookmark, Home, Settings } from 'lucide-react'
import { getSessionProfile } from '@/lib/auth'
import { getUnreadCount } from '@/lib/queries'
import { SignOutButton } from './sign-out-button'
import { MessagesNavItem } from './messages-nav-item'
import { MobileTabBar } from './mobile-tab-bar'

const NAV = [
  { label: 'Overview', href: '/buyer', icon: Home },
  { label: 'Saved homes', href: '/buyer/saved', icon: Bookmark },
  { label: 'Settings', href: '/buyer/settings', icon: Settings },
]

export async function BuyerHeader({ active }: { active: string }) {
  const { userId } = await getSessionProfile()
  const unread = userId ? await getUnreadCount(userId) : 0

  return (
    <>
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

          <nav className="hidden items-center gap-2 rounded-full border border-border bg-muted/60 p-1.5 md:flex">
            {NAV.slice(0, 2).map(({ label, href, icon: Icon }) => (
              <NavLink key={href} href={href} label={label} Icon={Icon} active={active === href} />
            ))}
            <MessagesNavItem
              href="/buyer/messages"
              active={active === '/buyer/messages'}
              initialUnread={unread}
              currentUserId={userId ?? ''}
            />
            {NAV.slice(2).map(({ label, href, icon: Icon }) => (
              <NavLink key={href} href={href} label={label} Icon={Icon} active={active === href} />
            ))}
          </nav>

          <SignOutButton />
        </div>
      </header>

      <MobileTabBar role="buyer" currentUserId={userId ?? ''} initialUnread={unread} />
    </>
  )
}

function NavLink({
  href,
  label,
  Icon,
  active,
}: {
  href: string
  label: string
  Icon: React.ComponentType<{ size?: number }>
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
        active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <Icon size={15} />
      {label}
    </Link>
  )
}
