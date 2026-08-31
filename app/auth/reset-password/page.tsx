'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, Building2, CheckCircle2, Loader2 } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    if (password !== confirm) return setError('Passwords do not match.')
    setLoading(true)
    const { error: updateError } = await createClient().auth.updateUser({ password })
    setLoading(false)
    if (updateError) return setError('This reset link is invalid or has expired. Please request a new one.')
    setSaved(true)
  }

  return <div className="flex min-h-screen flex-col">
    <header className="border-b border-border bg-background/95 backdrop-blur"><div className="mx-auto flex h-16 max-w-7xl items-center px-5 lg:px-8"><Link href="/" className="flex items-center gap-2.5" aria-label="Majada Properties home"><span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground"><Building2 size={18} /></span><span className="font-serif text-xl font-semibold tracking-tight">majada</span></Link></div></header>
    <main className="flex flex-1 items-center justify-center px-4 py-12"><div className="w-full max-w-md">
      <Link href="/auth/login" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"><ArrowLeft size={16} /> Back to sign in</Link>
      <h1 className="font-serif text-3xl font-semibold tracking-tight">Choose a new password</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">Use at least 8 characters to secure your Majada account.</p>
      {saved ? <div className="mt-8 rounded-lg border border-green-200 bg-green-50 p-5 text-green-900"><div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-green-600" size={20} /><div><h2 className="font-semibold">Password updated</h2><p className="mt-1 text-sm leading-6">Your password has been changed. You can now sign in.</p><Link href="/auth/login" className="mt-4 inline-flex font-semibold text-primary hover:underline">Continue to sign in</Link></div></div></div> : <form onSubmit={handleSubmit} className="mt-8 space-y-5">{error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</div>}<div className="space-y-2"><label htmlFor="password" className="block text-sm font-semibold">New password</label><input id="password" type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" /></div><div className="space-y-2"><label htmlFor="confirm" className="block text-sm font-semibold">Confirm new password</label><input id="confirm" type="password" required minLength={8} value={confirm} onChange={(event) => setConfirm(event.target.value)} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" /></div><button type="submit" disabled={loading || !password || !confirm} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">{loading ? <><Loader2 size={16} className="animate-spin" /> Updating password...</> : 'Update password'}</button></form>}
    </div></main>
  </div>
}
