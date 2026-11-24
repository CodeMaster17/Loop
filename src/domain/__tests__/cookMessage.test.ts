import { buildCookMessage, type CookMessageInput, defaultPart } from '../cookMessage';

const base: CookMessageInput = {
  dayLabel: 'Tomorrow',
  dateSub: '13 Nov',
  cookName: 'Didi',
  lang: 'english',
  part: 'morning',
  meals: { breakfast: 'Poha with peanuts', lunch: 'Chole + Rice', dinner: 'Palak Paneer + 2 Roti' },
  videos: { 'chole + rice': 'https://youtu.be/AAAAAAAAAAA' },
  emoji: true,
};

describe('buildCookMessage', () => {
  it('morning message: breakfast and lunch only, with the recipe link under its dish', () => {
    expect(buildCookMessage(base)).toBe([
      'Hi Didi 🙏',
      "Tomorrow's breakfast & lunch (13 Nov):",
      '',
      '🌅 Breakfast: Poha with peanuts',
      '🍛 Lunch: Chole + Rice',
      '▶️ Recipe: https://youtu.be/AAAAAAAAAAA',
      '',
      'Thank you!',
    ].join('\n'));
  });

  it('dinner message for today, without emojis', () => {
    const m = buildCookMessage({ ...base, dayLabel: 'Today', part: 'dinner', emoji: false });
    expect(m).toBe(['Hi Didi,', "Tonight's dinner (13 Nov):", '', 'Dinner: Palak Paneer + 2 Roti', '', 'Thank you!'].join('\n'));
    expect(m).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  it('whole day lists all three meals', () => {
    const m = buildCookMessage({ ...base, part: 'all' });
    expect(m).toContain("Tomorrow's menu (13 Nov):");
    expect(m).toContain('Breakfast: Poha');
    expect(m).toContain('Dinner: Palak Paneer');
  });

  it('Hinglish wording', () => {
    const m = buildCookMessage({ ...base, lang: 'hinglish', part: 'dinner', dayLabel: 'Today' });
    expect(m.split('\n').slice(0, 2)).toEqual(['Namaste Didi 🙏', 'Aaj (13 Nov) raat ka khana:']);
    expect(m).toContain('Raat ka khana: Palak Paneer + 2 Roti');
    expect(m.endsWith('Dhanyavaad!')).toBe(true);
  });

  it('works without a cook name', () => {
    expect(buildCookMessage({ ...base, cookName: '', emoji: false }).startsWith('Hi,\n')).toBe(true);
  });
});

describe('defaultPart', () => {
  it('suggests dinner for today after noon, otherwise breakfast & lunch', () => {
    expect(defaultPart('Today', new Date(2026, 10, 12, 18))).toBe('dinner');
    expect(defaultPart('Today', new Date(2026, 10, 12, 9))).toBe('morning');
    expect(defaultPart('Tomorrow', new Date(2026, 10, 12, 21))).toBe('morning');
  });
});
