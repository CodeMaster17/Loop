import { coreDishName, matchWords, photoQuery, pickBest, toPickedPhoto, type UnsplashResult } from '../photoPick';

function result(id: string, alt: string): UnsplashResult {
  return {
    id,
    alt_description: alt,
    description: null,
    urls: { small: `https://images.unsplash.com/${id}?w=400`, thumb: `https://images.unsplash.com/${id}?w=200` },
    links: { html: `https://unsplash.com/photos/${id}`, download_location: `https://api.unsplash.com/photos/${id}/download` },
    user: { name: 'Test Photographer', links: { html: 'https://unsplash.com/@tester' } },
  };
}

describe('coreDishName / photoQuery', () => {
  it('drops sides, counts and punctuation', () => {
    expect(coreDishName('Idli + Sambar (3)')).toBe('idli');
    expect(coreDishName('Palak Paneer + 2 Roti')).toBe('palak paneer');
    expect(coreDishName('Moong Dal Chilla (2)')).toBe('moong dal chilla');
  });
  it('uses better search words for known dishes', () => {
    expect(photoQuery('Chole + Rice')).toBe('chana masala');
    expect(photoQuery('Poha with peanuts')).toBe('poha with peanuts');
  });
});

describe('matchWords', () => {
  it('adds synonyms and drops serving words', () => {
    expect(matchWords('Chole + Rice')).toEqual(expect.arrayContaining(['chole', 'chana', 'chickpea']));
    expect(matchWords('Palak Paneer + 2 Roti')).toEqual(expect.arrayContaining(['palak', 'spinach', 'paneer']));
    expect(matchWords('Poha with peanuts')).not.toContain('with');
  });
});

// Descriptions below are what Unsplash actually returned in testing.
describe('pickBest', () => {
  it('skips an off-topic first result (idli -> dumplings, not bread)', () => {
    const r = pickBest([
      result('bread', 'sliced bread on green table'),
      result('idli', 'a white plate topped with three dumplings and a bowl of sauce'),
    ], 'Idli + Sambar (3)');
    expect(r?.id).toBe('idli');
  });

  it('finds chana masala for chole', () => {
    const r = pickBest([
      result('market', 'Vendor weighing items at a vibrant street market'),
      result('chana', 'A bowl of chana masala garnished with cilantro and ginger'),
    ], 'Chole + Rice');
    expect(r?.id).toBe('chana');
  });

  it('returns null rather than a wrong photo', () => {
    expect(pickBest([
      result('legumes', 'Six piles of various dried legumes arranged in a field'),
      result('corn', 'a close up of a pile of corn'),
    ], 'Moong Dal Chilla (2)')).toBeNull();
  });

  it('prefers the result matching more words', () => {
    const r = pickBest([
      result('spinach-only', 'a bowl of spinach soup'),
      result('palak-paneer', 'palak paneer with spinach gravy and paneer cubes'),
    ], 'Palak Paneer + 2 Roti');
    expect(r?.id).toBe('palak-paneer');
  });

  it('rejects a photo that visibly shows a different dish (dal makhani for Rajma Chawal)', () => {
    const dalMakhani = { ...result('dm', 'A bowl of dal makhani with rice, onion salad, and flatbread'), description: 'Rich dal with rajma' };
    expect(pickBest([dalMakhani], 'Rajma Chawal + salad')).toBeNull();
  });

  it('skips photos the user rejected', () => {
    const a = { ...result('a', 'a plate of food'), description: 'Rajma Chawal' };
    const b = result('b', 'rajma curry with steamed rice');
    expect(pickBest([a, b], 'Rajma Chawal + salad')?.id).toBe('b');
    expect(pickBest([a, b], 'Rajma Chawal + salad', ['b'])?.id).toBe('a');
    expect(pickBest([a, b], 'Rajma Chawal + salad', ['a', 'b'])).toBeNull();
  });

  it('requires the main dish word, not just a side', () => {
    expect(pickBest([result('r', 'a bowl of steamed rice')], 'Rajma Chawal + salad')).toBeNull();
  });

  it('handles no results', () => {
    expect(pickBest([], 'Poha with peanuts')).toBeNull();
  });
});

describe('toPickedPhoto', () => {
  it('asks Unsplash for a sharper 640px square when the raw URL is available', () => {
    const r = { ...result('raw1', 'poha'), urls: { small: 's', thumb: 't', raw: 'https://images.unsplash.com/photo-1?ixid=abc' } };
    expect(toPickedPhoto(r).url).toBe('https://images.unsplash.com/photo-1?ixid=abc&w=640&h=640&fit=crop&crop=entropy&q=80&auto=format');
  });

  it('keeps Unsplash URLs and tags credit links with utm parameters', () => {
    const p = toPickedPhoto(result('abc', 'poha'));
    expect(p.url).toBe('https://images.unsplash.com/abc?w=400');
    expect(p.authorUrl).toBe('https://unsplash.com/@tester?utm_source=rasoi&utm_medium=referral');
    expect(p.pageUrl).toBe('https://unsplash.com/photos/abc?utm_source=rasoi&utm_medium=referral');
    expect(p.downloadLocation).toBe('https://api.unsplash.com/photos/abc/download');
  });
});
