import { useState } from 'react';
import Icon from './Icon';
import ReorderModal from './ReorderModal';
import DistributorAuditModal from './DistributorAuditModal';
import { useNotice } from './useNotice';
import { statusOf, useDistribution, type DistStatus, type Distributor } from '../stores/distribution';
import type { ApprovalItem, ApprovalModalItem, ToastInput } from '../types';

interface FSMDashboardProps {
  onNavigate: (view: string) => void;
  approvals?: ApprovalItem[];
  onEscalateToNSM?: (id: string) => void;
  onToast?: (t: ToastInput) => void;
}

const DIST_COLORS: Record<DistStatus, { bar: string; badge: string; text: string }> = {
  critical: { bar: 'bg-rose-500', badge: 'bg-rose-100 text-rose-700', text: 'text-rose-700' },
  low: { bar: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700', text: 'text-amber-700' },
  healthy: { bar: 'bg-leaf-500', badge: 'bg-leaf-100 text-leaf-700', text: 'text-leaf-700' },
};

export default function FSMDashboard({ onNavigate, approvals = [], onEscalateToNSM, onToast }: FSMDashboardProps) {
  const tradeEscalations = approvals.filter(a => a.nsmChannel === 'Trade');
  const { distributors: all, auditDone, auditTotal } = useDistribution();
  const { notify, node } = useNotice(onToast);
  const [reorderFor, setReorderFor] = useState<Distributor | null>(null);
  const [auditFor, setAuditFor] = useState<Distributor | null>(null);
  const distributors = [...all].sort((a, b) => a.days - b.days).slice(0, 5);
  const counts = { critical: 0, low: 0, healthy: 0 } as Record<DistStatus, number>;
  all.forEach(d => { counts[statusOf(d)]++; });
  const atRisk = all.filter(d => statusOf(d) !== 'healthy' && !d.reorder).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="fade-up">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold tracking-wider uppercase">Trade Channel</span>
              <span className="text-xs text-navy-500">South-West Region</span>
            </div>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-ink">
              Welcome, <span style={{ background: 'linear-gradient(135deg, #142A5A 0%, #D97706 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Ifeanyi</span>
            </h2>
            <p className="text-sm text-navy-500 mt-1">8 trade reps active · 12 distributors under management · You report to DM Trade</p>
          </div>
          <button onClick={() => onNavigate('fsm-distributors')} className="px-3 py-2 rounded-lg bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 btn-press hover:bg-amber-600">
            <Icon name="alert" size={14} /> {atRisk ? `${atRisk} stock-out alert${atRisk === 1 ? '' : 's'}` : 'No open stock alerts'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { l: 'Trade Pipeline', v: '₦28.4M', d: '62 active orders', c: 'amber' },
          { l: 'Distributors', v: String(all.length), d: `${counts.healthy} healthy · ${counts.low} low · ${counts.critical} critical`, c: 'amber' },
          { l: 'Avg. Order Cycle', v: '4.2 days', d: '−0.8 vs Q1', c: 'leaf' },
          { l: 'Quarterly Audit', v: `${auditDone}/${auditTotal}`, d: auditDone === auditTotal ? 'All audited' : `${auditTotal - auditDone} distributors pending`, c: auditDone === auditTotal ? 'leaf' : 'amber' },
        ].map((k, i) => (
          <div key={i} className={`fade-up stagger-${i + 1} p-4 sm:p-5 rounded-2xl bg-white border border-navy-100`}>
            <p className="stat-label text-navy-400">{k.l}</p>
            <p className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">{k.v}</p>
            <p className={`text-[11px] font-semibold mt-1 ${k.c === 'leaf' ? 'text-leaf-700' : k.c === 'amber' ? 'text-amber-700' : 'text-navy-500'}`}>{k.d}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {tradeEscalations.length > 0 && (
            <div className="fade-up rounded-2xl bg-white border border-indigo-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-indigo-100 bg-indigo-50/50 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-display font-bold text-ink flex items-center gap-2"><Icon name="alert" size={16} className="text-indigo-700" /> Escalate to NSM Trade</h3>
                  <p className="text-xs text-navy-500 mt-0.5">Trade exceptions above your sign-off · distributor schemes &amp; discounts routed to national</p>
                </div>
                <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">FSM TIER</span>
              </div>
              <div className="divide-y divide-navy-50">
                {tradeEscalations.map(a => {
                  const escalated = (a as ApprovalModalItem).escalatedToNSM;
                  return (
                    <div key={a.id} className="px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-display font-semibold text-sm text-ink truncate">{a.customer || a.detail}</p>
                          {a.urgent && <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[9px] font-bold">URGENT</span>}
                        </div>
                        <p className="text-[11px] text-navy-500 mt-0.5">{a.detail} · {a.rep}</p>
                        <div className="mt-1.5 flex items-center gap-4">
                          <div><p className="stat-label text-navy-400">Value</p><p className="font-mono font-bold text-ink text-sm">{a.amount}</p></div>
                          {a.discountPct && <div><p className="stat-label text-navy-400">Discount</p><p className="font-mono font-bold text-amber-700 text-sm">{a.discountPct}</p></div>}
                        </div>
                      </div>
                      {onEscalateToNSM && (escalated ? (
                        <span className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 self-start">Escalated to NSM Trade</span>
                      ) : (
                        <button onClick={() => onEscalateToNSM(a.id)} className="px-3 py-2 sm:py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 btn-press self-start">Escalate → NSM Trade</button>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="fade-up rounded-2xl bg-white border border-navy-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-display font-bold text-ink">Distributor Health Monitor</h3>
                <p className="text-xs text-navy-500 mt-0.5">Real-time stock balance · Auto-alerts on threshold breach</p>
              </div>
              <button onClick={() => onNavigate('fsm-distributors')} className="text-xs font-semibold text-amber-700">View all {all.length} →</button>
            </div>
            <div className="divide-y divide-navy-50">
              {distributors.map(d => {
                const st = statusOf(d);
                const c = DIST_COLORS[st];
                return (
                  <div key={d.id} className="px-5 py-3 hover:bg-paper transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <Icon name="package" size={16} className="text-amber-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-display font-semibold text-sm text-ink truncate">{d.n}</p>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${c.badge}`}>{st.toUpperCase()}</span>
                        </div>
                        <p className="text-[11px] text-navy-500">{d.loc} · ~{d.vol}/wk · {d.sku} focus</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-display text-lg font-bold ${c.text}`}>{d.days}d</p>
                        <p className="text-[10px] text-navy-400">to stock-out</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pl-12">
                      <div className="flex-1 h-1.5 rounded-full bg-navy-100 overflow-hidden max-w-xs">
                        <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${Math.min(100, (d.stock / 80) * 100)}%` }} />
                      </div>
                      <span className="text-[10px] font-mono text-navy-500">{d.stock} cartons</span>
                      {d.reorder ? (
                        <span className="ml-auto text-[10px] font-bold text-leaf-700 flex items-center gap-1"><Icon name="check" size={10} strokeWidth={3} /> Reorder pushed · {d.reorder.at}</span>
                      ) : st !== 'healthy' && (
                        <button onClick={() => setReorderFor(d)} className={`ml-auto px-2 py-1 rounded-md text-white text-[10px] font-bold btn-press ${st === 'critical' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-amber-500 hover:bg-amber-600'}`}>Push Reorder</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="fade-up stagger-1 rounded-2xl bg-white border border-navy-100 p-5">
            <h3 className="font-display font-bold text-ink mb-4">Trade Order Velocity · 8 weeks</h3>
            <div className="flex items-end gap-2 h-32">
              {[58, 64, 52, 72, 68, 78, 82, 88].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${h}%`,
                      background: i === 7 ? '#D97706' : '#FCD34D',
                      opacity: 0.6 + (i * 0.05),
                    }}
                  />
                  <span className="text-[10px] font-mono text-navy-400">W{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="fade-up stagger-2 rounded-2xl bg-white border border-amber-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-amber-100 bg-amber-50/50">
              <div className="flex items-center gap-2">
                <Icon name="calendar" size={16} className="text-amber-700" />
                <h3 className="font-display font-bold text-ink text-sm">Q2 Distributor Audit</h3>
              </div>
              <p className="text-[11px] text-amber-700 mt-0.5">Per Fidson policy: quarterly stock balance check</p>
            </div>
            <div className="p-3 space-y-1.5">
              <div className="px-2 pb-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] font-bold text-navy-500 tracking-wider uppercase">Progress</span>
                  <span className="font-mono text-xs font-bold text-ink">{auditDone}/{auditTotal}</span>
                </div>
                <div className="h-1.5 mt-1 rounded-full bg-navy-100 overflow-hidden">
                  <div className="h-full rounded-full bg-leaf-500 transition-all duration-700" style={{ width: `${(auditDone / auditTotal) * 100}%` }} />
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto space-y-1.5">
                {all.map(d => (
                  <div key={d.id} className={`p-2 rounded-lg flex items-center gap-2 ${d.audit ? 'bg-leaf-50' : 'bg-paper'}`}>
                    <div className={`w-4 h-4 rounded ${d.audit ? 'bg-leaf-500' : 'border-2 border-navy-300'} flex items-center justify-center flex-shrink-0`}>
                      {d.audit && <Icon name="check" size={10} className="text-white" strokeWidth={3} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs truncate ${d.audit ? 'text-navy-500' : 'text-navy-700 font-semibold'}`}>{d.n}</p>
                      {d.audit && <p className="text-[10px] text-navy-400">{d.audit.date} · {d.audit.auditor}</p>}
                    </div>
                    {!d.audit && <button onClick={() => setAuditFor(d)} className="ml-auto px-2 py-1 rounded-md bg-amber-500 text-white text-[10px] font-bold btn-press hover:bg-amber-600">Audit</button>}
                  </div>
                ))}
              </div>
              <div className="px-2 pt-2 border-t border-navy-100">
                <p className="text-[10px] text-navy-500">
                  {auditDone === auditTotal ? 'All distributors audited for Q2.' : `${auditTotal - auditDone} of ${auditTotal} distributors still pending audit. Due May 31.`}
                </p>
              </div>
            </div>
          </div>

          <div className="fade-up stagger-2 rounded-2xl bg-white border border-navy-100 p-5">
            <h3 className="font-display font-bold text-ink text-sm mb-3 flex items-center gap-2"><Icon name="sparkles" size={14} className="text-leaf-700" /> AI Alerts</h3>
            <div className="space-y-2">
              {[
                { t: 'Region behind target', d: 'SW Trade 88% to Q2 · Ibadan zone lagging', c: 'amber' },
                { t: 'Distributor stock low', d: all.find(d => d.id === 'd-01')?.reorder ? `PHC Pharmacy 6 days cover · reorder pushed ${all.find(d => d.id === 'd-01')?.reorder?.at}` : 'PHC Pharmacy 6 days cover · reorder flagged', c: 'rose' },
                { t: 'Conversion alert', d: 'WestEnd order cycle slowing vs W20', c: 'amber' },
              ].map((al, i) => (
                <div key={i} className={`p-2.5 rounded-lg border ${al.c === 'rose' ? 'bg-rose-50 border-rose-100' : 'bg-amber-50 border-amber-100'}`}>
                  <p className={`text-xs font-bold ${al.c === 'rose' ? 'text-rose-700' : 'text-amber-700'}`}>{al.t}</p>
                  <p className="text-[11px] text-navy-600 mt-0.5">{al.d}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="fade-up stagger-3 rounded-2xl bg-white border border-navy-100 p-5">
            <h3 className="font-display font-bold text-ink text-sm mb-3">Top Trade Reps</h3>
            <div className="space-y-2">
              {[
                { n: 'Babatunde Owolabi', z: 'Lagos Trade', v: '₦8.2M' },
                { n: 'Chioma Igwe', z: 'Ibadan', v: '₦5.4M' },
                { n: 'Sodiq Ajao', z: 'Abeokuta', v: '₦4.1M' },
              ].map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-display font-bold text-[10px] flex items-center justify-center">
                    {r.n.split(' ').map(x => x[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-display font-semibold text-ink truncate">{r.n}</p>
                    <p className="text-[10px] text-navy-500">{r.z}</p>
                  </div>
                  <p className="font-mono text-xs font-bold text-amber-700">{r.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {reorderFor && <ReorderModal distributor={reorderFor} onClose={() => setReorderFor(null)} notify={notify} />}
      {auditFor && <DistributorAuditModal distributor={auditFor} onClose={() => setAuditFor(null)} notify={notify} />}
      {node}
    </div>
  );
}
