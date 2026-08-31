'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bookmark,
  LayoutDashboard,
  type LucideIcon,
  MessageSquareText,
  PlusCircle,
  Search,
  UserRound,
} from 'lucide-react'
import { useUnreadBadge } from '@/lib/use-unread-badge'

type Item = { href: string; label: string; icon: LucideIcon; badge?: boolean }

const BUYER_ITEMS: Item[] = [
  { href: '/buyer', label: 'Browse', icon: Search },
  { href: '/buyer/saved', label: 'Saved', icon: Bookmark },
  { href: '/buyer/messages', label: 'Messages', icon: MessageSquareText, badge: true },
  { href: '/buyer/settings', label: 'Account', icon: UserRound },
]

const SELLER_ITEMS: Item[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/add-property', label: 'Add', icon: PlusCircle },
  { href: '/dashboard/messages', label: 'Messages', icon: MessageSquareText, badge: true },
]

export function MobileTabBar({
  role,
  currentUserId,
  initialUnread,
}: {
  role: 'buyer' | 'seller'
  currentUserId: string
  initialUnread: number
}) {
  const pathname = usePathname()
  const items = role === 'seller' ? SELLER_ITEMS : BUYER_ITEMS
  const messagesHref = role === 'seller' ? '/dashboard/messages' : '/buyer/messages'
  const unread = useUnreadBadge(currentUserId, initialUnread, messagesHref)

  const isActive = (href: string) => {
    if (href === pathname) return true
    if (href === '/buyer') return pathname.startsWith('/buyer/properties')
    if (href === '/buyer/messages' || href === '/dashboard/messages')
      return pathname.startsWith(href)
    return false
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-2">
        {items.map(({ href, label, icon: Icon, badge }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1 text-[11px] font-medium transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="relative grid size-6 place-items-center">
                <Icon size={20} />
                {badge && unread > 0 && (
                  <span className="absolute -right-2 -top-1.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold leading-4 text-primary-foreground">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </span>
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
