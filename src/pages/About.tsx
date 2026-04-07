const TIMELINE = [
  { year: 'ההתחלה', text: 'החלטנו שאנחנו רוצים מקום אחד שיאסוף את הסיפורים, החוקים והמשחקים שלנו.' },
  { year: 'האיסוף', text: 'ישבנו יחד סביב השולחן וכתבנו את החוקים שהכי חשובים לנו.' },
  { year: 'הבנייה', text: 'הפכנו את הרעיונות לאתר אמיתי — מינימליסטי, בעברית, בשבילנו.' },
  { year: 'היום', text: 'האתר חי, גדל ומתעדכן כל פעם שיש לנו משהו חדש לשתף.' },
  { year: 'מחר', text: 'נמשיך להוסיף משחקים, זיכרונות ורעיונות — יחד.' },
]

export default function About() {
  return (
    <>
      <h1 className="page-title">אודות</h1>
      <p className="page-subtitle">
        האתר הזה נולד מתוך הרצון לאסוף במקום אחד את כל מה שמיוחד למשפחה שלנו —
        החוקים, המשחקים, הסיפורים והרעיונות. הוא שייך לכולנו, ומתעדכן כל הזמן.
      </p>

      <div className="grid">
        <div className="card">
          <div className="card-icon">🏠</div>
          <h3>למה בנינו את זה</h3>
          <p>כי אנחנו מאמינים שמשפחה זה הדבר הכי חשוב, וכדאי שיהיה לה בית גם ברשת.</p>
        </div>
        <div className="card">
          <div className="card-icon">👥</div>
          <h3>מי בונה את זה</h3>
          <p>כולנו. כל אחד יכול להציע רעיונות, להוסיף חוקים, ולחלוק משחקים חדשים.</p>
        </div>
        <div className="card">
          <div className="card-icon">💡</div>
          <h3>איך להשתתף</h3>
          <p>פשוט לדבר איתנו — כל רעיון, גם הקטן ביותר, מתקבל בברכה.</p>
        </div>
      </div>

      <h2 className="section-title">הסיפור שלנו</h2>
      <div className="timeline">
        {TIMELINE.map((t, i) => (
          <div className="timeline-item" key={i}>
            <div className="timeline-year">{t.year}</div>
            <div className="timeline-text">{t.text}</div>
          </div>
        ))}
      </div>
    </>
  )
}
