import { pushStore } from '../../../../server/pushStore';

export async function POST(req: Request) {
  const store = pushStore();
  if (!store) return Response.json({ error: 'Reminder storage is not set up' }, { status: 503 });
  const body = (await req.json().catch(() => null)) as { endpoint?: unknown } | null;
  if (typeof body?.endpoint !== 'string') return Response.json({ error: 'Bad endpoint' }, { status: 400 });
  await store.remove(body.endpoint);
  return Response.json({ ok: true });
}
