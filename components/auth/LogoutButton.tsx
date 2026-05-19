'use client'
// components/auth/LogoutButton.tsx

import { createClient } from './../../app/lib/supabase/clients'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const router = useRouter()
  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }
  return (
    <button onClick={handleLogout}
      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors font-medium">
      <LogOut size={15} />
      <span className="hidden sm:inline">Sign Out</span>
    </button>
  )
}
