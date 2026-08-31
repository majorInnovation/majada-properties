'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/**
 * Buyer starts (or reuses) a conversation about a property, then posts the
 * first message. Returns the conversation id.
 */
export async function startConversation(
  propertyId: string,
  body: string,
): Promise<{ conversationId?: string; error?: string }> {
  const trimmed = body.trim()
  if (!trimmed) return { error: 'Write a short message first.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Sign in to contact the seller.' }

  const { data: property } = await supabase
    .from('properties')
    .select('id, owner_id')
    .eq('id', propertyId)
    .maybeSingle()

  if (!property) return { error: 'This property is no longer available.' }
  if (property.owner_id === user.id) return { error: 'This is your own listing.' }

  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('property_id', propertyId)
    .eq('buyer_id', user.id)
    .maybeSingle()

  let conversationId = existing?.id as string | undefined

  if (!conversationId) {
    const { data: created, error } = await supabase
      .from('conversations')
      .insert({
        property_id: propertyId,
        buyer_id: user.id,
        seller_id: property.owner_id,
      })
      .select('id')
      .single()
    if (error) return { error: error.message }
    conversationId = created.id
  }

  const { error: msgError } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: user.id, body: trimmed })
  if (msgError) return { error: msgError.message }

  revalidatePath('/buyer/messages')
  revalidatePath('/dashboard/messages')
  return { conversationId }
}

export async function sendMessage(
  conversationId: string,
  body: string,
): Promise<{ error?: string }> {
  const trimmed = body.trim()
  if (!trimmed) return { error: 'Message is empty.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Sign in to send messages.' }

  const { error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: user.id, body: trimmed })
  if (error) return { error: error.message }

  revalidatePath('/buyer/messages')
  revalidatePath('/dashboard/messages')
  return {}
}

/** Mark every message the other party sent in this conversation as read. */
export async function markConversationRead(
  conversationId: string,
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  const { error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_id', user.id)
    .is('read_at', null)

  if (error) return { error: error.message }

  revalidatePath('/buyer/messages')
  revalidatePath('/dashboard/messages')
  revalidatePath('/buyer')
  revalidatePath('/dashboard')
  return {}
}
