import type { MetadataRoute } from 'next';
import { palette } from '../shared/src/design/palette';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Rasoi',
    short_name: 'Rasoi',
    description: "Your week's meals, planned for you and sent straight to your cook.",
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: palette.bg,
    theme_color: palette.bg,
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  };
}
