import { vapid } from '../../../../server/vapid';

export function GET() {
  const v = vapid();
  if (!v) return Response.json({ error: 'Reminders are not set up' }, { status: 503 });
  return Response.json({ publicKey: v.publicKey });
}
