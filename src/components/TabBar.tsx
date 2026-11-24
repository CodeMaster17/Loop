// Floating black pill tab bar with a sliding highlight and a haptic tick.
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette as p } from '../design/palette';
import { Text } from './Text';

export interface TabDef<K extends string> {
  key: K;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
}

const PAD = 6;
const SPRING = { damping: 18, stiffness: 220, mass: 0.7 };

export function TabBar<K extends string>({ tabs, active, onChange }: {
  tabs: TabDef<K>[];
  active: K;
  onChange: (k: K) => void;
}) {
  const insets = useSafeAreaInsets();
  const [width, setWidth] = useState(0);
  const index = Math.max(0, tabs.findIndex((t) => t.key === active));
  const slot = width > 0 ? (width - PAD * 2) / tabs.length : 0;
  const x = useSharedValue(0);

  useEffect(() => {
    x.value = withSpring(index * slot, SPRING);
  }, [index, slot, x]);

  const pill = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) + 4 }]}>
      <View style={styles.bar} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {slot > 0 ? <Animated.View style={[styles.highlight, { width: slot }, pill]} /> : null}
        {tabs.map((t) => {
          const on = t.key === active;
          return (
            <Pressable
              key={t.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              accessibilityLabel={t.label}
              onPress={() => {
                if (on) return;
                void Haptics.selectionAsync();
                onChange(t.key);
              }}
              style={styles.item}
            >
              <Ionicons name={on ? t.iconActive : t.icon} size={20} color={on ? p.brand : p.barIdle} />
              <Text style={[styles.label, { color: on ? p.ink : p.barIdle }]} numberOfLines={1}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
  bar: {
    flexDirection: 'row', width: '100%', maxWidth: 420, backgroundColor: p.bar, borderRadius: 999, padding: PAD,
    shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 12,
  },
  highlight: { position: 'absolute', top: PAD, bottom: PAD, left: PAD, borderRadius: 999, backgroundColor: p.white },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 7, gap: 1 },
  label: { fontSize: 10.5, fontWeight: '600' },
});
