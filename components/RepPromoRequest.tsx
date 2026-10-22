import { useState } from 'react';
import Icon from './Icon';
import { useNotice } from './useNotice';
import { formatNaira } from '../assets/campaigns';
import { LIVE_REP, useMarketing } from '../stores/marketing';
import type { PromoStatus, ToastInput } from '../types';

interface RepPromoRequestProps {
  rep?: string;
  onToast?: (t: ToastInput) => void;
}

const PRODUCTS = ['Coflin Forte 600mg', 'Tuxil-N Syrup 100ml', 'Astrazon 10mg'];
const CHANNELS = [
  { k: 'institution', l: 'Institution' },
  { k: 'trade', l: 'Trade' },
  { k: 'mobile-frontline', l: 'Mobile & Frontline' },
];

const statusChip: Record<PromoStatus, { c: string; l: string }> = {
  pending: { c: 'bg-amber-50 text-amber-700 border-amber-200', l: 'With PM for review' },
  'pm-approved': { c: 'bg-violet-50 text-violet-700 border-violet-200', l: 'Approved · launching soon' },
  rejected: { c: 'bg-rose-50 text-rose-700 border-rose-200', l: 'Not approved' },
  launched: { c: 'bg-leaf-50 text-leaf-700 border-leaf-200', l: 'Live campaign · ROI tracked' },
};

const EMPTY = { title: '', product: PRODUCTS[0], channel: 'institution', scope: '', reach: '', budget: '', rationale: '' };

export default function RepPromoRequest({ rep = LIVE_REP, onToast }: RepPromoRequestProps) {
  const { promoRequests, submitPromo } = useMarketing();
  const { notify, node } = useNotice(onToast);
  const [f, setF] = useState(EMPTY);
  const mine = promoRequests.filter(p => p.rep === rep);
  const budget = Number(f.budget.replace(/[^\d]/g, '')) || 0;
  const valid = f.title && f.scope && budget > 0 && f.rationale;

  const submit = () => {
    if (!valid) return;
    const p = submitPromo({
      rep, title: f.title, product: f.product, channel: f.channel, scope: f.scope,
      estimatedReach: Number(f.reach) || 0, budget, rationale: f.rationale,
    });
    setF(EMPTY);
    notify({ type: 'success', title: 'Promo request sent', msg: `${p.title} · Dr. Femi Akande (PM) will review` });
  };

  const field = 'input-field w-full mt-1.5 px-3 py-2.5 rounded-xl bg-paper border border-navy-200 text-sm text-ink';
  const label = 'text-[10px] font-bold text-navy-700 tracking-wider uppercase';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[760px] mx-auto space-y-5">
      <div className="fade-up">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">Request a Promo</h2>
        <p className="text-sm text-navy-500 mt-1">Pitch a campaign for your territory · your PM approves, launches and tracks the return</p>
      </div>

      <div className="fade-up stagger-1 rounded-2xl bg-white border border-navy-100 p-4 sm:p-5 space-y-4">
        <div>
          <label className={label}>Campaign name</label>
          <input value={f.title} onChange={e => setF({ ...f, title: e.target.value })} placeholder="e.g. Coflin paediatric clinic week · Lekki" className={field} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={label}>Product</label>
            <select value={f.product} onChange={e => setF({ ...f, product: e.target.value })} className={field}>
              {PRODUCTS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Channel</label>
            <div className="mt-1.5 grid grid-cols-3 gap-1.5">
              {CHANNELS.map(c => (
                <button key={c.k} type="button" onClick={() => setF({ ...f, channel: c.k })} className={`py-2.5 rounded-xl border text-[11px] font-bold ${f.channel === c.k ? 'bg-violet-600 border-violet-600 text-white' : 'bg-paper border-navy-200 text-navy-700'}`}>{c.l}</button>
              ))}
            </div>
          </div>
        </div>
        <div>
          <label className={label}>Scope</label>
          <input value={f.scope} onChange={e => setF({ ...f, scope: e.target.value })} placeholder="e.g. 6 hospitals in Lekki / V.I. · 4 weeks" className={field} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Est. HCP reach</label>
            <input inputMode="numeric" value={f.reach} onChange={e => setF({ ...f, reach: e.target.value.replace(/[^\d]/g, '') })} placeholder="60" className={field} />
          </div>
          <div>
            <label className={label}>Budget (₦)</label>
            <input inputMode="numeric" value={f.budget} onChange={e => setF({ ...f, budget: e.target.value.replace(/[^\d]/g, '') })} placeholder="750000" className={field} />
            {budget > 0 && <p className="text-[10px] text-navy-500 mt-1 font-mono">{formatNaira(budget)}</p>}
          </div>
        </div>
        <div>
          <label className={label}>Why this, why now</label>
          <textarea rows={3} value={f.rationale} onChange={e => setF({ ...f, rationale: e.target.value })} placeholder="What you are seeing in the field and the result you expect" className={`${field} resize-none`} />
        </div>
        <button onClick={submit} disabled={!valid} className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-display font-semibold text-sm btn-press disabled:opacity-50 flex items-center justify-center gap-1.5">
          <Icon name="send" size={14} /> Send to PM
        </button>
      </div>

      <div className="fade-up stagger-2 rounded-2xl bg-white border border-navy-100 overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b border-navy-100">
          <h3 className="font-display font-bold text-ink text-sm">My requests</h3>
        </div>
        {mine.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-navy-500">No promo requests yet</p>
        ) : (
          <div className="divide-y divide-navy-50">
            {mine.map(p => {
              const s = statusChip[p.status];
              return (
                <div key={p.id} className="px-4 sm:px-5 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-display font-semibold text-sm text-ink">{p.title}</p>
                      <p className="text-[11px] text-navy-500 mt-0.5">{p.product} · {formatNaira(p.budget)} · {p.date}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold flex-shrink-0 ${s.c}`}>{s.l}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {node}
    </div>
  );
}
