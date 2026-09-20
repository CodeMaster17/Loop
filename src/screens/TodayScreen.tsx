import React from 'react';
import { Text, View } from 'react-native';
import { MealCard } from '../components/MealCard';
import { Btn } from '../components/ui';
import { useStore } from '../store';
import { useColors } from '../theme';

export function TodayScreen({ onSend }: { onSend: (key: string) => void }) {
  const c = useColors();
  const { store, newPlan, swap } = useStore();
  const day = store.plan[store.cur];
  if (!day) return null;

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, marginHorizontal: 2 }}>
        <Text style={{ color: c.inkSoft, fontSize: 11, letterSpacing: 1, fontWeight: '700' }}>THE PLAN</Text>
        {store.seeded ? (
          <View style={{ backgroundColor: c.saffronTint, borderRadius: 99, paddingHorizontal: 9, paddingVertical: 3 }}>
            <Text style={{ color: c.saffronInk, fontSize: 11, fontWeight: '600' }}>✨ example</Text>
          </View>
        ) : null}
      </View>

      <View style={{ gap: 12 }}>
        <MealCard emo="🌅" label="Break" meal={day.breakfast} onSwap={() => swap('breakfast')} />
        <MealCard emo="🍛" label="Lunch" meal={day.lunch} onSwap={() => swap('lunch')} />
        <MealCard emo="🌙" label="Dinner" meal={day.dinner} onSwap={() => swap('dinner')} />
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
        <Btn label="🎲 New plan" onPress={newPlan} style={{ flex: 1 }} />
        <Btn label="📲 Send to cook" kind="wa" onPress={() => onSend(store.cur)} style={{ flex: 1 }} />
      </View>

      <Text style={{ color: c.inkFaint, fontSize: 12, textAlign: 'center', marginTop: 14, lineHeight: 18 }}>
        Tap the 🎤 to change a meal — “make lunch high protein”, “swap dinner to rajma”.
      </Text>
    </View>
  );
}
