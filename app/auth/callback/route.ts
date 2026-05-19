// app/auth/callback/route.ts
// Handles two Supabase auth flows:
//   1. PKCE (OAuth / magic link)  → ?code=xxx
//   2. Email confirmation          → ?token_hash=xxx&type=email
import { createClient } from '../../lib/supabase/clients'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const code       = searchParams.get('code')
  const tokenHash  = searchParams.get('token_hash')
  const type       = searchParams.get('type') as 'email' | 'recovery' | 'invite' | null
  const next       = searchParams.get('next') ?? '/dashboard'

  const redirectTo = `${origin}${next}`
  const errorUrl   = `${origin}/auth/login?error=auth_callback_failed`

  try {
    const supabase = createClient()

    // ── Flow 1: PKCE code exchange (OAuth, magic link) ──
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        console.error('[callback] exchangeCodeForSession error:', error.message)
        return NextResponse.redirect(errorUrl)
      }
      // After PKCE, user is fully signed in — send straight to dashboard
      return NextResponse.redirect(redirectTo)
    }

    // ── Flow 2: token_hash (email confirmation, password reset) ──
    if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      if (error) {
        console.error('[callback] verifyOtp error:', error.message)
        return NextResponse.redirect(errorUrl)
      }
      // Email confirmed — redirect to login with a success message
      // (user still needs to sign in with password)
      return NextResponse.redirect(`${origin}/auth/login?message=confirmed`)
    }

  } catch (err) {
    console.error('[callback] unexpected error:', err)
  }

  // No recognised params — send back to login
  return NextResponse.redirect(errorUrl)
}