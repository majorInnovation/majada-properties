import Link from 'next/link'
import { Building2, AlertCircle, ArrowRight, Home } from 'lucide-react'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const { message: errorMessage } = await searchParams

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Majada Properties home">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Building2 size={18} />
            </span>
            <span className="font-serif text-xl font-semibold tracking-tight">majada</span>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="mb-8 flex justify-center">
            <div className="rounded-full bg-red-100 p-4">
              <AlertCircle className="text-red-600" size={48} />
            </div>
          </div>

          <h1 className="font-serif text-3xl font-semibold tracking-tight">Authentication error</h1>
          <p className="mt-4 text-base text-muted-foreground">
            {errorMessage
              ? `Error: ${errorMessage}`
              : 'There was an issue with your authentication. This link may have expired or already been used.'}
          </p>

          <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-6">
            <p className="text-sm text-red-800">
              If you continue to experience issues, please try signing up or signing in again.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <Link
              href="/auth/sign-up"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
            >
              Try signing up again
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold hover:bg-muted"
            >
              Go to sign in
            </Link>
          </div>

          <div className="mt-8 border-t border-border pt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3"
            >
              <Home size={16} />
              Back to home
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
