import { useState } from 'react';
import Icon from './Icon';
import { useTeam, repsFor, MANAGERS, isoDay, type ManagerKey, type UpwardReceipt } from '../stores/team';
import type { ToastInput } from '../types';

export interface SummaryKpi {
  l: string;
  v: string;
  d?: string;
}

interface UpwardSummaryProps {
  from: ManagerKey;
  to: string;
  kpis: SummaryKpi[];
  defaultNote: string;
  period?: string;
  onToast?: (t: ToastInput) => void;
  onClose?: () => void;
  onSent?: (r: UpwardReceipt) => void;
}

// One-click upward summary: KPIs compiled from the platform, one editable note, one Send.
export default function UpwardSummary({ from, to, kpis, defaultNote, period = 'This week', onToast, onClose, onSent }: UpwardSummaryProps) {
  const { coaching, ownVisits, jointVisits, training, sendUpward, receipts } = useTeam();
  const [note, setNote] = useState(defaultNote);
  const [sent, setSent] = useState<UpwardReceipt | null>(null);
  const names = repsFor(from).map(r => r.name);
  const mineTraining = training.filter(t => names.includes(t.rep));
  const doneTraining = mineTraining.filter(t => t.status === 'done').length;
  const weekAgo = isoDay(-7);

  const activityKpis: SummaryKpi[] = [
    { l: 'Coaching logged', v: String(coaching.filter(c => c.by === from && c.date >= weekAgo).length), d: 'notes, 1:1s, micro-coaching' },
    { l: 'Field time', v: String(ownVisits.filter(v => v.by === from && v.date >= weekAgo).length + jointVisits.filter(v => v.by === from && v.date >= weekAgo).length), d: 'own visits and joint calls' },
    { l: 'Training done', v: `${doneTraining}/${mineTraining.length}`, d: 'assigned modules' },
  ];
  const all = [...kpis, ...activityKpis];
  const past = receipts.filter(r => r.from === from);

  const send = () => {
    const r = sendUpward(from, to, note.trim() || 'No commentary added.');
    setSent(r);
    onToast?.({ type: 'success', title: `Summary sent to ${to}`, msg: `${period} · ${all.length} KPIs + your note` });
    onSent?.(r);
  };

  return (
    <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-navy-100 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">{period} · auto-compiled</p>
          <h3 className="font-display font-bold text-ink">Summary to {to}</h3>
          <p className="text-[11px] text-navy-500 mt-0.5">From {MANAGERS[from].name} ({MANAGERS[from].role}) · {MANAGERS[from].scope}</p>
        </div>
        {onClose && (
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-lg hover:bg-paper flex items-center justify-center">
            <Icon name="x" size={16} className="text-navy-500" />
          </button>
        )}
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {all.map(k => (
            <div key={k.l} className="p-3 rounded-xl bg-paper border border-navy-100">
              <p className="stat-label text-navy-400">{k.l}</p>
              <p className="font-display text-lg font-bold text-ink mt-0.5">{k.v}</p>
              {k.d && <p className="text-[10px] text-navy-500">{k.d}</p>}
            </div>
          ))}
        </div>

        <div>
          <label className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">Your note</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={4} disabled={!!sent}
            className="input-field w-full mt-1.5 p-3 rounded-xl bg-paper border border-navy-200 text-sm resize-none disabled:opacity-70" />
        </div>

        {sent ? (
          <div className="p-3 rounded-xl bg-leaf-50 border border-leaf-200 flex items-center gap-2">
            <Icon name="checkCircle" size={16} className="text-leaf-600" />
            <p className="text-sm font-semibold text-leaf-800 flex-1">Sent to {sent.to} · {sent.at}</p>
            {onClose && <button onClick={onClose} className="text-xs font-bold text-leaf-700">Done</button>}
          </div>
        ) : (
          <button onClick={send} className="w-full py-3 rounded-xl bg-navy-700 hover:bg-navy-800 text-white font-display font-semibold text-sm btn-press flex items-center justify-center gap-2">
            <Icon name="send" size={14} /> Send to {to}
          </button>
        )}

        {past.length > 0 && !sent && (
          <p className="text-[11px] text-navy-400">Last sent to {past[0].to} at {past[0].at}</p>
        )}
      </div>
    </div>
  );
}
