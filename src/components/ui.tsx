// Shared UI primitives, built on Tamagui and the Swiggy-style theme.
import * as Haptics from 'expo-haptics';
import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Sheet as TSheet, Text, View, XStack, YStack } from 'tamagui';
import { palette as p } from '../design/palette';

/** The Indian veg / non-veg mark: green dot in a square, or a red triangle. */
export function VegMark({ veg, size = 15 }: { veg: boolean; size?: number }) {
  const tone = veg ? p.veg : p.nonVeg;
  return (
    <View width={size} height={size} borderRadius={3} borderWidth={1.6} borderColor={tone} alignItems="center" justifyContent="center">
      {veg ? (
        <View width={size * 0.42} height={size * 0.42} borderRadius={99} backgroundColor={tone} />
      ) : (
        <View
          width={0}
          height={0}
          borderLeftWidth={size * 0.26}
          borderRightWidth={size * 0.26}
          borderBottomWidth={size * 0.44}
          borderLeftColor="transparent"
          borderRightColor="transparent"
          borderBottomColor={tone}
        />
      )}
    </View>
  );
}

export function Chip({ children, tone = 'brand' }: { children: React.ReactNode; tone?: 'brand' | 'green' | 'saffron' }) {
  const green = tone === 'green';
  return (
    <View backgroundColor={green ? p.vegSoft : p.brandSoft} borderRadius={99} paddingHorizontal={10} paddingVertical={4}>
      <Text color={green ? p.vegDeep : p.brandInk} fontSize={12} fontWeight="600">{children}</Text>
    </View>
  );
}

/**
 * Button. kind: plain (white, outlined), primary (brand orange) or wa (WhatsApp green).
 * 12px corners, optional leading icon, a soft spring on press and a light haptic.
 */
export function Btn({ label, onPress, kind = 'plain', icon, size = 'md', style }: {
  label: string;
  onPress: () => void;
  kind?: 'plain' | 'primary' | 'wa';
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  const filled = kind !== 'plain';
  const bg = kind === 'primary' ? p.brand : kind === 'wa' ? p.waButton : p.surface;
  const fg = filled ? p.white : p.ink;
  const small = size === 'sm';
  return (
    <Animated.View style={[anim, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPressIn={() => { scale.set(withSpring(0.97, { damping: 18, stiffness: 300 })); }}
        onPressOut={() => { scale.set(withSpring(1, { damping: 18, stiffness: 300 })); }}
        onPress={() => {
          void Haptics.impactAsync(filled ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Soft);
          onPress();
        }}
        style={{
          height: small ? 34 : 50, borderRadius: small ? 8 : 12, paddingHorizontal: small ? 12 : 18,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: small ? 5 : 8,
          backgroundColor: bg, borderWidth: filled ? 0 : 1, borderColor: p.line,
          shadowColor: filled ? bg : '#000', shadowOpacity: filled ? 0.28 : 0.04,
          shadowRadius: filled ? 10 : 4, shadowOffset: { width: 0, height: filled ? 4 : 1 }, elevation: filled ? 3 : 1,
        }}
      >
        {icon ? <Ionicons name={icon} size={small ? 15 : 19} color={fg} /> : null}
        <Text color={fg} fontSize={small ? 13 : 15} fontWeight="700">{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function ProteinMeter({ total, target }: { total: number; target: number }) {
  const pct = Math.min(100, Math.round((total / Math.max(1, target)) * 100));
  return (
    <YStack marginTop={14}>
      <XStack alignItems="center" justifyContent="space-between" marginBottom={6}>
        <Text color={p.inkSoft} fontSize={11} letterSpacing={1} fontWeight="700">PROTEIN TODAY</Text>
        <Text color={p.ink} fontSize={13} fontWeight="600">
          <Text color={p.brandInk} fontWeight="800" fontSize={16}>{total}</Text> / {target} g
        </Text>
      </XStack>
      <View height={8} borderRadius={99} backgroundColor={p.surface2} overflow="hidden">
        <View height="100%" width={`${pct}%`} backgroundColor={p.brand} borderRadius={99} transition="quick" />
      </View>
    </YStack>
  );
}

export function SectionLabel({ title, note }: { title: string; note?: string }) {
  return (
    <XStack alignItems="center" justifyContent="space-between" marginBottom={10} marginHorizontal={2}>
      <Text color={p.inkSoft} fontSize={11} letterSpacing={1} fontWeight="700">{title.toUpperCase()}</Text>
      {note ? <Text color={p.inkFaint} fontSize={11.5} fontWeight="600">{note}</Text> : null}
    </XStack>
  );
}

/** Modal bottom sheet that sizes to its content; swipe down or tap outside to close. */
export function Sheet({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <TSheet
      modal
      open={visible}
      onOpenChange={(open: boolean) => { if (!open) onClose(); }}
      snapPointsMode="fit"
      dismissOnSnapToBottom
      moveOnKeyboardChange
    >
      <TSheet.Overlay backgroundColor="#14141E" opacity="0.45 enter:0 exit:0" transition="quick" />
      <TSheet.Handle backgroundColor={p.line} />
      <TSheet.Container>
        <TSheet.Background backgroundColor={p.surface} borderTopLeftRadius={24} borderTopRightRadius={24} />
        <YStack padding={20} paddingBottom={34}>{children}</YStack>
      </TSheet.Container>
    </TSheet>
  );
}
