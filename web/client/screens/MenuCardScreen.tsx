// Menu card: search, quick filters, and dishes in a two-column photo grid grouped by
// meal, with a floating MENU button that jumps between meal sections.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getDb } from '../../shared/src/db/open';
import { type Dish, listDishes, rejectDishPhoto, setDishActive } from '../../shared/src/db/repo';
import { palette as p } from '../../shared/src/design/palette';
import {
  buildMenuSections, type MenuFilters, NO_FILTERS, type SectionKey, toRows,
} from '../../shared/src/domain/menuCard';
import { notifyPhotosUpdated, onPhotosUpdated } from '../../shared/src/lib/photoFiller';
import { markDishAdded } from '../../shared/src/lib/rotation';
import { DishTile } from '../components/DishTile';
import { Icon, type IconName } from '../components/Icon';
import { MenuFab } from '../components/MenuFab';
import { VegMark } from '../components/ui';
import { fillPhotos } from '../photos';
import { DishSheet } from '../sheets/DishSheet';

const GUTTER = 18;
const GAP = 14;

export function MenuCardScreen({ bottomInset }: { bottomInset: string }) {
  const listRef = useRef<HTMLDivElement>(null);

  const [dishes, setDishes] = useState<Dish[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MenuFilters>(NO_FILTERS);
  const [collapsed, setCollapsed] = useState<Set<SectionKey>>(new Set());
  const [openId, setOpenId] = useState<number | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = () => {
      getDb().then((db) => listDishes(db))
        .then((d) => { if (alive) setDishes(d); })
        .catch((e: unknown) => { if (alive) setError(String(e)); });
    };
    load();
    const off = onPhotosUpdated(load);
    return () => { alive = false; off(); };
  }, [reloadTick]);

  const sections = useMemo(() => buildMenuSections(dishes ?? [], filters), [dishes, filters]);
  const rows = useMemo(() => toRows(sections, collapsed), [sections, collapsed]);
  const inRotation = useMemo(() => (dishes ?? []).filter((d) => d.active).length, [dishes]);

  const toggleActive = useCallback((dish: Dish) => {
    const next = !dish.active;
    // Optimistic update so the button flips instantly.
    setDishes((list) => list?.map((d) => (d.id === dish.id ? { ...d, active: next } : d)) ?? list);
    markDishAdded(dish.name, next);
    getDb().then((db) => setDishActive(db, dish.id, next)).catch(() => {
      setDishes((list) => list?.map((d) => (d.id === dish.id ? { ...d, active: dish.active } : d)) ?? list);
    });
  }, []);

  const wrongPhoto = useCallback((dish: Dish) => {
    const ok = window.confirm(`Wrong photo?\n\nRasoi will drop this photo of ${dish.name} and look for a better match. If none fits, the dish shows without a photo.`);
    if (!ok) return;
    getDb()
      .then(async (db) => {
        await rejectDishPhoto(db, dish.id);
        notifyPhotosUpdated();
        await fillPhotos(db, { maxDishes: 3 });
      })
      .catch(() => {});
  }, []);

  const toggleSection = (key: SectionKey) => {
    setCollapsed((s) => {
      const n = new Set(s);
      if (n.has(key)) n.delete(key); else n.add(key);
      return n;
    });
  };

  const jumpTo = (key: SectionKey) => {
    if (collapsed.has(key)) setCollapsed((s) => { const n = new Set(s); n.delete(key); return n; });
    // Wait a frame so an expanded section is laid out before scrolling.
    requestAnimationFrame(() => {
      const list = listRef.current;
      const header = list?.querySelector<HTMLElement>(`[data-section="${key}"]`);
      if (list && header) list.scrollTo({ top: header.offsetTop - 4, behavior: 'smooth' });
    });
  };

  const set = (patch: Partial<MenuFilters>) => setFilters((f) => ({ ...f, ...patch }));

  if (error) return <p style={{ color: p.nonVeg, padding: GUTTER }}>{`Couldn't open the menu card: ${error}`}</p>;
  if (!dishes) return null;

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Search */}
      <div style={{ padding: `8px ${GUTTER}px 0` }}>
        <label style={{ display: 'flex', alignItems: 'center', background: p.surface2, borderRadius: 14, padding: '0 14px', height: 48 }}>
          <Icon name="search" size={18} color={p.inkSoft} />
          <input
            type="search"
            enterKeyHint="search"
            value={filters.query}
            onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
            placeholder={`Search ${dishes.length} dishes`}
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            style={{ flex: 1, minWidth: 0, marginLeft: 10, color: p.ink, fontSize: 15, border: 0, background: 'transparent', padding: 0, WebkitAppearance: 'none' }}
          />
          {filters.query ? (
            <button type="button" aria-label="Clear search" onClick={() => setFilters((f) => ({ ...f, query: '' }))} style={{ padding: 4 }}>
              <Icon name="close-circle" size={18} color={p.inkFaint} />
            </button>
          ) : null}
        </label>
      </div>

      {/* Filters */}
      <div className="hscroll" style={{ padding: `12px ${GUTTER}px`, gap: 8, flexShrink: 0 }}>
        <ToggleChip veg on={filters.vegOnly} onPress={() => set({ vegOnly: !filters.vegOnly })} />
        <ToggleChip veg={false} on={filters.nonVegOnly} onPress={() => set({ nonVegOnly: !filters.nonVegOnly })} />
        <TextChip icon="flame" label="High protein" on={filters.highProtein} onPress={() => set({ highProtein: !filters.highProtein })} />
        <TextChip icon="water" label="Soak" on={filters.soakOnly} onPress={() => set({ soakOnly: !filters.soakOnly })} />
        <TextChip icon="checkmark-circle" label={`Added (${inRotation})`} on={filters.inRotationOnly} onPress={() => set({ inRotationOnly: !filters.inRotationOnly })} />
        <span style={{ flex: '0 0 1px' }} />
      </div>
      <div style={{ height: 1, background: p.line, flexShrink: 0 }} />

      {rows.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 60, paddingLeft: 30, paddingRight: 30 }}>
          <span style={{ fontSize: 34 }}>🔍</span>
          <span style={{ color: p.ink, fontSize: 16, fontWeight: 600, marginTop: 8 }}>No dishes match</span>
          <span style={{ color: p.inkSoft, fontSize: 13, marginTop: 4, textAlign: 'center' }}>Try another search or turn off a filter.</span>
        </div>
      ) : (
        <div ref={listRef} className="scroll" style={{ position: 'relative', paddingBottom: `calc(${bottomInset} + 40px)` }}>
          {rows.map((item) => item.type === 'header' ? (
            <button
              key={item.key}
              type="button"
              data-section={item.section.key}
              onClick={() => toggleSection(item.section.key)}
              aria-expanded={!item.collapsed}
              style={{ display: 'flex', width: '100%', alignItems: 'center', padding: `22px ${GUTTER}px 14px` }}
            >
              <span style={{ flex: 1, color: p.ink, fontSize: 19, fontWeight: 700 }}>{`${item.section.title} (${item.section.dishes.length})`}</span>
              <Icon name={item.collapsed ? 'chevron-down' : 'chevron-up'} size={20} color={p.ink} />
            </button>
          ) : (
            <div key={item.key} className="fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: GAP, padding: `0 ${GUTTER}px 22px` }}>
              {item.dishes.map((d) => (
                <DishTile key={d.id} dish={d} placeholderEmoji={emojiFor(item.section)} onToggle={toggleActive} onWrongPhoto={wrongPhoto} onOpen={(x) => setOpenId(x.id)} />
              ))}
            </div>
          ))}
        </div>
      )}

      <DishSheet
        dish={dishes.find((d) => d.id === openId) ?? null}
        onClose={() => setOpenId(null)}
        onChanged={() => setReloadTick((t) => t + 1)}
        onToggle={toggleActive}
      />

      <MenuFab
        bottom="calc(max(var(--safe-bottom), 12px) + 4px + 64px)"
        categories={sections.map((s) => ({ key: s.key, title: s.title, emoji: s.emoji, count: s.dishes.length }))}
        onPick={jumpTo}
      />
    </div>
  );
}

function emojiFor(key: SectionKey): string {
  return key === 'breakfast' ? '🍳' : key === 'lunch' ? '🍛' : key === 'dinner' ? '🍲' : '🥟';
}

/** Veg / non-veg filter: the food mark plus a small switch track. */
function ToggleChip({ veg, on, onPress }: { veg: boolean; on: boolean; onPress: () => void }) {
  const tone = veg ? p.veg : p.nonVeg;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={veg ? 'Veg only' : 'Non-veg only'}
      onClick={onPress}
      style={{ display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 12px', borderRadius: 8, border: `1px solid ${on ? tone : p.line}`, background: p.surface, flexShrink: 0 }}
    >
      <VegMark veg={veg} size={16} />
      <span style={{ width: 30, height: 12, borderRadius: 99, background: on ? tone : p.surface2, display: 'flex', alignItems: 'center', padding: '0 2px', justifyContent: on ? 'flex-end' : 'flex-start', transition: 'background 150ms' }}>
        <span style={{ width: 8, height: 8, borderRadius: 99, background: p.white }} />
      </span>
    </button>
  );
}

function TextChip({ icon, label, on, onPress }: { icon: IconName; label: string; on: boolean; onPress: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onPress}
      style={{ display: 'flex', alignItems: 'center', gap: 5, height: 36, padding: '0 12px', borderRadius: 8, border: `1px solid ${on ? p.brand : p.line}`, background: on ? p.brandSoft : p.surface, flexShrink: 0, whiteSpace: 'nowrap' }}
    >
      <Icon name={icon} size={14} color={on ? p.brand : p.inkSoft} />
      <span style={{ color: on ? p.brandInk : p.ink, fontSize: 13.5, fontWeight: 500 }}>{label}</span>
    </button>
  );
}
