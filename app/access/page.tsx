'use client'
// app/access/page.tsx
// Student lands here after clicking email link.
// No login, no registration — just:
//   1. Validate token
//   2. Pick subject combination
//   3. Go straight to exam

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, BookOpen, FlaskConical, Briefcase, Palette } from 'lucide-react'

import clsx from 'clsx'

const COURSE_GROUPS = {
  Science: {
    icon: '🔬',
    label: 'Science',
    desc: 'Medicine, Engineering, Computer Science',
    electives: ['Mathematics','Physics','Chemistry','Biology','Agricultural Science'],
  },
  Commercial: {
    icon: '💼',
    label: 'Commercial',
    desc: 'Accounting, Business Admin, Economics',
    electives: ['Mathematics','Economics','Commerce','Accounting','Government'],
  },
  Arts: {
    icon: '🎨',
    label: 'Arts',
    desc: 'Mass Communication, Linguistics, Law',
    electives: ['Literature in English','Government','Economics','Geography','Biology'],
  },
} as const
type CourseGroup = keyof typeof COURSE_GROUPS

type Stage = 'validating' | 'pick' | 'starting' | 'error'

function AccessContent() {
  const router = useRouter()
  const params = useSearchParams()
  const token  = params.get('token') || ''

  const [stage,       setStage]       = useState<Stage>('validating')
  const [errorMsg,    setErrorMsg]    = useState('')
  const [leadId,      setLeadId]      = useState('')
  const [firstName,   setFirstName]   = useState('')
  const [courseGroup, setCourseGroup] = useState<CourseGroup | ''>('')
  const [electives,   setElectives]   = useState<string[]>([])

  // ── Validate token on mount ───────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setErrorMsg('No access token found. Please use the link sent to your email.')
      setStage('error')
      return
    }
    validate()
  }, [token])

  const validate = async () => {
    const supabase = createClient()
    const { data: lead, error } = await supabase
      .from('invite_leads')
      .select('id, first_name, email, expires_at, token_used_at')
      .eq('access_token', token)
      .single()

    if (error || !lead) {
      setErrorMsg('This access link is invalid. Please request a new one from the invite page.')
      setStage('error')
      return
    }

    if (lead.expires_at && new Date(lead.expires_at) < new Date()) {
      setErrorMsg('This access link has expired (links are valid for 7 days). Please request a new one.')
      setStage('error')
      return
    }

    // Check if this lead already has a completed guest session
    const { data: existing } = await supabase
      .from('guest_sessions')
      .select('id, submitted_at')
      .eq('lead_id', lead.id)
      .maybeSingle()

    if (existing?.submitted_at) {
      // Already did the exam — go to their results
      router.push(`/guest-results?session=${existing.id}`)
      return
    }

    if (existing && !existing.submitted_at) {
      // In-progress session — resume exam
      router.push(`/guest-exam?session=${existing.id}`)
      return
    }

    setLeadId(lead.id)
    setFirstName(lead.first_name || 'Candidate')
    setStage('pick')
  }

  const toggleElective = (sub: string) => {
    setElectives(prev => {
      if (prev.includes(sub)) return prev.filter(s => s !== sub)
      if (prev.length >= 3) return prev
      return [...prev, sub]
    })
  }

  const canStart = courseGroup !== '' && electives.length === 3

  // ── Start exam — create guest session, fetch subject IDs, go ─────────
  const handleStart = async () => {
    if (!canStart) return
    setStage('starting')

    const supabase = createClient()

    // Get subject IDs for English + electives
    const subjectNames = ['English Language', ...electives]
    const { data: subjects, error: subErr } = await supabase
      .from('subjects')
      .select('id, name')
      .in('name', subjectNames)

    if (subErr || !subjects || subjects.length < 4) {
      setErrorMsg('Could not load subjects. Please try again.')
      setStage('pick')
      return
    }

    const subjectIds = subjectNames
      .map(n => subjects.find(s => s.name === n)?.id)
      .filter(Boolean) as string[]

    // Create guest session
    const { data: session, error: sessErr } = await supabase
      .from('guest_sessions')
      .insert({
        lead_id:      leadId,
        first_name:   firstName,
        course_group: courseGroup,
        subject_ids:  subjectIds,
      })
      .select()
      .single()

    if (sessErr || !session) {
      setErrorMsg('Could not start session. Please try again.')
      setStage('pick')
      return
    }

    // Mark token as used
    await supabase
      .from('invite_leads')
      .update({ token_used_at: new Date().toISOString() })
      .eq('id', leadId)

    // Go straight to exam
    router.push(`/guest-exam?session=${session.id}`)
  }

  // ── RENDER ────────────────────────────────────────────────────────────

  if (stage === 'validating') return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
      <div className="text-center animate-fade-in">
        <div className="w-14 h-14 border-4 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-5"/>
        <p className="text-gray-600 font-medium text-lg">Verifying your access link…</p>
        <p className="text-gray-400 text-sm mt-1">Just a moment</p>
      </div>
    </div>
  )

  if (stage === 'starting') return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
      <div className="text-center animate-fade-in">
        <div className="w-14 h-14 border-4 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-5"/>
        <p className="text-gray-600 font-medium text-lg">Setting up your exam…</p>
        <p className="text-gray-400 text-sm mt-1">Loading your questions</p>
      </div>
    </div>
  )

  if (stage === 'error') return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white p-4">
      <div className="card max-w-md w-full text-center animate-slide-up">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="font-black text-gray-800 text-xl mb-3">Access Link Problem</h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">{errorMsg}</p>
        <a href="/invite" className="btn-primary w-full block text-center text-base py-3">
          Request a New Link →
        </a>
      </div>
    </div>
  )

  // Stage: pick combination
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-10 px-4">
      <div className="max-w-xl mx-auto animate-slide-up">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🇳🇬</div>
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            <CheckCircle size={13}/> Access Verified
          </div>
          <h1 className="text-2xl font-black text-green-800">
            Welcome, {firstName}!
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Choose your subject combination below and start your exam immediately.
            <br/>
            <span className="text-green-700 font-semibold">No registration needed.</span>
          </p>
        </div>

        <div className="card space-y-6">

          {/* Course group */}
          <div>
            <h2 className="section-title">
              📚 Step 1 — Choose Your Course Group
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {(Object.entries(COURSE_GROUPS) as [CourseGroup, typeof COURSE_GROUPS[CourseGroup]][]).map(([group, info]) => (
                <button
                  type="button"
                  key={group}
                  onClick={() => { setCourseGroup(group); setElectives([]) }}
                  className={clsx(
                    'p-4 rounded-xl border-2 text-left transition-all',
                    courseGroup === group
                      ? 'border-green-700 bg-green-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-green-300'
                  )}>
                  <div className="text-3xl mb-2">{info.icon}</div>
                  <div className="font-bold text-sm text-gray-800">{info.label}</div>
                  <div className="text-[10px] text-gray-500 mt-1 leading-tight">{info.desc}</div>
                  {courseGroup === group && (
                    <div className="mt-2">
                      <CheckCircle className="text-green-700" size={14}/>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Compulsory subject */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-green-700 text-white">
            <CheckCircle size={16}/>
            <div>
              <p className="font-bold text-sm">English Language</p>
              <p className="text-green-200 text-xs">Compulsory for all candidates</p>
            </div>
          </div>

          {/* Electives */}
          {courseGroup ? (
            <div>
              <h2 className="section-title">
                ✏️ Step 2 — Pick 3 Elective Subjects
                <span className="ml-2 text-green-700 font-bold text-sm">
                  ({electives.length}/3)
                </span>
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {COURSE_GROUPS[courseGroup].electives.map(sub => {
                  const sel   = electives.includes(sub)
                  const maxed = electives.length >= 3 && !sel
                  return (
                    <button
                      type="button"
                      key={sub}
                      onClick={() => toggleElective(sub)}
                      disabled={maxed}
                      className={clsx(
                        'flex items-center gap-3 p-3 rounded-xl border-2 text-sm text-left transition-all',
                        sel
                          ? 'border-green-700 bg-green-50 text-green-800 font-semibold'
                          : maxed
                          ? 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50'
                          : 'border-gray-200 hover:border-green-300 text-gray-700'
                      )}>
                      <div className={clsx(
                        'w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center',
                        sel ? 'bg-green-700 border-green-700' : 'border-gray-300'
                      )}>
                        {sel && <span className="text-white text-[9px] font-bold">✓</span>}
                      </div>
                      {sub}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
              ☝ Select a course group above to choose your electives
            </div>
          )}

          {/* Combination summary */}
          {canStart && (
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <p className="text-sm font-bold text-green-800 mb-1">✅ Your Combination</p>
              <p className="text-sm text-green-700">
                English Language · {electives.join(' · ')}
              </p>
            </div>
          )}

          {/* Start button */}
          <button
            onClick={handleStart}
            disabled={!canStart}
            className="btn-danger w-full py-4 text-base font-bold">
            {canStart
              ? '🚀 Start 30-Minute Exam Now'
              : 'Select your combination above to begin'}
          </button>

          <p className="text-center text-xs text-gray-400">
            ⏱ Once you click Start, the 30-minute countdown begins immediately.
            Ensure you are in a quiet environment.
          </p>

        </div>
      </div>
    </div>
  )
}

export default function AccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin"/>
      </div>
    }>
      <AccessContent/>
    </Suspense>
  )
}
