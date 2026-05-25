import Icon from './Icon';
import type { ColorKey, NavItem } from '../types';

interface BottomNavProps {
  items: NavItem[];
  active: string;
  onNavigate: (k: string) => void;
  accentColor?: ColorKey;
}

const TEXT_MAP: Record<ColorKey, string> = {
  leaf: 'text-leaf-700',
  sky: 'text-sky-700',
  navy: 'text-navy-700',
  amber: 'text-amber-700',
  violet: 'text-violet-700',
  rose: 'text-rose-700',
  indigo: 'text-indigo-700',
  fuchsia: 'text-fuchsia-700',
  emerald: 'text-emerald-700',
  teal: 'text-teal-700',
};

const BG_MAP: Record<ColorKey, string> = {
  leaf: 'bg-leaf-50',
  sky: 'bg-sky-50',
  navy: 'bg-navy-50',
  amber: 'bg-amber-50',
  violet: 'bg-violet-50',
  rose: 'bg-rose-50',
  indigo: 'bg-indigo-50',
  fuchsia: 'bg-fuchsia-50',
  emerald: 'bg-emerald-50',
  teal: 'bg-teal-50',
};

const BADGE_MAP: Record<ColorKey, string> = {
  leaf: 'bg-leaf-500',
  sky: 'bg-sky-500',
  navy: 'bg-navy-700',
  amber: 'bg-amber-500',
  violet: 'bg-violet-500',
  rose: 'bg-rose-500',
  indigo: 'bg-indigo-500',
  fuchsia: 'bg-fuchsia-500',
  emerald: 'bg-emerald-500',
  teal: 'bg-teal-500',
};

export default function BottomNav({ items, active, onNavigate, accentColor = 'leaf' }: BottomNavProps) {
  const activeColor = TEXT_MAP[accentColor];
  const activeBg = BG_MAP[accentColor];
  const badgeBg = BADGE_MAP[accentColor];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-navy-100 z-40 shadow-[0_-4px_12px_rgba(10,24,48,0.04)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
    >
      <div className="flex items-stretch justify-around px-1 py-1">
        {items.slice(0, 5).map(item => {
          const isActive = active === item.k;
          return (
            <button
              key={item.k}
              onClick={() => onNavigate(item.k)}
              className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg transition-colors ${
                isActive ? `${activeBg} ${activeColor}` : 'text-navy-500 hover:bg-paper'
              }`}
            >
              <div className="relative">
                <Icon name={item.i} size={20} strokeWidth={isActive ? 2.5 : 1.75} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full ${badgeBg} text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white`}>
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
                {item.live && !item.badge && (
                  <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${badgeBg} pulse-dot ring-2 ring-white`} />
                )}
              </div>
              <span className={`text-[10px] font-bold tracking-wide leading-none ${isActive ? '' : 'opacity-80'}`}>{item.l}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
