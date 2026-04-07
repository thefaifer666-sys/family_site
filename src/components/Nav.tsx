export type PageKey = 'home' | 'features' | 'about' | 'games' | 'rules' | 'suggestions' | 'gallery'

type NavProps = Readonly<{
  current: PageKey
  onChange: (p: PageKey) => void
}>

const LINKS: { key: PageKey; label: string }[] = [
  { key: 'home', label: 'בית' },
  { key: 'gallery', label: 'גלריה' },
  { key: 'rules', label: 'חוקי המשפחה' },
  { key: 'games', label: 'משחקים' },
  { key: 'suggestions', label: 'הצעות' },
  { key: 'features', label: 'תכונות' },
  { key: 'about', label: 'אודות' },
]

export default function Nav({ current, onChange }: NavProps) {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="brand">
          <span className="brand-dot" />
          <span>המשפחה שלנו</span>
        </div>
        <div className="nav-links">
          {LINKS.map(link => (
            <button
              key={link.key}
              className={`nav-link ${current === link.key ? 'active' : ''}`}
              onClick={() => onChange(link.key)}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
