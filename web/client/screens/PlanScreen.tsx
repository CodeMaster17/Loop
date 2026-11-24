// Plan tab: the whole week, today first. Each day is a row of three photo cards
// (breakfast, lunch, dinner) with the day's protein against your target and a
// button to send that day's menu to the cook.
import { palette as p } from '../../shared/src/design/palette';
import { averageProtein, planDays } from '../../shared/src/domain/planDays';
import { useDishPhotos } from '../../shared/src/hooks/useDishPhotos';
import { dayProtein } from '../../shared/src/lib/plan';
import { useStore } from '../../shared/src/store';
import type { DayPlan, Slot } from '../../shared/src/types';
import { MealPhotoCard } from '../components/MealPhotoCard';
import { Btn } from '../components/ui';

const GUTTER = 18;
const GAP = 10;
const SLOTS: { slot: Slot; label: 'BREAKFAST' | 'LUNCH' | 'DINNER' }[] = [
  { slot: 'breakfast', label: 'BREAKFAST' },
  { slot: 'lunch', label: 'LUNCH' },
  { slot: 'dinner', label: 'DINNER' },
];

export function PlanScreen({ onSend }: { onSend: (key: string) => void }) {
  const { store, swapAt, planWeek } = useStore();
  const photos = useDishPhotos();
  const target = store.settings.protein;

  const days = planDays(new Date(), 7).filter((d) => store.plan[d.key]);
  const avg = averageProtein(days.map((d) => dayProtein(store.plan[d.key])));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: `0 ${GUTTER}px` }}>
        <h2 style={{ color: p.ink, fontSize: 22, fontWeight: 700 }}>This week</h2>
        <span style={{ color: p.inkSoft, fontSize: 13 }}>{`~${avg} g protein / day`}</span>
      </div>

      {days.map((d) => {
        const plan = store.plan[d.key] as DayPlan;
        const total = dayProtein(plan);
        const met = total >= target;
        return (
          <section key={d.key} style={{ marginTop: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: `0 ${GUTTER}px`, marginBottom: 10, gap: 8 }}>
              <span style={{ color: d.isToday ? p.brand : p.ink, fontSize: 18, fontWeight: 700 }}>{d.label}</span>
              <span style={{ color: p.inkFaint, fontSize: 13, flex: 1 }}>{d.sub}</span>
              <span style={{ background: met ? p.vegSoft : p.brandSoft, borderRadius: 99, padding: '3px 9px', color: met ? p.vegDeep : p.brandInk, fontSize: 12, fontWeight: 700 }}>
                {`${total}/${target} g`}
              </span>
              <Btn kind="wa" size="sm" icon="logo-whatsapp" label="Send" onPress={() => onSend(d.key)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: GAP, padding: `0 ${GUTTER}px` }}>
              {SLOTS.map((s) => (
                <MealPhotoCard
                  key={s.slot}
                  slotLabel={s.label}
                  meal={plan[s.slot]}
                  photo={photos[plan[s.slot].name.toLowerCase()]}
                  onSwap={() => swapAt(d.key, s.slot)}
                />
              ))}
            </div>
          </section>
        );
      })}

      <div style={{ padding: `0 ${GUTTER}px`, marginTop: 26 }}>
        <Btn label="Re-plan the whole week" kind="primary" icon="shuffle" onPress={planWeek} />
      </div>

      <p style={{ color: p.inkWhisper, fontSize: 10.5, textAlign: 'center', marginTop: 28 }}>
        Food photos from Unsplash and Wikimedia Commons · credited on the Menu card
      </p>
    </div>
  );
}
