'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Send } from 'lucide-react'
import type { ConversationWithMeta, Message } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { markConversationRead, sendMessage } from '@/app/actions/messages'

type Viewer = 'buyer' | 'seller'

export function MessagesClient({
  conversations,
  currentUserId,
  viewer,
}: {
  conversations: ConversationWithMeta[]
  currentUserId: string
  viewer: Viewer
}) {
  const router = useRouter()
  const [list, setList] = useState(conversations)
  const [activeId, setActiveId] = useState<string | null>(conversations[0]?.id ?? null)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [pane, setPane] = useState<'list' | 'thread'>('list')
  const [pending, startTransition] = useTransition()

  const activeRef = useRef(activeId)
  const markKeyRef = useRef('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    activeRef.current = activeId
  }, [activeId])

  // Server data is the source of truth; refreshes flow in through this prop.
  useEffect(() => {
    setList(conversations)
  }, [conversations])

  useEffect(() => {
    if (!activeId && conversations.length) setActiveId(conversations[0].id)
  }, [conversations, activeId])

  // Live updates: append any new message as soon as it hits the database.
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
        `messages-stream-${Math.random().toString(36).slice(2)}`,
      )
      ch.on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const m = payload.new as Message
          setList((prev) => {
            const i = prev.findIndex((c) => c.id === m.conversation_id)
            if (i === -1) {
              // A brand-new conversation — pull its metadata from the server.
              router.refresh()
              return prev
            }
            if (prev[i].messages.some((x) => x.id === m.id)) return prev
            const merged = {
              ...prev[i],
              messages: [
                ...prev[i].messages.filter((x) => !x.id.startsWith('temp-')),
                m,
              ],
            }
            return [merged, ...prev.filter((_, idx) => idx !== i)]
          })
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
  }, [currentUserId, router])

  const active = useMemo(
    () => list.find((c) => c.id === activeId) ?? null,
    [list, activeId],
  )

  // Mark the open conversation as read whenever its latest message changes.
  useEffect(() => {
    if (!active) return
    const last = active.messages[active.messages.length - 1]
    if (!last) return
    const key = `${active.id}:${last.id}`
    if (markKeyRef.current === key) return
    markKeyRef.current = key

    const hasUnread = active.messages.some(
      (m) => m.sender_id !== currentUserId && !m.read_at,
    )
    if (hasUnread) {
      markConversationRead(active.id).then(() => router.refresh())
    }
  }, [active, currentUserId, router])

  // Keep the thread scrolled to the newest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [active])

  function counterpartName(c: ConversationWithMeta) {
    return viewer === 'buyer'
      ? c.seller?.full_name ?? 'Seller'
      : c.buyer?.full_name ?? 'Buyer'
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!active || !draft.trim()) return
    setError('')
    const body = draft.trim()
    setDraft('')

    const temp: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: active.id,
      sender_id: currentUserId,
      body,
      created_at: new Date().toISOString(),
      read_at: null,
    }
    setList((prev) =>
      prev.map((c) =>
        c.id === active.id ? { ...c, messages: [...c.messages, temp] } : c,
      ),
    )

    startTransition(async () => {
      const res = await sendMessage(active.id, body)
      if (res.error) {
        setError(res.error)
        setDraft(body)
        setList((prev) =>
          prev.map((c) =>
            c.id === active.id
              ? { ...c, messages: c.messages.filter((x) => x.id !== temp.id) }
              : c,
          ),
        )
        return
      }
      router.refresh()
    })
  }

  if (list.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-border bg-muted/40 p-12 text-center">
        <p className="font-serif text-2xl">No conversations yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {viewer === 'buyer'
            ? 'Message a seller from any property page to start a conversation.'
            : 'When a buyer contacts you about a listing it will appear here.'}
        </p>
      </div>
    )
  }

  return (
    <section className="grid gap-4 rounded-2xl border border-border bg-card p-3 shadow-sm sm:gap-6 sm:rounded-[28px] sm:p-6 lg:grid-cols-[0.95fr_1.4fr]">
      <aside className={`space-y-2 sm:space-y-3 ${pane === 'thread' ? 'hidden lg:block' : 'block'}`}>
        {list.map((c) => {
          const last = c.messages[c.messages.length - 1]
          const unread = c.messages.filter(
            (m) => m.sender_id !== currentUserId && !m.read_at,
          ).length
          return (
            <button
              key={c.id}
              onClick={() => {
                setActiveId(c.id)
                setPane('thread')
              }}
              className={`flex w-full flex-col gap-1 rounded-2xl border p-3 text-left transition sm:p-4 ${
                c.id === activeId
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-background hover:bg-muted/60'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-foreground">{counterpartName(c)}</p>
                <div className="flex items-center gap-2">
                  {unread > 0 && (
                    <span className="grid min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                      {unread}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {last ? new Date(last.created_at).toLocaleDateString() : ''}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{c.property?.title ?? 'Property'}</p>
              {last && <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{last.body}</p>}
            </button>
          )
        })}
      </aside>

      <div
        className={`min-h-[60vh] flex-col rounded-2xl border border-border bg-background p-3 sm:p-4 lg:flex lg:min-h-[420px] ${
          pane === 'list' ? 'hidden' : 'flex'
        }`}
      >
        {active ? (
          <>
            <div className="mb-4 flex items-start gap-3 border-b border-border pb-4">
              <button
                type="button"
                onClick={() => setPane('list')}
                aria-label="Back to conversations"
                className="mt-0.5 rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
              >
                <ArrowLeft size={16} />
              </button>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold">{counterpartName(active)}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {active.property?.title ?? 'Property'}
                </p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto text-sm">
              {active.messages.length === 0 && (
                <p className="text-muted-foreground">No messages yet — say hello.</p>
              )}
              {active.messages.map((m) => {
                const mine = m.sender_id === currentUserId
                return (
                  <div
                    key={m.id}
                    className={`max-w-[80%] rounded-2xl p-3 ${
                      mine
                        ? 'ml-auto bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {m.body}
                  </div>
                )
              })}
            </div>

            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

            <form onSubmit={submit} className="mt-4 flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-full border border-border bg-background px-4 py-3 text-sm outline-none"
              />
              <button
                type="submit"
                disabled={pending || !draft.trim()}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {pending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                Send
              </button>
            </form>
          </>
        ) : (
          <p className="m-auto text-sm text-muted-foreground">Select a conversation.</p>
        )}
      </div>
    </section>
  )
}
