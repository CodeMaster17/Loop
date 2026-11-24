import { pushStore, saveWithLimit, validate } from '../../../../server/pushStore';

export async function POST(req: Request) {
  const store = pushStore();
  if (!store) return Response.json({ error: 'Reminder storage is not set up' }, { status: 503 });
  const parsed = validate(await req.json().catch(() => null));
  if ('error' in parsed) return Response.json(parsed, { status: 400 });
  if (!(await saveWithLimit(store, parsed.sub))) return Response.json({ error: 'Too many devices' }, { status: 429 });
  return Response.json({ ok: true });
}
