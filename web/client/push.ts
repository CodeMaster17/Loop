// Web push for the daily reminder. On iPhone this needs iOS 16.4+ and Rasoi added to the
// Home Screen; Safari tabs can't receive push. The server sends the reminder each morning.

export function pushSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/** True when running as an installed Home Screen app (where iOS allows push). */
export function isInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;
}

function keyBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const pad = '='.repeat((4 - (base64url.length % 4)) % 4);
  const b64 = (base64url + pad).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export interface DailyReminder {
  title: string;
  body: string;
  hour: number;
  minute: number;
}

export async function subscribeDaily(reminder: DailyReminder): Promise<void> {
  if (!pushSupported()) throw new Error('Push is not available here');
  const reg = await navigator.serviceWorker.ready;
  const res = await fetch('/api/push/key');
  if (!res.ok) throw new Error('Reminders are not set up on the server');
  const { publicKey } = (await res.json()) as { publicKey: string };
  const sub = (await reg.pushManager.getSubscription())
    ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(publicKey) }));
  const saved = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subscription: sub.toJSON(),
      ...reminder,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
  });
  if (!saved.ok) throw new Error(`Could not save the reminder (${saved.status})`);
}

export async function unsubscribeAll(): Promise<void> {
  if (!pushSupported()) return;
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return;
  await fetch('/api/push/unsubscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint: sub.endpoint }),
  }).catch(() => {});
  await sub.unsubscribe();
}
