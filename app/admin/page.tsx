'use client'
// app/admin/login/page.tsx

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = await createClient()

    // Step 1 — Supabase Auth sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email:    email.trim(),
      password,
    })

    if (signInError) {
      setError(
        signInError.message.includes('Invalid login credentials')
          ? 'Incorrect email or password. Make sure you created the account via /admin/setup.'
          : signInError.message
      )
      setLoading(false)
      return
    }

    // Step 2 — Verify email exists in admins table
    // RLS is disabled on admins so this will always work for authenticated users
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('id, full_name, role, is_active')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (adminError) {
      await supabase.auth.signOut()
      setError(`Could not verify admin: ${adminError.message}`)
      setLoading(false)
      return
    }

    if (!admin) {
      await supabase.auth.signOut()
      setError(
        `No admin record found for "${email}". ` +
        `Go to /admin/setup to create your admin account first.`
      )
      setLoading(false)
      return
    }

    if (!admin.is_active) {
      await supabase.auth.signOut()
      setError('This admin account has been deactivated.')
      setLoading(false)
      return
    }

    router.push('/admin/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-gray-900
                    flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-700 rounded-2xl flex items-center
                          justify-center mx-auto mb-4 shadow-lg">
            <ShieldCheck className="text-white" size={32}/>
          </div>
          <h1 className="text-2xl font-black text-white">Admin Portal</h1>
          <p className="text-gray-400 text-sm mt-1">JAMB CBT Question Bank Manager</p>
        </div>

        {/* Form card */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-5">

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300
                              text-sm px-4 py-3 rounded-xl leading-relaxed">
                <p className="font-bold mb-1">⚠ Login failed</p>
                <p>{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-400
                                uppercase tracking-wide mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
                           text-white placeholder-gray-500 text-sm
                           focus:outline-none focus:ring-2 focus:ring-green-500
                           focus:border-transparent"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-400
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
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
                             text-white placeholder-gray-500 text-sm pr-10
                             focus:outline-none focus:ring-2 focus:ring-green-500
                             focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-gray-400 hover:text-gray-200 transition-colors">
                  {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 hover:bg-green-600 active:scale-[.98]
                         text-white font-bold py-3 rounded-xl transition-all
                         flex items-center justify-center gap-2
                         disabled:opacity-50 disabled:cursor-not-allowed mt-2">
              {loading
                ? <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent
                                     rounded-full animate-spin"/>
                    Signing in…
                  </>
                : <>
                    <ShieldCheck size={16}/>
                    Sign In to Admin Panel
                  </>}
            </button>

          </form>
        </div>

        {/* Footer links */}
        <div className="text-center mt-5 space-y-1">
          <p className="text-xs text-gray-600">
            First time?{' '}
            <a href="/admin/setup"
               className="text-green-500 hover:text-green-400 transition-colors font-medium">
              Create admin account →
            </a>
          </p>
          <p className="text-xs text-gray-700">
            <a href="/" className="hover:text-gray-500 transition-colors">
              ← Back to Portal
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
