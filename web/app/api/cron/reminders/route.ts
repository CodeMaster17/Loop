// Sends the daily "send today's menu" reminder to every subscribed device.
// Vercel Cron calls this each morning (see vercel.json) with the CRON_SECRET.
import { pushStore } from '../../../../server/pushStore';
import { configuredWebPush } from '../../../../server/vapid';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return new Response('Unauthorized', { status: 401 });
  const store = pushStore();
  const webpush = configuredWebPush();
  if (!store || !webpush) return Response.json({ error: 'Reminders are not set up' }, { status: 503 });

  let sent = 0;
  let removed = 0;
  for (const sub of await store.all()) {
    try {
      await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, JSON.stringify({ title: sub.title, body: sub.body }), { TTL: 6 * 3600 });
      sent += 1;
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode;
      // The device unsubscribed or the subscription expired.
      if (status === 404 || status === 410) { await store.remove(sub.endpoint); removed += 1; }
      else console.error('[rasoi] push failed', status);
    }
  }
  return Response.json({ sent, removed });
}
