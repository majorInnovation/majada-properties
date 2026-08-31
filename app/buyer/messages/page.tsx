import Link from 'next/link'
import { ArrowLeft, MessageSquareText } from 'lucide-react'
import { requireRole } from '@/lib/auth'
import { getConversationsForUser } from '@/lib/queries'
import { BuyerHeader } from '@/components/app/buyer-header'
import { MessagesClient } from '@/components/app/messages-client'

export default async function BuyerMessagesPage() {
  const { userId } = await requireRole('buyer')
  const conversations = await getConversationsForUser(userId)

  return (
    <main className="min-h-screen bg-background pb-20 text-foreground md:pb-0">
      <BuyerHeader active="/buyer/messages" />

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-5 sm:py-8 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/buyer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm font-medium text-foreground"
          >
            <ArrowLeft size={16} />
            <span className="sm:hidden">Back</span>
            <span className="hidden sm:inline">Back to buyer portal</span>
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
            <MessageSquareText size={16} />
            Messages
          </div>
        </div>

        <MessagesClient conversations={conversations} currentUserId={userId} viewer="buyer" />
      </div>
    </main>
  )
}
