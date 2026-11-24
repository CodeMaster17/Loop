// Rasoi on the web: the same app shell as App.tsx in the native app — header, three tabs
// (Plan, Menu card, Groceries), the floating tab bar, and the Send / Settings sheets.
'use client';
import { useEffect, useState } from 'react';
// Loaded up front so the reminder switch can ask for notification permission straight
// from the tap (iOS only allows that during a user gesture).
import '../shims/expo-notifications';
import { getDb } from '../shared/src/db/open';
import { BUNDLED_DISH_PHOTOS } from '../shared/src/design/dishPhotoImages';
import { GROCERY_ICON_IMAGES } from '../shared/src/design/groceryIconImages';
import { palette as c } from '../shared/src/design/palette';
import { StoreProvider, useStore } from '../shared/src/store';
import type { Tab } from '../shared/src/types';
import { Icon } from './components/Icon';
import { type TabDef, TabBar } from './components/TabBar';
import { OnboardingFlow } from './onboarding/OnboardingFlow';
import { GroceryScreen } from './screens/GroceryScreen';
import { MenuCardScreen } from './screens/MenuCardScreen';
import { PlanScreen } from './screens/PlanScreen';
import { registerServiceWorker } from './serviceWorker';
import { type SendCtx, SendSheet } from './sheets/SendSheet';
import { SettingsSheet } from './sheets/SettingsSheet';
import { usePhotoFilling } from './usePhotoFilling';
import { imageUrl } from './image';

const TABS: TabDef<Tab>[] = [
  { key: 'plan', label: 'Plan', icon: 'calendar-outline', iconActive: 'calendar' },
  { key: 'menu', label: 'Menu card', icon: 'book-outline', iconActive: 'book' },
  { key: 'grocery', label: 'Groceries', icon: 'basket-outline', iconActive: 'basket' },
];

/** Space the floating tab bar covers at the bottom of scrolling content. */
const TAB_CLEARANCE = 'calc(110px + var(--safe-bottom))';

export default function App() {
  usePhotoFilling();

  // Open, migrate and seed the on-device database early; set up offline support.
  useEffect(() => {
    getDb().catch((e: unknown) => console.error('[rasoi] database failed to open', e));
    registerServiceWorker([
      ...Object.values(BUNDLED_DISH_PHOTOS).map((b) => imageUrl(b.source)),
      ...Object.values(GROCERY_ICON_IMAGES).map(imageUrl),
    ]);
    // Ask the browser not to clear Rasoi's data when space runs low.
    navigator.storage?.persist?.().catch(() => {});
  }, []);

  return (
    <StoreProvider fallback={<Loading />}>
      <Gate />
    </StoreProvider>
  );
}

/** Show onboarding until it's completed, then the main app. */
function Gate() {
  const { store } = useStore();
  return store.onboarded ? <Root /> : <OnboardingFlow />;
}

function Loading() {
  return (
    <div className="app" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div aria-label="Loading" style={{ width: 24, height: 24, borderRadius: 99, border: `3px solid ${c.brandSoft}`, borderTopColor: c.brand, animation: 'spin 0.8s linear infinite' }} />
      <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
    </div>
  );
}

function Root() {
  const { store } = useStore();
  const [tab, setTab] = useState<Tab>('plan');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sendCtx, setSendCtx] = useState<SendCtx | null>(null);
  const s = store.settings;

  return (
    <div className="app">
      {/* Header */}
      <header style={{ padding: 'calc(var(--safe-top) + 10px) 18px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: c.ink, letterSpacing: -0.3, lineHeight: '32px' }}>Rasoi</h1>
          <p style={{ color: c.inkSoft, fontSize: 12.5 }}>{s.cookName ? `Cooking with ${s.cookName}` : 'Aaj kya banega?'}</p>
        </div>
        <button
          type="button"
          aria-label="Settings"
          onClick={() => setSettingsOpen(true)}
          className="press"
          style={{ width: 42, height: 42, borderRadius: 21, background: c.surface, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon name="settings-outline" size={20} color={c.ink} />
        </button>
      </header>

      {/* Body */}
      {tab === 'menu' ? (
        <MenuCardScreen bottomInset={TAB_CLEARANCE} />
      ) : (
        <main key={tab} className="scroll" style={{ padding: `8px ${tab === 'plan' ? 0 : 18}px ${TAB_CLEARANCE}` }}>
          <div className="fade-in" style={{ animationDuration: '180ms' }}>
            {tab === 'plan' && <PlanScreen onSend={(key) => setSendCtx({ kind: 'day', key })} />}
            {tab === 'grocery' && <GroceryScreen onSendGrocery={() => setSendCtx({ kind: 'grocery' })} />}
          </div>
        </main>
      )}

      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      <SendSheet ctx={sendCtx} onClose={() => setSendCtx(null)} />
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
