'use client'
// app/admin/questions/page.tsx
// Full question bank manager — list, search, filter, add, edit, delete

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminNav from '@/components/admin/AdminNav'
import {
  PlusCircle, Search, Pencil, Trash2, X, Save,
  ChevronDown, ChevronUp, BookOpen, Filter
} from 'lucide-react'
import clsx from 'clsx'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

interface Subject { id: string; name: string; code: string }
interface Question {
  id: string; subject_id: string; question_text: string
  option_a: string; option_b: string; option_c: string; option_d: string
  correct_option: 'A'|'B'|'C'|'D'; explanation: string|null
  difficulty: string; year: number|null; is_active: boolean
  subjects?: { name: string }
}

const DIFFICULTIES = ['easy','medium','hard']
const OPTIONS      = ['A','B','C','D'] as const
const EMPTY_FORM   = {
  subject_id:'', question_text:'',
  option_a:'', option_b:'', option_c:'', option_d:'',
  correct_option:'A' as 'A'|'B'|'C'|'D',
  explanation:'', difficulty:'medium', year:'', is_active: true,
}

export default function QuestionsPage() {
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null)

  const [questions,      setQuestions]      = useState<Question[]>([])
  const [subjects,       setSubjects]       = useState<Subject[]>([])
  const [loading,        setLoading]        = useState(true)
  const [saving,         setSaving]         = useState(false)
  const [error,          setError]          = useState('')
  const [success,        setSuccess]        = useState('')

  // Filters
  const [search,         setSearch]         = useState('')
  const [filterSubject,  setFilterSubject]  = useState('')
  const [filterDiff,     setFilterDiff]     = useState('')

  // Modal
  const [showModal,      setShowModal]      = useState(false)
  const [editingId,      setEditingId]      = useState<string|null>(null)
  const [form,           setForm]           = useState({ ...EMPTY_FORM })

  // Expanded question (show answer)
  const [expanded,       setExpanded]       = useState<string|null>(null)

  // Delete confirm
  const [deleteId,       setDeleteId]       = useState<string|null>(null)

  // Initialize Supabase client
  useEffect(() => {
    const client = createClient()
    setSupabase(client)
  }, [])

  const load = useCallback(async () => {
    if (!supabase) return
    setLoading(true)
    const { data: subs }  = await supabase.from('subjects').select('id,name,code').order('name')
    const { data: qs }    = await supabase
      .from('questions')
      .select('*, subjects(name)')
      .order('created_at', { ascending: false })
    setSubjects(subs || [])
    setQuestions(qs || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { 
    if (supabase) load() 
  }, [supabase, load])

  const setF = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  const openNew = () => {
    setEditingId(null)
    setForm({ ...EMPTY_FORM })
    setError(''); setSuccess('')
    setShowModal(true)
  }

  const openEdit = (q: Question) => {
    setEditingId(q.id)
    setForm({
      subject_id:     q.subject_id,
      question_text:  q.question_text,
      option_a:       q.option_a,
      option_b:       q.option_b,
      option_c:       q.option_c,
      option_d:       q.option_d,
      correct_option: q.correct_option,
      explanation:    q.explanation || '',
      difficulty:     q.difficulty,
      year:           q.year?.toString() || '',
      is_active:      q.is_active,
    })
    setError(''); setSuccess('')
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.subject_id || !form.question_text || !form.option_a ||
        !form.option_b   || !form.option_c     || !form.option_d) {
      setError('Please fill in all required fields.'); return
    }
    setSaving(true); setError('')

    if (!supabase) { setError('Unable to connect to database'); setSaving(false); return }

    const payload = {
      subject_id:     form.subject_id,
      question_text:  form.question_text.trim(),
      option_a:       form.option_a.trim(),
      option_b:       form.option_b.trim(),
      option_c:       form.option_c.trim(),
      option_d:       form.option_d.trim(),
      correct_option: form.correct_option,
      explanation:    form.explanation.trim() || null,
      difficulty:     form.difficulty,
      year:           form.year ? parseInt(form.year) : null,
      is_active:      form.is_active,
    }

    if (editingId) {
      const { error: err } = await (supabase.from('questions') as any).update(payload).eq('id', editingId)
      if (err) { setError(err.message); setSaving(false); return }
      setSuccess('Question updated successfully.')
    } else {
      const { error: err } = await (supabase.from('questions') as any).insert(payload)
      if (err) { setError(err.message); setSaving(false); return }
      setSuccess('Question added successfully.')
    }

    setSaving(false)
    setShowModal(false)
    load()
  }

  const handleDelete = async (id: string) => {
    if (!supabase) return
    const { error: err } = await (supabase.from('questions') as any).delete().eq('id', id)
    if (!err) { setDeleteId(null); load() }
  }

  // Filtered list
  const filtered = questions.filter(q => {
    const matchSearch  = !search       || q.question_text.toLowerCase().includes(search.toLowerCase())
    const matchSubject = !filterSubject || q.subject_id === filterSubject
    const matchDiff    = !filterDiff    || q.difficulty  === filterDiff
    return matchSearch && matchSubject && matchDiff
  })

  const diffColor = (d: string) =>
    d === 'easy' ? 'bg-green-100 text-green-700' :
    d === 'hard' ? 'bg-red-100 text-red-700' :
                   'bg-yellow-100 text-yellow-700'

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav/>

      <main className="flex-1 p-6 overflow-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-black text-gray-800">Question Bank</h1>
            <p className="text-gray-500 text-sm mt-0.5">{questions.length} questions across {subjects.length} subjects</p>
          </div>
          <button onClick={openNew} className="btn-primary flex items-center gap-2">
            <PlusCircle size={16}/>Add Question
          </button>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4 flex justify-between">
            <span>✅ {success}</span>
            <button onClick={() => setSuccess('')}><X size={14}/></button>
          </div>
        )}

        {/* Filters */}
        <div className="card mb-5 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15}/>
            <input type="text" placeholder="Search questions…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9 py-2 text-sm" />
          </div>
          <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
            className="input-field py-2 text-sm w-auto min-w-[160px]">
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={filterDiff} onChange={e => setFilterDiff(e.target.value)}
            className="input-field py-2 text-sm w-auto">
            <option value="">All Difficulties</option>
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase()+d.slice(1)}</option>)}
          </select>
          {(search || filterSubject || filterDiff) && (
            <button onClick={() => { setSearch(''); setFilterSubject(''); setFilterDiff('') }}
              className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1">
              <X size={13}/>Clear
            </button>
          )}
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} shown</span>
        </div>

        {/* Questions list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-16">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3"/>
            <p className="text-gray-400 font-medium">No questions found</p>
            <p className="text-gray-300 text-sm mt-1">Try adjusting your filters or add a new question</p>
            <button onClick={openNew} className="btn-primary mt-4 inline-flex items-center gap-2">
              <PlusCircle size={15}/>Add First Question
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((q, idx) => (
              <div key={q.id} className="card hover:shadow-md transition-shadow animate-fade-in">
                <div className="flex items-start gap-3">
                  {/* Number */}
                  <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-500">
                    {idx + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Meta */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700">
                        {q.subjects?.name || '—'}
                      </span>
                      <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold', diffColor(q.difficulty))}>
                        {q.difficulty}
                      </span>
                      {q.year && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
                          {q.year}
                        </span>
                      )}
                      {!q.is_active && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-600">
                          Inactive
                        </span>
                      )}
                    </div>

                    {/* Question text */}
                    <p className="text-gray-800 text-sm font-medium leading-relaxed">
                      {q.question_text}
                    </p>

                    {/* Expandable answer */}
                    {expanded === q.id && (
                      <div className="mt-3 grid grid-cols-2 gap-2 animate-fade-in">
                        {OPTIONS.map((opt, i) => {
                          const text = [q.option_a,q.option_b,q.option_c,q.option_d][i]
                          const correct = q.correct_option === opt
                          return (
                            <div key={opt} className={clsx(
                              'flex items-center gap-2 p-2 rounded-lg text-xs border',
                              correct ? 'bg-green-50 border-green-300 font-semibold text-green-800'
                                      : 'bg-gray-50 border-gray-200 text-gray-600'
                            )}>
                              <div className={clsx(
                                'w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0',
                                correct ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-500'
                              )}>{opt}</div>
                              {text}
                            </div>
                          )
                        })}
                        {q.explanation && (
                          <div className="col-span-2 mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-800">
                            💡 <strong>Explanation:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => setExpanded(expanded === q.id ? null : q.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
                      title={expanded === q.id ? 'Hide answers' : 'Show answers'}>
                      {expanded === q.id ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
                    </button>
                    <button onClick={() => openEdit(q)}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
                      title="Edit">
                      <Pencil size={15}/>
                    </button>
                    <button onClick={() => setDeleteId(q.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all"
                      title="Delete">
                      <Trash2 size={15}/>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Add / Edit Modal ─────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 animate-slide-up">

            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-black text-gray-800 text-lg">
                {editingId ? 'Edit Question' : 'Add New Question'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-gray-100">
                <X size={18}/>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  ⚠ {error}
                </div>
              )}

              {/* Subject + Difficulty + Year */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select value={form.subject_id} onChange={setF('subject_id')} required className="input-field">
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Difficulty</label>
                  <select value={form.difficulty} onChange={setF('difficulty')} className="input-field">
                    {DIFFICULTIES.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase()+d.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              {/* Year + Active */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Year (optional)</label>
                  <input type="number" placeholder="e.g. 2023" value={form.year}
                    onChange={setF('year')} min="1990" max="2030" className="input-field" />
                </div>
                <div className="flex items-end pb-0.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_active}
                      onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                      className="w-4 h-4 rounded accent-green-700" />
                    <span className="text-sm font-medium text-gray-700">Active (shown in exams)</span>
                  </label>
                </div>
              </div>

              {/* Question text */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                  Question Text <span className="text-red-500">*</span>
                </label>
                <textarea value={form.question_text} onChange={setF('question_text')} required
                  rows={3} placeholder="Enter the full question text here…"
                  className="input-field resize-none" />
              </div>

              {/* Options */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Answer Options <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {OPTIONS.map((opt, i) => {
                    const key = `option_${opt.toLowerCase()}` as keyof typeof form
                    const isCorrect = form.correct_option === opt
                    return (
                      <div key={opt} className={clsx(
                        'flex items-center gap-3 p-3 rounded-xl border-2 transition-all',
                        isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-200'
                      )}>
                        <button type="button" onClick={() => setForm(f => ({ ...f, correct_option: opt }))}
                          className={clsx(
                            'w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 border-2 transition-all',
                            isCorrect ? 'bg-green-700 border-green-700 text-white' : 'border-gray-300 text-gray-400 hover:border-green-400'
                          )}
                          title={`Set option ${opt} as correct answer`}>
                          {opt}
                        </button>
                        <input type="text" placeholder={`Option ${opt}…`}
                          value={form[key] as string}
                          onChange={setF(key)}
                          required
                          className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400" />
                        {isCorrect && (
                          <span className="text-xs text-green-700 font-bold flex-shrink-0">✓ Correct</span>
                        )}
                      </div>
                    )
                  })}
                  <p className="text-xs text-gray-400 mt-1">Click the letter button to mark the correct answer.</p>
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                  Explanation <span className="text-gray-400 font-normal normal-case">(optional — shown after exam)</span>
                </label>
                <textarea value={form.explanation} onChange={setF('explanation')}
                  rows={2} placeholder="Brief explanation of the correct answer…"
                  className="input-field resize-none" />
              </div>

              {/* Footer */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving
                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Saving…</>
                    : <><Save size={15}/>{editingId ? 'Update Question' : 'Add Question'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete confirm modal ─────────────────────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-slide-up">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="text-red-600" size={24}/>
            </div>
            <h3 className="font-black text-gray-800 text-lg mb-2">Delete Question?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone. The question will be permanently removed from the question bank.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition-all">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
