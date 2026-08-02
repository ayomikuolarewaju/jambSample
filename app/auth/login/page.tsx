'use client'
// app/auth/login/page.tsx
// Candidate login — reg number + password

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [regNumber, setRegNumber] = useState('')
  const [password,  setPassword]  = useState('')
  const [showPwd,   setShowPwd]   = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')

    const supabase = createClient()

    // Candidates sign in with regnumber@jambcbt.local
    const email = `${regNumber.trim().toUpperCase()}@jambcbt.local`

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError('Invalid registration number or password. Please check and try again.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-gray-900
                    flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mb-6" >
              <Image src="/images/logo.png" alt="Hero" width={200} height={200} className='rounded-3xl shadow-2xl border-4 border-white/10 transform hover:scale-[1.02] transition-transform duration-500'/>
          </div>
          <p className="text-green-300 text-sm mt-1">Candidate Sign In</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-lg font-black text-gray-800 mb-6">Sign In to Your Account</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm
                            px-4 py-3 rounded-xl mb-5 flex gap-2">
              <span className="flex-shrink-0">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600
                                uppercase tracking-wide mb-1.5">
                JAMB Registration Number
              </label>
              <input
                type="text"
                placeholder="e.g. 12345678AB"
                value={regNumber}
                onChange={e => setRegNumber(e.target.value)}
                required
                autoComplete="username"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200
                           text-gray-800 placeholder-gray-400 text-sm font-mono
                           focus:outline-none focus:border-green-600 focus:ring-2
                           focus:ring-green-100 transition-all uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600
                                uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200
                             text-gray-800 placeholder-gray-400 text-sm pr-11
                             focus:outline-none focus:border-green-600 focus:ring-2
                             focus:ring-green-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-gray-400 hover:text-gray-600 transition-colors">
                  {showPwd ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 hover:bg-green-600 active:scale-[.98]
                         text-white font-bold py-3.5 rounded-xl transition-all
                         flex items-center justify-center gap-2
                         disabled:opacity-50 disabled:cursor-not-allowed">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent
                                     rounded-full animate-spin"/>Signing in…</>
                : <><LogIn size={16}/>Sign In</>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register"
              className="text-green-700 font-semibold hover:underline">
              Register here
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-green-400 mt-6">
          Having trouble?{' '}
          <a href="/" className="hover:text-green-200 transition-colors">
            Back to Home
          </a>
        </p>
      </div>
    </div>
  )
}
