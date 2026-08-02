'use client'
// app/auth/register/page.tsx
// Candidate registration — personal info + password + subject combo

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, UserPlus, CheckCircle } from 'lucide-react'
import clsx from 'clsx'
import Image from 'next/image'

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
  'Yobe','Zamfara',
]

const COURSE_GROUPS = {
  Science:    { icon: '🔬', electives: ['Mathematics','Physics','Chemistry','Biology','Agricultural Science','Computer Studies'] },
  Commercial: { icon: '💼', electives: ['Mathematics','Economics','Commerce','Accounting','Government'] },
  Arts:       { icon: '🎨', electives: ['Literature in English','Government','Economics','Geography','History','Christian Religious Knowledge','Islamic Studies','Yoruba','Igbo'] },
} as const
type CourseGroup = keyof typeof COURSE_GROUPS

const STEPS = ['Personal Info', 'Account Setup', 'Subject Combo']

export default function RegisterPage() {
  const router = useRouter()

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1 — Personal info
  const [fullName,       setFullName]       = useState('')
  const [regNumber,      setRegNumber]      = useState('')
  const [gender,         setGender]         = useState('')
  const [dateOfBirth,    setDateOfBirth]    = useState('')
  const [stateOfOrigin,  setStateOfOrigin]  = useState('')
  const [contactEmail,   setContactEmail]   = useState('')
  const [phone,          setPhone]          = useState('')

  // Step 2 — Password
  const [password,       setPassword]       = useState('')
  const [confirmPwd,     setConfirmPwd]     = useState('')
  const [showPwd,        setShowPwd]        = useState(false)
  const [showConfirm,    setShowConfirm]    = useState(false)

  // Step 3 — Combination
  const [courseGroup,    setCourseGroup]    = useState<CourseGroup | ''>('')
  const [electives,      setElectives]      = useState<string[]>([])

  const nextStep = () => {
    setError('')
    if (step === 0) {
      if (!fullName.trim() || !regNumber.trim() || !gender || !dateOfBirth || !stateOfOrigin) {
        setError('Please fill in all required fields.'); return
      }
    }
    if (step === 1) {
      if (!password || password.length < 8) {
        setError('Password must be at least 8 characters.'); return
      }
      if (password !== confirmPwd) {
        setError('Passwords do not match.'); return
      }
    }
    setStep(s => s + 1)
  }

  const toggleElective = (sub: string) => {
    setElectives(prev => {
      if (prev.includes(sub)) return prev.filter(s => s !== sub)
      if (prev.length >= 3) return prev
      return [...prev, sub]
    })
  }

  const handleRegister = async () => {
    if (!courseGroup || electives.length !== 3) {
      setError('Please select a course group and exactly 3 elective subjects.'); return
    }
    setLoading(true); setError('')

    const supabase = createClient()

    // Auth email uses reg number (not real email) to avoid confirmation
    const authEmail = `${regNumber.trim().toUpperCase()}@jambcbt.local`

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email:    authEmail,
      password,
      options: {
        data: {
          full_name:       fullName.trim(),
          reg_number:      regNumber.trim().toUpperCase(),
          contact_email:   contactEmail.trim() || null,
          phone:           phone.trim() || null,
          date_of_birth:   dateOfBirth,
          gender,
          state_of_origin: stateOfOrigin,
          is_admin:        false,
        },
      },
    })

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        setError('This registration number already has an account. Please sign in instead.')
      } else {
        setError(signUpError.message)
      }
      setLoading(false); return
    }

    // Save combination to localStorage so dashboard can pick it up
    localStorage.setItem('jamb_combination', JSON.stringify({
      courseGroup,
      electives,
    }))

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-gray-900
                    flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-slide-up">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="mb-6" >
              <Image src="/images/logo.png" alt="Hero" width={100} height={100} className='rounded-3xl shadow-2xl border-4 border-white/10 transform hover:scale-[1.02] transition-transform duration-500'/>
          </div>
          <p className="text-green-300 text-sm mt-1">Candidate Registration</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6 px-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1">
              <div className={clsx(
                'flex items-center gap-1.5 flex-shrink-0',
              )}>
                <div className={clsx(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all',
                  i < step  ? 'bg-green-500 border-green-500 text-white' :
                  i === step ? 'bg-white border-white text-green-800' :
                               'bg-transparent border-green-600 text-green-400'
                )}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={clsx(
                  'text-xs font-semibold hidden sm:block',
                  i === step ? 'text-white' : 'text-green-500'
                )}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={clsx(
                  'flex-1 h-0.5 mx-2 rounded-full transition-all',
                  i < step ? 'bg-green-500' : 'bg-green-800'
                )}/>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm
                            px-4 py-3 rounded-xl mb-5 flex gap-2">
              <span className="flex-shrink-0">⚠</span><span>{error}</span>
            </div>
          )}

          {/* ── Step 0: Personal Info ─────────────────────────────────────── */}
          {step === 0 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-lg font-black text-black mb-4">Personal Information</h2>

              <div>
                <label className="block text-xs font-semibold text-black uppercase tracking-wide mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input type="text" placeholder="e.g. Oluwaseun Adeyemi"
                  value={fullName} onChange={e => setFullName(e.target.value)}
                  required className="input-field text-black"/>
              </div>

              <div>
                <label className="block text-xs font-semibold text-black uppercase tracking-wide mb-1.5">
                  JAMB Registration Number <span className="text-red-500">*</span>
                </label>
                <input type="text" placeholder="e.g. 12345678AB"
                  value={regNumber} onChange={e => setRegNumber(e.target.value.toUpperCase())}
                  required className="input-field font-mono uppercase"/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-black uppercase tracking-wide mb-1.5">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select value={gender} onChange={e => setGender(e.target.value)}
                    required className="input-field text-black">
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semiboldtext-black uppercase tracking-wide mb-1.5">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input type="date" value={dateOfBirth}
                    onChange={e => setDateOfBirth(e.target.value)}
                    required className="input-field text-black"/>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-black uppercase tracking-wide mb-1.5">
                  State of Origin <span className="text-red-500">*</span>
                </label>
                <select value={stateOfOrigin} onChange={e => setStateOfOrigin(e.target.value)}
                  required className="input-field text-black">
                  <option value="">Select State</option>
                  {NIGERIAN_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-black uppercase tracking-wide mb-1.5">
                    Email <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input type="email" placeholder="your@email.com"
                    value={contactEmail} onChange={e => setContactEmail(e.target.value)}
                    className="input-field text-black"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black uppercase tracking-wide mb-1.5">
                    Phone <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input type="tel" placeholder="08012345678"
                    value={phone} onChange={e => setPhone(e.target.value)}
                    className="input-field text-black"/>
                </div>
              </div>

              <button onClick={nextStep}
                className="w-full btn-primary py-3 mt-2 text-black">
                Continue →
              </button>
            </div>
          )}

          {/* ── Step 1: Password ──────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-lg font-black text-gray-800 mb-4">Create Your Password</h2>

              <div>
                <label className="block text-xs font-semibold text-black uppercase tracking-wide mb-1.5">
                  Password <span className="text-gray-400 font-normal">(min. 8 characters)</span>
                </label>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={password} onChange={e => setPassword(e.target.value)}
                    required minLength={8}
                    className="input-field pr-11"/>
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPwd ? <EyeOff size={17}/> : <Eye size={17}/>}
                  </button>
                </div>
                {password && (
                  <div className="flex gap-1 mt-2">
                    {[4,6,8,10].map(len => (
                      <div key={len} className={clsx(
                        'h-1 flex-1 rounded-full transition-all',
                        password.length >= len ? 'bg-green-500' : 'bg-gray-200'
                      )}/>
                    ))}
                    <span className="text-xs text-gray-400 ml-1">
                      {password.length < 6 ? 'Weak' : password.length < 8 ? 'Fair' : 'Strong'}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-black uppercase tracking-wide mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat your password"
                    value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)}
                    required className="input-field pr-11"/>
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showConfirm ? <EyeOff size={17}/> : <Eye size={17}/>}
                  </button>
                </div>
                {confirmPwd && (
                  <p className={clsx(
                    'text-xs mt-1.5 flex items-center gap-1',
                    password === confirmPwd ? 'text-green-600' : 'text-red-500'
                  )}>
                    {password === confirmPwd ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>

              <div className="flex gap-3 mt-2">
                <button onClick={() => setStep(0)}
                  className="btn-secondary flex-1 py-3 text-black">← Back</button>
                <button onClick={nextStep}
                  className="btn-primary flex-1 py-3 text-black">Continue →</button>
              </div>
            </div>
          )}

          {/* ── Step 2: Subject Combination ──────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-lg font-black text-gray-800 mb-4">Choose Subject Combination</h2>

              {/* Course group */}
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
                    <div className="text-xl mb-1">{COURSE_GROUPS[group].icon}</div>
                    <div className="text-xs font-semibold">{group}</div>
                  </button>
                ))}
              </div>

              {/* Compulsory */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-green-700 text-white text-sm">
                <CheckCircle size={15}/>
                <span className="font-semibold">English Language — Compulsory</span>
              </div>

              {/* Electives */}
              {courseGroup && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Choose 3 Electives ({electives.length}/3 selected)
                  </p>
                  <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
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
                            {sel && <span className="text-white text-[8px] font-black">✓</span>}
                          </div>
                          {sub}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Summary */}
              {courseGroup && electives.length === 3 && (
                <div className="p-3 bg-green-50 rounded-xl border border-green-200 text-sm text-green-800">
                  ✅ <strong>Your combination:</strong> English Language, {electives.join(', ')}
                </div>
              )}

              <div className="flex gap-3 mt-2">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3 text-black">
                  ← Back
                </button>
                <button
                  onClick={handleRegister}
                  disabled={!courseGroup || electives.length !== 3 || loading}
                  className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 text-black">
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Creating…</>
                    : <><UserPlus size={16}/>Create Account</>}
                </button>
              </div>
            </div>
          )}

          {step < 2 && (
            <p className="text-center text-sm text-gray-400 mt-5">
              Already registered?{' '}
              <Link href="/auth/login" className="text-green-700 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
