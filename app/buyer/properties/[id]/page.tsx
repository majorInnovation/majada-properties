import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Bath, BedDouble, Check, MapPin, Phone, Square } from 'lucide-react'
import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { getPropertyById } from '@/lib/queries'
import { formatPrice, listingLabel, locationLabel, propertyFeatures } from '@/lib/format'
import { BuyerHeader } from '@/components/app/buyer-header'
import { SaveButton } from '@/components/app/save-button'
import { ContactSellerForm } from '@/components/app/contact-seller-form'

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="100%" height="100%" fill="#e5e7eb"/><text x="50%" y="50%" fill="#9ca3af" font-family="sans-serif" font-size="34" text-anchor="middle">No photo yet</text></svg>`,
  )

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { userId } = await requireRole('buyer')
  const { id } = await params
  const property = await getPropertyById(id)

  if (!property || (property.status !== 'active' && property.owner_id !== userId)) {
    notFound()
  }

  const supabase = await createClient()
  const [{ data: savedRow }] = await Promise.all([
    supabase
      .from('saved_properties')
      .select('property_id')
      .eq('user_id', userId)
      .eq('property_id', id)
      .maybeSingle(),
    supabase.rpc('increment_property_views', { pid: id }),
  ])

  const images = property.property_images.map((i) => i.url)
  const hero = images[0] ?? PLACEHOLDER
  const features = propertyFeatures(property)
  const agent = property.owner

  return (
    <main className="min-h-screen bg-background pb-10 text-foreground">
      <BuyerHeader active="/buyer" />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-5 sm:py-8 lg:px-8">
        <Link
          href="/buyer"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm font-medium text-foreground"
        >
          <ArrowLeft size={16} />
          <span className="sm:hidden">Back</span>
          <span className="hidden sm:inline">Back to listings</span>
        </Link>

        <section className="overflow-hidden rounded-[28px] border border-border bg-card shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="p-4 sm:p-5">
              <img src={hero} alt={property.title} className="h-56 w-full rounded-[18px] object-cover sm:h-80 sm:rounded-[22px] lg:h-[420px]" />
              {images.length > 1 && (
                <div className="mt-3 grid grid-cols-4 gap-2 sm:mt-4 sm:gap-3">
                  {images.slice(0, 8).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${property.title} ${index + 1}`}
                      className="h-16 w-full rounded-lg object-cover sm:h-24 sm:rounded-xl"
                    />
                  ))}
                </div>
              )}
            </div>

            <aside className="border-t border-border bg-background p-5 lg:border-l lg:border-t-0">
              <span className="rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                {listingLabel(property.listing_type)}
              </span>

              <h1 className="mt-4 font-serif text-4xl tracking-tight">{property.title}</h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin size={15} />
                {locationLabel(property)}
              </p>

              <p className="mt-5 text-3xl font-bold text-primary">
                {formatPrice(property.price, property.currency, property.listing_type)}
              </p>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <Stat icon={<BedDouble size={16} className="mx-auto text-primary" />} value={property.bedrooms} label="Beds" />
                <Stat icon={<Bath size={16} className="mx-auto text-primary" />} value={property.bathrooms} label="Baths" />
                <Stat icon={<Square size={16} className="mx-auto text-primary" />} value={`${property.area_sqm} m²`} label="Area" />
              </div>

              <div className="mt-6">
                <SaveButton
                  propertyId={property.id}
                  initialSaved={Boolean(savedRow)}
                  signedIn
                  variant="full"
                />
              </div>

              <div className="mt-6 rounded-2xl border border-border bg-card p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Seller</p>
                <div className="mt-3">
                  <p className="font-semibold">{agent?.full_name ?? 'Majada seller'}</p>
                  {agent?.phone && (
                    <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone size={15} className="text-primary" />
                      {agent.phone}
                    </p>
                  )}
                </div>
                <div className="mt-4">
                  <ContactSellerForm propertyId={property.id} isOwner={property.owner_id === userId} />
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Overview</p>
            <h2 className="mt-3 font-serif text-3xl tracking-tight">Property description</h2>
            <p className="mt-4 whitespace-pre-line leading-7 text-muted-foreground">
              {property.description || 'The seller has not added a description yet.'}
            </p>

            {features.length > 0 && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 rounded-xl border border-border bg-background p-3 text-sm font-medium"
                  >
                    <Check size={16} className="text-primary" />
                    {feature}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">At a glance</p>
            <dl className="mt-5 space-y-4 text-sm">
              <Row label="Property type" value={property.property_type} />
              <Row label="Listing" value={listingLabel(property.listing_type)} />
              <Row label="City" value={property.city || '—'} />
              <Row label="Views" value={String(property.views)} />
            </dl>
          </div>
        </section>
      </div>
    </main>
  )
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: React.ReactNode; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-center">
      {icon}
      <p className="mt-2 text-sm font-semibold">{value}</p>
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium capitalize">{value}</dd>
    </div>
  )
}
