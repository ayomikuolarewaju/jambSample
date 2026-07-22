// app/api/guest-submit/route.ts
// POST — scores the exam, saves subject results, marks session submitted
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { sessionId, timeRemaining, isAutoSubmit } =
      await request.json() as {
        sessionId: string; timeRemaining: number; isAutoSubmit: boolean
      }

    if (!sessionId)
      return NextResponse.json({ error: 'Missing sessionId.' }, { status: 400 })

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )

    // Load session to get subject_ids
    const { data: session } = await supabase
      .from('guest_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (!session)
      return NextResponse.json({ error: 'Session not found.' }, { status: 404 })

    // Load all answers for this session
    const { data: answers } = await supabase
      .from('guest_answers')
      .select('question_id, selected_option, subject_id')
      .eq('session_id', sessionId)

    // Load all questions for these subjects
    const { data: questions } = await supabase
      .from('questions')
      .select('id, subject_id, correct_option')
      .in('subject_id', session.subject_ids)

    if (!questions)
      return NextResponse.json({ error: 'Could not load questions.' }, { status: 500 })

    // Score per subject
    let totalCorrect = 0
    const subjectResults = session.subject_ids.map((subId: string) => {
      const subQuestions = questions.filter(q => q.subject_id === subId)
      let correct = 0
      subQuestions.forEach(q => {
        const ans = answers?.find(a => a.question_id === q.id)
        if (ans?.selected_option === q.correct_option) correct++
      })
      totalCorrect += correct

      // Mark individual answers as correct/incorrect
      subQuestions.forEach(async q => {
        const ans = answers?.find(a => a.question_id === q.id)
        if (ans) {
          await supabase
            .from('guest_answers')
            .update({ is_correct: ans.selected_option === q.correct_option })
            .eq('session_id', sessionId)
            .eq('question_id', q.id)
        }
      })

      return {
        session_id:      sessionId,
        subject_id:      subId,
        questions_total: subQuestions.length,
        correct_count:   correct,
        score:           subQuestions.length > 0 ? (correct / subQuestions.length) * 100 : 0,
        max_score:       100,
      }
    })

    const totalScore = questions.length > 0
      ? (totalCorrect / questions.length) * 400
      : 0

    // Save subject results
    await supabase.from('guest_subject_results').insert(subjectResults)

    // Update session as submitted
    await supabase.from('guest_sessions').update({
      submitted_at:     new Date().toISOString(),
      time_remaining:   timeRemaining,
      is_auto_submitted: isAutoSubmit,
      total_score:      Math.round(totalScore * 100) / 100,
    }).eq('id', sessionId)

    return NextResponse.json({ success: true, sessionId })
  } catch (err) {
    console.error('[guest-submit]', err)
    return NextResponse.json({ error: 'Failed to submit exam.' }, { status: 500 })
  }
}
