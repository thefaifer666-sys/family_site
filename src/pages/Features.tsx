type Feature = { title: string; desc: string; icon: JSX.Element }

const Icon = ({ d }: { d: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

const FEATURES: Feature[] = [
  {
    title: 'חוקי המשפחה',
    desc: 'אוסף החוקים שמנחים אותנו ביום־יום, כתובים בצורה ברורה ופשוטה.',
    icon: <Icon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" />,
  },
  {
    title: 'משחקים משפחתיים',
    desc: 'רעיונות למשחקים שאפשר לשחק יחד בסלון, בטיולים או בארוחות.',
    icon: <Icon d="M6 11h4 M8 9v4 M15 12h.01 M18 10h.01 M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258A4 4 0 0 0 17.32 5z" />,
  },
  {
    title: 'הצעות לפעילויות',
    desc: 'מקום לאסוף רעיונות חדשים למה להוסיף, לשנות ולשפר.',
    icon: <Icon d="M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
  },
  {
    title: 'היסטוריה משותפת',
    desc: 'רגעים, סיפורים ומסורות שאנחנו רוצים לזכור.',
    icon: <Icon d="M3 3v5h5 M3.05 13A9 9 0 1 0 6 5.3L3 8 M12 7v5l4 2" />,
  },
  {
    title: 'מצב כהה ונעים',
    desc: 'עיצוב מינימליסטי נקי שנעים לעיניים בכל שעות היום.',
    icon: <Icon d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
  },
  {
    title: 'תמיכה מלאה בעברית',
    desc: 'כיוון ימין־לשמאל, טיפוגרפיה נקייה וחוויה טבעית בעברית.',
    icon: <Icon d="m5 8 6 6 M4 14l6-6 2-3 M2 5h12 M7 2h1 M22 22l-5-10-5 10 M14 18h6" />,
  },
  {
    title: 'מהיר ורספונסיבי',
    desc: 'נטען בשנייה, עובד מצוין בטלפון, בטאבלט ובמחשב.',
    icon: <Icon d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />,
  },
  {
    title: 'פרטי ובטוח',
    desc: 'רק אנחנו. בלי מודעות, בלי מעקב, בלי רעש מיותר.',
    icon: <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  },
]

export default function Features() {
  return (
    <>
      <h1 className="page-title">תכונות האתר</h1>
      <p className="page-subtitle">
        כל מה שהאתר שלנו יודע לעשות — כדי שנוכל לגדול יחד כמשפחה.
      </p>
      <div className="grid">
        {FEATURES.map(f => (
          <div className="card" key={f.title}>
            <div className="card-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </>
  )
}
