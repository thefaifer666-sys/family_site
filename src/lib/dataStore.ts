// Centralized export/import for all site data — for sharing between devices.
// Today: localStorage. Future: swap in Supabase/Firebase behind the same API.

const KEYS = [
  'family-site:suggestions:v1',
  'family-site:gallery:v1',
]

export type ExportBundle = {
  version: 1
  exportedAt: number
  data: Record<string, unknown>
}

export function exportAll(): ExportBundle {
  const data: Record<string, unknown> = {}
  for (const key of KEYS) {
    const raw = localStorage.getItem(key)
    if (raw) {
      try { data[key] = JSON.parse(raw) } catch { data[key] = raw }
    }
  }
  return { version: 1, exportedAt: Date.now(), data }
}

export function downloadExport() {
  const bundle = exportAll()
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `family-site-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function importFromFile(file: File): Promise<void> {
  const text = await file.text()
  const parsed = JSON.parse(text) as ExportBundle
  if (!parsed || parsed.version !== 1 || !parsed.data) {
    throw new Error('קובץ גיבוי לא תקין')
  }
  for (const [key, value] of Object.entries(parsed.data)) {
    if (!KEYS.includes(key)) continue
    localStorage.setItem(key, JSON.stringify(value))
  }
}

export async function shareSite(): Promise<boolean> {
  const url = window.location.href
  const title = 'האתר של המשפחה שלנו'
  const text = 'בואו לראות את האתר המשפחתי שלנו'
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url })
      return true
    } catch {
      return false
    }
  }
  try {
    await navigator.clipboard.writeText(url)
    alert('הקישור הועתק! 📋')
    return true
  } catch {
    prompt('העתיקו את הקישור:', url)
    return true
  }
}
