'use client'
import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

function friendlyError(msg: string) {
  if (msg.includes('Invalid login credentials')) return 'Incorrect registration number or password.'
  if (msg.includes('Email not confirmed'))        return 'Please disable email confirmation in Supabase → Authentication → Settings.'
  if (msg.includes('Too many requests'))          return 'Too many attempts. Please wait a few minutes.'
  return msg
}

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [regNumber, setRegNumber] = useState('')
  const [password,  setPassword]  = useState('')
  const [showPwd,   setShowPwd]   = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase  = await createClient()
    const authEmail = `${regNumber.trim().toLowerCase().replace(/\s+/g,'')}@jambcbt.local`
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password })
    if (error) { setError(friendlyError(error.message)); setLoading(false) }
    else { router.push('/dashboard'); router.refresh() }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🇳🇬</div>
          <h1 className="text-2xl font-black text-green-800">JAMB CBT Portal</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in with your JAMB registration number</p>
        </div>

        {params.get('message') === 'confirmed' && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-5">
            ✅ Account confirmed! You can now sign in.
          </div>
        )}

        <div className="card">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex gap-2">
                <span>⚠</span><span>{error}</span>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                JAMB Registration Number
              </label>
              <input type="text" placeholder="e.g. 12345678AB" value={regNumber}
                onChange={e => setRegNumber(e.target.value)} required autoComplete="username"
                className="input-field uppercase" />
              <p className="text-[11px] text-gray-400 mt-1">The reg number you used when registering</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Password</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} placeholder="Your password" value={password}
                  onChange={e => setPassword(e.target.value)} required autoComplete="current-password"
                  className="input-field pr-10" />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Signing in…
                  </span>
                : '→ Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          New candidate?{' '}
          <Link href="/auth/register" className="text-green-700 font-semibold hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin"/></div>}>
      <LoginForm/>
    </Suspense>
  )
}
