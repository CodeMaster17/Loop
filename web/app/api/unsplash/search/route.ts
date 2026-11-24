import { accessKey, forward, fromOwnSite, searchUrl } from '../../../../server/unsplash';

export async function GET(req: Request) {
  if (!fromOwnSite(req)) return new Response('Forbidden', { status: 403 });
  const key = accessKey();
  if (!key) return Response.json({ error: 'Unsplash is not set up' }, { status: 503 });
  const url = searchUrl(new URL(req.url).searchParams);
  if (!url) return Response.json({ error: 'Bad query' }, { status: 400 });
  return forward(url, key);
}
