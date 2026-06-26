import { useState } from 'react';
import Icon from './Icon';
import type { IconName } from '../types';

type Channel = 'Institution' | 'Trade' | 'HCP';
type Tier = 'A' | 'B' | 'C';
type EventKind = 'visit' | 'order' | 'discount' | 'intel' | 'commitment';

interface TimelineEvent {
  kind: EventKind;
  date: string;
  title: string;
  detail: string;
}
interface Person {
  name: string;
  role: string;
}
interface Account {
  id: string;
  name: string;
  channel: Channel;
  tier: Tier;
  territory: string;
  address: string;
  phone: string;
  email: string;
  lastVisitDays: number;   // days since last visit — drives coverage
  lifetimeValue: string;
  openCommitments: number;
  people: Person[];
  timeline: TimelineEvent[];
}

// ponytail: seeded accounts with embedded history — production reads these from Postgres,
// joined live from visits/orders/approvals. Names mirror existing demo data so it reads true.
const ACCOUNTS: Account[] = [
  {
    id: 'acc-lakeshore', name: 'Lakeshore Specialist Hospital', channel: 'Institution', tier: 'A',
    territory: 'Lekki Cluster', address: '1 Admiralty Way, Lekki Phase 1, Lagos', phone: '+234 801 234 5678',
    email: 'pharmacy@lakeshore.ng', lastVisitDays: 2, lifetimeValue: '₦18.4M', openCommitments: 1,
    people: [
      { name: 'Dr. Singh', role: 'Chief Pharmacist' },
      { name: 'Dr. Amaka Obi', role: 'Head, Paediatrics' },
    ],
    timeline: [
      { kind: 'commitment', date: 'Today', title: 'Open: Astrazon clinical pack', detail: 'Dr. Singh awaiting paediatric dosing data — due this week' },
      { kind: 'discount', date: '2 days ago', title: '18% discount requested', detail: '₦438,000 order · pending DM sign-off' },
      { kind: 'order', date: '2 days ago', title: 'Order FDS-0428 placed', detail: 'Coflin Forte 600mg · ₦438,000' },
      { kind: 'visit', date: '2 days ago', title: 'Detailing visit', detail: 'Adaeze Okafor · Coflin paediatric ward push' },
      { kind: 'order', date: 'Apr 18', title: 'Order FDS-0391 invoiced', detail: 'Astrazon 10mg · ₦612,000 · paid' },
    ],
  },
  {
    id: 'acc-reddington', name: 'Reddington Hospital', channel: 'Institution', tier: 'A',
    territory: 'V.I. Cluster', address: '12 Idowu Martins St, Victoria Island', phone: '+234 802 345 6789',
    email: 'procurement@reddington.ng', lastVisitDays: 5, lifetimeValue: '₦24.1M', openCommitments: 0,
    people: [{ name: 'Dr. Femi Coker', role: 'Medical Director' }],
    timeline: [
      { kind: 'visit', date: '5 days ago', title: 'Respiratory CM hosted', detail: '25 attendees · ₦650,000 sponsorship' },
      { kind: 'order', date: 'Apr 22', title: 'Order FDS-0427 invoiced', detail: 'Coflin · ₦650,000 · paid' },
    ],
  },
  {
    id: 'acc-medplus', name: 'MedPlus Yaba', channel: 'Trade', tier: 'B',
    territory: 'Mainland Cluster', address: '88 Herbert Macaulay Way, Yaba', phone: '+234 803 456 7890',
    email: 'orders@medplus-yaba.ng', lastVisitDays: 12, lifetimeValue: '₦9.7M', openCommitments: 1,
    people: [{ name: 'Mrs. Bisi Adeyemi', role: 'Branch Pharmacist' }],
    timeline: [
      { kind: 'commitment', date: '12 days ago', title: 'Open: sample promise', detail: 'Tuxil-N samples promised — not yet fulfilled' },
      { kind: 'intel', date: '12 days ago', title: 'Competitor: GSK pressure', detail: 'Augmentin 15% trade discount observed' },
      { kind: 'visit', date: '12 days ago', title: 'Coverage visit', detail: 'Stock low · reorder flagged' },
    ],
  },
  {
    id: 'acc-healthplus', name: 'HealthPlus Surulere', channel: 'Trade', tier: 'B',
    territory: 'Surulere', address: '5 Adeniran Ogunsanya St, Surulere', phone: '+234 804 567 8901',
    email: 'surulere@healthplus.ng', lastVisitDays: 1, lifetimeValue: '₦6.3M', openCommitments: 0,
    people: [{ name: 'Mr. Tunde Bello', role: 'Store Manager' }],
    timeline: [
      { kind: 'discount', date: 'Today', title: '16% discount requested', detail: '₦210,000 order · routed to NSM Trade' },
      { kind: 'order', date: 'Today', title: 'Order FDS-0426 placed', detail: 'Tuxil-N · ₦210,000' },
    ],
  },
  {
    id: 'acc-westend', name: 'WestEnd Distributors Ltd', channel: 'Trade', tier: 'A',
    territory: 'Lagos Trade', address: 'Plot 4 Apapa Industrial Estate', phone: '+234 805 678 9012',
    email: 'supply@westend-dist.ng', lastVisitDays: 22, lifetimeValue: '₦52.8M', openCommitments: 1,
    people: [{ name: 'Chief Okonkwo', role: 'Managing Director' }],
    timeline: [
      { kind: 'commitment', date: '8 days ago', title: 'Open: Q3 bulk scheme', detail: '12% incentive band · escalated to NSM Trade' },
      { kind: 'order', date: 'Apr 20', title: 'Order FDS-0418 invoiced', detail: 'Coflin bulk · ₦4.8M/wk run rate' },
    ],
  },
  {
    id: 'acc-singh', name: 'Dr. Amaka Obi', channel: 'HCP', tier: 'A',
    territory: 'Lekki Cluster', address: 'Lakeshore Specialist Hospital, Paediatrics', phone: '+234 806 789 0123',
    email: 'a.obi@lakeshore.ng', lastVisitDays: 2, lifetimeValue: '—', openCommitments: 1,
    people: [{ name: 'Lakeshore Specialist', role: 'Affiliated Institution' }],
    timeline: [
      { kind: 'commitment', date: 'Today', title: 'Open: paediatric data pack', detail: 'Considering switch from competitor for ENT ward' },
      { kind: 'visit', date: '2 days ago', title: 'Detailing', detail: 'Coflin under-12 indication discussed' },
      { kind: 'intel', date: '2 days ago', title: 'Prescriber signal', detail: 'Open to switching from competitor paediatric line' },
    ],
  },
];

const CHANNEL_BADGE: Record<Channel, string> = {
  Institution: 'bg-violet-100 text-violet-700',
  Trade: 'bg-amber-100 text-amber-700',
  HCP: 'bg-sky-100 text-sky-700',
};
const TIER_BADGE: Record<Tier, string> = {
  A: 'bg-leaf-100 text-leaf-700',
  B: 'bg-navy-100 text-navy-600',
  C: 'bg-navy-50 text-navy-400',
};
const EVENT_STYLE: Record<EventKind, { icon: IconName; color: string }> = {
  visit: { icon: 'location', color: 'text-sky-600 bg-sky-50' },
  order: { icon: 'cart', color: 'text-leaf-700 bg-leaf-50' },
  discount: { icon: 'alert', color: 'text-rose-700 bg-rose-50' },
  intel: { icon: 'flag', color: 'text-violet-700 bg-violet-50' },
  commitment: { icon: 'flask', color: 'text-amber-700 bg-amber-50' },
};

const coverageLabel = (days: number) =>
  days <= 7 ? { t: 'Covered', c: 'text-leaf-700 bg-leaf-50' }
    : days <= 14 ? { t: 'Due soon', c: 'text-amber-700 bg-amber-50' }
      : { t: 'Coverage gap', c: 'text-rose-700 bg-rose-50' };

export default function CustomersView() {
  const [filter, setFilter] = useState<'All' | Channel>('All');
  const [selectedId, setSelectedId] = useState<string>(ACCOUNTS[0].id);

  const shown = filter === 'All' ? ACCOUNTS : ACCOUNTS.filter(a => a.channel === filter);
  const selected = ACCOUNTS.find(a => a.id === selectedId) ?? shown[0] ?? ACCOUNTS[0];

  const covered = ACCOUNTS.filter(a => a.lastVisitDays <= 7).length;
  const gaps = ACCOUNTS.filter(a => a.lastVisitDays > 14).length;
  const avgDays = Math.round(ACCOUNTS.reduce((s, a) => s + a.lastVisitDays, 0) / ACCOUNTS.length);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="fade-up">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">My Customers</h2>
        <p className="text-sm text-navy-500 mt-1">Single view per account · full visit, order &amp; intel history · coverage at a glance</p>
      </div>

      {/* Coverage strip — answers territory & coverage */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { l: 'Total Accounts', v: String(ACCOUNTS.length), d: 'allocated · no overlaps', c: 'navy' },
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

      {/* Segmentation filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['All', 'Institution', 'Trade', 'HCP'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold btn-press ${filter === f ? 'bg-navy-800 text-white' : 'bg-white border border-navy-200 text-navy-600 hover:bg-paper'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        {/* List */}
        <div className="lg:col-span-2 space-y-2">
          {shown.map(a => {
            const cov = coverageLabel(a.lastVisitDays);
            return (
              <button key={a.id} onClick={() => setSelectedId(a.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-colors ${selected.id === a.id ? 'bg-white border-navy-300 ring-1 ring-navy-200' : 'bg-white border-navy-100 hover:bg-paper'}`}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0 font-display font-bold text-navy-600 text-xs">
                    {a.name.split(' ').slice(0, 2).map(x => x[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-display font-semibold text-sm text-ink truncate">{a.name}</p>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${TIER_BADGE[a.tier]}`}>TIER {a.tier}</span>
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

        {/* 360 detail */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-2xl bg-white border border-navy-100 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display text-xl font-bold text-ink">{selected.name}</h3>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${CHANNEL_BADGE[selected.channel]}`}>{selected.channel}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${TIER_BADGE[selected.tier]}`}>TIER {selected.tier}</span>
                </div>
                <p className="text-xs text-navy-500 mt-1">{selected.territory} · owned by territory, not rep</p>
              </div>
              <div className="text-right">
                <p className="stat-label text-navy-400">Lifetime Value</p>
                <p className="font-display text-xl font-bold text-leaf-700">{selected.lifetimeValue}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
              <div className="p-3 rounded-xl bg-paper"><p className="stat-label text-navy-400">Address</p><p className="text-navy-700 mt-0.5">{selected.address}</p></div>
              <div className="p-3 rounded-xl bg-paper"><p className="stat-label text-navy-400">Phone</p><p className="text-navy-700 mt-0.5">{selected.phone}</p></div>
              <div className="p-3 rounded-xl bg-paper"><p className="stat-label text-navy-400">Email</p><p className="text-navy-700 mt-0.5 truncate">{selected.email}</p></div>
            </div>

            <div className="mt-4">
              <p className="stat-label text-navy-400 mb-2">Key People</p>
              <div className="flex flex-wrap gap-2">
                {selected.people.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-paper border border-navy-100">
                    <div className="w-6 h-6 rounded-full bg-navy-100 text-navy-600 font-bold text-[9px] flex items-center justify-center">
                      {p.name.split(' ').map(x => x[0]).join('').slice(0, 2)}
                    </div>
                    <div><p className="text-xs font-semibold text-ink leading-tight">{p.name}</p><p className="text-[10px] text-navy-500 leading-tight">{p.role}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline — the 360 history */}
          <div className="rounded-2xl bg-white border border-navy-100 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-display font-bold text-ink">Account History</h4>
              {selected.openCommitments > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">{selected.openCommitments} open commitment</span>
              )}
            </div>
            <div className="space-y-3">
              {selected.timeline.map((e, i) => {
                const s = EVENT_STYLE[e.kind];
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}>
                      <Icon name={s.icon} size={14} />
                    </div>
                    <div className="flex-1 min-w-0 pb-3 border-b border-navy-50 last:border-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-display font-semibold text-sm text-ink">{e.title}</p>
                        <span className="text-[10px] text-navy-400 flex-shrink-0">{e.date}</span>
                      </div>
                      <p className="text-xs text-navy-600 mt-0.5">{e.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
