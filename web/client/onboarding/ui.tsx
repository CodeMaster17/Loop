// Shared onboarding UI: progress header, selectable cards/pills, and the footer nav.
import { palette as c } from '../../shared/src/design/palette';

export function StepHeader({ step, total, title, subtitle }: { step: number; total: number; title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {Array.from({ length: total }, (_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i < step ? c.brand : c.line }} />
        ))}
      </div>
      <h1 style={{ color: c.ink, fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>{title}</h1>
      {subtitle ? <p style={{ color: c.inkSoft, fontSize: 14, marginTop: 6, lineHeight: '20px' }}>{subtitle}</p> : null}
    </div>
  );
}

export function OptionCard({ label, emoji, sub, selected, onPress }: {
  label: string;
  emoji?: string;
  sub?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onPress}
      style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, border: `1.5px solid ${selected ? c.brand : c.line}`, background: selected ? c.surface2 : c.surface }}
    >
      {emoji ? <span style={{ fontSize: 22 }}>{emoji}</span> : null}
      <span style={{ flex: 1 }}>
        <span style={{ display: 'block', color: c.ink, fontSize: 15.5, fontWeight: 600 }}>{label}</span>
        {sub ? <span style={{ display: 'block', color: c.inkFaint, fontSize: 12.5, marginTop: 2 }}>{sub}</span> : null}
      </span>
      <span style={{ width: 22, height: 22, borderRadius: 99, border: `2px solid ${selected ? c.brand : c.line}`, background: selected ? c.brand : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {selected ? <span style={{ color: '#fff', fontSize: 12, fontWeight: 800 }}>✓</span> : null}
      </span>
    </button>
  );
}

export function SelectPill({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onPress}
      style={{ padding: '10px 14px', borderRadius: 99, border: `1.5px solid ${selected ? c.brand : c.line}`, background: selected ? c.brand : c.surface, color: selected ? c.white : c.ink, fontSize: 13.5, fontWeight: 600 }}
    >
      {label}
    </button>
  );
}

export function Footer({ onBack, onSkip, onNext, nextLabel = 'Continue', nextDisabled }: {
  onBack?: () => void;
  onSkip?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 12, paddingBottom: 4 }}>
      {onBack ? (
        <button type="button" onClick={onBack} style={{ padding: '14px 18px', borderRadius: 12, border: `1px solid ${c.line}`, background: c.surface, color: c.inkSoft, fontWeight: 600, fontSize: 14 }}>Back</button>
      ) : null}
      {onSkip ? (
        <button type="button" onClick={onSkip} style={{ padding: '14px 12px', color: c.inkFaint, fontWeight: 600, fontSize: 14 }}>Skip</button>
      ) : null}
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        style={{ flex: 1, padding: '14px 0', borderRadius: 12, textAlign: 'center', background: nextDisabled ? c.line : c.brand, color: nextDisabled ? c.inkFaint : c.white, fontWeight: 700, fontSize: 15, cursor: nextDisabled ? 'default' : 'pointer' }}
      >
        {nextLabel}
      </button>
    </div>
  );
}
