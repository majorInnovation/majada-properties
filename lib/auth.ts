import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Profile, Role } from '@/lib/types'

/** Current auth user + profile, or nulls when signed out. */
export async function getSessionProfile(): Promise<{
  userId: string | null
  profile: Profile | null
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { userId: null, profile: null }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (profile) return { userId: user.id, profile: profile as Profile }

  // Safety net for accounts created before the DB trigger existed: build the
  // missing profile row from the sign-up metadata.
  const meta = user.user_metadata ?? {}
  const fullName =
    [meta.first_name, meta.last_name].filter(Boolean).join(' ').trim() || null
  const { data: created } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      role: meta.user_type === 'seller' ? 'seller' : 'buyer',
      full_name: fullName,
      phone: meta.phone ?? null,
      email: user.email ?? null,
    })
    .select('*')
    .maybeSingle()

  return { userId: user.id, profile: (created as Profile) ?? null }
}

/** Use in a page/layout that must belong to one role. Redirects otherwise. */
export async function requireRole(role: Role): Promise<{ userId: string; profile: Profile }> {
  const { userId, profile } = await getSessionProfile()

  if (!userId) redirect('/auth/login')
  if (!profile) redirect('/auth/login')
  if (profile.role !== role) redirect(profile.role === 'seller' ? '/dashboard' : '/buyer')

  return { userId, profile }
}

export function portalPath(role: Role | undefined | null): string {
  return role === 'seller' ? '/dashboard' : '/buyer'
}
