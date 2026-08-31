import { createClient } from '@/lib/supabase/server'
import type {
  ConversationWithMeta,
  ListingType,
  PropertyWithRelations,
} from '@/lib/types'

// Full select embeds the owner profile via an explicit FK hint. If PostgREST
// can't resolve the embed (e.g. stale schema cache right after a migration) we
// retry with a basic select so listings still render.
const SELECT_FULL =
  '*, property_images(id, property_id, url, sort_order), owner:profiles!properties_owner_id_fkey(id, full_name, phone, avatar_url, email)'
const SELECT_BASIC = '*, property_images(id, property_id, url, sort_order)'

function logError(where: string, error: unknown) {
  if (error) console.error(`[queries] ${where}:`, error)
}

function sortImages(rows: PropertyWithRelations[]): PropertyWithRelations[] {
  return rows.map((row) => ({
    ...row,
    owner: row.owner ?? null,
    property_images: [...(row.property_images ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order,
    ),
  }))
}

type Filter<T> = (q: T) => T

async function runList(
  where: string,
  apply: Filter<any>,
): Promise<PropertyWithRelations[]> {
  const supabase = await createClient()

  let res = await apply(supabase.from('properties').select(SELECT_FULL))
  if (res.error) {
    logError(`${where} (full embed)`, res.error)
    res = await apply(supabase.from('properties').select(SELECT_BASIC))
    logError(`${where} (basic)`, res.error)
  }

  return sortImages((res.data as PropertyWithRelations[]) ?? [])
}

export async function getActiveProperties(opts: {
  listingType?: ListingType
  limit?: number
} = {}): Promise<PropertyWithRelations[]> {
  return runList('getActiveProperties', (q) => {
    let out = q.eq('status', 'active').order('created_at', { ascending: false })
    if (opts.listingType) out = out.eq('listing_type', opts.listingType)
    if (opts.limit) out = out.limit(opts.limit)
    return out
  })
}

export async function getSellerProperties(
  ownerId: string,
): Promise<PropertyWithRelations[]> {
  return runList('getSellerProperties', (q) =>
    q.eq('owner_id', ownerId).order('created_at', { ascending: false }),
  )
}

export async function getSavedProperties(
  userId: string,
): Promise<PropertyWithRelations[]> {
  const ids = await getSavedPropertyIds(userId)
  if (ids.length === 0) return []
  return runList('getSavedProperties', (q) =>
    q.in('id', ids).order('created_at', { ascending: false }),
  )
}

export async function getPropertyById(
  id: string,
): Promise<PropertyWithRelations | null> {
  const supabase = await createClient()

  let res = await supabase.from('properties').select(SELECT_FULL).eq('id', id).maybeSingle()
  if (res.error) {
    logError('getPropertyById (full embed)', res.error)
    res = await supabase.from('properties').select(SELECT_BASIC).eq('id', id).maybeSingle()
    logError('getPropertyById (basic)', res.error)
  }

  if (!res.data) return null
  return sortImages([res.data as PropertyWithRelations])[0]
}

export async function getSavedPropertyIds(userId: string): Promise<string[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('saved_properties')
    .select('property_id')
    .eq('user_id', userId)

  logError('getSavedPropertyIds', error)
  return (data ?? []).map((r) => r.property_id as string)
}

/** Number of messages sent to this user that they have not read yet. */
export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .neq('sender_id', userId)
    .is('read_at', null)

  logError('getUnreadCount', error)
  return count ?? 0
}

export async function getConversationsForUser(
  userId: string,
): Promise<ConversationWithMeta[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('conversations')
    .select(
      '*, property:properties(id, title), buyer:profiles!conversations_buyer_id_fkey(id, full_name), seller:profiles!conversations_seller_id_fkey(id, full_name), messages(id, conversation_id, sender_id, body, created_at, read_at)',
    )
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order('created_at', { ascending: false })

  logError('getConversationsForUser', error)
  const rows = (data as unknown as ConversationWithMeta[]) ?? []
  return rows.map((row) => ({
    ...row,
    messages: [...(row.messages ?? [])].sort(
      (a, b) => +new Date(a.created_at) - +new Date(b.created_at),
    ),
  }))
}
