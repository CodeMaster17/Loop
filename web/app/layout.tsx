import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import { palette } from '../shared/src/design/palette';
import './globals.css';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], display: 'swap', variable: '--font-poppins' });

export const metadata: Metadata = {
  title: 'Rasoi',
  description: "Your week's meals, planned for you and sent straight to your cook.",
  applicationName: 'Rasoi',
  appleWebApp: { capable: true, title: 'Rasoi', statusBarStyle: 'default' },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' }, { url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Stops iOS zooming in when a text field is focused; pinch-zoom still works.
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: palette.bg,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>{children}</body>
    </html>
  );
}
