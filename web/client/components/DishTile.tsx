// A dish in the Menu card grid: square photo, veg mark + protein, name, and an
// ADD / ADDED toggle that puts the dish in (or out of) the weekly rotation.
import type { Dish } from '../../shared/src/db/repo';
import { palette as p } from '../../shared/src/design/palette';
import { HIGH_PROTEIN_G } from '../../shared/src/domain/menuCard';
import { dishImage } from '../../shared/src/lib/dishImage';
import { imageUrl } from '../image';
import { useLongPress } from '../useLongPress';
import { Icon } from './Icon';
import { PhotoCredit } from './PhotoCredit';
import { VegMark } from './ui';

export function DishTile({ dish, placeholderEmoji, onToggle, onWrongPhoto, onOpen }: {
  dish: Dish;
  placeholderEmoji: string;
  onToggle: (dish: Dish) => void;
  /** Tap: open the dish sheet (add / remove, recipe video). */
  onOpen: (dish: Dish) => void;
  /** Long-press on the photo: "this isn't the dish". */
  onWrongPhoto: (dish: Dish) => void;
}) {
  const high = dish.proteinG >= HIGH_PROTEIN_G;
  const img = dishImage(dish.name, dish.photo);
  const press = useLongPress(() => onOpen(dish), () => onWrongPhoto(dish));

  return (
    <div style={{ position: 'relative', minWidth: 0, containerType: 'inline-size' }}>
      {img ? (
        <button type="button" aria-label={dish.name} title="Long-press if this photo shows a different dish" {...press} style={{ display: 'block', width: '100%' }}>
          <img src={imageUrl(img.source)} alt="" loading="lazy" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 18, background: p.surface2 }} />
        </button>
      ) : (
        <button type="button" aria-label={dish.name} onClick={() => onOpen(dish)} style={{ width: '100%', aspectRatio: '1', borderRadius: 18, background: p.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '30cqw', opacity: 0.55 }}>{placeholderEmoji}</span>
        </button>
      )}
      {dish.youtubeUrl ? (
        <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', alignItems: 'center', gap: 3, background: 'rgba(0,0,0,0.6)', borderRadius: 6, padding: '3px 6px', pointerEvents: 'none' }}>
          <Icon name="logo-youtube" size={11} color={p.white} />
          <span style={{ color: p.white, fontSize: 10.5, fontWeight: 700 }}>Recipe</span>
        </div>
      ) : null}

      <div style={{ display: 'flex', alignItems: 'center', marginTop: 8, gap: 6 }}>
        <VegMark veg={dish.veg} size={14} />
        {high ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Icon name="flame" size={12} color={p.brand} />
            <span style={{ color: p.brand, fontSize: 11.5, fontWeight: 600 }}>High protein</span>
          </span>
        ) : null}
        <span style={{ marginLeft: 'auto', background: p.vegSoft, borderRadius: 99, padding: '2px 7px', color: p.vegDeep, fontSize: 11.5, fontWeight: 700 }}>
          {`${Math.round(dish.proteinG)}g`}
        </span>
      </div>

      <div className="clamp2" onClick={() => onOpen(dish)} style={{ color: p.ink, fontSize: 14.5, fontWeight: 600, marginTop: 4, lineHeight: '19px', cursor: 'pointer' }}>{dish.name}</div>

      <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
        <span className="clamp1" style={{ color: p.inkFaint, fontSize: 11.5, flex: 1 }}>
          {dish.soak ? '💧 Soak overnight' : 'protein / serving'}
        </span>
        <button
          type="button"
          className="press press-more"
          aria-label={dish.active ? `Remove ${dish.name} from rotation` : `Add ${dish.name} to rotation`}
          aria-pressed={dish.active}
          onClick={() => onToggle(dish)}
          style={{
            width: 86, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            border: `1px solid ${dish.active ? p.brand : p.line}`, background: dish.active ? p.brandSoft : p.surface,
            boxShadow: dish.active ? 'none' : '0 2px 6px rgba(0,0,0,0.06)',
            color: p.brand, fontSize: 13, fontWeight: 700, letterSpacing: 0.3, whiteSpace: 'nowrap',
          }}
        >
          {dish.active ? 'ADDED ✓' : 'ADD'}
        </button>
      </div>

      {img ? <div style={{ marginTop: 8 }}><PhotoCredit credit={img.credit} /></div> : null}
    </div>
  );
}
