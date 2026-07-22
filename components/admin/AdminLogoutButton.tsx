'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
export default function AdminLogoutButton() {
  const router = useRouter()
  const handle = async () => {
    await (await createClient()).auth.signOut()
    router.push('/admin/login'); router.refresh()
  }
  return (
    <button onClick={handle}
      className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors font-medium">
      <LogOut size={15}/><span className="hidden sm:inline">Sign Out</span>
    </button>
  )
}
