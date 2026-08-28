'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Flag, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'
import type { Question, Subject } from '@/types/database'

const EXAM_DURATION = 30 * 60
const OPTIONS = ['A', 'B', 'C', 'D'] as const

interface SubjectWithQuestions extends Subject {
  questions: Question[]
}

interface ExamClientProps {
  userId: string
  registrationId: string
  sessionId: string
  subjects: SubjectWithQuestions[]
  savedAnswers: any[]
  firstName: string
  initialTimeLeft?: number
}

export default function ExamClient({
  userId,
  registrationId,
  sessionId,
  subjects: initialSubjects,
  savedAnswers,
  firstName,
  initialTimeLeft,
}: ExamClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const [subjects, setSubjects] = useState<SubjectWithQuestions[]>(initialSubjects)
  const [subjectIdx, setSubjectIdx] = useState(0)
  const [questionIdx, setQuestionIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | null>>({})
  const [flagged, setFlagged] = useState<Record<string, boolean>>({})
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft || EXAM_DURATION)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const autoSubmittedRef = useRef(false)

  // Initialize answers from saved data
  useEffect(() => {
    if (savedAnswers.length) {
      const ans: Record<string, string | null> = {}
      const flg: Record<string, boolean> = {}
      savedAnswers.forEach((a: any) => {
        ans[a.question_id] = a.selected_option
        flg[a.question_id] = a.is_flagged
      })
      setAnswers(ans)
      setFlagged(flg)
    }
  }, [])

  // Timer
  useEffect(() => {
    if (showInstructions) return
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1 && !autoSubmittedRef.current) {
          autoSubmittedRef.current = true
          submitExam(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [showInstructions])

  const saveAnswer = useCallback(
    async (
      questionId: string,
      subjectId: string,
      option: string | null,
      isFlagged: boolean
    ) => {
      await supabase.from('exam_answers').upsert(
        {
          session_id: sessionId,
          user_id: userId,
          question_id: questionId,
          subject_id: subjectId,
          selected_option: option,
          is_correct: null,
          is_flagged: isFlagged,
        },
        { onConflict: 'session_id,question_id' }
      )
    },
    [sessionId, userId, supabase]
  )

  const selectOption = async (opt: string) => {
    const q = subjects[subjectIdx]?.questions[questionIdx]
    if (!q) return
    setAnswers((prev) => ({ ...prev, [q.id]: opt }))
    await saveAnswer(q.id, subjects[subjectIdx].id, opt, flagged[q.id] || false)
  }

  const toggleFlag = async () => {
    const q = subjects[subjectIdx]?.questions[questionIdx]
    if (!q) return
    const newFlagged = !flagged[q.id]
    setFlagged((prev) => ({ ...prev, [q.id]: newFlagged }))
    await saveAnswer(q.id, subjects[subjectIdx].id, answers[q.id] || null, newFlagged)
  }

  const submitExam = async (auto = false) => {
    if (submitting) return
    setSubmitting(true)
    if (timerRef.current) clearInterval(timerRef.current)

    let totalCorrect = 0
    const subjectResults = subjects.map((sub) => {
      let correct = 0
      sub.questions.forEach((q) => {
        if (answers[q.id] === q.correct_option) correct++
      })
      totalCorrect += correct
      return {
        session_id: sessionId,
        user_id: userId,
        subject_id: sub.id,
        questions_total: sub.questions.length,
        correct_count: correct,
        score:
          sub.questions.length > 0 ? (correct / sub.questions.length) * 100 : 0,
        max_score: 100,
      }
    })

    const totalScore =
      subjects.length > 0 ? (totalCorrect / (subjects.length * 10)) * 400 : 0

    await Promise.all(
      subjects.flatMap((s) =>
        s.questions.map((q) =>
          supabase
            .from('exam_answers')
            .update({ is_correct: answers[q.id] === q.correct_option })
            .eq('session_id', sessionId)
            .eq('question_id', q.id)
        )
      )
    )
    await supabase.from('subject_results').insert(subjectResults)
    await supabase.from('exam_sessions').update({
      submitted_at: new Date().toISOString(),
      time_remaining: timeLeft,
      is_auto_submitted: auto,
      total_score: totalScore,
    })
    .eq('id', sessionId)
    await supabase
      .from('exam_registrations')
      .update({
        status: 'completed',
        exam_ended_at: new Date().toISOString(),
      })
      .eq('id', registrationId)

    router.push(`/results?session=${sessionId}`)
  }

  const fmt = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  const urgent = timeLeft <= 300
  const currentSubject = subjects[subjectIdx]
  const currentQuestion = currentSubject?.questions[questionIdx]
  const totalAnswered = Object.keys(answers).filter((k) => answers[k] !== null)
    .length
  const totalQuestions = subjects.reduce((a, s) => a + s.questions.length, 0)

  if (showInstructions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card max-w-xl w-full animate-slide-up">
          <div className="text-center mb-6">
            <span className="text-5xl">📋</span>
            <h2 className="text-xl font-black text-green-800 mt-3">
              Ready, {firstName}?
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Read these instructions before you begin
            </p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-5">
            <p className="font-semibold text-yellow-800 mb-3">⚠ Important</p>
            <ul className="text-sm text-yellow-700 space-y-2 list-disc pl-4">
              <li>
                You have <strong>30 minutes</strong> to complete all questions.
              </li>
              <li>
                <strong>{totalQuestions} questions</strong> across{' '}
                <strong>{subjects.length} subjects</strong>.
              </li>
              <li>Navigate freely between subjects and questions.</li>
              <li>Flag questions to revisit before submitting.</li>
              <li>
                The exam <strong>auto-submits</strong> when time expires.
              </li>
              <li>Do NOT refresh or close this tab.</li>
              <li>
                Each correct answer = <strong>2.5 marks</strong>. No negative
                marking.
              </li>
            </ul>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p className="font-semibold text-green-800 text-sm mb-2">
              Your subjects:
            </p>
            <div className="flex flex-wrap gap-2">
              {subjects.map((s, i) => (
                <span
                  key={s.id}
                  className="bg-green-100 text-green-800 rounded-full px-3 py-0.5 text-xs font-semibold"
                >
                  {i + 1}. {s.name}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={() => setShowInstructions(false)}
            className="btn-danger w-full text-base py-4 font-bold"
          >
            🚀 Start Exam — Timer Begins Now
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🇳🇬</span>
            <span className="font-black text-green-800 text-sm hidden sm:block">
              JAMB CBT
            </span>
            <span className="text-gray-200 hidden sm:block">|</span>
            <span className="text-xs text-gray-500">{firstName}</span>
            <span className="text-gray-200">|</span>
            <span className="text-xs text-gray-500">
              {totalAnswered}/{totalQuestions} answered
            </span>
          </div>
          <div
            className={clsx(
              'flex items-center gap-2 px-4 py-1.5 rounded-full border-2 font-mono transition-all',
              urgent
                ? 'border-red-500 bg-red-50 text-red-600'
                : 'border-green-600 bg-green-50 text-green-700'
            )}
          >
            <span className="text-xs">{urgent ? '⚠' : '⏱'}</span>
            <span className={clsx('text-xl font-black', urgent && 'animate-pulse')}>
              {fmt(timeLeft)}
            </span>
          </div>
          <button
            onClick={() => setShowConfirm(true)}
            className="btn-danger text-xs py-1.5 px-3"
          >
            Submit
          </button>
        </div>
        <div className="max-w-6xl mx-auto px-4 pb-2 flex gap-2 overflow-x-auto">
          {subjects.map((sub, i) => {
            const answered = sub.questions.filter((q) => answers[q.id] != null)
              .length
            return (
              <button
                key={sub.id}
                onClick={() => {
                  setSubjectIdx(i)
                  setQuestionIdx(0)
                }}
                className={clsx(
                  'px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap border-2 transition-all',
                  i === subjectIdx
                    ? 'border-green-700 bg-green-700 text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'
                )}
              >
                {sub.name.split(' ')[0]} ({answered}/10)
              </button>
            )
          })}
        </div>
      </header>

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-6">
        {currentQuestion && (
          <div className="card animate-fade-in">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                  {currentSubject.name} · Q{questionIdx + 1} of{' '}
                  {currentSubject.questions.length}
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
              <button
                onClick={toggleFlag}
                className={clsx(
                  'flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl border-2 transition-all',
                  flagged[currentQuestion.id]
                    ? 'border-red-400 bg-red-50 text-red-600'
                    : 'border-gray-200 text-gray-500 hover:border-red-300'
                )}
              >
                <Flag size={12} />
                {flagged[currentQuestion.id] ? 'Unflag' : 'Flag'}
              </button>
            </div>

            <p className="text-gray-800 font-medium text-base leading-relaxed mb-6">
              {questionIdx + 1}. {currentQuestion.question_text}
            </p>

            <div className="space-y-3">
              {OPTIONS.map((opt, i) => {
                const text = [
                  currentQuestion.option_a,
                  currentQuestion.option_b,
                  currentQuestion.option_c,
                  currentQuestion.option_d,
                ][i]
                const sel = answers[currentQuestion.id] === opt
                return (
                  <button
                    key={opt}
                    onClick={() => selectOption(opt)}
                    className={clsx(
                      'w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all',
                      sel
                        ? 'border-green-700 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/40'
                    )}
                  >
                    <div
                      className={clsx(
                        'w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 border-2',
                        sel
                          ? 'bg-green-700 border-green-700 text-white'
                          : 'border-gray-300 text-gray-500'
                      )}
                    >
                      {opt}
                    </div>
                    <span
                      className={clsx(
                        'text-sm',
                        sel ? 'font-semibold text-green-800' : 'text-gray-700'
                      )}
                    >
                      {text}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => {
                  if (questionIdx > 0) setQuestionIdx((q) => q - 1)
                  else if (subjectIdx > 0) {
                    setSubjectIdx((s) => s - 1)
                    setQuestionIdx(9)
                  }
                }}
                disabled={subjectIdx === 0 && questionIdx === 0}
                className="btn-secondary flex items-center gap-1 text-sm py-2 px-4"
              >
                <ChevronLeft size={16} />
                Prev
              </button>
              <button
                onClick={() => {
                  if (questionIdx < currentSubject.questions.length - 1)
                    setQuestionIdx((q) => q + 1)
                  else if (subjectIdx < subjects.length - 1) {
                    setSubjectIdx((s) => s + 1)
                    setQuestionIdx(0)
                  }
                }}
                disabled={
                  subjectIdx === subjects.length - 1 &&
                  questionIdx === currentSubject.questions.length - 1
                }
                className="btn-primary flex items-center gap-1 text-sm py-2 px-4"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Navigator sidebar */}
        <div className="card h-fit sticky top-28">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
            Navigator
          </p>
          <div className="grid grid-cols-5 gap-1 mb-4">
            {currentSubject?.questions.map((q, i) => {
              const isAns = answers[q.id] != null
              const isFl = flagged[q.id]
              const isCur = i === questionIdx
              return (
                <button
                  key={q.id}
                  onClick={() => setQuestionIdx(i)}
                  className={clsx(
                    'aspect-square rounded-lg text-xs font-bold border-2 transition-all',
                    isCur
                      ? 'bg-green-700 border-green-700 text-white'
                      : isFl
                        ? 'bg-red-50 border-red-400 text-red-600'
                        : isAns
                          ? 'bg-green-50 border-green-300 text-green-700'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-green-300'
                  )}
                >
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
                <div className={clsx('w-3 h-3 rounded border', cls)} />
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 space-y-2">
            {subjects.map((sub) => {
              const ans = sub.questions.filter((q) => answers[q.id] != null)
                .length
              return (
                <div key={sub.id}>
                  <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                    <span className="font-medium truncate">
                      {sub.name.split(' ')[0]}
                    </span>
                    <span
                      className={ans === 10 ? 'text-green-700 font-bold' : ''}
                    >
                      {ans}/10
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600 rounded-full"
                      style={{ width: `${(ans / 10) * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <button
            onClick={() => setShowConfirm(true)}
            className="btn-danger w-full mt-4 text-sm py-2"
          >
            Submit Exam
          </button>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-sm w-full text-center animate-slide-up">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <h3 className="font-black text-gray-800 text-lg mb-2">
              Submit Examination?
            </h3>
            <p className="text-gray-500 text-sm mb-5">
              You have answered <strong>{totalAnswered}</strong> of{' '}
              <strong>{totalQuestions}</strong> questions. Unanswered will be
              marked wrong. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="btn-secondary flex-1 text-sm py-2"
              >
                Continue
              </button>
              <button
                onClick={() => submitExam(false)}
                disabled={submitting}
                className="btn-danger flex-1 text-sm py-2"
              >
                {submitting ? 'Submitting…' : 'Yes, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}