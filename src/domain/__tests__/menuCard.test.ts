import { buildMenuSections, headerIndex, matchesFilters, type MenuDish, NO_FILTERS, toRows } from '../menuCard';

let nextId = 1;
function dish(p: Partial<MenuDish> & { name: string }): MenuDish {
  return { id: nextId++, slots: ['lunch'], snack: false, veg: true, proteinG: 10, soak: false, active: true, ...p };
}

const poha = dish({ name: 'Poha', slots: ['breakfast'], proteinG: 8 });
const eggs = dish({ name: 'Egg Bhurji', slots: ['breakfast'], veg: false, proteinG: 21 });
const rajma = dish({ name: 'Rajma Chawal', slots: ['lunch', 'dinner'], proteinG: 16, soak: true });
const chicken = dish({ name: 'Chicken Curry', slots: ['dinner'], veg: false, proteinG: 34, active: false });
const tikki = dish({ name: 'Aloo Tikki', slots: [], snack: true, proteinG: 6 });
const all = [poha, eggs, rajma, chicken, tikki];

describe('buildMenuSections', () => {
  it('groups by meal in a fixed order, highest protein first', () => {
    const s = buildMenuSections(all);
    expect(s.map((x) => x.key)).toEqual(['breakfast', 'lunch', 'dinner', 'snacks']);
    expect(s[0].dishes.map((d) => d.name)).toEqual(['Egg Bhurji', 'Poha']);
    expect(s[2].dishes.map((d) => d.name)).toEqual(['Chicken Curry', 'Rajma Chawal']);
  });

  it('shows a multi-meal dish in each of its sections', () => {
    const s = buildMenuSections(all);
    expect(s.find((x) => x.key === 'lunch')?.dishes).toContain(rajma);
    expect(s.find((x) => x.key === 'dinner')?.dishes).toContain(rajma);
  });

  it('drops sections that end up empty', () => {
    const s = buildMenuSections(all, { ...NO_FILTERS, query: 'rajma' });
    expect(s.map((x) => x.key)).toEqual(['lunch', 'dinner']);
  });
});

describe('matchesFilters', () => {
  it('searches names case-insensitively', () => {
    expect(matchesFilters(rajma, { ...NO_FILTERS, query: 'RAJ' })).toBe(true);
    expect(matchesFilters(poha, { ...NO_FILTERS, query: 'raj' })).toBe(false);
  });
  it('veg / non-veg toggles, and both together show everything', () => {
    expect(matchesFilters(eggs, { ...NO_FILTERS, vegOnly: true })).toBe(false);
    expect(matchesFilters(poha, { ...NO_FILTERS, nonVegOnly: true })).toBe(false);
    expect(matchesFilters(eggs, { ...NO_FILTERS, vegOnly: true, nonVegOnly: true })).toBe(true);
  });
  it('high protein, soak and in-rotation filters', () => {
    expect(matchesFilters(eggs, { ...NO_FILTERS, highProtein: true })).toBe(true);
    expect(matchesFilters(rajma, { ...NO_FILTERS, highProtein: true })).toBe(false);
    expect(matchesFilters(rajma, { ...NO_FILTERS, soakOnly: true })).toBe(true);
    expect(matchesFilters(chicken, { ...NO_FILTERS, inRotationOnly: true })).toBe(false);
  });
});

describe('toRows / headerIndex', () => {
  it('pairs dishes two per row and skips collapsed sections', () => {
    const sections = buildMenuSections(all);
    const rows = toRows(sections, new Set(['lunch']));
    const lunchHeader = rows[headerIndex(rows, 'lunch')];
    expect(lunchHeader.type === 'header' && lunchHeader.collapsed).toBe(true);
    expect(rows.some((r) => r.type === 'pair' && r.section === 'lunch')).toBe(false);
    const breakfastPairs = rows.filter((r) => r.type === 'pair' && r.section === 'breakfast');
    expect(breakfastPairs).toHaveLength(1);
    expect(breakfastPairs[0].type === 'pair' && breakfastPairs[0].dishes).toHaveLength(2);
    expect(headerIndex(rows, 'snacks')).toBeGreaterThan(headerIndex(rows, 'dinner'));
  });
});
