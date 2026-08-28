// app/not-found.tsx
// Shown for any unmatched route in the app

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-gray-900
                    flex items-center justify-center p-6">
      <div className="text-center animate-slide-up max-w-md">

        {/* Big 404 */}
        <div className="relative mb-6">
          <p className="text-[120px] font-black text-white/10 leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl">🇳🇬</span>
          </div>
        </div>

        <h1 className="text-2xl font-black text-white mb-3">
          Page Not Found
        </h1>
        <p className="text-green-300 text-sm leading-relaxed mb-8">
          The page you are looking for does not exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/"
            className="bg-white text-green-800 font-black px-6 py-3 rounded-xl
                       hover:bg-green-50 transition-all active:scale-[.97]">
            ← Back to Home
          </Link>
          <Link href="/dashboard"
            className="border-2 border-white/30 text-white font-bold px-6 py-3 rounded-xl
                       hover:bg-white/10 transition-all active:scale-[.97]">
            Go to Dashboard
          </Link>
        </div>

        <p className="text-green-500 text-xs mt-8">
          JAMB CBT Practice Portal
        </p>
      </div>
    </div>
  )
}
