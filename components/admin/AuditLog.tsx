import { useMemo, useState } from 'react';
import Icon from '../Icon';
import { useAdmin, AUDIT_AREAS, formatAuditTime, type AuditArea } from '../../stores/admin';
import { AdminPage, Card, Btn, Badge, SearchBox, Stat, useNotice, inputCls, thCls, tdCls, downloadCsv, type AdminScreenProps } from './kit';

// AC 6.9: every admin config change is recorded with who, what, before and after, when, and from where.
const toDateInput = (d: Date) => d.toISOString().slice(0, 10);

export default function AuditLog({ onToast }: AdminScreenProps) {
  const { audit } = useAdmin();
  const { notify, banner } = useNotice(onToast);
  const [q, setQ] = useState('');
  const [who, setWho] = useState('All');
  const [area, setArea] = useState<'All' | AuditArea>('All');
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  const [from, setFrom] = useState(toDateInput(monthAgo));
  const [to, setTo] = useState(toDateInput(new Date()));
  const [open, setOpen] = useState<string | null>(null);

  const people = useMemo(() => Array.from(new Set(audit.map(a => a.who))), [audit]);

  const rows = audit.filter(a => {
    const day = a.at.slice(0, 10);
    if (from && day < from) return false;
    if (to && day > to) return false;
    if (who !== 'All' && a.who !== who) return false;
    if (area !== 'All' && a.area !== area) return false;
    if (q) {
      const s = `${a.what} ${a.before} ${a.after} ${a.who} ${a.area}`.toLowerCase();
      if (!s.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  const today = toDateInput(new Date());
  const todayCount = audit.filter(a => a.at.slice(0, 10) === today).length;

  const exportCsv = () => {
    downloadCsv(`fieldforce-audit-${today}.csv`, [
      ['When', 'Who', 'Area', 'Change', 'Before', 'After', 'IP', 'Device'],
      ...rows.map(a => [formatAuditTime(a.at), a.who, a.area, a.what, a.before, a.after, a.ip, a.device]),
    ]);
    notify('Audit log exported', `${rows.length} entries · CSV downloaded`);
  };

  const reset = () => { setQ(''); setWho('All'); setArea('All'); setFrom(toDateInput(monthAgo)); setTo(today); };

  return (
    <AdminPage title="Audit Log" icon="file" subtitle="Every configuration change in the admin console · append-only · kept 7 years"
      actions={<Btn kind="primary" icon="download" onClick={exportCsv} disabled={!rows.length}>Export CSV</Btn>}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Entries" value={audit.length} note="all time in this demo" />
        <Stat label="Today" value={todayCount} note="changes made today" tone="leaf" />
        <Stat label="People" value={people.length} note="made changes" />
        <Stat label="Shown" value={rows.length} note="match the filters" tone="amber" />
      </div>

      <Card pad={false}>
        <div className="p-3 sm:p-4 border-b border-navy-100 flex flex-wrap items-end gap-2">
          <SearchBox value={q} onChange={setQ} placeholder="Search changes" />
          <label className="text-xs">
            <span className="stat-label text-navy-500 block mb-1">Who</span>
            <select className={inputCls + ' !py-1.5 sm:w-52'} value={who} onChange={e => setWho(e.target.value)}>
              <option>All</option>
              {people.map(p => <option key={p}>{p}</option>)}
            </select>
          </label>
          <label className="text-xs">
            <span className="stat-label text-navy-500 block mb-1">Area</span>
            <select className={inputCls + ' !py-1.5 sm:w-44'} value={area} onChange={e => setArea(e.target.value as 'All' | AuditArea)}>
              <option>All</option>
              {AUDIT_AREAS.map(a => <option key={a}>{a}</option>)}
            </select>
          </label>
          <label className="text-xs">
            <span className="stat-label text-navy-500 block mb-1">From</span>
            <input type="date" className={inputCls + ' !py-1.5'} value={from} onChange={e => setFrom(e.target.value)} />
          </label>
          <label className="text-xs">
            <span className="stat-label text-navy-500 block mb-1">To</span>
            <input type="date" className={inputCls + ' !py-1.5'} value={to} onChange={e => setTo(e.target.value)} />
          </label>
          <Btn kind="ghost" icon="refresh" onClick={reset}>Reset</Btn>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead>
              <tr>
                <th className={thCls}>When</th>
                <th className={thCls}>Who</th>
                <th className={thCls}>Area</th>
                <th className={thCls}>Change</th>
                <th className={thCls}>Before → After</th>
                <th className={thCls}>Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {rows.map(a => (
                <tr key={a.id} tabIndex={0} onClick={() => setOpen(open === a.id ? null : a.id)}
                  onKeyDown={e => { if (e.key === 'Enter') setOpen(open === a.id ? null : a.id); }}
                  className="hover:bg-paper cursor-pointer focus:outline-none focus-visible:bg-leaf-50">
                  <td className={tdCls + ' whitespace-nowrap font-mono text-[11px]'}>{formatAuditTime(a.at)}</td>
                  <td className={tdCls + ' whitespace-nowrap font-semibold text-ink'}>{a.who}</td>
                  <td className={tdCls}><Badge tone="muted">{a.area}</Badge></td>
                  <td className={tdCls}>{a.what}</td>
                  <td className={tdCls}>
                    <span className="text-rose-700 line-through decoration-rose-300">{a.before || 'None'}</span>
                    <span className="mx-1.5 text-navy-400">→</span>
                    <span className="text-leaf-700 font-semibold">{a.after || 'None'}</span>
                  </td>
                  <td className={tdCls + ' whitespace-nowrap'}>
                    <span className="font-mono text-[11px]">{a.ip}</span>
                    {open === a.id && <p className="text-[11px] text-navy-500 mt-0.5">{a.device}</p>}
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={6} className="px-3 py-10 text-center text-sm text-navy-500">
                  <Icon name="search" size={18} className="mx-auto mb-2 text-navy-300" />
                  No entries match these filters.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-navy-100 bg-navy-50/40 text-[11px] text-navy-500">
          Entries cannot be edited or deleted from the console. Select a row to see the device it came from.
        </div>
      </Card>
      {banner}
    </AdminPage>
  );
}
