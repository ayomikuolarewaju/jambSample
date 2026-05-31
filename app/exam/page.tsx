'use client'
// app/exam/page.tsx

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/clients'
import { useRouter } from 'next/navigation'
import { Flag, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'
import type { Question, Subject, ExamRegistration, SelectedOption } from '../../type/database'

const EXAM_DURATION = 30 * 60 // 30 minutes
const OPTIONS: SelectedOption[] = ['A', 'B', 'C', 'D']

interface SubjectWithQuestions extends Subject {
  questions: Question[]
}

export default async function ExamPage() {
  const router = useRouter()
  const supabase = await createClient()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState('')
  const [registration, setRegistration] = useState<ExamRegistration | null>(null)
  const [sessionId, setSessionId] = useState('')
  const [subjects, setSubjects] = useState<SubjectWithQuestions[]>([])

  const [subjectIdx, setSubjectIdx] = useState(0)
  const [questionIdx, setQuestionIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, SelectedOption>>({})   // key: question_id
  const [flagged, setFlagged] = useState<Record<string, boolean>>({})
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const autoSubmittedRef = useRef(false)

  // ── Load data ──
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)

      const { data: reg } = await supabase
        .from('exam_registrations')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!reg) { router.push('/dashboard'); return }
      setRegistration(reg)

      // Check if already submitted
      const { data: existingSession } = await supabase
        .from('exam_sessions')
        .select('*')
        .eq('registration_id', reg.id)
        .single()

      if (existingSession?.submitted_at) {
        router.push('/results')
        return
      }

      // Resume or create session
      let sid = existingSession?.id
      if (!sid) {
        const { data: newSession } = await supabase
          .from('exam_sessions')
          .insert({ user_id: user.id, registration_id: reg.id })
          .select()
          .single()
        sid = newSession?.id
        // Update registration status
        await supabase.from('exam_registrations')
          .update({ status: 'in_progress', exam_started_at: new Date().toISOString() })
          .eq('id', reg.id)
      } else if (existingSession?.time_remaining) {
        setTimeLeft(existingSession.time_remaining)
      }

      setSessionId(sid || '')

      // Load questions for all 4 subjects
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('*')
        .in('id', reg.subject_ids)

      if (!subjectsData) { setError('Failed to load subjects'); setLoading(false); return }

      // Reorder to match registration order
      const ordered = reg.subject_ids
        .map((id: string) => subjectsData.find(s => s.id === id))
        .filter(Boolean)

      // Load 10 questions per subject
      const withQuestions: SubjectWithQuestions[] = await Promise.all(
        ordered.map(async (sub: Subject) => {
          const { data: qs } = await supabase
            .from('questions')
            .select('*')
            .eq('subject_id', sub.id)
            .limit(10)
          return { ...sub, questions: qs || [] }
        })
      )

      setSubjects(withQuestions)

      // Load existing answers if resuming
      if (existingSession) {
        const { data: existingAnswers } = await supabase
          .from('exam_answers')
          .select('*')
          .eq('session_id', existingSession.id)

        if (existingAnswers) {
          const ans: Record<string, SelectedOption> = {}
          const flag: Record<string, boolean> = {}
          existingAnswers.forEach(a => {
            ans[a.question_id] = a.selected_option
            flag[a.question_id] = a.is_flagged
          })
          setAnswers(ans)
          setFlagged(flag)
        }
      }

      setLoading(false)
    }
    load()
  }, [])

  // ── Timer ──
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

  const saveAnswer = useCallback(async (questionId: string, option: SelectedOption, isFlagged: boolean) => {
    if (!sessionId || !userId) return
    const currentSubject = subjects[subjectIdx]
    await supabase.from('exam_answers').upsert({
      session_id: sessionId,
      user_id: userId,
      question_id: questionId,
      subject_id: currentSubject.id,
      selected_option: option,
      is_correct: null, // will be computed on submit
      is_flagged: isFlagged,
    }, { onConflict: 'session_id,question_id' })
  }, [sessionId, userId, subjects, subjectIdx])

  const selectOption = async (option: SelectedOption) => {
    const q = subjects[subjectIdx]?.questions[questionIdx]
    if (!q) return
    setAnswers(prev => ({ ...prev, [q.id]: option }))
    await saveAnswer(q.id, option, flagged[q.id] || false)
  }

  const toggleFlag = async () => {
    const q = subjects[subjectIdx]?.questions[questionIdx]
    if (!q) return
    const newFlagged = !flagged[q.id]
    setFlagged(prev => ({ ...prev, [q.id]: newFlagged }))
    await saveAnswer(q.id, answers[q.id] || null, newFlagged)
  }

  const submitExam = async (auto = false) => {
    if (submitting) return
    setSubmitting(true)
    if (timerRef.current) clearInterval(timerRef.current)

    // Compute scores per subject
    let totalCorrect = 0
    const subjectResults = subjects.map(sub => {
      let correct = 0
      sub.questions.forEach(q => {
        const selected = answers[q.id]
        const isCorrect = selected === q.correct_option
        if (isCorrect) correct++
      })
      totalCorrect += correct
      return {
        session_id: sessionId,
        user_id: userId,
        subject_id: sub.id,
        questions_total: sub.questions.length,
        correct_count: correct,
        score: (correct / sub.questions.length) * 100,
        max_score: 100,
      }
    })

    const totalScore = (totalCorrect / (subjects.length * 10)) * 400

    // Update is_correct on all answers
    const allQuestions = subjects.flatMap(s => s.questions)
    await Promise.all(allQuestions.map(q =>
      supabase.from('exam_answers').update({
        is_correct: answers[q.id] === q.correct_option,
      }).eq('session_id', sessionId).eq('question_id', q.id)
    ))

    // Insert subject results
    await supabase.from('subject_results').insert(subjectResults)

    // Update session
    await supabase.from('exam_sessions').update({
      submitted_at: new Date().toISOString(),
      time_remaining: timeLeft,
      is_auto_submitted: auto,
      total_score: totalScore,
    }).eq('id', sessionId)

    // Update registration
    await supabase.from('exam_registrations').update({
      status: 'completed',
      exam_ended_at: new Date().toISOString(),
    }).eq('id', registration?.id)

    router.push('/results')
  }

  // ── Format time ──
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  const urgent = timeLeft <= 300
  const currentSubject = subjects[subjectIdx]
  const currentQuestion = currentSubject?.questions[questionIdx]
  const totalAnswered = Object.keys(answers).length
  const totalQuestions = subjects.reduce((acc, s) => acc + s.questions.length, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your examination…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="font-bold text-gray-800 mb-2">Error Loading Exam</h2>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <button onClick={() => router.push('/dashboard')} className="btn-secondary">← Back to Dashboard</button>
        </div>
      </div>
    )
  }

  // ── Instructions screen ──
  if (showInstructions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card max-w-xl w-full animate-slide-up">
          <div className="text-center mb-6">
            <span className="text-4xl">📋</span>
            <h2 className="text-xl font-black text-green-800 mt-2">Examination Instructions</h2>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-5">
            <p className="font-semibold text-yellow-800 mb-2">⚠ Read carefully before you begin</p>
            <ul className="text-sm text-yellow-700 space-y-1.5 list-disc pl-4">
              <li>You have <strong>30 minutes</strong> to answer all questions.</li>
              <li>There are <strong>{totalQuestions} questions</strong> across <strong>{subjects.length} subjects</strong>.</li>
              <li>You can navigate freely between subjects and questions.</li>
              <li>Flag questions you want to revisit using the 🚩 button.</li>
              <li>The exam <strong>auto-submits</strong> when time expires.</li>
              <li>Do NOT refresh or close this tab.</li>
              <li>Each correct answer = <strong>2.5 marks</strong>. No negative marking.</li>
            </ul>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-sm">
            <p className="font-semibold text-green-800 mb-1">Your Subjects:</p>
            {subjects.map((s, i) => (
              <span key={s.id} className="inline-block bg-green-100 text-green-800 rounded-full px-3 py-0.5 text-xs font-medium mr-2 mb-1">
                {i + 1}. {s.name}
              </span>
            ))}
          </div>
          <button onClick={() => setShowInstructions(false)}
            className="btn-danger w-full text-base py-3">
            🚀 Begin Examination – Timer Starts Now
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🇳🇬</span>
            <span className="font-black text-green-800 text-sm">JAMB CBT</span>
            <span className="text-gray-300">|</span>
            <span className="text-xs text-gray-500">{totalAnswered}/{totalQuestions} answered</span>
          </div>

          {/* Timer */}
          <div className={clsx('flex items-center gap-2 px-4 py-1.5 rounded-full border-2 font-mono transition-colors',
            urgent ? 'border-red-500 bg-red-50 text-red-600' : 'border-green-600 bg-green-50 text-green-700')}>
            <span className="text-xs font-bold">{urgent ? '⚠' : '⏱'}</span>
            <span className={clsx('text-lg font-black', urgent && 'animate-pulse')}>{formatTime(timeLeft)}</span>
          </div>

          <button onClick={() => setShowConfirm(true)}
            className="btn-danger text-xs py-1.5 px-4">Submit Exam</button>
        </div>

        {/* Subject tabs */}
        <div className="max-w-6xl mx-auto px-4 pb-2 flex gap-2 overflow-x-auto">
          {subjects.map((sub, i) => {
            const answered = sub.questions.filter(q => answers[q.id] !== undefined).length
            return (
              <button key={sub.id} onClick={() => { setSubjectIdx(i); setQuestionIdx(0) }}
                className={clsx('px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap border-2 transition-all',
                  i === subjectIdx
                    ? 'border-green-700 bg-green-700 text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-green-300')}>
                {sub.name.split(' ')[0]}
                <span className="ml-1 opacity-70">({answered}/10)</span>
              </button>
            )
          })}
        </div>
      </header>

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-6">
        {/* Question panel */}
        {currentQuestion && (
          <div className="card animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                  {currentSubject.name} · Question {questionIdx + 1} of {currentSubject.questions.length}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {answers[currentQuestion.id] !== undefined && (
                    <span className="badge-green text-[10px]">✓ Answered</span>
                  )}
                  {flagged[currentQuestion.id] && (
                    <span className="badge-red text-[10px]">🚩 Flagged</span>
                  )}
                </div>
              </div>
              <button onClick={toggleFlag}
                className={clsx('flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border-2 transition-all',
                  flagged[currentQuestion.id]
                    ? 'border-red-400 bg-red-50 text-red-600'
                    : 'border-gray-200 text-gray-500 hover:border-red-300')}>
                <Flag size={13} />
                {flagged[currentQuestion.id] ? 'Unflag' : 'Flag'}
              </button>
            </div>

            <p className="text-gray-800 font-medium text-base leading-relaxed mb-6">
              {questionIdx + 1}. {currentQuestion.question_text}
            </p>

            <div className="space-y-3">
              {OPTIONS.map((opt, i) => {
                const text = [currentQuestion.option_a, currentQuestion.option_b,
                              currentQuestion.option_c, currentQuestion.option_d][i]
                const selected = answers[currentQuestion.id] === opt
                return (
                  <button key={opt} onClick={() => selectOption(opt)}
                    className={clsx(
                      'w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-150',
                      selected
                        ? 'border-green-700 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/40'
                    )}>
                    <div className={clsx(
                      'w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 border-2',
                      selected ? 'bg-green-700 border-green-700 text-white' : 'border-gray-300 text-gray-500'
                    )}>{opt}</div>
                    <span className={clsx('text-sm', selected ? 'font-semibold text-green-800' : 'text-gray-700')}>
                      {text}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Nav buttons */}
            <div className="flex justify-between mt-6">
              <button
                onClick={() => questionIdx > 0 ? setQuestionIdx(q => q - 1) : subjectIdx > 0 && (setSubjectIdx(s => s - 1), setQuestionIdx(9))}
                disabled={subjectIdx === 0 && questionIdx === 0}
                className="btn-secondary flex items-center gap-1 text-sm py-2 px-4">
                <ChevronLeft size={16} /> Prev
              </button>
              <button
                onClick={() => {
                  if (questionIdx < currentSubject.questions.length - 1) setQuestionIdx(q => q + 1)
                  else if (subjectIdx < subjects.length - 1) { setSubjectIdx(s => s + 1); setQuestionIdx(0) }
                }}
                disabled={subjectIdx === subjects.length - 1 && questionIdx === currentSubject.questions.length - 1}
                className="btn-primary flex items-center gap-1 text-sm py-2 px-4">
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Question navigator sidebar */}
        <div className="card h-fit sticky top-28">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Navigator</p>
          <div className="grid grid-cols-5 gap-1.5 mb-4">
            {currentSubject?.questions.map((q, i) => {
              const isAnswered = answers[q.id] !== undefined
              const isFlagged = flagged[q.id]
              const isCurrent = i === questionIdx
              return (
                <button key={q.id} onClick={() => setQuestionIdx(i)}
                  className={clsx('aspect-square rounded-lg text-xs font-bold border-2 transition-all',
                    isCurrent ? 'bg-green-700 border-green-700 text-white' :
                    isFlagged ? 'bg-red-50 border-red-400 text-red-600' :
                    isAnswered ? 'bg-green-50 border-green-300 text-green-700' :
                    'bg-white border-gray-200 text-gray-500 hover:border-green-300'
                  )}>
                  {i + 1}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="space-y-1.5 text-[10px] text-gray-500">
            {[
              { cls: 'bg-green-700', label: 'Current' },
              { cls: 'bg-green-50 border-green-300', label: 'Answered' },
              { cls: 'bg-red-50 border-red-400', label: 'Flagged' },
              { cls: 'bg-white border-gray-200', label: 'Unanswered' },
            ].map(({ cls, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={clsx('w-3 h-3 rounded border', cls)} />
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* Per-subject answered count */}
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
            {subjects.map((sub, i) => {
              const ans = sub.questions.filter(q => answers[q.id] !== undefined).length
              return (
                <div key={sub.id}>
                  <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                    <span className="font-medium">{sub.name.split(' ')[0]}</span>
                    <span className={ans === 10 ? 'text-green-700 font-bold' : ''}>{ans}/10</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-600 rounded-full transition-all duration-300"
                      style={{ width: `${(ans / 10) * 100}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Submit confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-sm w-full text-center animate-slide-up">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <h3 className="font-black text-gray-800 text-lg mb-2">Submit Examination?</h3>
            <p className="text-gray-500 text-sm mb-4">
              You have answered <strong>{totalAnswered}</strong> out of <strong>{totalQuestions}</strong> questions.
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
