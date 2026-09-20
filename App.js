import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, TextInput, Modal, Linking,
  StyleSheet, useColorScheme, StatusBar, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { getColors } from './src/theme';
import {
  LIB, SEED_RECS, shelf, dkey, addDays, prettyDate, seedDay, recentNames, pick,
  dayProtein, weekIngredients, applyCommand, buildMenuMessage, buildGroceryMessage,
} from './src/data';

const KEY = 'rasoiPlanner.v1';
const VOICE_EGS = ['make lunch high protein', 'swap dinner to rajma', 'give me a veg day', 'change breakfast'];

function freshStore() {
  const store = {
    settings: { cookName: '', cookNum: '', diet: 'both', protein: 60, lang: 'english', reminder: false },
    plan: {}, done: {}, cur: dkey(new Date()), seeded: true,
  };
  const today = new Date();
  for (let i = 0; i < 7; i++) store.plan[dkey(addDays(today, i))] = seedDay('both', recentNames(store.plan));
  return store;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Root />
    </SafeAreaProvider>
  );
}

function Root() {
  const scheme = useColorScheme();
  const c = getColors(scheme);
  const insets = useSafeAreaInsets();
  const [store, setStore] = useState(null);
  const [tab, setTab] = useState('today');
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [setOpen, setSetOpen] = useState(false);
  const [sendCtx, setSendCtx] = useState(null); // {kind:'day'|'grocery', key}
  const [recs, setRecs] = useState(SEED_RECS.slice(0, 4));

  // load persisted store
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) { const s = JSON.parse(raw); if (s && s.plan) { if (!s.done) s.done = {}; setStore(s); return; } }
      } catch (e) {}
      const fs = freshStore();
      setStore(fs);
      AsyncStorage.setItem(KEY, JSON.stringify(fs)).catch(() => {});
    })();
  }, []);

  const commit = useCallback((fn) => {
    setStore((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      fn(next);
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  // keep the next 7 days seeded (runs after render, never during it)
  useEffect(() => {
    if (!store) return;
    const today = new Date();
    let missing = false;
    for (let i = 0; i < 7; i++) if (!store.plan[dkey(addDays(today, i))]) { missing = true; break; }
    if (missing) commit((n) => {
      for (let i = 0; i < 7; i++) { const k = dkey(addDays(today, i)); if (!n.plan[k]) n.plan[k] = seedDay(n.settings.diet, recentNames(n.plan)); }
    });
  }, [store, commit]);

  if (!store) {
    return (
      <View style={[st.center, { backgroundColor: c.bg }]}>
        <Text style={{ fontSize: 40 }}>🍛</Text>
        <ActivityIndicator color={c.green} style={{ marginTop: 12 }} />
      </View>
    );
  }

  const s = store.settings;
  const curKey = store.cur;
  const day = store.plan[curKey] || seedDay(s.diet, []);

  /* ---------- actions ---------- */
  const newPlan = () => commit((n) => { n.plan[curKey] = seedDay(n.settings.diet, recentNames(n.plan)); n.seeded = false; });
  const swap = (slot) => commit((n) => {
    const cur = n.plan[curKey][slot];
    n.plan[curKey][slot] = pick(slot, n.settings.diet, [cur.name]); n.seeded = false;
  });
  const shiftDay = (delta) => commit((n) => {
    const nd = addDays(new Date(n.cur), delta); n.cur = dkey(nd);
    if (!n.plan[n.cur]) n.plan[n.cur] = seedDay(n.settings.diet, recentNames(n.plan));
  });
  const planWeek = () => commit((n) => {
    const today = new Date();
    for (let i = 0; i < 7; i++) n.plan[dkey(addDays(today, i))] = seedDay(n.settings.diet, recentNames(n.plan));
    n.seeded = false;
  });
  const addRecToToday = (r) => {
    commit((n) => {
      const slot = r.protein >= 25 ? 'dinner' : 'lunch';
      n.plan[n.cur][slot] = { name: r.name, p: Math.round(r.protein), v: !!r.veg, i: r.items || [] };
      n.seeded = false;
    });
    setTab('today');
  };
  const shuffleRecs = () => setRecs(SEED_RECS.slice().sort(() => Math.random() - 0.5).slice(0, 4));

  const openWhatsApp = async (text, useNumber) => {
    const num = useNumber ? String(s.cookNum || '').replace(/[^0-9]/g, '') : '';
    const wa = 'whatsapp://send?' + (num ? 'phone=' + num + '&' : '') + 'text=' + encodeURIComponent(text);
    const web = 'https://wa.me/' + num + '?text=' + encodeURIComponent(text);
    try {
      const ok = await Linking.canOpenURL(wa);
      await Linking.openURL(ok ? wa : web);
    } catch (e) {
      try { await Linking.openURL(web); } catch (e2) {}
    }
  };

  const applyVoice = (cmdText) => {
    let applied = false;
    commit((n) => { applied = applyCommand(cmdText, n.plan[n.cur], n.settings.diet); if (applied) n.seeded = false; });
    return applied;
  };

  const setReminder = async (on) => {
    commit((n) => { n.settings.reminder = on; });
    try {
      // Lazy-load so Expo Go (which dropped notifications in SDK 53) doesn't crash on startup.
      // Fully functional in the Stage 2 development build.
      const Notifications = require('expo-notifications');
      if (on) {
        const perm = await Notifications.requestPermissionsAsync();
        if (!perm.granted && perm.status !== 'granted') return;
        await Notifications.cancelAllScheduledNotificationsAsync();
        const T = Notifications.SchedulableTriggerInputTypes;
        const trigger = T && T.DAILY ? { type: T.DAILY, hour: 8, minute: 0 } : { hour: 8, minute: 0, repeats: true };
        await Notifications.scheduleNotificationAsync({
          content: { title: 'Rasoi 🍛', body: "Send today's menu to your cook" },
          trigger,
        });
      } else {
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
    } catch (e) { /* Expo Go: reminders need the development build */ }
  };

  /* ---------- shared bits ---------- */
  const TABS = [
    { k: 'today', ic: '🍽️', lb: 'Today' },
    { k: 'week', ic: '🗓️', lb: 'Week' },
    { k: 'grocery', ic: '🛒', lb: 'Grocery' },
    { k: 'discover', ic: '💡', lb: 'Discover' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 18, paddingBottom: 12, backgroundColor: c.bg, borderBottomWidth: 1, borderBottomColor: c.line }}>
        <View style={st.row}>
          <View style={st.rowc}>
            <View style={[st.mark, { backgroundColor: c.green }]}><Text style={{ fontSize: 20 }}>🍛</Text></View>
            <View style={{ marginLeft: 10 }}>
              <Text style={[st.brand, { color: c.ink }]}>Rasoi</Text>
              <Text style={{ color: c.inkSoft, fontSize: 12, marginTop: 1 }}>{s.cookName ? 'for ' + s.cookName : 'Aaj kya banega?'}</Text>
            </View>
          </View>
          <Pressable onPress={() => setSetOpen(true)} style={[st.iconBtn, { borderColor: c.line, backgroundColor: c.surface }]} hitSlop={8}>
            <Text style={{ fontSize: 18 }}>⚙️</Text>
          </Pressable>
        </View>

        {tab === 'today' && (
          <>
            <View style={[st.rowc, { marginTop: 14, justifyContent: 'center' }]}>
              <Pressable onPress={() => shiftDay(-1)} style={[st.navBtn, { borderColor: c.line, backgroundColor: c.surface }]}><Text style={{ color: c.inkSoft, fontSize: 16 }}>‹</Text></Pressable>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ color: c.ink, fontWeight: '700', fontSize: 15 }}>{prettyDate(new Date(curKey)).rel}</Text>
                <Text style={{ color: c.inkFaint, fontSize: 11 }}>{prettyDate(new Date(curKey)).sub}</Text>
              </View>
              <Pressable onPress={() => shiftDay(1)} style={[st.navBtn, { borderColor: c.line, backgroundColor: c.surface }]}><Text style={{ color: c.inkSoft, fontSize: 16 }}>›</Text></Pressable>
            </View>
            <ProteinMeter c={c} total={dayProtein(day)} target={s.protein} />
          </>
        )}
      </View>

      {/* Body */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18, paddingBottom: 150 }}>
        {tab === 'today' && (
          <TodayView c={c} day={day} seeded={store.seeded} onSwap={swap} onNew={newPlan}
            onSend={() => setSendCtx({ kind: 'day', key: curKey })} />
        )}
        {tab === 'week' && (
          <WeekView c={c} plan={store.plan} onSend={(key) => setSendCtx({ kind: 'day', key })} onPlanWeek={planWeek} />
        )}
        {tab === 'grocery' && (
          <GroceryView c={c} plan={store.plan} done={store.done}
            onToggle={(it) => commit((n) => { n.done[it] = !n.done[it]; })}
            onSend={() => setSendCtx({ kind: 'grocery' })} />
        )}
        {tab === 'discover' && (
          <DiscoverView c={c} recs={recs} onShuffle={shuffleRecs} onAdd={addRecToToday} />
        )}
      </ScrollView>

      {/* Mic FAB */}
      <Pressable onPress={() => setVoiceOpen(true)} style={[st.fab, { right: 24, bottom: insets.bottom + 78, backgroundColor: c.saffron, borderColor: c.bg }]}>
        <Text style={{ fontSize: 26 }}>🎤</Text>
      </Pressable>

      {/* Bottom nav */}
      <View style={[st.nav, { paddingBottom: insets.bottom + 8, backgroundColor: c.surface, borderTopColor: c.line }]}>
        {TABS.map((t) => (
          <Pressable key={t.k} onPress={() => setTab(t.k)} style={st.navItem}>
            <Text style={{ fontSize: 20, opacity: tab === t.k ? 1 : 0.55 }}>{t.ic}</Text>
            <Text style={{ fontSize: 10, fontWeight: '600', marginTop: 2, color: tab === t.k ? c.green : c.inkFaint }}>{t.lb}</Text>
          </Pressable>
        ))}
      </View>

      {/* Sheets */}
      <VoiceSheet c={c} open={voiceOpen} onClose={() => setVoiceOpen(false)} onApply={applyVoice} />
      <SendSheet c={c} ctx={sendCtx} store={store} onClose={() => setSendCtx(null)}
        onLang={(lang) => commit((n) => { n.settings.lang = lang; })}
        onOpen={openWhatsApp} />
      <SettingsSheet c={c} open={setOpen} settings={s} onClose={() => setSetOpen(false)}
        onSave={(patch) => commit((n) => { Object.assign(n.settings, patch); })}
        onReminder={setReminder} />
    </View>
  );
}

/* ==================== Small components ==================== */
function VegMark({ c, veg, size = 15 }) {
  return (
    <View style={{ width: size, height: size, borderRadius: 3, borderWidth: 1.6, borderColor: veg ? c.green : c.chili, alignItems: 'center', justifyContent: 'center' }}>
      {veg
        ? <View style={{ width: size * 0.42, height: size * 0.42, borderRadius: 99, backgroundColor: c.green }} />
        : <View style={{ width: 0, height: 0, borderLeftWidth: size * 0.26, borderRightWidth: size * 0.26, borderBottomWidth: size * 0.44, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: c.chili }} />}
    </View>
  );
}

function Chip({ c, children, tone = 'saffron' }) {
  const bg = tone === 'green' ? c.leaf : c.saffronTint;
  const fg = tone === 'green' ? c.greenDeep : c.saffronInk;
  return <View style={{ backgroundColor: bg, borderRadius: 99, paddingHorizontal: 9, paddingVertical: 4 }}><Text style={{ color: fg, fontSize: 12, fontWeight: '600' }}>{children}</Text></View>;
}

function Btn({ c, label, onPress, kind = 'plain', style }) {
  const bg = kind === 'primary' ? c.green : kind === 'wa' ? c.wa : c.surface;
  const fg = kind === 'primary' ? c.onDark : kind === 'wa' ? c.onWa : c.ink;
  const border = kind === 'plain' ? c.line : 'transparent';
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [st.btn, { backgroundColor: bg, borderColor: border, opacity: pressed ? 0.85 : 1 }, style]}>
      <Text style={{ color: fg, fontWeight: '600', fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}

function ProteinMeter({ c, total, target }) {
  const pct = Math.min(100, Math.round((total / target) * 100));
  return (
    <View style={{ marginTop: 13 }}>
      <View style={[st.row, { marginBottom: 6 }]}>
        <Text style={{ color: c.inkSoft, fontSize: 11, letterSpacing: 1, fontWeight: '700' }}>PROTEIN TODAY</Text>
        <Text style={{ color: c.ink, fontSize: 13, fontWeight: '600' }}><Text style={{ color: c.saffronInk, fontWeight: '800', fontSize: 16 }}>{total}</Text> / {target} g</Text>
      </View>
      <View style={{ height: 9, borderRadius: 99, backgroundColor: c.surface2, borderWidth: 1, borderColor: c.line, overflow: 'hidden' }}>
        <View style={{ height: '100%', width: pct + '%', backgroundColor: c.saffron, borderRadius: 99 }} />
      </View>
    </View>
  );
}

function SectionLabel({ c, title, note }) {
  return (
    <View style={[st.row, { marginBottom: 10, marginHorizontal: 2 }]}>
      <Text style={{ color: c.inkSoft, fontSize: 11, letterSpacing: 1, fontWeight: '700' }}>{title.toUpperCase()}</Text>
      {note ? <Text style={{ color: c.inkFaint, fontSize: 11.5, fontWeight: '600' }}>{note}</Text> : null}
    </View>
  );
}

/* ==================== Screens ==================== */
function MealCard({ c, emo, label, meal, onSwap }) {
  return (
    <View style={[st.card, { backgroundColor: c.surface, borderColor: c.line }]}>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ width: 60, backgroundColor: c.surface2, borderRightWidth: 1, borderRightColor: c.line, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 }}>
          <Text style={{ fontSize: 20 }}>{emo}</Text>
          <Text style={{ fontSize: 9.5, letterSpacing: 0.5, color: c.inkSoft, fontWeight: '700', marginTop: 3 }}>{label.toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1, padding: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{ marginTop: 3 }}><VegMark c={c} veg={meal.v} /></View>
            <Text style={{ flex: 1, marginLeft: 8, color: c.ink, fontSize: 16.5, fontWeight: '700' }}>{meal.name}</Text>
          </View>
          {meal.i && meal.i.length ? <Text style={{ color: c.inkSoft, fontSize: 12.5, marginTop: 5 }}>{meal.i.slice(0, 5).join(' · ')}</Text> : null}
          <View style={[st.rowc, { marginTop: 10 }]}>
            <Chip c={c}>🔥 {meal.p}g protein</Chip>
            <Pressable onPress={onSwap} style={{ marginLeft: 'auto', paddingHorizontal: 6, paddingVertical: 4 }}>
              <Text style={{ color: c.green, fontWeight: '600', fontSize: 12.5 }}>🎲 swap</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

function TodayView({ c, day, seeded, onSwap, onNew, onSend }) {
  return (
    <View>
      <View style={[st.row, { marginBottom: 10, marginHorizontal: 2 }]}>
        <Text style={{ color: c.inkSoft, fontSize: 11, letterSpacing: 1, fontWeight: '700' }}>THE PLAN</Text>
        {seeded ? <View style={{ backgroundColor: c.saffronTint, borderRadius: 99, paddingHorizontal: 9, paddingVertical: 3 }}><Text style={{ color: c.saffronInk, fontSize: 11, fontWeight: '600' }}>✨ example</Text></View> : null}
      </View>
      <View style={{ gap: 12 }}>
        <MealCard c={c} emo="🌅" label="Break" meal={day.breakfast} onSwap={() => onSwap('breakfast')} />
        <MealCard c={c} emo="🍛" label="Lunch" meal={day.lunch} onSwap={() => onSwap('lunch')} />
        <MealCard c={c} emo="🌙" label="Dinner" meal={day.dinner} onSwap={() => onSwap('dinner')} />
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
        <Btn c={c} label="🎲 New plan" onPress={onNew} style={{ flex: 1 }} />
        <Btn c={c} label="📲 Send to cook" kind="wa" onPress={onSend} style={{ flex: 1 }} />
      </View>
      <Text style={{ color: c.inkFaint, fontSize: 12, textAlign: 'center', marginTop: 14, lineHeight: 18 }}>
        Tap the 🎤 to change a meal — "make lunch high protein", "swap dinner to rajma".
      </Text>
    </View>
  );
}

function WeekView({ c, plan, onSend, onPlanWeek }) {
  const today = new Date();
  const days = [];
  for (let i = 0; i < 7; i++) {
    const key = dkey(addDays(today, i));
    const d = plan[key] || seedDay('both', []);
    days.push({ key, d, pd: prettyDate(addDays(today, i)), first: i === 0 });
  }
  const avg = Math.round(days.reduce((a, x) => a + dayProtein(x.d), 0) / 7);
  return (
    <View>
      <SectionLabel c={c} title="This week" note={'~' + avg + 'g/day avg'} />
      <View style={{ gap: 10 }}>
        {days.map((x) => (
          <View key={x.key} style={[st.card, { backgroundColor: c.surface, borderColor: x.first ? c.green : c.line, borderWidth: x.first ? 1.5 : 1, padding: 13 }]}>
            <View style={[st.row, { marginBottom: 8 }]}>
              <Text style={{ color: c.ink, fontWeight: '700', fontSize: 14.5 }}>{x.pd.rel} <Text style={{ color: c.inkFaint, fontWeight: '500', fontSize: 12 }}>{x.pd.sub}</Text></Text>
              <View style={{ backgroundColor: c.saffronTint, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 }}><Text style={{ color: c.saffronInk, fontSize: 11.5, fontWeight: '600' }}>{dayProtein(x.d)}g</Text></View>
            </View>
            <MiniMeal c={c} k="🌅" n={x.d.breakfast.name} />
            <MiniMeal c={c} k="🍛" n={x.d.lunch.name} />
            <MiniMeal c={c} k="🌙" n={x.d.dinner.name} />
            <Pressable onPress={() => onSend(x.key)} style={{ marginTop: 9, borderWidth: 1, borderStyle: 'dashed', borderColor: c.line, borderRadius: 9, paddingVertical: 7, alignItems: 'center' }}>
              <Text style={{ color: c.green, fontWeight: '600', fontSize: 12.5 }}>📲 Send this day to cook</Text>
            </Pressable>
          </View>
        ))}
      </View>
      <Btn c={c} label="🎲 Re-plan the whole week" kind="primary" onPress={onPlanWeek} style={{ marginTop: 16 }} />
    </View>
  );
}
function MiniMeal({ c, k, n }) {
  return <View style={{ flexDirection: 'row', marginBottom: 3 }}><Text style={{ width: 20, color: c.inkFaint, fontSize: 12.5 }}>{k}</Text><Text style={{ flex: 1, color: c.ink, fontSize: 12.5 }}>{n}</Text></View>;
}

function GroceryView({ c, plan, done, onToggle, onSend }) {
  const map = weekIngredients(plan);
  const fresh = [], week = [];
  Object.keys(map).sort((a, b) => map[b] - map[a]).forEach((it) => (shelf(it) === 'fresh' ? fresh : week).push(it));
  return (
    <View>
      <SectionLabel c={c} title="Weekend shopping" note="from this week" />
      <GroceryGroup c={c} tone={c.chili} title="Buy fresh this weekend" sub="Finishes in a day or two" items={fresh} done={done} onToggle={onToggle} />
      <GroceryGroup c={c} tone={c.green} title="Staples — check & top up" sub="These last the week" items={week} done={done} onToggle={onToggle} />
      <Btn c={c} label="📲 Send list on WhatsApp" kind="wa" onPress={onSend} style={{ marginTop: 4 }} />
      <Text style={{ color: c.inkFaint, fontSize: 12, textAlign: 'center', marginTop: 14, lineHeight: 18 }}>🔴 fresh finishes fast · 🟢 staples last the week</Text>
    </View>
  );
}
function GroceryGroup({ c, tone, title, sub, items, done, onToggle }) {
  return (
    <View style={[st.card, { backgroundColor: c.surface, borderColor: c.line, marginBottom: 14, padding: 0 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 13, borderBottomWidth: 1, borderBottomColor: c.line }}>
        <View style={{ width: 10, height: 10, borderRadius: 99, backgroundColor: tone, marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: c.ink, fontWeight: '700', fontSize: 14.5 }}>{title}</Text>
          <Text style={{ color: c.inkFaint, fontSize: 11, marginTop: 1 }}>{sub}</Text>
        </View>
        <View style={{ backgroundColor: c.surface2, borderRadius: 99, paddingHorizontal: 9, paddingVertical: 2 }}><Text style={{ color: c.inkSoft, fontSize: 12, fontWeight: '600' }}>{items.length}</Text></View>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: 8 }}>
        {items.length === 0 ? <Text style={{ color: c.inkFaint, fontSize: 13, padding: 6 }}>nothing yet</Text> : items.map((it) => {
          const isDone = !!done[it];
          return (
            <Pressable key={it} onPress={() => onToggle(it)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 10, backgroundColor: c.surface2, borderWidth: 1, borderColor: c.line, opacity: isDone ? 0.45 : 1 }}>
              <View style={{ width: 15, height: 15, borderRadius: 5, borderWidth: 1.5, borderColor: isDone ? c.green : c.inkFaint, backgroundColor: isDone ? c.green : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                {isDone ? <Text style={{ color: '#fff', fontSize: 10 }}>✓</Text> : null}
              </View>
              <Text style={{ color: c.ink, fontSize: 13, textTransform: 'capitalize', textDecorationLine: isDone ? 'line-through' : 'none' }}>{it}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function DiscoverView({ c, recs, onShuffle, onAdd }) {
  return (
    <View>
      <SectionLabel c={c} title="New ideas" note="high-protein Indian" />
      {recs.map((r) => {
        const yt = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(r.name + ' recipe indian');
        return (
          <View key={r.name} style={[st.card, { backgroundColor: c.surface, borderColor: c.line, padding: 14, marginBottom: 12 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{ marginTop: 4 }}><VegMark c={c} veg={r.veg} /></View>
              <Text style={{ flex: 1, marginLeft: 8, color: c.ink, fontSize: 16, fontWeight: '700' }}>{r.name}</Text>
              <Chip c={c}>🔥 {Math.round(r.protein)}g</Chip>
            </View>
            <Text style={{ color: c.inkSoft, fontSize: 13, marginTop: 8, lineHeight: 19 }}>{r.why}</Text>
            <View style={[st.rowc, { marginTop: 11 }]}>
              <Pressable onPress={() => onAdd(r)} style={{ borderWidth: 1, borderColor: c.line, backgroundColor: c.surface2, borderRadius: 9, paddingHorizontal: 10, paddingVertical: 5 }}>
                <Text style={{ color: c.greenDeep, fontWeight: '600', fontSize: 12 }}>+ Add to today</Text>
              </Pressable>
              <Pressable onPress={() => Linking.openURL(yt)} style={{ marginLeft: 'auto', backgroundColor: c.chiliTint, borderRadius: 9, paddingHorizontal: 10, paddingVertical: 5 }}>
                <Text style={{ color: c.chili, fontWeight: '600', fontSize: 12.5 }}>▶ YouTube</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
      <Btn c={c} label="🎲 More ideas" kind="primary" onPress={onShuffle} style={{ marginTop: 4 }} />
    </View>
  );
}

/* ==================== Sheets ==================== */
function Sheet({ c, visible, onClose, children }) {
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

function VoiceSheet({ c, open, onClose, onApply }) {
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  const [listening, setListening] = useState(false);

  const stopListening = () => { try { ExpoSpeechRecognitionModule.stop(); } catch (e) {} };
  const abortListening = () => { try { ExpoSpeechRecognitionModule.abort(); } catch (e) {} };

  const apply = (cmd) => {
    const v = String(cmd != null ? cmd : text).trim();
    if (!v) { setErr('Say or type what to change first.'); return; }
    const ok = onApply(v);
    if (ok) { setText(''); setErr(''); abortListening(); onClose(); }
    else setErr("Couldn't match that — try 'swap dinner to <dish>'.");
  };

  const startListening = async () => {
    setErr('');
    try {
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!perm.granted) { setErr('Allow the microphone to use voice, or type below.'); return; }
      ExpoSpeechRecognitionModule.start({ lang: 'en-IN', interimResults: true, continuous: false });
    } catch (e) { setErr('Voice not available here — type your change below.'); }
  };

  useSpeechRecognitionEvent('start', () => setListening(true));
  useSpeechRecognitionEvent('end', () => setListening(false));
  useSpeechRecognitionEvent('result', (e) => {
    const t = e && e.results && e.results[0] ? e.results[0].transcript : '';
    if (t) { setText(t); setErr(''); }
    if (e && e.isFinal && t) apply(t);
  });
  useSpeechRecognitionEvent('error', (e) => {
    setListening(false);
    const code = e && e.error;
    if (code === 'not-allowed' || code === 'service-not-allowed') setErr('Mic blocked — type your change instead.');
    else if (code === 'no-speech') setErr("Didn't catch that — tap the mic to try again.");
    else if (code === 'language-not-supported') setErr('That language isn’t supported here — type your change.');
    else setErr('Voice unavailable — type your change below.');
  });

  useEffect(() => {
    if (open) { setText(''); setErr(''); startListening(); }
    else { abortListening(); setListening(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Sheet c={c} visible={open} onClose={onClose}>
      <Pressable onPress={() => (listening ? stopListening() : startListening())}
        style={{ width: 90, height: 90, borderRadius: 99, backgroundColor: listening ? c.saffronTint : c.leaf, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginBottom: 10, borderWidth: listening ? 2 : 0, borderColor: c.saffron }}>
        <Text style={{ fontSize: 38 }}>🎤</Text>
      </Pressable>
      <Text style={{ color: c.ink, fontWeight: '700', fontSize: 18, textAlign: 'center' }}>{listening ? 'Listening…' : 'Tell Rasoi what to change'}</Text>
      <Text style={{ color: c.inkFaint, fontSize: 12.5, textAlign: 'center', marginTop: 4, marginBottom: 14 }}>{listening ? "Speak now — I'll update the plan when you pause." : 'Tap the mic to speak, or type below.'}</Text>
      {text ? <Text style={{ color: c.ink, fontSize: 16, textAlign: 'center', marginBottom: 12 }}>“{text}”</Text> : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, justifyContent: 'center', marginBottom: 14 }}>
        {VOICE_EGS.map((e) => (
          <Pressable key={e} onPress={() => setText(e)} style={{ backgroundColor: c.surface2, borderWidth: 1, borderColor: c.line, borderRadius: 99, paddingHorizontal: 11, paddingVertical: 6 }}>
            <Text style={{ color: c.inkSoft, fontSize: 12 }}>{e}</Text>
          </Pressable>
        ))}
      </View>
      <TextInput value={text} onChangeText={(t) => { setText(t); setErr(''); }} placeholder="e.g. change dinner to paneer bhurji"
        placeholderTextColor={c.inkFaint} onSubmitEditing={() => apply()} returnKeyType="done"
        style={{ borderWidth: 1, borderColor: c.line, backgroundColor: c.surface2, color: c.ink, borderRadius: 11, paddingHorizontal: 13, paddingVertical: 12, fontSize: 15 }} />
      {err ? <Text style={{ color: c.chili, fontSize: 12.5, textAlign: 'center', marginTop: 8 }}>{err}</Text> : null}
      <Btn c={c} label="Apply change" kind="primary" onPress={() => apply()} style={{ marginTop: 14 }} />
    </Sheet>
  );
}

function SendSheet({ c, ctx, store, onClose, onLang, onOpen }) {
  if (!ctx) return null;
  const s = store.settings;
  const text = ctx.kind === 'grocery' ? buildGroceryMessage(store.plan, store.done) : buildMenuMessage(store.plan, ctx.key, s);
  return (
    <Sheet c={c} visible={!!ctx} onClose={onClose}>
      <Text style={{ color: c.ink, fontWeight: '700', fontSize: 18 }}>{ctx.kind === 'grocery' ? 'Send grocery list' : 'Send to cook' + (s.cookName ? ' — ' + s.cookName : '')}</Text>
      <Text style={{ color: c.inkSoft, fontSize: 13, marginTop: 4, marginBottom: 14, lineHeight: 19 }}>Review it, then it opens in WhatsApp for you to tap send. Nothing is sent automatically.</Text>
      <View style={{ backgroundColor: c.surface2, borderWidth: 1, borderColor: c.line, borderRadius: 12, padding: 14 }}>
        <Text style={{ color: c.ink, fontSize: 13.5, lineHeight: 22 }}>{text}</Text>
      </View>
      {ctx.kind === 'day' && (
        <View style={{ marginTop: 14 }}>
          <Text style={{ color: c.inkSoft, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>Language</Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {['english', 'hinglish'].map((l) => (
              <Pressable key={l} onPress={() => onLang(l)} style={{ flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: s.lang === l ? 'transparent' : c.line, backgroundColor: s.lang === l ? c.green : c.surface2, alignItems: 'center' }}>
                <Text style={{ color: s.lang === l ? c.onDark : c.inkSoft, fontWeight: '600', fontSize: 13, textTransform: 'capitalize' }}>{l}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
      <Btn c={c} label="Open in WhatsApp" kind="wa" onPress={() => { onOpen(text, ctx.kind === 'day'); onClose(); }} style={{ marginTop: 16 }} />
    </Sheet>
  );
}

function SettingsSheet({ c, open, settings, onClose, onSave, onReminder }) {
  const [name, setName] = useState(settings.cookName);
  const [num, setNum] = useState(settings.cookNum);
  const [diet, setDiet] = useState(settings.diet);
  const [protein, setProtein] = useState(settings.protein);
  const [reminder, setReminder] = useState(settings.reminder);
  useEffect(() => {
    if (open) { setName(settings.cookName); setNum(settings.cookNum); setDiet(settings.diet); setProtein(settings.protein); setReminder(settings.reminder); }
  }, [open]);
  const field = { borderWidth: 1, borderColor: c.line, backgroundColor: c.surface2, color: c.ink, borderRadius: 11, paddingHorizontal: 13, paddingVertical: 12, fontSize: 15 };
  const lbl = { color: c.inkSoft, fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 14 };
  return (
    <Sheet c={c} visible={open} onClose={onClose}>
      <Text style={{ color: c.ink, fontWeight: '700', fontSize: 18 }}>Setup</Text>
      <Text style={{ color: c.inkSoft, fontSize: 13, marginTop: 4 }}>Saved on this device only.</Text>
      <Text style={lbl}>Cook's name</Text>
      <TextInput value={name} onChangeText={setName} placeholder="e.g. Sunita didi" placeholderTextColor={c.inkFaint} style={field} />
      <Text style={lbl}>Cook's WhatsApp number (with country code)</Text>
      <TextInput value={num} onChangeText={setNum} keyboardType="phone-pad" placeholder="e.g. 919812345678" placeholderTextColor={c.inkFaint} style={field} />
      <Text style={lbl}>Diet</Text>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {['veg', 'both', 'nonveg'].map((d) => (
          <Pressable key={d} onPress={() => setDiet(d)} style={{ flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: diet === d ? 'transparent' : c.line, backgroundColor: diet === d ? c.green : c.surface2, alignItems: 'center' }}>
            <Text style={{ color: diet === d ? c.onDark : c.inkSoft, fontWeight: '600', fontSize: 13, textTransform: 'capitalize' }}>{d}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={lbl}>Daily protein target — {protein} g</Text>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {[45, 60, 75, 90, 110].map((p) => (
          <Pressable key={p} onPress={() => setProtein(p)} style={{ flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: protein === p ? 'transparent' : c.line, backgroundColor: protein === p ? c.saffron : c.surface2, alignItems: 'center' }}>
            <Text style={{ color: protein === p ? c.onDark : c.inkSoft, fontWeight: '600', fontSize: 13 }}>{p}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable onPress={() => { const v = !reminder; setReminder(v); onReminder(v); }} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: c.ink, fontWeight: '600', fontSize: 14 }}>Daily 8am reminder</Text>
          <Text style={{ color: c.inkFaint, fontSize: 12, marginTop: 2 }}>Nudge to send the menu</Text>
        </View>
        <View style={{ width: 46, height: 28, borderRadius: 99, backgroundColor: reminder ? c.green : c.surface2, borderWidth: 1, borderColor: c.line, justifyContent: 'center', paddingHorizontal: 3 }}>
          <View style={{ width: 22, height: 22, borderRadius: 99, backgroundColor: '#fff', alignSelf: reminder ? 'flex-end' : 'flex-start' }} />
        </View>
      </Pressable>
      <Btn c={c} label="Save" kind="primary" onPress={() => { onSave({ cookName: name.trim(), cookNum: num.trim(), diet, protein }); onClose(); }} style={{ marginTop: 18 }} />
    </Sheet>
  );
}

/* ==================== static styles ==================== */
const st = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowc: { flexDirection: 'row', alignItems: 'center' },
  mark: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  brand: { fontSize: 21, fontWeight: '800', letterSpacing: -0.5 },
  iconBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  navBtn: { width: 34, height: 34, borderRadius: 9, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  card: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  btn: { borderWidth: 1, borderRadius: 13, paddingVertical: 13, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  fab: { position: 'absolute', width: 60, height: 60, borderRadius: 99, borderWidth: 3, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  nav: { flexDirection: 'row', borderTopWidth: 1, paddingTop: 8, paddingHorizontal: 6 },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 4 },
});
