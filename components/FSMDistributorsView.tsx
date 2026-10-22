import { useState } from 'react';
import Icon from './Icon';
import ReorderModal from './ReorderModal';
import DistributorAuditModal from './DistributorAuditModal';
import { useNotice } from './useNotice';
import { statusOf, useDistribution, type DistStatus, type Distributor } from '../stores/distribution';
import type { ToastInput } from '../types';

interface FSMDistributorsViewProps {
  onToast?: (t: ToastInput) => void;
}

const statusChip: Record<DistStatus, { chip: string; dot: string }> = {
  critical: { chip: 'bg-rose-50 text-rose-700', dot: 'bg-rose-500' },
  low: { chip: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  healthy: { chip: 'bg-leaf-50 text-leaf-700', dot: 'bg-leaf-500' },
};

const daysColor = (days: number) => (days <= 7 ? 'text-rose-700' : days <= 14 ? 'text-amber-700' : 'text-navy-700');

export default function FSMDistributorsView({ onToast }: FSMDistributorsViewProps) {
  const { distributors, auditDone, auditTotal } = useDistribution();
  const { notify, node } = useNotice(onToast);
  const [reorderFor, setReorderFor] = useState<Distributor | null>(null);
  const [auditFor, setAuditFor] = useState<Distributor | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [onboardRequested, setOnboardRequested] = useState(false);

  const sorted = [...distributors].sort((a, b) => a.days - b.days);

  const actionCell = (d: Distributor, compact = false) => {
    const st = statusOf(d);
    if (d.reorder) {
      return <span className="text-[10px] font-bold text-leaf-700 flex items-center gap-1 justify-end"><Icon name="check" size={10} strokeWidth={3} /> Reorder pushed · {d.reorder.at}</span>;
    }
    if (st !== 'healthy') {
      return <button onClick={() => setReorderFor(d)} className={`${compact ? 'px-2.5 py-1.5' : 'px-3 py-1.5'} rounded-lg bg-amber-500 text-white text-xs font-bold btn-press hover:bg-amber-600`}>Reorder</button>;
    }
    return (
      <button onClick={() => setExpanded(expanded === d.id ? null : d.id)} className="text-navy-400 hover:text-navy-700 p-1" aria-label="Details">
        <Icon name={expanded === d.id ? 'chevronUp' : 'eye'} size={14} />
      </button>
    );
  };

  const auditCell = (d: Distributor) => d.audit ? (
    <div className="text-center">
      <Icon name="check" size={14} className="text-leaf-600 mx-auto" strokeWidth={3} />
      <p className="text-[10px] text-navy-500 mt-0.5">{d.audit.date} · {d.audit.auditor}</p>
    </div>
  ) : (
    <button onClick={() => setAuditFor(d)} className="px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50 text-[10px] font-bold text-amber-700 hover:bg-amber-100 btn-press">Start audit</button>
  );

  const detail = (d: Distributor) => (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
      <div><p className="stat-label text-navy-400">Contact</p><p className="text-ink font-semibold mt-0.5">{d.contact}</p></div>
      <div><p className="stat-label text-navy-400">Focus SKU</p><p className="text-ink font-semibold mt-0.5">{d.sku}</p></div>
      <div><p className="stat-label text-navy-400">Last reorder</p><p className="text-ink font-semibold mt-0.5">{d.reorder ? `${d.reorder.qty} ctn ${d.reorder.sku} · ${d.reorder.at}` : 'None this cycle'}</p></div>
      <div><p className="stat-label text-navy-400">Q2 audit</p><p className="text-ink font-semibold mt-0.5">{d.audit ? `${d.audit.date} · ${d.audit.auditor}${d.audit.signedBy ? ` · signed by ${d.audit.signedBy}` : ''}` : 'Pending'}</p></div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden fade-up">
        <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-display font-bold text-ink">All Distributors · Trade</h3>
            <p className="text-xs text-navy-500 mt-0.5">{distributors.length} distributors · ₦21.3M weekly volume · Q2 audit {auditDone}/{auditTotal}</p>
          </div>
          <button
            onClick={() => { setOnboardRequested(true); notify({ type: 'info', title: 'Onboarding request raised', msg: 'KYC pack and credit form sent to Sales Admin · appears here once approved in Business Central' }); }}
            disabled={onboardRequested}
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 btn-press disabled:opacity-60"
          >
            <Icon name={onboardRequested ? 'clock' : 'plus'} size={12} /> {onboardRequested ? 'Onboarding requested' : 'Onboard Distributor'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full hidden md:table">
            <thead>
              <tr className="bg-paper border-b border-navy-100">
                <th className="px-5 py-3 text-left stat-label text-navy-500">Distributor</th>
                <th className="px-5 py-3 text-left stat-label text-navy-500">Location</th>
                <th className="px-5 py-3 text-right stat-label text-navy-500">Weekly Vol.</th>
                <th className="px-5 py-3 text-center stat-label text-navy-500">Stock Health</th>
                <th className="px-5 py-3 text-center stat-label text-navy-500">Days to S/O</th>
                <th className="px-5 py-3 text-center stat-label text-navy-500">Q2 Audit</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {sorted.map(d => {
                const st = statusOf(d);
                return [
                  <tr key={d.id} className="hover:bg-paper transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-display font-semibold text-sm text-ink">{d.n}</p>
                      <p className="text-[10px] text-navy-500">{d.stock} cartons · {d.sku}</p>
                    </td>
                    <td className="px-5 py-3 text-sm text-navy-500">{d.loc}</td>
                    <td className="px-5 py-3 text-right font-mono text-sm font-bold text-ink">{d.vol}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${statusChip[st].chip}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusChip[st].dot}`} />{st.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center"><p className={`font-mono text-sm font-bold ${daysColor(d.days)}`}>{d.days}d</p></td>
                    <td className="px-5 py-3">{auditCell(d)}</td>
                    <td className="px-5 py-3 text-right">{actionCell(d)}</td>
                  </tr>,
                  expanded === d.id && (
                    <tr key={`${d.id}-x`} className="bg-paper"><td colSpan={7} className="px-5 py-3">{detail(d)}</td></tr>
                  ),
                ];
              })}
            </tbody>
          </table>

          <div className="md:hidden divide-y divide-navy-50">
            {sorted.map(d => {
              const st = statusOf(d);
              return (
                <div key={d.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-display font-semibold text-sm text-ink">{d.n}</p>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${statusChip[st].chip}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusChip[st].dot}`} />{st.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-navy-500 mt-0.5">{d.loc} · {d.vol}/wk · {d.stock} cartons</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-display text-lg font-bold leading-none ${daysColor(d.days)}`}>{d.days}d</p>
                      <p className="text-[10px] text-navy-400">to stock-out</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    {d.audit ? (
                      <span className="text-[10px] text-leaf-700 font-bold flex items-center gap-1"><Icon name="check" size={10} strokeWidth={3} /> Audited {d.audit.date} · {d.audit.auditor}</span>
                    ) : (
                      <button onClick={() => setAuditFor(d)} className="px-2.5 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-[11px] font-bold text-amber-700 btn-press">Start audit</button>
                    )}
                    {actionCell(d, true)}
                  </div>
                  {expanded === d.id && <div className="mt-3 p-3 rounded-lg bg-paper">{detail(d)}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {reorderFor && <ReorderModal distributor={reorderFor} onClose={() => setReorderFor(null)} notify={notify} />}
      {auditFor && <DistributorAuditModal distributor={auditFor} onClose={() => setAuditFor(null)} notify={notify} />}
      {node}
    </div>
  );
}
