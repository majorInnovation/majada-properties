'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  ArrowRight,
  Bell,
  Building2,
  ChevronDown,
  Heart,
  Home,
  MapPin,
  Menu,
  MessageCircle,
  Search,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react'
import type { PropertyWithRelations } from '@/lib/types'
import { PropertyCard } from './property-card'

type Props = {
  properties: PropertyWithRelations[]
  savedIds: string[]
  signedIn: boolean
  portalHref: string | null
}

export function LandingClient({ properties, savedIds, signedIn, portalHref }: Props) {
  const [activeTab, setActiveTab] = useState<'Buy' | 'Rent'>('Buy')
  const [location, setLocation] = useState('Lusaka, Zambia')
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState('')

  const savedSet = useMemo(() => new Set(savedIds), [savedIds])
  const visible = useMemo(
    () =>
      activeTab === 'Rent'
        ? properties.filter((p) => p.listing_type === 'rent')
        : properties,
    [activeTab, properties],
  )

  function notify(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2500)
  }

  return (
    <main className="min-h-screen bg-background pb-20 text-foreground md:pb-0">
      {toast && (
        <div className="fixed right-4 top-4 z-50 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg sm:right-5 sm:top-5">
          {toast}
        </div>
      )}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-5 lg:px-8">
          <a href="#top" className="flex items-center gap-2.5" aria-label="Majada Properties home">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Building2 size={20} />
            </span>
            <span className="font-serif text-xl font-semibold tracking-tight sm:text-2xl">majada</span>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a className="text-foreground" href="#explore">Explore homes</a>
            <a href="#how-it-works" className="transition-colors hover:text-foreground">How it works</a>
            <a href="#list-property" className="transition-colors hover:text-foreground">List your property</a>
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            {signedIn && portalHref ? (
              <Link
                href={portalHref}
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
              >
                Go to your portal
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="rounded-lg px-4 py-2 text-sm font-semibold hover:bg-muted">
                  Sign in
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
                >
                  Create account
                </Link>
              </>
            )}
          </div>
          <button className="rounded-lg p-2 md:hidden" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-border px-5 py-4 md:hidden">
            <div className="flex flex-col gap-4 text-sm font-medium">
              <a href="#explore" onClick={() => setMenuOpen(false)}>Explore homes</a>
              <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
              <a href="#list-property" onClick={() => setMenuOpen(false)}>List your property</a>
              <Link
                href={signedIn && portalHref ? portalHref : '/auth/login'}
                className="w-fit rounded-lg bg-primary px-4 py-2.5 text-primary-foreground"
                onClick={() => setMenuOpen(false)}
              >
                {signedIn && portalHref ? 'Go to your portal' : 'Sign in'}
              </Link>
            </div>
          </div>
        )}
      </header>

      <section id="top" className="relative overflow-hidden bg-navy text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:gap-12 sm:px-5 sm:py-20 lg:grid-cols-[1fr_0.86fr] lg:items-center lg:px-8 lg:py-28">
          <div className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 sm:mb-6">
              <Sparkles size={14} className="text-primary-light" /> Property search, made simpler
            </div>
            <h1 className="font-serif text-4xl leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
              Find a place to <span className="text-primary-light">belong.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-300 sm:mt-6 sm:text-lg">
              Discover verified homes, apartments, and land across Zambia. Search with confidence,
              connect directly, and move in with ease.
            </p>
            <div className="mt-9 flex flex-wrap gap-3 text-sm text-slate-300">
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary-light" /> Verified listings
              </span>
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary-light" /> Direct conversations
              </span>
            </div>
          </div>
          <div className="rounded-2xl bg-card p-2 text-card-foreground shadow-2xl shadow-black/20 sm:p-3">
            <div className="rounded-xl border border-border bg-muted/40 p-4 sm:p-7">
              <div className="mb-5 flex gap-6 border-b border-border">
                <button
                  className={`border-b-2 pb-3 text-sm font-semibold ${activeTab === 'Buy' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
                  onClick={() => setActiveTab('Buy')}
                >
                  Buy
                </button>
                <button
                  className={`border-b-2 pb-3 text-sm font-semibold ${activeTab === 'Rent' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
                  onClick={() => setActiveTab('Rent')}
                >
                  Rent
                </button>
              </div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Where do you want to live?
              </label>
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3.5">
                <MapPin size={19} className="text-primary" />
                <input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none"
                  aria-label="Search location"
                />
                <ChevronDown size={16} className="text-muted-foreground" />
              </div>
              <button
                onClick={() => notify(`Showing ${activeTab.toLowerCase()} homes`)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Search size={18} /> Search properties
              </button>
              <a
                href="#explore"
                className="mt-4 flex w-full items-center justify-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <SlidersHorizontal size={14} /> Browse all listings
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="explore" className="mx-auto max-w-7xl px-4 py-12 sm:px-5 sm:py-16 lg:px-8 lg:py-24">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Explore Majada</p>
            <h2 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl lg:text-5xl">Homes worth coming home to</h2>
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="mt-9 rounded-2xl border border-dashed border-border bg-muted/40 p-12 text-center">
            <p className="font-serif text-2xl">No live listings yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              As soon as a seller publishes a property it will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-9 grid gap-6 lg:grid-cols-3">
            {visible.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                saved={savedSet.has(property.id)}
                signedIn={signedIn}
                href={signedIn ? `/buyer/properties/${property.id}` : '/auth/login'}
              />
            ))}
          </div>
        )}
      </section>

      <section id="how-it-works" className="border-y border-border bg-muted/45">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-5 sm:py-16 lg:px-8 lg:py-20">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">A better way to move</p>
            <h2 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">Property search without the runaround.</h2>
          </div>
          <div className="mt-8 grid gap-8 sm:mt-10 md:grid-cols-3">
            <Step icon={<Search />} title="Search freely" copy="Browse clear, current listings in the places you want to call home." />
            <Step icon={<MessageCircle />} title="Connect directly" copy="Ask questions and arrange viewings with property owners and agents." />
            <Step icon={<Home />} title="Move confidently" copy="Make informed decisions with verified details and a simpler process." />
          </div>
        </div>
      </section>

      <section id="list-property" className="mx-auto max-w-7xl px-4 py-12 sm:px-5 sm:py-16 lg:px-8 lg:py-24">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-primary p-6 text-primary-foreground sm:gap-8 sm:rounded-3xl sm:p-12 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary-foreground/70">For owners and agents</p>
            <h2 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl">Your property deserves to be seen.</h2>
            <p className="mt-4 leading-7 text-primary-foreground/80">
              Reach serious buyers and renters across Zambia with a listing that works as hard as you do.
            </p>
          </div>
          <Link
            href="/auth/sign-up"
            className="flex shrink-0 items-center gap-2 rounded-xl bg-background px-5 py-3.5 text-sm font-semibold text-foreground hover:bg-background/90"
          >
            List your property <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Building2 size={15} />
            </span>{' '}
            majada
          </div>
          <p>Property, made personal.</p>
          <div className="flex gap-5">
            <a href="#top" className="hover:text-foreground">About</a>
            <a href="#how-it-works" className="hover:text-foreground">Support</a>
            <a href="#top" className="hover:text-foreground">Privacy</a>
          </div>
        </div>
      </footer>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-border bg-background/95 px-2 py-2 backdrop-blur md:hidden">
        <MobileNav icon={<Search size={19} />} label="Explore" href="#explore" />
        <MobileNav icon={<Heart size={19} />} label="Saved" href={signedIn ? '/buyer/saved' : '/auth/login'} />
        <MobileNav icon={<Bell size={19} />} label="Alerts" href="#top" />
        <MobileNav icon={<UserRound size={19} />} label="Account" href={signedIn && portalHref ? portalHref : '/auth/login'} />
      </nav>
    </main>
  )
}

function Step({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return (
    <div className="flex gap-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">{icon}</span>
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
      </div>
    </div>
  )
}

function MobileNav({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <a href={href} className="flex flex-col items-center gap-1 px-4 py-1 text-[11px] font-medium text-muted-foreground hover:text-primary">
      {icon}
      {label}
    </a>
  )
}
