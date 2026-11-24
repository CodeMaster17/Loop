// VAPID keys identify this server to Apple's / Google's push services.
// Create once with `npx web-push generate-vapid-keys` and set as environment variables.
import * as webpush from 'web-push';

export function vapid(): { publicKey: string; privateKey: string; subject: string } | null {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return null;
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const subject = process.env.VAPID_SUBJECT ?? (host ? `https://${host}` : 'https://rasoi.example');
  return { publicKey, privateKey, subject };
}

export function configuredWebPush(): typeof webpush | null {
  const v = vapid();
  if (!v) return null;
  webpush.setVapidDetails(v.subject, v.publicKey, v.privateKey);
  return webpush;
}
