import { useEffect, useState } from 'react';
import Icon from './Icon';
import { useFlash } from './TeamFlash';
import { useTeam, isoDay, untilLabel, shortDate } from '../stores/team';
import type { ItineraryPending, AdjustmentPending, RepVisit, ToastInput, EscalationStatus } from '../types';

const DELEGATES = ['Funmi Adeola (ASM)', 'Gbenga Ojo (ASM)', 'Kemi Adeyemi (DM)'];

const fmtLeft = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m ${String(s % 60).padStart(2, '0')}s`;
};

const seedFor = (status: EscalationStatus | undefined, imminentMin: number, timeoutMin: number, i: number) => {
  const now = Date.now();
  if (status === 'escalated') return now - 60_000;
  if (status === 'imminent') return now + imminentMin * 60_000;
  return now + Math.max(timeoutMin * 0.5, timeoutMin - (i + 1) * timeoutMin * 0.15) * 60_000;
};

const DAYS: { k: string; l: string }[] = [
  { k: 'mon', l: 'Mon' }, { k: 'tue', l: 'Tue' }, { k: 'wed', l: 'Wed' },
  { k: 'thu', l: 'Thu' }, { k: 'fri', l: 'Fri' },
];
const toMin = (t: string) => { const [h, m] = (t || '').split(':').map(Number); return h * 60 + (m || 0); };

interface RSMItinerariesViewProps {
  itinerariesPending: ItineraryPending[];
  adjustmentsPending: AdjustmentPending[];
  onApproveItinerary: (id: string) => void;
  onRejectItinerary: (id: string) => void;
  onApproveAdjustment: (id: string) => void;
  onRejectAdjustment: (id: string) => void;
  onToast?: (t: ToastInput) => void;
}

type Tab = 'weekly' | 'daily';

export default function RSMItinerariesView({
  itinerariesPending,
  adjustmentsPending,
  onApproveItinerary,
  onRejectItinerary,
  onApproveAdjustment,
  onRejectAdjustment,
  onToast,
}: RSMItinerariesViewProps) {
  const [tab, setTab] = useState<Tab>('weekly');
  const [expandedItin, setExpandedItin] = useState<string | null>(null);
  const { delegation, setDelegation, timeouts, deadlines, seedDeadlines, setDeadline } = useTeam();
  const { banner, notify } = useFlash(onToast);
  const [showDelegate, setShowDelegate] = useState(false);
  const [dForm, setDForm] = useState({ to: DELEGATES[0], from: isoDay(), until: isoDay(2), reason: '' });
  const [now, setNow] = useState(Date.now());
  const dmName = timeouts.escalateTo;

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    const seeds: Record<string, number> = {};
    itinerariesPending.forEach((it, i) => { seeds[it.id] = seedFor(it.escalationStatus, 75, timeouts.itineraryMinutes, i); });
    adjustmentsPending.forEach((a, i) => { seeds[a.id] = seedFor(a.escalationStatus, 5, timeouts.adjustmentMinutes, i); });
    seedDeadlines(seeds);
  }, [itinerariesPending, adjustmentsPending]);

  const clockFor = (id: string, urgentUnderMin: number) => {
    const at = deadlines[id];
    if (at == null) return { escalated: false, left: '', urgent: false };
    const ms = at - now;
    return { escalated: ms <= 0, left: fmtLeft(ms), urgent: ms < urgentUnderMin * 60_000 };
  };

  const pullBack = (id: string, minutes: number, who: string) => {
    setDeadline(id, Date.now() + minutes * 60_000);
    notify({ type: 'info', title: `Pulled back from ${dmName}`, msg: `${who} · back in your queue · clock reset` });
  };

  const saveDelegation = () => {
    if (!dForm.reason.trim() || dForm.until < dForm.from) return;
    setDelegation({ to: dForm.to, from: dForm.from, until: dForm.until, reason: dForm.reason.trim() });
    setShowDelegate(false);
    notify({ type: 'success', title: `Approvals delegated to ${dForm.to}`, msg: `${shortDate(dForm.from)} to ${shortDate(dForm.until)} · ${itinerariesPending.length + adjustmentsPending.length} pending items rerouted` });
  };

  const endDelegation = () => {
    const to = delegation?.to;
    setDelegation(null);
    notify({ type: 'info', title: 'Delegation ended', msg: `Approvals come back to you · ${to} notified` });
  };

  const routedChip = delegation && (
    <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[9px] font-bold border border-amber-200">ROUTED TO DELEGATE</span>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-5">
      <div className="fade-up p-4 rounded-2xl bg-navy-50 border border-navy-200 flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="flex items-start gap-3 flex-1">
          <Icon name="calendar" size={20} className="text-navy-700 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-display font-bold text-ink">Itinerary Governance</p>
            <p className="text-xs text-navy-700 mt-1">Sign off on weekly plans before reps go live. During the week, approve or reject up to 3 daily adjustments per rep (swaps, additions, reroutes). Each adjustment requires a justification.</p>
            <p className="text-[11px] text-navy-500 mt-1">Unanswered items go to {dmName}: weekly plans after {Math.round(timeouts.itineraryMinutes / 60)}h, daily adjustments after {timeouts.adjustmentMinutes} min.</p>
          </div>
        </div>
        {!delegation && (
          <button onClick={() => setShowDelegate(!showDelegate)} className="px-3 py-2 rounded-lg bg-white border border-navy-200 text-xs font-bold text-navy-700 flex items-center gap-1.5 btn-press flex-shrink-0">
            <Icon name={showDelegate ? 'x' : 'users'} size={14} /> {showDelegate ? 'Cancel' : 'Delegate approvals'}
          </button>
        )}
      </div>

      {banner}

      {showDelegate && !delegation && (
        <div className="fade-up rounded-2xl bg-white border-2 border-amber-200 p-5 space-y-3 max-w-2xl">
          <div className="flex items-center gap-2">
            <Icon name="users" size={16} className="text-amber-700" />
            <h3 className="font-display font-bold text-ink">Delegate approvals while you are away</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">To</label>
              <select value={dForm.to} onChange={e => setDForm({ ...dForm, to: e.target.value })} className="input-field w-full mt-1.5 px-3 py-2 rounded-xl bg-paper border border-navy-200 text-sm">
                {DELEGATES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">From</label>
              <input type="date" value={dForm.from} onChange={e => setDForm({ ...dForm, from: e.target.value })} className="input-field w-full mt-1.5 px-3 py-2 rounded-xl bg-paper border border-navy-200 text-sm" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">Until</label>
              <input type="date" value={dForm.until} min={dForm.from} onChange={e => setDForm({ ...dForm, until: e.target.value })} className="input-field w-full mt-1.5 px-3 py-2 rounded-xl bg-paper border border-navy-200 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">Reason</label>
            <input value={dForm.reason} onChange={e => setDForm({ ...dForm, reason: e.target.value })} placeholder="e.g. Annual leave, Abuja sales conference" className="input-field w-full mt-1.5 px-3 py-2 rounded-xl bg-paper border border-navy-200 text-sm" />
          </div>
          <button onClick={saveDelegation} disabled={!dForm.reason.trim() || dForm.until < dForm.from} className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-bold btn-press">
            Start delegation
          </button>
        </div>
      )}

      {delegation && (
        <div className="fade-up p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-start gap-3 flex-1">
            <Icon name="clock" size={18} className="text-amber-700 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-display font-bold text-amber-900 text-sm">Out of office · approvals going to {delegation.to} until {untilLabel(delegation.until)}</p>
              <p className="text-[11px] text-amber-800 mt-0.5">{shortDate(delegation.from)} to {shortDate(delegation.until)} · {delegation.reason} · escalation clocks keep running against the delegate</p>
            </div>
          </div>
          <button onClick={endDelegation} className="px-3 py-2 rounded-lg bg-white border border-amber-300 text-xs font-bold text-amber-800 btn-press flex-shrink-0">End delegation</button>
        </div>
      )}

      <div className="fade-up stagger-1 flex gap-1 bg-paper p-1 rounded-xl max-w-md">
        <button
          onClick={() => setTab('weekly')}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            tab === 'weekly' ? 'bg-white text-navy-700 shadow-sm' : 'text-navy-500'
          }`}
        >
          <Icon name="calendar" size={12} /> Weekly Plans
          <span className={`px-1.5 py-0.5 rounded text-[9px] ${tab === 'weekly' ? 'bg-amber-100 text-amber-700' : 'bg-navy-200/50 text-navy-600'}`}>{itinerariesPending.length}</span>
        </button>
        <button
          onClick={() => setTab('daily')}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            tab === 'daily' ? 'bg-white text-navy-700 shadow-sm' : 'text-navy-500'
          }`}
        >
          <Icon name="edit" size={12} /> Daily Adjustments
          <span className={`px-1.5 py-0.5 rounded text-[9px] ${tab === 'daily' ? 'bg-amber-100 text-amber-700' : 'bg-navy-200/50 text-navy-600'}`}>{adjustmentsPending.length}</span>
        </button>
      </div>

      {tab === 'weekly' && (
        <div className="fade-up stagger-2 rounded-2xl bg-white border border-navy-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-navy-100">
            <h3 className="font-display font-bold text-ink">Weekly Itineraries Pending Sign-Off</h3>
            <p className="text-xs text-navy-500 mt-0.5">Reps submitted these by Friday EOD · Approve before Monday 8am</p>
          </div>
          <div className="divide-y divide-navy-50">
            {itinerariesPending.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-14 h-14 rounded-full bg-leaf-50 mx-auto flex items-center justify-center mb-3">
                  <Icon name="check" size={24} className="text-leaf-600" strokeWidth={2.5} />
                </div>
                <p className="font-display font-semibold text-ink">All caught up</p>
                <p className="text-xs text-navy-500 mt-1">No weekly itineraries pending</p>
              </div>
            ) : itinerariesPending.map(it => {
              const expanded = expandedItin === it.id;
              const clk = clockFor(it.id, 120);
              return (
                <div key={it.id} className={`${it.dismissing ? 'slide-out-up' : ''}`}>
                  <div className="px-5 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center font-display font-bold text-xs text-navy-700 flex-shrink-0">
                        {it.rep.split(' ').map(x => x[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-display font-semibold text-sm text-ink">{it.rep}</p>
                          <span className="px-1.5 py-0.5 rounded bg-paper text-navy-700 text-[9px] font-bold border border-navy-100">{it.area}</span>
                          {clk.escalated && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[9px] font-bold border border-rose-200">ESCALATED TO DM</span>
                          )}
                          {!clk.escalated && clk.urgent && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[9px] font-bold border border-amber-200 animate-pulse">ESCALATION IMMINENT</span>
                          )}
                          {!clk.escalated && routedChip}
                        </div>
                        <p className="text-[11px] text-navy-500 mt-0.5">{it.week} · {it.visits} visits planned · Submitted {it.submittedAt}</p>
                        {!clk.escalated && clk.left && (
                          <p className={`text-[10px] font-semibold mt-1 flex items-center gap-1 ${clk.urgent ? 'text-amber-600' : 'text-navy-500'}`}>
                            <Icon name="clock" size={10} /> Auto-escalates to DM in <span className="font-mono">{clk.left}</span>{delegation ? ` · with ${delegation.to}` : ''}
                          </p>
                        )}
                        {clk.escalated && (
                          <p className="text-[10px] text-rose-600 font-semibold mt-1">Escalated to DM {dmName} · no decision within {Math.round(timeouts.itineraryMinutes / 60)}h</p>
                        )}
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="p-2 rounded-lg bg-paper">
                            <p className="text-[9px] text-navy-400 font-bold tracking-wider uppercase">Focus</p>
                            <p className="text-[11px] text-navy-700 mt-0.5">{it.focus}</p>
                          </div>
                          <div className="p-2 rounded-lg bg-paper">
                            <p className="text-[9px] text-navy-400 font-bold tracking-wider uppercase">Highlights</p>
                            <p className="text-[11px] text-navy-700 mt-0.5">{it.highlights}</p>
                          </div>
                        </div>
                      </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0 w-full sm:w-auto">
                        <button onClick={() => setExpandedItin(expanded ? null : it.id)} className="flex-1 sm:flex-none px-2.5 py-2 sm:py-1.5 rounded-lg border border-navy-200 text-xs font-bold text-navy-700 hover:bg-paper btn-press">
                          {expanded ? 'Hide' : 'Preview'}
                        </button>
                        {clk.escalated ? (
                          <button onClick={() => pullBack(it.id, timeouts.itineraryMinutes, it.rep)} className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-xs font-bold text-rose-700 btn-press">Pull back</button>
                        ) : (
                          <>
                            <button onClick={() => onRejectItinerary(it.id)} className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 rounded-lg border border-navy-200 text-xs font-bold text-navy-700 hover:bg-navy-50 btn-press">Reject</button>
                            <button onClick={() => onApproveItinerary(it.id)} className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 rounded-lg bg-navy-700 text-white text-xs font-bold hover:bg-navy-800 btn-press">Approve</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {expanded && (
                    <div className="px-5 pb-4">
                      <div className="rounded-xl bg-paper border border-navy-100 overflow-hidden">
                        <p className="px-4 pt-3 text-[10px] font-bold text-navy-400 tracking-wider uppercase">Daily Breakdown</p>
                        {it.plannedVisits && it.plannedVisits.length > 0 ? (
                          <div className="p-3 space-y-2">
                            {DAYS.map(d => {
                              const stops = it.plannedVisits!
                                .filter(v => v.day === d.k)
                                .sort((a, b) => toMin(a.time) - toMin(b.time));
                              return (
                                <div key={d.k} className="rounded-lg bg-white border border-navy-50 overflow-hidden">
                                  <div className="px-3 py-1.5 flex items-center justify-between bg-navy-50/50">
                                    <p className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">{d.l}</p>
                                    <p className="text-[10px] text-navy-400">{stops.length} stop{stops.length === 1 ? '' : 's'}</p>
                                  </div>
                                  {stops.length === 0 ? (
                                    <p className="px-3 py-2 text-[10px] text-navy-300 italic">No visits planned</p>
                                  ) : (
                                    <div className="divide-y divide-navy-50">
                                      {stops.map(v => (
                                        <div key={v.id} className="px-3 py-1.5 flex items-center gap-2">
                                          <span className="font-mono text-[10px] font-bold text-navy-500 w-10 flex items-center gap-0.5 flex-shrink-0">
                                            {v.fixedTime && <Icon name="lock" size={8} className="text-navy-400" />}{v.time}
                                          </span>
                                          <p className="text-[11px] text-ink truncate flex-1">{v.name}</p>
                                          {v.priority === 'high' && <span className="px-1 py-0 rounded bg-leaf-50 text-leaf-700 text-[8px] font-bold flex-shrink-0">HIGH</span>}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-3 grid grid-cols-5 gap-2">
                            {DAYS.map((d, i) => (
                              <div key={d.k} className="p-2 rounded-lg bg-white text-center">
                                <p className="text-[10px] font-bold text-navy-500">{d.l}</p>
                                <p className="font-display text-base font-bold text-ink">{Math.floor(it.visits / 5) + (i < it.visits % 5 ? 1 : 0)}</p>
                                <p className="text-[9px] text-navy-400">visits</p>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="px-4 py-2 border-t border-navy-100 bg-navy-50/50">
                          <p className="text-[10px] text-navy-500"><span className="font-bold">AI hint:</span> Route balance acceptable. Suggest adding 1 more Lekki Phase 2 stop on Wednesday.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'daily' && (
        <div className="fade-up stagger-2 rounded-2xl bg-white border border-navy-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-navy-100">
            <h3 className="font-display font-bold text-ink">Daily Adjustment Requests</h3>
            <p className="text-xs text-navy-500 mt-0.5">In-flight changes · Each rep capped at 3/day · Decide within 15min for best impact</p>
          </div>
          <div className="divide-y divide-navy-50">
            {adjustmentsPending.length === 0 ? (
              <div className="py-12 text-center text-sm text-navy-500">No adjustment requests pending</div>
            ) : adjustmentsPending.map(adj => { const clk = clockFor(adj.id, 10); return (
              <div key={adj.id} className={`${adj.dismissing ? 'slide-out-up' : ''} px-5 py-4`}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    adj.type === 'reroute' ? 'bg-amber-50' :
                    adj.type === 'add' ? 'bg-leaf-50' : 'bg-navy-50'
                  }`}>
                    <Icon name={adj.type === 'reroute' ? 'map' : adj.type === 'add' ? 'plus' : 'edit'} size={18}
                      className={adj.type === 'reroute' ? 'text-amber-700' : adj.type === 'add' ? 'text-leaf-700' : 'text-navy-700'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-display font-semibold text-sm text-ink">{adj.rep}</p>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        adj.type === 'reroute' ? 'bg-amber-100 text-amber-700' :
                        adj.type === 'add' ? 'bg-leaf-100 text-leaf-700' : 'bg-navy-100 text-navy-700'
                      }`}>{adj.type.toUpperCase()}</span>
                      {adj.urgent && <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[9px] font-bold">URGENT</span>}
                      <span className="px-1.5 py-0.5 rounded bg-paper text-navy-700 text-[9px] font-bold border border-navy-100">{adj.todayUsed}/3 USED TODAY</span>
                      {clk.escalated && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[9px] font-bold border border-rose-200">ESCALATED TO DM</span>
                      )}
                      {!clk.escalated && clk.urgent && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[9px] font-bold border border-amber-200 animate-pulse">IMMINENT</span>
                      )}
                      {!clk.escalated && routedChip}
                    </div>
                    <p className="text-sm text-navy-700 font-display font-semibold mt-1">{adj.visit}</p>
                    <p className="text-[11px] text-navy-500 mt-0.5">Submitted {adj.submittedAt}</p>
                    {!clk.escalated && clk.left && (
                      <p className={`text-[10px] font-semibold mt-1 flex items-center gap-1 ${clk.urgent ? 'text-amber-600' : 'text-navy-500'}`}>
                        <Icon name="clock" size={10} /> Auto-escalates to DM in <span className="font-mono">{clk.left}</span>{delegation ? ` · with ${delegation.to}` : ''}
                      </p>
                    )}
                    {clk.escalated && (
                      <p className="text-[10px] text-rose-600 font-semibold mt-1">Escalated to DM {dmName} · no decision within {timeouts.adjustmentMinutes} min</p>
                    )}
                    <div className="mt-2 p-2 rounded-lg bg-paper">
                      <p className="text-[9px] text-navy-400 font-bold tracking-wider uppercase">Reason</p>
                      <p className="text-xs text-navy-700 mt-0.5">{adj.reason}</p>
                    </div>
                  </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 w-full sm:w-auto">
                    {clk.escalated ? (
                      <button onClick={() => pullBack(adj.id, timeouts.adjustmentMinutes, adj.rep)} className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-xs font-bold text-rose-700 btn-press">Pull back</button>
                    ) : (
                      <>
                        <button onClick={() => onRejectAdjustment(adj.id)} className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 rounded-lg border border-navy-200 text-xs font-bold text-navy-700 hover:bg-navy-50 btn-press">Reject</button>
                        <button onClick={() => onApproveAdjustment(adj.id)} className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 rounded-lg bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 btn-press">Approve</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ); })}
          </div>
        </div>
      )}
    </div>
  );
}
