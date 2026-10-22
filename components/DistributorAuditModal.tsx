import { useRef, useState, type PointerEvent, type ReactNode } from 'react';
import Icon from './Icon';
import { FSM_NAME, useDistribution, type Distributor } from '../stores/distribution';
import type { ToastInput } from '../types';

interface DistributorAuditModalProps {
  distributor: Distributor;
  onClose: () => void;
  notify: (t: ToastInput) => void;
  auditor?: string;
}

export default function DistributorAuditModal({ distributor: d, onClose, notify, auditor = FSM_NAME }: DistributorAuditModalProps) {
  const { completeAudit, auditDone, auditTotal } = useDistribution();
  const [counted, setCounted] = useState('');
  const [nearExpiry, setNearExpiry] = useState('');
  const [expiryChecked, setExpiryChecked] = useState(false);
  const [temp, setTemp] = useState('');
  const [storageOk, setStorageOk] = useState(false);
  const [pricingOk, setPricingOk] = useState(false);
  const [signedBy, setSignedBy] = useState(d.contact.replace(/^(Mr\.|Mrs\.|Malam|Chief|Alhaji)\s+/, ''));
  const [signed, setSigned] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  const variance = counted ? Number(counted) - d.stock : null;
  const tempNum = Number(temp);
  const checks = [
    { l: 'Stock count', done: counted !== '' },
    { l: 'Expiry check', done: expiryChecked },
    { l: 'Storage conditions', done: storageOk && temp !== '' },
    { l: 'Pricing compliance', done: pricingOk },
    { l: 'Sign-off', done: signed && signedBy.trim() !== '' },
  ];
  const doneCount = checks.filter(c => c.done).length;

  const pos = (e: PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * e.currentTarget.width, y: ((e.clientY - r.top) / r.height) * e.currentTarget.height };
  };
  const down = (e: PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvas.current?.getContext('2d');
    if (!ctx) return;
    drawing.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = pos(e);
    ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.strokeStyle = '#142A5A';
    ctx.beginPath(); ctx.moveTo(p.x, p.y);
  };
  const move = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvas.current?.getContext('2d');
    if (!ctx) return;
    const p = pos(e);
    ctx.lineTo(p.x, p.y); ctx.stroke();
    setSigned(true);
  };
  const clear = () => {
    const c = canvas.current;
    c?.getContext('2d')?.clearRect(0, 0, c.width, c.height);
    setSigned(false);
  };

  const submit = () => {
    completeAudit(d.id, {
      auditor, countedCartons: Number(counted), systemCartons: d.stock, nearExpiry: Number(nearExpiry) || 0,
      tempC: tempNum, pricingOk, signedBy, signature: canvas.current?.toDataURL(),
    });
    notify({ type: 'success', title: 'Audit completed', msg: `${d.n} · ${auditDone + 1} of ${auditTotal} distributors audited this quarter` });
    onClose();
  };

  const row = (n: number, title: string, done: boolean, body: ReactNode) => (
    <div className={`p-3 rounded-xl border ${done ? 'border-leaf-200 bg-leaf-50/40' : 'border-navy-100'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${done ? 'bg-leaf-500 text-white' : 'bg-navy-100 text-navy-600'}`}>
          {done ? <Icon name="check" size={10} strokeWidth={3} /> : n}
        </span>
        <p className="text-sm font-bold text-ink">{title}</p>
      </div>
      {body}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center fade-in" style={{ background: 'rgba(10, 24, 48, 0.5)' }} onClick={onClose}>
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[94vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-display font-bold text-ink">Quarterly Audit · Q2</h3>
            <p className="text-[11px] text-navy-500">{d.n} · {d.loc} · auditor {auditor}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-navy-500">{doneCount}/5</span>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-paper flex items-center justify-center" aria-label="Close"><Icon name="x" size={16} /></button>
          </div>
        </div>
        <div className="p-5 space-y-3">
          {row(1, 'Stock count', checks[0].done, (
            <div className="flex items-center gap-2 flex-wrap">
              <input inputMode="numeric" value={counted} onChange={e => setCounted(e.target.value.replace(/[^\d]/g, ''))} placeholder="Cartons counted" className="input-field w-36 px-3 py-2 rounded-lg bg-paper border border-navy-200 text-sm font-mono" />
              <span className="text-[11px] text-navy-500">System says {d.stock}</span>
              {variance !== null && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${variance === 0 ? 'bg-leaf-50 text-leaf-700' : 'bg-amber-50 text-amber-700'}`}>
                  {variance === 0 ? 'Matches' : `Variance ${variance > 0 ? '+' : ''}${variance}`}
                </span>
              )}
            </div>
          ))}
          {row(2, 'Expiry check', checks[1].done, (
            <div className="flex items-center gap-3 flex-wrap">
              <input inputMode="numeric" value={nearExpiry} onChange={e => setNearExpiry(e.target.value.replace(/[^\d]/g, ''))} placeholder="0" className="input-field w-20 px-3 py-2 rounded-lg bg-paper border border-navy-200 text-sm font-mono" />
              <span className="text-[11px] text-navy-500">cartons expiring within 90 days</span>
              <label className="flex items-center gap-1.5 text-xs text-navy-700 cursor-pointer">
                <input type="checkbox" checked={expiryChecked} onChange={e => setExpiryChecked(e.target.checked)} className="w-4 h-4 accent-leaf-600" /> Batches checked
              </label>
            </div>
          ))}
          {row(3, 'Storage conditions', checks[2].done, (
            <div className="flex items-center gap-3 flex-wrap">
              <input inputMode="decimal" value={temp} onChange={e => setTemp(e.target.value.replace(/[^\d.]/g, ''))} placeholder="°C" className="input-field w-20 px-3 py-2 rounded-lg bg-paper border border-navy-200 text-sm font-mono" />
              {temp !== '' && <span className={`text-[10px] font-bold ${tempNum <= 25 ? 'text-leaf-700' : 'text-rose-700'}`}>{tempNum <= 25 ? 'Within 25°C limit' : 'Above 25°C · flag'}</span>}
              <label className="flex items-center gap-1.5 text-xs text-navy-700 cursor-pointer">
                <input type="checkbox" checked={storageOk} onChange={e => setStorageOk(e.target.checked)} className="w-4 h-4 accent-leaf-600" /> Dry, off the floor, away from light
              </label>
            </div>
          ))}
          {row(4, 'Pricing compliance', checks[3].done, (
            <label className="flex items-center gap-1.5 text-xs text-navy-700 cursor-pointer">
              <input type="checkbox" checked={pricingOk} onChange={e => setPricingOk(e.target.checked)} className="w-4 h-4 accent-leaf-600" /> Selling price matches the Fidson trade price list
            </label>
          ))}
          {row(5, 'Sign-off', checks[4].done, (
            <div className="space-y-2">
              <input value={signedBy} onChange={e => setSignedBy(e.target.value)} placeholder="Distributor representative" className="input-field w-full px-3 py-2 rounded-lg bg-paper border border-navy-200 text-sm" />
              <div className="relative">
                <canvas
                  ref={canvas}
                  width={440}
                  height={110}
                  onPointerDown={down}
                  onPointerMove={move}
                  onPointerUp={() => { drawing.current = false; }}
                  className="w-full h-[110px] rounded-lg border border-dashed border-navy-300 bg-paper touch-none"
                />
                {!signed && <p className="absolute inset-0 flex items-center justify-center text-[11px] text-navy-400 pointer-events-none">Sign here</p>}
              </div>
              {signed && <button onClick={clear} className="text-[11px] font-bold text-navy-500 hover:text-rose-600">Clear signature</button>}
            </div>
          ))}
        </div>
        <div className="px-5 py-4 border-t border-navy-100 flex gap-2 sticky bottom-0 bg-white">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-navy-200 text-sm font-bold text-navy-700 hover:bg-paper btn-press">Cancel</button>
          <button onClick={submit} disabled={doneCount < 5} className="flex-1 py-2.5 rounded-lg bg-leaf-600 text-white text-sm font-bold hover:bg-leaf-700 btn-press disabled:opacity-50 flex items-center justify-center gap-1.5">
            <Icon name="check" size={14} strokeWidth={3} /> Complete audit
          </button>
        </div>
      </div>
    </div>
  );
}
