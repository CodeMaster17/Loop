// Pure logic for the Menu card screen: filter dishes and group them into meal sections.
import type { Slot } from '../types';

export interface MenuDish {
  id: number;
  name: string;
  slots: Slot[];
  snack: boolean;
  veg: boolean;
  proteinG: number;
  soak: boolean;
  active: boolean;
}

export interface MenuFilters {
  query: string;
  vegOnly: boolean;
  nonVegOnly: boolean;
  highProtein: boolean;
  soakOnly: boolean;
  inRotationOnly: boolean;
}

export const NO_FILTERS: MenuFilters = {
  query: '', vegOnly: false, nonVegOnly: false, highProtein: false, soakOnly: false, inRotationOnly: false,
};

/** Grams of protein per serving that count as "high protein". */
export const HIGH_PROTEIN_G = 20;

export type SectionKey = Slot | 'snacks';

export interface MenuSection<D extends MenuDish = MenuDish> {
  key: SectionKey;
  title: string;
  emoji: string;
  dishes: D[];
}

const SECTIONS: { key: SectionKey; title: string; emoji: string }[] = [
  { key: 'breakfast', title: 'Breakfast', emoji: '🌅' },
  { key: 'lunch', title: 'Lunch', emoji: '🍛' },
  { key: 'dinner', title: 'Dinner', emoji: '🌙' },
  { key: 'snacks', title: 'Evening snacks', emoji: '☕' },
];

export function matchesFilters(d: MenuDish, f: MenuFilters): boolean {
  const q = f.query.trim().toLowerCase();
  if (q && !d.name.toLowerCase().includes(q)) return false;
  // Both veg and non-veg toggles on means "show both".
  if (f.vegOnly && !f.nonVegOnly && !d.veg) return false;
  if (f.nonVegOnly && !f.vegOnly && d.veg) return false;
  if (f.highProtein && d.proteinG < HIGH_PROTEIN_G) return false;
  if (f.soakOnly && !d.soak) return false;
  if (f.inRotationOnly && !d.active) return false;
  return true;
}

function inSection(d: MenuDish, key: SectionKey): boolean {
  return key === 'snacks' ? d.snack : d.slots.includes(key);
}

/**
 * Meal sections in a fixed order, each sorted by protein (highest first).
 * A dish suited to several meals appears in each. Empty sections are left out.
 */
export function buildMenuSections<D extends MenuDish>(dishes: D[], f: MenuFilters = NO_FILTERS): MenuSection<D>[] {
  const visible = dishes.filter((d) => matchesFilters(d, f));
  return SECTIONS
    .map((s) => ({
      ...s,
      dishes: visible
        .filter((d) => inSection(d, s.key))
        .sort((a, b) => b.proteinG - a.proteinG || a.name.localeCompare(b.name)),
    }))
    .filter((s) => s.dishes.length > 0);
}

export type MenuRow<D extends MenuDish = MenuDish> =
  | { type: 'header'; key: string; section: MenuSection<D>; collapsed: boolean }
  | { type: 'pair'; key: string; section: SectionKey; dishes: [D] | [D, D] };

/** Flatten sections into list rows: a header, then dishes two per row (unless collapsed). */
export function toRows<D extends MenuDish>(sections: MenuSection<D>[], collapsed: Set<SectionKey>): MenuRow<D>[] {
  const rows: MenuRow<D>[] = [];
  for (const s of sections) {
    const isCollapsed = collapsed.has(s.key);
    rows.push({ type: 'header', key: `h-${s.key}`, section: s, collapsed: isCollapsed });
    if (isCollapsed) continue;
    for (let i = 0; i < s.dishes.length; i += 2) {
      const pair = (s.dishes[i + 1] ? [s.dishes[i], s.dishes[i + 1]] : [s.dishes[i]]) as [D] | [D, D];
      rows.push({ type: 'pair', key: `${s.key}-${s.dishes[i].id}`, section: s.key, dishes: pair });
    }
  }
  return rows;
}

/** Index of each section's header row, for "jump to section". */
export function headerIndex<D extends MenuDish>(rows: MenuRow<D>[], key: SectionKey): number {
  return rows.findIndex((r) => r.type === 'header' && r.section.key === key);
}
