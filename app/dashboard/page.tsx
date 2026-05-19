// app/dashboard/page.tsx
import { createClient } from '../lib/supabase/clients'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/auth/LogoutButton'
import ExamRegistrationCard from '@/components/exam/ExamRegistrationCard'

export default async function DashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch registration
  const { data: registration } = await supabase
    .from('exam_registrations')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Fetch session (result) if exists
  const { data: session } = registration
    ? await supabase
        .from('exam_sessions')
        .select('*')
        .eq('registration_id', registration.id)
        .single()
    : { data: null }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🇳🇬</span>
            <div>
              <p className="text-green-800 font-black leading-none text-base">JAMB CBT Portal</p>
              <p className="text-gray-400 text-[10px] tracking-widest uppercase">Candidate Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:block">
              {profile?.full_name || user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-6 text-white animate-fade-in">
          <p className="text-green-200 text-sm mb-1">Welcome back,</p>
          <h1 className="text-2xl font-black">{profile?.full_name || 'Candidate'}</h1>
          <p className="text-green-200 text-sm mt-1">Reg No: <span className="font-bold text-white">{profile?.reg_number}</span></p>
        </div>

        {/* Profile card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">Profile Details</h3>
            <dl className="space-y-2 text-sm">
              {[
                ['Full Name', profile?.full_name],
                ['Reg Number', profile?.reg_number],
                ['Gender', profile?.gender],
                ['Date of Birth', profile?.date_of_birth],
                ['State', profile?.state_of_origin],
              ].map(([k, v]) => (
                <div key={k as string} className="flex justify-between">
                  <dt className="text-gray-500">{k}</dt>
                  <dd className="font-medium text-gray-800 text-right">{v || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Main action card */}
          <div className="md:col-span-2">
            <ExamRegistrationCard
              userId={user.id}
              registration={registration}
              session={session}
            />
          </div>
        </div>

        {/* Past results */}
        {session?.submitted_at && (
          <div className="card animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-700">Your Exam Result</h3>
              <Link href="/results" className="text-green-700 text-sm font-semibold hover:underline">
                View Full Result →
              </Link>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full border-4 border-green-700 flex items-center justify-center bg-green-50 flex-shrink-0">
                <div className="text-center">
                  <div className="text-xl font-black text-green-700">{session.total_score}</div>
                  <div className="text-[10px] text-gray-500">/ 400</div>
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-gray-800">{session.total_score} <span className="text-gray-400 text-lg font-normal">/ 400</span></p>
                <p className="text-sm text-gray-500 mt-1">
                  {session.is_auto_submitted ? '⏱ Auto-submitted (time expired)' : '✅ Submitted manually'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {session.submitted_at ? new Date(session.submitted_at).toLocaleString('en-NG') : ''}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
