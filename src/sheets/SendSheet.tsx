import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Btn, Sheet } from '../components/ui';
import { buildGroceryMessage, buildMenuMessage } from '../lib/messages';
import { openWhatsApp } from '../lib/whatsapp';
import { useStore } from '../store';
import { useColors } from '../theme';
import type { Lang } from '../types';

export interface SendCtx {
  kind: 'day' | 'grocery';
  key?: string;
}

export function SendSheet({ ctx, onClose }: { ctx: SendCtx | null; onClose: () => void }) {
  const c = useColors();
  const { store, setLang } = useStore();
  if (!ctx) return null;

  const s = store.settings;
  const text = ctx.kind === 'grocery'
    ? buildGroceryMessage(store.plan, store.done)
    : buildMenuMessage(store.plan, ctx.key ?? store.cur, s);

  return (
    <Sheet visible={!!ctx} onClose={onClose}>
      <Text style={{ color: c.ink, fontWeight: '700', fontSize: 18 }}>
        {ctx.kind === 'grocery' ? 'Send grocery list' : `Send to cook${s.cookName ? ` — ${s.cookName}` : ''}`}
      </Text>
      <Text style={{ color: c.inkSoft, fontSize: 13, marginTop: 4, marginBottom: 14, lineHeight: 19 }}>
        Review it, then it opens in WhatsApp for you to tap send. Nothing is sent automatically.
      </Text>
      <View style={{ backgroundColor: c.surface2, borderWidth: 1, borderColor: c.line, borderRadius: 12, padding: 14 }}>
        <Text style={{ color: c.ink, fontSize: 13.5, lineHeight: 22 }}>{text}</Text>
      </View>
      {ctx.kind === 'day' ? (
        <View style={{ marginTop: 14 }}>
          <Text style={{ color: c.inkSoft, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>Language</Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {(['english', 'hinglish'] as Lang[]).map((l) => (
              <Pressable key={l} onPress={() => setLang(l)} style={{ flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: s.lang === l ? 'transparent' : c.line, backgroundColor: s.lang === l ? c.green : c.surface2, alignItems: 'center' }}>
                <Text style={{ color: s.lang === l ? c.onDark : c.inkSoft, fontWeight: '600', fontSize: 13, textTransform: 'capitalize' }}>{l}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
      <Btn
        label="Open in WhatsApp"
        kind="wa"
        onPress={() => { openWhatsApp(text, ctx.kind === 'day' ? s.cookNum : undefined); onClose(); }}
        style={{ marginTop: 16 }}
      />
    </Sheet>
  );
}
