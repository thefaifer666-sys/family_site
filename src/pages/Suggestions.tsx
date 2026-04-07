import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase, type SuggestionRow, type ReplyRow } from '../lib/supabase'
import { notify } from '../lib/notifications'

type Category = 'חוק חדש' | 'משחק חדש' | 'פעילות' | 'שיפור אתר' | 'אחר'

const CATEGORIES: Category[] = ['חוק חדש', 'משחק חדש', 'פעילות', 'שיפור אתר', 'אחר']

const CATEGORY_COLORS: Record<Category, string> = {
  'חוק חדש': '#a78bfa',
  'משחק חדש': '#60a5fa',
  'פעילות': '#34d399',
  'שיפור אתר': '#fbbf24',
  'אחר': '#f472b6',
}

const NAME_KEY = 'family-site:myName'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (d > 0) return `לפני ${d} ימים`
  if (h > 0) return `לפני ${h} שעות`
  if (m > 0) return `לפני ${m} דקות`
  return 'עכשיו'
}

export default function Suggestions() {
  const [items, setItems] = useState<SuggestionRow[]>([])
  const [replies, setReplies] = useState<Record<string, ReplyRow[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState(() => localStorage.getItem(NAME_KEY) ?? '')
  const [category, setCategory] = useState<Category>('חוק חדש')
  const [text, setText] = useState('')
  const [sort, setSort] = useState<'new' | 'top'>('top')
  const [filter, setFilter] = useState<Category | 'all'>('all')
  const [toast, setToast] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [replyText, setReplyText] = useState<Record<string, string>>({})

  // Track IDs we just inserted so we don't notify ourselves
  const ownIds = useRef<Set<string>>(new Set())
  const isInitialLoad = useRef(true)

  useEffect(() => { localStorage.setItem(NAME_KEY, name) }, [name])

  useEffect(() => {
    let alive = true

    const fetchAll = async () => {
      const [sResp, rResp] = await Promise.all([
        supabase.from('suggestions').select('*').order('created_at', { ascending: false }),
        supabase.from('suggestion_replies').select('*').order('created_at', { ascending: true }),
      ])
      if (!alive) return
      if (sResp.error) setError(sResp.error.message)
      else setItems((sResp.data ?? []) as SuggestionRow[])
      if (rResp.data) {
        const grouped: Record<string, ReplyRow[]> = {}
        for (const r of rResp.data as ReplyRow[]) {
          if (!grouped[r.suggestion_id]) grouped[r.suggestion_id] = []
          grouped[r.suggestion_id].push(r)
        }
        setReplies(grouped)
      }
      setLoading(false)
      setTimeout(() => { isInitialLoad.current = false }, 500)
    }
    fetchAll()

    const suggChannel = supabase
      .channel('suggestions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'suggestions' }, payload => {
        setItems(prev => {
          if (payload.eventType === 'INSERT') {
            const row = payload.new as SuggestionRow
            if (prev.some(p => p.id === row.id)) return prev
            if (!isInitialLoad.current && !ownIds.current.has(row.id)) {
              notify('רעיון חדש! 💡', `${row.name} שלח הצעה לך תבדוק`)
            }
            return [row, ...prev]
          }
          if (payload.eventType === 'UPDATE') {
            const row = payload.new as SuggestionRow
            return prev.map(p => p.id === row.id ? row : p)
          }
          if (payload.eventType === 'DELETE') {
            const row = payload.old as SuggestionRow
            return prev.filter(p => p.id !== row.id)
          }
          return prev
        })
      })
      .subscribe()

    const replyChannel = supabase
      .channel('replies-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'suggestion_replies' }, payload => {
        setReplies(prev => {
          const next = { ...prev }
          if (payload.eventType === 'INSERT') {
            const row = payload.new as ReplyRow
            const list = next[row.suggestion_id] ?? []
            if (list.some(r => r.id === row.id)) return prev
            next[row.suggestion_id] = [...list, row]
            if (!isInitialLoad.current && !ownIds.current.has(row.id)) {
              notify('תגובה חדשה 💬', `${row.name} הגיב להצעה`)
            }
          } else if (payload.eventType === 'DELETE') {
            const row = payload.old as ReplyRow
            const list = next[row.suggestion_id] ?? []
            next[row.suggestion_id] = list.filter(r => r.id !== row.id)
          }
          return next
        })
      })
      .subscribe()

    return () => {
      alive = false
      supabase.removeChannel(suggChannel)
      supabase.removeChannel(replyChannel)
    }
  }, [])

  const visible = useMemo(() => {
    let list = [...items]
    if (filter !== 'all') list = list.filter(i => i.category === filter)
    if (sort === 'top') list.sort((a, b) => b.likes - a.likes || new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    else list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return list
  }, [items, sort, filter])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !text.trim() || submitting) return
    setSubmitting(true)
    const { data, error } = await supabase
      .from('suggestions')
      .insert({ name: name.trim(), category, text: text.trim(), likes: 0 })
      .select()
      .single()
    setSubmitting(false)
    if (error) { alert('שגיאה בשליחה: ' + error.message); return }
    if (data) ownIds.current.add((data as SuggestionRow).id)
    setText('')
    setToast(true)
    setTimeout(() => setToast(false), 2800)
  }

  const like = async (id: string, current: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, likes: current + 1 } : i))
    const { error } = await supabase.from('suggestions').update({ likes: current + 1 }).eq('id', id)
    if (error) {
      setItems(prev => prev.map(i => i.id === id ? { ...i, likes: current } : i))
      alert('לא הצלחנו לשמור את הלייק')
    }
  }

  const remove = async (id: string) => {
    if (!confirm('למחוק את ההצעה?')) return
    const prev = items
    setItems(curr => curr.filter(i => i.id !== id))
    const { error } = await supabase.from('suggestions').delete().eq('id', id)
    if (error) { setItems(prev); alert('לא הצלחנו למחוק') }
  }

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const submitReply = async (suggestionId: string) => {
    const body = (replyText[suggestionId] ?? '').trim()
    if (!body || !name.trim()) {
      if (!name.trim()) alert('קודם כתבו את השם שלכם בטופס למעלה')
      return
    }
    const { data, error } = await supabase
      .from('suggestion_replies')
      .insert({ suggestion_id: suggestionId, name: name.trim(), text: body })
      .select()
      .single()
    if (error) { alert('שגיאה בתגובה: ' + error.message); return }
    if (data) ownIds.current.add((data as ReplyRow).id)
    setReplyText(prev => ({ ...prev, [suggestionId]: '' }))
  }

  const removeReply = async (reply: ReplyRow) => {
    if (!confirm('למחוק את התגובה?')) return
    setReplies(prev => {
      const next = { ...prev }
      next[reply.suggestion_id] = (next[reply.suggestion_id] ?? []).filter(r => r.id !== reply.id)
      return next
    })
    await supabase.from('suggestion_replies').delete().eq('id', reply.id)
  }

  const totalLikes = items.reduce((s, i) => s + i.likes, 0)

  return (
    <>
      <h1 className="page-title">הצעות לאתר</h1>
      <p className="page-subtitle">
        יש לכם רעיון? חוק חדש? משחק שכדאי להוסיף? שתפו כאן, והמשפחה תצביע ותגיב.
      </p>

      <div className="stats" style={{ marginTop: 0 }}>
        <div className="stat-item">
          <div className="stat-num">{items.length}</div>
          <div className="stat-label">הצעות פתוחות</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">{totalLikes}</div>
          <div className="stat-label">לייקים סה״כ</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">{new Set(items.map(i => i.name)).size}</div>
          <div className="stat-label">תורמים</div>
        </div>
      </div>

      <form className="suggest-form" onSubmit={submit}>
        <h2 className="form-title">הוספת הצעה חדשה</h2>
        <div className="form-row">
          <input
            className="input"
            placeholder="השם שלכם"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={40}
          />
          <select
            className="input"
            value={category}
            onChange={e => setCategory(e.target.value as Category)}
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <textarea
          className="input textarea"
          placeholder="מה הרעיון? איך זה יעזור לנו?"
          value={text}
          onChange={e => setText(e.target.value)}
          rows={4}
          maxLength={300}
        />
        <div className="form-footer">
          <span className="char-count">{text.length}/300</span>
          <button type="submit" className="btn" disabled={!name.trim() || !text.trim() || submitting}>
            {submitting ? 'שולח…' : 'שליחה ←'}
          </button>
        </div>
      </form>

      <div className="suggest-toolbar">
        <div className="chips">
          <button className={`chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>הכל</button>
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`chip ${filter === c ? 'active' : ''}`}
              onClick={() => setFilter(c)}
              style={filter === c ? { borderColor: CATEGORY_COLORS[c], color: CATEGORY_COLORS[c] } : undefined}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="sort">
          <button className={`chip ${sort === 'top' ? 'active' : ''}`} onClick={() => setSort('top')}>🔥 פופולרי</button>
          <button className={`chip ${sort === 'new' ? 'active' : ''}`} onClick={() => setSort('new')}>🕐 חדש</button>
        </div>
      </div>

      {loading ? (
        <div className="empty"><div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>טוען…</div>
      ) : error ? (
        <div className="empty" style={{ color: '#f87171' }}>שגיאה: {error}</div>
      ) : visible.length === 0 ? (
        <div className="empty">
          <div style={{ fontSize: 44, marginBottom: 12 }}>💭</div>
          <div>אין הצעות כאן עדיין — תהיו הראשונים!</div>
        </div>
      ) : (
        <div className="suggest-list">
          {visible.map(s => {
            const cat = s.category as Category
            const rs = replies[s.id] ?? []
            const isOpen = expanded.has(s.id)
            return (
              <div className="suggest-item-wrap" key={s.id}>
                <div className="suggest-item">
                  <button className="like-btn" onClick={() => like(s.id, s.likes)} aria-label="לייק">
                    <span className="like-arrow">▲</span>
                    <span className="like-count">{s.likes}</span>
                  </button>
                  <div className="suggest-body">
                    <div className="suggest-meta">
                      <span className="suggest-name">{s.name}</span>
                      <span className="suggest-dot">•</span>
                      <span className="suggest-time">{timeAgo(s.created_at)}</span>
                      <span
                        className="suggest-badge"
                        style={{ color: CATEGORY_COLORS[cat] ?? '#a78bfa', borderColor: (CATEGORY_COLORS[cat] ?? '#a78bfa') + '55' }}
                      >
                        {s.category}
                      </span>
                    </div>
                    <div className="suggest-text">{s.text}</div>
                    <button className="reply-toggle" onClick={() => toggleExpand(s.id)}>
                      💬 {rs.length > 0 ? `${rs.length} תגובות` : 'הגיבו'}
                      <span className={`chev ${isOpen ? 'open' : ''}`}>▼</span>
                    </button>
                  </div>
                  <button className="delete-btn" onClick={() => remove(s.id)} aria-label="מחיקה">×</button>
                </div>

                {isOpen && (
                  <div className="replies">
                    {rs.map(r => (
                      <div className="reply" key={r.id}>
                        <div className="reply-meta">
                          <span className="reply-name">{r.name}</span>
                          <span className="suggest-dot">•</span>
                          <span className="suggest-time">{timeAgo(r.created_at)}</span>
                          <button className="reply-delete" onClick={() => removeReply(r)} aria-label="מחיקה">×</button>
                        </div>
                        <div className="reply-text">{r.text}</div>
                      </div>
                    ))}
                    <div className="reply-form">
                      <input
                        className="input"
                        placeholder="כתבו תגובה…"
                        value={replyText[s.id] ?? ''}
                        onChange={e => setReplyText(prev => ({ ...prev, [s.id]: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submitReply(s.id) } }}
                        maxLength={200}
                      />
                      <button
                        className="btn btn-sm"
                        onClick={() => submitReply(s.id)}
                        disabled={!(replyText[s.id] ?? '').trim()}
                      >
                        שלח
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {toast && (
        <div className="toast">
          <span className="toast-icon">✓</span>
          <span>ההצעה נשלחה בהצלחה!</span>
        </div>
      )}
    </>
  )
}
