import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ExamClient from './exam-client'
import type { Question, Subject } from '@/types/database'

interface SubjectWithQuestions extends Subject {
  questions: Question[]
}

export default async function ExamPage() {
  const supabase = await createClient()

  // All async data fetching here
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: reg } = await supabase
    .from('exam_registrations')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'in_progress')
    .order('registered_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: regPending } = reg
    ? { data: null }
    : await supabase
        .from('exam_registrations')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'registered')
        .order('registered_at', { ascending: false })
        .limit(1)
        .maybeSingle()

  const activeReg = reg || regPending
  if (!activeReg) redirect('/dashboard')
  const activeRegRow = activeReg as any

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const profileRow = profile as any

  const { data: existing } = await supabase
    .from('exam_sessions')
    .select('*')
    .eq('registration_id', activeRegRow.id)
    .maybeSingle()

  const existingRow = existing as any
  if (existingRow?.submitted_at) redirect(`/results?session=${existingRow.id}`)

  let sid = existingRow?.id
  if (!sid) {
    const { data: newSess } = await (supabase.from('exam_sessions') as any)
      .insert({ user_id: user.id, registration_id: activeRegRow.id })
      .select()
      .single()
    sid = newSess?.id
    await (supabase.from('exam_registrations') as any)
      .update({ status: 'in_progress', exam_started_at: new Date().toISOString() })
      .eq('id', activeRegRow.id)
  }

  const { data: subjectsData } = await supabase
    .from('subjects')
    .select('*')
    .in('id', activeRegRow.subject_ids)

  const ordered = activeRegRow.subject_ids
    .map((id: string) => subjectsData?.find((s: Subject) => s.id === id))
    .filter(Boolean)

  const withQs: SubjectWithQuestions[] = await Promise.all(
    (ordered as Subject[]).map(async (sub: Subject) => {
      const { data: qs } = await supabase
        .from('questions')
        .select('*')
        .eq('subject_id', sub.id)
        .eq('is_active', true)
        .limit(10)
      return { ...sub, questions: qs || [] }
    })
  )

  let savedAnswers: any[] = []
  if (existingRow) {
    const { data } = await supabase
      .from('exam_answers')
      .select('*')
      .eq('session_id', existingRow.id)
    savedAnswers = data || []
  }

  const firstName = profileRow?.full_name?.split(' ').pop() || 'Candidate'

  // Pass data to Client Component
  return (
    <ExamClient
      userId={user.id}
      registrationId={activeRegRow.id}
      sessionId={sid || ''}
      subjects={withQs}
      savedAnswers={savedAnswers}
      firstName={firstName}
      initialTimeLeft={existingRow?.time_remaining}
    />
  )
}