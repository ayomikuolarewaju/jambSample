// app/api/send-invite/route.ts
// 1. Saves lead (name + email) to invite_leads with a unique token
// 2. Emails the student a link to /access?token=xxx
// 3. /access lets them pick combination and go straight to exam — no account needed

import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { transporter } from '@/lib/email/mailer'
import { inviteEmailTemplate } from '@/lib/email/templates'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { email, firstName } = await request.json() as { email?: string; firstName?: string }

    if (!email || !email.includes('@'))
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })

    const name    = (firstName || 'Candidate').trim()
    const appUrl  = process.env.NODE_ENV === 'production'
      ? 'https://yourdomain.com'
      : 'http://localhost:3000'
    const token   = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Save lead + token
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { cookies: { getAll: async() => (await cookieStore).getAll(), setAll: () => {} } }
    )

    const { error: dbError } = await supabase
      .from('invite_leads')
      .upsert(
        {
          email:        email.toLowerCase().trim(),
          first_name:   name,
          access_token: token,
          expires_at:   expires.toISOString(),
          invited_at:   new Date().toISOString(),
          registered:   false,
        },
        { onConflict: 'email' }
      )

    if (dbError) {
      console.error('[send-invite] DB:', dbError.message)
      return NextResponse.json({ error: 'Could not save your details. Please try again.' }, { status: 500 })
    }

    // Build direct access link — goes to combination picker, then straight to exam
    const accessLink = `${appUrl}/access?token=${token}`

    // Send email
    const { subject, html, text } = inviteEmailTemplate({ firstName: name, accessLink })
    await transporter.sendMail({
      from: `"JAMB CBT Portal" <${process.env.GMAIL_USER}>`,
      to:   email, subject, html, text,
    })

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('[send-invite]', err)
    if (err?.code === 'EAUTH')
      return NextResponse.json({ error: 'Gmail auth failed. Check GMAIL_USER and GMAIL_APP_PASSWORD in .env.local.' }, { status: 500 })
    return NextResponse.json({ error: 'Failed to send email. Please try again.' }, { status: 500 })
  }
}
