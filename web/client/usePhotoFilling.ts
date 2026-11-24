// Same schedule as src/hooks/usePhotoFilling.ts: at launch, whenever the app comes back to
// the foreground, and every 20 minutes while open — through the server proxy (photos.ts).
import { useEffect } from 'react';
import { getDb } from '../shared/src/db/open';
import { fillPhotos } from './photos';

const EVERY_MS = 20 * 60 * 1000;

function runOnce(): void {
  getDb().then((db) => fillPhotos(db)).catch(() => { /* offline or limit reached: try again later */ });
}

export function usePhotoFilling(): void {
  useEffect(() => {
    runOnce();
    const onVisible = () => { if (document.visibilityState === 'visible') runOnce(); };
    document.addEventListener('visibilitychange', onVisible);
    const timer = setInterval(runOnce, EVERY_MS);
    return () => { document.removeEventListener('visibilitychange', onVisible); clearInterval(timer); };
  }, []);
}
