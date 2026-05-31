// app/page.tsx — Landing page (pure static, no server calls)
// Middleware handles redirect for logged-in users → /dashboard
import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">

      {/* Nav */}
      <nav className="bg-white/80 backdrop-blur border-b border-green-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🇳🇬</span>
            <div>
              <p className="text-green-800 font-black text-lg leading-none">JAMB CBT</p>
              <p className="text-gray-400 text-[10px] tracking-widest uppercase">Unified Tertiary Matriculation</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="btn-secondary text-sm py-2 px-4">Sign In</Link>
            <Link href="/auth/register" className="btn-primary text-sm py-2 px-4">Register</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-20 pb-12 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          🎓 2025/2026 UTME Season Now Open
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight mb-6">
          Practice Your <br />
          <span className="text-green-700">JAMB CBT</span> Exam
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto mb-10">
          Register with your JAMB reg number, choose your subject combination, and take a real 30-minute timed exam. Get your score out of 400 instantly.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap mb-4">
          <Link href="/auth/register" className="btn-primary text-base px-8 py-3 shadow-lg">
            Register Now →
          </Link>
          <Link href="/auth/login" className="btn-secondary text-base px-8 py-3">
            I Have an Account
          </Link>
        </div>
        <p className="text-sm text-gray-500">
          Want your registration link emailed to you?{' '}
          <Link href="/invite" className="text-green-700 font-semibold hover:underline">
            Send me a link →
          </Link>
        </p>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-20 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: '📝', title: 'Simple Registration', desc: 'Sign up with your JAMB reg number and password. No email confirmation required — you are in immediately.' },
          { icon: '📚', title: 'Subject Combination', desc: 'Choose Science, Commercial, or Arts. English is compulsory; pick 3 electives to complete your 4-subject combination.' },
          { icon: '⏱️', title: '30-Minute Timed Exam', desc: 'Countdown timer, question navigator, flag-for-review — exactly how the real JAMB CBT feels.' },
          { icon: '📊', title: 'Instant Score', desc: 'Submit and get your total score out of 400 plus a per-subject breakdown immediately.' },
          { icon: '🔒', title: 'Your Data is Safe', desc: 'Row-level security on every table. Only you can see your results and answers.' },
          { icon: '📧', title: 'Email Invite Link', desc: 'Share a registration link by email. We collect emails for updates — no spam, no confirmation required.' },
        ].map(f => (
          <div key={f.title} className="card hover:shadow-md transition-shadow animate-slide-up">
            <div className="text-4xl mb-3">{f.icon}</div>
            <h3 className="font-bold text-gray-800 mb-2">{f.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="text-center py-6 text-xs text-gray-400 border-t border-gray-100">
        © {new Date().getFullYear()} JAMB CBT Practice Platform · Nigeria · All rights reserved
      </footer>
    </main>
  )
}
