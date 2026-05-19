'use client'
// app/auth/register/page.tsx

import { useState } from 'react'
import { createClient } from '../../lib/supabase/clients'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react'
import clsx from 'clsx'

type Step = 'personal' | 'account' | 'combination'

const COURSE_GROUPS = {
  Science: {
    icon: '🔬',
    description: 'Medicine, Engineering, Computer Science, Sciences',
    electives: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Agricultural Science'],
  },
  Commercial: {
    icon: '💼',
    description: 'Accounting, Business Admin, Economics, Law',
    electives: ['Mathematics', 'Economics', 'Commerce', 'Accounting', 'Government'],
  },
  Arts: {
    icon: '🎨',
    description: 'Mass Communication, Linguistics, Law, History',
    electives: ['Literature in English', 'Government', 'Economics', 'Geography', 'Biology'],
  },
} as const

type CourseGroup = keyof typeof COURSE_GROUPS

interface FormData {
  fullName: string
  regNumber: string
  phone: string
  dateOfBirth: string
  gender: string
  stateOfOrigin: string
  email: string
  password: string
  confirmPassword: string
  courseGroup: CourseGroup | ''
  electives: string[]
}

const NIGERIA_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara',
]

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('personal')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<FormData>({
    fullName: '', regNumber: '', phone: '', dateOfBirth: '', gender: '',
    stateOfOrigin: '', email: '', password: '', confirmPassword: '',
    courseGroup: '', electives: [],
  })

  const set = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const toggleElective = (sub: string) => {
    setForm(f => {
      const has = f.electives.includes(sub)
      if (has) return { ...f, electives: f.electives.filter(s => s !== sub) }
      if (f.electives.length >= 3) return f
      return { ...f, electives: [...f.electives, sub] }
    })
  }

  const canProceedPersonal =
    form.fullName && form.regNumber && form.phone && form.dateOfBirth && form.gender && form.stateOfOrigin

  const canProceedAccount =
    form.email && form.password.length >= 8 && form.password === form.confirmPassword

  const canSubmit = form.courseGroup && form.electives.length === 3

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)
    setError('')
    const supabase = createClient()

    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: form.fullName.toUpperCase(),
          reg_number: form.regNumber.toUpperCase(),
          phone: form.phone,
          date_of_birth: form.dateOfBirth,
          gender: form.gender,
          state_of_origin: form.stateOfOrigin,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Sign in immediately after signup (if email confirmation is off)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email, password: form.password,
    })

    if (!signInError) {
      // Save combination preference in localStorage for dashboard pickup
      localStorage.setItem('jamb_combination', JSON.stringify({
        courseGroup: form.courseGroup,
        electives: form.electives,
      }))
      router.push('/dashboard')
    } else {
      // Email confirmation required
      router.push('/auth/login?message=check_email')
    }
  }

  const steps: Step[] = ['personal', 'account', 'combination']
  const stepIdx = steps.indexOf(step)

  const InputField = ({
    label, name, type = 'text', placeholder, value, onChange, required = false,
  }: {
    label: string; name: string; type?: string; placeholder?: string;
    value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean
  }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type} placeholder={placeholder} value={value} onChange={onChange}
        className="input-field"
      />
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🇳🇬</div>
          <h1 className="text-2xl font-black text-green-800">JAMB CBT Registration</h1>
          <p className="text-gray-500 text-sm mt-1">Create your candidate account</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {['Personal Details', 'Account Setup', 'Combination'].map((label, i) => (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all',
                  i < stepIdx ? 'bg-green-700 border-green-700 text-white' :
                  i === stepIdx ? 'bg-white border-green-700 text-green-700' :
                  'bg-white border-gray-300 text-gray-400'
                )}>
                  {i < stepIdx ? '✓' : i + 1}
                </div>
                <span className={clsx('text-[10px] mt-1 font-medium whitespace-nowrap',
                  i === stepIdx ? 'text-green-700' : 'text-gray-400')}>{label}</span>
              </div>
              {i < 2 && <div className={clsx('w-12 h-0.5 mb-4 mx-1', i < stepIdx ? 'bg-green-700' : 'bg-gray-200')} />}
            </div>
          ))}
        </div>

        <div className="card">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">
              ⚠ {error}
            </div>
          )}

          {/* ── STEP 1: PERSONAL ── */}
          {step === 'personal' && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="font-bold text-gray-800 text-lg mb-4">Personal Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <InputField label="Full Name (Surname First)" name="fullName"
                    placeholder="e.g. IBRAHIM Fatima Bello"
                    value={form.fullName} onChange={set('fullName')} required />
                </div>
                <InputField label="JAMB Reg Number" name="regNumber"
                  placeholder="e.g. 12345678AB"
                  value={form.regNumber} onChange={set('regNumber')} required />
                <InputField label="Phone Number" name="phone" type="tel"
                  placeholder="08012345678"
                  value={form.phone} onChange={set('phone')} required />
                <InputField label="Date of Birth" name="dob" type="date"
                  value={form.dateOfBirth} onChange={set('dateOfBirth')} required />
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select value={form.gender} onChange={set('gender')} className="input-field">
                    <option value="">Select Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                    State of Origin <span className="text-red-500">*</span>
                  </label>
                  <select value={form.stateOfOrigin} onChange={set('stateOfOrigin')} className="input-field">
                    <option value="">Select State</option>
                    {NIGERIA_STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={() => setStep('account')} disabled={!canProceedPersonal}
                className="btn-primary w-full mt-2 flex items-center justify-center gap-2">
                Continue <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* ── STEP 2: ACCOUNT ── */}
          {step === 'account' && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="font-bold text-gray-800 text-lg mb-4">Account Setup</h2>
              <InputField label="Email Address" name="email" type="email"
                placeholder="your@email.com"
                value={form.email} onChange={set('email')} required />
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} placeholder="Min. 8 characters"
                    value={form.password} onChange={set('password')}
                    className="input-field pr-10" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.password && form.password.length < 8 && (
                  <p className="text-xs text-red-500 mt-1">Password must be at least 8 characters</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input type="password" placeholder="Repeat password"
                  value={form.confirmPassword} onChange={set('confirmPassword')}
                  className={clsx('input-field', form.confirmPassword && form.confirmPassword !== form.password && 'input-error')} />
                {form.confirmPassword && form.confirmPassword !== form.password && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>
              <div className="flex gap-3 mt-2">
                <button onClick={() => setStep('personal')} className="btn-secondary flex items-center gap-1">
                  <ChevronLeft size={16} /> Back
                </button>
                <button onClick={() => setStep('combination')} disabled={!canProceedAccount}
                  className="btn-primary flex-1 flex items-center justify-center gap-2">
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: COMBINATION ── */}
          {step === 'combination' && (
            <div className="animate-fade-in">
              <h2 className="font-bold text-gray-800 text-lg mb-1">Subject Combination</h2>
              <p className="text-gray-500 text-sm mb-5">
                English Language is compulsory. Select your course group then pick <strong>3 elective subjects</strong>.
              </p>

              {/* Course Group */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {(Object.entries(COURSE_GROUPS) as [CourseGroup, typeof COURSE_GROUPS[CourseGroup]][]).map(([group, info]) => (
                  <button key={group} onClick={() => setForm(f => ({ ...f, courseGroup: group, electives: [] }))}
                    className={clsx(
                      'p-3 rounded-xl border-2 text-left transition-all',
                      form.courseGroup === group
                        ? 'border-green-700 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-green-300'
                    )}>
                    <div className="text-2xl mb-1">{info.icon}</div>
                    <div className="font-bold text-sm text-gray-800">{group}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{info.description.split(',')[0]}</div>
                  </button>
                ))}
              </div>

              {/* Compulsory */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-700 text-white mb-3">
                <CheckCircle size={16} />
                <span className="text-sm font-semibold">English Language — Compulsory</span>
              </div>

              {/* Electives */}
              {form.courseGroup && (
                <div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">
                    Choose 3 electives ({form.electives.length}/3 selected):
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {COURSE_GROUPS[form.courseGroup].electives.map(sub => {
                      const sel = form.electives.includes(sub)
                      const maxed = form.electives.length >= 3 && !sel
                      return (
                        <button key={sub} onClick={() => toggleElective(sub)} disabled={maxed}
                          className={clsx(
                            'flex items-center gap-2 p-3 rounded-lg border-2 text-left text-sm transition-all',
                            sel ? 'border-green-700 bg-green-50 text-green-800 font-semibold'
                                : maxed ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                                        : 'border-gray-200 hover:border-green-300 text-gray-700'
                          )}>
                          <div className={clsx('w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0',
                            sel ? 'bg-green-700 border-green-700' : 'border-gray-300')}>
                            {sel && <span className="text-white text-xs">✓</span>}
                          </div>
                          {sub}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {canSubmit && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200 text-sm text-green-700">
                  ✅ <strong>Your combination:</strong> English Language, {form.electives.join(', ')}
                </div>
              )}

              <div className="flex gap-3 mt-5">
                <button onClick={() => setStep('account')} className="btn-secondary flex items-center gap-1">
                  <ChevronLeft size={16} /> Back
                </button>
                <button onClick={handleSubmit} disabled={!canSubmit || loading}
                  className="btn-primary flex-1">
                  {loading ? 'Creating Account…' : '🎓 Complete Registration'}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already registered?{' '}
          <Link href="/auth/login" className="text-green-700 font-semibold hover:underline">Sign in here</Link>
        </p>
      </div>
    </div>
  )
}
