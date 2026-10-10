import Link from 'next/link'
import Image from 'next/image'
import BrandLogo from '@/components/BrandLogo'
import { ArrowRight, BookOpen, ChartNoAxesColumnIncreasing, Clock3 } from 'lucide-react'

const highlights = [
  { icon: BookOpen, title: '21 JAMB subjects', description: 'Build your subject combination' },
  { icon: Clock3, title: 'Timed practice', description: 'Get comfortable with exam pace' },
  { icon: ChartNoAxesColumnIncreasing, title: 'Clear results', description: 'See your score by subject' },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="directory-hero relative isolate overflow-hidden bg-[#1d3e8b] text-white">
        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-4 border-b border-white/15 px-5 py-3.5 md:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="Eko Free CBT Hub home">
            <BrandLogo width={180} height={60} priority className="h-12 w-36 shrink-0 object-contain sm:h-14 sm:w-42" />
          </Link>

          <nav aria-label="Main navigation" className="flex shrink-0 items-center gap-3 text-sm font-semibold sm:gap-5">
            <Link href="/invite" className="hidden text-blue-100 transition-colors hover:text-white md:inline">Guest access</Link>
            <Link href="/auth/login" className="hidden text-white transition-colors hover:text-yellow-200 sm:inline">Sign in</Link>
            <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-sm bg-[#f4c928] px-3.5 py-2.5 font-bold text-[#173575] transition-colors hover:bg-yellow-300 sm:px-4">
              Register <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </nav>
        </header>

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-9 px-5 py-10 sm:py-12 md:grid-cols-[1fr_0.88fr] md:px-8 md:py-14 lg:gap-16">
          <div className="max-w-2xl animate-slide-up">
            <p className="mb-5 inline-flex items-center bg-[#f4c928] px-3.5 py-2 text-[11px] font-extrabold tracking-[0.16em] text-[#173575]">
              BUILT FOR JAMB CANDIDATES
            </p>
            <h1 className="font-serif text-4xl leading-[1.08] text-white sm:text-5xl lg:text-6xl">
              JAMB practice
              <span className="mt-1 block text-[#f4c928]">made simple.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-blue-100 sm:text-lg">
              Prepare for UTME with focused subject practice, realistic timing, and clear results that show you what to work on next.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/auth/register" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-[#f4c928] px-5 py-3 text-sm font-bold text-[#173575] transition-colors hover:bg-yellow-300">
                Register &amp; start practising <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link href="/auth/login" className="inline-flex min-h-12 items-center justify-center rounded-sm border border-white/40 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10">
                Candidate sign in
              </Link>
            </div>
            <p className="mt-5 text-sm text-blue-100">
              Have an invite link?{' '}
              <Link href="/invite" className="font-semibold text-white underline decoration-[#f4c928] decoration-2 underline-offset-4 hover:text-yellow-200">Get started here</Link>
            </p>
          </div>

          <div className="relative mx-auto hidden aspect-[4/5] w-full max-w-[440px] md:block">
            <div className="absolute -inset-3 translate-x-3 translate-y-3 border border-[#f4c928]/70" aria-hidden="true" />
            <div className="absolute inset-0 overflow-hidden border border-white/35 bg-blue-950">
              <Image
                src="/images/student.png"
                alt="JAMB candidate studying at a desk"
                fill
                priority
                sizes="(min-width: 768px) 40vw, 0px"
                className="object-cover object-right"
              />
              <div className="absolute inset-x-0 bottom-0 bg-[#173575]/90 px-5 py-4 text-white">
                <p className="text-[10px] font-bold tracking-[0.16em] text-yellow-200">PREPARE · PRACTISE · PASS</p>
                <p className="mt-1 font-serif text-xl">Make every session count.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="practice" className="border-b border-slate-200 bg-[#f7f8fc]">
        <div className="mx-auto grid max-w-7xl divide-y divide-slate-200 px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 md:px-8">
          {highlights.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-center gap-4 py-5 sm:px-5 sm:py-7 first:sm:pl-0 last:sm:pr-0">
              <span className="grid size-11 shrink-0 place-items-center rounded-sm bg-[#fff0b7] text-[#1d3e8b]">
                <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-bold text-[#173575]">{title}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-600">{description}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <p>© {new Date().getFullYear()} Eko Free CBT Hub · Nigeria</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link href="/trademark" className="font-semibold text-[#24458f] underline decoration-[#f4c928] underline-offset-4 hover:text-[#173575]">
            Trademark notice
          </Link>
          <p>Practice for your next step.</p>
        </div>
      </footer>
    </main>
  )
}