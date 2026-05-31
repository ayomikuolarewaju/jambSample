'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import clsx from 'clsx'
import type { ExamRegistration, ExamSession, Subject } from '@/types/database'

const COURSE_GROUPS = {
  Science:    { icon: '🔬', electives: ['Mathematics','Physics','Chemistry','Biology','Agricultural Science'] },
  Commercial: { icon: '💼', electives: ['Mathematics','Economics','Commerce','Accounting','Government'] },
  Arts:       { icon: '🎨', electives: ['Literature in English','Government','Economics','Geography','Biology'] },
} as const
type CourseGroup = keyof typeof COURSE_GROUPS

interface Props { userId: string; registration: ExamRegistration|null; session: ExamSession|null }

export default function ExamRegistrationCard({ userId, registration, session }: Props) {
  const router = useRouter()
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [courseGroup, setCourseGroup] = useState<CourseGroup|''>('')
  const [electives,   setElectives]   = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('jamb_combination')
    if (saved && !registration) {
      try { const p = JSON.parse(saved); setCourseGroup(p.courseGroup); setElectives(p.electives) } catch {}
    }
  }, [registration])

  const toggleElective = (sub: string) => setElectives(prev => {
    if (prev.includes(sub)) return prev.filter(s => s !== sub)
    if (prev.length >= 3) return prev
    return [...prev, sub]
  })

  const handleRegister = async () => {
    if (!courseGroup || electives.length !== 3) return
    setLoading(true); setError('')
    const supabase = createClient()
    const subjectNames = ['English Language', ...electives]
    const { data: subjects } = await supabase.from('subjects').select('id,name').in('name', subjectNames)
    if (!subjects || subjects.length < 4) { setError('Could not find all subjects. Try again.'); setLoading(false); return }
    const subjectIds = subjectNames.map(n => subjects.find(s => s.name === n)?.id).filter(Boolean) as string[]
    const { error: regError } = await supabase.from('exam_registrations').insert({
      user_id: userId, course_group: courseGroup, subject_ids: subjectIds, status: 'registered',
    })
    if (regError) { setError(regError.message); setLoading(false); return }
    localStorage.removeItem('jamb_combination')
    router.refresh()
  }

  // Already completed
  if (session?.submitted_at) return (
    <div className="card h-full flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">Exam Status</h3>
        <span className="badge-green text-sm">✅ Exam Completed</span>
        <p className="text-gray-500 text-sm mt-3">You have submitted your examination. View your detailed result below.</p>
      </div>
      <button onClick={() => router.push('/results')} className="btn-primary mt-6 w-full">View Full Result →</button>
    </div>
  )

  // Registered, not started
  if (registration && !session) return (
    <div className="card h-full flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">Exam Status</h3>
        <span className="badge-yellow text-sm">📋 Registered — Not Started</span>
        <div className="mt-3 space-y-1 text-sm text-gray-600">
          <p><span className="font-medium">Course Group:</span> {registration.course_group}</p>
          <p><span className="font-medium">Subjects:</span> 4 subjects selected</p>
        </div>
        <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-yellow-800 text-xs">
          ⚠ Once you start, the 30-minute timer begins immediately. Ensure you are in a quiet place.
        </div>
      </div>
      <button onClick={() => router.push('/exam')} className="btn-danger mt-6 w-full">🚀 Start Examination Now</button>
    </div>
  )

  // In progress
  if (session && !session.submitted_at) return (
    <div className="card h-full flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">Exam Status</h3>
        <span className="badge-red text-sm">🔴 Exam In Progress</span>
        <p className="text-gray-500 text-sm mt-3">You have an ongoing session. Return to continue.</p>
      </div>
      <button onClick={() => router.push('/exam')} className="btn-danger mt-6 w-full">Resume Examination →</button>
    </div>
  )

  // Not yet registered
  return (
    <div className="card">
      <h3 className="font-bold text-gray-700 mb-1 text-sm uppercase tracking-wide">Register for Examination</h3>
      <p className="text-gray-500 text-xs mb-4">Confirm your course group and 3 elective subjects to proceed.</p>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-xl mb-4">⚠ {error}</div>}

      <div className="grid grid-cols-3 gap-2 mb-4">
        {(Object.keys(COURSE_GROUPS) as CourseGroup[]).map(group => (
          <button key={group} onClick={() => { setCourseGroup(group); setElectives([]) }}
            className={clsx('p-2 rounded-xl border-2 text-center transition-all text-sm',
              courseGroup === group ? 'border-green-700 bg-green-50 font-bold text-green-800' : 'border-gray-200 hover:border-green-300 text-gray-600')}>
            <div>{COURSE_GROUPS[group].icon}</div><div className="text-xs mt-0.5">{group}</div>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-green-700 text-white text-sm mb-2">
        <CheckCircle size={14}/><span className="font-semibold">English Language — Compulsory</span>
      </div>

      {courseGroup && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {COURSE_GROUPS[courseGroup].electives.map(sub => {
            const sel   = electives.includes(sub)
            const maxed = electives.length >= 3 && !sel
            return (
              <button key={sub} onClick={() => toggleElective(sub)} disabled={maxed}
                className={clsx('flex items-center gap-2 p-2.5 rounded-xl border-2 text-xs transition-all text-left',
                  sel   ? 'border-green-700 bg-green-50 text-green-800 font-semibold' :
                  maxed ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 hover:border-green-300 text-gray-700')}>
                <div className={clsx('w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0',
                  sel ? 'bg-green-700 border-green-700' : 'border-gray-300')}>
                  {sel && <span className="text-white text-[8px]">✓</span>}
                </div>{sub}
              </button>
            )
          })}
        </div>
      )}
      <button onClick={handleRegister} disabled={!courseGroup || electives.length !== 3 || loading} className="btn-primary w-full">
        {loading ? 'Registering…' : 'Confirm Combination →'}
      </button>
    </div>
  )
}
