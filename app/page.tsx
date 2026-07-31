// app/page.tsx — Landing page
import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-gray-900
                    flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-6xl w-full animate-slide-up">
        
        {/* Two-column hero section */}
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 mb-10">
          
          {/* Left: Text content */}
          <div className="flex-1 text-center lg:text-left">
            <div >
               <Image src="/images/ekofreecbthub_logo.svg" alt="Hero" width={300} height={100} className='rounded-3xl shadow-2xl border-4 border-white/10 transform hover:scale-[1.02] transition-transform duration-500'/>
            </div>
            <p className="text-green-200 text-lg mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Prepare for your JAMB UTME with our free Computer-Based Test practice platform.
              Real exam conditions, instant results, and detailed subject breakdowns.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
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
          </div>

          {/* Right: Hero image — student preparing for JAMB */}
          <div className="flex-1 w-full max-w-md lg:max-w-lg">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10
                            transform hover:scale-[1.02] transition-transform duration-500">
              <Image
                src="/images/student.png"
                alt="Student "
                width={800}
                height={534}
                className="w-full h-auto object-cover"
                priority
              />
              {/* Subtle overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/40 to-transparent" />
              
              {/* Floating badge */}
              <div className="absolute bottom-1 left-40 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
                <p className="text-green-800 font-bold text-sm">📝 Practice makes perfect</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature cards */}
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

      <footer className="text-center py-6 text-xs text-gray-400 border-t border-gray-100 mt-8">
        © {new Date().getFullYear()} JAMB CBT Practice Platform · Nigeria · All rights reserved
      </footer>
    </div>
  )
}