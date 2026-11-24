// Plan tab: the whole week, today first. Each day is a row of three photo cards
// (breakfast, lunch, dinner) with the day's protein against your target and a
// button to send that day's menu to the cook.
import React from 'react';
import { useWindowDimensions, View } from 'react-native';
import { MealPhotoCard } from '../components/MealPhotoCard';
import { Text } from '../components/Text';
import { Btn } from '../components/ui';
import { palette as p } from '../design/palette';
import { averageProtein, planDays } from '../domain/planDays';
import { useDishPhotos } from '../hooks/useDishPhotos';
import { dayProtein } from '../lib/plan';
import { useStore } from '../store';
import type { DayPlan, Slot } from '../types';

const GUTTER = 18;
const GAP = 10;
const SLOTS: { slot: Slot; label: 'BREAKFAST' | 'LUNCH' | 'DINNER' }[] = [
  { slot: 'breakfast', label: 'BREAKFAST' },
  { slot: 'lunch', label: 'LUNCH' },
  { slot: 'dinner', label: 'DINNER' },
];

export function PlanScreen({ onSend }: { onSend: (key: string) => void }) {
  const { store, swapAt, planWeek } = useStore();
  const photos = useDishPhotos();
  const { width } = useWindowDimensions();
  const cardW = Math.floor((width - GUTTER * 2 - GAP * 2) / 3);
  const target = store.settings.protein;

  const days = planDays(new Date(), 7).filter((d) => store.plan[d.key]);
  const avg = averageProtein(days.map((d) => dayProtein(store.plan[d.key])));

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: GUTTER }}>
        <Text style={{ color: p.ink, fontSize: 22, fontWeight: '700' }}>This week</Text>
        <Text style={{ color: p.inkSoft, fontSize: 13 }}>{`~${avg} g protein / day`}</Text>
      </View>

      {days.map((d) => {
        const plan = store.plan[d.key] as DayPlan;
        const total = dayProtein(plan);
        const met = total >= target;
        return (
          <View key={d.key} style={{ marginTop: 22 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: GUTTER, marginBottom: 10, gap: 8 }}>
              <Text style={{ color: d.isToday ? p.brand : p.ink, fontSize: 18, fontWeight: '700' }}>{d.label}</Text>
              <Text style={{ color: p.inkFaint, fontSize: 13, flex: 1 }}>{d.sub}</Text>
              <View style={{ backgroundColor: met ? p.vegSoft : p.brandSoft, borderRadius: 99, paddingHorizontal: 9, paddingVertical: 3 }}>
                <Text style={{ color: met ? p.vegDeep : p.brandInk, fontSize: 12, fontWeight: '700' }}>{`${total}/${target} g`}</Text>
              </View>
              <Btn kind="wa" size="sm" icon="logo-whatsapp" label="Send" onPress={() => onSend(d.key)} />
            </View>

            <View style={{ flexDirection: 'row', gap: GAP, paddingHorizontal: GUTTER }}>
              {SLOTS.map((s) => (
                <MealPhotoCard
                  key={s.slot}
                  slotLabel={s.label}
                  meal={plan[s.slot]}
                  photo={photos[plan[s.slot].name.toLowerCase()]}
                  width={cardW}
                  onSwap={() => swapAt(d.key, s.slot)}
                />
              ))}
            </View>

          </View>
        );
      })}

      <View style={{ paddingHorizontal: GUTTER, marginTop: 26 }}>
        <Btn label="Re-plan the whole week" kind="primary" icon="shuffle" onPress={planWeek} />
      </View>

      <Text style={{ color: p.inkWhisper, fontSize: 10.5, textAlign: 'center', marginTop: 28 }}>
        Food photos from Unsplash and Wikimedia Commons · credited on the Menu card
      </Text>
    </View>
  );
}
