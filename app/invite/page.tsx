'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Mail, Send, CheckCircle } from 'lucide-react'

export default function InvitePage() {
  const [firstName, setFirstName] = useState('')
  const [email,     setEmail]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [success,   setSuccess]   = useState(false)
  const [error,     setError]     = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/send-invite', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error || 'Something went wrong. Please try again.')
      else setSuccess(true)
    } catch { setError('Network error. Please check your connection.') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">

        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🇳🇬</div>
          <h1 className="text-2xl font-black text-green-800">Get Your Registration Link</h1>
          <p className="text-gray-500 text-sm mt-1">We'll email you a direct link to the registration page</p>
        </div>

        {success ? (
          <div className="card text-center animate-fade-in">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-700" size={32} />
            </div>
            <h2 className="font-black text-gray-800 text-xl mb-2">Check Your Inbox!</h2>
            <p className="text-gray-500 text-sm mb-1">
              We sent a registration link to <strong className="text-gray-700">{email}</strong>.
            </p>
            <p className="text-gray-400 text-xs mb-6">Can't find it? Check your spam or junk folder.</p>
            <div className="border-t border-gray-100 pt-5">
              <p className="text-xs text-gray-400 mb-3">Or register directly right now:</p>
              <Link href="/auth/register" className="btn-primary w-full block text-center">Register Now →</Link>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="flex items-start gap-3 mb-5 p-3 bg-green-50 rounded-xl border border-green-200">
              <Mail className="text-green-700 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-green-800">
                Enter your details and we'll send you a <strong>direct registration link</strong>. No email confirmation — the link takes you straight to sign-up.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex gap-2">
                  <span>⚠</span><span>{error}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input type="text" placeholder="e.g. Fatima" value={firstName}
                  onChange={e => setFirstName(e.target.value)} required className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input type="email" placeholder="your@email.com" value={email}
                  onChange={e => setEmail(e.target.value)} required className="input-field" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Sending…</>
                  : <><Send size={14}/>Send My Registration Link</>}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-gray-100 text-center space-y-1">
              <p className="text-xs text-gray-400">Already have an account?</p>
              <div className="flex justify-center gap-4">
                <Link href="/auth/login"    className="text-green-700 text-sm font-semibold hover:underline">Sign In</Link>
                <span className="text-gray-200">|</span>
                <Link href="/auth/register" className="text-green-700 text-sm font-semibold hover:underline">Register Directly</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
