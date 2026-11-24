import { LIB } from '../../data';
import { DISHES, KITCHEN } from '../../data/cuisines';
import { groceryIconFor } from '../groceryIcons';

describe('groceryIconFor', () => {
  it('maps common items to their own icon', () => {
    expect(groceryIconFor('tomato')).toBe('tomato');
    expect(groceryIconFor('Paneer')).toBe('paneer');
    expect(groceryIconFor('curd')).toBe('yogurt');
    expect(groceryIconFor('rajma')).toBe('red-beans');
    expect(groceryIconFor('chole')).toBe('chickpea');
  });

  it('groups dals, flours and masalas', () => {
    expect(groceryIconFor('toor dal')).toBe('lentils');
    expect(groceryIconFor('moong dal')).toBe('lentils');
    expect(groceryIconFor('Wheat Flour (Atta)')).toBe('flour');
    expect(groceryIconFor('besan')).toBe('flour');
    expect(groceryIconFor('Garam Masala')).toBe('spice-blends');
    expect(groceryIconFor('Green Chilli')).toBe('chili-pepper');
  });

  it('has an icon for every ingredient and kitchen item in the built-in data', () => {
    const names = new Set<string>();
    DISHES.forEach((d) => d.i.forEach((i) => names.add(i)));
    LIB.forEach((d) => d.i.forEach((i) => names.add(i)));
    KITCHEN.forEach((k) => names.add(k.name));
    const missing = [...names].filter((n) => groceryIconFor(n) === null);
    expect(missing).toEqual([]);
  });
});
