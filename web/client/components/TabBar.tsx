// Floating black pill tab bar with a sliding white highlight.
import { palette as p } from '../../shared/src/design/palette';
import { Icon, type IconName } from './Icon';

export interface TabDef<K extends string> {
  key: K;
  label: string;
  icon: IconName;
  iconActive: IconName;
}

const PAD = 6;

export function TabBar<K extends string>({ tabs, active, onChange }: { tabs: TabDef<K>[]; active: K; onChange: (k: K) => void }) {
  const index = Math.max(0, tabs.findIndex((t) => t.key === active));
  return (
    <nav
      style={{ position: 'absolute', left: 16, right: 16, bottom: 'calc(max(var(--safe-bottom), 12px) + 4px)', display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 20 }}
    >
      <div role="tablist" style={{ position: 'relative', display: 'flex', width: '100%', maxWidth: 420, background: p.bar, borderRadius: 999, padding: PAD, boxShadow: '0 8px 16px rgba(0,0,0,0.22)', pointerEvents: 'auto' }}>
        <div
          aria-hidden
          style={{
            position: 'absolute', top: PAD, bottom: PAD, left: PAD, width: `calc((100% - ${PAD * 2}px) / ${tabs.length})`,
            borderRadius: 999, background: p.white, transform: `translateX(${index * 100}%)`,
            transition: 'transform 380ms cubic-bezier(.3,1.25,.45,1)',
          }}
        />
        {tabs.map((t) => {
          const on = t.key === active;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={on}
              aria-label={t.label}
              onClick={() => { if (!on) onChange(t.key); }}
              style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '7px 0', gap: 1 }}
            >
              <Icon name={on ? t.iconActive : t.icon} size={20} color={on ? p.brand : p.barIdle} />
              <span className="clamp1" style={{ fontSize: 10.5, fontWeight: 600, color: on ? p.ink : p.barIdle, transition: 'color 200ms' }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
