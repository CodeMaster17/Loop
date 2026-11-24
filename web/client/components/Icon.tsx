// Ionicons (the same icon set the native app uses through @expo/vector-icons).
import {
  IoAdd, IoBasket, IoBasketOutline, IoBook, IoBookOutline, IoCalendar, IoCalendarOutline, IoCheckmark,
  IoCheckmarkCircle, IoChevronDown, IoChevronUp, IoClose, IoCloseCircle, IoFlame, IoLink, IoLogoWhatsapp,
  IoLogoYoutube, IoPlay, IoRestaurant, IoSearch, IoSettingsOutline, IoShuffle, IoWater,
} from 'react-icons/io5';

const ICONS = {
  add: IoAdd,
  basket: IoBasket,
  'basket-outline': IoBasketOutline,
  book: IoBook,
  'book-outline': IoBookOutline,
  calendar: IoCalendar,
  'calendar-outline': IoCalendarOutline,
  checkmark: IoCheckmark,
  'checkmark-circle': IoCheckmarkCircle,
  'chevron-down': IoChevronDown,
  'chevron-up': IoChevronUp,
  close: IoClose,
  'close-circle': IoCloseCircle,
  flame: IoFlame,
  link: IoLink,
  'logo-whatsapp': IoLogoWhatsapp,
  'logo-youtube': IoLogoYoutube,
  play: IoPlay,
  restaurant: IoRestaurant,
  search: IoSearch,
  'settings-outline': IoSettingsOutline,
  shuffle: IoShuffle,
  water: IoWater,
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({ name, size, color, style }: { name: IconName; size: number; color: string; style?: React.CSSProperties }) {
  const C = ICONS[name];
  return <C size={size} color={color} style={{ display: 'block', flexShrink: 0, ...style }} aria-hidden />;
}
