import { requireRole } from '@/lib/auth'
import { getActiveProperties, getSavedPropertyIds } from '@/lib/queries'
import { BuyerHeader } from '@/components/app/buyer-header'
import { BuyerBrowseClient } from '@/components/app/buyer-browse-client'

export default async function BuyerPage() {
  const { userId, profile } = await requireRole('buyer')
  const [properties, savedIds] = await Promise.all([
    getActiveProperties(),
    getSavedPropertyIds(userId),
  ])

  const prefs = profile.preferences ?? {}

  return (
    <main className="min-h-screen bg-background pb-10 text-foreground">
      <BuyerHeader active="/buyer" />
      <BuyerBrowseClient
        properties={properties}
        savedIds={savedIds}
        initialLocation={prefs.search_city ?? ''}
        initialMinBeds={prefs.search_min_beds ?? 0}
      />
    </main>
  )
}
