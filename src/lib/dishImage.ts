// The picture to show for a dish: the Unsplash photo found for it (sharper) first,
// otherwise the photo bundled in the app (from Wikimedia Commons), otherwise none.
import type { ImageSourcePropType } from 'react-native';
import type { DishPhoto } from '../db/repo';
import { BUNDLED_DISH_PHOTOS } from '../design/dishPhotoImages';

export type PhotoCreditInfo =
  | { kind: 'unsplash'; author: string; authorUrl: string }
  | { kind: 'commons'; author: string; license: string; pageUrl: string };

export interface DishImage {
  source: ImageSourcePropType;
  credit: PhotoCreditInfo;
}

export function hasBundledPhoto(dishName: string): boolean {
  return !!BUNDLED_DISH_PHOTOS[dishName.trim().toLowerCase()];
}

/** Photos saved before the 640px change use Unsplash's 400px "small" size; ask for 640px instead. */
export function sharperUnsplash(url: string): string {
  return url.startsWith('https://images.unsplash.com/') ? url.replace(/([?&])w=400(&|$)/, '$1w=640$2') : url;
}

export function dishImage(dishName: string, unsplash?: DishPhoto | null): DishImage | undefined {
  if (unsplash) return { source: { uri: sharperUnsplash(unsplash.url) }, credit: { kind: 'unsplash', author: unsplash.author, authorUrl: unsplash.authorUrl } };
  const b = BUNDLED_DISH_PHOTOS[dishName.trim().toLowerCase()];
  if (b) return { source: b.source, credit: { kind: 'commons', author: b.author, license: b.license, pageUrl: b.pageUrl } };
  return undefined;
}
