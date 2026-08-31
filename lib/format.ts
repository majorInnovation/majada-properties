import type { ListingType, Property } from './types'

/** "ZMW 3,850,000" for sale, "ZMW 12,500 / mo" for rent. */
export function formatPrice(
  price: number,
  currency: string,
  listingType: ListingType,
): string {
  const amount = new Intl.NumberFormat('en-US').format(Math.round(price))
  return listingType === 'rent'
    ? `${currency} ${amount} / mo`
    : `${currency} ${amount}`
}

export function listingLabel(listingType: ListingType): string {
  return listingType === 'rent' ? 'For rent' : 'For sale'
}

export function locationLabel(p: Pick<Property, 'location' | 'city'>): string {
  return [p.location, p.city].filter(Boolean).join(', ') || 'Location not set'
}

/** Feature chips derived from real columns for the property detail page. */
export function propertyFeatures(p: Property): string[] {
  const base = [
    `${p.bedrooms} ${p.bedrooms === 1 ? 'bedroom' : 'bedrooms'}`,
    `${p.bathrooms} ${p.bathrooms === 1 ? 'bathroom' : 'bathrooms'}`,
    p.area_sqm ? `${p.area_sqm} m² floor area` : null,
  ].filter(Boolean) as string[]
  return [...base, ...p.amenities]
}
