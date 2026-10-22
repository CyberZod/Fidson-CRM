import { useEffect, useState } from 'react';
import Icon from './Icon';
import type { ApprovalItem, ApprovalModalItem } from '../types';

// SLA per tier, in minutes.
export const APPROVAL_SLA = { dm: 240, nsm: 480 };

interface ChainRow {
  id: string;
  customer: string;
  rep: string;
  pct: string;
  value: string;
  submittedAt: number;
  atNSM: boolean;
  raw?: ApprovalItem;
}

const STAGES = ['Rep', 'Auto-check', 'RSM', 'DM', 'NSM'];

const fmt = (mins: number) => {
  const m = Math.abs(Math.round(mins));
  return m >= 60 ? `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m` : `${m}m`;
};

interface ApprovalChainMonitorProps {
  approvals?: ApprovalItem[];
  onOpenApproval?: (item: ApprovalItem) => void;
  onEscalateToNSM?: (id: string) => void;
}

export default function ApprovalChainMonitor({ approvals = [], onOpenApproval, onEscalateToNSM }: ApprovalChainMonitorProps) {
  const [base] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [localNSM, setLocalNSM] = useState<Record<string, boolean>>({});
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const ago = (mins: number) => base - mins * 60000;
  const seeded: ChainRow[] = [
    { id: 'chain-1', customer: 'Reddington Hospital', rep: 'Chinedu Eze', pct: '22%', value: '₦1,400,000', submittedAt: ago(312), atNSM: false },
    { id: 'chain-2', customer: 'PHC Med Plaza', rep: 'Tamuno Briggs', pct: '19%', value: '₦820,000', submittedAt: ago(205), atNSM: false },
    { id: 'chain-3', customer: 'Enugu Specialist Hospital', rep: 'Chidi Okeke', pct: '17%', value: '₦540,000', submittedAt: ago(50), atNSM: false },
    { id: 'chain-4', customer: 'Q2 trade promo · 50 distributors', rep: 'Marketing exception', pct: '28%', value: '₦3,200,000', submittedAt: ago(130), atNSM: true },
  ];
  const live: ChainRow[] = approvals.filter(a => a.type === 'discount').map((a, i) => {
    const m = a as ApprovalModalItem;
    return {
      id: a.id, customer: a.customer || a.detail, rep: a.rep, pct: m.requestedDiscount || a.discountPct || '18%',
      value: a.amount, submittedAt: ago(20 + i * 30), atNSM: !!m.escalatedToNSM, raw: a,
    };
  });
  const rows = [...live, ...seeded].map(r => {
    const atNSM = r.atNSM || !!localNSM[r.id];
    const sla = atNSM ? APPROVAL_SLA.nsm : APPROVAL_SLA.dm;
    const left = (r.submittedAt + sla * 60000 - now) / 60000;
    return { ...r, atNSM, left };
  }).sort((a, b) => a.left - b.left);
  const breached = rows.filter(r => r.left < 0).length;

  const escalate = (r: ChainRow) => {
    if (r.raw && onEscalateToNSM) onEscalateToNSM(r.id);
    setLocalNSM(p => ({ ...p, [r.id]: true }));
  };

  return (
    <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-navy-100 flex items-start justify-between gap-2 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <Icon name="clock" size={14} className="text-navy-700" />
            <h3 className="font-display font-bold text-ink">Approval Chain Monitor</h3>
            {breached > 0 && <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white text-[9px] font-bold">{breached} SLA BREACHED</span>}
          </div>
          <p className="text-[10px] text-navy-500 mt-1">Pending discount escalations · SLA {APPROVAL_SLA.dm / 60}h at DM, {APPROVAL_SLA.nsm / 60}h at NSM, counted from submission</p>
        </div>
      </div>
      <div className="divide-y divide-navy-50">
        {rows.map(r => {
          const stageIdx = r.atNSM ? 4 : 3;
          const chip = r.left < 0
            ? { t: `Breached ${fmt(r.left)}`, c: 'bg-rose-500 text-white' }
            : r.left < 60
              ? { t: `${Math.floor(r.left)}:${String(Math.floor((r.left % 1) * 60)).padStart(2, '0')} left`, c: 'bg-amber-100 text-amber-800 border border-amber-300' }
              : { t: `${fmt(r.left)} left`, c: 'bg-leaf-50 text-leaf-700 border border-leaf-200' };
          return (
            <div key={r.id} className={`px-5 py-3 ${r.left < 0 ? 'bg-rose-50/40' : ''}`}>
              <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-xs text-ink truncate">{r.customer}</p>
                  <p className="text-[10px] text-navy-500 truncate">{r.rep} · {r.pct} on {r.value}</p>
                </div>
                <div className="flex items-center gap-0.5" aria-label={`At ${STAGES[stageIdx]}`}>
                  {STAGES.map((s, i) => (
                    <div key={s} className="flex items-center gap-0.5">
                      <span title={s} className={`w-2 h-2 rounded-full ${i < stageIdx ? 'bg-leaf-500' : i === stageIdx ? (r.left < 0 ? 'bg-rose-500' : 'bg-amber-500') : 'bg-navy-200'}`} />
                      {i < STAGES.length - 1 && <span className={`w-2.5 h-px ${i < stageIdx ? 'bg-leaf-400' : 'bg-navy-200'}`} />}
                    </div>
                  ))}
                  <span className="ml-1.5 text-[10px] font-bold text-navy-600 w-8">{STAGES[stageIdx]}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold whitespace-nowrap ${chip.c}`}>{chip.t}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => (r.raw && onOpenApproval ? onOpenApproval(r.raw) : setOpenId(openId === r.id ? null : r.id))}
                    className="px-2 py-1 rounded-md border border-navy-200 text-[10px] font-bold text-navy-700 hover:bg-paper btn-press"
                  >Open</button>
                  {!r.atNSM && (
                    <button onClick={() => escalate(r)} className="px-2 py-1 rounded-md border border-indigo-200 bg-indigo-50 text-indigo-700 text-[10px] font-bold hover:bg-indigo-100 btn-press">→ NSM</button>
                  )}
                </div>
              </div>
              {openId === r.id && (
                <div className="mt-2 p-2.5 rounded-lg bg-paper border border-navy-100 text-[11px] text-navy-700 fade-up">
                  Submitted {new Date(r.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} by {r.rep} · auto-check: above 15% standard limit · RSM endorsed · {r.atNSM ? 'with NSM Bayo Ogunlana for national decision' : 'waiting on DM sign-off'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
