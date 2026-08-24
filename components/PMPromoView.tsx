import { useMemo, useState } from 'react';
import Icon from './Icon';
import { formatNaira } from '../assets/campaigns';
import type { PromoRequest, PromoStatus } from '../types';

interface PMPromoViewProps {
  promoRequests: PromoRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onLaunch: (id: string) => void;
}

type FilterKey = 'pending' | 'approved' | 'all';

const channelLabel: Record<string, string> = {
  institution: 'Institution',
  trade: 'Trade',
  'mobile-frontline': 'Mobile & Frontline',
};

const statusChip: Record<PromoStatus, { bg: string; label: string }> = {
  pending: { bg: 'bg-amber-100 text-amber-700', label: 'AWAITING PM' },
  'pm-approved': { bg: 'bg-violet-100 text-violet-700', label: 'PM APPROVED' },
  rejected: { bg: 'bg-rose-100 text-rose-700', label: 'REJECTED' },
  launched: { bg: 'bg-leaf-100 text-leaf-700', label: 'LAUNCHED' },
};

export default function PMPromoView({ promoRequests, onApprove, onReject, onLaunch }: PMPromoViewProps) {
  const [filter, setFilter] = useState<FilterKey>('pending');

  const filtered = useMemo(() => {
    if (filter === 'pending') return promoRequests.filter(p => p.status === 'pending');
    if (filter === 'approved') return promoRequests.filter(p => p.status === 'pm-approved' || p.status === 'launched');
    return promoRequests;
  }, [filter, promoRequests]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto animate-fade-in">
      <div className="fade-up p-4 rounded-2xl bg-violet-50 border border-violet-200 flex items-start gap-3">
        <Icon name="sparkles" size={20} className="text-violet-700 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-display font-bold text-ink">Promo Requests · PM Tier</p>
          <p className="text-xs text-navy-700 mt-1">Larger promotional campaigns submitted by the field. Sign off here and (optionally) launch as a tracked Campaign · that's when the ROI clock starts and material dispatch kicks off.</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden fade-up stagger-1">
        <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-display font-bold text-ink">{filtered.length} request{filtered.length === 1 ? '' : 's'}</h3>
            <p className="text-xs text-navy-500 mt-0.5">Approve to move into Campaign Engine.</p>
          </div>
          <div className="flex items-center gap-1 bg-paper rounded-lg p-1">
            {([{ k: 'pending', l: 'Pending' }, { k: 'approved', l: 'Approved' }, { k: 'all', l: 'All' }] as { k: FilterKey; l: string }[]).map(f => (
              <button
                key={f.k}
                onClick={() => setFilter(f.k)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                  filter === f.k ? 'bg-white text-violet-700 shadow-sm' : 'text-navy-500'
                }`}
              >{f.l}</button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-navy-50">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-navy-500">No promo requests in this view.</div>
          ) : filtered.map(p => {
            const chip = statusChip[p.status];
            return (
              <div key={p.id} className={`${p.dismissing ? 'slide-out-up' : ''} px-5 py-4 hover:bg-paper transition-colors`}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                    <Icon name="trending" size={18} className="text-violet-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-display font-semibold text-sm text-ink">{p.title}</p>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${chip.bg}`}>{chip.label}</span>
                      <span className="px-1.5 py-0.5 rounded bg-paper text-navy-700 text-[9px] font-bold border border-navy-100">{channelLabel[p.channel] || p.channel.toUpperCase()}</span>
                    </div>
                    <p className="text-[11px] text-navy-500 mt-0.5">Submitted by {p.rep} on {p.date} · Product: <strong>{p.product}</strong> · Scope: {p.scope}</p>
                    <div className="mt-2 flex items-center gap-4 flex-wrap text-[11px]">
                      <span>Reach: <strong>{p.estimatedReach}</strong></span>
                      <span>Budget: <strong className="font-mono">{formatNaira(p.budget)}</strong></span>
                    </div>
                    <p className="text-xs text-navy-700 bg-paper p-3 rounded-lg border border-navy-100 mt-2 italic">"{p.rationale}"</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    {p.status === 'pending' && (
                      <>
                        <button onClick={() => onApprove(p.id)} className="px-3 py-1.5 rounded-lg bg-violet-500 text-white text-xs font-bold hover:bg-violet-600 btn-press">Approve</button>
                        <button onClick={() => onReject(p.id)} className="px-3 py-1.5 rounded-lg border border-navy-200 text-xs font-bold text-navy-700 hover:bg-navy-50 btn-press">Reject</button>
                      </>
                    )}
                    {p.status === 'pm-approved' && (
                      <button onClick={() => onLaunch(p.id)} className="px-3 py-1.5 rounded-lg bg-leaf-600 text-white text-xs font-bold hover:bg-leaf-700 btn-press flex items-center gap-1">
                        <Icon name="send" size={11} /> Launch as Campaign
                      </button>
                    )}
                    {p.status === 'launched' && (
                      <span className="px-2 py-1 rounded-full bg-leaf-50 text-leaf-700 border border-leaf-200 text-[10px] font-bold flex items-center gap-1">
                        <Icon name="check" size={10} strokeWidth={3} /> Tracking ROI
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
