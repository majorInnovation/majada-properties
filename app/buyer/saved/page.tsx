import Link from 'next/link'
import { ArrowLeft, Bookmark, Search } from 'lucide-react'
import { requireRole } from '@/lib/auth'
import { getSavedProperties } from '@/lib/queries'
import { BuyerHeader } from '@/components/app/buyer-header'
import { PropertyCard } from '@/components/app/property-card'

export default async function SavedHomesPage() {
  const { userId } = await requireRole('buyer')
  const saved = await getSavedProperties(userId)

  return (
    <main className="min-h-screen bg-background pb-10 text-foreground">
      <BuyerHeader active="/buyer/saved" />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-5 sm:py-8 lg:px-8">
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
            <Bookmark size={16} />
            Saved homes
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Shortlist</p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight">Your saved properties</h1>
        </div>

        {saved.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-12 text-center">
            <p className="font-serif text-2xl">No saved homes yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Tap the heart on any listing to keep it here.
            </p>
            <Link
              href="/buyer"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              <Search size={16} />
              Browse homes
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {saved.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                saved
                signedIn
                href={`/buyer/properties/${property.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
