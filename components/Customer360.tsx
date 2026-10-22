import { useMemo, useRef, useState } from 'react';
import Icon from './Icon';
import type { IconName } from '../types';
import {
  canView, eventDaysAgo, scopeLine, TERRITORY_SHORT,
  type Account, type Channel, type EventKind, type TimelineEvent, type ViewerScope,
} from '../assets/customers';

interface Customer360Props {
  account: Account;
  viewer: ViewerScope;
  onClose?: () => void;
}

export const CHANNEL_BADGE: Record<Channel, string> = {
  Institution: 'bg-violet-100 text-violet-700',
  Trade: 'bg-amber-100 text-amber-700',
  HCP: 'bg-sky-100 text-sky-700',
};
export const TIER_BADGE: Record<Account['tier'], string> = {
  A: 'bg-leaf-100 text-leaf-700',
  B: 'bg-navy-100 text-navy-600',
  C: 'bg-navy-50 text-navy-400',
};

export const EVENT_STYLE: Record<EventKind, { icon: IconName; color: string; label: string; plural: string }> = {
  visit: { icon: 'location', color: 'text-sky-600 bg-sky-50', label: 'Visit', plural: 'Visits' },
  order: { icon: 'cart', color: 'text-leaf-700 bg-leaf-50', label: 'Order', plural: 'Orders' },
  sample: { icon: 'package', color: 'text-violet-700 bg-violet-50', label: 'Sample', plural: 'Samples' },
  complaint: { icon: 'alert', color: 'text-rose-700 bg-rose-50', label: 'Complaint', plural: 'Complaints' },
  conversation: { icon: 'mail', color: 'text-navy-700 bg-navy-50', label: 'Conversation', plural: 'Conversations' },
  commitment: { icon: 'flag', color: 'text-amber-700 bg-amber-50', label: 'Commitment', plural: 'Commitments' },
  discount: { icon: 'trending', color: 'text-rose-700 bg-rose-50', label: 'Discount', plural: 'Discounts' },
  intel: { icon: 'eye', color: 'text-violet-700 bg-violet-50', label: 'Intel', plural: 'Intel' },
};

const SECTIONS: EventKind[] = ['visit', 'order', 'sample', 'complaint', 'conversation', 'commitment'];
const CHIP_KINDS: EventKind[] = ['visit', 'order', 'sample', 'complaint', 'conversation', 'commitment', 'discount', 'intel'];

type RangeKey = '7' | '30' | '90' | 'all' | 'custom';
const RANGES: { k: RangeKey; l: string }[] = [
  { k: '7', l: '7 days' }, { k: '30', l: '30 days' }, { k: '90', l: '90 days' }, { k: 'all', l: 'All' }, { k: 'custom', l: 'Custom' },
];

const isoDaysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};
const daysSince = (iso: string) => Math.round((Date.now() - new Date(`${iso}T12:00:00`).getTime()) / 86400000);

function EventRow({ e }: { e: TimelineEvent }) {
  const s = EVENT_STYLE[e.kind];
  return (
    <div className="flex items-start gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}>
        <Icon name={s.icon} size={14} />
      </div>
      <div className="flex-1 min-w-0 pb-3 border-b border-navy-50 last:border-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-display font-semibold text-sm text-ink">{e.title}</p>
          <span className="text-[10px] text-navy-400 flex-shrink-0 mt-0.5">{e.date}</span>
        </div>
        <p className="text-xs text-navy-600 mt-0.5">{e.detail}</p>
        {(e.medium || e.by || e.status) && (
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            {e.medium && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-navy-100 text-navy-700">{e.medium}</span>}
            {e.status && <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${/open|overdue|pending|awaiting/i.test(e.status) ? 'bg-amber-100 text-amber-700' : 'bg-leaf-100 text-leaf-700'}`}>{e.status}</span>}
            {e.by && <span className="text-[10px] text-navy-400">by {e.by}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function LockedPanel({ account, viewer, onClose }: Customer360Props) {
  const [requested, setRequested] = useState(false);
  return (
    <div className="rounded-2xl bg-white border border-navy-100 p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-rose-50 mx-auto flex items-center justify-center"><Icon name="lock" size={24} className="text-rose-600" /></div>
      <p className="font-display text-lg font-bold text-ink mt-3">Outside your territory · no access</p>
      <p className="text-sm text-navy-600 mt-1">{account.name} sits in {TERRITORY_SHORT[account.territory] ?? account.territory} ({account.region ?? 'another region'}), which is outside the scope of {viewer.name} ({viewer.role}).</p>
      <p className="text-[11px] text-navy-400 mt-2">{scopeLine(account)}</p>
      <div className="flex justify-center gap-2 mt-4">
        {onClose && <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-navy-200 text-xs font-bold text-navy-600 btn-press">Back</button>}
        <button type="button" disabled={requested} onClick={() => setRequested(true)}
          className="px-4 py-2 rounded-lg bg-navy-800 text-white text-xs font-bold btn-press disabled:bg-leaf-600">
          {requested ? `Request sent to RSM ${account.region ?? ''}`.trim() : 'Request access'}
        </button>
      </div>
    </div>
  );
}

// One page per customer. Same component for rep (My Customers) and RSM (HCPs & Customers).
export default function Customer360({ account, viewer, onClose }: Customer360Props) {
  const [kinds, setKinds] = useState<EventKind[]>([]);
  const [range, setRange] = useState<RangeKey>('90');
  const [from, setFrom] = useState(isoDaysAgo(30));
  const [to, setTo] = useState(isoDaysAgo(0));
  const [notes, setNotes] = useState<Record<string, TimelineEvent[]>>({});
  const [open, setOpen] = useState<EventKind[]>([]);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [noteMedium, setNoteMedium] = useState<'Call' | 'Email' | 'WhatsApp'>('Call');
  const [noteText, setNoteText] = useState('');
  const [noteOpen, setNoteOpen] = useState(false);
  const timers = useRef<number[]>([]);

  const events = useMemo(
    () => [...(notes[account.id] ?? []), ...account.timeline].sort((a, b) => eventDaysAgo(a) - eventDaysAgo(b)),
    [account, notes],
  );

  if (!canView(viewer, account)) return <LockedPanel account={account} viewer={viewer} onClose={onClose} />;

  const counts = CHIP_KINDS.reduce((m, k) => ({ ...m, [k]: events.filter(e => e.kind === k).length }), {} as Record<EventKind, number>);

  const inRange = (e: TimelineEvent) => {
    const d = eventDaysAgo(e);
    if (range === 'all') return true;
    if (range === 'custom') return d <= daysSince(from) && d >= daysSince(to);
    return d <= Number(range);
  };
  const shown = events.filter(e => (kinds.length === 0 || kinds.includes(e.kind)) && inRange(e));

  const toggleKind = (k: EventKind) => setKinds(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]);

  // Sections stay collapsed and fetch on first open, to spare mobile data.
  const toggleSection = (k: EventKind) => {
    const key = `${account.id}:${k}`;
    setOpen(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]);
    if (!loaded[key] && !loading[key]) {
      setLoading(p => ({ ...p, [key]: true }));
      timers.current.push(window.setTimeout(() => {
        setLoading(p => ({ ...p, [key]: false }));
        setLoaded(p => ({ ...p, [key]: true }));
      }, 700));
    }
  };

  const addNote = () => {
    if (!noteText.trim()) return;
    const e: TimelineEvent = {
      kind: 'conversation', medium: noteMedium, date: 'Just now', daysAgo: 0,
      title: `${noteMedium} note`, detail: noteText.trim(), by: viewer.name,
    };
    setNotes(p => ({ ...p, [account.id]: [e, ...(p[account.id] ?? [])] }));
    setNoteText('');
    setNoteOpen(false);
  };

  const openComplaints = events.filter(e => e.kind === 'complaint' && /open/i.test(e.status ?? '')).length;
  const openCommitments = events.filter(e => e.kind === 'commitment' && /open|overdue/i.test(e.status ?? '')).length;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white border border-navy-100 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {onClose && (
                <button type="button" onClick={onClose} aria-label="Back" className="w-8 h-8 -ml-1 rounded-lg flex items-center justify-center text-navy-500 hover:bg-paper"><Icon name="chevronLeft" size={16} /></button>
              )}
              <h3 className="font-display text-xl font-bold text-ink">{account.name}</h3>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${CHANNEL_BADGE[account.channel]}`}>{account.channel}</span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${TIER_BADGE[account.tier]}`}>TIER {account.tier}</span>
            </div>
            <p className="text-xs text-navy-500 mt-1">{account.territory}{account.rep ? ` · covered by ${account.rep}` : ''} · owned by territory, not rep</p>
          </div>
          <div className="text-right">
            <p className="stat-label text-navy-400">Lifetime Value</p>
            <p className="font-display text-xl font-bold text-leaf-700">{account.lifetimeValue}</p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-navy-50 text-[11px] text-navy-700">
          <Icon name="lock" size={12} className="text-navy-500 flex-shrink-0" />
          <span>{scopeLine(account)}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
          <div className="p-3 rounded-xl bg-paper"><p className="stat-label text-navy-400">Address</p><p className="text-navy-700 mt-0.5">{account.address}</p></div>
          <div className="p-3 rounded-xl bg-paper"><p className="stat-label text-navy-400">Phone</p><p className="text-navy-700 mt-0.5">{account.phone}</p></div>
          <div className="p-3 rounded-xl bg-paper"><p className="stat-label text-navy-400">Email</p><p className="text-navy-700 mt-0.5 truncate">{account.email}</p></div>
        </div>

        <div className="mt-4">
          <p className="stat-label text-navy-400 mb-2">Key People</p>
          <div className="flex flex-wrap gap-2">
            {account.people.map((p, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-paper border border-navy-100">
                <div className="w-6 h-6 rounded-full bg-navy-100 text-navy-600 font-bold text-[9px] flex items-center justify-center">
                  {p.name.replace(/^(Dr\.|Pharm\.|Mr\.|Mrs\.|Chief)\s*/i, '').split(' ').map(x => x[0]).join('').slice(0, 2)}
                </div>
                <div><p className="text-xs font-semibold text-ink leading-tight">{p.name}</p><p className="text-[10px] text-navy-500 leading-tight">{p.role}</p></div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4">
          {SECTIONS.map(k => (
            <div key={k} className="p-2 rounded-xl bg-paper text-center">
              <p className="font-display text-lg font-bold text-ink">{counts[k]}</p>
              <p className="text-[10px] text-navy-500">{EVENT_STYLE[k].plural}</p>
            </div>
          ))}
        </div>
        {(openComplaints > 0 || openCommitments > 0) && (
          <div className="flex flex-wrap gap-2 mt-2">
            {openCommitments > 0 && <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">{openCommitments} open commitment{openCommitments > 1 ? 's' : ''}</span>}
            {openComplaints > 0 && <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">{openComplaints} open complaint{openComplaints > 1 ? 's' : ''}</span>}
          </div>
        )}
      </div>

      {/* Timeline with type chips and date range */}
      <div className="rounded-2xl bg-white border border-navy-100 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h4 className="font-display font-bold text-ink">Timeline</h4>
          <button type="button" onClick={() => setNoteOpen(o => !o)} className="px-3 py-1.5 rounded-lg bg-navy-800 text-white text-[11px] font-bold flex items-center gap-1 btn-press">
            <Icon name="plus" size={12} /> Log conversation
          </button>
        </div>

        {noteOpen && (
          <div className="mb-4 p-3 rounded-xl bg-paper border border-navy-100 space-y-2 fade-up">
            <div className="grid grid-cols-3 gap-2">
              {(['Call', 'Email', 'WhatsApp'] as const).map(m => (
                <button key={m} type="button" aria-pressed={noteMedium === m} onClick={() => setNoteMedium(m)}
                  className={`min-h-[40px] rounded-lg text-xs font-bold btn-press ${noteMedium === m ? 'bg-navy-800 text-white' : 'bg-white border border-navy-200 text-navy-600'}`}>{m}</button>
              ))}
            </div>
            <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={2} placeholder="What was said, and any next step"
              className="w-full px-3 py-2 rounded-lg bg-white border border-navy-200 text-sm focus:outline-none focus:border-navy-400" />
            <button type="button" onClick={addNote} disabled={!noteText.trim()} className="w-full min-h-[40px] rounded-lg bg-leaf-600 text-white text-xs font-bold btn-press disabled:opacity-50">Save note</button>
          </div>
        )}

        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1" role="group" aria-label="Filter by type">
          <button type="button" onClick={() => setKinds([])} aria-pressed={kinds.length === 0}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap btn-press ${kinds.length === 0 ? 'bg-navy-800 text-white' : 'bg-white border border-navy-200 text-navy-600'}`}>All {events.length}</button>
          {CHIP_KINDS.filter(k => counts[k] > 0).map(k => (
            <button key={k} type="button" onClick={() => toggleKind(k)} aria-pressed={kinds.includes(k)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap btn-press flex items-center gap-1 ${kinds.includes(k) ? 'bg-navy-800 text-white' : 'bg-white border border-navy-200 text-navy-600'}`}>
              <Icon name={EVENT_STYLE[k].icon} size={11} /> {EVENT_STYLE[k].plural} {counts[k]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap mt-2">
          <Icon name="calendar" size={13} className="text-navy-400" />
          <div className="flex items-center gap-1 bg-paper rounded-lg p-1">
            {RANGES.map(r => (
              <button key={r.k} type="button" onClick={() => setRange(r.k)} aria-pressed={range === r.k}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${range === r.k ? 'bg-white text-navy-700 shadow-sm' : 'text-navy-500'}`}>{r.l}</button>
            ))}
          </div>
          {range === 'custom' && (
            <div className="flex items-center gap-1.5 text-[11px] text-navy-500">
              <input type="date" value={from} max={to} onChange={e => setFrom(e.target.value)} aria-label="From date" className="px-2 py-1 rounded-md border border-navy-200 text-xs" />
              <span>to</span>
              <input type="date" value={to} min={from} onChange={e => setTo(e.target.value)} aria-label="To date" className="px-2 py-1 rounded-md border border-navy-200 text-xs" />
            </div>
          )}
        </div>

        <p className="text-[11px] text-navy-500 mt-3 mb-2">{shown.length} of {events.length} events</p>
        {shown.length === 0 ? (
          <p className="py-6 text-center text-sm text-navy-500">Nothing in this range. Widen the dates or clear a filter.</p>
        ) : (
          <div className="space-y-3">{shown.map((e, i) => <EventRow key={`${e.title}-${i}`} e={e} />)}</div>
        )}
      </div>

      {/* Lazy-loaded detail sections */}
      <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-navy-100 flex items-center justify-between">
          <h4 className="font-display font-bold text-ink">Details by type</h4>
          <span className="text-[10px] text-navy-400">Loads on open · saves mobile data</span>
        </div>
        {SECTIONS.map(k => {
          const key = `${account.id}:${k}`;
          const isOpen = open.includes(k);
          const rows = events.filter(e => e.kind === k);
          return (
            <div key={k} className="border-b border-navy-50 last:border-0">
              <button type="button" onClick={() => toggleSection(k)} aria-expanded={isOpen}
                className="w-full min-h-[52px] px-5 py-3 flex items-center gap-3 text-left hover:bg-paper">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${EVENT_STYLE[k].color}`}><Icon name={EVENT_STYLE[k].icon} size={14} /></div>
                <span className="flex-1 text-sm font-semibold text-ink">{EVENT_STYLE[k].plural}</span>
                <span className="text-[10px] text-navy-400">{loaded[key] ? `${rows.length} loaded` : `${rows.length} · ~${Math.max(1, rows.length * 2)} KB`}</span>
                <Icon name={isOpen ? 'chevronUp' : 'chevronDown'} size={14} className="text-navy-400" />
              </button>
              {isOpen && (
                <div className="px-5 pb-4">
                  {loading[key] ? (
                    <div className="space-y-2" aria-busy="true">
                      <div className="ai-shimmer h-10 rounded-lg bg-navy-50" />
                      <div className="ai-shimmer h-10 rounded-lg bg-navy-50" />
                      <p className="text-[10px] text-navy-400">Loading {EVENT_STYLE[k].plural.toLowerCase()}…</p>
                    </div>
                  ) : rows.length === 0 ? (
                    <p className="text-xs text-navy-500">No {EVENT_STYLE[k].plural.toLowerCase()} recorded.</p>
                  ) : (
                    <div className="space-y-3">{rows.map((e, i) => <EventRow key={i} e={e} />)}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
