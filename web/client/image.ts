// Turns an image "source" from the shared code into a URL: Unsplash photos are { uri },
// bundled images are whatever the bundler gives for require('…jpg').
import type { ImageSourcePropType } from 'react-native';

export function imageUrl(source: ImageSourcePropType): string {
  if (typeof source === 'string') return source;
  if ('uri' in source) return source.uri;
  if ('default' in source) return source.default.src;
  return source.src;
}
