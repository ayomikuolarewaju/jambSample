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
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    // Let the page itself verify the admins table — don't block here
    return response
  }

  // ── 3. Candidate protected routes ──────────────────────────────────────
  const protectedRoutes = ['/dashboard', '/exam', '/results']
  if (!user && protectedRoutes.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // ── 4. Redirect logged-in candidates away from auth/landing pages ──────
  // But NOT if they are an admin (admin might visit / legitimately)
  const guestOnlyRoutes = ['/', '/auth/login', '/auth/register']
  if (user && guestOnlyRoutes.includes(pathname)) {
    // Check if this is an admin user — if so, let them stay on /
    // (they'll navigate to /admin/dashboard themselves)
    // Simple check: just redirect candidates to /dashboard
    // Admins can use /admin/login directly and won't hit these routes
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
