import { collectSeedDishes } from '../../db/seed';
import { dishImage, hasBundledPhoto, sharperUnsplash } from '../dishImage';

describe('bundled dish photos', () => {
  it('every built-in dish has a bundled photo with a credit', () => {
    const missing = collectSeedDishes().map((d) => d.name).filter((n) => !hasBundledPhoto(n));
    expect(missing).toEqual([]);
    const img = dishImage('Rajma Chawal + salad');
    expect(img?.credit.kind).toBe('commons');
    expect(img?.credit.kind === 'commons' && img.credit.license).toMatch(/CC|Public/);
  });

  it('prefers an Unsplash photo over the bundled one', () => {
    const img = dishImage('Rajma Chawal + salad', { url: 'https://images.unsplash.com/r', thumbUrl: 't', author: 'A', authorUrl: 'au', pageUrl: 'p' });
    expect(img?.credit.kind).toBe('unsplash');
    expect(img?.source).toEqual({ uri: 'https://images.unsplash.com/r' });
  });

  it('uses the Unsplash photo for dishes without a bundled one', () => {
    const img = dishImage('My New Dish', { url: 'https://images.unsplash.com/x', thumbUrl: 't', author: 'A', authorUrl: 'au', pageUrl: 'p' });
    expect(img?.credit).toEqual({ kind: 'unsplash', author: 'A', authorUrl: 'au' });
    expect(dishImage('My New Dish')).toBeUndefined();
  });
});

it('upgrades saved 400px Unsplash URLs to 640px', () => {
  expect(sharperUnsplash('https://images.unsplash.com/photo-1?ixid=a&fm=jpg&q=80&w=400')).toBe('https://images.unsplash.com/photo-1?ixid=a&fm=jpg&q=80&w=640');
  expect(sharperUnsplash('https://images.unsplash.com/photo-1?w=400&ixid=a')).toBe('https://images.unsplash.com/photo-1?w=640&ixid=a');
  expect(sharperUnsplash('https://example.com/a?w=400')).toBe('https://example.com/a?w=400');
});
