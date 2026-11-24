import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { fileStore, saveWithLimit, validate } from '../server/pushStore';

const sub = (n: number) => ({
  subscription: { endpoint: `https://web.push.apple.com/fake-${n}`, keys: { p256dh: 'BPfake', auth: 'authfake' } },
  title: 'Rasoi 🍛', body: "Send today's menu to your cook", hour: 8, minute: 0, timeZone: 'Asia/Kolkata',
});

describe('validate', () => {
  it('keeps a well-formed subscription', () => {
    const r = validate(sub(1));
    expect('sub' in r && r.sub.hour).toBe(8);
  });

  it('rejects bad endpoints and keys', () => {
    expect(validate({ subscription: { endpoint: 'http://x', keys: { p256dh: 'a', auth: 'b' } } })).toEqual({ error: 'Bad endpoint' });
    expect(validate({ subscription: { endpoint: 'https://x' } })).toEqual({ error: 'Bad keys' });
    expect(validate(null)).toEqual({ error: 'Bad endpoint' });
  });
});

describe('fileStore', () => {
  it('saves, lists and removes subscriptions, with a device limit', async () => {
    const store = fileStore(await mkdtemp(join(tmpdir(), 'rasoi-push-')));
    for (let i = 0; i < 20; i++) {
      const r = validate(sub(i));
      if (!('sub' in r)) throw new Error('invalid');
      expect(await saveWithLimit(store, r.sub)).toBe(true);
    }
    const extra = validate(sub(99));
    if (!('sub' in extra)) throw new Error('invalid');
    expect(await saveWithLimit(store, extra.sub)).toBe(false);
    expect((await store.all()).length).toBe(20);
    await store.remove('https://web.push.apple.com/fake-0');
    expect((await store.all()).length).toBe(19);
  });
});
