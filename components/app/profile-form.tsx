'use client'

import { useActionState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import type { Profile } from '@/lib/types'
import { updateProfile } from '@/app/actions/profile'

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(updateProfile, undefined)

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
          <Check size={16} />
          Profile updated.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-foreground">
          <span>Full name</span>
          <input
            name="full_name"
            defaultValue={profile.full_name ?? ''}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-foreground">
          <span>Email</span>
          <input
            defaultValue={profile.email ?? ''}
            disabled
            className="w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-muted-foreground outline-none"
          />
        </label>
      </div>

      <label className="space-y-2 text-sm font-medium text-foreground">
        <span>Phone</span>
        <input
          name="phone"
          defaultValue={profile.phone ?? ''}
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </label>

      <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm">
        <span className="font-medium">Account type</span>
        <span className="ml-auto rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
          {profile.role}
        </span>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {pending && <Loader2 size={15} className="animate-spin" />}
        Save changes
      </button>
    </form>
  )
}
