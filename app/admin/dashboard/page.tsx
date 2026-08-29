import { createClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminLogoutButton from '@/components/admin/AdminLogoutButton'
import { FileQuestion, BookOpen, Mail, Users, BarChart3, PlusCircle } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: admin } = await supabase
    .from('admins').select('full_name,role').eq('email', user.email!).single()
  if (!admin) redirect('/admin/login')

  const [
    { count: questionCount },
    { count: subjectCount },
    { count: leadCount },
    { count: registeredCount },
    { count: guestExamCount },
  ] = await Promise.all([
    supabase.from('questions').select('*', { count:'exact', head:true }),
    supabase.from('subjects').select('*', { count:'exact', head:true }),
    supabase.from('invite_leads').select('*', { count:'exact', head:true }),
    supabase.from('exam_sessions').select('*', { count:'exact', head:true }).not('submitted_at','is',null),
    supabase.from('guest_sessions').select('*', { count:'exact', head:true }).not('submitted_at','is',null),
  ])

  const stats = [
    { label:'Total Questions',   value: questionCount  ?? 0, icon: FileQuestion, color:'bg-blue-50 text-blue-700',    border:'border-blue-200' },
    { label:'Subjects',          value: subjectCount   ?? 0, icon: BookOpen,     color:'bg-purple-50 text-purple-700', border:'border-purple-200' },
    { label:'Email Leads',       value: leadCount      ?? 0, icon: Mail,         color:'bg-yellow-50 text-yellow-700', border:'border-yellow-200' },
    { label:'Guest Exams Taken', value: guestExamCount ?? 0, icon: Users,        color:'bg-green-50 text-green-700',   border:'border-green-200' },
    { label:'Registered Exams',  value: registeredCount?? 0, icon: BarChart3,    color:'bg-red-50 text-red-700',       border:'border-red-200' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-black">J</span>
            </div>
            <div>
              <p className="text-white font-black text-sm leading-none">JAMB CBT Admin</p>
              <p className="text-gray-500 text-[10px]">Question Bank Manager</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm hidden sm:block">
              {admin.full_name}
              <span className="ml-2 text-xs bg-green-900 text-green-400 px-2 py-0.5 rounded-full">{admin.role}</span>
            </span>
            <AdminLogoutButton/>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage questions, subjects, and exam leads.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className={`card border ${s.border} animate-fade-in`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                <s.icon size={20}/>
              </div>
              <p className="text-2xl font-black text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileQuestion className="text-blue-700" size={18}/>
              </div>
              <div>
                <p className="font-bold text-gray-800">Question Bank</p>
                <p className="text-xs text-gray-400">{questionCount} questions</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-4">Add, edit, or delete exam questions by subject and difficulty.</p>
            <div className="flex gap-2">
              <Link href="/admin/questions" className="btn-secondary text-sm py-2 px-4 flex-1 text-center">View All</Link>
              <Link href="/admin/questions?action=new" className="btn-primary text-sm py-2 px-4 flex items-center gap-1">
                <PlusCircle size={14}/>Add
              </Link>
            </div>
          </div>

          <div className="card hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
                <BookOpen className="text-purple-700" size={18}/>
              </div>
              <div>
                <p className="font-bold text-gray-800">Subjects</p>
                <p className="text-xs text-gray-400">{subjectCount} subjects</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-4">Manage available subjects. Enable or disable them for the exam.</p>
            <Link href="/admin/subjects" className="btn-secondary text-sm py-2 px-4 block text-center">Manage Subjects</Link>
          </div>

          <div className="card hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Mail className="text-yellow-700" size={18}/>
              </div>
              <div>
                <p className="font-bold text-gray-800">Email Leads</p>
                <p className="text-xs text-gray-400">{leadCount} leads collected</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-4">View students who received invite links and track registrations.</p>
            <Link href="/admin/leads" className="btn-secondary text-sm py-2 px-4 block text-center">View Leads</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
