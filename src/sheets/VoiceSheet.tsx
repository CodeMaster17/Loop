import React, { useEffect } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Btn, Sheet } from '../components/ui';
import { useVoice } from '../hooks/useVoice';
import { useStore } from '../store';
import { useColors } from '../theme';

const VOICE_EGS = ['make lunch high protein', 'swap dinner to rajma', 'give me a veg day', 'change breakfast'];

export function VoiceSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const c = useColors();
  const { applyVoiceCommand } = useStore();
  const v = useVoice();

  const apply = (cmd?: string) => {
    const text = (cmd ?? v.transcript).trim();
    if (!text) { v.setError('Say or type what to change first.'); return; }
    if (applyVoiceCommand(text)) { v.abort(); onClose(); }
    else v.setError("Couldn't match that — try 'swap dinner to <dish>'.");
  };

  // Auto-start listening when opened; stop when closed.
  useEffect(() => {
    if (open) v.start();
    else v.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Auto-apply once a final result lands.
  useEffect(() => {
    if (v.finalTranscript) { apply(v.finalTranscript); v.clearFinal(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v.finalTranscript]);

  return (
    <Sheet visible={open} onClose={onClose}>
      <Pressable
        onPress={() => (v.listening ? v.stop() : v.start())}
        style={{ width: 90, height: 90, borderRadius: 99, backgroundColor: v.listening ? c.saffronTint : c.leaf, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginBottom: 10, borderWidth: v.listening ? 2 : 0, borderColor: c.saffron }}
      >
        <Text style={{ fontSize: 38 }}>🎤</Text>
      </Pressable>
      <Text style={{ color: c.ink, fontWeight: '700', fontSize: 18, textAlign: 'center' }}>
        {v.listening ? 'Listening…' : 'Tell Rasoi what to change'}
      </Text>
      <Text style={{ color: c.inkFaint, fontSize: 12.5, textAlign: 'center', marginTop: 4, marginBottom: 14 }}>
        {v.listening ? "Speak now — I'll update the plan when you pause." : 'Tap the mic to speak, or type below.'}
      </Text>
      {v.transcript ? (
        <Text style={{ color: c.ink, fontSize: 16, textAlign: 'center', marginBottom: 12 }}>“{v.transcript}”</Text>
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, justifyContent: 'center', marginBottom: 14 }}>
        {VOICE_EGS.map((e) => (
          <Pressable key={e} onPress={() => v.setTranscript(e)} style={{ backgroundColor: c.surface2, borderWidth: 1, borderColor: c.line, borderRadius: 99, paddingHorizontal: 11, paddingVertical: 6 }}>
            <Text style={{ color: c.inkSoft, fontSize: 12 }}>{e}</Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        value={v.transcript}
        onChangeText={(t) => { v.setTranscript(t); v.setError(null); }}
        placeholder="e.g. change dinner to paneer bhurji"
        placeholderTextColor={c.inkFaint}
        onSubmitEditing={() => apply()}
        returnKeyType="done"
        style={{ borderWidth: 1, borderColor: c.line, backgroundColor: c.surface2, color: c.ink, borderRadius: 11, paddingHorizontal: 13, paddingVertical: 12, fontSize: 15 }}
      />
      {v.error ? <Text style={{ color: c.chili, fontSize: 12.5, textAlign: 'center', marginTop: 8 }}>{v.error}</Text> : null}
      <Btn label="Apply change" kind="primary" onPress={() => apply()} style={{ marginTop: 14 }} />
    </Sheet>
  );
}
