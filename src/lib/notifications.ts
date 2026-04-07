// Simple browser Notification API wrapper.

const STORAGE_KEY = 'family-site:notifications:enabled'

export function isSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function currentPermission(): NotificationPermission | 'unsupported' {
  if (!isSupported()) return 'unsupported'
  return Notification.permission
}

export function isEnabled(): boolean {
  if (!isSupported()) return false
  if (Notification.permission !== 'granted') return false
  return localStorage.getItem(STORAGE_KEY) === '1'
}

export function setEnabled(v: boolean) {
  localStorage.setItem(STORAGE_KEY, v ? '1' : '0')
}

export async function requestAndEnable(): Promise<NotificationPermission | 'unsupported'> {
  if (!isSupported()) return 'unsupported'
  let p = Notification.permission
  if (p === 'default') p = await Notification.requestPermission()
  if (p === 'granted') setEnabled(true)
  return p
}

export function notify(title: string, body: string) {
  if (!isEnabled()) return
  try {
    new Notification(title, {
      body,
      icon: '/pwa-icon.svg',
      badge: '/pwa-icon.svg',
      lang: 'he',
      tag: 'family-site-' + Date.now(),
    })
  } catch (e) {
    console.warn('notification failed', e)
  }
}
