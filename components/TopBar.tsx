import Icon from './Icon';
import RoleSwitcher from './RoleSwitcher';
import type { PersonaKey } from '../types';

interface TopBarProps {
  onMenuClick: () => void;
  title: string;
  subtitle?: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currentRole?: PersonaKey;
  onSwitchRole?: (role: PersonaKey) => void;
}

export default function TopBar({
  onMenuClick,
  title,
  subtitle,
  searchQuery,
  setSearchQuery,
  currentRole,
  onSwitchRole,
}: TopBarProps) {
  return (
    <header className="h-14 sm:h-16 bg-white border-b border-navy-100 flex items-center px-3 sm:px-4 lg:px-8 sticky top-0 z-30">
      <button
        onClick={onMenuClick}
        className="md:hidden mr-2 sm:mr-3 text-navy-700 btn-press w-9 h-9 rounded-lg hover:bg-paper flex items-center justify-center flex-shrink-0"
      >
        <Icon name="menu" size={20} />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="font-display text-base sm:text-lg lg:text-xl font-bold text-ink truncate">{title}</h1>
        {subtitle && <p className="text-[10px] sm:text-[11px] lg:text-xs text-navy-500 truncate">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 flex-shrink-0">
        <div className="hidden xl:flex items-center gap-2 px-3 py-2 rounded-lg bg-paper border border-navy-100 w-64 focus-within:border-leaf-400 transition-colors">
          <Icon name="search" size={14} className="text-navy-400" />
          <input
            type="text"
            placeholder="Search reps, HCPs, orders..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm flex-1 outline-none placeholder-navy-400"
          />
          {searchQuery ? (
            <button onClick={() => setSearchQuery('')} className="text-navy-400 hover:text-navy-700">
              <Icon name="x" size={12} />
            </button>
          ) : (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-navy-100 text-navy-500 font-mono">⌘K</span>
          )}
        </div>

        <div className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-lg border border-navy-100">
          <Icon name="calendar" size={14} className="text-navy-500" />
          <span className="text-xs font-medium text-navy-700">Today · 13 May</span>
        </div>

        <button className="hidden sm:flex relative w-9 h-9 rounded-lg border border-navy-100 items-center justify-center text-navy-700 hover:bg-paper btn-press">
          <Icon name="bell" size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-leaf-500" />
        </button>

        {currentRole && onSwitchRole && (
          <RoleSwitcher currentRole={currentRole} onSwitchRole={onSwitchRole} />
        )}
      </div>
    </header>
  );
}
