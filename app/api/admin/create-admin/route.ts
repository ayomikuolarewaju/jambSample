// app/api/admin/create-admin/route.ts
// Creates Supabase Auth user + admins table row in one step.
// Uses service role key to bypass email confirmation.
// Protected by ADMIN_SETUP_KEY env var.

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { fullName, email, password, setupKey } = await request.json() as {
      fullName: string; email: string; password: string; setupKey: string
    }

    // ── Guard: setup key ───────────────────────────────────────────────
    const validKey = process.env.ADMIN_SETUP_KEY
    if (!validKey) return NextResponse.json(
      { error: 'ADMIN_SETUP_KEY is not set in .env.local' }, { status: 500 }
    )
    if (setupKey !== validKey) return NextResponse.json(
      { error: 'Incorrect setup key.' }, { status: 401 }
    )

    // ── Guard: inputs ──────────────────────────────────────────────────
    if (!fullName?.trim() || !email?.trim() || !password?.trim())
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    if (password.length < 8)
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })

    // ── Service role client (server only — bypasses RLS + email confirm) ─
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY is not set in .env.local. Get it from Supabase → Settings → API.' },
      { status: 500 }
    )

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const cleanEmail = email.toLowerCase().trim()

    // ── Try to create Auth user ────────────────────────────────────────
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email:         cleanEmail,
      password,
      email_confirm: true,        // confirmed immediately — no email needed
      user_metadata: {
        full_name: fullName.trim(),
        is_admin:  true,          // tells our DB trigger to skip profile creation
      },
    })

    // If user already exists in Auth, look them up instead
    let authUserId: string | null = null

    if (createError) {
      if (
        createError.message.includes('already been registered') ||
        createError.message.includes('already exists') ||
        createError.message.includes('duplicate')
      ) {
        // User already in Auth — find their ID
        const { data: list } = await admin.auth.admin.listUsers()
        const existing = list?.users?.find(u => u.email === cleanEmail)
        if (existing) {
          authUserId = existing.id
          // Update their password to the new one
          await admin.auth.admin.updateUserById(existing.id, {
            password,
            email_confirm: true,
          })
        } else {
          return NextResponse.json(
            { error: 'User exists in Auth but could not be found. Check Supabase → Authentication → Users.' },
            { status: 400 }
          )
        }
      } else {
        // Real unexpected error
        return NextResponse.json(
          { error: `Could not create auth user: ${createError.message}` },
          { status: 400 }
        )
      }
    } else {
      authUserId = created.user?.id || null
    }

    // ── Upsert into admins table ───────────────────────────────────────
    const { error: dbError } = await admin
      .from('admins')
      .upsert(
        {
          email:     cleanEmail,
          full_name: fullName.trim(),
          role:      'super_admin',
          is_active: true,
        },
        { onConflict: 'email' }
      )

    if (dbError) return NextResponse.json(
      { error: `Admin record error: ${dbError.message}` },
      { status: 500 }
    )

    return NextResponse.json({
      success: true,
      message: `Admin created for ${cleanEmail}. Sign in at /admin/login.`,
    })

  } catch (err: any) {
    console.error('[create-admin]', err)
    return NextResponse.json(
      { error: err?.message || 'Unexpected server error.' },
      { status: 500 }
    )
  }
}
