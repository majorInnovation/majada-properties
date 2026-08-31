'use client'

import { useActionState, useState, useTransition } from 'react'
import { BadgeCheck, Bell, Check, Loader2, Mail, Phone, User } from 'lucide-react'
import type { Preferences, Profile } from '@/lib/types'
import { updatePreferences, updateProfile } from '@/app/actions/profile'
import {
  Alert,
  Card,
  SecurityCard,
  SessionCard,
  Toggle,
  initials,
  inputClass,
} from './settings-ui'

export function SellerSettings({ profile }: { profile: Profile }) {
  return (
    <div className="mt-6 space-y-5 sm:mt-8">
      <header className="flex items-center gap-4">
        <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground">
          {initials(profile.full_name, profile.email)}
        </div>
        <div className="min-w-0">
          <h2 className="truncate font-serif text-2xl tracking-tight sm:text-3xl">
            {profile.full_name || 'Your account'}
          </h2>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <BadgeCheck size={14} className="text-primary" /> Seller
            </span>
            <span className="inline-flex items-center gap-1">
              <Mail size={14} /> {profile.email ?? '—'}
            </span>
            <span>Since {new Date(profile.created_at).toLocaleDateString()}</span>
          </p>
        </div>
      </header>

      <ProfileCard profile={profile} />
      <NotificationsCard profile={profile} />
      <SecurityCard />
      <SessionCard />
    </div>
  )
}

function ProfileCard({ profile }: { profile: Profile }) {
  const [state, action, pending] = useActionState(updateProfile, undefined)

  return (
    <Card
      icon={<User size={18} />}
      title="Business profile"
      description="Buyers see this name and contact details on your listings."
    >
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      {state?.ok && (
        <Alert tone="ok">
          <Check size={15} /> Profile saved.
        </Alert>
      )}

      <form action={action} className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-sm font-medium">
          <span>Full name</span>
          <input name="full_name" defaultValue={profile.full_name ?? ''} className={inputClass} />
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          <span>Company / agency</span>
          <input
            name="company"
            defaultValue={profile.company ?? ''}
            placeholder="Optional"
            className={inputClass}
          />
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          <span className="flex items-center gap-1.5">
            <Phone size={13} /> Phone
          </span>
          <input name="phone" defaultValue={profile.phone ?? ''} className={inputClass} />
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          <span className="flex items-center gap-1.5">
            <Mail size={13} /> Email
          </span>
          <input
            defaultValue={profile.email ?? ''}
            disabled
            className={`${inputClass} cursor-not-allowed bg-muted text-muted-foreground`}
          />
        </label>
        <label className="space-y-1.5 text-sm font-medium sm:col-span-2">
          <span>About you</span>
          <textarea
            name="bio"
            rows={3}
            defaultValue={profile.bio ?? ''}
            placeholder="A short introduction shown to buyers who contact you."
            className={inputClass}
          />
        </label>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {pending && <Loader2 size={15} className="animate-spin" />}
            Save profile
          </button>
        </div>
      </form>
    </Card>
  )
}

const TOGGLES: { key: keyof Preferences; label: string; hint: string; fallback: boolean }[] = [
  { key: 'inquiry_email', label: 'New inquiry emails', hint: 'Get an email when a buyer messages you.', fallback: true },
  { key: 'weekly_summary', label: 'Weekly performance summary', hint: 'Views and inquiries digest every Monday.', fallback: true },
  { key: 'platform_news', label: 'Product updates', hint: 'Occasional news about new Majada features.', fallback: false },
]

function NotificationsCard({ profile }: { profile: Profile }) {
  const [prefs, setPrefs] = useState<Preferences>(() => {
    const p = profile.preferences ?? {}
    return {
      inquiry_email: p.inquiry_email ?? true,
      weekly_summary: p.weekly_summary ?? true,
      platform_news: p.platform_news ?? false,
    }
  })
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  function toggle(key: keyof Preferences) {
    const prev = prefs
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next)
    setSaved(false)
    setError('')
    startTransition(async () => {
      const res = await updatePreferences(next)
      if (res.error) {
        setError(res.error)
        setPrefs(prev)
        return
      }
      setSaved(true)
    })
  }

  return (
    <Card icon={<Bell size={18} />} title="Notifications" description="Choose what Majada emails you about.">
      {error && <Alert tone="error">{error}</Alert>}
      {saved && !error && (
        <Alert tone="ok">
          <Check size={15} /> Preferences updated.
        </Alert>
      )}
      <ul className="divide-y divide-border">
        {TOGGLES.map(({ key, label, hint }) => (
          <li key={key} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{hint}</p>
            </div>
            <Toggle
              checked={Boolean(prefs[key])}
              disabled={pending}
              label={label}
              onChange={() => toggle(key)}
            />
          </li>
        ))}
      </ul>
    </Card>
  )
}
