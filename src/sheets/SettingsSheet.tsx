import React, { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, TextStyle, View } from 'react-native';
import { Btn, Sheet } from '../components/ui';
import { useStore } from '../store';
import { useColors } from '../theme';
import type { Diet } from '../types';

const PROTEIN_STEPS = [45, 60, 75, 90, 110];

export function SettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const c = useColors();
  const { store, updateSettings, setReminder } = useStore();
  const s = store.settings;

  const [name, setName] = useState(s.cookName);
  const [num, setNum] = useState(s.cookNum);
  const [diet, setDiet] = useState<Diet>(s.diet);
  const [protein, setProtein] = useState<number>(s.protein);
  const [reminder, setReminderState] = useState<boolean>(s.reminder);

  useEffect(() => {
    if (open) {
      setName(s.cookName); setNum(s.cookNum); setDiet(s.diet); setProtein(s.protein); setReminderState(s.reminder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const field: TextStyle = { borderWidth: 1, borderColor: c.line, backgroundColor: c.surface2, color: c.ink, borderRadius: 11, paddingHorizontal: 13, paddingVertical: 12, fontSize: 15 };
  const lbl: TextStyle = { color: c.inkSoft, fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 14 };

  return (
    <Sheet visible={open} onClose={onClose}>
      <Text style={{ color: c.ink, fontWeight: '700', fontSize: 18 }}>Setup</Text>
      <Text style={{ color: c.inkSoft, fontSize: 13, marginTop: 4 }}>Saved on this device only.</Text>

      <Text style={lbl}>Cook's name</Text>
      <TextInput value={name} onChangeText={setName} placeholder="e.g. Sunita didi" placeholderTextColor={c.inkFaint} style={field} />

      <Text style={lbl}>Cook's WhatsApp number (with country code)</Text>
      <TextInput value={num} onChangeText={setNum} keyboardType="phone-pad" placeholder="e.g. 919812345678" placeholderTextColor={c.inkFaint} style={field} />

      <Text style={lbl}>Diet</Text>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {(['veg', 'both', 'nonveg'] as Diet[]).map((d) => (
          <Pressable key={d} onPress={() => setDiet(d)} style={{ flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: diet === d ? 'transparent' : c.line, backgroundColor: diet === d ? c.green : c.surface2, alignItems: 'center' }}>
            <Text style={{ color: diet === d ? c.onDark : c.inkSoft, fontWeight: '600', fontSize: 13, textTransform: 'capitalize' }}>{d}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={lbl}>{`Daily protein target — ${protein} g`}</Text>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {PROTEIN_STEPS.map((p) => (
          <Pressable key={p} onPress={() => setProtein(p)} style={{ flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: protein === p ? 'transparent' : c.line, backgroundColor: protein === p ? c.saffron : c.surface2, alignItems: 'center' }}>
            <Text style={{ color: protein === p ? c.onDark : c.inkSoft, fontWeight: '600', fontSize: 13 }}>{p}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={() => { const val = !reminder; setReminderState(val); void setReminder(val); }} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: c.ink, fontWeight: '600', fontSize: 14 }}>Daily 8am reminder</Text>
          <Text style={{ color: c.inkFaint, fontSize: 12, marginTop: 2 }}>Nudge to send the menu</Text>
        </View>
        <View style={{ width: 46, height: 28, borderRadius: 99, backgroundColor: reminder ? c.green : c.surface2, borderWidth: 1, borderColor: c.line, justifyContent: 'center', paddingHorizontal: 3 }}>
          <View style={{ width: 22, height: 22, borderRadius: 99, backgroundColor: '#fff', alignSelf: reminder ? 'flex-end' : 'flex-start' }} />
        </View>
      </Pressable>

      <Btn label="Save" kind="primary" onPress={() => { updateSettings({ cookName: name.trim(), cookNum: num.trim(), diet, protein }); onClose(); }} style={{ marginTop: 18 }} />
    </Sheet>
  );
}
