'use client'

import { useState, useTransition } from 'react'
import { Check, KeyRound, Loader2, LogOut } from 'lucide-react'
import { sendPasswordReset } from '@/app/actions/profile'
import { signOut } from '@/app/actions/auth'

export const inputClass =
  'w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20'

export function initials(name: string | null, email: string | null) {
  const base = (name || email || 'U').trim()
  const parts = base.split(/\s+/)
  return (parts[0]?.[0] ?? 'U').concat(parts[1]?.[0] ?? '').toUpperCase()
}

export function Card({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-primary">
          {icon}
        </span>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

export function Alert({
  tone,
  children,
}: {
  tone: 'ok' | 'error'
  children: React.ReactNode
}) {
  return (
    <div
      className={`mb-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
        tone === 'ok'
          ? 'border-green-200 bg-green-50 text-green-900'
          : 'border-red-200 bg-red-50 text-red-900'
      }`}
    >
      {children}
    </div>
  )
}

export function Toggle({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean
  disabled?: boolean
  label: string
  onChange: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${
        checked ? 'bg-primary' : 'bg-muted'
      }`}
    >
      <span
        className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

export function SecurityCard() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  function reset() {
    setError('')
    startTransition(async () => {
      const res = await sendPasswordReset()
      if (res.error) setError(res.error)
      else setSent(true)
    })
  }

  return (
    <Card
      icon={<KeyRound size={18} />}
      title="Security"
      description="Manage how you sign in to Majada."
    >
      {error && <Alert tone="error">{error}</Alert>}
      {sent && !error ? (
        <Alert tone="ok">
          <Check size={15} /> Check your inbox for a password reset link.
        </Alert>
      ) : (
        <button
          type="button"
          onClick={reset}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-muted disabled:opacity-60"
        >
          {pending ? <Loader2 size={15} className="animate-spin" /> : <KeyRound size={15} />}
          Send password reset link
        </button>
      )}
    </Card>
  )
}

export function SessionCard() {
  return (
    <Card
      icon={<LogOut size={18} />}
      title="Session"
      description="Sign out of Majada on this device."
    >
      <form action={signOut}>
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/20 sm:w-auto"
        >
          <LogOut size={15} />
          Log out
        </button>
      </form>
    </Card>
  )
}
