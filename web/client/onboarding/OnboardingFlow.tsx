// Step-driven onboarding: welcome → cuisine → region → menu → review → kitchen.
import { useState } from 'react';
import { KITCHEN } from '../../shared/src/data/cuisines';
import { palette as c } from '../../shared/src/design/palette';
import { defaultPrefs } from '../../shared/src/lib/prefs';
import { useStore } from '../../shared/src/store';
import type { OnbSlot, Prefs } from '../../shared/src/types';
import { CuisineStep, KitchenStep, MenuStep, RegionStep, ReviewStep, WelcomeStep } from './steps';
import { Footer, StepHeader } from './ui';

const STEP_META = [
  { title: '', subtitle: '' }, // 0 = welcome (no header)
  { title: 'Which cuisines?', subtitle: 'Pick the styles of food you eat. You can choose more than one.' },
  { title: 'Your region', subtitle: 'Helps us suggest dishes closer to home. Optional.' },
  { title: 'Build your menu', subtitle: "Tap the dishes you like. Skip any meal you don't need." },
  { title: 'Your menu', subtitle: "Here's what we'll plan from — you can change anything later." },
  { title: 'Your kitchen', subtitle: "Staples are ticked already — untick anything you're out of." },
];
const TOTAL = 5;

function initPantry(): Record<string, boolean> {
  const p: Record<string, boolean> = {};
  KITCHEN.forEach((k) => { p[k.name] = k.category === 'staple'; });
  return p;
}

export function OnboardingFlow() {
  const { completeOnboarding } = useStore();

  const [step, setStep] = useState(0);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [menu, setMenu] = useState<Prefs['menu']>(defaultPrefs().menu);
  const [pantry, setPantry] = useState<Record<string, boolean>>(initPantry);

  const toggleIn = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const toggleMenu = (slot: OnbSlot, name: string) =>
    setMenu((m) => ({ ...m, [slot]: m[slot].includes(name) ? m[slot].filter((x) => x !== name) : [...m[slot], name] }));

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(0, s - 1));
  const finish = () => completeOnboarding({ authMode: 'guest', cuisines, regions, menu, pantry });

  const meta = STEP_META[step];

  return (
    <div className="app" style={{ background: c.bg, padding: 'var(--safe-top) 0 var(--safe-bottom)' }}>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', padding: '6px 20px 0' }}>
        {step === 0 ? (
          <WelcomeStep onStart={() => setStep(1)} />
        ) : (
          <>
            <div className="scroll" style={{ paddingBottom: 16 }}>
              <StepHeader step={step} total={TOTAL} title={meta.title} subtitle={meta.subtitle} />
              {step === 1 && <CuisineStep selected={cuisines} onToggle={(id) => setCuisines((a) => toggleIn(a, id))} />}
              {step === 2 && <RegionStep cuisines={cuisines} selected={regions} onToggle={(id) => setRegions((a) => toggleIn(a, id))} />}
              {step === 3 && <MenuStep cuisines={cuisines} menu={menu} onToggle={toggleMenu} />}
              {step === 4 && <ReviewStep menu={menu} />}
              {step === 5 && <KitchenStep pantry={pantry} onToggle={(name) => setPantry((p) => ({ ...p, [name]: !p[name] }))} />}
            </div>
            <Footer
              onBack={back}
              onSkip={step === 2 || step === 3 ? next : undefined}
              onNext={step === 5 ? finish : next}
              nextLabel={step === 5 ? 'Finish' : 'Continue'}
              nextDisabled={step === 1 && cuisines.length === 0}
            />
          </>
        )}
      </div>
    </div>
  );
}
