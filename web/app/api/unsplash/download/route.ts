import { accessKey, downloadUrl, forward, fromOwnSite } from '../../../../server/unsplash';

export async function GET(req: Request) {
  if (!fromOwnSite(req)) return new Response('Forbidden', { status: 403 });
  const key = accessKey();
  if (!key) return Response.json({ error: 'Unsplash is not set up' }, { status: 503 });
  const url = downloadUrl(new URL(req.url).searchParams.get('url'));
  if (!url) return Response.json({ error: 'Bad URL' }, { status: 400 });
  return forward(url, key);
}
