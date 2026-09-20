// Opens WhatsApp with a pre-filled message (deep link, with wa.me fallback).
import { Linking } from 'react-native';

/**
 * Opens WhatsApp with `text` pre-filled. If `num` is given (digits, incl. country
 * code) it opens that contact's chat directly; otherwise WhatsApp's share sheet.
 * Nothing is ever sent automatically — the user taps send.
 */
export async function openWhatsApp(text: string, num?: string): Promise<void> {
  const digits = (num ?? '').replace(/[^0-9]/g, '');
  const app = `whatsapp://send?${digits ? `phone=${digits}&` : ''}text=${encodeURIComponent(text)}`;
  const web = `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
  try {
    const canOpen = await Linking.canOpenURL(app);
    await Linking.openURL(canOpen ? app : web);
  } catch {
    try { await Linking.openURL(web); } catch { /* give up silently */ }
  }
}
