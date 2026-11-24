// Tamagui design system config for Rasoi.
// Starts from Tamagui's default v6 tokens/media, then sets our own fonts (Poppins),
// a single Swiggy-style light theme, and Reanimated-driven animations.
import { animationsReanimated } from '@tamagui/config/animations-reanimated';
import { defaultConfig } from '@tamagui/config/v6';
import { createFont, createTamagui } from 'tamagui';
import { palette as p } from './src/design/palette';

const poppinsFace = {
  400: { normal: 'Poppins_400Regular' },
  500: { normal: 'Poppins_500Medium' },
  600: { normal: 'Poppins_600SemiBold' },
  700: { normal: 'Poppins_700Bold' },
  800: { normal: 'Poppins_800ExtraBold' },
} as const;

const size = { 1: 11, 2: 12, 3: 13, 4: 14, 5: 16, 6: 18, 7: 21, 8: 24, 9: 30, 10: 36, true: 14 } as const;

const body = createFont({
  family: 'Poppins_400Regular',
  size,
  lineHeight: { 1: 16, 2: 17, 3: 19, 4: 20, 5: 23, 6: 25, 7: 28, 8: 32, 9: 38, 10: 44, true: 20 },
  weight: { 1: '400', true: '400' },
  letterSpacing: { 1: 0, true: 0 },
  face: poppinsFace,
});

const heading = createFont({
  family: 'Poppins_700Bold',
  size,
  lineHeight: { 1: 16, 2: 17, 3: 19, 4: 20, 5: 23, 6: 25, 7: 28, 8: 32, 9: 38, 10: 44, true: 20 },
  weight: { 1: '700', true: '700' },
  letterSpacing: { 1: 0, 8: -0.3, 9: -0.4, 10: -0.5, true: 0 },
  face: poppinsFace,
});

// The base light theme keeps Tamagui's keys (background, color, border-color …) so its
// components style correctly, and adds Rasoi's own named colours.
const light = {
  ...defaultConfig.themes.light,
  background: p.surface,
  'background-hover': p.surface2,
  'background-press': p.surface2,
  'background-focus': p.surface2,
  'background-active': p.surface2,
  color: p.ink,
  'color-hover': p.ink,
  'color-press': p.ink,
  'color-focus': p.ink,
  'border-color': p.line,
  'border-color-hover': p.line,
  'border-color-press': p.line,
  'border-color-focus': p.brand,
  'placeholder-color': p.inkFaint,
  'outline-color': p.brand,
  'accent-background': p.brand,
  'accent-color': p.white,
  ...p,
};

// Sub-themes for coloured buttons: <Button theme="brand"> and <Button theme="wa">.
const light_brand = {
  ...light,
  background: p.brand,
  'background-hover': p.brandPressed,
  'background-press': p.brandPressed,
  'background-focus': p.brandPressed,
  'background-active': p.brandPressed,
  color: p.white,
  'color-hover': p.white,
  'color-press': p.white,
  'border-color': p.brand,
};

const light_wa = {
  ...light,
  background: p.wa,
  'background-hover': p.wa,
  'background-press': p.wa,
  'background-focus': p.wa,
  'background-active': p.wa,
  color: p.onWa,
  'color-hover': p.onWa,
  'color-press': p.onWa,
  'border-color': p.wa,
};

export const config = createTamagui({
  ...defaultConfig,
  fonts: { body, heading },
  themes: { light, light_brand, light_wa },
  animations: animationsReanimated,
  settings: {
    ...defaultConfig.settings,
    defaultFont: 'body',
    // Allow plain RN prop names and raw values alongside tokens while screens migrate.
    onlyAllowShorthands: false,
    allowedStyleValues: false,
    styleCompat: 'react-native',
    shouldAddPrefersColorThemes: false,
  },
});

export default config;

type RasoiConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends RasoiConfig {}
}
