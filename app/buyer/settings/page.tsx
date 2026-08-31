import Link from 'next/link'
import { ArrowLeft, Settings } from 'lucide-react'
import { requireRole } from '@/lib/auth'
import { BuyerHeader } from '@/components/app/buyer-header'
import { ProfileForm } from '@/components/app/profile-form'

export default async function BuyerSettingsPage() {
  const { profile } = await requireRole('buyer')

  return (
    <main className="min-h-screen bg-background pb-20 text-foreground md:pb-0">
      <BuyerHeader active="/buyer/settings" />

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-5 sm:py-8 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/buyer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm font-medium text-foreground"
          >
            <ArrowLeft size={16} />
            <span className="sm:hidden">Back</span>
            <span className="hidden sm:inline">Back to buyer portal</span>
          </Link>
          <div className="rounded-full bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">Settings</div>
        </div>

        <section className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-accent text-primary">
              <Settings size={20} />
            </span>
            <div>
              <h1 className="font-serif text-3xl tracking-tight">Buyer profile</h1>
              <p className="text-sm text-muted-foreground">Update the details sellers see when you contact them.</p>
            </div>
          </div>

          <ProfileForm profile={profile} />
        </section>
      </div>
    </main>
  )
}
