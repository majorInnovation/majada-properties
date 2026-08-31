'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/** Toggle a property in the current buyer's shortlist. Returns the new state. */
export async function toggleSaved(
  propertyId: string,
): Promise<{ saved: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { saved: false, error: 'You need to sign in to save homes.' }

  const { data: existing } = await supabase
    .from('saved_properties')
    .select('property_id')
    .eq('user_id', user.id)
    .eq('property_id', propertyId)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('saved_properties')
      .delete()
      .eq('user_id', user.id)
      .eq('property_id', propertyId)
    revalidatePath('/buyer')
    revalidatePath('/buyer/saved')
    return { saved: false }
  }

  const { error } = await supabase
    .from('saved_properties')
    .insert({ user_id: user.id, property_id: propertyId })

  if (error) return { saved: false, error: error.message }

  revalidatePath('/buyer')
  revalidatePath('/buyer/saved')
  return { saved: true }
}
