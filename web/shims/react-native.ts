// The few react-native names the shared code (web/shared/src) refers to, for the web.
// Images are plain URLs here; Linking opens links; AppState follows page visibility.

export type ImageSourcePropType = string | { src: string } | { default: { src: string } } | { uri: string };
export type ColorSchemeName = 'light' | 'dark' | null | undefined;

export const Linking = {
  async canOpenURL(url: string): Promise<boolean> {
    return /^https?:/i.test(url);
  },
  async openURL(url: string): Promise<void> {
    window.open(url, '_blank', 'noopener');
  },
};

type AppStateStatus = 'active' | 'background';

export const AppState = {
  addEventListener(_type: 'change', fn: (state: AppStateStatus) => void): { remove: () => void } {
    const handler = () => fn(document.visibilityState === 'visible' ? 'active' : 'background');
    document.addEventListener('visibilitychange', handler);
    return { remove: () => document.removeEventListener('visibilitychange', handler) };
  },
};
