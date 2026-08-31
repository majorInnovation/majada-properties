import { requireRole } from '@/lib/auth'
import { getActiveProperties, getSavedPropertyIds } from '@/lib/queries'
import { BuyerHeader } from '@/components/app/buyer-header'
import { BuyerBrowseClient } from '@/components/app/buyer-browse-client'

export default async function BuyerPage() {
  const { userId } = await requireRole('buyer')
  const [properties, savedIds] = await Promise.all([
    getActiveProperties(),
    getSavedPropertyIds(userId),
  ])

  return (
    <main className="min-h-screen bg-background pb-20 text-foreground md:pb-0">
      <BuyerHeader active="/buyer" />
      <BuyerBrowseClient properties={properties} savedIds={savedIds} />
    </main>
  )
}
