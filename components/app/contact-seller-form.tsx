'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Send } from 'lucide-react'
import { startConversation } from '@/app/actions/messages'

export function ContactSellerForm({
  propertyId,
  isOwner,
}: {
  propertyId: string
  isOwner: boolean
}) {
  const router = useRouter()
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  if (isOwner) {
    return (
      <p className="rounded-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        This is your own listing. Manage it from your dashboard.
      </p>
    )
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      const res = await startConversation(propertyId, body)
      if (res.error) {
        setError(res.error)
        return
      }
      router.push('/buyer/messages')
    })
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-900">{error}</p>
      )}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder="Hi, I'm interested in this property. Is it still available for a viewing?"
        className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <button
        type="submit"
        disabled={pending || !body.trim()}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {pending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
        Send message to seller
      </button>
    </form>
  )
}
