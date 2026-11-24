// Where the server keeps push subscriptions (one per device that turned the reminder on).
// On Vercel: Upstash Redis over its REST API (free tier; added from the Vercel Marketplace,
// which sets KV_REST_API_URL / KV_REST_API_TOKEN). Locally: a JSON file in web/.data/.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export interface StoredSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  title: string;
  body: string;
  hour: number;
  minute: number;
  timeZone: string;
  savedAt: string;
}

export interface PushStore {
  save(sub: StoredSubscription): Promise<void>;
  remove(endpoint: string): Promise<void>;
  all(): Promise<StoredSubscription[]>;
}

const HASH = 'rasoi:push';

export function redisStore(url: string, token: string): PushStore {
  const call = async (command: (string | number)[]): Promise<unknown> => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(command),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Redis ${command[0]} failed (${res.status})`);
    return ((await res.json()) as { result: unknown }).result;
  };
  return {
    async save(sub) { await call(['HSET', HASH, sub.endpoint, JSON.stringify(sub)]); },
    async remove(endpoint) { await call(['HDEL', HASH, endpoint]); },
    async all() {
      const flat = ((await call(['HGETALL', HASH])) ?? []) as string[];
      const out: StoredSubscription[] = [];
      for (let i = 1; i < flat.length; i += 2) out.push(JSON.parse(flat[i]) as StoredSubscription);
      return out;
    },
  };
}

export function fileStore(dir: string): PushStore {
  const file = join(dir, 'push-subscriptions.json');
  const read = async (): Promise<Record<string, StoredSubscription>> => {
    try { return JSON.parse(await readFile(file, 'utf8')) as Record<string, StoredSubscription>; } catch { return {}; }
  };
  const write = async (data: Record<string, StoredSubscription>) => {
    await mkdir(dir, { recursive: true });
    await writeFile(file, JSON.stringify(data, null, 2));
  };
  return {
    async save(sub) { const d = await read(); d[sub.endpoint] = sub; await write(d); },
    async remove(endpoint) { const d = await read(); delete d[endpoint]; await write(d); },
    async all() { return Object.values(await read()); },
  };
}

/** The store for this environment, or null when none is configured (e.g. on Vercel without Redis). */
export function pushStore(): PushStore | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return redisStore(url, token);
  if (process.env.VERCEL) return null; // no writable disk on Vercel
  return fileStore(join(process.cwd(), '.data'));
}

const MAX_SUBSCRIPTIONS = 20;

/** Checks a subscription posted by the browser. Returns an error message or null. */
export function validate(input: unknown): { sub: StoredSubscription } | { error: string } {
  const b = input as {
    subscription?: { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
    title?: unknown; body?: unknown; hour?: unknown; minute?: unknown; timeZone?: unknown;
  } | null;
  const s = b?.subscription;
  if (!s || typeof s.endpoint !== 'string' || !s.endpoint.startsWith('https://') || s.endpoint.length > 1000) return { error: 'Bad endpoint' };
  if (typeof s.keys?.p256dh !== 'string' || typeof s.keys?.auth !== 'string' || s.keys.p256dh.length > 200 || s.keys.auth.length > 100) return { error: 'Bad keys' };
  const text = (v: unknown, fallback: string) => (typeof v === 'string' ? v.slice(0, 120) : fallback);
  const int = (v: unknown, max: number, fallback: number) => (Number.isInteger(v) && (v as number) >= 0 && (v as number) <= max ? (v as number) : fallback);
  return {
    sub: {
      endpoint: s.endpoint,
      keys: { p256dh: s.keys.p256dh, auth: s.keys.auth },
      title: text(b?.title, 'Rasoi 🍛'),
      body: text(b?.body, "Send today's menu to your cook"),
      hour: int(b?.hour, 23, 8),
      minute: int(b?.minute, 59, 0),
      timeZone: text(b?.timeZone, 'Asia/Kolkata'),
      savedAt: new Date().toISOString(),
    },
  };
}

export async function saveWithLimit(store: PushStore, sub: StoredSubscription): Promise<boolean> {
  const existing = await store.all();
  if (existing.length >= MAX_SUBSCRIPTIONS && !existing.some((e) => e.endpoint === sub.endpoint)) return false;
  await store.save(sub);
  return true;
}
