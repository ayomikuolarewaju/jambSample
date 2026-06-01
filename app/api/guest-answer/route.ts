// app/api/guest-answer/route.ts
// POST — upsert a single answer for a guest session
// Called every time the student selects an option (real-time save)
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { sessionId, questionId, subjectId, selectedOption, isFlagged } =
      await request.json() as {
        sessionId: string; questionId: string; subjectId: string
        selectedOption: string | null; isFlagged: boolean
      }

    if (!sessionId || !questionId)
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })

    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )

    await supabase.from('guest_answers').upsert(
      {
        session_id:      sessionId,
        question_id:     questionId,
        subject_id:      subjectId,
        selected_option: selectedOption,
        is_flagged:      isFlagged,
      },
      { onConflict: 'session_id,question_id' }
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[guest-answer]', err)
    return NextResponse.json({ error: 'Failed to save answer.' }, { status: 500 })
  }
}
