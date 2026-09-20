import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useColors } from '../theme';
import type { Meal } from '../types';
import { Chip, VegMark } from './ui';

export function MealCard({ emo, label, meal, onSwap }: {
  emo: string;
  label: string;
  meal: Meal;
  onSwap: () => void;
}) {
  const c = useColors();
  return (
    <View style={{ backgroundColor: c.surface, borderColor: c.line, borderWidth: 1, borderRadius: 16, overflow: 'hidden' }}>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ width: 60, backgroundColor: c.surface2, borderRightWidth: 1, borderRightColor: c.line, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 }}>
          <Text style={{ fontSize: 20 }}>{emo}</Text>
          <Text style={{ fontSize: 9.5, letterSpacing: 0.5, color: c.inkSoft, fontWeight: '700', marginTop: 3 }}>{label.toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1, padding: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{ marginTop: 3 }}><VegMark veg={meal.v} /></View>
            <Text style={{ flex: 1, marginLeft: 8, color: c.ink, fontSize: 16.5, fontWeight: '700' }}>{meal.name}</Text>
          </View>
          {meal.i.length > 0 ? (
            <Text style={{ color: c.inkSoft, fontSize: 12.5, marginTop: 5 }}>{meal.i.slice(0, 5).join(' · ')}</Text>
          ) : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
            <Chip>{`🔥 ${meal.p}g protein`}</Chip>
            <Pressable onPress={onSwap} style={{ marginLeft: 'auto', paddingHorizontal: 6, paddingVertical: 4 }}>
              <Text style={{ color: c.green, fontWeight: '600', fontSize: 12.5 }}>🎲 swap</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
