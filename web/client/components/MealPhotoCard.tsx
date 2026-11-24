// A meal in the Plan grid (three per day): tall photo with the slot name overlaid at the
// bottom, a swap button on the photo, then dish name and protein.
import type { DishPhoto } from '../../shared/src/db/repo';
import { palette as p } from '../../shared/src/design/palette';
import { dishImage } from '../../shared/src/lib/dishImage';
import type { Meal } from '../../shared/src/types';
import { imageUrl } from '../image';
import { Icon } from './Icon';
import { VegMark } from './ui';

const PLACEHOLDER: Record<string, string> = { BREAKFAST: '🍳', LUNCH: '🍛', DINNER: '🍲' };

export function MealPhotoCard({ slotLabel, meal, photo, onSwap }: {
  slotLabel: 'BREAKFAST' | 'LUNCH' | 'DINNER';
  meal: Meal;
  photo?: DishPhoto;
  onSwap: () => void;
}) {
  const img = dishImage(meal.name, photo);
  return (
    // Keyed by dish so a swap fades the new dish in.
    <div key={meal.name} className="fade-in" style={{ minWidth: 0, animationDuration: '220ms', containerType: 'inline-size' }}>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1.15', borderRadius: 16, overflow: 'hidden', background: p.surface2 }}>
        {img ? (
          <img src={imageUrl(img.source)} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '34cqw', opacity: 0.5 }}>
            {PLACEHOLDER[slotLabel]}
          </div>
        )}
        <div aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 52, background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.22) 45%, rgba(0,0,0,0.45) 100%)' }} />
        <span style={{ position: 'absolute', left: 9, bottom: 7, color: p.white, fontSize: 12, fontWeight: 800, letterSpacing: 0.6 }}>{slotLabel}</span>
        <button
          type="button"
          className="press press-more"
          aria-label={`Swap ${slotLabel.toLowerCase()}`}
          onClick={onSwap}
          style={{ position: 'absolute', top: 7, right: 7, width: 28, height: 28, borderRadius: 14, background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon name="shuffle" size={15} color={p.ink} />
        </button>
      </div>
      <div className="clamp2" style={{ color: p.ink, fontSize: 13.5, fontWeight: 700, marginTop: 7, lineHeight: '17px' }}>{meal.name}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
        <VegMark veg={meal.v} size={11} />
        <Icon name="flame" size={11} color={p.brand} />
        <span style={{ color: p.ink, fontSize: 12, fontWeight: 600 }}>{`${meal.p}g`}</span>
      </div>
    </div>
  );
}
