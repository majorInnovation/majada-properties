'use client'

import { useActionState, useState, useTransition } from 'react'
import { BadgeCheck, Bell, Check, Loader2, Mail, Phone, Search, User } from 'lucide-react'
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

export function BuyerSettings({ profile }: { profile: Profile }) {
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
              <BadgeCheck size={14} className="text-primary" /> Buyer
            </span>
            <span className="inline-flex items-center gap-1">
              <Mail size={14} /> {profile.email ?? '—'}
            </span>
            <span>Since {new Date(profile.created_at).toLocaleDateString()}</span>
          </p>
        </div>
      </header>

      <ProfileCard profile={profile} />
      <SearchPreferencesCard profile={profile} />
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
      title="Personal details"
      description="Sellers see this name and phone number when you contact them."
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
          <span className="flex items-center gap-1.5">
            <Phone size={13} /> Phone
          </span>
          <input name="phone" defaultValue={profile.phone ?? ''} className={inputClass} />
        </label>
        <label className="space-y-1.5 text-sm font-medium sm:col-span-2">
          <span className="flex items-center gap-1.5">
            <Mail size={13} /> Email
          </span>
          <input
            defaultValue={profile.email ?? ''}
            disabled
            className={`${inputClass} cursor-not-allowed bg-muted text-muted-foreground`}
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

function SearchPreferencesCard({ profile }: { profile: Profile }) {
  const p = profile.preferences ?? {}
  const [form, setForm] = useState({
    search_city: p.search_city ?? '',
    search_min_price: p.search_min_price != null ? String(p.search_min_price) : '',
    search_max_price: p.search_max_price != null ? String(p.search_max_price) : '',
    search_property_type: p.search_property_type ?? 'any',
    search_min_beds: String(p.search_min_beds ?? 0),
  })
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }))
    setSaved(false)
  }

  function save() {
    setError('')
    startTransition(async () => {
      const res = await updatePreferences({
        search_city: form.search_city.trim(),
        search_min_price: form.search_min_price ? Number(form.search_min_price) : null,
        search_max_price: form.search_max_price ? Number(form.search_max_price) : null,
        search_property_type: form.search_property_type,
        search_min_beds: Number(form.search_min_beds) || 0,
      })
      if (res.error) setError(res.error)
      else setSaved(true)
    })
  }

  return (
    <Card
      icon={<Search size={18} />}
      title="Search preferences"
      description="We use these to pre-fill your browse filters and shape your alerts."
    >
      {error && <Alert tone="error">{error}</Alert>}
      {saved && !error && (
        <Alert tone="ok">
          <Check size={15} /> Preferences saved.
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-sm font-medium sm:col-span-2">
          <span>Preferred area or city</span>
          <input
            value={form.search_city}
            onChange={(e) => set('search_city', e.target.value)}
            placeholder="e.g. Lusaka, Ibex Hill"
            className={inputClass}
          />
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          <span>Min budget (ZMW)</span>
          <input
            type="number"
            min={0}
            value={form.search_min_price}
            onChange={(e) => set('search_min_price', e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          <span>Max budget (ZMW)</span>
          <input
            type="number"
            min={0}
            value={form.search_max_price}
            onChange={(e) => set('search_max_price', e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          <span>Property type</span>
          <select
            value={form.search_property_type}
            onChange={(e) => set('search_property_type', e.target.value)}
            className={inputClass}
          >
            <option value="any">Any</option>
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="land">Land</option>
            <option value="commercial">Commercial</option>
          </select>
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          <span>Minimum bedrooms</span>
          <select
            value={form.search_min_beds}
            onChange={(e) => set('search_min_beds', e.target.value)}
            className={inputClass}
          >
            <option value="0">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
        </label>
      </div>

      <button
        type="button"
        onClick={save}
        disabled={pending}
        className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {pending && <Loader2 size={15} className="animate-spin" />}
        Save preferences
      </button>
    </Card>
  )
}

const TOGGLES: { key: keyof Preferences; label: string; hint: string }[] = [
  { key: 'new_listing_alerts', label: 'New homes matching my search', hint: 'Email me when a fresh listing fits my preferences.' },
  { key: 'price_drop_alerts', label: 'Price drops on saved homes', hint: 'Tell me when a shortlisted property gets cheaper.' },
  { key: 'seller_messages', label: 'Seller replies', hint: 'Email me when a seller answers my message.' },
]

function NotificationsCard({ profile }: { profile: Profile }) {
  const [prefs, setPrefs] = useState<Preferences>(() => {
    const p = profile.preferences ?? {}
    return {
      new_listing_alerts: p.new_listing_alerts ?? true,
      price_drop_alerts: p.price_drop_alerts ?? true,
      seller_messages: p.seller_messages ?? true,
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
