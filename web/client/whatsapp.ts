// WhatsApp link with the message pre-filled (same digits handling as src/lib/whatsapp.ts).
// The web uses the wa.me link; with a number it opens that chat, without one WhatsApp asks
// who to send to. Nothing is sent automatically — the user taps send.
export function whatsAppUrl(text: string, num?: string): string {
  const digits = (num ?? '').replace(/[^0-9]/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
