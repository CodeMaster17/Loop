import {
  Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold, Poppins_800ExtraBold, useFonts,
} from '@expo-google-fonts/poppins';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StatusBar, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { PortalProvider, TamaguiProvider } from 'tamagui';
import tamaguiConfig from './tamagui.config';
import { type TabDef, TabBar } from './src/components/TabBar';
import { Text } from './src/components/Text';
import { getDb } from './src/db/open';
import { usePhotoFilling } from './src/hooks/usePhotoFilling';
import { OnboardingFlow } from './src/onboarding/OnboardingFlow';
import { GroceryScreen } from './src/screens/GroceryScreen';
import { MenuCardScreen } from './src/screens/MenuCardScreen';
import { PlanScreen } from './src/screens/PlanScreen';
import { SendCtx, SendSheet } from './src/sheets/SendSheet';
import { SettingsSheet } from './src/sheets/SettingsSheet';
import { StoreProvider, useStore } from './src/store';
import { useColors } from './src/theme';
import type { Tab } from './src/types';

const TABS: TabDef<Tab>[] = [
  { key: 'plan', label: 'Plan', icon: 'calendar-outline', iconActive: 'calendar' },
  { key: 'menu', label: 'Menu card', icon: 'book-outline', iconActive: 'book' },
  { key: 'grocery', label: 'Groceries', icon: 'basket-outline', iconActive: 'basket' },
];

/** Space the floating tab bar covers at the bottom of scrolling content. */
const TAB_CLEARANCE = 110;

export default function App() {
  usePhotoFilling();
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold, Poppins_800ExtraBold });

  // Open, migrate and seed the on-device database early.
  useEffect(() => {
    getDb().catch((e: unknown) => console.error('[rasoi] database failed to open', e));
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
          <PortalProvider shouldAddRootHost>
            <StatusBar barStyle="dark-content" />
            {fontsLoaded ? (
              <StoreProvider fallback={<Loading />}>
                <Gate />
              </StoreProvider>
            ) : <Loading />}
          </PortalProvider>
        </TamaguiProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/** Show onboarding until it's completed, then the main app. */
function Gate() {
  const { store } = useStore();
  return store.onboarded ? <Root /> : <OnboardingFlow />;
}

function Loading() {
  const c = useColors();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg }}>
      <ActivityIndicator color={c.saffron} />
    </View>
  );
}

function Root() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { store } = useStore();

  const [tab, setTab] = useState<Tab>('plan');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sendCtx, setSendCtx] = useState<SendCtx | null>(null);

  const s = store.settings;
  const bottom = TAB_CLEARANCE + insets.bottom;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 18, paddingBottom: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: '700', color: c.ink, letterSpacing: -0.3 }}>Rasoi</Text>
            <Text style={{ color: c.inkSoft, fontSize: 12.5 }}>{s.cookName ? `Cooking with ${s.cookName}` : 'Aaj kya banega?'}</Text>
          </View>
          <Pressable
            onPress={() => setSettingsOpen(true)}
            hitSlop={8}
            accessibilityLabel="Settings"
            style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="settings-outline" size={20} color={c.ink} />
          </Pressable>
        </View>

      </View>

      {/* Body */}
      {tab === 'menu' ? (
        <MenuCardScreen bottomInset={bottom} />
      ) : (
        <ScrollView key={tab} style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 8, paddingHorizontal: tab === 'plan' ? 0 : 18, paddingBottom: bottom }}>
          <Animated.View entering={FadeIn.duration(180)}>
            {tab === 'plan' && <PlanScreen onSend={(key) => setSendCtx({ kind: 'day', key })} />}
            {tab === 'grocery' && <GroceryScreen onSendGrocery={() => setSendCtx({ kind: 'grocery' })} />}
          </Animated.View>
        </ScrollView>
      )}

      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      <SendSheet ctx={sendCtx} onClose={() => setSendCtx(null)} />
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </View>
  );
}
