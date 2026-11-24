import { parseYouTube } from '../youtube';

const ID = 'dQw4w9WgXcQ';

describe('parseYouTube', () => {
  it.each([
    `https://youtu.be/${ID}`,
    `https://youtu.be/${ID}?si=AbCdEfGh123`,
    `https://www.youtube.com/watch?v=${ID}`,
    `https://m.youtube.com/watch?v=${ID}&feature=share`,
    `https://youtube.com/watch?app=desktop&v=${ID}&t=42`,
    `https://www.youtube.com/shorts/${ID}`,
    `https://youtube.com/shorts/${ID}?si=xyz`,
    `https://www.youtube.com/embed/${ID}`,
    `https://music.youtube.com/watch?v=${ID}`,
    `youtube.com/watch?v=${ID}`,
    `Check this recipe! https://youtu.be/${ID}?si=track shared from YouTube`,
  ])('reads %s', (input) => {
    expect(parseYouTube(input)).toEqual({
      id: ID,
      url: `https://youtu.be/${ID}`,
      thumbnailUrl: `https://img.youtube.com/vi/${ID}/hqdefault.jpg`,
    });
  });

  it.each(['', 'not a link', 'https://vimeo.com/123', 'https://www.youtube.com/', 'https://youtu.be/short', 'https://www.youtube.com/@channel'])(
    'rejects %p', (input) => expect(parseYouTube(input)).toBeNull(),
  );
});
