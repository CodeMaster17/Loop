// Very light credit line under a dish photo, as the photo licences require.
// Unsplash: "Photo by <name> on Unsplash". Wikimedia Commons: "Photo: <name> · <licence>".
import { palette as p } from '../../shared/src/design/palette';
import { UTM } from '../../shared/src/domain/photoPick';
import type { PhotoCreditInfo } from '../../shared/src/lib/dishImage';

const UNSPLASH_HOME = `https://unsplash.com/?${UTM}`;
const style: React.CSSProperties = { color: p.inkWhisper, fontSize: 10, lineHeight: '14px' };
const link: React.CSSProperties = { ...style, textDecoration: 'underline' };

export function PhotoCredit({ credit }: { credit: PhotoCreditInfo }) {
  if (credit.kind === 'commons') {
    return (
      <a className="clamp1" style={{ ...style, display: 'block' }} href={credit.pageUrl} target="_blank" rel="noopener noreferrer">
        {`Photo: ${credit.author} · ${credit.license}`}
      </a>
    );
  }
  return (
    <div className="clamp1" style={style}>
      {'Photo by '}
      <a style={link} href={credit.authorUrl} target="_blank" rel="noopener noreferrer">{credit.author}</a>
      {' on '}
      <a style={link} href={UNSPLASH_HOME} target="_blank" rel="noopener noreferrer">Unsplash</a>
    </div>
  );
}
