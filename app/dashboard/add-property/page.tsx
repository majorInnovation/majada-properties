import Link from 'next/link'
import { ArrowLeft, Building2, MapPin } from 'lucide-react'
import { requireRole } from '@/lib/auth'
import { getUnreadCount } from '@/lib/queries'
import { AddPropertyForm } from '@/components/app/add-property-form'
import { MobileTabBar } from '@/components/app/mobile-tab-bar'

export default async function AddPropertyPage() {
  const { userId } = await requireRole('seller')
  const unread = await getUnreadCount(userId)

  return (
    <main className="min-h-screen bg-background pb-20 text-foreground md:pb-0">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-20 sm:px-5 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Building2 size={18} />
            </span>
            <span className="font-serif text-xl font-semibold sm:text-2xl">majada</span>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to dashboard</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-5 sm:py-8 lg:px-8 lg:py-12">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-primary sm:text-sm">Seller workspace</p>
            <h1 className="mt-1.5 font-serif text-3xl tracking-tight sm:mt-2 sm:text-4xl">Add a property</h1>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground">
            <MapPin size={15} />
            Zambia
          </div>
        </div>

        <AddPropertyForm />
      </div>

      <MobileTabBar role="seller" currentUserId={userId} initialUnread={unread} />
    </main>
  )
}
