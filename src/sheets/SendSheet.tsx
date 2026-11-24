// Review a WhatsApp message before sending. For a day's menu you choose what to send —
// breakfast + lunch (cook's morning visit), dinner (evening visit) or the whole day —
// plus language and emojis. Recipe videos attached on the Menu card are included.
import React, { useState } from 'react';
import { Pressable, Switch, View } from 'react-native';
import { Text } from '../components/Text';
import { Btn, Sheet } from '../components/ui';
import { palette as p } from '../design/palette';
import { buildCookMessage, defaultPart, type MessagePart } from '../domain/cookMessage';
import { planDays } from '../domain/planDays';
import { useDishVideos } from '../hooks/useDishVideos';
import { buildGroceryMessage } from '../lib/messages';
import { openWhatsApp } from '../lib/whatsapp';
import { useStore } from '../store';
import type { Lang } from '../types';

export interface SendCtx {
  kind: 'day' | 'grocery';
  key?: string;
}

const PARTS: { key: MessagePart; label: string }[] = [
  { key: 'morning', label: 'Breakfast + Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'all', label: 'Whole day' },
];

export function SendSheet({ ctx, onClose }: { ctx: SendCtx | null; onClose: () => void }) {
  return (
    <Sheet visible={!!ctx} onClose={onClose}>
      {ctx ? <SendBody key={`${ctx.kind}-${ctx.key ?? ''}`} ctx={ctx} onClose={onClose} /> : null}
    </Sheet>
  );
}

function SendBody({ ctx, onClose }: { ctx: SendCtx; onClose: () => void }) {
  const { store, setLang, updateSettings } = useStore();
  const s = store.settings;
  const videos = useDishVideos(ctx);
  const day = ctx.kind === 'day' ? planDays(new Date(), 14).find((d) => d.key === ctx.key) : undefined;
  const [part, setPart] = useState<MessagePart>(() => defaultPart(day?.label ?? ''));
  const emoji = s.emoji ?? true;

  const plan = ctx.key ? store.plan[ctx.key] : undefined;
  const text = ctx.kind === 'grocery'
    ? buildGroceryMessage(store.plan, store.done)
    : plan
      ? buildCookMessage({
        dayLabel: day?.label ?? '',
        dateSub: day?.sub ?? ctx.key ?? '',
        cookName: s.cookName,
        lang: s.lang,
        part,
        meals: { breakfast: plan.breakfast.name, lunch: plan.lunch.name, dinner: plan.dinner.name },
        videos,
        emoji,
      })
      : '';

  return (
    <View>
      <Text style={{ color: p.ink, fontWeight: '700', fontSize: 18 }}>
        {ctx.kind === 'grocery' ? 'Send grocery list' : `Send to ${s.cookName || 'your cook'}`}
      </Text>
      <Text style={{ color: p.inkSoft, fontSize: 13, marginTop: 4, marginBottom: 14, lineHeight: 19 }}>
        It opens in WhatsApp for you to tap send. Nothing is sent automatically.
      </Text>

      {ctx.kind === 'day' ? (
        <View style={{ flexDirection: 'row', backgroundColor: p.surface2, borderRadius: 10, padding: 3, marginBottom: 12 }}>
          {PARTS.map((x) => {
            const on = x.key === part;
            return (
              <Pressable
                key={x.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                onPress={() => setPart(x.key)}
                style={{ flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center', backgroundColor: on ? p.surface : 'transparent',
                  shadowColor: '#000', shadowOpacity: on ? 0.08 : 0, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } }}
              >
                <Text style={{ color: on ? p.ink : p.inkSoft, fontSize: 13, fontWeight: on ? '700' : '500' }}>{x.label}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <View style={{ backgroundColor: '#E7FFDB', borderRadius: 12, padding: 14 }}>
        <Text style={{ color: p.ink, fontSize: 13.5, lineHeight: 21 }}>{text}</Text>
      </View>

      {ctx.kind === 'day' ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 12 }}>
          <View style={{ flexDirection: 'row', backgroundColor: p.surface2, borderRadius: 8, padding: 3, flex: 1 }}>
            {(['english', 'hinglish'] as Lang[]).map((l) => {
              const on = s.lang === l;
              return (
                <Pressable key={l} onPress={() => setLang(l)} style={{ flex: 1, paddingVertical: 7, borderRadius: 6, alignItems: 'center', backgroundColor: on ? p.surface : 'transparent' }}>
                  <Text style={{ color: on ? p.ink : p.inkSoft, fontWeight: on ? '700' : '500', fontSize: 12.5, textTransform: 'capitalize' }}>{l}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ color: p.inkSoft, fontSize: 13 }}>Emojis</Text>
            <Switch value={emoji} onValueChange={(v) => updateSettings({ emoji: v })} trackColor={{ true: p.brand, false: p.line }} />
          </View>
        </View>
      ) : null}

      <Btn
        label="Open in WhatsApp"
        kind="wa"
        icon="logo-whatsapp"
        onPress={() => { openWhatsApp(text, ctx.kind === 'day' ? s.cookNum : undefined); onClose(); }}
        style={{ marginTop: 16 }}
      />
    </View>
  );
}
