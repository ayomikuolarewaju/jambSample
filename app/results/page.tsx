import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/auth/LogoutButton'
import PrintableBtn from '@/components/PrintableBtn'

interface Props {
  searchParams: { session?: string }
}

export default async function ResultsPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  // If a specific session ID is passed, load that attempt
  // Otherwise fall back to the most recent completed session
  let session, registration

  if (searchParams.session) {
    const { data: sess } = await supabase
      .from('exam_sessions').select('*').eq('id', searchParams.session).single()
    session = sess

    if (session) {
      const { data: reg } = await supabase
        .from('exam_registrations').select('*').eq('id', session.registration_id).single()
      registration = reg
    }
  } else {
    // Latest completed
    const { data: reg } = await supabase
      .from('exam_registrations')
      .select('*').eq('user_id', user.id).eq('status', 'completed')
      .order('registered_at', { ascending: false }).limit(1).single()
    registration = reg

    if (registration) {
      const { data: sess } = await supabase
        .from('exam_sessions').select('*').eq('registration_id', registration.id).single()
      session = sess
    }
  }

  if (!session?.submitted_at || !registration) redirect('/dashboard')

  const { data: subjectResults } = await supabase
    .from('subject_results')
    .select('*, subjects(name,code)')
    .eq('session_id', session.id)

  // Best score for this user
  const { data: allSessions } = await supabase
    .from('exam_sessions')
    .select('total_score, registration_id, exam_registrations!inner(user_id)')
    .eq('exam_registrations.user_id', user.id)
    .not('submitted_at', 'is', null)

  const allScores    = (allSessions || []).map((s: any) => s.total_score ?? 0)
  const bestScore    = allScores.length ? Math.max(...allScores) : 0
  const isThisBest   = Math.round(session.total_score ?? 0) >= Math.round(bestScore)
  const totalAttempts = allScores.length

  const totalScore = Math.round(session.total_score ?? 0)
  const pct        = Math.round((totalScore / 400) * 100)

  const perf =
    totalScore >= 280 ? { label:'Excellent',    color:'text-green-700',  bg:'bg-green-50',  border:'border-green-300',  bar:'bg-green-600',  emoji:'🌟' } :
    totalScore >= 200 ? { label:'Good',          color:'text-blue-700',   bg:'bg-blue-50',   border:'border-blue-300',   bar:'bg-blue-500',   emoji:'👍' } :
    totalScore >= 160 ? { label:'Fair',          color:'text-yellow-700', bg:'bg-yellow-50', border:'border-yellow-300', bar:'bg-yellow-500', emoji:'📚' } :
                        { label:'Below Cut-off', color:'text-red-700',    bg:'bg-red-50',    border:'border-red-300',    bar:'bg-red-500',    emoji:'⚠' }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🇳🇬</span>
            <div>
              <p className="text-green-800 font-black leading-none">JAMB CBT Portal</p>
              <p className="text-gray-400 text-[10px] tracking-widest uppercase">Result Slip</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-green-700 font-semibold hover:underline">Dashboard</Link>
            <LogoutButton/>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-slide-up print:py-4">

        {/* Header */}
        <div className="card text-center">
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Examination Result Slip</p>
          <h1 className="text-2xl font-black text-gray-800">{profile?.full_name}</h1>
          <p className="text-gray-500 text-sm mt-1">
            Reg No: <strong>{profile?.reg_number}</strong> &nbsp;·&nbsp;
            {registration.course_group} Combination &nbsp;·&nbsp;
            Attempt #{registration.attempt_number || totalAttempts}
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Submitted: {session.submitted_at && new Date(session.submitted_at).toLocaleString('en-NG', { dateStyle:'long', timeStyle:'short' })}
            {session.is_auto_submitted ? ' (Auto-submitted — time expired)' : ''}
          </p>
          {isThisBest && totalAttempts > 1 && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1.5 rounded-full">
              🏆 This is your best score so far!
            </div>
          )}
        </div>

        {/* Score */}
        <div className={`card flex flex-col sm:flex-row items-center gap-8 ${perf.bg} border-2 ${perf.border}`}>
          <div className={`w-36 h-36 rounded-full border-8 ${perf.border} flex flex-col items-center justify-center flex-shrink-0 bg-white`}>
            <span className="text-3xl">{perf.emoji}</span>
            <p className={`text-3xl font-black ${perf.color} leading-none mt-1`}>{totalScore}</p>
            <p className="text-gray-400 text-xs">/ 400</p>
          </div>
          <div className="flex-1 w-full">
            <p className={`text-2xl font-black ${perf.color}`}>{perf.label} Performance</p>
            <p className="text-gray-600 text-sm mt-1">
              You scored <strong>{totalScore} / 400</strong> ({pct}%).{' '}
              {totalScore >= 180 ? 'You meet the minimum JAMB score for most universities.'
                                 : 'The minimum cut-off for most federal universities is 180.'}
            </p>
            <div className="mt-3 max-w-xs">
              <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                <span>0</span><span>Cut-off (180)</span><span>400</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${perf.bar}`} style={{ width:`${pct}%` }}/>
              </div>
            </div>
            {totalAttempts > 1 && (
              <p className="text-xs text-gray-500 mt-2">
                🎯 Best score across {totalAttempts} attempts: <strong>{Math.round(bestScore)}/400</strong>
              </p>
            )}
          </div>
        </div>

        {/* Subject breakdown */}
        <div className="card">
          <h2 className="section-title">Subject Scores</h2>
          <div className="space-y-5">
            {subjectResults?.map((sr: any) => {
              const subPct   = Math.round((sr.correct_count / sr.questions_total) * 100)
              const subScore = Math.round(sr.score)
              const barColor = subPct >= 70 ? 'bg-green-600' : subPct >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              return (
                <div key={sr.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <span className="font-semibold text-gray-800 text-sm">{sr.subjects?.name}</span>
                      <span className="text-gray-400 text-xs ml-2">({sr.correct_count}/{sr.questions_total} correct)</span>
                    </div>
                    <div>
                      <span className="font-black text-gray-800 text-base">{subScore}</span>
                      <span className="text-gray-400 text-xs">/100</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width:`${subPct}%` }}/>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* What next */}
        <div className="card bg-green-50 border border-green-200">
          <h3 className="font-bold text-green-800 mb-2">📝 What Next?</h3>
          <ul className="text-sm text-green-700 space-y-1.5 list-disc pl-4">
            <li>Visit <strong>jamb.gov.ng</strong> to register for the official UTME.</li>
            <li>Check your preferred institution's departmental cut-off marks.</li>
            {totalScore < 180 && (
              <li className="text-red-600 font-medium">
                Your score is below 180. Go back to the dashboard and take another attempt!
              </li>
            )}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-4 flex-wrap print:hidden">
          <PrintableBtn/>
          <Link href="/dashboard" className="btn-primary">← Back to Dashboard</Link>
        </div>
      </main>
    </div>
  )
}
