// The individual onboarding step bodies (the flow controller owns header + footer).
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { CUISINES, dishesFor, KITCHEN, MEAL_TABS, REGIONS } from '../data/cuisines';
import { useColors } from '../theme';
import type { OnbSlot, Prefs } from '../types';
import { OptionCard, SelectPill } from './ui';

/* ---------------- Welcome ---------------- */
export function WelcomeStep({ onGuest, onGoogle }: { onGuest: () => void; onGoogle: () => void }) {
  const c = useColors();
  return (
    <View style={{ flex: 1, justifyContent: 'center', paddingBottom: 30 }}>
      <View style={{ alignItems: 'center', marginBottom: 40 }}>
        <View style={{ width: 88, height: 88, borderRadius: 26, backgroundColor: c.green, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 46 }}>🍛</Text>
        </View>
        <Text style={{ color: c.ink, fontSize: 30, fontWeight: '800', letterSpacing: -0.5, marginTop: 20 }}>Rasoi</Text>
        <Text style={{ color: c.inkSoft, fontSize: 15, marginTop: 8, textAlign: 'center', lineHeight: 21 }}>
          Plan the day's meals by voice{'\n'}and send them straight to your cook.
        </Text>
      </View>

      <Pressable onPress={onGuest} style={{ backgroundColor: c.green, paddingVertical: 16, borderRadius: 14, alignItems: 'center' }}>
        <Text style={{ color: c.onDark, fontSize: 16, fontWeight: '700' }}>Continue as guest</Text>
      </Pressable>
      <Text style={{ color: c.inkFaint, fontSize: 12, textAlign: 'center', marginTop: 8 }}>Saved on this device only — no account needed.</Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 20 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: c.line }} />
        <Text style={{ color: c.inkFaint, fontSize: 12 }}>or</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: c.line }} />
      </View>

      <Pressable onPress={onGoogle} style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, paddingVertical: 16, borderRadius: 14, alignItems: 'center' }}>
        <Text style={{ color: c.ink, fontSize: 16, fontWeight: '700' }}>Sign in with Google</Text>
      </Pressable>
      <Text style={{ color: c.inkFaint, fontSize: 12, textAlign: 'center', marginTop: 8 }}>Account sync — coming soon.</Text>
    </View>
  );
}

/* ---------------- Cuisine ---------------- */
export function CuisineStep({ selected, onToggle }: { selected: string[]; onToggle: (id: string) => void }) {
  return (
    <View style={{ gap: 10 }}>
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
    </View>
  );
}

/* ---------------- Region ---------------- */
export function RegionStep({ cuisines, selected, onToggle }: { cuisines: string[]; selected: string[]; onToggle: (id: string) => void }) {
  const c = useColors();
  const regions = REGIONS.filter((r) => cuisines.length === 0 || cuisines.includes(r.cuisineId));
  return (
    <View style={{ gap: 10 }}>
      {regions.map((r) => (
        <OptionCard
          key={r.id}
          label={r.label}
          sub={CUISINES.find((cu) => cu.id === r.cuisineId)?.label}
          selected={selected.includes(r.id)}
          onPress={() => onToggle(r.id)}
        />
      ))}
      {regions.length === 0 ? <Text style={{ color: c.inkFaint, fontSize: 13 }}>Pick a cuisine first to see regions.</Text> : null}
    </View>
  );
}

/* ---------------- Menu (4 tabs) ---------------- */
export function MenuStep({ cuisines, menu, onToggle }: {
  cuisines: string[];
  menu: Prefs['menu'];
  onToggle: (slot: OnbSlot, name: string) => void;
}) {
  const c = useColors();
  const [slot, setSlot] = useState<OnbSlot>('breakfast');
  const dishes = dishesFor(slot, cuisines);
  const count = menu[slot].length;

  return (
    <View>
      {/* tabs */}
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 14 }}>
        {MEAL_TABS.map((t) => {
          const active = t.slot === slot;
          const picked = menu[t.slot].length;
          return (
            <Pressable key={t.slot} onPress={() => setSlot(t.slot)} style={{ flex: 1, paddingVertical: 9, borderRadius: 11, alignItems: 'center', backgroundColor: active ? c.green : c.surface, borderWidth: 1, borderColor: active ? 'transparent' : c.line }}>
              <Text style={{ fontSize: 16 }}>{t.emoji}</Text>
              <Text style={{ color: active ? c.onDark : c.inkSoft, fontSize: 10, fontWeight: '700', marginTop: 2 }}>{t.label}</Text>
              {picked > 0 ? (
                <View style={{ position: 'absolute', top: 4, right: 6, backgroundColor: active ? c.onDark : c.saffron, borderRadius: 99, minWidth: 15, height: 15, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 }}>
                  <Text style={{ color: active ? c.green : c.onDark, fontSize: 9, fontWeight: '800' }}>{picked}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <Text style={{ color: c.inkFaint, fontSize: 12, marginBottom: 10 }}>
        {count > 0 ? `${count} selected — tap to add or remove` : 'Tap the ones you like, or skip this meal.'}
      </Text>

      <View style={{ gap: 8 }}>
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
        {dishes.length === 0 ? <Text style={{ color: c.inkFaint, fontSize: 13 }}>No dishes for this selection.</Text> : null}
      </View>
    </View>
  );
}

/* ---------------- Review ---------------- */
export function ReviewStep({ menu }: { menu: Prefs['menu'] }) {
  const c = useColors();
  return (
    <View style={{ gap: 14 }}>
      {MEAL_TABS.map((t) => {
        const items = menu[t.slot];
        return (
          <View key={t.slot} style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 14, padding: 14 }}>
            <Text style={{ color: c.ink, fontSize: 14.5, fontWeight: '700', marginBottom: items.length ? 8 : 0 }}>{t.emoji}  {t.label}</Text>
            {items.length === 0 ? (
              <Text style={{ color: c.inkFaint, fontSize: 13 }}>Skipped</Text>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {items.map((name) => (
                  <View key={name} style={{ backgroundColor: c.leaf, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5 }}>
                    <Text style={{ color: c.greenDeep, fontSize: 12.5, fontWeight: '600' }}>{name}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

/* ---------------- Kitchen ---------------- */
export function KitchenStep({ pantry, onToggle }: { pantry: Record<string, boolean>; onToggle: (name: string) => void }) {
  const c = useColors();
  const staples = KITCHEN.filter((k) => k.category === 'staple');
  const perishables = KITCHEN.filter((k) => k.category === 'perishable');
  const have = KITCHEN.filter((k) => pantry[k.name]).length;

  const Section = ({ title, hint, items }: { title: string; hint: string; items: typeof KITCHEN }) => (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ color: c.ink, fontSize: 14.5, fontWeight: '700' }}>{title}</Text>
      <Text style={{ color: c.inkFaint, fontSize: 12, marginTop: 2, marginBottom: 10 }}>{hint}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {items.map((k) => (
          <SelectPill key={k.name} label={k.name} selected={!!pantry[k.name]} onPress={() => onToggle(k.name)} />
        ))}
      </View>
    </View>
  );

  return (
    <View>
      <Text style={{ color: c.saffronInk, fontSize: 12.5, fontWeight: '600', marginBottom: 14 }}>✓ {have} items already in your kitchen</Text>
      <Section title="Staples" hint="Usually always stocked — leave ticked, untick if you're out." items={staples} />
      <Section title="Fresh / perishable" hint="Tick anything you already have at home." items={perishables} />
    </View>
  );
}
