'use client'
// app/admin/setup/page.tsx
// One-time page to create your first admin account.
// Delete app/admin/setup/ folder after use.

import { useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, Eye, EyeOff, CheckCircle } from 'lucide-react'

export default function AdminSetupPage() {
  const [form, setForm] = useState({
    fullName:  '',
    email:     '',
    password:  '',
    setupKey:  '',
  })
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [done,     setDone]     = useState(false)

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')

    const res  = await fetch('/api/admin/create-admin', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(form),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Something went wrong.')
      setLoading(false); return
    }

    setDone(true)
    setLoading(false)
  }

  // ── Success screen ─────────────────────────────────────────────────────
  if (done) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-gray-900
                    flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up text-center">
        <div className="w-20 h-20 bg-green-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-white" size={40}/>
        </div>
        <h1 className="text-2xl font-black text-white mb-2">Admin Account Created!</h1>
        <p className="text-gray-400 text-sm mb-6">
          You can now sign in to the admin panel with <strong className="text-white">{form.email}</strong>
        </p>
        <Link href="/admin/login"
          className="inline-block bg-green-700 hover:bg-green-600 text-white font-bold
                     px-8 py-3 rounded-xl transition-all">
          Go to Admin Login →
        </Link>
        <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-300">
          ⚠ <strong>Important:</strong> Delete the <code>app/admin/setup/</code> folder
          from your project now to prevent unauthorised admin creation.
        </div>
      </div>
    </div>
  )

  // ── Setup form ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-gray-900
                    flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="text-white" size={32}/>
          </div>
          <h1 className="text-2xl font-black text-white">Admin Setup</h1>
          <p className="text-gray-400 text-sm mt-1">Create your first admin account</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm
                            px-4 py-3 rounded-xl mb-5 leading-relaxed">
              <p className="font-bold mb-1">⚠ Error</p>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                Full Name
              </label>
              <input type="text" placeholder="e.g. John Doe"
                value={form.fullName} onChange={set('fullName')} required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
                           text-white placeholder-gray-500 text-sm
                           focus:outline-none focus:ring-2 focus:ring-green-500"/>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                Email Address
              </label>
              <input type="email" placeholder="admin@example.com"
                value={form.email} onChange={set('email')} required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
                           text-white placeholder-gray-500 text-sm
                           focus:outline-none focus:ring-2 focus:ring-green-500"/>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                Password <span className="text-gray-500 normal-case font-normal">(min. 8 characters)</span>
              </label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} placeholder="Minimum 8 characters"
                  value={form.password} onChange={set('password')} required minLength={8}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
                             text-white placeholder-gray-500 text-sm pr-10
                             focus:outline-none focus:ring-2 focus:ring-green-500"/>
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200">
                  {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                Setup Secret Key
              </label>
              <input type="password" placeholder="Value of ADMIN_SETUP_KEY in .env.local"
                value={form.setupKey} onChange={set('setupKey')} required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
                           text-white placeholder-gray-500 text-sm
                           focus:outline-none focus:ring-2 focus:ring-green-500"/>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-green-700 hover:bg-green-600 active:scale-[.98] text-white
                         font-bold py-3 rounded-xl transition-all flex items-center justify-center
                         gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Creating account…</>
                : <><ShieldCheck size={16}/>Create Admin Account</>}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-600 mt-4">
          <Link href="/" className="hover:text-gray-400 transition-colors">
            Already have an account? Sign in →
          </Link>
        </p>
      </div>
    </div>
  )
}
