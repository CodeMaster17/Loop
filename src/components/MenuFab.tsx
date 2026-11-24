// Floating "MENU" button (bottom right). Opens a dark list of meal categories with
// counts; tapping one jumps the Menu card to that section.
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { palette as p } from '../design/palette';
import type { SectionKey } from '../domain/menuCard';
import { Text } from './Text';

export interface FabCategory {
  key: SectionKey;
  title: string;
  emoji: string;
  count: number;
}

export function MenuFab({ categories, bottom, onPick }: {
  categories: FabCategory[];
  bottom: number;
  onPick: (key: SectionKey) => void;
}) {
  const [open, setOpen] = useState(false);
  if (categories.length === 0) return null;

  return (
    <>
      {open ? (
        <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <Pressable accessibilityLabel="Close menu" onPress={() => setOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(20,20,30,0.35)' }} />
        </Animated.View>
      ) : null}

      {open ? (
        <Animated.View
          entering={ZoomIn.springify().damping(18).stiffness(220)}
          exiting={ZoomOut.duration(140)}
          style={{
            position: 'absolute', right: 18, bottom: bottom + 84, width: 250, borderRadius: 20,
            backgroundColor: p.bar, paddingVertical: 10, transformOrigin: 'bottom right',
            shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 14,
          }}
        >
          {categories.map((c) => (
            <Pressable
              key={c.key}
              onPress={() => {
                void Haptics.selectionAsync();
                setOpen(false);
                onPick(c.key);
              }}
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 12, opacity: pressed ? 0.6 : 1 })}
            >
              <Text style={{ fontSize: 16, marginRight: 10 }}>{c.emoji}</Text>
              <Text style={{ flex: 1, color: p.white, fontSize: 15, fontWeight: '600' }}>{c.title}</Text>
              <Text style={{ color: p.barIdle, fontSize: 14, fontWeight: '600' }}>{c.count}</Text>
            </Pressable>
          ))}
        </Animated.View>
      ) : null}

      <View style={{ position: 'absolute', right: 18, bottom: bottom + 8 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={open ? 'Close menu categories' : 'Open menu categories'}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setOpen((o) => !o);
          }}
          style={({ pressed }) => ({
            width: 68, height: 68, borderRadius: 34, backgroundColor: p.bar, alignItems: 'center', justifyContent: 'center',
            transform: [{ scale: pressed ? 0.94 : 1 }],
            shadowColor: '#000', shadowOpacity: 0.28, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 10,
          })}
        >
          <Ionicons name={open ? 'close' : 'restaurant'} size={22} color={p.white} />
          <Text style={{ color: p.white, fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginTop: 1 }}>{open ? 'CLOSE' : 'MENU'}</Text>
        </Pressable>
      </View>
    </>
  );
}
