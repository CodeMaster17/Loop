import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Btn, SectionLabel } from '../components/ui';
import { addDays, dkey, prettyDate } from '../lib/date';
import { dayProtein, seedDay } from '../lib/plan';
import { useStore } from '../store';
import { useColors } from '../theme';

function MiniMeal({ k, name }: { k: string; name: string }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', marginBottom: 3 }}>
      <Text style={{ width: 20, color: c.inkFaint, fontSize: 12.5 }}>{k}</Text>
      <Text style={{ flex: 1, color: c.ink, fontSize: 12.5 }}>{name}</Text>
    </View>
  );
}

export function WeekScreen({ onSend }: { onSend: (key: string) => void }) {
  const c = useColors();
  const { store, planWeek } = useStore();
  const today = new Date();

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i);
    const key = dkey(date);
    return { key, d: store.plan[key] ?? seedDay('both', []), pd: prettyDate(date), first: i === 0 };
  });
  const avg = Math.round(days.reduce((a, x) => a + dayProtein(x.d), 0) / 7);

  return (
    <View>
      <SectionLabel title="This week" note={`~${avg}g/day avg`} />
      <View style={{ gap: 10 }}>
        {days.map((x) => (
          <View key={x.key} style={{ backgroundColor: c.surface, borderColor: x.first ? c.green : c.line, borderWidth: x.first ? 1.5 : 1, borderRadius: 16, padding: 13 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: c.ink, fontWeight: '700', fontSize: 14.5 }}>
                {x.pd.rel} <Text style={{ color: c.inkFaint, fontWeight: '500', fontSize: 12 }}>{x.pd.sub}</Text>
              </Text>
              <View style={{ backgroundColor: c.saffronTint, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ color: c.saffronInk, fontSize: 11.5, fontWeight: '600' }}>{dayProtein(x.d)}g</Text>
              </View>
            </View>
            <MiniMeal k="🌅" name={x.d.breakfast.name} />
            <MiniMeal k="🍛" name={x.d.lunch.name} />
            <MiniMeal k="🌙" name={x.d.dinner.name} />
            <Pressable onPress={() => onSend(x.key)} style={{ marginTop: 9, borderWidth: 1, borderStyle: 'dashed', borderColor: c.line, borderRadius: 9, paddingVertical: 7, alignItems: 'center' }}>
              <Text style={{ color: c.green, fontWeight: '600', fontSize: 12.5 }}>📲 Send this day to cook</Text>
            </Pressable>
          </View>
        ))}
      </View>
      <Btn label="🎲 Re-plan the whole week" kind="primary" onPress={planWeek} style={{ marginTop: 16 }} />
    </View>
  );
}
