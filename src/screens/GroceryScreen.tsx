// Groceries: everything the next 7 days' meals need, as an icon grid in two groups —
// weekly items to buy, and bulk staples to check at home. Tap an item to tick it off.
// Icons are from thiings.co (free personal licence; the credit below is required).
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Linking, Pressable, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Text } from '../components/Text';
import { Btn } from '../components/ui';
import { GROCERY_ICON_IMAGES } from '../design/groceryIconImages';
import { palette as p } from '../design/palette';
import { groceryIconFor } from '../domain/groceryIcons';
import { defaultBuyMode, titleCase } from '../domain/ingredients';
import { weekIngredients } from '../lib/plan';
import { useStore } from '../store';

const GUTTER = 18;
const GAP = 10;

export function GroceryScreen({ onSendGrocery }: { onSendGrocery: () => void }) {
  const { store } = useStore();
  const { width } = useWindowDimensions();
  const tileW = Math.floor((width - GUTTER * 2 - GAP * 2) / 3);

  const uses = weekIngredients(store.plan);
  const byUse = Object.keys(uses).sort((a, b) => (uses[b] ?? 0) - (uses[a] ?? 0) || a.localeCompare(b));
  const weekly = byUse.filter((it) => defaultBuyMode(it) === 'weekly');
  const bulk = byUse.filter((it) => defaultBuyMode(it) === 'bulk');
  const left = byUse.filter((it) => !store.done[it]).length;

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Text style={{ color: p.ink, fontSize: 22, fontWeight: '700' }}>Groceries</Text>
        <Text style={{ color: p.inkSoft, fontSize: 13 }}>{`${left} of ${byUse.length} left`}</Text>
      </View>
      <Text style={{ color: p.inkFaint, fontSize: 12.5, marginTop: 2 }}>For the next 7 days of meals</Text>

      <Group title="Buy for the week" sub="Vegetables, dairy, fresh items" items={weekly} uses={uses} tileW={tileW} />
      <Group title="Bulk staples" sub="Dals, flours, spices — check what's at home" items={bulk} uses={uses} tileW={tileW} />

      <Btn label="Send list on WhatsApp" kind="wa" icon="logo-whatsapp" onPress={onSendGrocery} style={{ marginTop: 20 }} />

      <Pressable onPress={() => { void Linking.openURL('https://www.thiings.co/things'); }} style={{ alignSelf: 'center', marginTop: 24 }}>
        <Text style={{ color: p.inkWhisper, fontSize: 10.5 }}>
          {'Icons by '}
          <Text style={{ color: p.inkWhisper, fontSize: 10.5, textDecorationLine: 'underline' }}>thiings.co</Text>
        </Text>
      </Pressable>
    </View>
  );
}

function Group({ title, sub, items, uses, tileW }: {
  title: string;
  sub: string;
  items: string[];
  uses: Record<string, number>;
  tileW: number;
}) {
  if (items.length === 0) return null;
  return (
    <View style={{ marginTop: 22 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: p.ink, fontSize: 17, fontWeight: '700' }}>{`${title} (${items.length})`}</Text>
          <Text style={{ color: p.inkFaint, fontSize: 12 }}>{sub}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GAP }}>
        {items.map((it) => <GroceryTile key={it} item={it} uses={uses[it] ?? 0} width={tileW} />)}
      </View>
    </View>
  );
}

function GroceryTile({ item, uses, width }: { item: string; uses: number; width: number }) {
  const { store, toggleGroceryDone } = useStore();
  const done = !!store.done[item];
  const icon = groceryIconFor(item);
  const iconSize = Math.round(width * 0.58);

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={`${titleCase(item)}, used in ${uses} meals`}
      onPress={() => { void Haptics.selectionAsync(); toggleGroceryDone(item); }}
      style={({ pressed }) => ({
        width, borderRadius: 16, backgroundColor: p.surface, paddingTop: 10, paddingBottom: 9, paddingHorizontal: 6,
        alignItems: 'center', borderWidth: 1, borderColor: done ? p.veg : p.surface,
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}
    >
      <View style={{ opacity: done ? 0.35 : 1, alignItems: 'center' }}>
        {icon ? (
          <Image source={GROCERY_ICON_IMAGES[icon]} style={{ width: iconSize, height: iconSize }} accessibilityIgnoresInvertColors />
        ) : (
          <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: iconSize * 0.55 }}>🛒</Text>
          </View>
        )}
        <Text style={{ color: p.ink, fontSize: 12.5, fontWeight: '600', marginTop: 6, textAlign: 'center', textDecorationLine: done ? 'line-through' : 'none' }} numberOfLines={2}>
          {titleCase(item)}
        </Text>
        <Text style={{ color: p.inkFaint, fontSize: 11, marginTop: 1 }}>{uses === 1 ? '1 meal' : `${uses} meals`}</Text>
      </View>
      {done ? (
        <Animated.View entering={FadeIn.duration(150)} style={{ position: 'absolute', top: 6, right: 6, width: 20, height: 20, borderRadius: 10, backgroundColor: p.veg, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="checkmark" size={14} color={p.white} />
        </Animated.View>
      ) : null}
    </Pressable>
  );
}
