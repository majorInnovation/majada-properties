import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const SELLER_PREFIX = '/dashboard'
const BUYER_PREFIX = '/buyer'
const AUTH_PAGES = ['/auth/login', '/auth/sign-up']

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { secure: process.env.NODE_ENV === 'production' },
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Do not run code between createServerClient and supabase.auth.getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const onSellerArea = pathname === SELLER_PREFIX || pathname.startsWith(`${SELLER_PREFIX}/`)
  const onBuyerArea = pathname === BUYER_PREFIX || pathname.startsWith(`${BUYER_PREFIX}/`)
  const onAuthPage = AUTH_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`))

  const redirectTo = (to: string) => {
    const url = request.nextUrl.clone()
    url.pathname = to
    url.search = ''
    const res = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((c) => res.cookies.set(c))
    return res
  }

  // Signed out and trying to reach a portal → send to login.
  if (!user && (onSellerArea || onBuyerArea)) {
    return redirectTo('/auth/login')
  }

  // Signed in → look up role once and keep users inside their own portal.
  if (user && (onSellerArea || onBuyerArea || onAuthPage)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    const role = profile?.role as 'buyer' | 'seller' | undefined
    const home = role === 'seller' ? SELLER_PREFIX : BUYER_PREFIX

    if (onAuthPage) return redirectTo(home)
    // Only keep users in their lane once we know their role for certain.
    if (role === 'seller' && onBuyerArea) return redirectTo(SELLER_PREFIX)
    if (role === 'buyer' && onSellerArea) return redirectTo(BUYER_PREFIX)
  }

  return supabaseResponse
}
