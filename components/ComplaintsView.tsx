import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from './Icon';
import { useFlash } from './TeamFlash';
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_SEVERITIES,
  COMPLAINT_STATUSES,
  SLA_HOURS,
  fmtShortDate,
  pvDueAt,
  slaDueAt,
  useFieldCall,
  type Complaint,
  type ComplaintSeverity,
  type ComplaintStatus,
} from '../stores/fieldCall';
import type { ToastInput } from '../types';

const OWNERS = ['Tunde Bakare', 'Funmi Adeola', 'QA · Ota plant', 'Pharmacovigilance desk', 'Sales Admin'];

export const SEVERITY_STYLE: Record<ComplaintSeverity, string> = {
  Critical: 'bg-rose-600 text-white',
  High: 'bg-rose-50 text-rose-700 border border-rose-200',
  Medium: 'bg-amber-50 text-amber-700 border border-amber-200',
  Low: 'bg-navy-50 text-navy-700 border border-navy-100',
};

export const STATUS_STYLE: Record<ComplaintStatus, string> = {
  New: 'bg-sky-50 text-sky-700',
  Acknowledged: 'bg-violet-50 text-violet-700',
  Investigating: 'bg-amber-50 text-amber-700',
  Resolved: 'bg-leaf-50 text-leaf-700',
};

const clock = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

function durationLabel(ms: number): string {
  const abs = Math.abs(ms);
  const h = Math.floor(abs / 3600000);
  const m = Math.floor((abs % 3600000) / 60000);
  if (h >= 48) return `${Math.floor(h / 24)}d ${h % 24}h`;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function slaState(c: Complaint, now = Date.now()): { label: string; tone: 'ok' | 'warn' | 'breach' | 'met' | 'missed' } {
  const due = slaDueAt(c);
  if (c.status === 'Resolved') {
    const resolvedAt = [...c.events].reverse().find(e => e.text.startsWith('Resolved'))?.at;
    const met = resolvedAt ? new Date(resolvedAt).getTime() <= due : true;
    return { label: met ? 'SLA met' : 'SLA missed', tone: met ? 'met' : 'missed' };
  }
  const left = due - now;
  if (left < 0) return { label: `Overdue ${durationLabel(left)}`, tone: 'breach' };
  return { label: `${durationLabel(left)} left`, tone: left < 0.25 * SLA_HOURS[c.severity] * 3600000 ? 'warn' : 'ok' };
}

const SLA_TONE = {
  ok: 'text-navy-600',
  warn: 'text-amber-700 font-bold',
  breach: 'text-rose-700 font-bold',
  met: 'text-leaf-700',
  missed: 'text-rose-700',
};

const NEXT_STATUS: Partial<Record<ComplaintStatus, { to: ComplaintStatus; label: string }>> = {
  New: { to: 'Acknowledged', label: 'Acknowledge' },
  Acknowledged: { to: 'Investigating', label: 'Start investigation' },
};

interface ComplaintsViewProps {
  currentUserName?: string;
  onToast?: (t: ToastInput) => void;
}

export default function ComplaintsView({ currentUserName = 'Tunde Bakare', onToast }: ComplaintsViewProps) {
  const { complaints, setComplaintStatus, assignComplaint, referToPv } = useFieldCall();
  const { banner, notify } = useFlash(onToast);
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'Open' | 'All'>('Open');
  const [severityFilter, setSeverityFilter] = useState<ComplaintSeverity | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [resolution, setResolution] = useState('');
  const [note, setNote] = useState('');
  const rowRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(t);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return complaints
      .filter(c => statusFilter === 'All' ? true : statusFilter === 'Open' ? c.status !== 'Resolved' : c.status === statusFilter)
      .filter(c => severityFilter === 'All' || c.severity === severityFilter)
      .filter(c => categoryFilter === 'All' || c.category === categoryFilter)
      .filter(c => !q || [c.id, c.customer, c.repName, c.product, c.batch, c.description].join(' ').toLowerCase().includes(q))
      .sort((a, b) => slaDueAt(a) - slaDueAt(b));
  }, [complaints, statusFilter, severityFilter, categoryFilter, query]);

  const selected = complaints.find(c => c.id === selectedId) ?? filtered[0] ?? null;

  useEffect(() => {
    setResolution(selected?.resolutionNote ?? '');
    setNote('');
  }, [selected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const open = complaints.filter(c => c.status !== 'Resolved');
  const breaching = open.filter(c => slaDueAt(c) < now).length;
  const pvPending = complaints.filter(c => c.category === 'Adverse event' && !c.pvReferredAt).length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  const statusCounts: Record<string, number> = {
    Open: open.length,
    All: complaints.length,
    ...Object.fromEntries(COMPLAINT_STATUSES.map(s => [s, complaints.filter(c => c.status === s).length])),
  };

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const idx = filtered.findIndex(c => c.id === selected?.id);
    const next = filtered[Math.min(filtered.length - 1, Math.max(0, idx + (e.key === 'ArrowDown' ? 1 : -1)))];
    if (next) {
      setSelectedId(next.id);
      rowRefs.current[next.id]?.focus();
    }
  };

  const advance = (c: Complaint) => {
    const step = NEXT_STATUS[c.status];
    if (!step) return;
    setComplaintStatus(c.id, step.to, currentUserName, note.trim() || undefined);
    setNote('');
    notify({ type: 'success', title: `${c.id} · ${step.to}`, msg: `${c.repName} sees the new status on their phone` });
  };

  const resolve = (c: Complaint) => {
    if (!resolution.trim()) return;
    setComplaintStatus(c.id, 'Resolved', currentUserName, resolution.trim());
    notify({ type: 'success', title: `${c.id} resolved`, msg: `Resolution sent to ${c.repName} and ${c.customer}` });
  };

  const reopen = (c: Complaint) => {
    setComplaintStatus(c.id, 'Investigating', currentUserName, 'Reopened');
    notify({ type: 'info', title: `${c.id} reopened`, msg: 'Back in investigation' });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-4">
      <div className="fade-up flex items-end justify-between flex-wrap gap-3">
        <div>
          <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">Field complaints</p>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">Complaints queue</h2>
          <p className="text-xs text-navy-500 mt-0.5">Logged by reps during calls · sorted by SLA due time · ↑ ↓ to move through the list</p>
        </div>
        <div className="text-[10px] text-navy-500 font-mono">SLA · Critical {SLA_HOURS.Critical}h · High {SLA_HOURS.High}h · Medium {SLA_HOURS.Medium}h · Low {SLA_HOURS.Low}h</div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 fade-up stagger-1">
        {[
          { l: 'Open', v: open.length, c: 'text-ink' },
          { l: 'Past SLA', v: breaching, c: breaching ? 'text-rose-700' : 'text-ink' },
          { l: 'Adverse events awaiting PV', v: pvPending, c: pvPending ? 'text-rose-700' : 'text-ink' },
          { l: 'Resolved', v: resolvedCount, c: 'text-leaf-700' },
        ].map(k => (
          <div key={k.l} className="p-3 rounded-xl bg-white border border-navy-100">
            <p className="stat-label text-navy-400">{k.l}</p>
            <p className={`font-display text-2xl font-bold mt-0.5 ${k.c}`}>{k.v}</p>
          </div>
        ))}
      </div>

      {banner}

      <div className="rounded-2xl bg-white border border-navy-100 p-3 flex flex-wrap items-center gap-2 fade-up stagger-2">
        <div className="flex items-center gap-1 bg-paper rounded-lg p-1 flex-wrap" role="group" aria-label="Filter by status">
          {(['Open', ...COMPLAINT_STATUSES, 'All'] as const).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              aria-pressed={statusFilter === s}
              className={`px-2.5 py-1.5 rounded-md text-[11px] font-bold flex items-center gap-1.5 ${statusFilter === s ? 'bg-white text-navy-700 shadow-sm' : 'text-navy-500 hover:text-navy-700'}`}
            >
              {s}
              <span className="px-1 rounded text-[9px] bg-navy-100">{statusCounts[s]}</span>
            </button>
          ))}
        </div>
        <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value as ComplaintSeverity | 'All')} aria-label="Filter by severity" className="input-field px-2 py-1.5 rounded-lg bg-paper border border-navy-100 text-xs text-ink">
          <option value="All">All severities</option>
          {COMPLAINT_SEVERITIES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} aria-label="Filter by category" className="input-field px-2 py-1.5 rounded-lg bg-paper border border-navy-100 text-xs text-ink">
          <option value="All">All categories</option>
          {COMPLAINT_CATEGORIES.map(s => <option key={s}>{s}</option>)}
        </select>
        <div className="flex-1 min-w-[180px] flex items-center gap-2 px-2 py-1.5 rounded-lg bg-paper border border-navy-100">
          <Icon name="search" size={13} className="text-navy-400" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search ID, customer, rep, batch" aria-label="Search complaints" className="flex-1 bg-transparent text-xs text-ink focus:outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 rounded-2xl bg-white border border-navy-100 overflow-hidden" onKeyDown={onListKey}>
          <div className="hidden md:grid grid-cols-[90px_1fr_110px_90px_110px_120px] gap-2 px-4 py-2.5 bg-paper border-b border-navy-100 stat-label text-navy-500">
            <span>ID</span><span>Customer · issue</span><span>Category</span><span>Severity</span><span>Status</span><span className="text-right">SLA</span>
          </div>
          {filtered.length === 0 && <p className="py-10 text-center text-sm text-navy-500">No complaints match these filters.</p>}
          <div className="divide-y divide-navy-50" role="listbox" aria-label="Complaints">
            {filtered.map(c => {
              const sla = slaState(c, now);
              const active = selected?.id === c.id;
              return (
                <button
                  key={c.id}
                  ref={el => { rowRefs.current[c.id] = el; }}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full text-left px-4 py-2.5 grid grid-cols-2 md:grid-cols-[90px_1fr_110px_90px_110px_120px] gap-2 items-center transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-navy-300 ${active ? 'bg-navy-50' : 'hover:bg-paper'}`}
                >
                  <span className="font-mono text-xs font-bold text-navy-700 flex items-center gap-1">
                    {c.category === 'Adverse event' && !c.pvReferredAt && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 pulse-dot" />}
                    {c.id}
                  </span>
                  <span className="min-w-0 col-span-2 md:col-span-1 order-last md:order-none">
                    <span className="block text-sm font-semibold text-ink truncate">{c.customer}</span>
                    <span className="block text-[11px] text-navy-500 truncate">{c.product}{c.batch ? ` · ${c.batch}` : ''} · {c.repName}</span>
                  </span>
                  <span className="text-[11px] text-navy-700 hidden md:block">{c.category}</span>
                  <span><span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${SEVERITY_STYLE[c.severity]}`}>{c.severity}</span></span>
                  <span className="hidden md:block"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLE[c.status]}`}>{c.status}</span></span>
                  <span className={`text-[11px] text-right font-mono hidden md:block ${SLA_TONE[sla.tone]}`}>{sla.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="rounded-2xl bg-white border border-navy-100 p-5 space-y-4 lg:sticky lg:top-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-xs font-bold text-navy-500">{selected.id} · logged {fmtShortDate(selected.loggedAt)} {clock(selected.loggedAt)}</p>
                  <h3 className="font-display text-lg font-bold text-ink">{selected.customer}</h3>
                  <p className="text-xs text-navy-500">{selected.hcpName} · by {selected.repName}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLE[selected.status]}`}>{selected.status}</span>
                  <span className={`text-[11px] font-mono ${SLA_TONE[slaState(selected, now).tone]}`}>{slaState(selected, now).label}</span>
                </div>
              </div>

              {selected.category === 'Adverse event' && (
                <div className={`p-3 rounded-xl border ${selected.pvReferredAt ? 'bg-leaf-50 border-leaf-200' : 'bg-rose-50 border-rose-200'}`}>
                  <div className="flex items-start gap-2">
                    <Icon name={selected.pvReferredAt ? 'checkCircle' : 'alert'} size={16} className={selected.pvReferredAt ? 'text-leaf-700 mt-0.5' : 'text-rose-700 mt-0.5'} />
                    <div className="flex-1">
                      <p className={`text-xs font-bold ${selected.pvReferredAt ? 'text-leaf-800' : 'text-rose-800'}`}>
                        {selected.pvReferredAt ? `Referred to Pharmacovigilance · ${clock(selected.pvReferredAt)}` : 'Adverse event · Pharmacovigilance referral due within 24h'}
                      </p>
                      {!selected.pvReferredAt && (
                        <p className="text-[11px] text-rose-700 mt-0.5">
                          {pvDueAt(selected) > now ? `${durationLabel(pvDueAt(selected) - now)} left to refer` : `Referral overdue by ${durationLabel(now - pvDueAt(selected))}`}
                        </p>
                      )}
                    </div>
                    {!selected.pvReferredAt && (
                      <button
                        type="button"
                        onClick={() => { referToPv(selected.id, currentUserName); notify({ type: 'success', title: 'Referred to Pharmacovigilance', msg: `${selected.id} sent to the PV desk with the batch and patient details` }); }}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-bold btn-press flex-shrink-0"
                      >
                        Refer to PV
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-paper"><p className="text-navy-400 font-bold uppercase tracking-wider text-[9px]">Category</p><p className="text-ink font-semibold">{selected.category}</p></div>
                <div className="p-2 rounded-lg bg-paper"><p className="text-navy-400 font-bold uppercase tracking-wider text-[9px]">Severity</p><p className="text-ink font-semibold">{selected.severity} · {SLA_HOURS[selected.severity]}h SLA</p></div>
                <div className="p-2 rounded-lg bg-paper"><p className="text-navy-400 font-bold uppercase tracking-wider text-[9px]">Product</p><p className="text-ink font-semibold">{selected.product}</p></div>
                <div className="p-2 rounded-lg bg-paper"><p className="text-navy-400 font-bold uppercase tracking-wider text-[9px]">Batch</p><p className="text-ink font-semibold font-mono">{selected.batch || 'Not given'}</p></div>
              </div>
              <p className="text-sm text-navy-700 leading-relaxed">{selected.description}</p>

              <div>
                <label htmlFor="cmp-owner" className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">Owner</label>
                <select
                  id="cmp-owner"
                  value={selected.owner}
                  onChange={e => { assignComplaint(selected.id, e.target.value, currentUserName); notify({ type: 'info', title: `Owner set to ${e.target.value}`, msg: selected.id }); }}
                  className="input-field w-full mt-1 px-3 py-2 rounded-lg bg-paper border border-navy-100 text-sm text-ink"
                >
                  {selected.owner === 'Unassigned' && <option>Unassigned</option>}
                  {OWNERS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>

              {selected.status !== 'Resolved' ? (
                <div className="space-y-3">
                  {NEXT_STATUS[selected.status] && (
                    <div className="flex gap-2">
                      <input value={note} onChange={e => setNote(e.target.value)} placeholder="Note (optional)" aria-label="Status note" className="input-field flex-1 min-w-0 px-3 py-2 rounded-lg bg-paper border border-navy-100 text-sm text-ink" />
                      <button type="button" onClick={() => advance(selected)} className="px-3 py-2 rounded-lg bg-navy-700 text-white text-xs font-bold btn-press flex-shrink-0">
                        {NEXT_STATUS[selected.status]!.label}
                      </button>
                    </div>
                  )}
                  <div>
                    <label htmlFor="cmp-res" className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">Resolution note</label>
                    <textarea id="cmp-res" rows={3} value={resolution} onChange={e => setResolution(e.target.value)} placeholder="What was found and what the customer received" className="input-field w-full mt-1 p-3 rounded-xl bg-paper border border-navy-100 text-sm text-ink resize-none" />
                    <button
                      type="button"
                      onClick={() => resolve(selected)}
                      disabled={!resolution.trim()}
                      className="mt-2 w-full py-2.5 rounded-lg bg-leaf-500 hover:bg-leaf-600 text-white text-sm font-bold btn-press disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      <Icon name="checkCircle" size={14} /> Mark resolved
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-leaf-50 border border-leaf-200">
                  <p className="text-[10px] font-bold text-leaf-700 tracking-wider uppercase">Resolution</p>
                  <p className="text-xs text-leaf-900 mt-1 leading-relaxed">{selected.resolutionNote}</p>
                  <button type="button" onClick={() => reopen(selected)} className="mt-2 text-[11px] font-bold text-leaf-700 hover:text-leaf-900 btn-press">Reopen</button>
                </div>
              )}

              <div>
                <p className="stat-label text-navy-400 mb-2">History</p>
                <ol className="space-y-1.5">
                  {selected.events.map((e, i) => (
                    <li key={i} className="flex gap-2 text-[11px]">
                      <span className="font-mono text-navy-400 w-24 flex-shrink-0">{fmtShortDate(e.at)} {clock(e.at)}</span>
                      <span className="text-navy-700"><span className="font-semibold">{e.by}</span> · {e.text}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-white border border-navy-100 p-8 text-center text-sm text-navy-500">Select a complaint to see its details.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Rep-side card: the rep's own complaints and where each one stands.
export function MyComplaints({ repName = 'Adaeze Okafor', limit = 4 }: { repName?: string; limit?: number }) {
  const { complaints } = useFieldCall();
  const mine = complaints.filter(c => c.repName === repName);
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? mine : mine.slice(0, limit);

  return (
    <div className="rounded-2xl bg-white border border-navy-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon name="alert" size={14} className="text-rose-600" />
          <p className="stat-label text-navy-400">My Complaints</p>
        </div>
        <span className="text-[10px] text-navy-500 font-mono">{mine.filter(c => c.status !== 'Resolved').length} open</span>
      </div>
      {mine.length === 0 ? (
        <p className="text-xs text-navy-500">No complaints logged yet. Log one from any visit.</p>
      ) : (
        <div className="space-y-2">
          {shown.map(c => {
            const step = COMPLAINT_STATUSES.indexOf(c.status);
            return (
              <div key={c.id} className="p-3 rounded-xl bg-paper">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-ink truncate">{c.customer}</p>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${STATUS_STYLE[c.status]}`}>{c.status}</span>
                </div>
                <p className="text-[11px] text-navy-500 truncate">{c.id} · {c.category} · {c.product}</p>
                <div className="flex gap-1 mt-2" aria-label={`Step ${step + 1} of 4`}>
                  {COMPLAINT_STATUSES.map((s, i) => (
                    <div key={s} className={`h-1 flex-1 rounded-full ${i <= step ? (c.status === 'Resolved' ? 'bg-leaf-500' : 'bg-navy-700') : 'bg-navy-100'}`} />
                  ))}
                </div>
                {c.status === 'Resolved' && c.resolutionNote && <p className="text-[11px] text-leaf-800 mt-2 leading-relaxed">{c.resolutionNote}</p>}
                {c.status !== 'Resolved' && <p className="text-[10px] text-navy-400 mt-1.5">Owner · {c.owner}</p>}
              </div>
            );
          })}
          {mine.length > limit && (
            <button type="button" onClick={() => setExpanded(e => !e)} className="w-full text-[11px] font-bold text-navy-600 hover:text-navy-800 py-1 btn-press">
              {expanded ? 'Show fewer' : `Show all ${mine.length}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
