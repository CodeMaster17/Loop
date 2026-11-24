// Review a WhatsApp message before sending. For a day's menu you choose what to send —
// breakfast + lunch (cook's morning visit), dinner (evening visit) or the whole day —
// plus language and emojis. Recipe videos attached on the Menu card are included.
import { useState } from 'react';
import { palette as p } from '../../shared/src/design/palette';
import { buildCookMessage, defaultPart, type MessagePart } from '../../shared/src/domain/cookMessage';
import { planDays } from '../../shared/src/domain/planDays';
import { useDishVideos } from '../../shared/src/hooks/useDishVideos';
import { buildGroceryMessage } from '../../shared/src/lib/messages';
import { useStore } from '../../shared/src/store';
import type { Lang } from '../../shared/src/types';
import { Btn, Sheet, Switch } from '../components/ui';
import { whatsAppUrl } from '../whatsapp';

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
    <div>
      <h2 style={{ color: p.ink, fontWeight: 700, fontSize: 18 }}>
        {ctx.kind === 'grocery' ? 'Send grocery list' : `Send to ${s.cookName || 'your cook'}`}
      </h2>
      <p style={{ color: p.inkSoft, fontSize: 13, marginTop: 4, marginBottom: 14, lineHeight: '19px' }}>
        It opens in WhatsApp for you to tap send. Nothing is sent automatically.
      </p>

      {ctx.kind === 'day' ? (
        <div role="tablist" style={{ display: 'flex', background: p.surface2, borderRadius: 10, padding: 3, marginBottom: 12 }}>
          {PARTS.map((x) => {
            const on = x.key === part;
            return (
              <button
                key={x.key}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setPart(x.key)}
                style={{ flex: 1, padding: '9px 0', borderRadius: 8, textAlign: 'center', background: on ? p.surface : 'transparent', boxShadow: on ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', color: on ? p.ink : p.inkSoft, fontSize: 13, fontWeight: on ? 700 : 500 }}
              >
                {x.label}
              </button>
            );
          })}
        </div>
      ) : null}

      <div style={{ background: '#E7FFDB', borderRadius: 12, padding: 14, color: p.ink, fontSize: 13.5, lineHeight: '21px', whiteSpace: 'pre-wrap', userSelect: 'text', WebkitUserSelect: 'text' }}>
        {text}
      </div>

      {ctx.kind === 'day' ? (
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 14, gap: 12 }}>
          <div style={{ display: 'flex', background: p.surface2, borderRadius: 8, padding: 3, flex: 1 }}>
            {(['english', 'hinglish'] as Lang[]).map((l) => {
              const on = s.lang === l;
              return (
                <button key={l} type="button" onClick={() => setLang(l)} style={{ flex: 1, padding: '7px 0', borderRadius: 6, textAlign: 'center', background: on ? p.surface : 'transparent', color: on ? p.ink : p.inkSoft, fontWeight: on ? 700 : 500, fontSize: 12.5, textTransform: 'capitalize' }}>
                  {l}
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: p.inkSoft, fontSize: 13 }}>Emojis</span>
            <Switch value={emoji} onChange={(v) => updateSettings({ emoji: v })} label="Emojis" />
          </div>
        </div>
      ) : null}

      <Btn
        label="Open in WhatsApp"
        kind="wa"
        icon="logo-whatsapp"
        href={whatsAppUrl(text, ctx.kind === 'day' ? s.cookNum : undefined)}
        onPress={() => { setTimeout(onClose, 300); }}
        style={{ marginTop: 16 }}
      />
    </div>
  );
}
