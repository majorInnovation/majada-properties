'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Preferences } from '@/lib/types'

type State = { ok?: boolean; error?: string }

function revalidateSettings() {
  revalidatePath('/buyer/settings')
  revalidatePath('/buyer')
  revalidatePath('/dashboard')
}

export async function updateProfile(
  _prev: State | undefined,
  formData: FormData,
): Promise<State> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Session expired. Please sign in again.' }

  // Only touch fields the submitted form actually contains.
  const patch: Record<string, string | null> = {}
  const setField = (key: string) => {
    if (formData.has(key)) {
      const v = String(formData.get(key) ?? '').trim()
      patch[key] = v || null
    }
  }
  setField('full_name')
  setField('phone')
  setField('company')
  setField('bio')

  if (Object.keys(patch).length === 0) return { ok: true }

  const { error } = await supabase.from('profiles').update(patch).eq('id', user.id)
  if (error) return { error: error.message }

  revalidateSettings()
  return { ok: true }
}

/** Shallow-merge a patch into profiles.preferences (jsonb). */
export async function updatePreferences(patch: Preferences): Promise<State> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Session expired. Please sign in again.' }

  const { data: current } = await supabase
    .from('profiles')
    .select('preferences')
    .eq('id', user.id)
    .maybeSingle()

  const merged = { ...(current?.preferences ?? {}), ...patch }

  const { error } = await supabase
    .from('profiles')
    .update({ preferences: merged })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidateSettings()
  return { ok: true }
}

/** Emails the current user a password-reset link. */
export async function sendPasswordReset(): Promise<State> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) return { error: 'No email on file for this account.' }

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
  })

  if (error) return { error: error.message }
  return { ok: true }
}
