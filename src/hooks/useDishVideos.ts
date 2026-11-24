// Recipe videos keyed by lowercase dish name (reloaded each time `reloadKey` changes).
import { useEffect, useState } from 'react';
import { getDb } from '../db/open';
import { videosByDishName } from '../db/repo';

export function useDishVideos(reloadKey: unknown): Record<string, string> {
  const [videos, setVideos] = useState<Record<string, string>>({});
  useEffect(() => {
    let alive = true;
    getDb().then(videosByDishName).then((v) => { if (alive) setVideos(v); }).catch(() => {});
    return () => { alive = false; };
  }, [reloadKey]);
  return videos;
}
