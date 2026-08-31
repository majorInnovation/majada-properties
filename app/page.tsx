import { getActiveProperties, getSavedPropertyIds } from '@/lib/queries'
import { getSessionProfile, portalPath } from '@/lib/auth'
import { LandingClient } from '@/components/app/landing-client'

export default async function Page() {
  const [{ userId, profile }, properties] = await Promise.all([
    getSessionProfile(),
    getActiveProperties({ limit: 12 }),
  ])

  const savedIds = userId ? await getSavedPropertyIds(userId) : []

  return (
    <LandingClient
      properties={properties}
      savedIds={savedIds}
      signedIn={Boolean(userId)}
      portalHref={profile ? portalPath(profile.role) : null}
    />
  )
}
