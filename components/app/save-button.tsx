'use client'

import { useState, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toggleSaved } from '@/app/actions/saved'

type Props = {
  propertyId: string
  initialSaved: boolean
  signedIn: boolean
  variant?: 'icon' | 'full'
}

export function SaveButton({ propertyId, initialSaved, signedIn, variant = 'icon' }: Props) {
  const router = useRouter()
  const [saved, setSaved] = useState(initialSaved)
  const [pending, startTransition] = useTransition()

  function onClick() {
    if (!signedIn) {
      router.push('/auth/login')
      return
    }
    startTransition(async () => {
      const next = !saved
      setSaved(next)
      const res = await toggleSaved(propertyId)
      if (res.error) setSaved(!next)
      else setSaved(res.saved)
    })
  }

  if (variant === 'full') {
    return (
      <button
        onClick={onClick}
        disabled={pending}
        className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60"
      >
        {saved ? 'Saved to your shortlist' : 'Save property'}
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      disabled={pending}
      aria-label={saved ? 'Remove from saved' : 'Save property'}
      className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-background/90 transition-colors hover:bg-background disabled:opacity-60"
    >
      <Heart size={17} className={saved ? 'fill-primary text-primary' : ''} />
    </button>
  )
}
