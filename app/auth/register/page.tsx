'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, CheckCircle } from 'lucide-react'
import clsx from 'clsx'

const COURSE_GROUPS = {
  Science:    { icon: '🔬', description: 'Medicine, Engineering, Computer Science', electives: ['Mathematics','Physics','Chemistry','Biology','Agricultural Science'] },
  Commercial: { icon: '💼', description: 'Accounting, Business Admin, Economics',   electives: ['Mathematics','Economics','Commerce','Accounting','Government'] },
  Arts:       { icon: '🎨', description: 'Mass Communication, Linguistics, Law',     electives: ['Literature in English','Government','Economics','Geography','Biology'] },
} as const
type CourseGroup = keyof typeof COURSE_GROUPS

const NIGERIA_STATES = ['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara']

export default function RegisterPage() {
  const router = useRouter()
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [form, setForm] = useState({
    fullName:'', regNumber:'', email:'', phone:'',
    dateOfBirth:'', gender:'', stateOfOrigin:'',
    password:'', confirmPassword:'',
    courseGroup:'' as CourseGroup|'', electives:[] as string[],
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const toggleElective = (sub: string) => setForm(f => {
    if (f.electives.includes(sub)) return { ...f, electives: f.electives.filter(s => s !== sub) }
    if (f.electives.length >= 3) return f
    return { ...f, electives: [...f.electives, sub] }
  })

  const isValid = !!(form.fullName && form.regNumber && form.phone &&
    form.dateOfBirth && form.gender && form.stateOfOrigin &&
    form.password.length >= 6 && form.password === form.confirmPassword &&
    form.courseGroup && form.electives.length === 3)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    setLoading(true); setError('')
    const supabase  = createClient()
    const authEmail = `${form.regNumber.trim().toLowerCase().replace(/\s+/g,'')}@jambcbt.local`

    const { error: signUpError } = await supabase.auth.signUp({
      email: authEmail, password: form.password,
      options: {
        emailRedirectTo: undefined,
        data: {
          full_name: form.fullName.toUpperCase().trim(),
          reg_number: form.regNumber.toUpperCase().trim(),
          contact_email: form.email.trim(),
          phone: form.phone.trim(),
          date_of_birth: form.dateOfBirth,
          gender: form.gender,
          state_of_origin: form.stateOfOrigin,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message.includes('already registered')
        ? 'This registration number already has an account. Please sign in.'
        : signUpError.message)
      setLoading(false); return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email: authEmail, password: form.password })
    if (signInError) {
      setError('Account created but sign-in failed. In Supabase → Authentication → Settings, disable "Enable email confirmations" and try again.')
      setLoading(false); return
    }

    localStorage.setItem('jamb_combination', JSON.stringify({ courseGroup: form.courseGroup, electives: form.electives }))
    router.push('/dashboard')
    router.refresh()
  }

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">{children}</label>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-10 px-4">
      <div className="max-w-2xl mx-auto animate-slide-up">

        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🇳🇬</div>
          <h1 className="text-2xl font-black text-green-800">JAMB CBT Registration</h1>
          <p className="text-gray-500 text-sm mt-1">Create your candidate account and choose your subject combination</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex gap-2">
              <span>⚠</span><span>{error}</span>
            </div>
          )}

          {/* ── Personal Info ─────────────────────────────────────── */}
          <div>
            <h2 className="section-title">👤 Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>Full Name (Surname First) <span className="text-red-500">*</span></Label>
                <input type="text" placeholder="e.g. IBRAHIM Fatima Bello"
                  value={form.fullName} onChange={set('fullName')} required className="input-field" />
              </div>
              <div>
                <Label>JAMB Reg Number <span className="text-red-500">*</span></Label>
                <input type="text" placeholder="e.g. 12345678AB"
                  value={form.regNumber} onChange={set('regNumber')} required className="input-field uppercase" />
                <p className="text-[11px] text-gray-400 mt-1">This will be your sign-in username</p>
              </div>
              <div>
                <Label>Phone Number <span className="text-red-500">*</span></Label>
                <input type="tel" placeholder="08012345678"
                  value={form.phone} onChange={set('phone')} required className="input-field" />
              </div>
              <div>
                <Label>Date of Birth <span className="text-red-500">*</span></Label>
                <input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} required className="input-field" />
              </div>
              <div>
                <Label>Gender <span className="text-red-500">*</span></Label>
                <select value={form.gender} onChange={set('gender')} required className="input-field">
                  <option value="">Select Gender</option>
                  <option>Male</option><option>Female</option>
                </select>
              </div>
              <div>
                <Label>State of Origin <span className="text-red-500">*</span></Label>
                <select value={form.stateOfOrigin} onChange={set('stateOfOrigin')} required className="input-field">
                  <option value="">Select State</option>
                  {NIGERIA_STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <Label>Email Address <span className="text-[10px] font-normal text-gray-400 normal-case ml-1">(optional — for updates)</span></Label>
                <input type="email" placeholder="your@email.com"
                  value={form.email} onChange={set('email')} className="input-field" />
                <p className="text-[11px] text-gray-400 mt-1">No confirmation email will be sent</p>
              </div>
            </div>
          </div>

          {/* ── Password ──────────────────────────────────────────── */}
          <div>
            <h2 className="section-title">🔒 Set Password</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Password <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} placeholder="Min. 6 characters"
                    value={form.password} onChange={set('password')} required minLength={6} className="input-field pr-10" />
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>
              <div>
                <Label>Confirm Password <span className="text-red-500">*</span></Label>
                <input type="password" placeholder="Repeat password"
                  value={form.confirmPassword} onChange={set('confirmPassword')} required
                  className={clsx('input-field', form.confirmPassword && form.confirmPassword !== form.password && 'border-red-400 focus:ring-red-400')} />
                {form.confirmPassword && form.confirmPassword !== form.password && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Subject Combination ───────────────────────────────── */}
          <div>
            <h2 className="section-title">📚 Subject Combination</h2>
            <p className="text-xs text-gray-500 mb-4">English Language is compulsory. Choose your course group then pick 3 electives.</p>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {(Object.entries(COURSE_GROUPS) as [CourseGroup, typeof COURSE_GROUPS[CourseGroup]][]).map(([group, info]) => (
                <button type="button" key={group}
                  onClick={() => setForm(f => ({ ...f, courseGroup: group, electives: [] }))}
                  className={clsx('p-3 rounded-xl border-2 text-left transition-all',
                    form.courseGroup === group ? 'border-green-700 bg-green-50' : 'border-gray-200 hover:border-green-300')}>
                  <div className="text-2xl mb-1">{info.icon}</div>
                  <div className="font-bold text-sm text-gray-800">{group}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">{info.description}</div>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-green-700 text-white text-sm mb-3">
              <CheckCircle size={14}/><span className="font-semibold">English Language — Compulsory</span>
            </div>

            {form.courseGroup ? (
              <>
                <p className="text-xs text-gray-500 mb-2 font-medium">Choose 3 electives ({form.electives.length}/3 selected):</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  {COURSE_GROUPS[form.courseGroup].electives.map(sub => {
                    const sel   = form.electives.includes(sub)
                    const maxed = form.electives.length >= 3 && !sel
                    return (
                      <button type="button" key={sub} onClick={() => toggleElective(sub)} disabled={maxed}
                        className={clsx('flex items-center gap-2 p-3 rounded-xl border-2 text-xs text-left transition-all',
                          sel   ? 'border-green-700 bg-green-50 text-green-800 font-semibold' :
                          maxed ? 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50' :
                                  'border-gray-200 hover:border-green-300 text-gray-700')}>
                        <div className={clsx('w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center',
                          sel ? 'bg-green-700 border-green-700' : 'border-gray-300')}>
                          {sel && <span className="text-white text-[8px]">✓</span>}
                        </div>
                        {sub}
                      </button>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-6 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                ☝ Select a course group above to choose your electives
              </div>
            )}

            {form.courseGroup && form.electives.length === 3 && (
              <div className="p-3 bg-green-50 rounded-xl border border-green-200 text-sm text-green-800">
                ✅ <strong>Your combination:</strong> English Language, {form.electives.join(', ')}
              </div>
            )}
          </div>

          {/* ── Submit ────────────────────────────────────────────── */}
          <button type="submit" disabled={!isValid || loading} className="btn-primary w-full py-3 text-base">
            {loading
              ? <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                  Creating your account…
                </span>
              : '🎓 Register & Enter Exam Portal'}
          </button>

          <p className="text-center text-sm text-gray-500 -mt-2">
            Already registered?{' '}
            <Link href="/auth/login" className="text-green-700 font-semibold hover:underline">Sign in here</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
