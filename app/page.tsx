// app/page.tsx — Landing page
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-gray-900
                    flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl animate-slide-up">
        <div className="text-6xl mb-4">🇳🇬</div>
        <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
          JAMB CBT<br/>
          <span className="text-green-400">Practice Portal</span>
        </h1>
        <p className="text-green-200 text-lg mb-10 leading-relaxed max-w-xl mx-auto">
          Prepare for your JAMB UTME with our free Computer-Based Test practice platform.
          Real exam conditions, instant results, and detailed subject breakdowns.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Link href="/auth/register"
            className="bg-white text-green-800 font-black px-8 py-4 rounded-2xl
                       hover:bg-green-50 transition-all active:scale-[.97] text-lg shadow-lg">
            Register &amp; Start Practising
          </Link>
          <Link href="/auth/login"
            className="border-2 border-white/30 text-white font-bold px-8 py-4 rounded-2xl
                       hover:bg-white/10 transition-all active:scale-[.97] text-lg">
            Sign In
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          {[
            { icon: '📚', label: '21 Subjects', sub: 'All JAMB subjects' },
            { icon: '⏱',  label: '30 Minutes', sub: 'Real exam timer' },
            { icon: '📊', label: 'Instant Results', sub: 'Per-subject scores' },
          ].map(f => (
            <div key={f.label} className="bg-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl mb-1">{f.icon}</div>
              <p className="text-white font-bold text-sm">{f.label}</p>
              <p className="text-green-300 text-xs mt-0.5">{f.sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-green-400 text-xs">
          <Link href="/invite" className="hover:text-green-200 transition-colors">
            Received an invite link? Click here →
          </Link>
        </div>
      </div>
      <div>
        <footer className="text-center py-6 text-xs text-gray-400 border-t border-gray-100">
        © {new Date().getFullYear()} JAMB CBT Practice Platform · Nigeria · All rights reserved
      </footer>
      </div>
    </div>
  )
}

