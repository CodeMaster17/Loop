import { averageProtein, planDays } from '../planDays';

describe('planDays', () => {
  it('starts with Today and Tomorrow, then weekday names, with local date keys', () => {
    const days = planDays(new Date(2026, 10, 12), 7); // Thu 12 Nov 2026
    expect(days.map((d) => d.label)).toEqual(['Today', 'Tomorrow', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed']);
    expect(days[0]).toMatchObject({ key: '2026-11-12', sub: '12 Nov', isToday: true });
    expect(days[6]).toMatchObject({ key: '2026-11-18', isToday: false });
  });

  it('crosses month and year boundaries', () => {
    const days = planDays(new Date(2026, 11, 31), 2);
    expect(days.map((d) => d.key)).toEqual(['2026-12-31', '2027-01-01']);
    expect(days[1].sub).toBe('1 Jan');
  });
});

describe('averageProtein', () => {
  it('rounds the mean and handles no days', () => {
    expect(averageProtein([56, 52, 67])).toBe(58);
    expect(averageProtein([])).toBe(0);
  });
});
