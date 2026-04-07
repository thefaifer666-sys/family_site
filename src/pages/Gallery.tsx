import { useEffect, useRef, useState } from 'react'
import { supabase, PHOTO_BUCKET, type PhotoRow } from '../lib/supabase'
import { notify } from '../lib/notifications'

type PhotoView = PhotoRow & { url: string }

const MAX_WIDTH = 1600
const JPEG_QUALITY = 0.85
const NAME_KEY = 'family-site:myName'

async function resizeImage(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = reject
      i.src = url
    })
    const scale = Math.min(1, MAX_WIDTH / img.width)
    const w = Math.round(img.width * scale)
    const h = Math.round(img.height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas not supported')
    ctx.drawImage(img, 0, 0, w, h)
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('blob failed')), 'image/jpeg', JPEG_QUALITY)
    )
  } finally {
    URL.revokeObjectURL(url)
  }
}

function publicUrl(path: string): string {
  return supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })
}

async function downloadPhoto(url: string, filename: string) {
  try {
    const resp = await fetch(url)
    if (!resp.ok) throw new Error('fetch failed')
    const blob = await resp.blob()
    const objUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(objUrl)
  } catch (e) {
    console.error(e)
    alert('לא הצלחנו להוריד את התמונה')
  }
}

export default function Gallery() {
  const [photos, setPhotos] = useState<PhotoView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [name, setName] = useState(() => localStorage.getItem(NAME_KEY) ?? '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const ownIds = useRef<Set<string>>(new Set())
  const isInitialLoad = useRef(true)

  useEffect(() => { localStorage.setItem(NAME_KEY, name) }, [name])

  useEffect(() => {
    let alive = true
    const fetchAll = async () => {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false })
      if (!alive) return
      if (error) {
        setError(error.message)
      } else {
        const rows = (data ?? []) as PhotoRow[]
        setPhotos(rows.map(r => ({ ...r, url: publicUrl(r.storage_path) })))
      }
      setLoading(false)
      setTimeout(() => { isInitialLoad.current = false }, 500)
    }
    fetchAll()

    const channel = supabase
      .channel('photos-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'photos' }, payload => {
        setPhotos(prev => {
          if (payload.eventType === 'INSERT') {
            const row = payload.new as PhotoRow
            if (prev.some(p => p.id === row.id)) return prev
            if (!isInitialLoad.current && !ownIds.current.has(row.id)) {
              const who = row.uploaded_by || 'מישהו'
              notify('תמונה חדשה! 📸', `${who} שלח תמונה לך תבדוק`)
            }
            return [{ ...row, url: publicUrl(row.storage_path) }, ...prev]
          }
          if (payload.eventType === 'UPDATE') {
            const row = payload.new as PhotoRow
            return prev.map(p => p.id === row.id ? { ...row, url: publicUrl(row.storage_path) } : p)
          }
          if (payload.eventType === 'DELETE') {
            const row = payload.old as PhotoRow
            if (!isInitialLoad.current && !ownIds.current.has(row.id)) {
              notify('עדכון 🗑️', 'התמונה נמחקה')
            }
            return prev.filter(p => p.id !== row.id)
          }
          return prev
        })
      })
      .subscribe()

    return () => { alive = false; supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    if (lightbox === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowLeft') setLightbox(i => i === null ? null : (i + 1) % photos.length)
      if (e.key === 'ArrowRight') setLightbox(i => i === null ? null : (i - 1 + photos.length) % photos.length)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox, photos.length])

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    if (!name.trim()) {
      alert('קודם כתבו את השם שלכם')
      return
    }
    setUploading(true)
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'))
    try {
      for (let i = 0; i < arr.length; i++) {
        const file = arr[i]
        setUploadProgress(`${i + 1}/${arr.length}`)
        const blob = await resizeImage(file)
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`
        const up = await supabase.storage.from(PHOTO_BUCKET).upload(path, blob, {
          contentType: 'image/jpeg',
          upsert: false,
        })
        if (up.error) throw up.error
        const ins = await supabase
          .from('photos')
          .insert({ storage_path: path, caption: '', uploaded_by: name.trim() })
          .select()
          .single()
        if (ins.error) throw ins.error
        if (ins.data) ownIds.current.add((ins.data as PhotoRow).id)
      }
    } catch (e: any) {
      console.error('upload error', e)
      const msg =
        e?.message ||
        e?.error_description ||
        e?.error ||
        (typeof e === 'string' ? e : JSON.stringify(e))
      alert('הייתה בעיה בהעלאה:\n' + msg)
    } finally {
      setUploading(false)
      setUploadProgress('')
    }
  }

  const updateCaption = async (id: string, caption: string) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, caption } : p))
    await supabase.from('photos').update({ caption }).eq('id', id)
  }

  const remove = async (photo: PhotoView) => {
    if (!confirm('למחוק את התמונה?')) return
    const prev = photos
    ownIds.current.add(photo.id)
    setPhotos(curr => curr.filter(p => p.id !== photo.id))
    setLightbox(null)
    const delDb = await supabase.from('photos').delete().eq('id', photo.id)
    const delStore = await supabase.storage.from(PHOTO_BUCKET).remove([photo.storage_path])
    if (delDb.error || delStore.error) { setPhotos(prev); ownIds.current.delete(photo.id); alert('שגיאה במחיקה') }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <>
      <h1 className="page-title">גלריית זיכרונות</h1>
      <p className="page-subtitle">
        רגעים מהמשפחה שלנו. גררו תמונות לכאן או לחצו להעלאה — התמונות נשמרות בענן וזמינות מכל מכשיר.
      </p>

      <div className="name-bar">
        <label>השם שלכם:</label>
        <input
          className="input"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="למשל: אמא"
          maxLength={40}
        />
      </div>

      <div
        className={`dropzone ${dragOver ? 'drag' : ''} ${uploading ? 'uploading' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />
        <div className="dropzone-icon">📸</div>
        <div className="dropzone-title">
          {uploading ? `מעלה תמונות ${uploadProgress}…` : 'גררו תמונות לכאן או לחצו לבחירה'}
        </div>
        <div className="dropzone-sub">
          התמונות מוקטנות אוטומטית ל־{MAX_WIDTH}px ונשמרות בענן
        </div>
      </div>

      {loading ? (
        <div className="empty" style={{ marginTop: 24 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
          <div>טוען תמונות…</div>
        </div>
      ) : error ? (
        <div className="empty" style={{ marginTop: 24, color: '#f87171' }}>שגיאה: {error}</div>
      ) : photos.length === 0 ? (
        <div className="empty" style={{ marginTop: 24 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🖼️</div>
          <div>עדיין אין תמונות בגלריה — העלו את הראשונה!</div>
        </div>
      ) : (
        <>
          <div className="gallery-meta">
            <span>{photos.length} {photos.length === 1 ? 'תמונה' : 'תמונות'}</span>
          </div>
          <div className="gallery-grid">
            {photos.map((p, i) => (
              <div className="gallery-item" key={p.id}>
                <img
                  src={p.url}
                  alt={p.caption || 'תמונה משפחתית'}
                  onClick={() => setLightbox(i)}
                  loading="lazy"
                />
                <input
                  className="gallery-caption"
                  type="text"
                  value={p.caption}
                  onChange={e => updateCaption(p.id, e.target.value)}
                  placeholder="הוסיפו כיתוב…"
                  maxLength={120}
                />
                {p.uploaded_by && <div className="gallery-by">📸 {p.uploaded_by}</div>}
                <button
                  className="gallery-download"
                  onClick={(e) => { e.stopPropagation(); downloadPhoto(p.url, `${p.caption || 'family-photo'}.jpg`) }}
                  aria-label="הורדה"
                  title="הורדה"
                >⬇</button>
                <button className="gallery-delete" onClick={() => remove(p)} aria-label="מחיקה">×</button>
              </div>
            ))}
          </div>
        </>
      )}

      {lightbox !== null && photos[lightbox] && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)}>×</button>
          {photos.length > 1 && (
            <>
              <button
                className="lightbox-nav prev"
                onClick={e => { e.stopPropagation(); setLightbox((lightbox + 1) % photos.length) }}
                aria-label="הקודמת"
              >‹</button>
              <button
                className="lightbox-nav next"
                onClick={e => { e.stopPropagation(); setLightbox((lightbox - 1 + photos.length) % photos.length) }}
                aria-label="הבאה"
              >›</button>
            </>
          )}
          <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
            <img src={photos[lightbox].url} alt={photos[lightbox].caption || ''} />
            {photos[lightbox].caption && <div className="lightbox-caption">{photos[lightbox].caption}</div>}
            <div className="lightbox-date">
              {photos[lightbox].uploaded_by && `📸 ${photos[lightbox].uploaded_by} • `}
              {formatDate(photos[lightbox].created_at)}
            </div>
            <button
              className="btn"
              onClick={() => downloadPhoto(photos[lightbox].url, `${photos[lightbox].caption || 'family-photo'}.jpg`)}
            >
              ⬇ הורדת התמונה
            </button>
          </div>
        </div>
      )}
    </>
  )
}
