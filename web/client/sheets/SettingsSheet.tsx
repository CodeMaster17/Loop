import { useEffect, useState } from 'react';
import { palette as c } from '../../shared/src/design/palette';
import { useStore } from '../../shared/src/store';
import type { Diet } from '../../shared/src/types';
import { Btn, Sheet } from '../components/ui';
import { isInstalled, pushSupported } from '../push';

const PROTEIN_STEPS = [45, 60, 75, 90, 110];

export function SettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet visible={open} onClose={onClose}>
      {/* Mounted only while open, so the form starts from the saved settings each time. */}
      {open ? <SettingsForm onClose={onClose} /> : null}
    </Sheet>
  );
}

function SettingsForm({ onClose }: { onClose: () => void }) {
  const { store, updateSettings, setReminder } = useStore();
  const s = store.settings;

  const [name, setName] = useState(s.cookName);
  const [num, setNum] = useState(s.cookNum);
  const [diet, setDiet] = useState<Diet>(s.diet);
  const [protein, setProtein] = useState<number>(s.protein);
  const [reminder, setReminderState] = useState<boolean>(s.reminder);

  const field: React.CSSProperties = { width: '100%', border: `1px solid ${c.line}`, background: c.surface2, color: c.ink, borderRadius: 11, padding: '12px 13px', fontSize: 15 };
  const lbl: React.CSSProperties = { display: 'block', color: c.inkSoft, fontSize: 12, fontWeight: 600, marginBottom: 6, marginTop: 14 };
  const pick = (on: boolean): React.CSSProperties => ({ flex: 1, padding: '10px 0', borderRadius: 8, border: `1px solid ${on ? 'transparent' : c.line}`, background: on ? c.brand : c.surface2, textAlign: 'center', color: on ? c.white : c.inkSoft, fontWeight: 600, fontSize: 13 });
  // Web push only reaches iPhones when Rasoi is on the Home Screen (iOS 16.4+), and only
  // when the server has reminders set up.
  const [serverReady, setServerReady] = useState<boolean | null>(null);
  useEffect(() => {
    fetch('/api/push/key').then((r) => setServerReady(r.ok)).catch(() => setServerReady(null));
  }, []);
  const pushHint = serverReady === false
    ? "Reminders aren't switched on for this site yet."
    : !pushSupported() || !isInstalled() ? 'On iPhone, add Rasoi to your Home Screen first (Share → Add to Home Screen).' : null;

  return (
    <>
      <h2 style={{ color: c.ink, fontWeight: 700, fontSize: 18 }}>Setup</h2>
      <p style={{ color: c.inkSoft, fontSize: 13, marginTop: 4 }}>Saved on this device only.</p>

      <label style={lbl} htmlFor="cook-name">{"Cook's name"}</label>
      <input id="cook-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Didi" style={field} />

      <label style={lbl} htmlFor="cook-num">{"Cook's WhatsApp number (with country code)"}</label>
      <input id="cook-num" value={num} onChange={(e) => setNum(e.target.value)} inputMode="tel" type="tel" placeholder="e.g. 919812345678" style={field} />

      <span style={lbl}>Diet</span>
      <div style={{ display: 'flex', gap: 6 }}>
        {(['veg', 'both', 'nonveg'] as Diet[]).map((d) => (
          <button key={d} type="button" onClick={() => setDiet(d)} style={{ ...pick(diet === d), textTransform: 'capitalize' }}>{d}</button>
        ))}
      </div>

      <span style={lbl}>{`Daily protein target — ${protein} g`}</span>
      <div style={{ display: 'flex', gap: 6 }}>
        {PROTEIN_STEPS.map((g) => (
          <button key={g} type="button" onClick={() => setProtein(g)} style={pick(protein === g)}>{g}</button>
        ))}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={reminder}
        onClick={() => { const val = !reminder; setReminderState(val); void setReminder(val); }}
        style={{ display: 'flex', width: '100%', alignItems: 'center', marginTop: 16, justifyContent: 'space-between', gap: 12 }}
      >
        <span style={{ flex: 1 }}>
          <span style={{ display: 'block', color: c.ink, fontWeight: 600, fontSize: 14 }}>Daily 8am reminder</span>
          <span style={{ display: 'block', color: c.inkFaint, fontSize: 12, marginTop: 2 }}>Nudge to send the menu</span>
          {pushHint ? <span style={{ display: 'block', color: c.brandInk, fontSize: 11.5, marginTop: 4 }}>{pushHint}</span> : null}
        </span>
        <span style={{ width: 46, height: 28, borderRadius: 99, background: reminder ? c.brand : c.surface2, border: `1px solid ${c.line}`, display: 'flex', alignItems: 'center', padding: '0 3px', justifyContent: reminder ? 'flex-end' : 'flex-start', flexShrink: 0 }}>
          <span style={{ width: 22, height: 22, borderRadius: 99, background: '#fff' }} />
        </span>
      </button>

      <Btn label="Save" kind="primary" icon="checkmark" onPress={() => { updateSettings({ cookName: name.trim(), cookNum: num.trim(), diet, protein }); onClose(); }} style={{ marginTop: 18 }} />
    </>
  );
}
