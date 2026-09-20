// Small, theme-aware UI primitives shared across screens.
import React from 'react';
import { Modal, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useColors } from '../theme';

/** The Indian veg / non-veg mark: green dot in a square, or a chili triangle. */
export function VegMark({ veg, size = 15 }: { veg: boolean; size?: number }) {
  const c = useColors();
  return (
    <View style={{ width: size, height: size, borderRadius: 3, borderWidth: 1.6, borderColor: veg ? c.green : c.chili, alignItems: 'center', justifyContent: 'center' }}>
      {veg ? (
        <View style={{ width: size * 0.42, height: size * 0.42, borderRadius: 99, backgroundColor: c.green }} />
      ) : (
        <View style={{ width: 0, height: 0, borderLeftWidth: size * 0.26, borderRightWidth: size * 0.26, borderBottomWidth: size * 0.44, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: c.chili }} />
      )}
    </View>
  );
}

export function Chip({ children, tone = 'saffron' }: { children: React.ReactNode; tone?: 'saffron' | 'green' }) {
  const c = useColors();
  const bg = tone === 'green' ? c.leaf : c.saffronTint;
  const fg = tone === 'green' ? c.greenDeep : c.saffronInk;
  return (
    <View style={{ backgroundColor: bg, borderRadius: 99, paddingHorizontal: 9, paddingVertical: 4 }}>
      <Text style={{ color: fg, fontSize: 12, fontWeight: '600' }}>{children}</Text>
    </View>
  );
}

export function Btn({ label, onPress, kind = 'plain', style }: {
  label: string;
  onPress: () => void;
  kind?: 'plain' | 'primary' | 'wa';
  style?: StyleProp<ViewStyle>;
}) {
  const c = useColors();
  const bg = kind === 'primary' ? c.green : kind === 'wa' ? c.wa : c.surface;
  const fg = kind === 'primary' ? c.onDark : kind === 'wa' ? c.onWa : c.ink;
  const border = kind === 'plain' ? c.line : 'transparent';
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.btn, { backgroundColor: bg, borderColor: border, opacity: pressed ? 0.85 : 1 }, style]}>
      <Text style={{ color: fg, fontWeight: '600', fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}

export function ProteinMeter({ total, target }: { total: number; target: number }) {
  const c = useColors();
  const pct = Math.min(100, Math.round((total / target) * 100));
  return (
    <View style={{ marginTop: 13 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ color: c.inkSoft, fontSize: 11, letterSpacing: 1, fontWeight: '700' }}>PROTEIN TODAY</Text>
        <Text style={{ color: c.ink, fontSize: 13, fontWeight: '600' }}>
          <Text style={{ color: c.saffronInk, fontWeight: '800', fontSize: 16 }}>{total}</Text> / {target} g
        </Text>
      </View>
      <View style={{ height: 9, borderRadius: 99, backgroundColor: c.surface2, borderWidth: 1, borderColor: c.line, overflow: 'hidden' }}>
        <View style={{ height: '100%', width: `${pct}%`, backgroundColor: c.saffron, borderRadius: 99 }} />
      </View>
    </View>
  );
}

export function SectionLabel({ title, note }: { title: string; note?: string }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, marginHorizontal: 2 }}>
      <Text style={{ color: c.inkSoft, fontSize: 11, letterSpacing: 1, fontWeight: '700' }}>{title.toUpperCase()}</Text>
      {note ? <Text style={{ color: c.inkFaint, fontSize: 11.5, fontWeight: '600' }}>{note}</Text> : null}
    </View>
  );
}

/** Bottom-sheet modal with a scrim and grab handle. */
export function Sheet({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: React.ReactNode }) {
  const c = useColors();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(20,16,10,0.5)' }} onPress={onClose} />
      <View style={{ backgroundColor: c.surface, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingBottom: 34 }}>
        <View style={{ width: 38, height: 4, borderRadius: 99, backgroundColor: c.line, alignSelf: 'center', marginBottom: 14 }} />
        {children}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  btn: { borderWidth: 1, borderRadius: 13, paddingVertical: 13, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
});
