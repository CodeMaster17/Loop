// Keeps filling missing dish photos: at launch, whenever the app comes back to the
// foreground, and every 20 minutes while it stays open. The filler itself stays under
// Unsplash's hourly limit and does nothing once every dish has been checked.
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { getDb } from '../db/open';
import { fillMissingPhotos } from '../lib/photoFiller';

const EVERY_MS = 20 * 60 * 1000;

function runOnce(): void {
  getDb().then((db) => fillMissingPhotos(db)).catch(() => { /* offline or limit reached: try again later */ });
}

export function usePhotoFilling(): void {
  useEffect(() => {
    runOnce();
    const sub = AppState.addEventListener('change', (state) => { if (state === 'active') runOnce(); });
    const timer = setInterval(runOnce, EVERY_MS);
    return () => { sub.remove(); clearInterval(timer); };
  }, []);
}
