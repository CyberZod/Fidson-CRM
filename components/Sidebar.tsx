import FidsonLogo from './FidsonLogo';
import Icon from './Icon';
import type { IconName, SidebarUser } from '../types';

interface SidebarProps {
  active: string;
  onNavigate: (view: string) => void;
  isMobile?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
  user?: SidebarUser;
  approvalsCount?: number;
  itinerariesBadge?: number;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavSpec {
  k: string;
  i: IconName;
  l: string;
  badge?: number;
}

export default function Sidebar({
  active,
  onNavigate,
  isMobile = false,
  onClose,
  onLogout,
  user,
  approvalsCount = 0,
  itinerariesBadge = 0,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const nav: NavSpec[] = [
    { k: 'dashboard', i: 'dashboard', l: 'Dashboard' },
    { k: 'activity', i: 'activity', l: 'Field Activity' },
    { k: 'itineraries', i: 'calendar', l: 'Itineraries', badge: itinerariesBadge },
    { k: 'orders', i: 'cart', l: 'Orders & Approvals', badge: approvalsCount },
    { k: 'hcps', i: 'users', l: 'HCPs & Customers' },
    { k: 'pipeline', i: 'filter', l: 'Team Pipeline' },
    { k: 'campaigns', i: 'trending', l: 'Campaigns & ROI' },
    { k: 'insights', i: 'sparkles', l: 'AI Insights' },
    { k: 'clinical', i: 'flask', l: 'Clinical Meetings' },
    { k: 'reports', i: 'file', l: 'Reports & DCRs' },
    { k: 'sync-queue', i: 'refresh', l: 'Sync Queue', badge: 3 },
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
          <div className="bg-white rounded-lg p-1">
            <FidsonLogo size={28} />
          </div>
          {!collapsed && (
            <div>
              <p className="font-display text-white text-sm font-extrabold tracking-tight leading-none">FIDSON</p>
              <p className="text-[9px] text-leaf-300 tracking-wider uppercase mt-0.5">FieldForce</p>
            </div>
          )}
        </div>
        {isMobile && (
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <Icon name="x" size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {!collapsed && <p className="px-4 text-[10px] font-bold text-white/40 tracking-wider uppercase mb-2">Workspace</p>}
        {nav.map((item) => (
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
              <span className="px-1.5 py-0.5 rounded-full bg-leaf-500 text-white text-[10px] font-bold min-w-[20px] text-center">
                {item.badge}
              </span>
            )}
            {collapsed && item.badge !== undefined && item.badge > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-leaf-500 ring-2 ring-navy-900" />
            )}
          </button>
        ))}
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

      {!collapsed && (
        <div className="px-3 py-3 border-t border-white/5 space-y-0.5">
          <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors">
            <Icon name="helpCircle" size={16} />
            <span className="text-xs font-medium">Help & Support</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors">
            <Icon name="settings" size={16} />
            <span className="text-xs font-medium">Settings</span>
          </button>
        </div>
      )}

      <div className={`m-3 ${collapsed ? 'p-2' : 'p-3'} rounded-xl bg-white/5 border border-white/10`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
          <div
            className="w-9 h-9 rounded-lg bg-leaf-500 flex items-center justify-center text-white font-display font-bold text-sm flex-shrink-0"
            title={collapsed ? `${user?.name || ''} · ${user?.role || ''}` : undefined}
          >
            {user?.name?.split(' ').map(p => p[0]).join('') || 'TB'}
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="font-display font-semibold text-white text-sm truncate">{user?.name || 'Tunde Bakare'}</p>
                <p className="text-[11px] text-leaf-300 truncate">{user?.role || 'RSM · Lagos'}</p>
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
