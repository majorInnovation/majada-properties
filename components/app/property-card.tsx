import Link from 'next/link'
import { BedDouble, ChevronRight, MapPin } from 'lucide-react'
import type { PropertyWithRelations } from '@/lib/types'
import { formatPrice, listingLabel, locationLabel } from '@/lib/format'
import { SaveButton } from './save-button'

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="#e5e7eb"/><text x="50%" y="50%" fill="#9ca3af" font-family="sans-serif" font-size="28" text-anchor="middle">No photo yet</text></svg>`,
  )

export function PropertyCard({
  property,
  saved,
  signedIn,
  href,
  showSave = true,
}: {
  property: PropertyWithRelations
  saved: boolean
  signedIn: boolean
  href: string
  showSave?: boolean
}) {
  const image = property.property_images[0]?.url ?? PLACEHOLDER

  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={property.title}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1.5 text-xs font-semibold text-foreground">
          {listingLabel(property.listing_type)}
        </span>
        {showSave && (
          <SaveButton propertyId={property.id} initialSaved={saved} signedIn={signedIn} />
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-serif text-2xl leading-tight">{property.title}</h3>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin size={14} />
              {locationLabel(property)}
            </p>
          </div>
          <p className="whitespace-nowrap text-sm font-bold text-primary">
            {formatPrice(property.price, property.currency, property.listing_type)}
          </p>
        </div>

        <div className="mt-5 flex gap-5 border-t border-border pt-4 text-xs font-medium text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BedDouble size={15} /> {property.bedrooms} beds
          </span>
          <span>{property.bathrooms} baths</span>
          <span>{property.area_sqm} m²</span>
        </div>

        <Link
          href={href}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          View details
          <ChevronRight size={15} />
        </Link>
      </div>
    </article>
  )
}
