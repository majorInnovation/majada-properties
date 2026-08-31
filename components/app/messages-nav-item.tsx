'use client'

import Link from 'next/link'
import { MessageSquareText } from 'lucide-react'
import { useUnreadBadge } from '@/lib/use-unread-badge'

/** Desktop "Messages" nav pill with a live unread badge. */
export function MessagesNavItem({
  href,
  active,
  initialUnread,
  currentUserId,
}: {
  href: string
  active: boolean
  initialUnread: number
  currentUserId: string
}) {
  const unread = useUnreadBadge(currentUserId, initialUnread, href)

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
        active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <MessageSquareText size={15} />
      Messages
      {unread > 0 && (
        <span className="grid min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
          {unread > 99 ? '99+' : unread}
        </span>
      )}
    </Link>
  )
}
