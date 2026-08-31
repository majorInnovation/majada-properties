import Link from 'next/link'
import type { ReactNode } from 'react'
import { Building2 } from 'lucide-react'

type AuthShellProps = {
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(17,24,39,0.08),_transparent_42%)]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/5 to-transparent" />

      <div className="relative w-full max-w-[480px]">
        <div className="mb-6 flex justify-center">
          <Link href="/" className="inline-flex items-center gap-3" aria-label="Majada home">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Building2 size={18} />
            </span>
            <span className="font-serif text-2xl font-semibold tracking-tight text-foreground">majada</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_18px_45px_rgba(17,24,39,0.08)] sm:p-7">
          <div className="mb-6 text-center">
            <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-[2rem]">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          </div>

          {children}

          {footer ? <div className="mt-6 border-t border-border pt-5 text-center text-sm text-muted-foreground">{footer}</div> : null}
        </div>
      </div>
    </main>
  )
}
