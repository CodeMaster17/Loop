// Dish details from the Menu card: add / remove from the weekly plan, and attach a
// YouTube recipe video that is sent along with this dish in the cook's WhatsApp message.
import { useState } from 'react';
import { getDb } from '../../shared/src/db/open';
import { type Dish, setDishYoutube } from '../../shared/src/db/repo';
import { palette as p } from '../../shared/src/design/palette';
import { parseYouTube } from '../../shared/src/domain/youtube';
import { Icon } from '../components/Icon';
import { Btn, Sheet, VegMark } from '../components/ui';

export function DishSheet({ dish, onClose, onChanged, onToggle }: {
  dish: Dish | null;
  onClose: () => void;
  /** Called after the video was saved or removed, so the list can reload. */
  onChanged: () => void;
  onToggle: (dish: Dish) => void;
}) {
  return (
    <Sheet visible={!!dish} onClose={onClose}>
      {dish ? <DishBody key={dish.id} dish={dish} onClose={onClose} onChanged={onChanged} onToggle={onToggle} /> : null}
    </Sheet>
  );
}

function DishBody({ dish, onClose, onChanged, onToggle }: {
  dish: Dish;
  onClose: () => void;
  onChanged: () => void;
  onToggle: (dish: Dish) => void;
}) {
  const [link, setLink] = useState('');
  const [error, setError] = useState<string | null>(null);
  const video = dish.youtubeUrl ? parseYouTube(dish.youtubeUrl) : null;

  const save = async () => {
    const parsed = parseYouTube(link);
    if (!parsed) { setError("That doesn't look like a YouTube video link."); return; }
    await setDishYoutube(await getDb(), dish.id, parsed);
    setLink('');
    setError(null);
    onChanged();
  };

  const remove = async () => {
    await setDishYoutube(await getDb(), dish.id, null);
    onChanged();
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <VegMark veg={dish.veg} />
        <h2 className="clamp2" style={{ flex: 1, color: p.ink, fontSize: 19, fontWeight: 700 }}>{dish.name}</h2>
      </div>
      <p style={{ color: p.inkSoft, fontSize: 13, marginTop: 4 }}>
        {`${Math.round(dish.proteinG)} g protein per serving${dish.soak ? '  ·  soak overnight' : ''}`}
      </p>

      <Btn
        label={dish.active ? 'Added to your weekly plan' : 'Add to your weekly plan'}
        kind={dish.active ? 'plain' : 'primary'}
        icon={dish.active ? 'checkmark-circle' : 'add'}
        onPress={() => onToggle(dish)}
        style={{ marginTop: 16 }}
      />

      <h3 style={{ color: p.ink, fontSize: 15, fontWeight: 700, marginTop: 22 }}>Recipe video</h3>
      <p style={{ color: p.inkSoft, fontSize: 12.5, marginTop: 2 }}>Sent to your cook with this dish on WhatsApp.</p>

      {video ? (
        <div style={{ marginTop: 12 }}>
          <a href={video.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', position: 'relative', borderRadius: 12, overflow: 'hidden' }}>
            <img src={video.thumbnailUrl} alt="Recipe video" style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', background: p.surface2 }} />
            <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ width: 54, height: 38, borderRadius: 10, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="play" size={22} color={p.white} />
              </span>
            </span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 8, gap: 8 }}>
            <span className="clamp1" style={{ flex: 1, color: p.inkSoft, fontSize: 12.5 }}>{video.url}</span>
            <button type="button" onClick={() => { void remove(); }} style={{ color: p.nonVeg, fontSize: 13, fontWeight: 600, padding: 4 }}>Remove</button>
          </div>
        </div>
      ) : (
        <form style={{ marginTop: 12 }} onSubmit={(e) => { e.preventDefault(); void save(); }}>
          <label style={{ display: 'flex', alignItems: 'center', background: p.surface2, borderRadius: 10, padding: '0 12px', height: 46 }}>
            <Icon name="logo-youtube" size={18} color="#FF0000" />
            <input
              value={link}
              onChange={(e) => { setLink(e.target.value); setError(null); }}
              placeholder="Paste a YouTube link"
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="done"
              style={{ flex: 1, minWidth: 0, marginLeft: 8, color: p.ink, fontSize: 14, border: 0, background: 'transparent', padding: 0 }}
            />
          </label>
          {error ? <p style={{ color: p.nonVeg, fontSize: 12, marginTop: 6 }}>{error}</p> : null}
          <Btn label="Save video" kind="primary" icon="link" size="sm" onPress={() => { void save(); }} style={{ marginTop: 10, alignSelf: 'flex-start', display: 'inline-block' }} />
        </form>
      )}

      <button type="button" onClick={onClose} style={{ display: 'block', margin: '18px auto 0', padding: 6, color: p.inkSoft, fontSize: 14, fontWeight: 600 }}>Done</button>
    </div>
  );
}
