// Rasoi colour palette — Swiggy-style: a warm orange accent on clean white,
// dark slate text and soft greys. One light theme only.
// Shared by the Tamagui config (tamagui.config.ts) and the older RN styles (src/theme.ts).

export const palette = {
  // brand orange
  brand: '#FC8019',
  brandPressed: '#E46F0A',
  brandInk: '#B5530A', // orange text on light orange backgrounds
  brandSoft: '#FFF1E6',

  // text
  ink: '#282C3F',
  inkSoft: '#686B78',
  inkFaint: '#93959F',
  /** Very light text for credits and fine print. */
  inkWhisper: '#C2C4CC',

  // surfaces and lines
  bg: '#F4F5F7',
  surface: '#FFFFFF',
  surface2: '#F1F1F6',
  line: '#E9E9EB',

  // food marks and status
  veg: '#60B246',
  vegDeep: '#3D8C40',
  vegSoft: '#EAF6E6',
  nonVeg: '#E43B4F',
  nonVegSoft: '#FDE8EB',

  // tab bar
  bar: '#1C1C24',
  barIdle: '#A9ABB6',

  // WhatsApp
  wa: '#25D366',
  onWa: '#05391B',
  /** WhatsApp's own button green; white text reads well on it. */
  waButton: '#00A884',

  white: '#FFFFFF',
} as const;

export type PaletteKey = keyof typeof palette;
