'use client'
// app/invite/page.tsx — Email capture for guest exam link

import { useState } from 'react'
import { Mail, Send } from 'lucide-react'

export default function InvitePage() {
  const [firstName, setFirstName] = useState('')
  const [email,     setEmail]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [success,   setSuccess]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')

    const res  = await fetch('/api/send-invite', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ firstName: firstName.trim(), email: email.trim() }),
    })
    const data = await res.json()

    if (!res.ok) { setError(data.error || 'Something went wrong.'); setLoading(false); return }
    setSuccess(true)
    setLoading(false)
  }

  if (success) return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-gray-900
                    flex items-center justify-center p-4">
      <div className="card max-w-md w-full text-center animate-slide-up">
        <div className="text-5xl mb-4">📧</div>
        <h2 className="text-xl font-black text-gray-800 mb-2">Check Your Email!</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          We sent an exam link to <strong className="text-gray-800">{email}</strong>.
          Click the link in the email to start your practice exam.
        </p>
        <p className="text-gray-400 text-xs mt-4">
          Didn&apos;t receive it? Check your spam folder or{' '}
          <button onClick={() => setSuccess(false)}
            className="text-green-700 font-semibold hover:underline">
            try again
          </button>.
        </p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-gray-900
                    flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📬</div>
          <h1 className="text-2xl font-black text-white">Get Your Exam Link</h1>
          <p className="text-green-300 text-sm mt-1">
            Enter your details to receive a free practice exam link
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm
                            px-4 py-3 rounded-xl mb-5">
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600
                                uppercase tracking-wide mb-1.5">
                First Name
              </label>
              <input type="text" placeholder="e.g. Chukwuemeka"
                value={firstName} onChange={e => setFirstName(e.target.value)}
                required className="input-field"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600
                                uppercase tracking-wide mb-1.5">
                Email Address
              </label>
              <input type="email" placeholder="your@email.com"
                value={email} onChange={e => setEmail(e.target.value)}
                required className="input-field"/>
            </div>
            <button type="submit" disabled={loading}
              className="w-full btn-primary py-3.5 flex items-center justify-center gap-2">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Sending…</>
                : <><Send size={16}/>Send My Exam Link</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
