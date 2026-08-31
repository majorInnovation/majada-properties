import { Suspense } from 'react'
import { requireRole } from '@/lib/auth'
import { getConversationsForUser, getSellerProperties } from '@/lib/queries'
import { SellerHeader } from '@/components/app/seller-header'
import { DashboardClient } from '@/components/app/dashboard-client'

export default async function DashboardPage() {
  const { userId, profile } = await requireRole('seller')
  const [listings, conversations] = await Promise.all([
    getSellerProperties(userId),
    getConversationsForUser(userId),
  ])

  const inquiries = conversations.map((c) => {
    const last = c.messages[c.messages.length - 1]
    return {
      id: c.id,
      buyerName: c.buyer?.full_name ?? 'Buyer',
      propertyTitle: c.property?.title ?? 'Property',
      lastMessage: last?.body ?? 'No messages yet',
      lastAt: last?.created_at ?? null,
    }
  })

  return (
    <main className="min-h-screen bg-background pb-20 text-foreground md:pb-0">
      <Suspense fallback={<div className="h-16 border-b border-border bg-card" />}>
        <SellerHeader active="/dashboard" />
      </Suspense>
      <Suspense fallback={null}>
        <DashboardClient listings={listings} inquiries={inquiries} profile={profile} />
      </Suspense>
    </main>
  )
}
