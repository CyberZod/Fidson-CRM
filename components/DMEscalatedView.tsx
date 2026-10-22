import { useState } from 'react';
import Icon from './Icon';
import ApprovalChainMonitor from './ApprovalChainMonitor';
import type { ApprovalItem, ApprovalModalItem, EscalatedApproval } from '../types';

interface DMEscalatedViewProps {
  approvals?: ApprovalItem[];
  onOpenApproval?: (item: ApprovalItem) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onEscalateToNSM?: (id: string) => void;
  initialTab?: 'discounts' | 'itineraries';
}

interface UnifiedRow {
  id: string;
  rep: string;
  src: string;
  cust: string;
  value: string;
  disc: string;
  urgent?: boolean;
  ai?: EscalatedApproval['ai'];
  raw?: ApprovalItem;
  escalated?: boolean;
  dismissing?: boolean;
}

interface EscalatedItinerary {
  id: string;
  rep: string;
  area: string;
  rsm: string;
  week: string;
  visits: number;
  reason: string;
  waiting: string;
  plan: { day: string; stops: string }[];
}

const SEED_ITINERARIES: EscalatedItinerary[] = [
  {
    id: 'itin-1', rep: 'Bayo Salami', area: 'Lekki/V.I.', rsm: 'Tunde Bakare', week: 'Week 21 · 18-22 May', visits: 34,
    reason: 'Not decided by RSM within 48 hours · auto-escalated to DM', waiting: '2d 4h',
    plan: [
      { day: 'Mon', stops: 'Lagoon Hospital V.I., Evercare Lekki, HealthPlus V.I.' },
      { day: 'Tue', stops: 'St. Nicholas Hospital, Reddington V.I., MedPlus Lekki' },
      { day: 'Wed', stops: 'Ajah PHC cluster (4 stops)' },
    ],
  },
  {
    id: 'itin-2', rep: 'Ivie Omoruyi', area: 'Benin', rsm: 'Emeka Okoro', week: 'Week 21 · 18-22 May', visits: 41,
    reason: 'RSM asked for DM decision · 30% of visits outside assigned territory (Asaba)', waiting: '6h',
    plan: [
      { day: 'Mon', stops: 'UBTH Benin, Ring Road Pharmacy' },
      { day: 'Tue', stops: 'Federal Medical Centre Asaba, Asaba Specialist (out of territory)' },
      { day: 'Wed', stops: 'Ugbowo Clinic, Uselu Chemists' },
    ],
  },
  {
    id: 'itin-3', rep: 'Ebuka Nnaji', area: 'Onitsha/Aba', rsm: 'Ngozi Achebe', week: 'Week 21 · 18-22 May', visits: 18,
    reason: 'Below minimum 30 planned visits · RSM requested DM exception (2 days of training)', waiting: '1d 2h',
    plan: [
      { day: 'Mon', stops: 'Product training, Enugu office' },
      { day: 'Wed', stops: 'Onitsha Trade Hub, Iweka Road Pharmacy, Borromeo Hospital' },
    ],
  },
];

const customerFromDetail = (detail: string): string => {
  const onIdx = detail.toLowerCase().lastIndexOf(' on ');
  if (onIdx === -1) return detail;
  return detail.slice(onIdx + 4).replace(/ order$/, '').trim();
};

export default function DMEscalatedView({ approvals = [], onOpenApproval, onApprove, onReject, onEscalateToNSM, initialTab = 'discounts' }: DMEscalatedViewProps) {
  const [mockItems, setMockItems] = useState<EscalatedApproval[]>([
    { id: 'esc-3', rep: 'Marketing Dept', src: 'Marketing exception', cust: 'Q2 trade promo · 50 distributors', value: '₦3,200,000', disc: '25%', urgent: true, ai: 'recommend-approve' },
  ]);
  const [tab, setTab] = useState<'discounts' | 'itineraries'>(initialTab);
  const [itins, setItins] = useState(SEED_ITINERARIES);
  const [itinOpen, setItinOpen] = useState<string | null>(null);
  const [itinDone, setItinDone] = useState<Record<string, string>>({});
  const [returnNote, setReturnNote] = useState<Record<string, string>>({});

  const decideItin = (id: string, msg: string) => {
    setItinDone(p => ({ ...p, [id]: msg }));
    setTimeout(() => setItins(prev => prev.filter(i => i.id !== id)), 1800);
  };

  const discountRows: UnifiedRow[] = approvals
    .filter(a => a.type === 'discount')
    .map(a => {
      const modal = a as ApprovalModalItem;
      return {
        id: a.id,
        rep: a.rep,
        src: 'Discount · routed from rep',
        cust: a.customer || customerFromDetail(a.detail),
        value: a.amount,
        disc: modal.requestedDiscount || a.discountPct || ' · ',
        urgent: a.urgent,
        ai: a.urgent ? 'recommend-review' : 'recommend-approve',
        raw: a,
        escalated: modal.escalatedToNSM,
      };
    });
  const mockRows: UnifiedRow[] = mockItems.map(m => ({ ...m }));
  const items: UnifiedRow[] = [...discountRows, ...mockRows];

  const handleApprove = (row: UnifiedRow) => {
    if (row.raw) {
      onApprove?.(row.id);
      return;
    }
    setMockItems(prev => prev.map(i => i.id === row.id ? { ...i, dismissing: true } : i));
    setTimeout(() => setMockItems(prev => prev.filter(i => i.id !== row.id)), 400);
  };

  const handleReject = (row: UnifiedRow) => {
    if (row.raw) {
      onReject?.(row.id);
      return;
    }
    setMockItems(prev => prev.map(i => i.id === row.id ? { ...i, dismissing: true } : i));
    setTimeout(() => setMockItems(prev => prev.filter(i => i.id !== row.id)), 400);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div className="fade-up p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
        <Icon name="alert" size={20} className="text-rose-700 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-display font-bold text-ink">Discount Approvals · DM Tier</p>
          <p className="text-xs text-navy-700 mt-1">All discount requests route here. As Division Manager you hold sign-off authority for the team. RSMs see the activity read-only, PMs have visibility for portfolio-pricing context. Marketing exceptions and escalated itineraries land here too.</p>
        </div>
      </div>

      <div className="flex items-center gap-1 fade-up" role="tablist">
        {([
          { k: 'discounts', l: 'Discount approvals', n: items.length },
          { k: 'itineraries', l: 'Escalated itineraries', n: itins.length },
        ] as const).map(t => (
          <button
            key={t.k}
            role="tab"
            aria-selected={tab === t.k}
            onClick={() => setTab(t.k)}
            className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 ${tab === t.k ? 'bg-navy-700 text-white' : 'bg-white border border-navy-100 text-navy-600 hover:bg-paper'}`}
          >
            {t.l}
            <span className={`px-1.5 rounded text-[10px] ${tab === t.k ? 'bg-white/20' : 'bg-navy-100'}`}>{t.n}</span>
          </button>
        ))}
      </div>

      {tab === 'itineraries' && (
        <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden fade-up">
          <div className="px-5 py-4 border-b border-navy-100">
            <h3 className="font-display font-bold text-ink">Escalated Itineraries · {itins.length}</h3>
            <p className="text-[11px] text-navy-500 mt-0.5">Weekly plans an RSM did not decide within 48 hours, or sent up for a DM exception</p>
          </div>
          <div className="divide-y divide-navy-50">
            {itins.length === 0 && <p className="py-10 text-center text-sm text-navy-500">No itineraries waiting on you</p>}
            {itins.map(it => (
              <div key={it.id} className="px-5 py-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                      <Icon name="calendar" size={18} className="text-amber-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-display font-semibold text-sm text-ink">{it.rep} · {it.area}</p>
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">WAITING {it.waiting.toUpperCase()}</span>
                      </div>
                      <p className="text-[11px] text-navy-500 mt-0.5">{it.week} · {it.visits} visits · RSM {it.rsm}</p>
                      <p className="text-xs text-navy-700 mt-1">{it.reason}</p>
                      <button onClick={() => setItinOpen(itinOpen === it.id ? null : it.id)} className="mt-1 text-[11px] font-bold text-indigo-700 hover:underline">
                        {itinOpen === it.id ? 'Hide plan' : 'View plan'}
                      </button>
                      {itinOpen === it.id && (
                        <div className="mt-2 p-2.5 rounded-lg bg-paper border border-navy-100 space-y-1 fade-up">
                          {it.plan.map(p => (
                            <p key={p.day} className="text-[11px] text-navy-700"><span className="font-bold w-9 inline-block">{p.day}</span>{p.stops}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {itinDone[it.id] ? (
                    <span className="text-xs font-bold text-leaf-700 flex items-center gap-1 flex-shrink-0"><Icon name="checkCircle" size={14} /> {itinDone[it.id]}</span>
                  ) : (
                    <div className="flex flex-col gap-1.5 w-full sm:w-60 flex-shrink-0">
                      <input
                        value={returnNote[it.id] ?? ''}
                        onChange={e => setReturnNote(p => ({ ...p, [it.id]: e.target.value }))}
                        placeholder="Note to RSM (needed to return)"
                        className="input-field px-2.5 py-1.5 rounded-lg bg-paper border border-navy-200 text-xs"
                      />
                      <div className="flex gap-1.5">
                        <button
                          disabled={!(returnNote[it.id] ?? '').trim()}
                          onClick={() => decideItin(it.id, `Returned to ${it.rsm} with note`)}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-navy-200 text-xs font-bold text-navy-700 hover:bg-paper btn-press disabled:opacity-40"
                        >Return to RSM</button>
                        <button onClick={() => decideItin(it.id, `Approved · ${it.rep} and ${it.rsm} notified`)} className="flex-1 px-3 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 btn-press">Approve</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'discounts' && (
        <div className="fade-up">
          <ApprovalChainMonitor approvals={approvals} onOpenApproval={onOpenApproval} onEscalateToNSM={onEscalateToNSM} />
        </div>
      )}

      {tab === 'discounts' && (
      <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden fade-up stagger-1">
        <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between">
          <h3 className="font-display font-bold text-ink">Pending Your Decision · {items.length}</h3>
          <span className="px-2 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">DM TIER</span>
        </div>
        <div className="divide-y divide-navy-50">
          {items.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-14 h-14 rounded-full bg-leaf-50 mx-auto flex items-center justify-center mb-3">
                <Icon name="check" size={24} className="text-leaf-600" strokeWidth={2.5} />
              </div>
              <p className="font-display font-semibold text-ink">All caught up</p>
              <p className="text-xs text-navy-500 mt-1">No escalations pending your decision</p>
            </div>
          ) : items.map(item => (
            <div key={item.id} className={`${item.dismissing ? 'slide-out-up' : ''} px-5 py-4`}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
                  <Icon name="cart" size={18} className="text-rose-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display font-semibold text-sm text-ink">{item.cust}</p>
                    {item.urgent && <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[9px] font-bold">URGENT</span>}
                    <span className="px-1.5 py-0.5 rounded bg-paper text-navy-700 text-[9px] font-bold border border-navy-100">{item.raw ? 'DM SIGN-OFF' : 'MARKETING EXCEPTION'}</span>
                  </div>
                  <p className="text-[11px] text-navy-500 mt-0.5">From {item.src} · Submitted by {item.rep}</p>
                  <div className="mt-2 flex items-center gap-4 flex-wrap">
                    <div>
                      <p className="stat-label text-navy-400">Order Value</p>
                      <p className="font-mono font-bold text-ink text-sm">{item.value}</p>
                    </div>
                    <div>
                      <p className="stat-label text-navy-400">Discount</p>
                      <p className="font-mono font-bold text-rose-700 text-sm">{item.disc}</p>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-paper border border-navy-100">
                      <Icon name="sparkles" size={11} className="text-leaf-700" />
                      <p className="text-[10px] font-bold text-leaf-700">AI: {item.ai === 'recommend-approve' ? 'Approve' : 'Review'}</p>
                    </div>
                  </div>
                </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 w-full sm:w-auto">
                  {item.raw && onOpenApproval && (
                    <button onClick={() => onOpenApproval(item.raw!)} className="flex-1 sm:flex-none px-2.5 py-2 sm:py-1.5 rounded-lg border border-navy-200 text-xs font-bold text-navy-700 hover:bg-paper btn-press">View</button>
                  )}
                  {item.raw && onEscalateToNSM && (
                    item.escalated ? (
                      <span className="px-3 py-2 sm:py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">Escalated to NSM</span>
                    ) : (
                      <button onClick={() => onEscalateToNSM(item.id)} className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 btn-press">Escalate → NSM</button>
                    )
                  )}
                  <button onClick={() => handleReject(item)} className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 rounded-lg border border-navy-200 text-xs font-bold text-navy-700 hover:bg-navy-50 btn-press">Reject</button>
                  <button onClick={() => handleApprove(item)} className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 rounded-lg bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 btn-press">Approve</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}
    </div>
  );
}
