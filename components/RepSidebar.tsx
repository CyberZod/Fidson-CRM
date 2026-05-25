import FidsonLogo from './FidsonLogo';
import Icon from './Icon';
import type { IconName, SidebarUser, RepActiveVisit } from '../types';

interface RepSidebarProps {
  active: string;
  onNavigate: (view: string) => void;
  isMobile?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
  user?: SidebarUser;
  activeVisit?: RepActiveVisit | null;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface RepNavSpec {
  k: string;
  i: IconName;
  l: string;
  badge?: number;
  live?: boolean;
}

export default function RepSidebar({
  active,
  onNavigate,
  isMobile = false,
  onClose,
  onLogout,
  user,
  activeVisit,
  collapsed = false,
  onToggleCollapse,
}: RepSidebarProps) {
  const nav: RepNavSpec[] = [
    { k: 'rep-day', i: 'dashboard', l: 'My Day' },
    { k: 'rep-plan', i: 'map', l: "Today's Plan", badge: 5 },
    { k: 'rep-visit', i: 'location', l: 'Active Visit', live: !!activeVisit },
    { k: 'rep-orders', i: 'cart', l: 'My Orders' },
    { k: 'rep-coach', i: 'sparkles', l: 'AI Coach' },
    { k: 'rep-inventory', i: 'package', l: 'Customer Inventory' },
    { k: 'rep-dcr', i: 'file', l: 'My DCR' },
  ];

  const widthCls = isMobile
    ? 'fixed inset-y-0 right-0 z-50 w-72 slide-in-right shadow-2xl'
    : (collapsed ? 'hidden md:flex w-20 flex-shrink-0' : 'hidden md:flex w-64 flex-shrink-0');

  return (
    <aside
      className={`${widthCls} flex-col h-full transition-all duration-300`}
      style={{ background: 'linear-gradient(180deg, #0A1830 0%, #142A5A 100%)' }}
    >
      <div className={`px-5 py-4 border-b border-white/5 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <div className={`flex items-center ${collapsed ? '' : 'gap-2.5'}`}>
          <div className="bg-white rounded-lg p-1"><FidsonLogo size={28} /></div>
          {!collapsed && (
            <div>
              <p className="font-display text-white text-sm font-extrabold tracking-tight leading-none">FIDSON</p>
              <p className="text-[9px] text-leaf-300 tracking-wider uppercase mt-0.5">FieldForce</p>
            </div>
          )}
        </div>
        {isMobile && <button onClick={onClose} className="text-white/60 hover:text-white"><Icon name="x" size={20} /></button>}
      </div>

      {!collapsed ? (
        <div className="px-4 py-3 mx-3 mt-3 rounded-xl bg-leaf-500/15 border border-leaf-500/30">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-leaf-400 pulse-dot" />
            <p className="text-[10px] font-bold text-leaf-300 tracking-wider uppercase">Day Active · GPS On</p>
          </div>
          <p className="text-white text-xs font-display font-semibold mt-1">Started 08:42 · Yaba</p>
        </div>
      ) : (
        <div className="mx-auto mt-3 w-10 h-10 rounded-xl bg-leaf-500/15 border border-leaf-500/30 flex items-center justify-center" title="Day Active · GPS On · Started 08:42">
          <div className="w-2 h-2 rounded-full bg-leaf-400 pulse-dot" />
        </div>
      )}

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {!collapsed && <p className="px-4 text-[10px] font-bold text-white/40 tracking-wider uppercase mb-2">My Workspace</p>}
        {nav.map(item => (
          <button
            key={item.k}
            onClick={() => { onNavigate(item.k); if (isMobile && onClose) onClose(); }}
            title={collapsed ? item.l : undefined}
            className={`w-full flex items-center ${collapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-2.5 rounded-r-lg text-left transition-colors btn-press relative ${
              active === item.k ? 'nav-item-active text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
            style={{ borderLeftWidth: active === item.k ? 0 : '3px', borderLeftColor: 'transparent', borderLeftStyle: 'solid' }}
          >
            <Icon name={item.i} size={18} strokeWidth={active === item.k ? 2 : 1.75} />
            {!collapsed && <span className="text-sm font-medium flex-1">{item.l}</span>}
            {!collapsed && item.badge !== undefined && item.badge > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-leaf-500 text-white text-[10px] font-bold min-w-[20px] text-center">{item.badge}</span>
            )}
            {!collapsed && item.live && <span className="w-1.5 h-1.5 rounded-full bg-leaf-400 pulse-dot" />}
            {collapsed && ((item.badge !== undefined && item.badge > 0) || item.live) && (
              <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ring-2 ring-navy-900 ${item.live ? 'bg-leaf-400 pulse-dot' : 'bg-leaf-500'}`} />
            )}
          </button>
        ))}

        <div className="pt-4 mt-4 border-t border-white/5">
          {!collapsed && <p className="px-4 text-[10px] font-bold text-white/40 tracking-wider uppercase mb-2">Quick Submit</p>}
          <button
            onClick={() => { onNavigate('rep-clinical'); if (isMobile && onClose) onClose(); }}
            title={collapsed ? 'Request CM' : undefined}
            className={`w-full flex items-center ${collapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-2.5 rounded-r-lg text-left transition-colors btn-press ${
              active === 'rep-clinical' ? 'nav-item-active text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
            style={{ borderLeftWidth: active === 'rep-clinical' ? 0 : '3px', borderLeftColor: 'transparent', borderLeftStyle: 'solid' }}
          >
            <Icon name="flask" size={18} />
            {!collapsed && <span className="text-sm font-medium flex-1">Request CM</span>}
          </button>
        </div>
      </nav>

      {!isMobile && onToggleCollapse && (
        <div className="px-3 py-2 border-t border-white/5">
          <button
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`w-full flex items-center ${collapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors`}
          >
            <Icon name={collapsed ? 'panelOpen' : 'panelClose'} size={16} />
            {!collapsed && <span className="text-xs font-medium">Collapse</span>}
          </button>
        </div>
      )}

      <div className={`m-3 ${collapsed ? 'p-2' : 'p-3'} rounded-xl bg-white/5 border border-white/10`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
          <div
            className="w-9 h-9 rounded-lg bg-leaf-500 flex items-center justify-center text-white font-display font-bold text-sm flex-shrink-0"
            title={collapsed ? `${user?.name || ''} · ${user?.role || ''}` : undefined}
          >
            {user?.name?.split(' ').map(p => p[0]).join('') || 'AO'}
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="font-display font-semibold text-white text-sm truncate">{user?.name || 'Adaeze Okafor'}</p>
                <p className="text-[11px] text-leaf-300 truncate">{user?.role || 'Med Rep'}</p>
              </div>
              <button onClick={onLogout} className="text-white/40 hover:text-white transition-colors" title="Sign out">
                <Icon name="logout" size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {!collapsed && <p className="text-[10px] text-white/30 text-center pb-3 tracking-wider">POWERED BY TALES CONSULTING</p>}
    </aside>
  );
}
