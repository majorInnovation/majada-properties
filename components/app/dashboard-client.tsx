'use client'

import Link from 'next/link'
import { useActionState, useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Eye, Loader2, MessageCircle, Plus, Trash2 } from 'lucide-react'
import type { Profile, PropertyWithRelations } from '@/lib/types'
import { formatPrice, listingLabel, locationLabel } from '@/lib/format'
import { deleteProperty, setPropertyStatus, updateProperty } from '@/app/actions/properties'
import { DashboardTabs, useDashboardView, type DashboardView } from './dashboard-tabs'
import { SellerSettings } from './seller-settings'

type Inquiry = {
  id: string
  buyerName: string
  propertyTitle: string
  lastMessage: string
  lastAt: string | null
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-accent text-accent-foreground',
  draft: 'bg-muted text-muted-foreground',
  pending: 'bg-primary/10 text-primary',
  sold: 'bg-muted text-muted-foreground',
}

export function DashboardClient({
  listings,
  inquiries,
  profile,
}: {
  listings: PropertyWithRelations[]
  inquiries: Inquiry[]
  profile: Profile
}) {
  const router = useRouter()
  const view = useDashboardView()
  const [editing, setEditing] = useState<PropertyWithRelations | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const goto = (v: DashboardView) =>
    router.replace(v === 'overview' ? '/dashboard' : `/dashboard?tab=${v}`, {
      scroll: false,
    })

  const stats = useMemo(() => {
    const active = listings.filter((l) => l.status === 'active').length
    const drafts = listings.filter((l) => l.status === 'draft').length
    const views = listings.reduce((sum, l) => sum + l.views, 0)
    return { active, drafts, views, inquiries: inquiries.length }
  }, [listings, inquiries])

  function toggleStatus(l: PropertyWithRelations) {
    setBusyId(l.id)
    startTransition(async () => {
      await setPropertyStatus(l.id, l.status === 'active' ? 'draft' : 'active')
      setBusyId(null)
      router.refresh()
    })
  }

  function removeListing(id: string) {
    if (!confirm('Delete this listing permanently?')) return
    setBusyId(id)
    startTransition(async () => {
      await deleteProperty(id)
      setBusyId(null)
      router.refresh()
    })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-5 sm:py-8 lg:px-10 lg:py-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center sm:gap-5">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
            Seller dashboard
          </p>
          <h1 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl">
            Welcome{profile.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
          </h1>
        </div>
        <Link
          href="/dashboard/add-property"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 sm:w-fit"
        >
          <Plus size={18} />
          Add a property
        </Link>
      </div>

      {/* On phones these four live in the sticky header instead. */}
      <div className="mt-6 hidden sm:mt-8 md:block">
        <DashboardTabs variant="inline" />
      </div>

      {view === 'overview' && (
        <>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <Metric label="Active listings" value={stats.active} note="Live on the marketplace" icon={<Building2 />} />
            <Metric label="Drafts" value={stats.drafts} note="Not published yet" icon={<Building2 />} />
            <Metric label="Total views" value={stats.views} note="Across all listings" icon={<Eye />} />
            <Metric label="Inquiries" value={stats.inquiries} note="Buyer conversations" icon={<MessageCircle />} />
          </div>

          <h2 className="mt-10 font-serif text-2xl">Your listings</h2>
          <div className="mt-5 grid gap-4">
            {listings.slice(0, 3).map((l) => (
              <ListingRow
                key={l.id}
                listing={l}
                busy={busyId === l.id && pending}
                onToggle={() => toggleStatus(l)}
                onEdit={() => {
                  setEditing(l)
                  goto('listings')
                }}
                onDelete={() => removeListing(l.id)}
              />
            ))}
            {listings.length === 0 && <EmptyListings />}
          </div>
        </>
      )}

      {view === 'listings' && (
        <div className="mt-8 space-y-4">
          <h2 className="font-serif text-2xl sm:text-3xl">My listings</h2>

          {editing && (
            <EditPanel
              listing={editing}
              onClose={() => setEditing(null)}
              onSaved={() => {
                setEditing(null)
                router.refresh()
              }}
            />
          )}

          {listings.length === 0 ? (
            <EmptyListings />
          ) : (
            listings.map((l) => (
              <ListingRow
                key={l.id}
                listing={l}
                busy={busyId === l.id && pending}
                onToggle={() => toggleStatus(l)}
                onEdit={() => setEditing(l)}
                onDelete={() => removeListing(l.id)}
              />
            ))
          )}
        </div>
      )}

      {view === 'inquiries' && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl sm:text-3xl">Inquiries</h2>
            <Link href="/dashboard/messages" className="text-sm font-semibold text-primary">
              Open messages
            </Link>
          </div>
          {inquiries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-10 text-center text-sm text-muted-foreground">
              No buyer messages yet.
            </div>
          ) : (
            inquiries.map((q) => (
              <Link
                key={q.id}
                href="/dashboard/messages"
                className="block rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:bg-muted/40"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{q.buyerName}</p>
                  <span className="text-xs text-muted-foreground">
                    {q.lastAt ? new Date(q.lastAt).toLocaleDateString() : ''}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{q.propertyTitle}</p>
                <p className="mt-3 line-clamp-1 text-sm text-foreground">{q.lastMessage}</p>
              </Link>
            ))
          )}
        </div>
      )}

      {view === 'settings' && (
        <div className="max-w-3xl">
          <SellerSettings profile={profile} />
        </div>
      )}
    </div>
  )
}

function Metric({
  label,
  value,
  note,
  icon,
}: {
  label: string
  value: number
  note: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
        <span className="text-primary [&_svg]:size-4 sm:[&_svg]:size-5">{icon}</span>
      </div>
      <p className="mt-3 font-serif text-2xl sm:mt-4 sm:text-3xl">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">{note}</p>
    </div>
  )
}

function ListingRow({
  listing,
  busy,
  onToggle,
  onEdit,
  onDelete,
}: {
  listing: PropertyWithRelations
  busy: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const image = listing.property_images[0]?.url
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {image ? (
          <img src={image} alt={listing.title} className="h-28 w-full rounded-xl object-cover sm:w-40" />
        ) : (
          <div className="grid h-28 w-full place-items-center rounded-xl bg-muted text-xs text-muted-foreground sm:w-40">
            No photo
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{listing.title}</h3>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[listing.status]}`}>
              {listing.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{locationLabel(listing)}</p>
          <p className="mt-2 text-sm font-semibold text-primary">
            {formatPrice(listing.price, listing.currency, listing.listing_type)} · {listingLabel(listing.listing_type)}
          </p>
          <div className="mt-3 flex flex-wrap gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Eye size={14} /> {listing.views} views
            </span>
          </div>
        </div>
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 sm:flex sm:flex-nowrap">
          <button
            onClick={onToggle}
            disabled={busy}
            className="flex items-center justify-center rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-60"
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : listing.status === 'active' ? 'Pause' : 'Publish'}
          </button>
          <button
            onClick={onEdit}
            className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            disabled={busy}
            aria-label="Delete listing"
            className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-60"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

function EditPanel({
  listing,
  onClose,
  onSaved,
}: {
  listing: PropertyWithRelations
  onClose: () => void
  onSaved: () => void
}) {
  const [state, formAction, pending] = useActionState(updateProperty, undefined)

  // Close on a successful save (an object with no error was returned).
  useEffect(() => {
    if (state && !state.error) onSaved()
  }, [state, onSaved])

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-serif text-2xl">Edit listing</h3>
        <button onClick={onClose} className="text-sm font-semibold text-muted-foreground hover:text-foreground">
          Close
        </button>
      </div>

      {state?.error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{state.error}</p>
      )}

      <form action={formAction} className="grid gap-4 md:grid-cols-2">
        <input type="hidden" name="id" value={listing.id} />
        <Field label="Title" name="title" defaultValue={listing.title} className="md:col-span-2" />
        <Field label="Location" name="location" defaultValue={listing.location} />
        <Field label="City" name="city" defaultValue={listing.city} />
        <Field label="Price" name="price" type="number" defaultValue={String(listing.price)} className="md:col-span-2" />
        <label className="space-y-2 text-sm font-medium text-foreground md:col-span-2">
          <span>Description</span>
          <textarea
            name="description"
            rows={4}
            defaultValue={listing.description}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <div className="md:col-span-2 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-muted">
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {pending && <Loader2 size={14} className="animate-spin" />}
            Save changes
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({
  label,
  name,
  defaultValue,
  type = 'text',
  className = '',
}: {
  label: string
  name: string
  defaultValue: string
  type?: string
  className?: string
}) {
  return (
    <label className={`space-y-2 text-sm font-medium text-foreground ${className}`}>
      <span>{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  )
}

function EmptyListings() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-12 text-center">
      <p className="font-serif text-2xl">No properties yet</p>
      <p className="mt-2 text-sm text-muted-foreground">Add your first property to start receiving inquiries.</p>
      <Link
        href="/dashboard/add-property"
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        <Plus size={16} />
        Add a property
      </Link>
    </div>
  )
}
