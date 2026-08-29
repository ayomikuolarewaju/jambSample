import { createClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/auth/LogoutButton'
import ExamRegistrationCard from '@/components/exam/ExamRegistrationCard'
import { Trophy, TrendingUp, Clock, Target } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  // ── All COMPLETED attempts (submitted_at is not null) ─────────────────
  const { data: attempts } = await supabase
    .from('exam_registrations')
    .select(`
      id, course_group, attempt_number, registered_at,
      exam_sessions (
        id, total_score, submitted_at, is_auto_submitted, time_remaining
      )
    `)
    .eq('user_id', user.id)
    .order('registered_at', { ascending: false })

  // Filter down to only completed ones (session exists + has submitted_at)
  const completed = (attempts || []).filter((a: any) => {
    const sess = Array.isArray(a.exam_sessions)
      ? a.exam_sessions[0]
      : a.exam_sessions
    return sess?.submitted_at
  })

  // ── Active in-progress session (status = in_progress, session NOT submitted) ──
  const { data: activeReg } = await supabase
    .from('exam_registrations')
    .select('id, status, exam_sessions ( id, submitted_at )')
    .eq('user_id', user.id)
    .eq('status', 'in_progress')
    .order('registered_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Only treat as active if the session is NOT yet submitted
  const rawSession = Array.isArray(activeReg?.exam_sessions)
    ? activeReg?.exam_sessions[0]
    : activeReg?.exam_sessions

  const activeSession = (rawSession && !rawSession.submitted_at)
    ? { id: rawSession.id, registration_id: activeReg!.id, submitted_at: null }
    : null

  // ── Stats ─────────────────────────────────────────────────────────────
  const scores = completed
    .map((a: any) => {
      const sess = Array.isArray(a.exam_sessions) ? a.exam_sessions[0] : a.exam_sessions
      return sess?.total_score ?? 0
    })
    .filter((s: number) => s > 0)

  const bestScore     = scores.length ? Math.round(Math.max(...scores)) : null
  const latestScore   = scores.length ? Math.round(scores[0]) : null
  const avgScore      = scores.length
    ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
    : null
  const totalAttempts = completed.length

  const perfLabel = (score: number) =>
    score >= 280 ? { label: 'Excellent',  color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200'  } :
    score >= 200 ? { label: 'Good',       color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200'   } :
    score >= 160 ? { label: 'Fair',       color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' } :
                   { label: 'Keep Going', color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200'    }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🇳🇬</span>
            <div>
              <p className="text-green-800 font-black leading-none">JAMB CBT Portal</p>
              <p className="text-gray-400 text-[10px] tracking-widest uppercase">Candidate Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:block font-medium">{profile?.full_name}</span>
            <LogoutButton/>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-6 text-white animate-fade-in">
          <p className="text-green-200 text-sm mb-1">Welcome back,</p>
          <h1 className="text-2xl font-black">{profile?.full_name || 'Candidate'}</h1>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-green-200">
            <span>Reg No: <strong className="text-white">{profile?.reg_number}</strong></span>
            {profile?.state_of_origin && <span>📍 {profile.state_of_origin}</span>}
            <span>🎯 {totalAttempts} attempt{totalAttempts !== 1 ? 's' : ''} completed</span>
          </div>
        </div>

        {/* Stats — only when at least one attempt done */}
        {totalAttempts > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up">
            {[
              { icon: Trophy,    label: 'Best Score',     value: bestScore    !== null ? `${bestScore}/400`   : '—', sub: bestScore    !== null ? perfLabel(bestScore).label    : '', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
              { icon: TrendingUp,label: 'Latest Score',   value: latestScore  !== null ? `${latestScore}/400` : '—', sub: latestScore  !== null ? perfLabel(latestScore).label  : '', color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200'  },
              { icon: Target,    label: 'Average Score',  value: avgScore     !== null ? `${avgScore}/400`    : '—', sub: avgScore      !== null ? `${Math.round((avgScore/400)*100)}%` : '', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
              { icon: Clock,     label: 'Total Attempts', value: totalAttempts, sub: totalAttempts >= 3 ? 'Keep practising!' : 'More = better score', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
            ].map(s => (
              <div key={s.label} className={`card border ${s.border} ${s.bg}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 bg-white`}>
                  <s.icon className={s.color} size={18}/>
                </div>
                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                {s.sub && <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile card */}
          <div className="card">
            <h3 className="section-title text-sm">Profile Details</h3>
            <dl className="space-y-2 text-sm">
              {([
                ['Full Name',     profile?.full_name],
                ['Reg Number',    profile?.reg_number],
                ['Gender',        profile?.gender],
                ['Date of Birth', profile?.date_of_birth],
                ['State',         profile?.state_of_origin],
                ['Email',         profile?.contact_email || '—'],
              ] as [string, string|null|undefined][]).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2">
                  <dt className="text-gray-400 flex-shrink-0">{k}</dt>
                  <dd className="font-medium text-gray-800 text-right truncate">{v || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Start exam card */}
          <div className="md:col-span-2">
            {/* Only pass activeSession if it is truly in-progress (not submitted) */}
            <ExamRegistrationCard userId={user.id} activeSession={activeSession}/>
          </div>
        </div>

        {/* Attempt history */}
        {totalAttempts > 0 && (
          <div className="card animate-slide-up">
            <h3 className="section-title">📊 Attempt History</h3>
            <div className="space-y-3">
              {completed.map((attempt: any, idx: number) => {
                const sess  = Array.isArray(attempt.exam_sessions)
                  ? attempt.exam_sessions[0]
                  : attempt.exam_sessions
                const score = Math.round(sess?.total_score ?? 0)
                const pct   = Math.round((score / 400) * 100)
                const perf  = perfLabel(score)
                const isBest = bestScore !== null && score === bestScore

                return (
                  <div key={attempt.id}
                    className={[
                      'flex items-center gap-4 p-4 rounded-xl border-2 transition-all',
                      isBest ? 'border-yellow-300 bg-yellow-50' : 'border-gray-100 bg-white hover:border-gray-200'
                    ].join(' ')}>

                    {/* Attempt number */}
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-black text-gray-600">
                        #{attempt.attempt_number || (totalAttempts - idx)}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-800 text-sm">
                          {attempt.course_group} Combination
                        </span>
                        {isBest && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-200 text-yellow-800">
                            🏆 Best Score
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${perf.bg} ${perf.color} ${perf.border} border`}>
                          {perf.label}
                        </span>
                        {sess?.is_auto_submitted && (
                          <span className="text-[10px] text-gray-400">⏱ Auto-submitted</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {sess?.submitted_at && new Date(sess.submitted_at).toLocaleString('en-NG', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>

                    {/* Score + bar */}
                    <div className="text-right flex-shrink-0">
                      <p className={`text-xl font-black ${perf.color}`}>{score}</p>
                      <p className="text-xs text-gray-400">/ 400</p>
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-full ${pct >= 70 ? 'bg-green-600' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">{pct}%</p>
                    </div>

                    {/* View result */}
                    <Link
                      href={`/results?session=${sess?.id}`}
                      className="btn-secondary text-xs py-1.5 px-3 flex-shrink-0">
                      View →
                    </Link>
                  </div>
                )
              })}
            </div>

            {/* Progress note — compare latest two */}
            {totalAttempts >= 2 && scores.length >= 2 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                {scores[0] > scores[1]
                  ? `📈 Great progress! Your latest score is ${Math.round(scores[0] - scores[1])} marks higher than your previous attempt.`
                  : scores[0] < scores[1]
                  ? `💪 Keep going! You scored ${Math.round(scores[1] - scores[0])} higher in your previous attempt. Review weak subjects and try again.`
                  : `🎯 Consistent score! Try different strategies to push higher.`
                }
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {totalAttempts === 0 && !activeSession && (
          <div className="card text-center py-10 border-2 border-dashed border-gray-200">
            <div className="text-5xl mb-3">📝</div>
            <h3 className="font-bold text-gray-700 mb-1">No exams taken yet</h3>
            <p className="text-gray-400 text-sm">
              Click <strong>+ New Attempt</strong> above to start your first practice exam.
            </p>
          </div>
        )}

      </main>
    </div>
  )
}
