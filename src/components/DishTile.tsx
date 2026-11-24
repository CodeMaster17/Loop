// A dish in the Menu card grid: square photo, veg mark + protein, name, and an
// ADD / ADDED toggle that puts the dish in (or out of) the weekly rotation.
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Image, Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import type { Dish } from '../db/repo';
import { palette as p } from '../design/palette';
import { HIGH_PROTEIN_G } from '../domain/menuCard';
import { dishImage } from '../lib/dishImage';
import { PhotoCredit } from './PhotoCredit';
import { Text } from './Text';
import { VegMark } from './ui';

const SPRING = { damping: 16, stiffness: 260 };

export function DishTile({ dish, width, placeholderEmoji, onToggle, onWrongPhoto, onOpen }: {
  dish: Dish;
  width: number;
  placeholderEmoji: string;
  onToggle: (dish: Dish) => void;
  /** Tap: open the dish sheet (add / remove, recipe video). */
  onOpen: (dish: Dish) => void;
  /** Long-press on the photo: "this isn't the dish". */
  onWrongPhoto: (dish: Dish) => void;
}) {
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  const high = dish.proteinG >= HIGH_PROTEIN_G;
  const img = dishImage(dish.name, dish.photo);

  return (
    <View style={{ width }}>
      {img ? (
        <Pressable
          accessibilityHint="Opens the dish. Long-press if this photo shows a different dish."
          onPress={() => onOpen(dish)}
          delayLongPress={450}
          onLongPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onWrongPhoto(dish); }}
        >
          <Image
            source={img.source}
            style={{ width, height: width, borderRadius: 18, backgroundColor: p.surface2 }}
            accessibilityIgnoresInvertColors
          />
        </Pressable>
      ) : (
        <Pressable onPress={() => onOpen(dish)} style={{ width, height: width, borderRadius: 18, backgroundColor: p.surface2, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: width * 0.3, opacity: 0.55 }}>{placeholderEmoji}</Text>
        </Pressable>
      )}
      {dish.youtubeUrl ? (
        <View pointerEvents="none" style={{ position: 'absolute', top: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 }}>
          <Ionicons name="logo-youtube" size={11} color={p.white} />
          <Text style={{ color: p.white, fontSize: 10.5, fontWeight: '700' }}>Recipe</Text>
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 }}>
        <VegMark veg={dish.veg} size={14} />
        {high ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <Ionicons name="flame" size={12} color={p.brand} />
            <Text style={{ color: p.brand, fontSize: 11.5, fontWeight: '600' }}>High protein</Text>
          </View>
        ) : null}
        <View style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', backgroundColor: p.vegSoft, borderRadius: 99, paddingHorizontal: 7, paddingVertical: 2 }}>
          <Text style={{ color: p.vegDeep, fontSize: 11.5, fontWeight: '700' }}>{`${Math.round(dish.proteinG)}g`}</Text>
        </View>
      </View>

      <Text onPress={() => onOpen(dish)} style={{ color: p.ink, fontSize: 14.5, fontWeight: '600', marginTop: 4, lineHeight: 19 }} numberOfLines={2}>{dish.name}</Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
        <Text style={{ color: p.inkFaint, fontSize: 11.5, flex: 1 }} numberOfLines={1}>
          {dish.soak ? '💧 Soak overnight' : 'protein / serving'}
        </Text>
        <Animated.View style={pressStyle}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={dish.active ? `Remove ${dish.name} from rotation` : `Add ${dish.name} to rotation`}
            onPressIn={() => { scale.set(withSpring(0.92, SPRING)); }}
            onPressOut={() => { scale.set(withSpring(1, SPRING)); }}
            onPress={() => {
              void Haptics.impactAsync(dish.active ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium);
              onToggle(dish);
            }}
            style={{
              width: 86, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: dish.active ? p.brand : p.line,
              backgroundColor: dish.active ? p.brandSoft : p.surface,
              shadowColor: '#000', shadowOpacity: dish.active ? 0 : 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
            }}
          >
            <Text style={{ color: p.brand, fontSize: 13, fontWeight: '700', letterSpacing: 0.3 }} numberOfLines={1}>{dish.active ? 'ADDED ✓' : 'ADD'}</Text>
          </Pressable>
        </Animated.View>
      </View>

      {img ? <View style={{ marginTop: 8 }}><PhotoCredit credit={img.credit} /></View> : null}
    </View>
  );
}
