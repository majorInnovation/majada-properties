'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * Live unread-message count for the nav badges. The authoritative number comes
 * from the server via `initialUnread`; a Realtime subscription on `messages`
 * bumps it and asks the server to recompute whenever someone else sends one.
 */
export function useUnreadBadge(
  currentUserId: string,
  initialUnread: number,
  messagesHref: string,
): number {
  const router = useRouter()
  const pathname = usePathname()
  const [unread, setUnread] = useState(initialUnread)
  const pathRef = useRef(pathname)

  useEffect(() => setUnread(initialUnread), [initialUnread])
  useEffect(() => {
    pathRef.current = pathname
  }, [pathname])

  useEffect(() => {
    if (!currentUserId) return
    const supabase = createClient()
    let channel: ReturnType<typeof supabase.channel> | null = null
    let cancelled = false

    ;(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (cancelled) return
      if (session?.access_token) supabase.realtime.setAuth(session.access_token)

      const ch = supabase.channel(
        `unread-${Math.random().toString(36).slice(2)}`,
      )
      ch.on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const row = payload.new as { sender_id: string }
          if (row.sender_id === currentUserId) return
          if (pathRef.current !== messagesHref) setUnread((n) => n + 1)
          router.refresh()
        },
      )
      ch.subscribe()

      if (cancelled) {
        supabase.removeChannel(ch)
        return
      }
      channel = ch
    })()

    return () => {
      cancelled = true
      if (channel) supabase.removeChannel(channel)
    }
  }, [currentUserId, messagesHref, router])

  return unread
}
