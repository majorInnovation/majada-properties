'use client'

import { useMemo, useState } from 'react'
import { MapPin, Search, SlidersHorizontal, Sparkles } from 'lucide-react'
import type { PropertyWithRelations } from '@/lib/types'
import { PropertyCard } from './property-card'

export function BuyerBrowseClient({
  properties,
  savedIds,
  initialLocation = '',
  initialMinBeds = 0,
}: {
  properties: PropertyWithRelations[]
  savedIds: string[]
  initialLocation?: string
  initialMinBeds?: number
}) {
  const [tab, setTab] = useState<'Buy' | 'Rent'>('Buy')
  const [location, setLocation] = useState(initialLocation)
  const [minBeds, setMinBeds] = useState(initialMinBeds)

  const savedSet = useMemo(() => new Set(savedIds), [savedIds])

  const visible = useMemo(() => {
    return properties.filter((p) => {
      if (tab === 'Rent' && p.listing_type !== 'rent') return false
      if (tab === 'Buy' && p.listing_type !== 'sale') return false
      if (minBeds && p.bedrooms < minBeds) return false
      if (location.trim()) {
        const hay = `${p.location} ${p.city} ${p.title}`.toLowerCase()
        if (!hay.includes(location.trim().toLowerCase())) return false
      }
      return true
    })
  }, [properties, tab, minBeds, location])

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-5 sm:py-8 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:rounded-[28px] sm:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
                <Sparkles size={12} />
                curated homes
              </p>
              <h1 className="mt-3 font-serif text-2xl tracking-tight sm:mt-4 sm:text-4xl lg:text-5xl">
                Find your next home
              </h1>
            </div>

            <div className="flex gap-2 self-start rounded-full border border-border bg-muted p-1 md:self-auto">
              {(['Buy', 'Rent'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    tab === t ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-background'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_0.8fr_0.35fr]">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3.5 shadow-sm">
              <MapPin size={18} className="text-primary" />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Filter by area, city or name"
                className="w-full bg-transparent text-sm font-medium outline-none"
                aria-label="Location filter"
              />
            </div>

            <select
              value={minBeds}
              onChange={(e) => setMinBeds(Number(e.target.value))}
              className="rounded-2xl border border-border bg-background px-4 py-3.5 text-sm font-medium text-foreground shadow-sm outline-none"
            >
              <option value={0}>Any bedrooms</option>
              <option value={1}>1+ beds</option>
              <option value={2}>2+ beds</option>
              <option value={3}>3+ beds</option>
              <option value={4}>4+ beds</option>
            </select>

            <button
              type="button"
              onClick={() => {
                setLocation('')
                setMinBeds(0)
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm"
            >
              <Search size={16} />
              Reset
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-5 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Explore</p>
            <h2 className="mt-1.5 font-serif text-2xl tracking-tight sm:mt-2 sm:text-3xl lg:text-4xl">
              {visible.length} {visible.length === 1 ? 'home' : 'homes'} available
            </h2>
          </div>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <SlidersHorizontal size={15} />
            {tab}
          </span>
        </div>

        {visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-12 text-center">
            <p className="font-serif text-2xl">Nothing matches yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try clearing the filters or switching between Buy and Rent.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {visible.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                saved={savedSet.has(property.id)}
                signedIn
                href={`/buyer/properties/${property.id}`}
              />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
