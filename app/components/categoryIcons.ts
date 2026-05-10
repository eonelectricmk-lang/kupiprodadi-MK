import type { LucideIcon } from 'lucide-react';
import {
  Car,
  House,
  Sofa,
  Shirt,
  Smartphone,
  Monitor,
  Tv,
  Guitar,
  Watch,
  Baby,
  HeartPulse,
  Disc3,
  BookOpen,
  Paperclip,
  Gamepad2,
  Dumbbell,
  Palette,
  Briefcase,
  CookingPot,
  ShoppingCart,
  Wrench,
  Handshake,
  CalendarDays,
  Plane,
  MessageCircle,
  Package,
} from 'lucide-react';

type IconMeta = {
  Icon: LucideIcon;
  className: string;
};

const DEFAULT_ICON: IconMeta = {
  Icon: Package,
  className: 'text-slate-300',
};

const ICON_BY_SLUG_PREFIX: Record<string, IconMeta> = {
  'motorni-vozila': { Icon: Car, className: 'text-red-400' },
  nedvoznosti: { Icon: House, className: 'text-emerald-400' },
  'dom-gradina': { Icon: Sofa, className: 'text-amber-400' },
  'moda-obleka': { Icon: Shirt, className: 'text-pink-400' },
  'mobilni-telefoni': { Icon: Smartphone, className: 'text-violet-400' },
  kompjuteri: { Icon: Monitor, className: 'text-sky-400' },
  'tv-video-foto': { Icon: Tv, className: 'text-blue-400' },
  'muzicki-instrumenti': { Icon: Guitar, className: 'text-orange-400' },
  'casovnici-nakij': { Icon: Watch, className: 'text-yellow-400' },
  'bebi-detski': { Icon: Baby, className: 'text-cyan-400' },
  'zdravje-ubavina': { Icon: HeartPulse, className: 'text-rose-400' },
  'cd-dvd-vhs': { Icon: Disc3, className: 'text-fuchsia-400' },
  'knigi-literatura': { Icon: BookOpen, className: 'text-indigo-400' },
  'kancelarijski-skolski': { Icon: Paperclip, className: 'text-lime-400' },
  'slobodno-vreme-hobi': { Icon: Gamepad2, className: 'text-purple-400' },
  'sportska-oprema': { Icon: Dumbbell, className: 'text-green-400' },
  'antikvar-umetnost': { Icon: Palette, className: 'text-pink-400' },
  'biznis-masini': { Icon: Briefcase, className: 'text-cyan-400' },
  'hrana-gotvenj': { Icon: CookingPot, className: 'text-orange-400' },
  'prodavnici-trgovija': { Icon: ShoppingCart, className: 'text-blue-400' },
  'uslugi-serzeri': { Icon: Wrench, className: 'text-teal-400' },
  vrabotuvanje: { Icon: Handshake, className: 'text-emerald-400' },
  'nastani-nocen-zivot': { Icon: CalendarDays, className: 'text-rose-400' },
  'odmor-turizm': { Icon: Plane, className: 'text-sky-400' },
  'lichni-kontakti': { Icon: MessageCircle, className: 'text-violet-400' },
  ostatno: { Icon: Package, className: 'text-slate-300' },
};

export function getCategoryIconMeta(slug: string): IconMeta {
  const exact = ICON_BY_SLUG_PREFIX[slug];
  if (exact) return exact;

  const entry = Object.entries(ICON_BY_SLUG_PREFIX).find(([prefix]) => slug.startsWith(prefix));
  if (entry) return entry[1];

  return DEFAULT_ICON;
}
