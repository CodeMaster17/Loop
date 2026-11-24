// Groceries: everything the next 7 days' meals need, as an icon grid in two groups —
// weekly items to buy, and bulk staples to check at home. Tap an item to tick it off.
// Icons are from thiings.co (free personal licence; the credit below is required).
import { GROCERY_ICON_IMAGES } from '../../shared/src/design/groceryIconImages';
import { palette as p } from '../../shared/src/design/palette';
import { groceryIconFor } from '../../shared/src/domain/groceryIcons';
import { defaultBuyMode, titleCase } from '../../shared/src/domain/ingredients';
import { weekIngredients } from '../../shared/src/lib/plan';
import { useStore } from '../../shared/src/store';
import { Icon } from '../components/Icon';
import { Btn } from '../components/ui';
import { imageUrl } from '../image';

const GAP = 10;

export function GroceryScreen({ onSendGrocery }: { onSendGrocery: () => void }) {
  const { store } = useStore();

  const uses = weekIngredients(store.plan);
  const byUse = Object.keys(uses).sort((a, b) => (uses[b] ?? 0) - (uses[a] ?? 0) || a.localeCompare(b));
  const weekly = byUse.filter((it) => defaultBuyMode(it) === 'weekly');
  const bulk = byUse.filter((it) => defaultBuyMode(it) === 'bulk');
  const left = byUse.filter((it) => !store.done[it]).length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h2 style={{ color: p.ink, fontSize: 22, fontWeight: 700 }}>Groceries</h2>
        <span style={{ color: p.inkSoft, fontSize: 13 }}>{`${left} of ${byUse.length} left`}</span>
      </div>
      <p style={{ color: p.inkFaint, fontSize: 12.5, marginTop: 2 }}>For the next 7 days of meals</p>

      <Group title="Buy for the week" sub="Vegetables, dairy, fresh items" items={weekly} uses={uses} />
      <Group title="Bulk staples" sub="Dals, flours, spices — check what's at home" items={bulk} uses={uses} />

      <Btn label="Send list on WhatsApp" kind="wa" icon="logo-whatsapp" onPress={onSendGrocery} style={{ marginTop: 20 }} />

      <a href="https://www.thiings.co/things" target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', marginTop: 24, color: p.inkWhisper, fontSize: 10.5 }}>
        {'Icons by '}<span style={{ textDecoration: 'underline' }}>thiings.co</span>
      </a>
    </div>
  );
}

function Group({ title, sub, items, uses }: { title: string; sub: string; items: string[]; uses: Record<string, number> }) {
  if (items.length === 0) return null;
  return (
    <section style={{ marginTop: 22 }}>
      <div style={{ marginBottom: 10 }}>
        <h3 style={{ color: p.ink, fontSize: 17, fontWeight: 700 }}>{`${title} (${items.length})`}</h3>
        <p style={{ color: p.inkFaint, fontSize: 12 }}>{sub}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: GAP }}>
        {items.map((it) => <GroceryTile key={it} item={it} uses={uses[it] ?? 0} />)}
      </div>
    </section>
  );
}

function GroceryTile({ item, uses }: { item: string; uses: number }) {
  const { store, toggleGroceryDone } = useStore();
  const done = !!store.done[item];
  const icon = groceryIconFor(item);

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      aria-label={`${titleCase(item)}, used in ${uses} meals`}
      className="press"
      onClick={() => toggleGroceryDone(item)}
      style={{
        position: 'relative', borderRadius: 16, background: p.surface, padding: '10px 6px 9px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', border: `1px solid ${done ? p.veg : p.surface}`, minWidth: 0,
      }}
    >
      <div style={{ opacity: done ? 0.35 : 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        {icon ? (
          <img src={imageUrl(GROCERY_ICON_IMAGES[icon])} alt="" style={{ width: '58%', aspectRatio: '1', objectFit: 'contain' }} />
        ) : (
          <div style={{ width: '58%', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>🛒</div>
        )}
        <span className="clamp2" style={{ color: p.ink, fontSize: 12.5, fontWeight: 600, marginTop: 6, textAlign: 'center', textDecoration: done ? 'line-through' : 'none', lineHeight: '17px' }}>
          {titleCase(item)}
        </span>
        <span style={{ color: p.inkFaint, fontSize: 11, marginTop: 1 }}>{uses === 1 ? '1 meal' : `${uses} meals`}</span>
      </div>
      {done ? (
        <span className="fade-in" style={{ position: 'absolute', top: 6, right: 6, width: 20, height: 20, borderRadius: 10, background: p.veg, display: 'flex', alignItems: 'center', justifyContent: 'center', animationDuration: '150ms' }}>
          <Icon name="checkmark" size={14} color={p.white} />
        </span>
      ) : null}
    </button>
  );
}
