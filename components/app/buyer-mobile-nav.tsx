'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bookmark, Home, MessageSquareText, Settings } from 'lucide-react'
import { useUnreadBadge } from '@/lib/use-unread-badge'

const ITEMS = [
  { href: '/buyer', label: 'Overview', icon: Home },
  { href: '/buyer/saved', label: 'Saved', icon: Bookmark },
  { href: '/buyer/messages', label: 'Messages', icon: MessageSquareText, badge: true },
  { href: '/buyer/settings', label: 'Settings', icon: Settings },
]

/** Mobile-only pill nav shown as a sticky second row in the buyer header. */
export function BuyerMobileNav({
  currentUserId,
  initialUnread,
}: {
  currentUserId: string
  initialUnread: number
}) {
  const pathname = usePathname()
  const unread = useUnreadBadge(currentUserId, initialUnread, '/buyer/messages')

  const isActive = (href: string) =>
    href === pathname ||
    (href === '/buyer' && pathname.startsWith('/buyer/properties')) ||
    (href !== '/buyer' && pathname.startsWith(`${href}/`))

  return (
    <div className="flex items-stretch gap-1 overflow-x-auto px-3 py-2 md:hidden [&::-webkit-scrollbar]:hidden">
      {ITEMS.map(({ href, label, icon: Icon, badge }) => {
        const on = isActive(href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={on ? 'page' : undefined}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
              on ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            <Icon size={14} />
            {label}
            {badge && unread > 0 && (
              <span
                className={`grid min-w-4 place-items-center rounded-full px-1 text-[9px] font-bold leading-4 ${
                  on ? 'bg-primary-foreground text-primary' : 'bg-primary text-primary-foreground'
                }`}
              >
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>
        )
      })}
    </div>
  )
}
