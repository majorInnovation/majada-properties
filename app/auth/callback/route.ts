import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')
  const safeNext = next?.startsWith('/') && !next.startsWith('//') ? next : null

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      let destination = safeNext ?? '/buyer'
      if (!safeNext && data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle()
        destination = profile?.role === 'seller' ? '/dashboard' : '/buyer'
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const proto = request.headers.get('x-forwarded-proto')
      const origin = forwardedHost ? `${proto}://${forwardedHost}` : new URL(request.url).origin
      return NextResponse.redirect(`${origin}${destination}`)
    }
  }

  return NextResponse.redirect(new URL('/auth/error', request.url))
}
