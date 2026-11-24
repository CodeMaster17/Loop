// The individual onboarding step bodies (the flow controller owns header + footer).
import { useState } from 'react';
import { CUISINES, dishesFor, KITCHEN, MEAL_TABS, REGIONS } from '../../shared/src/data/cuisines';
import { palette as c } from '../../shared/src/design/palette';
import type { OnbSlot, Prefs } from '../../shared/src/types';
import { OptionCard, SelectPill } from './ui';

/* ---------------- Welcome ---------------- */
export function WelcomeStep({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: 30 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}>
        <div style={{ width: 88, height: 88, borderRadius: 26, background: c.brand, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 46 }}>🍛</div>
        <h1 style={{ color: c.ink, fontSize: 30, fontWeight: 800, letterSpacing: -0.5, marginTop: 20 }}>Rasoi</h1>
        <p style={{ color: c.inkSoft, fontSize: 15, marginTop: 8, textAlign: 'center', lineHeight: '21px', whiteSpace: 'pre-line' }}>
          {"Your week's meals, planned for you\nand sent straight to your cook."}
        </p>
      </div>
      <button type="button" className="press" onClick={onStart} style={{ background: c.brand, padding: '16px 0', borderRadius: 12, textAlign: 'center', color: c.white, fontSize: 16, fontWeight: 700 }}>
        Get started
      </button>
      <p style={{ color: c.inkFaint, fontSize: 12, textAlign: 'center', marginTop: 8 }}>Saved on this device only — no account needed.</p>
    </div>
  );
}

/* ---------------- Cuisine ---------------- */
export function CuisineStep({ selected, onToggle }: { selected: string[]; onToggle: (id: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {CUISINES.map((cu) => (
        <OptionCard
          key={cu.id}
          emoji={cu.emoji}
          label={cu.label}
          sub={cu.regionIds.map((r) => REGIONS.find((x) => x.id === r)?.label).filter(Boolean).join(', ')}
          selected={selected.includes(cu.id)}
          onPress={() => onToggle(cu.id)}
        />
      ))}
    </div>
  );
}

/* ---------------- Region ---------------- */
export function RegionStep({ cuisines, selected, onToggle }: { cuisines: string[]; selected: string[]; onToggle: (id: string) => void }) {
  const regions = REGIONS.filter((r) => cuisines.length === 0 || cuisines.includes(r.cuisineId));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {regions.map((r) => (
        <OptionCard
          key={r.id}
          label={r.label}
          sub={CUISINES.find((cu) => cu.id === r.cuisineId)?.label}
          selected={selected.includes(r.id)}
          onPress={() => onToggle(r.id)}
        />
      ))}
      {regions.length === 0 ? <p style={{ color: c.inkFaint, fontSize: 13 }}>Pick a cuisine first to see regions.</p> : null}
    </div>
  );
}

/* ---------------- Menu (4 tabs) ---------------- */
export function MenuStep({ cuisines, menu, onToggle }: {
  cuisines: string[];
  menu: Prefs['menu'];
  onToggle: (slot: OnbSlot, name: string) => void;
}) {
  const [slot, setSlot] = useState<OnbSlot>('breakfast');
  const dishes = dishesFor(slot, cuisines);
  const count = menu[slot].length;

  return (
    <div>
      <div role="tablist" style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {MEAL_TABS.map((t) => {
          const active = t.slot === slot;
          const picked = menu[t.slot].length;
          return (
            <button
              key={t.slot}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSlot(t.slot)}
              style={{ position: 'relative', flex: 1, padding: '9px 0', borderRadius: 11, display: 'flex', flexDirection: 'column', alignItems: 'center', background: active ? c.brand : c.surface, border: `1px solid ${active ? 'transparent' : c.line}` }}
            >
              <span style={{ fontSize: 16 }}>{t.emoji}</span>
              <span style={{ color: active ? c.white : c.inkSoft, fontSize: 10, fontWeight: 700, marginTop: 2 }}>{t.label}</span>
              {picked > 0 ? (
                <span style={{ position: 'absolute', top: 4, right: 6, background: active ? c.white : c.brand, borderRadius: 99, minWidth: 15, height: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', color: active ? c.brand : c.white, fontSize: 9, fontWeight: 800 }}>
                  {picked}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <p style={{ color: c.inkFaint, fontSize: 12, marginBottom: 10 }}>
        {count > 0 ? `${count} selected — tap to add or remove` : 'Tap the ones you like, or skip this meal.'}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {dishes.map((d) => (
          <OptionCard
            key={`${d.slot}-${d.name}`}
            emoji={d.veg ? '🟢' : '🔴'}
            label={d.name}
            sub={`${d.p}g protein`}
            selected={menu[slot].includes(d.name)}
            onPress={() => onToggle(slot, d.name)}
          />
        ))}
        {dishes.length === 0 ? <p style={{ color: c.inkFaint, fontSize: 13 }}>No dishes for this selection.</p> : null}
      </div>
    </div>
  );
}

/* ---------------- Review ---------------- */
export function ReviewStep({ menu }: { menu: Prefs['menu'] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {MEAL_TABS.map((t) => {
        const items = menu[t.slot];
        return (
          <div key={t.slot} style={{ background: c.surface, border: `1px solid ${c.line}`, borderRadius: 14, padding: 14 }}>
            <p style={{ color: c.ink, fontSize: 14.5, fontWeight: 700, marginBottom: items.length ? 8 : 0 }}>{`${t.emoji}  ${t.label}`}</p>
            {items.length === 0 ? (
              <p style={{ color: c.inkFaint, fontSize: 13 }}>Skipped</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {items.map((name) => (
                  <span key={name} style={{ background: c.vegSoft, borderRadius: 99, padding: '5px 10px', color: c.vegDeep, fontSize: 12.5, fontWeight: 600 }}>{name}</span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Kitchen ---------------- */
export function KitchenStep({ pantry, onToggle }: { pantry: Record<string, boolean>; onToggle: (name: string) => void }) {
  const staples = KITCHEN.filter((k) => k.category === 'staple');
  const perishables = KITCHEN.filter((k) => k.category === 'perishable');
  const have = KITCHEN.filter((k) => pantry[k.name]).length;

  return (
    <div>
      <p style={{ color: c.brandInk, fontSize: 12.5, fontWeight: 600, marginBottom: 14 }}>✓ {have} items already in your kitchen</p>
      <KitchenSection pantry={pantry} onToggle={onToggle} title="Staples" hint="Usually always stocked — leave ticked, untick if you're out." items={staples} />
      <KitchenSection pantry={pantry} onToggle={onToggle} title="Fresh / perishable" hint="Tick anything you already have at home." items={perishables} />
    </div>
  );
}

function KitchenSection({ title, hint, items, pantry, onToggle }: {
  title: string;
  hint: string;
  items: typeof KITCHEN;
  pantry: Record<string, boolean>;
  onToggle: (name: string) => void;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ color: c.ink, fontSize: 14.5, fontWeight: 700 }}>{title}</p>
      <p style={{ color: c.inkFaint, fontSize: 12, marginTop: 2, marginBottom: 10 }}>{hint}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {items.map((k) => <SelectPill key={k.name} label={k.name} selected={!!pantry[k.name]} onPress={() => onToggle(k.name)} />)}
      </div>
    </div>
  );
}
