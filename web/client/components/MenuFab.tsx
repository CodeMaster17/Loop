// Floating "MENU" button (bottom right). Opens a dark list of meal categories with
// counts; tapping one jumps the Menu card to that section.
import { useState } from 'react';
import { palette as p } from '../../shared/src/design/palette';
import type { SectionKey } from '../../shared/src/domain/menuCard';
import { Icon } from './Icon';

export interface FabCategory {
  key: SectionKey;
  title: string;
  emoji: string;
  count: number;
}

/** `bottom` is a CSS length for the button's resting position. */
export function MenuFab({ categories, bottom, onPick }: { categories: FabCategory[]; bottom: string; onPick: (key: SectionKey) => void }) {
  const [open, setOpen] = useState(false);
  if (categories.length === 0) return null;

  return (
    <>
      {open ? (
        <button type="button" aria-label="Close menu" className="fade-in" onClick={() => setOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(20,20,30,0.35)', zIndex: 30 }} />
      ) : null}

      {open ? (
        <div
          className="zoom-in"
          style={{
            position: 'absolute', right: 18, bottom: `calc(${bottom} + 84px)`, width: 250, borderRadius: 20, zIndex: 31,
            background: p.bar, padding: '10px 0', boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
          }}
        >
          {categories.map((c) => (
            <button
              key={c.key}
              type="button"
              className="press-dim"
              onClick={() => { setOpen(false); onPick(c.key); }}
              style={{ display: 'flex', width: '100%', alignItems: 'center', padding: '12px 18px' }}
            >
              <span style={{ fontSize: 16, marginRight: 10 }}>{c.emoji}</span>
              <span style={{ flex: 1, color: p.white, fontSize: 15, fontWeight: 600 }}>{c.title}</span>
              <span style={{ color: p.barIdle, fontSize: 14, fontWeight: 600 }}>{c.count}</span>
            </button>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        className="press"
        aria-label={open ? 'Close menu categories' : 'Open menu categories'}
        onClick={() => setOpen((o) => !o)}
        style={{
          position: 'absolute', right: 18, bottom: `calc(${bottom} + 8px)`, zIndex: 31,
          width: 68, height: 68, borderRadius: 34, background: p.bar, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 12px rgba(0,0,0,0.28)',
        }}
      >
        <Icon name={open ? 'close' : 'restaurant'} size={22} color={p.white} />
        <span style={{ color: p.white, fontSize: 10, fontWeight: 700, letterSpacing: 0.8, marginTop: 1 }}>{open ? 'CLOSE' : 'MENU'}</span>
      </button>
    </>
  );
}
