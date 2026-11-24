import { defaultBuyMode, ingredientKey, soakIngredient, titleCase } from '../ingredients';

describe('ingredientKey', () => {
  it('lowercases, trims and applies aliases', () => {
    expect(ingredientKey('  Toor   Dal ')).toBe('toor dal');
    expect(ingredientKey('Wheat Flour (Atta)')).toBe('atta');
    expect(ingredientKey('Green Chilli')).toBe('green chili');
    expect(ingredientKey('semolina')).toBe('sooji');
  });
});

describe('defaultBuyMode', () => {
  it.each(['rice', 'toor dal', 'besan', 'Salt', 'Garam Masala', 'Cooking Oil', 'ghee', 'rajma', 'sambar powder', 'puffed rice', 'Mustard Seeds', 'soya chunks', 'yellow peas'])(
    '%s is bulk', (n) => expect(defaultBuyMode(n)).toBe('bulk'),
  );
  it.each(['tomato', 'onion', 'paneer', 'milk', 'eggs', 'chicken', 'spinach', 'peas', 'idli batter', 'moong sprouts', 'coriander', 'Green Chilli', 'coconut'])(
    '%s is weekly', (n) => expect(defaultBuyMode(n)).toBe('weekly'),
  );
});

describe('soakIngredient', () => {
  it('finds whole legumes', () => {
    expect(soakIngredient(['rajma', 'rice'])).toBe('rajma');
    expect(soakIngredient(['onion', 'chole'])).toBe('chole');
    expect(soakIngredient(['black dal', 'butter'])).toBe('black dal');
  });
  it('ignores split dals and everything else', () => {
    expect(soakIngredient(['chana dal', 'rice'])).toBeNull();
    expect(soakIngredient(['moong dal', 'toor dal'])).toBeNull();
    expect(soakIngredient([])).toBeNull();
  });
});

it('titleCase', () => expect(titleCase('toor dal')).toBe('Toor Dal'));
