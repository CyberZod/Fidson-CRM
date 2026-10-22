import { useState } from 'react';
import Icon from './Icon';
import { suggestReorder, useDistribution, type Distributor } from '../stores/distribution';
import type { ToastInput } from '../types';

interface ReorderModalProps {
  distributor: Distributor;
  onClose: () => void;
  notify: (t: ToastInput) => void;
}

const SKUS = ['Coflin Forte 600mg', 'Tuxil-N Syrup 100ml', 'Astrazon 10mg'];

export default function ReorderModal({ distributor: d, onClose, notify }: ReorderModalProps) {
  const { pushReorder } = useDistribution();
  const s = suggestReorder(d);
  const [sku, setSku] = useState(SKUS.includes(d.sku) ? d.sku : SKUS[0]);
  const [qty, setQty] = useState(String(s.qty));
  const recipientsAll = [
    { k: 'dist', l: `${d.contact} · purchasing, ${d.n}`, def: true },
    { k: 'bc', l: 'Sales Admin · Business Central order desk', def: true },
    { k: 'rep', l: `Trade rep covering ${d.loc}`, def: true },
    { k: 'dm', l: 'DM Trade (copy)', def: false },
  ];
  const [recipients, setRecipients] = useState<string[]>(recipientsAll.filter(r => r.def).map(r => r.k));
  const n = Number(qty) || 0;

  const push = () => {
    const names = recipientsAll.filter(r => recipients.includes(r.k)).map(r => r.l.split(' · ')[0]);
    const rec = pushReorder(d.id, { sku, qty: n, recipients: names });
    notify({ type: 'success', title: `Reorder pushed · ${rec.at}`, msg: `${n} cartons ${sku} · ${d.n} · sent to ${names.length} recipients` });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center fade-in" style={{ background: 'rgba(10, 24, 48, 0.5)' }} onClick={onClose}>
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-ink">Push Reorder</h3>
            <p className="text-[11px] text-navy-500">{d.n} · {d.loc}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-paper flex items-center justify-center" aria-label="Close"><Icon name="x" size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-navy-700">
            <p className="font-bold text-amber-700 mb-1">Suggested from days to stock-out</p>
            {d.stock} cartons on hand · about {s.perDay.toFixed(1)} cartons a day · {d.days} days to stock-out.
            Ordering <strong className="font-mono">{s.qty}</strong> brings cover to about {s.coverAfter} days after a 5-day delivery.
          </div>
          <div>
            <label className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">SKU</label>
            <select value={sku} onChange={e => setSku(e.target.value)} className="input-field w-full mt-1.5 px-3 py-2 rounded-lg bg-paper border border-navy-200 text-sm">
              {SKUS.map(x => <option key={x}>{x}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">Quantity (cartons)</label>
            <div className="mt-1.5 flex items-center gap-2">
              <input inputMode="numeric" value={qty} onChange={e => setQty(e.target.value.replace(/[^\d]/g, ''))} className="input-field flex-1 px-3 py-2 rounded-lg bg-paper border border-navy-200 text-sm font-mono" />
              {n !== s.qty && <button onClick={() => setQty(String(s.qty))} className="text-[11px] font-bold text-amber-700">Use {s.qty}</button>}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-navy-700 tracking-wider uppercase mb-1.5">Send to</p>
            <div className="space-y-1.5">
              {recipientsAll.map(r => (
                <label key={r.k} className="flex items-center gap-2 p-2 rounded-lg bg-paper cursor-pointer">
                  <input
                    type="checkbox"
                    checked={recipients.includes(r.k)}
                    onChange={() => setRecipients(p => p.includes(r.k) ? p.filter(x => x !== r.k) : [...p, r.k])}
                    className="w-4 h-4 accent-amber-500"
                  />
                  <span className="text-xs text-navy-700">{r.l}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-navy-100 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-navy-200 text-sm font-bold text-navy-700 hover:bg-paper btn-press">Cancel</button>
          <button onClick={push} disabled={n <= 0 || recipients.length === 0} className="flex-1 py-2.5 rounded-lg bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 btn-press disabled:opacity-50 flex items-center justify-center gap-1.5">
            <Icon name="send" size={14} /> Push {n} cartons
          </button>
        </div>
      </div>
    </div>
  );
}
