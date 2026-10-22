import { useState } from 'react';
import { AdminPage, Badge, Card, thCls, useNotice, type AdminScreenProps } from './kit';
import { useAdmin } from '../../stores/admin';

// AC 6.8 role × module permission grid.
type Level = 'hidden' | 'view' | 'edit' | 'approve';
const LEVELS: Level[] = ['hidden', 'view', 'edit', 'approve'];
const LABEL: Record<Level, string> = { hidden: 'Hidden', view: 'View', edit: 'Edit', approve: 'Approve' };
const STYLE: Record<Level, string> = {
  hidden: 'bg-navy-50 text-navy-400 border-navy-100',
  view: 'bg-sky-50 text-sky-700 border-sky-200',
  edit: 'bg-amber-50 text-amber-700 border-amber-200',
  approve: 'bg-leaf-50 text-leaf-700 border-leaf-200',
};

const ROLES = ['Medical Rep', 'ASM', 'RSM', 'FSM', 'DM', 'NSM', 'PM', 'MM', 'Platform Admin', 'Support Desk'];
const MODULES = ['Visits', 'Itineraries', 'Orders', 'Discounts', 'Customers', 'Clinical meetings', 'Promo materials', 'Reports', 'Admin console'];

const seed = (): Record<string, Record<string, Level>> => {
  const m: Record<string, Record<string, Level>> = {};
  const row = (...lv: Level[]) => Object.fromEntries(MODULES.map((mod, i) => [mod, lv[i]]));
  m['Medical Rep'] = row('edit', 'edit', 'edit', 'edit', 'edit', 'edit', 'view', 'view', 'hidden');
  m['ASM'] = row('approve', 'approve', 'approve', 'view', 'edit', 'edit', 'view', 'view', 'hidden');
  m['RSM'] = row('approve', 'approve', 'approve', 'approve', 'edit', 'approve', 'view', 'view', 'hidden');
  m['FSM'] = row('approve', 'approve', 'approve', 'approve', 'edit', 'view', 'view', 'view', 'hidden');
  m['DM'] = row('view', 'view', 'approve', 'approve', 'view', 'approve', 'view', 'edit', 'hidden');
  m['NSM'] = row('view', 'view', 'approve', 'approve', 'view', 'approve', 'approve', 'edit', 'hidden');
  m['PM'] = row('view', 'hidden', 'view', 'hidden', 'view', 'edit', 'edit', 'view', 'hidden');
  m['MM'] = row('view', 'hidden', 'view', 'hidden', 'view', 'approve', 'approve', 'view', 'hidden');
  m['Platform Admin'] = row('view', 'view', 'view', 'view', 'edit', 'view', 'view', 'view', 'approve');
  m['Support Desk'] = row('view', 'view', 'view', 'hidden', 'view', 'hidden', 'hidden', 'hidden', 'view');
  return m;
};

export default function PermissionMatrix({ onToast }: AdminScreenProps) {
  const { record } = useAdmin();
  const { notify, banner } = useNotice(onToast);
  const [grid, setGrid] = useState(seed);
  const [last, setLast] = useState<string | null>(null);

  const set = (role: string, mod: string, to: Level) => {
    const from = grid[role][mod];
    if (from === to) return;
    setGrid(g => ({ ...g, [role]: { ...g[role], [mod]: to } }));
    record({ area: 'Permissions', what: `${role} · ${mod} module`, before: LABEL[from], after: LABEL[to] });
    setLast(`${role}/${mod}`);
    notify(`${role} · ${mod}`, `${LABEL[from]} → ${LABEL[to]} · applies on next request`);
  };
  const cycle = (role: string, mod: string) => set(role, mod, LEVELS[(LEVELS.indexOf(grid[role][mod]) + 1) % LEVELS.length]);

  return (
    <AdminPage title="Permission Matrix" subtitle="What each role can see and do in each module · click a cell to step Hidden › View › Edit › Approve" icon="lock">
      <div className="fade-up flex items-center gap-2 flex-wrap text-[11px] text-navy-600">
        {LEVELS.map(l => <span key={l} className={`px-2 py-0.5 rounded-md border font-bold ${STYLE[l]}`}>{LABEL[l]}</span>)}
        <span>Approve includes Edit; Edit includes View. Changes take effect on the person's next request.</span>
      </div>
      <Card pad={false} title="Role × module" actions={<Badge tone="navy">{ROLES.length} roles · {MODULES.length} modules</Badge>}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse">
            <thead>
              <tr>
                <th className={`${thCls} sticky left-0 z-10`}>Role</th>
                {MODULES.map(m => <th key={m} className={`${thCls} text-center`}>{m}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {ROLES.map(role => (
                <tr key={role}>
                  <th scope="row" className="px-3 py-2 text-left text-xs font-bold text-ink bg-white sticky left-0 z-10 whitespace-nowrap">{role}</th>
                  {MODULES.map(mod => {
                    const lv = grid[role][mod];
                    return (
                      <td key={mod} className="px-1.5 py-1.5 text-center">
                        <button onClick={() => cycle(role, mod)}
                          onKeyDown={e => { const n = Number(e.key); if (n >= 1 && n <= 4) { e.preventDefault(); set(role, mod, LEVELS[n - 1]); } }}
                          aria-label={`${role}, ${mod}: ${LABEL[lv]}. Press to change, or 1 to 4.`}
                          className={`w-full min-w-[72px] px-2 py-1 rounded-md border text-[11px] font-bold btn-press focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400 ${STYLE[lv]} ${last === `${role}/${mod}` ? 'ring-2 ring-leaf-300' : ''}`}>
                          {LABEL[lv]}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="px-4 sm:px-5 py-2.5 border-t border-navy-100 text-[11px] text-navy-500">Keyboard: Tab to a cell, Enter to step, or 1 Hidden · 2 View · 3 Edit · 4 Approve. Every change is written to the audit log.</p>
      </Card>
      {banner}
    </AdminPage>
  );
}
