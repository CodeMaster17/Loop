// Shared onboarding UI: progress header, selectable cards/pills, and the footer nav.
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useColors } from '../theme';

export function StepHeader({ step, total, title, subtitle }: { step: number; total: number; title: string; subtitle?: string }) {
  const c = useColors();
  return (
    <View style={{ marginBottom: 18 }}>
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 18 }}>
        {Array.from({ length: total }, (_, i) => (
          <View key={i} style={{ flex: 1, height: 4, borderRadius: 99, backgroundColor: i < step ? c.green : c.line }} />
        ))}
      </View>
      <Text style={{ color: c.ink, fontSize: 24, fontWeight: '800', letterSpacing: -0.5 }}>{title}</Text>
      {subtitle ? <Text style={{ color: c.inkSoft, fontSize: 14, marginTop: 6, lineHeight: 20 }}>{subtitle}</Text> : null}
    </View>
  );
}

export function OptionCard({ label, emoji, sub, selected, onPress }: {
  label: string;
  emoji?: string;
  sub?: string;
  selected: boolean;
  onPress: () => void;
}) {
  const c = useColors();
  return (
    <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1.5, borderColor: selected ? c.green : c.line, backgroundColor: selected ? c.leaf : c.surface }}>
      {emoji ? <Text style={{ fontSize: 22 }}>{emoji}</Text> : null}
      <View style={{ flex: 1 }}>
        <Text style={{ color: c.ink, fontSize: 15.5, fontWeight: '600' }}>{label}</Text>
        {sub ? <Text style={{ color: c.inkFaint, fontSize: 12.5, marginTop: 2 }}>{sub}</Text> : null}
      </View>
      <View style={{ width: 22, height: 22, borderRadius: 99, borderWidth: 2, borderColor: selected ? c.green : c.line, backgroundColor: selected ? c.green : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
        {selected ? <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>✓</Text> : null}
      </View>
    </Pressable>
  );
}

export function SelectPill({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const c = useColors();
  return (
    <Pressable onPress={onPress} style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 99, borderWidth: 1.5, borderColor: selected ? c.green : c.line, backgroundColor: selected ? c.green : c.surface }}>
      <Text style={{ color: selected ? c.onDark : c.ink, fontSize: 13.5, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

export function Footer({ onBack, onSkip, onNext, nextLabel = 'Continue', nextDisabled }: {
  onBack?: () => void;
  onSkip?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 12, paddingBottom: 4 }}>
      {onBack ? (
        <Pressable onPress={onBack} style={{ paddingVertical: 14, paddingHorizontal: 18, borderRadius: 13, borderWidth: 1, borderColor: c.line, backgroundColor: c.surface }}>
          <Text style={{ color: c.inkSoft, fontWeight: '600', fontSize: 14 }}>Back</Text>
        </Pressable>
      ) : null}
      {onSkip ? (
        <Pressable onPress={onSkip} style={{ paddingVertical: 14, paddingHorizontal: 12 }}>
          <Text style={{ color: c.inkFaint, fontWeight: '600', fontSize: 14 }}>Skip</Text>
        </Pressable>
      ) : null}
      <Pressable onPress={onNext} disabled={nextDisabled} style={{ flex: 1, paddingVertical: 14, borderRadius: 13, alignItems: 'center', backgroundColor: nextDisabled ? c.line : c.green }}>
        <Text style={{ color: nextDisabled ? c.inkFaint : c.onDark, fontWeight: '700', fontSize: 15 }}>{nextLabel}</Text>
      </Pressable>
    </View>
  );
}
