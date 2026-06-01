'use client'
// app/guest-exam/page.tsx
// Full 30-minute timed CBT exam for invite-link (guest) students.
// No auth needed — session tracked by guest_sessions.id in URL param.

import { useEffect, useState, useRef, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Flag, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'
import type { Question, Subject } from '@/types/database'

const EXAM_DURATION = 30 * 60
const OPTIONS = ['A','B','C','D'] as const

interface SubjectWithQuestions extends Subject { questions: Question[] }

function GuestExamContent() {
  const router  = useRouter()
  const params  = useSearchParams()
  const sessionId = params.get('session') || ''

  const supabase = createClient()

  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState('')
  const [firstName,     setFirstName]     = useState('')
  const [subjects,      setSubjects]      = useState<SubjectWithQuestions[]>([])
  const [subjectIdx,    setSubjectIdx]    = useState(0)
  const [questionIdx,   setQuestionIdx]   = useState(0)
  const [answers,       setAnswers]       = useState<Record<string, string | null>>({})
  const [flagged,       setFlagged]       = useState<Record<string, boolean>>({})
  const [timeLeft,      setTimeLeft]      = useState(EXAM_DURATION)
  const [showConfirm,   setShowConfirm]   = useState(false)
  const [submitting,    setSubmitting]    = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)

  const timerRef         = useRef<NodeJS.Timeout | null>(null)
  const autoSubmittedRef = useRef(false)

  // ── Load session + questions ──────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) { setError('No session ID found.'); setLoading(false); return }
    load()
  }, [sessionId])

  const load = async () => {
    const { data: session } = await supabase
      .from('guest_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (!session) { setError('Session not found. Please use your email link again.'); setLoading(false); return }
    if (session.submitted_at) { router.push(`/guest-results?session=${sessionId}`); return }

    setFirstName(session.first_name || 'Candidate')
    if (session.time_remaining) setTimeLeft(session.time_remaining)

    // Load subjects in registration order
    const { data: subjectsData } = await supabase
      .from('subjects').select('*').in('id', session.subject_ids)

    if (!subjectsData) { setError('Failed to load subjects.'); setLoading(false); return }

    const ordered = session.subject_ids
      .map((id: string) => subjectsData.find((s: Subject) => s.id === id))
      .filter(Boolean)

    const withQs: SubjectWithQuestions[] = await Promise.all(
      ordered.map(async (sub: Subject) => {
        const { data: qs } = await supabase
          .from('questions').select('*').eq('subject_id', sub.id).limit(10)
        return { ...sub, questions: qs || [] }
      })
    )
    setSubjects(withQs)

    // Load any existing answers (resume support)
    const { data: existingAnswers } = await supabase
      .from('guest_answers').select('*').eq('session_id', sessionId)

    if (existingAnswers?.length) {
      const ans: Record<string, string | null> = {}
      const flg: Record<string, boolean> = {}
      existingAnswers.forEach(a => {
        ans[a.question_id] = a.selected_option
        flg[a.question_id] = a.is_flagged
      })
      setAnswers(ans); setFlagged(flg)
    }

    setLoading(false)
  }

  // ── Timer ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (loading || showInstructions) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1 && !autoSubmittedRef.current) {
          autoSubmittedRef.current = true
          submitExam(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [loading, showInstructions])

  // ── Save answer via API route ─────────────────────────────────────────
  const saveAnswer = useCallback(async (
    questionId: string, subjectId: string,
    option: string | null, isFlagged: boolean
  ) => {
    await fetch('/api/guest-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, questionId, subjectId, selectedOption: option, isFlagged }),
    })
  }, [sessionId])

  const selectOption = async (opt: string) => {
    const q = subjects[subjectIdx]?.questions[questionIdx]
    if (!q) return
    setAnswers(prev => ({ ...prev, [q.id]: opt }))
    await saveAnswer(q.id, subjects[subjectIdx].id, opt, flagged[q.id] || false)
  }

  const toggleFlag = async () => {
    const q = subjects[subjectIdx]?.questions[questionIdx]
    if (!q) return
    const newFlagged = !flagged[q.id]
    setFlagged(prev => ({ ...prev, [q.id]: newFlagged }))
    await saveAnswer(q.id, subjects[subjectIdx].id, answers[q.id] || null, newFlagged)
  }

  // ── Submit via API route ──────────────────────────────────────────────
  const submitExam = async (auto = false) => {
    if (submitting) return
    setSubmitting(true)
    if (timerRef.current) clearInterval(timerRef.current)

    const res = await fetch('/api/guest-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, timeRemaining: timeLeft, isAutoSubmit: auto }),
    })

    if (res.ok) {
      router.push(`/guest-results?session=${sessionId}`)
    } else {
      setSubmitting(false)
      setShowConfirm(false)
      setError('Submission failed. Please try again.')
    }
  }

  const fmt = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  const urgent          = timeLeft <= 300
  const currentSubject  = subjects[subjectIdx]
  const currentQuestion = currentSubject?.questions[questionIdx]
  const totalAnswered   = Object.keys(answers).filter(k => answers[k] !== null).length
  const totalQuestions  = subjects.reduce((a, s) => a + s.questions.length, 0)

  // ── Loading / Error ───────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-gray-500">Loading your exam…</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-md text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3"/>
        <h2 className="font-bold text-gray-800 mb-2">Error</h2>
        <p className="text-gray-500 text-sm mb-4">{error}</p>
        <button onClick={() => router.back()} className="btn-secondary">← Go Back</button>
      </div>
    </div>
  )

  // ── Instructions screen ───────────────────────────────────────────────
  if (showInstructions) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="card max-w-xl w-full animate-slide-up">
        <div className="text-center mb-6">
          <span className="text-5xl">📋</span>
          <h2 className="text-xl font-black text-green-800 mt-3">
            Ready, {firstName}?
          </h2>
          <p className="text-gray-500 text-sm mt-1">Read these instructions before you begin</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-5">
          <p className="font-semibold text-yellow-800 mb-3">⚠ Important</p>
          <ul className="text-sm text-yellow-700 space-y-2 list-disc pl-4">
            <li>You have <strong>30 minutes</strong> to complete all questions.</li>
            <li><strong>{totalQuestions} questions</strong> across <strong>{subjects.length} subjects</strong>.</li>
            <li>Navigate freely between subjects using the tabs at the top.</li>
            <li>Flag questions to revisit before submitting.</li>
            <li>The exam <strong>auto-submits</strong> when time expires.</li>
            <li>Do NOT refresh or close this tab during the exam.</li>
            <li>Each correct answer = <strong>2.5 marks</strong>. No negative marking.</li>
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <p className="font-semibold text-green-800 text-sm mb-2">Your subjects:</p>
          <div className="flex flex-wrap gap-2">
            {subjects.map((s, i) => (
              <span key={s.id}
                className="bg-green-100 text-green-800 rounded-full px-3 py-0.5 text-xs font-semibold">
                {i + 1}. {s.name}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowInstructions(false)}
          className="btn-danger w-full text-base py-4 font-bold">
          🚀 Start Exam — Timer Begins Now
        </button>
      </div>
    </div>
  )

  // ── Main exam interface ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Sticky header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">

          <div className="flex items-center gap-2">
            <span className="text-xl">🇳🇬</span>
            <span className="font-black text-green-800 text-sm hidden sm:block">JAMB CBT</span>
            <span className="text-gray-200 hidden sm:block">|</span>
            <span className="text-xs text-gray-500">{firstName}</span>
            <span className="text-gray-200">|</span>
            <span className="text-xs text-gray-500">{totalAnswered}/{totalQuestions} answered</span>
          </div>

          {/* Timer */}
          <div className={clsx(
            'flex items-center gap-2 px-4 py-1.5 rounded-full border-2 font-mono transition-all',
            urgent
              ? 'border-red-500 bg-red-50 text-red-600'
              : 'border-green-600 bg-green-50 text-green-700'
          )}>
            <span className="text-xs">{urgent ? '⚠' : '⏱'}</span>
            <span className={clsx('text-xl font-black', urgent && 'animate-pulse')}>
              {fmt(timeLeft)}
            </span>
          </div>

          <button onClick={() => setShowConfirm(true)} className="btn-danger text-xs py-1.5 px-3">
            Submit
          </button>
        </div>

        {/* Subject tabs */}
        <div className="max-w-6xl mx-auto px-4 pb-2 flex gap-2 overflow-x-auto">
          {subjects.map((sub, i) => {
            const answered = sub.questions.filter(q => answers[q.id] != null).length
            return (
              <button key={sub.id}
                onClick={() => { setSubjectIdx(i); setQuestionIdx(0) }}
                className={clsx(
                  'px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap border-2 transition-all',
                  i === subjectIdx
                    ? 'border-green-700 bg-green-700 text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'
                )}>
                {sub.name.split(' ')[0]} ({answered}/10)
              </button>
            )
          })}
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6
                      grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-6">

        {/* Question card */}
        {currentQuestion && (
          <div className="card animate-fade-in">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                  {currentSubject.name} · Q{questionIdx + 1} of {currentSubject.questions.length}
                </p>
                <div className="flex gap-2 mt-1">
                  {answers[currentQuestion.id] != null && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Answered
                    </span>
                  )}
                  {flagged[currentQuestion.id] && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      🚩 Flagged
                    </span>
                  )}
                </div>
              </div>
              <button onClick={toggleFlag}
                className={clsx(
                  'flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl border-2 transition-all',
                  flagged[currentQuestion.id]
                    ? 'border-red-400 bg-red-50 text-red-600'
                    : 'border-gray-200 text-gray-500 hover:border-red-300'
                )}>
                <Flag size={12}/>
                {flagged[currentQuestion.id] ? 'Unflag' : 'Flag'}
              </button>
            </div>

            <p className="text-gray-800 font-medium text-base leading-relaxed mb-6">
              {questionIdx + 1}. {currentQuestion.question_text}
            </p>

            <div className="space-y-3">
              {OPTIONS.map((opt, i) => {
                const text = [
                  currentQuestion.option_a, currentQuestion.option_b,
                  currentQuestion.option_c, currentQuestion.option_d
                ][i]
                const sel = answers[currentQuestion.id] === opt
                return (
                  <button key={opt} onClick={() => selectOption(opt)}
                    className={clsx(
                      'w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all',
                      sel
                        ? 'border-green-700 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/40'
                    )}>
                    <div className={clsx(
                      'w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 border-2',
                      sel
                        ? 'bg-green-700 border-green-700 text-white'
                        : 'border-gray-300 text-gray-500'
                    )}>
                      {opt}
                    </div>
                    <span className={clsx('text-sm', sel ? 'font-semibold text-green-800' : 'text-gray-700')}>
                      {text}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Prev / Next */}
            <div className="flex justify-between mt-6">
              <button
                onClick={() => {
                  if (questionIdx > 0) setQuestionIdx(q => q - 1)
                  else if (subjectIdx > 0) { setSubjectIdx(s => s - 1); setQuestionIdx(9) }
                }}
                disabled={subjectIdx === 0 && questionIdx === 0}
                className="btn-secondary flex items-center gap-1 text-sm py-2 px-4">
                <ChevronLeft size={16}/>Prev
              </button>
              <button
                onClick={() => {
                  if (questionIdx < currentSubject.questions.length - 1)
                    setQuestionIdx(q => q + 1)
                  else if (subjectIdx < subjects.length - 1) {
                    setSubjectIdx(s => s + 1); setQuestionIdx(0)
                  }
                }}
                disabled={subjectIdx === subjects.length - 1 && questionIdx === currentSubject.questions.length - 1}
                className="btn-primary flex items-center gap-1 text-sm py-2 px-4">
                Next<ChevronRight size={16}/>
              </button>
            </div>
          </div>
        )}

        {/* Navigator sidebar */}
        <div className="card h-fit sticky top-28">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Navigator</p>
          <div className="grid grid-cols-5 gap-1 mb-4">
            {currentSubject?.questions.map((q, i) => {
              const isAns = answers[q.id] != null
              const isFl  = flagged[q.id]
              const isCur = i === questionIdx
              return (
                <button key={q.id} onClick={() => setQuestionIdx(i)}
                  className={clsx(
                    'aspect-square rounded-lg text-xs font-bold border-2 transition-all',
                    isCur ? 'bg-green-700 border-green-700 text-white' :
                    isFl  ? 'bg-red-50 border-red-400 text-red-600' :
                    isAns ? 'bg-green-50 border-green-300 text-green-700' :
                            'bg-white border-gray-200 text-gray-500 hover:border-green-300'
                  )}>
                  {i + 1}
                </button>
              )
            })}
          </div>

          <div className="space-y-1 text-[10px] text-gray-500 mb-4">
            {[
              ['bg-green-700', 'Current'],
              ['bg-green-50 border-green-300', 'Answered'],
              ['bg-red-50 border-red-400', 'Flagged'],
              ['bg-white border-gray-200', 'Unanswered'],
            ].map(([cls, label]) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={clsx('w-3 h-3 rounded border', cls)}/><span>{label}</span>
              </div>
            ))}
          </div>

          {/* Per-subject progress */}
          <div className="border-t border-gray-100 pt-3 space-y-2">
            {subjects.map((sub, i) => {
              const ans = sub.questions.filter(q => answers[q.id] != null).length
              return (
                <div key={sub.id}>
                  <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                    <span className="font-medium truncate">{sub.name.split(' ')[0]}</span>
                    <span className={ans === 10 ? 'text-green-700 font-bold' : ''}>{ans}/10</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-600 rounded-full transition-all"
                      style={{ width: `${(ans / 10) * 100}%` }}/>
                  </div>
                </div>
              )
            })}
          </div>

          <button onClick={() => setShowConfirm(true)} className="btn-danger w-full mt-4 text-sm py-2">
            Submit Exam
          </button>
        </div>
      </div>

      {/* Submit confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-sm w-full text-center animate-slide-up">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-3"/>
            <h3 className="font-black text-gray-800 text-lg mb-2">Submit Examination?</h3>
            <p className="text-gray-500 text-sm mb-5">
              You have answered <strong>{totalAnswered}</strong> of{' '}
              <strong>{totalQuestions}</strong> questions.
              Unanswered questions will be marked wrong. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="btn-secondary flex-1 text-sm py-2">
                Continue
              </button>
              <button onClick={() => submitExam(false)} disabled={submitting}
                className="btn-danger flex-1 text-sm py-2">
                {submitting ? 'Submitting…' : 'Yes, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function GuestExamPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin"/>
      </div>
    }>
      <GuestExamContent/>
    </Suspense>
  )
}
