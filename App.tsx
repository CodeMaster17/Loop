import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProteinMeter } from './src/components/ui';
import { prettyDate } from './src/lib/date';
import { dayProtein } from './src/lib/plan';
import { DiscoverScreen } from './src/screens/DiscoverScreen';
import { GroceryScreen } from './src/screens/GroceryScreen';
import { TodayScreen } from './src/screens/TodayScreen';
import { WeekScreen } from './src/screens/WeekScreen';
import { SendCtx, SendSheet } from './src/sheets/SendSheet';
import { SettingsSheet } from './src/sheets/SettingsSheet';
import { VoiceSheet } from './src/sheets/VoiceSheet';
import { StoreProvider, useStore } from './src/store';
import { getColors } from './src/theme';
import type { Tab } from './src/types';

const TABS: { k: Tab; ic: string; lb: string }[] = [
  { k: 'today', ic: '🍽️', lb: 'Today' },
  { k: 'week', ic: '🗓️', lb: 'Week' },
  { k: 'grocery', ic: '🛒', lb: 'Grocery' },
  { k: 'discover', ic: '💡', lb: 'Discover' },
];

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider fallback={<Loading />}>
        <Root />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

function Loading() {
  const c = getColors(useColorScheme());
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg }}>
      <Text style={{ fontSize: 40 }}>🍛</Text>
      <ActivityIndicator color={c.green} style={{ marginTop: 12 }} />
    </View>
  );
}

function Root() {
  const scheme = useColorScheme();
  const c = getColors(scheme);
  const insets = useSafeAreaInsets();
  const { store, shiftDay } = useStore();

  const [tab, setTab] = useState<Tab>('today');
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sendCtx, setSendCtx] = useState<SendCtx | null>(null);

  const s = store.settings;
  const day = store.plan[store.cur];
  const pd = prettyDate(new Date(store.cur));

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 18, paddingBottom: 12, backgroundColor: c.bg, borderBottomWidth: 1, borderBottomColor: c.line }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: c.green, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 20 }}>🍛</Text>
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={{ fontSize: 21, fontWeight: '800', letterSpacing: -0.5, color: c.ink }}>Rasoi</Text>
              <Text style={{ color: c.inkSoft, fontSize: 12, marginTop: 1 }}>{s.cookName ? `for ${s.cookName}` : 'Aaj kya banega?'}</Text>
            </View>
          </View>
          <Pressable onPress={() => setSettingsOpen(true)} hitSlop={8} style={{ width: 40, height: 40, borderRadius: 12, borderWidth: 1, borderColor: c.line, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 18 }}>⚙️</Text>
          </Pressable>
        </View>

        {tab === 'today' && day ? (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14 }}>
              <Pressable onPress={() => shiftDay(-1)} style={{ width: 34, height: 34, borderRadius: 9, borderWidth: 1, borderColor: c.line, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: c.inkSoft, fontSize: 16 }}>‹</Text>
              </Pressable>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ color: c.ink, fontWeight: '700', fontSize: 15 }}>{pd.rel}</Text>
                <Text style={{ color: c.inkFaint, fontSize: 11 }}>{pd.sub}</Text>
              </View>
              <Pressable onPress={() => shiftDay(1)} style={{ width: 34, height: 34, borderRadius: 9, borderWidth: 1, borderColor: c.line, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: c.inkSoft, fontSize: 16 }}>›</Text>
              </Pressable>
            </View>
            <ProteinMeter total={dayProtein(day)} target={s.protein} />
          </>
        ) : null}
      </View>

      {/* Body */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18, paddingBottom: 150 }}>
        {tab === 'today' && <TodayScreen onSend={(key) => setSendCtx({ kind: 'day', key })} />}
        {tab === 'week' && <WeekScreen onSend={(key) => setSendCtx({ kind: 'day', key })} />}
        {tab === 'grocery' && <GroceryScreen onSendGrocery={() => setSendCtx({ kind: 'grocery' })} />}
        {tab === 'discover' && <DiscoverScreen />}
      </ScrollView>

      {/* Mic FAB */}
      <Pressable onPress={() => setVoiceOpen(true)} style={[styles.fab, { right: 24, bottom: insets.bottom + 78, backgroundColor: c.saffron, borderColor: c.bg }]}>
        <Text style={{ fontSize: 26 }}>🎤</Text>
      </Pressable>

      {/* Bottom nav */}
      <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: c.line, paddingTop: 8, paddingHorizontal: 6, paddingBottom: insets.bottom + 8, backgroundColor: c.surface }}>
        {TABS.map((t) => (
          <Pressable key={t.k} onPress={() => setTab(t.k)} style={{ flex: 1, alignItems: 'center', paddingVertical: 4 }}>
            <Text style={{ fontSize: 20, opacity: tab === t.k ? 1 : 0.55 }}>{t.ic}</Text>
            <Text style={{ fontSize: 10, fontWeight: '600', marginTop: 2, color: tab === t.k ? c.green : c.inkFaint }}>{t.lb}</Text>
          </Pressable>
        ))}
      </View>

      <VoiceSheet open={voiceOpen} onClose={() => setVoiceOpen(false)} />
      <SendSheet ctx={sendCtx} onClose={() => setSendCtx(null)} />
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute', width: 60, height: 60, borderRadius: 99, borderWidth: 3,
    alignItems: 'center', justifyContent: 'center', elevation: 6,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
  },
});
