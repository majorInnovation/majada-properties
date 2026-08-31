'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateProfile(
  _prev: { ok?: boolean; error?: string } | undefined,
  formData: FormData,
): Promise<{ ok?: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Session expired. Please sign in again.' }

  const full_name = String(formData.get('full_name') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: full_name || null, phone: phone || null })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/buyer/settings')
  revalidatePath('/dashboard')
  return { ok: true }
}
