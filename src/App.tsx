import { useRef, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import Nav, { type PageKey } from './components/Nav'
import Home from './pages/Home'
import Features from './pages/Features'
import About from './pages/About'
import Games from './pages/Games'
import Rules from './pages/Rules'
import Suggestions from './pages/Suggestions'
import Gallery from './pages/Gallery'
import { downloadExport, importFromFile, shareSite } from './lib/dataStore'

export default function App() {
  const [page, setPage] = useState<PageKey>('home')
  const fileRef = useRef<HTMLInputElement>(null)

  const renderPage = () => {
    switch (page) {
      case 'home': return <Home onNavigate={setPage} />
      case 'features': return <Features />
      case 'about': return <About />
      case 'games': return <Games />
      case 'rules': return <Rules />
      case 'suggestions': return <Suggestions />
      case 'gallery': return <Gallery />
    }
  }

  const handleImport = async (file: File | null) => {
    if (!file) return
    try {
      await importFromFile(file)
      alert('הנתונים יובאו בהצלחה! טוען מחדש…')
      window.location.reload()
    } catch (e) {
      alert('שגיאה בייבוא: ' + (e instanceof Error ? e.message : 'לא ידוע'))
    }
  }

  return (
    <>
      <div className="app">
        <Nav current={page} onChange={setPage} />
        <main>
          <div className="page" key={page}>
            {renderPage()}
          </div>
        </main>
        <footer className="footer">
          <div className="footer-actions">
            <button className="footer-btn" onClick={shareSite}>📤 שיתוף האתר</button>
            <button className="footer-btn" onClick={downloadExport}>💾 ייצוא נתונים</button>
            <button className="footer-btn" onClick={() => fileRef.current?.click()}>📂 ייבוא נתונים</button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={e => handleImport(e.target.files?.[0] ?? null)}
            />
          </div>
          <div>נבנה באהבה עבור המשפחה שלנו <span className="footer-heart">♥</span></div>
        </footer>
      </div>
      <Analytics />
    </>
  )
}
