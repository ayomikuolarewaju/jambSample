'use client'
// app/guest-results/page.tsx
// Results page for invite-link (guest) students — no auth needed.

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface SubjectResult {
  id: string
  subject_id: string
  correct_count: number
  questions_total: number
  score: number
  subjects: { name: string }
}

interface SessionData {
  first_name: string
  course_group: string
  total_score: number
  submitted_at: string
  is_auto_submitted: boolean
}

function GuestResultsContent() {
  const params    = useSearchParams()
  const sessionId = params.get('session') || ''

  const [loading,        setLoading]        = useState(true)
  const [session,        setSession]        = useState<SessionData | null>(null)
  const [subjectResults, setSubjectResults] = useState<SubjectResult[]>([])
  const [error,          setError]          = useState('')

  useEffect(() => {
    if (!sessionId) { setError('No session found.'); setLoading(false); return }
    load()
  }, [sessionId])

  const load = async () => {
    const supabase = createClient()

    const { data: sess } = await supabase
      .from('guest_sessions')
      .select('first_name, course_group, total_score, submitted_at, is_auto_submitted')
      .eq('id', sessionId)
      .single()

    if (!sess) { setError('Results not found.'); setLoading(false); return }
    setSession(sess)

    const { data: results } = await supabase
      .from('guest_subject_results')
      .select('*, subjects(name)')
      .eq('session_id', sessionId)

    setSubjectResults(results || [])
    setLoading(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-green-700 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  if (error || !session) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-md text-center">
        <p className="text-red-600 text-sm">{error || 'Results not found.'}</p>
      </div>
    </div>
  )

  const totalScore = Math.round(session.total_score ?? 0)
  const pct        = Math.round((totalScore / 400) * 100)

  const perf =
    totalScore >= 280 ? { label: 'Excellent',     color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-300',  bar: 'bg-green-600',  emoji: '🌟' } :
    totalScore >= 200 ? { label: 'Good',           color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-300',   bar: 'bg-blue-500',   emoji: '👍' } :
    totalScore >= 160 ? { label: 'Fair',           color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-300', bar: 'bg-yellow-500', emoji: '📚' } :
                        { label: 'Below Cut-off',  color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-300',    bar: 'bg-red-500',    emoji: '⚠' }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Nav */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🇳🇬</span>
            <div>
              <p className="text-green-800 font-black leading-none">JAMB CBT Portal</p>
              <p className="text-gray-400 text-[10px] tracking-widest uppercase">Result Slip</p>
            </div>
          </div>
          <button onClick={() => window.print()}
            className="btn-secondary text-sm py-2 px-4 print:hidden">
            🖨️ Print Result
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-slide-up">

        {/* Header */}
        <div className="card text-center">
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Examination Result Slip</p>
          <h1 className="text-2xl font-black text-gray-800">{session.first_name}</h1>
          <p className="text-gray-500 text-sm mt-1">{session.course_group} Combination</p>
          <p className="text-gray-400 text-xs mt-1">
            Submitted:{' '}
            {new Date(session.submitted_at).toLocaleString('en-NG', {
              dateStyle: 'long', timeStyle: 'short'
            })}
            {session.is_auto_submitted ? ' (Auto-submitted — time expired)' : ''}
          </p>
        </div>

        {/* Score circle */}
        <div className={`card flex flex-col sm:flex-row items-center gap-8 ${perf.bg} border-2 ${perf.border}`}>
          <div className={`w-36 h-36 rounded-full border-8 ${perf.border} flex flex-col items-center justify-center flex-shrink-0 bg-white`}>
            <span className="text-3xl">{perf.emoji}</span>
            <p className={`text-3xl font-black ${perf.color} leading-none mt-1`}>{totalScore}</p>
            <p className="text-gray-400 text-xs">/ 400</p>
          </div>
          <div className="flex-1 w-full">
            <p className={`text-2xl font-black ${perf.color}`}>{perf.label} Performance</p>
            <p className="text-gray-600 text-sm mt-1">
              You scored <strong>{totalScore} / 400</strong> ({pct}%).{' '}
              {totalScore >= 180
                ? 'You meet the minimum JAMB score for most universities.'
                : 'The minimum cut-off for most federal universities is 180.'}
            </p>
            <div className="mt-3 max-w-xs">
              <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                <span>0</span><span>Cut-off (180)</span><span>400</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${perf.bar}`} style={{ width: `${pct}%` }}/>
              </div>
            </div>
          </div>
        </div>

        {/* Subject breakdown */}
        <div className="card">
          <h2 className="section-title">Subject Scores</h2>
          <div className="space-y-5">
            {subjectResults.map(sr => {
              const subPct   = Math.round((sr.correct_count / sr.questions_total) * 100)
              const subScore = Math.round(sr.score)
              const barColor = subPct >= 70 ? 'bg-green-600' : subPct >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              return (
                <div key={sr.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <span className="font-semibold text-gray-800 text-sm">{sr.subjects?.name}</span>
                      <span className="text-gray-400 text-xs ml-2">
                        ({sr.correct_count}/{sr.questions_total} correct)
                      </span>
                    </div>
                    <div>
                      <span className="font-black text-gray-800 text-base">{subScore}</span>
                      <span className="text-gray-400 text-xs">/100</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${subPct}%` }}/>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* What next */}
        <div className="card bg-green-50 border border-green-200">
          <h3 className="font-bold text-green-800 mb-2">📝 What Next?</h3>
          <ul className="text-sm text-green-700 space-y-1.5 list-disc pl-4">
            <li>Visit <strong>jamb.gov.ng</strong> to register for the official UTME.</li>
            <li>Check your preferred institution's departmental cut-off marks.</li>
            {totalScore < 180 && (
              <li className="text-red-600 font-medium">
                Your score is below 180. Keep practising — you can improve!
              </li>
            )}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-4 flex-wrap print:hidden">
          <button onClick={() => window.print()} className="btn-secondary">🖨️ Print Result Slip</button>
          <a href="/" className="btn-primary">← Back to Home</a>
        </div>

      </main>
    </div>
  )
}

export default function GuestResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin"/>
      </div>
    }>
      <GuestResultsContent/>
    </Suspense>
  )
}
