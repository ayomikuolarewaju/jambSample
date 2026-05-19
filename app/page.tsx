// app/page.tsx
// Pure static landing page — no server Supabase call.
// Middleware in middleware.ts handles redirecting logged-in users to /dashboard.
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Navbar */}
      <nav className="border-b border-green-100 bg-white/80 backdrop-blur sticky top-0 z-50">
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
      <section className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          🎓 2025/2026 UTME Season Open
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight mb-6">
          JAMB Computer<br />
          <span className="text-green-700">Based Test</span> Portal
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto mb-10">
          Register, select your subject combinations, and sit your UTME practice exam — all in one place.
          Timed, scored, and designed just like the real thing.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/auth/register"
            className="btn-primary text-base px-8 py-3 shadow-lg hover:shadow-green-200">
            Start Registration →
          </Link>
          <Link href="/auth/login" className="btn-secondary text-base px-8 py-3">
            I Have an Account
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-20 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: '📝', title: 'Subject Combination', desc: 'Choose Science, Commercial, or Arts and pick your 3 elective subjects alongside compulsory English.' },
          { icon: '⏱️', title: '30-Minute Timed Exam', desc: 'Real JAMB-style countdown timer with auto-submission. Flag questions, navigate freely between subjects.' },
          { icon: '📊', title: 'Instant Results', desc: 'Get your score out of 400 immediately after submission with a full per-subject breakdown.' },
        ].map(f => (
          <div key={f.title} className="card hover:shadow-md transition-shadow animate-slide-up">
            <div className="text-4xl mb-4">{f.icon}</div>
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
