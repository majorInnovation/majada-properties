'use client'

import Link from 'next/link'
import { Building2, CheckCircle2, Mail, ArrowRight } from 'lucide-react'

export default function SignUpSuccessPage() {
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
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle2 className="text-green-600" size={48} />
            </div>
          </div>

          <h1 className="font-serif text-3xl font-semibold tracking-tight">Account created!</h1>
          <p className="mt-4 text-base text-muted-foreground">
            We&apos;ve sent a confirmation email to your inbox. Please verify your email address to complete your signup.
          </p>

          <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6 text-left">
            <div className="flex gap-3">
              <Mail className="mt-0.5 shrink-0 text-blue-600" size={20} />
              <div>
                <h3 className="font-semibold text-blue-900">Check your email</h3>
                <p className="mt-1 text-sm text-blue-800">
                  Click the link in the confirmation email to verify your account. Once verified, you can sign in and start using Majada.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <p className="text-sm text-muted-foreground">
              Once you&apos;ve confirmed your email, you can sign in to your account.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
            >
              Go to sign in
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-8 border-t border-border pt-8">
            <p className="text-sm text-muted-foreground">
              Didn&apos;t receive the email?{' '}
              <button className="font-semibold text-primary hover:underline">
                Request a new confirmation link
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
