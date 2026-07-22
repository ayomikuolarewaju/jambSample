'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileQuestion, BookOpen, Mail, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'

const links = [
  { href: '/admin/dashboard', label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/admin/questions', label: 'Questions',      icon: FileQuestion },
  { href: '/admin/subjects',  label: 'Subjects',       icon: BookOpen },
  { href: '/admin/leads',     label: 'Email Leads',    icon: Mail },
]

export default function AdminNav() {
  const pathname = usePathname()
  const router   = useRouter()

  const handleLogout = async () => {
    await (await createClient()).auth.signOut()
    router.push('/admin/login'); router.refresh()
  }

  return (
    <aside className="w-56 bg-gray-900 min-h-screen flex flex-col border-r border-gray-800">
      {/* Logo */}
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-black">J</span>
          </div>
          <div>
            <p className="text-white font-black text-sm leading-none">JAMB Admin</p>
            <p className="text-gray-500 text-[10px]">Question Bank</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-1">
        {links.map(l => {
          const active = pathname.startsWith(l.href)
          return (
            <Link key={l.href} href={l.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-green-700 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}>
              <l.icon size={16}/>{l.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-800">
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                     text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-all w-full">
          <LogOut size={16}/>Sign Out
        </button>
      </div>
    </aside>
  )
}
