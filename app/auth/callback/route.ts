// app/auth/callback/route.ts
// Route Handlers must create their OWN response and attach cookies to it.
// Using the shared server.ts client here will fail because cookies() is
// read-only outside of Server Actions — session tokens never get saved.

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const code      = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type      = searchParams.get('type') as 'email' | 'recovery' | 'invite' | null
  const next      = searchParams.get('next') ?? '/dashboard'

  const errorUrl = `${origin}/auth/login?error=auth_callback_failed`

  // Build the response we will eventually return so we can attach cookies to it
  const response = NextResponse.redirect(`${origin}${next}`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Write cookies onto BOTH the request (for this handler) and the
          // response (so the browser receives them)
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  try {
    // ── Flow 1: PKCE code exchange (email link / OAuth) ──────────────────
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        console.error('[callback] exchangeCodeForSession:', error.message)
        return NextResponse.redirect(errorUrl)
      }
      // Session cookies are now on `response` — redirect to dashboard
      return response
    }

    // ── Flow 2: token_hash (email confirmation) ───────────────────────────
    if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      if (error) {
        console.error('[callback] verifyOtp:', error.message)
        return NextResponse.redirect(errorUrl)
      }
      // Email confirmed — send to login with success message
      const confirmedResponse = NextResponse.redirect(
        `${origin}/auth/login?message=confirmed`
      )
      // Copy any cookies set during verifyOtp onto this new response
      response.cookies.getAll().forEach(({ name, value, ...opts }) => {
        confirmedResponse.cookies.set(name, value, opts as any)
      })
      return confirmedResponse
    }
  } catch (err) {
    console.error('[callback] unexpected error:', err)
  }

  // No recognised params
  return NextResponse.redirect(errorUrl)
}
