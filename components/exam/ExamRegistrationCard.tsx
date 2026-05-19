'use client'
// components/exam/ExamRegistrationCard.tsx

import { useState, useEffect } from 'react'
import { createClient } from '../../app/lib/supabase/clients'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import clsx from 'clsx'
import type { ExamRegistration, ExamSession, Subject } from '../../type/database'

const COURSE_GROUPS = {
  Science: {
    icon: '🔬',
    electives: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Agricultural Science'],
  },
  Commercial: {
    icon: '💼',
    electives: ['Mathematics', 'Economics', 'Commerce', 'Accounting', 'Government'],
  },
  Arts: {
    icon: '🎨',
    electives: ['Literature in English', 'Government', 'Economics', 'Geography', 'Biology'],
  },
} as const

type CourseGroup = keyof typeof COURSE_GROUPS

interface Props {
  userId: string
  registration: ExamRegistration | null
  session: ExamSession | null
}

export default function ExamRegistrationCard({ userId, registration, session }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [courseGroup, setCourseGroup] = useState<CourseGroup | ''>('')
  const [electives, setElectives] = useState<string[]>([])
  const [allSubjects, setAllSubjects] = useState<Subject[]>([])

  useEffect(() => {
    // Check localStorage for combination from registration
    const saved = localStorage.getItem('jamb_combination')
    if (saved && !registration) {
      try {
        const parsed = JSON.parse(saved)
        setCourseGroup(parsed.courseGroup)
        setElectives(parsed.electives)
      } catch {}
    }
  }, [registration])

  useEffect(() => {
    const supabase = createClient()
    supabase.from('subjects').select('*').eq('is_active', true).then(({ data }) => {
      if (data) setAllSubjects(data)
    })
  }, [])

  const toggleElective = (sub: string) => {
    setElectives(prev => {
      if (prev.includes(sub)) return prev.filter(s => s !== sub)
      if (prev.length >= 3) return prev
      return [...prev, sub]
    })
  }

  const handleRegister = async () => {
    if (!courseGroup || electives.length !== 3) return
    setLoading(true)
    setError('')
    const supabase = createClient()

    // Get subject IDs
    const subjectNames = ['English Language', ...electives]
    const { data: subjects } = await supabase
      .from('subjects')
      .select('id, name')
      .in('name', subjectNames)

    if (!subjects || subjects.length < 4) {
      setError('Could not find all subjects. Please try again.')
      setLoading(false)
      return
    }

    const subjectIds = subjectNames.map(
      name => subjects.find(s => s.name === name)?.id
    ).filter(Boolean) as string[]

    const { error: regError } = await supabase.from('exam_registrations').insert({
      user_id: userId,
      course_group: courseGroup,
      subject_ids: subjectIds,
      status: 'registered',
    })

    if (regError) {
      setError(regError.message)
      setLoading(false)
      return
    }

    localStorage.removeItem('jamb_combination')
    router.refresh()
  }

  const handleStartExam = () => {
    router.push('/exam')
  }

  // ── Already submitted ──
  if (session?.submitted_at) {
    return (
      <div className="card h-full flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-gray-700 mb-3">Exam Status</h3>
          <div className="flex items-center gap-2 badge-green text-sm mb-4 w-fit">
            ✅ Exam Completed
          </div>
          <p className="text-gray-500 text-sm">You have already submitted your examination. View your detailed result below.</p>
        </div>
        <button onClick={() => router.push('/results')} className="btn-primary mt-6 w-full">
          View Full Result →
        </button>
      </div>
    )
  }

  // ── Registered, not yet started ──
  if (registration && !session) {
    return (
      <div className="card h-full flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-gray-700 mb-3">Exam Status</h3>
          <div className="badge-yellow text-sm mb-4 w-fit">📋 Registered – Not Started</div>
          <div className="space-y-2 text-sm text-gray-600">
            <p><span className="font-medium">Course Group:</span> {registration.course_group}</p>
            <p><span className="font-medium">Subjects:</span> 4 subjects selected</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3 text-yellow-800 text-xs">
              ⚠ Once you start, the 30-minute timer begins immediately. Ensure you are in a quiet environment.
            </div>
          </div>
        </div>
        <button onClick={handleStartExam} className="btn-danger mt-6 w-full">
          🚀 Start Examination Now
        </button>
      </div>
    )
  }

  // ── In progress ──
  if (session && !session.submitted_at) {
    return (
      <div className="card h-full flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-gray-700 mb-3">Exam Status</h3>
          <div className="badge-red text-sm mb-4 w-fit">🔴 Exam In Progress</div>
          <p className="text-gray-500 text-sm">You have an ongoing exam session. Return to continue.</p>
        </div>
        <button onClick={handleStartExam} className="btn-danger mt-6 w-full">
          Resume Examination →
        </button>
      </div>
    )
  }

  // ── Not yet registered ──
  return (
    <div className="card">
      <h3 className="font-bold text-gray-700 mb-1">Register for Examination</h3>
      <p className="text-gray-500 text-xs mb-4">Select your course group and 3 elective subjects to proceed.</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded mb-4">⚠ {error}</div>
      )}

      {/* Course Group */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {(Object.keys(COURSE_GROUPS) as CourseGroup[]).map(group => (
          <button key={group} onClick={() => { setCourseGroup(group); setElectives([]) }}
            className={clsx('p-2 rounded-lg border-2 text-center transition-all text-sm',
              courseGroup === group ? 'border-green-700 bg-green-50 font-bold text-green-800'
                                   : 'border-gray-200 hover:border-green-300 text-gray-600')}>
            <div>{COURSE_GROUPS[group].icon}</div>
            <div className="text-xs mt-0.5">{group}</div>
          </button>
        ))}
      </div>

      {/* Compulsory */}
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-green-700 text-white text-sm mb-2">
        <CheckCircle size={14} />
        <span className="font-semibold">English Language — Compulsory</span>
      </div>

      {/* Electives */}
      {courseGroup && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {COURSE_GROUPS[courseGroup].electives.map(sub => {
            const sel = electives.includes(sub)
            const maxed = electives.length >= 3 && !sel
            return (
              <button key={sub} onClick={() => toggleElective(sub)} disabled={maxed}
                className={clsx('flex items-center gap-2 p-2.5 rounded-lg border-2 text-xs transition-all text-left',
                  sel ? 'border-green-700 bg-green-50 text-green-800 font-semibold'
                      : maxed ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                              : 'border-gray-200 hover:border-green-300 text-gray-700')}>
                <div className={clsx('w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0',
                  sel ? 'bg-green-700 border-green-700' : 'border-gray-300')}>
                  {sel && <span className="text-white text-[8px]">✓</span>}
                </div>
                {sub}
              </button>
            )
          })}
        </div>
      )}

      <button onClick={handleRegister}
        disabled={!courseGroup || electives.length !== 3 || loading}
        className="btn-primary w-full">
        {loading ? 'Registering…' : 'Confirm Subject Combination →'}
      </button>
    </div>
  )
}
