type Game = { title: string; desc: string; icon: string; players: string; time: string }

const GAMES: Game[] = [
  { icon: '❓', title: 'עשרים שאלות', desc: 'אחד חושב על משהו, וכולם שואלים עד 20 שאלות של כן/לא כדי לגלות מה זה.', players: '2-8', time: '10 דק׳' },
  { icon: '📖', title: 'סיפור בשרשרת', desc: 'כל אחד בתורו מוסיף משפט לסיפור המשותף — עד שמגיעים לסוף מצחיק.', players: '3+', time: '15 דק׳' },
  { icon: '🧠', title: 'זיכרון משפחתי', desc: 'שאלות טריוויה על רגעים משפחתיים: מי זוכר הכי טוב את הטיולים והחגים?', players: '2+', time: '20 דק׳' },
  { icon: '🎭', title: 'אמת או חובה', desc: 'גרסה משפחתית — כיף, מצחיק, ומתאים לכל הגילים בלי מבוכות.', players: '3+', time: '30 דק׳' },
  { icon: '🎨', title: 'ציור בזוגות', desc: 'זוג אחד מצייר, השאר מנחשים. מי שמנחש ראשון זוכה בתור הבא.', players: '4+', time: '20 דק׳' },
  { icon: '🕵️', title: 'מי אני?', desc: 'מדביקים פתק עם שם על המצח, ושואלים שאלות כדי לגלות מי אתם.', players: '3+', time: '15 דק׳' },
  { icon: '🎵', title: 'ניחוש שירים', desc: 'אחד מזמזם והשאר מנחשים את השיר. נקודה על כל ניחוש נכון.', players: '2+', time: '15 דק׳' },
  { icon: '🗺️', title: 'מסע סביב העולם', desc: 'כל אחד אומר מדינה שמתחילה באות האחרונה של הקודמת. מי שנתקע יוצא.', players: '2+', time: '10 דק׳' },
  { icon: '🔤', title: 'ארץ עיר', desc: 'קלאסיקה נצחית — מילים מכל קטגוריה באות שנבחרה.', players: '2+', time: '15 דק׳' },
]

export default function Games() {
  return (
    <>
      <h1 className="page-title">משחקים</h1>
      <p className="page-subtitle">
        אוסף המשחקים האהובים עלינו — לשחק יחד בסלון, במכונית, או סביב שולחן האוכל.
      </p>
      <div className="grid">
        {GAMES.map(g => (
          <div className="card" key={g.title}>
            <div className="card-icon" style={{ fontSize: 22 }}>{g.icon}</div>
            <h3>{g.title}</h3>
            <p>{g.desc}</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 14, fontSize: 12, color: 'var(--text-muted)' }}>
              <span style={{ padding: '4px 10px', background: 'var(--surface-2)', borderRadius: 999 }}>👥 {g.players}</span>
              <span style={{ padding: '4px 10px', background: 'var(--surface-2)', borderRadius: 999 }}>⏱️ {g.time}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
