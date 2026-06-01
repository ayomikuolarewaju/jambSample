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

  // ── Fully public routes (no auth needed — guest exam flow lives here) ──
  // /access, /guest-exam, /guest-results, /invite, /api/* are all public
  const publicPrefixes = ['/access', '/guest-exam', '/guest-results', '/invite', '/api/']
  if (publicPrefixes.some(p => pathname.startsWith(p))) return response

  // ── Protect registered-user routes ─────────────────────────────────────
  const protectedRoutes = ['/dashboard', '/exam', '/results']
  if (!user && protectedRoutes.some(r => pathname.startsWith(r)))
    return NextResponse.redirect(new URL('/auth/login', request.url))

  // ── Redirect logged-in users away from guest-only pages ────────────────
  const guestOnlyRoutes = ['/', '/auth/login', '/auth/register']
  if (user && guestOnlyRoutes.includes(pathname))
    return NextResponse.redirect(new URL('/dashboard', request.url))

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
