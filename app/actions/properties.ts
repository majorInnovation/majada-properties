'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { PropertyStatus } from '@/lib/types'

type ActionState = { error?: string } | undefined

export type NewPropertyInput = {
  title: string
  description: string
  propertyType: string
  listingType: string
  price: number
  currency: string
  city: string
  location: string
  bedrooms: number
  bathrooms: number
  area: number
  amenities: string
  publish: boolean
  imageUrls: string[]
}

function str(fd: FormData, key: string) {
  return String(fd.get(key) ?? '').trim()
}
function num(fd: FormData, key: string) {
  const n = Number(fd.get(key))
  return Number.isFinite(n) ? n : 0
}

async function requireSeller() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { supabase, userId: null as string | null }
  return { supabase, userId: user.id }
}

/**
 * Create a listing. Photos are uploaded to Storage from the browser first
 * (keeps big files out of the server-action body), so this only receives URLs.
 * Returns { propertyId } on success, { error } otherwise.
 */
export async function createProperty(
  input: NewPropertyInput,
): Promise<{ propertyId?: string; error?: string }> {
  const { supabase, userId } = await requireSeller()
  if (!userId) return { error: 'Your session expired. Please sign in again.' }

  const title = input.title.trim()
  if (!title) return { error: 'Give the property a title.' }
  if (input.publish && input.imageUrls.length < 5) {
    return { error: 'Please upload at least 5 photos before publishing.' }
  }

  const { data: property, error: insertError } = await supabase
    .from('properties')
    .insert({
      owner_id: userId,
      title,
      description: input.description.trim(),
      property_type: input.propertyType || 'house',
      listing_type: input.listingType || 'sale',
      price: Number.isFinite(input.price) ? input.price : 0,
      currency: input.currency || 'ZMW',
      city: input.city.trim(),
      location: input.location.trim(),
      bedrooms: Math.max(0, Math.trunc(input.bedrooms) || 0),
      bathrooms: Math.max(0, Math.trunc(input.bathrooms) || 0),
      area_sqm: Number.isFinite(input.area) ? input.area : 0,
      amenities: input.amenities
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
      status: input.publish ? 'active' : 'draft',
    })
    .select('id')
    .single()

  if (insertError || !property) {
    console.error('[createProperty] insert failed:', insertError)
    return { error: insertError?.message ?? 'Could not save the property.' }
  }
  console.log('[createProperty] created', property.id, 'status:', input.publish ? 'active' : 'draft')

  if (input.imageUrls.length > 0) {
    const { error: imgError } = await supabase.from('property_images').insert(
      input.imageUrls.map((url, i) => ({
        property_id: property.id,
        url,
        sort_order: i,
      })),
    )
    if (imgError) return { error: `Listing saved, but photos failed: ${imgError.message}` }
  }

  revalidatePath('/dashboard')
  revalidatePath('/buyer')
  return { propertyId: property.id }
}

export async function updateProperty(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, userId } = await requireSeller()
  if (!userId) return { error: 'Your session expired. Please sign in again.' }

  const id = str(formData, 'id')
  if (!id) return { error: 'Missing property id.' }

  const { error } = await supabase
    .from('properties')
    .update({
      title: str(formData, 'title'),
      location: str(formData, 'location'),
      city: str(formData, 'city'),
      price: num(formData, 'price'),
      description: str(formData, 'description'),
    })
    .eq('id', id)
    .eq('owner_id', userId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/buyer')
  revalidatePath(`/buyer/properties/${id}`)
  return {}
}

export async function setPropertyStatus(id: string, status: PropertyStatus) {
  const { supabase, userId } = await requireSeller()
  if (!userId) return { error: 'Session expired.' }

  const { error } = await supabase
    .from('properties')
    .update({ status })
    .eq('id', id)
    .eq('owner_id', userId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/buyer')
  return {}
}

export async function deleteProperty(id: string) {
  const { supabase, userId } = await requireSeller()
  if (!userId) return { error: 'Session expired.' }

  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id)
    .eq('owner_id', userId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/buyer')
  return {}
}
