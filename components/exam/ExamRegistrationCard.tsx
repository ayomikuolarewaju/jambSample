'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import clsx from 'clsx'

const COURSE_GROUPS = {
  Science:    { icon: '🔬', electives: ['Mathematics','Physics','Chemistry','Biology','Agricultural Science'] },
  Commercial: { icon: '💼', electives: ['Mathematics','Economics','Commerce','Accounting','Government'] },
  Arts:       { icon: '🎨', electives: ['Literature in English','Government','Economics','Geography','Biology'] },
} as const
type CourseGroup = keyof typeof COURSE_GROUPS

interface Props {
  userId: string
  activeSession: { id: string; registration_id: string; submitted_at: string | null } | null
}

export default function ExamRegistrationCard({ userId, activeSession }: Props) {
  const router = useRouter()
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [courseGroup, setCourseGroup] = useState<CourseGroup | ''>('')
  const [electives,   setElectives]   = useState<string[]>([])
  const [showPicker,  setShowPicker]  = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('jamb_combination')
    if (saved) {
      try {
        const p = JSON.parse(saved)
        setCourseGroup(p.courseGroup)
        setElectives(p.electives)
        setShowPicker(true)
      } catch {}
    }
  }, [])

  const toggleElective = (sub: string) => setElectives(prev => {
    if (prev.includes(sub)) return prev.filter(s => s !== sub)
    if (prev.length >= 3) return prev
    return [...prev, sub]
  })

  const handleStart = async () => {
    if (!courseGroup || electives.length !== 3) return
    setLoading(true); setError('')
    const supabase = await createClient()

    // Get subject IDs
    const subjectNames = ['English Language', ...electives]
    const { data: subjects, error: subErr } = await supabase
      .from('subjects').select('id, name').in('name', subjectNames)

    if (subErr || !subjects || subjects.length < 4) {
      setError('Could not load subjects. Please try again.')
      setLoading(false); return
    }

    const subjectIds = subjectNames
      .map(n => subjects.find(s => s.name === n)?.id)
      .filter(Boolean) as string[]

    // First mark any old 'registered' or 'in_progress' records as abandoned
    // so they don't interfere
    await supabase
      .from('exam_registrations')
      .update({ status: 'abandoned' })
      .eq('user_id', userId)
      .in('status', ['registered', 'in_progress'])

    // Now insert the new registration
    const { data: reg, error: regError } = await supabase
      .from('exam_registrations')
      .insert({
        user_id:      userId,
        course_group: courseGroup,
        subject_ids:  subjectIds,
        status:       'registered',
      })
      .select()
      .single()

    if (regError || !reg) {
      // If unique constraint still exists, give a clear fix instruction
      if (regError?.message?.includes('unique') || regError?.message?.includes('duplicate')) {
        setError('Database constraint error: please run migration 006_fix_unique_constraint.sql in your Supabase SQL Editor, then try again.')
      } else {
        setError(regError?.message || 'Could not create exam. Please try again.')
      }
      setLoading(false); return
    }

    localStorage.removeItem('jamb_combination')
    router.push('/exam')
    router.refresh()
  }

  // In-progress → resume
  if (activeSession && !activeSession.submitted_at) return (
    <div className="card h-full flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">Exam Status</h3>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          🔴 Exam In Progress
        </span>
        <p className="text-gray-500 text-sm mt-3">
          You have an ongoing session. Return to continue where you left off.
        </p>
      </div>
      <button onClick={() => router.push('/exam')} className="btn-danger mt-6 w-full">
        Resume Examination →
      </button>
    </div>
  )

  // No active session → start new
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Start New Exam</h3>
          <p className="text-gray-400 text-xs mt-0.5">You can take the exam as many times as you like</p>
        </div>
        {!showPicker && (
          <button onClick={() => setShowPicker(true)} className="btn-primary text-sm py-2 px-4">
            + New Attempt
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4 flex gap-2">
          <span className="flex-shrink-0">⚠</span>
          <span>{error}</span>
        </div>
      )}

      {showPicker && (
        <div className="animate-fade-in space-y-4">

          {/* Course group */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Choose Course Group
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(COURSE_GROUPS) as CourseGroup[]).map(group => (
                <button key={group}
                  onClick={() => { setCourseGroup(group); setElectives([]) }}
                  className={clsx(
                    'p-3 rounded-xl border-2 text-center transition-all',
                    courseGroup === group
                      ? 'border-green-700 bg-green-50 font-bold text-green-800'
                      : 'border-gray-200 hover:border-green-300 text-gray-600'
                  )}>
                  <div className="text-xl mb-0.5">{COURSE_GROUPS[group].icon}</div>
                  <div className="text-xs font-semibold">{group}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Compulsory */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-green-700 text-white text-sm">
            <CheckCircle size={14}/>
            <span className="font-semibold">English Language — Compulsory</span>
          </div>

          {/* Electives */}
          {courseGroup && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Choose 3 Electives ({electives.length}/3)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {COURSE_GROUPS[courseGroup].electives.map(sub => {
                  const sel   = electives.includes(sub)
                  const maxed = electives.length >= 3 && !sel
                  return (
                    <button key={sub}
                      onClick={() => toggleElective(sub)}
                      disabled={maxed}
                      className={clsx(
                        'flex items-center gap-2 p-2.5 rounded-xl border-2 text-xs text-left transition-all',
                        sel   ? 'border-green-700 bg-green-50 text-green-800 font-semibold' :
                        maxed ? 'border-gray-100 text-gray-300 cursor-not-allowed' :
                                'border-gray-200 hover:border-green-300 text-gray-700'
                      )}>
                      <div className={clsx(
                        'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0',
                        sel ? 'bg-green-700 border-green-700' : 'border-gray-300'
                      )}>
                        {sel && <span className="text-white text-[8px]">✓</span>}
                      </div>
                      {sub}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Combination summary */}
          {courseGroup && electives.length === 3 && (
            <div className="p-3 bg-green-50 rounded-xl border border-green-200 text-sm text-green-800">
              ✅ <strong>Combination:</strong> English Language, {electives.join(', ')}
            </div>
          )}

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-yellow-800 text-xs">
            ⚠ Once you click Start, the 30-minute timer begins immediately.
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => { setShowPicker(false); setElectives([]); setCourseGroup(''); setError('') }}
              className="btn-secondary text-sm py-2 px-4">
              Cancel
            </button>
            <button
              onClick={handleStart}
              disabled={!courseGroup || electives.length !== 3 || loading}
              className="btn-danger flex-1 text-sm py-2 flex items-center justify-center gap-2">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Setting up…</>
                : '🚀 Start Exam Now'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
