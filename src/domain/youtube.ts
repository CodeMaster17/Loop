// Parse a YouTube link the way people paste or share it, and normalise it.

export interface YouTubeLink {
  id: string;
  /** Clean short link without tracking, e.g. https://youtu.be/dQw4w9WgXcQ */
  url: string;
  thumbnailUrl: string;
}

const ID = /^[A-Za-z0-9_-]{11}$/;

/** Find the first YouTube video link in some text. Returns null if there isn't one. */
export function parseYouTube(text: string): YouTubeLink | null {
  const match = text.match(/https?:\/\/[^\s]+/);
  const raw = match ? match[0] : text.trim();
  let u: URL;
  try {
    u = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\.|^m\.|^music\./, '');
  let id: string | null = null;
  if (host === 'youtu.be') id = u.pathname.split('/')[1] ?? null;
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (u.pathname === '/watch') id = u.searchParams.get('v');
    else {
      const m = u.pathname.match(/^\/(shorts|embed|live|v)\/([^/?#]+)/);
      if (m) id = m[2];
    }
  }
  if (!id || !ID.test(id)) return null;
  return { id, url: `https://youtu.be/${id}`, thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg` };
}
