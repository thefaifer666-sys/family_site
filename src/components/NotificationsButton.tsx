import { useEffect, useState } from 'react'
import { currentPermission, isEnabled, isSupported, requestAndEnable, setEnabled } from '../lib/notifications'

export default function NotificationsButton() {
  const [state, setState] = useState<'off' | 'on' | 'blocked' | 'unsupported'>('off')

  useEffect(() => {
    if (!isSupported()) { setState('unsupported'); return }
    const perm = currentPermission()
    if (perm === 'denied') setState('blocked')
    else if (perm === 'granted' && isEnabled()) setState('on')
    else setState('off')
  }, [])

  if (state === 'unsupported') return null

  const handleClick = async () => {
    if (state === 'on') {
      setEnabled(false)
      setState('off')
      return
    }
    if (state === 'blocked') {
      alert('התראות חסומות בדפדפן. יש להפעיל אותן בהגדרות האתר.')
      return
    }
    const result = await requestAndEnable()
    if (result === 'granted') setState('on')
    else if (result === 'denied') setState('blocked')
  }

  const label =
    state === 'on' ? '🔔 התראות פעילות' :
    state === 'blocked' ? '🔕 התראות חסומות' :
    '🔔 הפעלת התראות'

  return (
    <button className={`footer-btn ${state === 'on' ? 'notify-on' : ''}`} onClick={handleClick}>
      {label}
    </button>
  )
}
