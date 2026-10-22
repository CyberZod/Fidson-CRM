import { useEffect, useState } from 'react';
import Customer360, { CHANNEL_BADGE, TIER_BADGE } from './Customer360';
import { ACCOUNTS, REP_SCOPE, type Account, type Channel, type ViewerScope } from '../assets/customers';

export type { Account, Channel } from '../assets/customers';

const coverageLabel = (days: number) =>
  days <= 7 ? { t: 'Covered', c: 'text-leaf-700 bg-leaf-50' }
    : days <= 14 ? { t: 'Due soon', c: 'text-amber-700 bg-amber-50' }
      : { t: 'Coverage gap', c: 'text-rose-700 bg-rose-50' };

interface CustomersViewProps {
  extraAccounts?: Account[];
  viewer?: ViewerScope;
}

export default function CustomersView({ extraAccounts = [], viewer = REP_SCOPE }: CustomersViewProps) {
  const book = ACCOUNTS.filter(a => !a.rep || a.rep === viewer.name);
  const allAccounts = [...extraAccounts.map(a => ({ ...a, rep: a.rep ?? viewer.name })), ...book];
  const [filter, setFilter] = useState<'All' | Channel>('All');
  const [selectedId, setSelectedId] = useState<string>(allAccounts[0].id);
  const [mobileDetail, setMobileDetail] = useState(false);

  // When a lead is converted in the pipeline it lands here; surface it.
  useEffect(() => {
    if (extraAccounts.length) setSelectedId(extraAccounts[0].id);
  }, [extraAccounts.length]);

  const shown = filter === 'All' ? allAccounts : allAccounts.filter(a => a.channel === filter);
  const selected = allAccounts.find(a => a.id === selectedId) ?? shown[0] ?? allAccounts[0];

  const covered = allAccounts.filter(a => a.lastVisitDays <= 7).length;
  const gaps = allAccounts.filter(a => a.lastVisitDays > 14).length;
  const avgDays = Math.round(allAccounts.reduce((s, a) => s + a.lastVisitDays, 0) / allAccounts.length);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="fade-up">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">My Customers</h2>
        <p className="text-sm text-navy-500 mt-1">Customer 360 per account · visits, orders, samples, complaints, conversations and commitments</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { l: 'Total Accounts', v: String(allAccounts.length), d: 'allocated · no overlaps', c: 'navy' },
          { l: 'Covered (≤7d)', v: String(covered), d: 'visited this week', c: 'leaf' },
          { l: 'Coverage Gaps', v: String(gaps), d: '>2 weeks unvisited', c: 'rose' },
          { l: 'Avg Days / Visit', v: `${avgDays}d`, d: 'across portfolio', c: 'amber' },
        ].map((k, i) => (
          <div key={i} className={`fade-up stagger-${i + 1} p-4 sm:p-5 rounded-2xl bg-white border border-navy-100`}>
            <p className="stat-label text-navy-400">{k.l}</p>
            <p className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">{k.v}</p>
            <p className={`text-[11px] font-semibold mt-1 ${k.c === 'leaf' ? 'text-leaf-700' : k.c === 'rose' ? 'text-rose-700' : k.c === 'amber' ? 'text-amber-700' : 'text-navy-500'}`}>{k.d}</p>
          </div>
        ))}
      </div>

      <div className={`flex items-center gap-2 flex-wrap ${mobileDetail ? 'hidden lg:flex' : ''}`}>
        {(['All', 'Institution', 'Trade', 'HCP'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold btn-press ${filter === f ? 'bg-navy-800 text-white' : 'bg-white border border-navy-200 text-navy-600 hover:bg-paper'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        <div className={`lg:col-span-2 space-y-2 ${mobileDetail ? 'hidden lg:block' : ''}`}>
          {shown.map(a => {
            const cov = coverageLabel(a.lastVisitDays);
            return (
              <button key={a.id} onClick={() => { setSelectedId(a.id); setMobileDetail(true); }}
                className={`w-full text-left p-4 rounded-2xl border transition-colors ${selected.id === a.id ? 'bg-white border-navy-300 ring-1 ring-navy-200' : 'bg-white border-navy-100 hover:bg-paper'}`}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0 font-display font-bold text-navy-600 text-xs">
                    {a.name.replace(/^(Dr\.|Pharm\.)\s*/i, '').split(' ').slice(0, 2).map(x => x[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-display font-semibold text-sm text-ink truncate">{a.name}</p>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${TIER_BADGE[a.tier]}`}>TIER {a.tier}</span>
                      {a.id.startsWith('conv-') && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-leaf-500 text-white">NEW</span>}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${CHANNEL_BADGE[a.channel]}`}>{a.channel}</span>
                      <span className="text-[11px] text-navy-500">{a.territory}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${cov.c}`}>{cov.t}</span>
                    <p className="text-[10px] text-navy-400 mt-1">{a.lastVisitDays}d ago</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className={`lg:col-span-3 ${mobileDetail ? '' : 'hidden lg:block'}`}>
          <Customer360 key={selected.id} account={selected} viewer={viewer} onClose={mobileDetail ? () => setMobileDetail(false) : undefined} />
        </div>
      </div>
    </div>
  );
}
