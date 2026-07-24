'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminNav from '@/components/admin/AdminNav'
import { Search, Mail, CheckCircle, Clock, X } from 'lucide-react'
import clsx from 'clsx'

interface Lead {
  id: string; email: string; first_name: string|null
  invited_at: string; registered: boolean; token_used_at: string|null
  expires_at: string|null
}

export default function LeadsPage() {
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null)
  const [leads,   setLeads]   = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState<'all'|'registered'|'pending'>('all')

  // Initialize Supabase client
  useEffect(() => {
    const client = createClient()
    setSupabase(client)
  }, [])

  useEffect(() => {
    if (!supabase) return
    (async () => {
      const { data } = await supabase
        .from('invite_leads').select('*').order('invited_at', { ascending: false })
      setLeads(data || [])
      setLoading(false)
    })()
  }, [supabase])

  const filtered = leads.filter(l => {
    const matchSearch = !search || l.email.toLowerCase().includes(search.toLowerCase()) ||
      (l.first_name || '').toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'all' ? true :
      filter === 'registered' ? l.registered :
      !l.registered
    return matchSearch && matchFilter
  })

  const registered = leads.filter(l => l.registered).length
  const pending    = leads.filter(l => !l.registered).length

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav/>
      <main className="flex-1 p-6">

        <div className="mb-6">
          <h1 className="text-xl font-black text-gray-800">Email Leads</h1>
          <p className="text-gray-500 text-sm mt-0.5">Students who received invite links</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Leads',  value: leads.length, color: 'bg-blue-50 text-blue-700 border-blue-200' },
            { label: 'Registered',   value: registered,   color: 'bg-green-50 text-green-700 border-green-200' },
            { label: 'Pending',      value: pending,      color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
          ].map(s => (
            <div key={s.label} className={`card border ${s.color.split(' ')[2]} text-center`}>
              <p className={`text-3xl font-black ${s.color.split(' ')[1]}`}>{s.value}</p>
              <p className="text-xs font-medium text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card mb-5 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15}/>
            <input type="text" placeholder="Search by name or email…" value={search}
              onChange={e => setSearch(e.target.value)} className="input-field pl-9 py-2 text-sm" />
          </div>
          <div className="flex gap-2">
            {(['all','registered','pending'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={clsx('px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all capitalize',
                  filter === f ? 'border-green-700 bg-green-700 text-white' : 'border-gray-200 text-gray-600 hover:border-green-300')}>
                {f}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} shown</span>
        </div>

        {/* Leads table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-12">
            <Mail className="w-10 h-10 text-gray-300 mx-auto mb-3"/>
            <p className="text-gray-400">No leads found</p>
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Name','Email','Invited','Link Used','Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(lead => {
                  const expired = lead.expires_at && new Date(lead.expires_at) < new Date()
                  return (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800">{lead.first_name || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{lead.email}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(lead.invited_at).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {lead.token_used_at
                          ? new Date(lead.token_used_at).toLocaleDateString('en-NG', { day:'numeric', month:'short' })
                          : expired ? <span className="text-red-400">Expired</span> : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {lead.registered
                          ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                              <CheckCircle size={10}/>Registered
                            </span>
                          : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                              <Clock size={10}/>Pending
                            </span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
