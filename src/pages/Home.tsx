import { useEffect, useState } from 'react'
import type { PageKey } from '../components/Nav'

type HomeProps = Readonly<{
  onNavigate: (p: PageKey) => void
}>

const QUOTES = [
  { text: 'משפחה זה המקום שבו החיים מתחילים והאהבה לא נגמרת.', label: 'פתגם משפחתי' },
  { text: 'הדם עושה אותך קרוב משפחה, הנאמנות עושה אותך משפחה.', label: '— לא ידוע' },
  { text: 'הבית איננו מקום, הוא תחושה.', label: '— סרוויל ויליאמס' },
  { text: 'שום דבר לא חשוב יותר ממשפחה.', label: 'מוטו המשפחה' },
  { text: 'משפחה זה לא דבר חשוב. זה הכל.', label: '— מייקל ג\'יי פוקס' },
]

const PREVIEWS: { key: PageKey; title: string; desc: string; icon: string }[] = [
  { key: 'gallery', title: 'גלריית זיכרונות', desc: 'תמונות מהרגעים המשותפים שלנו.', icon: '📸' },
  { key: 'rules', title: 'חוקי המשפחה', desc: 'העקרונות שמנחים אותנו יום־יום.', icon: '📜' },
  { key: 'games', title: 'משחקים', desc: 'רעיונות לכיף משותף בסלון ובדרכים.', icon: '🎲' },
  { key: 'suggestions', title: 'הצעות', desc: 'יש לכם רעיון? שתפו אותו איתנו.', icon: '💡' },
  { key: 'features', title: 'תכונות', desc: 'מה האתר יודע לעשות עבורנו.', icon: '✨' },
  { key: 'about', title: 'אודות', desc: 'הסיפור שלנו ולמה בנינו את המקום הזה.', icon: '💫' },
]

export default function Home({ onNavigate }: HomeProps) {
  const [quoteIdx, setQuoteIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setQuoteIdx(i => (i + 1) % QUOTES.length), 6000)
    return () => clearInterval(id)
  }, [])

  const quote = QUOTES[quoteIdx]

  return (
    <>
      <section className="hero">
        <div className="hero-badge">
          <span className="pulse" />
          <span>מתעדכן באופן שוטף</span>
        </div>
        <h1>
          ברוכים הבאים<br />
          <span className="accent">למשפחה שלנו</span>
        </h1>
        <p>
          זה המקום שלנו — פינה קטנה ברשת שבה אנחנו אוספים את החוקים, המשחקים,
          הזיכרונות והרעיונות שמחברים בינינו. בואו לסייר, לשחק, ולהוסיף משלכם.
        </p>
        <div className="hero-actions">
          <button className="btn" onClick={() => onNavigate('rules')}>
            קראו את חוקי המשפחה ←
          </button>
          <button className="btn btn-ghost" onClick={() => onNavigate('suggestions')}>
            הוספת הצעה 💡
          </button>
        </div>
      </section>

      <section className="stats">
        <div className="stat-item">
          <div className="stat-num">10</div>
          <div className="stat-label">חוקי משפחה</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">9</div>
          <div className="stat-label">משחקים משותפים</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">∞</div>
          <div className="stat-label">רגעים ליצור</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">1</div>
          <div className="stat-label">משפחה אחת</div>
        </div>
      </section>

      <section className="quote" key={quoteIdx}>
        <p className="quote-text">{quote.text}</p>
        <div className="quote-label">{quote.label}</div>
      </section>

      <h2 className="section-title">מה יש באתר</h2>
      <div className="grid">
        {PREVIEWS.map(p => (
          <button
            key={p.key}
            className="card card-button"
            onClick={() => onNavigate(p.key)}
          >
            <div className="card-icon" style={{ fontSize: 22 }}>{p.icon}</div>
            <h3>{p.title}</h3>
            <p>{p.desc}</p>
          </button>
        ))}
      </div>
    </>
  )
}
