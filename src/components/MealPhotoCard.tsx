// A meal in the Plan grid (three per day): tall photo with the meal name of the slot
// overlaid at the bottom, a swap button on the photo, then dish name and protein.
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Image, Pressable, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import type { DishPhoto } from '../db/repo';
import { dishImage } from '../lib/dishImage';
import { palette as p } from '../design/palette';
import type { Meal } from '../types';
import { Text } from './Text';
import { VegMark } from './ui';

const PLACEHOLDER: Record<string, string> = { BREAKFAST: '🍳', LUNCH: '🍛', DINNER: '🍲' };

export function MealPhotoCard({ slotLabel, meal, photo, width, onSwap }: {
  slotLabel: 'BREAKFAST' | 'LUNCH' | 'DINNER';
  meal: Meal;
  photo?: DishPhoto;
  width: number;
  onSwap: () => void;
}) {
  const height = Math.round(width * 1.15);
  const img = dishImage(meal.name, photo);
  return (
    // Keyed by dish so a swap fades the new dish in.
    <Animated.View key={meal.name} entering={FadeIn.duration(220)} style={{ width }}>
      <View style={{ width, height, borderRadius: 16, overflow: 'hidden', backgroundColor: p.surface2 }}>
        {img ? (
          <Image source={img.source} style={{ width, height }} accessibilityIgnoresInvertColors />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: width * 0.34, opacity: 0.5 }}>{PLACEHOLDER[slotLabel]}</Text>
          </View>
        )}

        {/* Soft dark fade behind the label (stacked bands, no gradient library needed). */}
        <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 52 }}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.08)' }} />
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.22)' }} />
          <View style={{ flex: 1.4, backgroundColor: 'rgba(0,0,0,0.42)' }} />
        </View>
        <Text style={{ position: 'absolute', left: 9, bottom: 7, color: p.white, fontSize: 12, fontWeight: '800', letterSpacing: 0.6 }}>
          {slotLabel}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Swap ${slotLabel.toLowerCase()}`}
          hitSlop={6}
          onPress={() => { void Haptics.selectionAsync(); onSwap(); }}
          style={({ pressed }) => ({
            position: 'absolute', top: 7, right: 7, width: 28, height: 28, borderRadius: 14,
            backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center',
            transform: [{ scale: pressed ? 0.9 : 1 }],
          })}
        >
          <Ionicons name="shuffle" size={15} color={p.ink} />
        </Pressable>
      </View>

      <Text style={{ color: p.ink, fontSize: 13.5, fontWeight: '700', marginTop: 7, lineHeight: 17 }} numberOfLines={2}>{meal.name}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
        <VegMark veg={meal.v} size={11} />
        <Ionicons name="flame" size={11} color={p.brand} />
        <Text style={{ color: p.ink, fontSize: 12, fontWeight: '600' }}>{`${meal.p}g`}</Text>
      </View>
    </Animated.View>
  );
}
