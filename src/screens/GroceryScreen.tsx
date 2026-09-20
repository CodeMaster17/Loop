import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Btn, SectionLabel } from '../components/ui';
import { shelf } from '../data';
import { weekIngredients } from '../lib/plan';
import { useStore } from '../store';
import { useColors } from '../theme';

function GroceryGroup({ tone, title, sub, items }: {
  tone: string;
  title: string;
  sub: string;
  items: string[];
}) {
  const c = useColors();
  const { store, toggleGroceryDone } = useStore();
  return (
    <View style={{ backgroundColor: c.surface, borderColor: c.line, borderWidth: 1, borderRadius: 16, marginBottom: 14, overflow: 'hidden' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 13, borderBottomWidth: 1, borderBottomColor: c.line }}>
        <View style={{ width: 10, height: 10, borderRadius: 99, backgroundColor: tone, marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: c.ink, fontWeight: '700', fontSize: 14.5 }}>{title}</Text>
          <Text style={{ color: c.inkFaint, fontSize: 11, marginTop: 1 }}>{sub}</Text>
        </View>
        <View style={{ backgroundColor: c.surface2, borderRadius: 99, paddingHorizontal: 9, paddingVertical: 2 }}>
          <Text style={{ color: c.inkSoft, fontSize: 12, fontWeight: '600' }}>{items.length}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: 8 }}>
        {items.length === 0 ? (
          <Text style={{ color: c.inkFaint, fontSize: 13, padding: 6 }}>nothing yet</Text>
        ) : items.map((it) => {
          const isDone = !!store.done[it];
          return (
            <Pressable key={it} onPress={() => toggleGroceryDone(it)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 10, backgroundColor: c.surface2, borderWidth: 1, borderColor: c.line, opacity: isDone ? 0.45 : 1 }}>
              <View style={{ width: 15, height: 15, borderRadius: 5, borderWidth: 1.5, borderColor: isDone ? c.green : c.inkFaint, backgroundColor: isDone ? c.green : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                {isDone ? <Text style={{ color: '#fff', fontSize: 10 }}>✓</Text> : null}
              </View>
              <Text style={{ color: c.ink, fontSize: 13, textTransform: 'capitalize', textDecorationLine: isDone ? 'line-through' : 'none' }}>{it}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function GroceryScreen({ onSendGrocery }: { onSendGrocery: () => void }) {
  const c = useColors();
  const { store } = useStore();
  const map = weekIngredients(store.plan);
  const fresh: string[] = [];
  const week: string[] = [];
  Object.keys(map).sort((a, b) => (map[b] ?? 0) - (map[a] ?? 0)).forEach((it) => {
    (shelf(it) === 'fresh' ? fresh : week).push(it);
  });

  return (
    <View>
      <SectionLabel title="Weekend shopping" note="from this week" />
      <GroceryGroup tone={c.chili} title="Buy fresh this weekend" sub="Finishes in a day or two" items={fresh} />
      <GroceryGroup tone={c.green} title="Staples — check & top up" sub="These last the week" items={week} />
      <Btn label="📲 Send list on WhatsApp" kind="wa" onPress={onSendGrocery} style={{ marginTop: 4 }} />
      <Text style={{ color: c.inkFaint, fontSize: 12, textAlign: 'center', marginTop: 14, lineHeight: 18 }}>🔴 fresh finishes fast · 🟢 staples last the week</Text>
    </View>
  );
}
