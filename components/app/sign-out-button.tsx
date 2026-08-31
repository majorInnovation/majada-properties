'use client'

import { LogOut } from 'lucide-react'
import { signOut } from '@/app/actions/auth'

export function SignOutButton({
  className = 'inline-flex items-center gap-2 rounded-full border border-border px-2.5 py-2 text-sm font-semibold text-foreground hover:bg-muted sm:px-3',
  label = 'Sign out',
}: {
  className?: string
  label?: string
}) {
  return (
    <form action={signOut}>
      <button type="submit" className={className} aria-label={label}>
        <LogOut size={15} />
        <span className="hidden sm:inline">{label}</span>
      </button>
    </form>
  )
}
