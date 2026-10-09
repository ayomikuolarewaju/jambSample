import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl
  const redirectWithCookies = (url: URL) => {
    const redirectResponse = NextResponse.redirect(url)
    response.cookies.getAll().forEach(cookie => redirectResponse.cookies.set(cookie))
    return redirectResponse
  }

  // ── 1. Fully public routes — no checks needed ──────────────────────────
  const publicPrefixes = [
    '/access',
    '/guest-exam',
    '/guest-results',
    '/invite',
    '/api/',
    '/admin',   // admin login is always public
    '/_next',
  ]
  if (publicPrefixes.some(p => pathname.startsWith(p))) return response

  // ── 2. Admin protected routes ──────────────────────────────────────────
  // /admin/* (except /admin/login handled above)
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return redirectWithCookies(new URL('/admin/login', request.url))
    }
    // Let the page itself verify the admins table — don't block here
    return response
  }

  // ── 3. Candidate protected routes ──────────────────────────────────────
  const protectedRoutes = ['/dashboard', '/exam', '/results']
  if (!user && protectedRoutes.some(r => pathname.startsWith(r))) {
    return redirectWithCookies(new URL('/auth/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
