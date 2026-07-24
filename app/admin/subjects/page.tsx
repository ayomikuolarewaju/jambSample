'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminNav from '@/components/admin/AdminNav'
import { PlusCircle, Pencil, Save, X, ToggleLeft, ToggleRight } from 'lucide-react'
import clsx from 'clsx'

interface Subject { id: string; name: string; code: string; category: string; is_active: boolean }
const CATEGORIES = ['compulsory','science','commercial','arts']
const EMPTY = { name:'', code:'', category:'science', is_active: true }

export default function SubjectsPage() {
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId,setEditingId]= useState<string|null>(null)
  const [form,     setForm]     = useState({ ...EMPTY })
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')

  // Initialize Supabase client
  useEffect(() => {
    const client = createClient()
  setSupabase(client)
  }, [])

  const load = async () => {
    if (!supabase) return
    setLoading(true)
    const { data } = await supabase.from('subjects').select('*').order('category').order('name')
    setSubjects(data || [])
    setLoading(false)
  }

  useEffect(() => { 
    if (supabase) load() 
  }, [supabase])

  const setF = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  const openEdit = (s: Subject) => {
    setEditingId(s.id)
    setForm({ name: s.name, code: s.code, category: s.category, is_active: s.is_active })
    setShowForm(true); setError('')
  }

  const handleSave = async (e: React.FormEvent) => {
    if (!supabase) return
    e.preventDefault()
    setSaving(true); setError('')
    const payload = { name: form.name.trim(), code: form.code.trim().toUpperCase(), category: form.category, is_active: form.is_active }
    if (editingId) {
      const { error: err } = await supabase.from('subjects').update(payload).eq('id', editingId)
      if (err) { setError(err.message); setSaving(false); return }
      setSuccess('Subject updated.')
    } else {
      const { error: err } = await supabase.from('subjects').insert(payload)
      if (err) { setError(err.message); setSaving(false); return }
      setSuccess('Subject added.')
    }
    setSaving(false); setShowForm(false); setEditingId(null); setForm({ ...EMPTY }); load()
  }

  const toggleActive = async (id: string, current: boolean) => {
    if (!supabase) return
    await supabase.from('subjects').update({ is_active: !current }).eq('id', id)
    load()
  }

  const catColor = (c: string) =>
    c === 'compulsory' ? 'bg-green-100 text-green-700' :
    c === 'science'    ? 'bg-blue-100 text-blue-700' :
    c === 'commercial' ? 'bg-yellow-100 text-yellow-700' :
                         'bg-purple-100 text-purple-700'

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav/>
      <main className="flex-1 p-6">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-black text-gray-800">Subjects</h1>
            <p className="text-gray-500 text-sm mt-0.5">{subjects.length} subjects configured</p>
          </div>
          <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ ...EMPTY }); setError('') }}
            className="btn-primary flex items-center gap-2">
            <PlusCircle size={16}/>Add Subject
          </button>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4 flex justify-between">
            <span>✅ {success}</span>
            <button onClick={() => setSuccess('')}><X size={14}/></button>
          </div>
        )}

        {/* Add/Edit form */}
        {showForm && (
          <div className="card mb-6 border-2 border-green-200 animate-slide-up">
            <h3 className="font-bold text-gray-800 mb-4">{editingId ? 'Edit Subject' : 'Add New Subject'}</h3>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-xl mb-4">⚠ {error}</div>}
            <form onSubmit={handleSave}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Subject Name *</label>
                  <input type="text" placeholder="e.g. Further Mathematics" value={form.name}
                    onChange={setF('name')} required className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Code *</label>
                  <input type="text" placeholder="e.g. FMT" value={form.code}
                    onChange={setF('code')} required maxLength={5} className="input-field uppercase" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Category *</label>
                  <select value={form.category} onChange={setF('category')} className="input-field">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_active}
                    onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                    className="w-4 h-4 accent-green-700" />
                  <span className="text-sm text-gray-700 font-medium">Active (available in exams)</span>
                </label>
                <div className="flex gap-2 ml-auto">
                  <button type="button" onClick={() => { setShowForm(false); setEditingId(null) }} className="btn-secondary text-sm py-2 px-4">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
                    {saving ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Saving…</> : <><Save size={14}/>{editingId ? 'Update' : 'Add Subject'}</>}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Subjects list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map(s => (
              <div key={s.id} className={clsx('card flex items-center justify-between gap-3 transition-all', !s.is_active && 'opacity-50')}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-black text-gray-600">{s.code}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{s.name}</p>
                    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold mt-0.5', catColor(s.category))}>
                      {s.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(s)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all">
                    <Pencil size={14}/>
                  </button>
                  <button onClick={() => toggleActive(s.id, s.is_active)}
                    className={clsx('p-1.5 rounded-lg transition-all', s.is_active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100')}>
                    {s.is_active ? <ToggleRight size={18}/> : <ToggleLeft size={18}/>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
