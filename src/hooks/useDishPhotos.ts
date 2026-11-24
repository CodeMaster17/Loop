// Dish photos keyed by lowercase dish name, refreshed whenever the background filler saves new ones.
import { useEffect, useState } from 'react';
import { getDb } from '../db/open';
import { type DishPhoto, photosByDishName } from '../db/repo';
import { onPhotosUpdated } from '../lib/photoFiller';

export function useDishPhotos(): Record<string, DishPhoto> {
  const [photos, setPhotos] = useState<Record<string, DishPhoto>>({});
  useEffect(() => {
    let alive = true;
    const load = () => {
      getDb().then(photosByDishName).then((m) => { if (alive) setPhotos(m); }).catch(() => {});
    };
    load();
    const off = onPhotosUpdated(load);
    return () => { alive = false; off(); };
  }, []);
  return photos;
}
