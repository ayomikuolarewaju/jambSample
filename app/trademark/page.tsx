import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Trademark Notice | Eko Free CBT Hub',
  description: 'Trademark and independence notice for Eko Free CBT Hub.',
}

export default function TrademarkNoticePage() {
  return (
    <main className="min-h-screen bg-white text-slate-800">
      <header className="bg-[#1d3e8b] text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-5 md:px-8">
          <Link href="/" className="text-sm font-bold text-white hover:text-yellow-200">
            Eko Free CBT Hub
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-blue-100 hover:text-white">
            <ArrowLeft size={16} aria-hidden="true" /> Home
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-16">
        <p className="mb-3 text-xs font-bold tracking-[0.14em] text-[#24458f]">LEGAL INFORMATION</p>
        <h1 className="font-serif text-3xl font-bold text-[#173575] sm:text-4xl">Trademark &amp; independence notice</h1>
        <div className="mt-8 space-y-6 text-sm leading-7 text-slate-700">
          <p>
            Eko Free CBT Hub™ is the name used for this independent examination-practice service. The ™ symbol does not claim that the name is registered as a trademark.
          </p>
          <p>
            JAMB, UTME, and related names or marks belong to their respective rights holders. They are referenced only to identify the examination this service helps candidates practise for. Eko Free CBT Hub is independent and is not affiliated with, endorsed by, sponsored by, or operated by the Joint Admissions and Matriculation Board (JAMB) or any government agency.
          </p>
          <p>
            This service provides practice materials and estimated practice results only. It is not an official examination, and practice scores do not guarantee admission or an official UTME result.
          </p>
        </div>
        <p className="mt-10 border-t border-slate-200 pt-5 text-xs text-slate-500">
          <Link href="/" className="font-semibold text-[#24458f] underline decoration-[#f4c928] underline-offset-4">Return to Eko Free CBT Hub</Link>
        </p>
      </article>
    </main>
  )
}