// Colour tokens for screens still styled with plain React Native styles.
// Values come from the shared Swiggy-style palette (src/design/palette.ts), the same one
// the Tamagui theme uses, so both kinds of screens match. One light theme only.
import type { ColorSchemeName } from 'react-native';
import { palette as p } from './design/palette';

export interface Colors {
  bg: string;
  surface: string;
  surface2: string;
  ink: string;
  inkSoft: string;
  inkFaint: string;
  line: string;
  /** veg green */
  green: string;
  greenDeep: string;
  leaf: string;
  /** brand orange (kept under the old name) */
  saffron: string;
  saffronInk: string;
  saffronTint: string;
  /** non-veg red */
  chili: string;
  chiliTint: string;
  wa: string;
  onWa: string;
  onDark: string;
}

const light: Colors = {
  bg: p.bg, surface: p.surface, surface2: p.surface2,
  ink: p.ink, inkSoft: p.inkSoft, inkFaint: p.inkFaint, line: p.line,
  green: p.veg, greenDeep: p.vegDeep, leaf: p.vegSoft,
  saffron: p.brand, saffronInk: p.brandInk, saffronTint: p.brandSoft,
  chili: p.nonVeg, chiliTint: p.nonVegSoft,
  wa: p.wa, onWa: p.onWa, onDark: p.white,
};

/** Kept for existing call sites; the app always uses the light theme. */
export function getColors(_scheme?: ColorSchemeName): Colors {
  return light;
}

export function useColors(): Colors {
  return light;
}
