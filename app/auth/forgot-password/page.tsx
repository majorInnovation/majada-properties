'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Building2, CheckCircle2, Loader2, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const { error: resetError } = await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    })
    setLoading(false)
    if (resetError) {
      setError('We could not send a reset link right now. Please try again.')
      return
    }
    setSent(true)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Majada Properties home">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground"><Building2 size={18} /></span>
            <span className="font-serif text-xl font-semibold tracking-tight">majada</span>
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link href="/auth/login" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"><ArrowLeft size={16} /> Back to sign in</Link>
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-semibold tracking-tight">Reset your password</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Enter your email and we&apos;ll send you a secure link to choose a new password.</p>
          </div>
          {sent ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-5 text-green-900">
              <div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-green-600" size={20} /><div><h2 className="font-semibold">Check your inbox</h2><p className="mt-1 text-sm leading-6">If an account exists for this email, a reset link is on its way.</p></div></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</div>}
              <div className="space-y-2"><label htmlFor="email" className="block text-sm font-semibold">Email address</label><input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
              <button type="submit" disabled={loading || !email} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">{loading ? <><Loader2 size={16} className="animate-spin" /> Sending link...</> : <><Mail size={16} /> Send reset link</>}</button>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
