// app/results/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/auth/LogoutButton'

export default async function ResultsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const { data: registration } = await supabase
    .from('exam_registrations').select('*').eq('user_id', user.id).single()

  if (!registration) redirect('/dashboard')

  const { data: session } = await supabase
    .from('exam_sessions').select('*').eq('registration_id', registration.id).single()

  if (!session?.submitted_at) redirect('/exam')

  const { data: subjectResults } = await supabase
    .from('subject_results')
    .select('*, subjects(name, code)')
    .eq('session_id', session.id)

  const totalScore = session.total_score ?? 0
  const pct = Math.round((totalScore / 400) * 100)

  const performance =
    totalScore >= 280 ? { label: 'Excellent', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-300', emoji: '🌟' } :
    totalScore >= 200 ? { label: 'Good',      color: 'text-blue-700',  bg: 'bg-blue-50',  border: 'border-blue-300',  emoji: '👍' } :
    totalScore >= 160 ? { label: 'Fair',       color: 'text-yellow-700',bg: 'bg-yellow-50',border: 'border-yellow-300',emoji: '📚' } :
                        { label: 'Below Cut-off', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300', emoji: '⚠' }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🇳🇬</span>
            <span className="font-black text-green-800">JAMB CBT · Result Slip</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-green-700 font-semibold hover:underline">Dashboard</Link>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-slide-up">
        {/* Result header */}
        <div className="card text-center">
          <p className="text-gray-400 text-sm mb-1">EXAMINATION RESULT SLIP</p>
          <h1 className="text-2xl font-black text-gray-800">{profile?.full_name}</h1>
          <p className="text-gray-500 text-sm">Reg. No: <strong>{profile?.reg_number}</strong> · {registration.course_group} Combination</p>
          <p className="text-gray-400 text-xs mt-1">
            Submitted: {session.submitted_at ? new Date(session.submitted_at).toLocaleString('en-NG', { dateStyle: 'long', timeStyle: 'short' }) : ''}
            {session.is_auto_submitted ? ' (Auto-submitted)' : ''}
          </p>
        </div>

        {/* Score */}
        <div className={`card flex flex-col md:flex-row items-center gap-8 ${performance.bg} border-2 ${performance.border}`}>
          <div className={`w-36 h-36 rounded-full border-8 ${performance.border} flex flex-col items-center justify-center flex-shrink-0 bg-white`}>
            <span className="text-3xl font-black">{performance.emoji}</span>
            <p className={`text-3xl font-black ${performance.color} leading-none mt-1`}>{Math.round(totalScore)}</p>
            <p className="text-gray-400 text-xs">/ 400</p>
          </div>
          <div>
            <p className={`text-2xl font-black ${performance.color}`}>{performance.label} Performance</p>
            <p className="text-gray-500 text-sm mt-1">
              You scored <strong>{Math.round(totalScore)}/400</strong> ({pct}%).
              {totalScore >= 180
                ? ' You meet the minimum UTME score for most universities.'
                : ' The minimum JAMB cut-off for most federal universities is 180.'}
            </p>
            <div className="mt-3 w-full max-w-xs">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>0</span><span>Cut-off (180)</span><span>400</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${performance.color.replace('text','bg')}`}
                  style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Per-subject breakdown */}
        <div className="card">
          <h2 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wide">Subject Scores</h2>
          <div className="space-y-4">
            {subjectResults?.map((sr: any) => {
              const subPct = Math.round((sr.correct_count / sr.questions_total) * 100)
              const subScore = Math.round(sr.score)
              const color = subPct >= 70 ? 'bg-green-600' : subPct >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              return (
                <div key={sr.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <span className="font-semibold text-gray-800 text-sm">{sr.subjects?.name}</span>
                      <span className="text-gray-400 text-xs ml-2">({sr.correct_count}/{sr.questions_total} correct)</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-gray-800">{subScore}</span>
                      <span className="text-gray-400 text-xs">/100</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${color}`}
                      style={{ width: `${subPct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Advice */}
        <div className="card bg-green-50 border border-green-200">
          <h3 className="font-bold text-green-800 mb-2">📝 What Next?</h3>
          <ul className="text-sm text-green-700 space-y-1.5 list-disc pl-4">
            <li>Visit the official JAMB portal at <strong>jamb.gov.ng</strong> for your official UTME result.</li>
            <li>Check your preferred institution's departmental cut-off marks.</li>
            <li>Keep your registration number safe for post-UTME processing.</li>
            {totalScore < 180 && <li className="text-red-600">Consider registering for JAMB remediation or rescheduling to improve your score.</li>}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-4 flex-wrap">
          <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2">
            🖨️ Print Result Slip
          </button>
          <Link href="/dashboard" className="btn-primary">← Back to Dashboard</Link>
        </div>
      </main>
    </div>
  )
}
