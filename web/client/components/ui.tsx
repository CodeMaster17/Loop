// Shared UI primitives, matching src/components/ui.tsx: veg mark, buttons, bottom sheet.
'use client';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { palette as p } from '../../shared/src/design/palette';
import { Icon, type IconName } from './Icon';

/** The Indian veg / non-veg mark: green dot in a square, or a red triangle. */
export function VegMark({ veg, size = 15 }: { veg: boolean; size?: number }) {
  const tone = veg ? p.veg : p.nonVeg;
  return (
    <span
      role="img"
      aria-label={veg ? 'Veg' : 'Non-veg'}
      style={{ width: size, height: size, borderRadius: 3, border: `1.6px solid ${tone}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
    >
      {veg ? (
        <span style={{ width: size * 0.42, height: size * 0.42, borderRadius: 99, background: tone }} />
      ) : (
        <span style={{ width: 0, height: 0, borderLeft: `${size * 0.26}px solid transparent`, borderRight: `${size * 0.26}px solid transparent`, borderBottom: `${size * 0.44}px solid ${tone}` }} />
      )}
    </span>
  );
}

type BtnKind = 'plain' | 'primary' | 'wa';

function btnStyle(kind: BtnKind, small: boolean): React.CSSProperties {
  const filled = kind !== 'plain';
  const bg = kind === 'primary' ? p.brand : kind === 'wa' ? p.waButton : p.surface;
  return {
    height: small ? 34 : 50, borderRadius: small ? 8 : 12, padding: `0 ${small ? 12 : 18}px`,
    display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: small ? 5 : 8,
    background: bg, border: filled ? 'none' : `1px solid ${p.line}`, color: filled ? p.white : p.ink,
    boxShadow: filled ? `0 4px 10px ${bg}47` : '0 1px 4px rgba(0,0,0,0.04)',
    fontSize: small ? 13 : 15, fontWeight: 700, whiteSpace: 'nowrap', width: '100%',
  };
}

/** Button. kind: plain (white, outlined), primary (brand orange) or wa (WhatsApp green). 12px corners. */
export function Btn({ label, onPress, kind = 'plain', icon, size = 'md', style, href }: {
  label: string;
  onPress?: () => void;
  kind?: BtnKind;
  icon?: IconName;
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
  /** Render as a link (used for WhatsApp so iOS hands it straight to the app). */
  href?: string;
}) {
  const small = size === 'sm';
  const fg = kind !== 'plain' ? p.white : p.ink;
  const inner = (
    <>
      {icon ? <Icon name={icon} size={small ? 15 : 19} color={fg} /> : null}
      <span>{label}</span>
    </>
  );
  const s = { ...btnStyle(kind, small), ...(small ? { width: 'auto' } : null) };
  return (
    <div style={style}>
      {href ? (
        <a className="press" href={href} target="_blank" rel="noopener noreferrer" onClick={onPress} style={s} aria-label={label}>{inner}</a>
      ) : (
        <button type="button" className="press" onClick={onPress} style={s} aria-label={label}>{inner}</button>
      )}
    </div>
  );
}

/** iOS-style on/off switch. */
export function Switch({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return <button type="button" role="switch" aria-checked={value} aria-label={label} className="switch" onClick={() => onChange(!value)} />;
}

/** Bottom sheet that sizes to its content; drag the handle down or tap outside to close. */
export function Sheet({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const [drag, setDrag] = useState(0);
  const [keyboard, setKeyboard] = useState(0);
  const startY = useRef<number | null>(null);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(id);
    }
    setShown(false);
    const t = setTimeout(() => setMounted(false), 260);
    return () => clearTimeout(t);
  }, [visible]);

  // Keep the sheet above the on-screen keyboard (iOS doesn't resize the page for it).
  useEffect(() => {
    const vv = window.visualViewport;
    if (!mounted || !vv) return;
    const update = () => setKeyboard(Math.max(0, window.innerHeight - vv.height - vv.offsetTop));
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();
    return () => { vv.removeEventListener('resize', update); vv.removeEventListener('scroll', update); };
  }, [mounted]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, onClose]);

  if (!mounted) return null;
  const offset = shown ? drag : 1000;
  return createPortal(
    <>
      <div className="sheet-overlay" style={{ opacity: shown ? 1 : 0, transition: 'opacity 200ms' }} onClick={onClose} />
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        style={{ transform: `translateY(${offset}px)`, transition: startY.current !== null ? 'none' : undefined, bottom: keyboard }}
      >
        <div
          className="sheet-handle-area"
          onTouchStart={(e) => { startY.current = e.touches[0].clientY; }}
          onTouchMove={(e) => { if (startY.current !== null) setDrag(Math.max(0, e.touches[0].clientY - startY.current)); }}
          onTouchEnd={() => {
            const d = drag;
            startY.current = null;
            setDrag(0);
            if (d > 80) onClose();
          }}
        >
          <div className="sheet-handle" />
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </>,
    document.body,
  );
}
