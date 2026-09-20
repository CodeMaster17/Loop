import React, { useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { Btn, Chip, SectionLabel, VegMark } from '../components/ui';
import { SEED_RECS } from '../data';
import { useStore } from '../store';
import { useColors } from '../theme';
import type { Recipe } from '../types';

export function DiscoverScreen() {
  const c = useColors();
  const { addRecipeToToday } = useStore();
  const [recs, setRecs] = useState<Recipe[]>(SEED_RECS.slice(0, 4));

  const shuffle = () => setRecs([...SEED_RECS].sort(() => Math.random() - 0.5).slice(0, 4));

  return (
    <View>
      <SectionLabel title="New ideas" note="high-protein Indian" />
      {recs.map((r) => {
        const yt = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${r.name} recipe indian`)}`;
        return (
          <View key={r.name} style={{ backgroundColor: c.surface, borderColor: c.line, borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{ marginTop: 4 }}><VegMark veg={r.veg} /></View>
              <Text style={{ flex: 1, marginLeft: 8, color: c.ink, fontSize: 16, fontWeight: '700' }}>{r.name}</Text>
              <Chip>{`🔥 ${Math.round(r.protein)}g`}</Chip>
            </View>
            <Text style={{ color: c.inkSoft, fontSize: 13, marginTop: 8, lineHeight: 19 }}>{r.why}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 11 }}>
              <Pressable onPress={() => addRecipeToToday(r)} style={{ borderWidth: 1, borderColor: c.line, backgroundColor: c.surface2, borderRadius: 9, paddingHorizontal: 10, paddingVertical: 5 }}>
                <Text style={{ color: c.greenDeep, fontWeight: '600', fontSize: 12 }}>+ Add to today</Text>
              </Pressable>
              <Pressable onPress={() => Linking.openURL(yt)} style={{ marginLeft: 'auto', backgroundColor: c.chiliTint, borderRadius: 9, paddingHorizontal: 10, paddingVertical: 5 }}>
                <Text style={{ color: c.chili, fontWeight: '600', fontSize: 12.5 }}>▶ YouTube</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
      <Btn label="🎲 More ideas" kind="primary" onPress={shuffle} style={{ marginTop: 4 }} />
    </View>
  );
}
