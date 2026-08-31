import { requireRole } from '@/lib/auth'
import { BuyerHeader } from '@/components/app/buyer-header'
import { BuyerSettings } from '@/components/app/buyer-settings'

export default async function BuyerSettingsPage() {
  const { profile } = await requireRole('buyer')

  return (
    <main className="min-h-screen bg-background pb-10 text-foreground">
      <BuyerHeader active="/buyer/settings" />

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-5 sm:py-8 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Account</p>
          <h1 className="mt-1 font-serif text-3xl tracking-tight sm:text-4xl">Settings</h1>
        </div>

        <BuyerSettings profile={profile} />
      </div>
    </main>
  )
}
