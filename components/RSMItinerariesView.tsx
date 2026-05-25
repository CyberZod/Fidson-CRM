import { useState } from 'react';
import Icon from './Icon';
import type { ItineraryPending, AdjustmentPending } from '../types';

interface RSMItinerariesViewProps {
  itinerariesPending: ItineraryPending[];
  adjustmentsPending: AdjustmentPending[];
  onApproveItinerary: (id: string) => void;
  onRejectItinerary: (id: string) => void;
  onApproveAdjustment: (id: string) => void;
  onRejectAdjustment: (id: string) => void;
}

type Tab = 'weekly' | 'daily';

export default function RSMItinerariesView({
  itinerariesPending,
  adjustmentsPending,
  onApproveItinerary,
  onRejectItinerary,
  onApproveAdjustment,
  onRejectAdjustment,
}: RSMItinerariesViewProps) {
  const [tab, setTab] = useState<Tab>('weekly');
  const [expandedItin, setExpandedItin] = useState<string | null>(null);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-5">
      <div className="fade-up p-4 rounded-2xl bg-navy-50 border border-navy-200 flex items-start gap-3">
        <Icon name="calendar" size={20} className="text-navy-700 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-display font-bold text-ink">Itinerary Governance</p>
          <p className="text-xs text-navy-700 mt-1">Sign off on weekly plans before reps go live. During the week, approve or reject up to 3 daily adjustments per rep (swaps, additions, reroutes). Each adjustment requires a justification.</p>
        </div>
      </div>

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
              return (
                <div key={it.id} className={`${it.dismissing ? 'slide-out-up' : ''}`}>
                  <div className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center font-display font-bold text-xs text-navy-700 flex-shrink-0">
                        {it.rep.split(' ').map(x => x[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-display font-semibold text-sm text-ink">{it.rep}</p>
                          <span className="px-1.5 py-0.5 rounded bg-paper text-navy-700 text-[9px] font-bold border border-navy-100">{it.area}</span>
                          {it.escalationStatus === 'escalated' && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[9px] font-bold border border-rose-200">ESCALATED TO DM</span>
                          )}
                          {it.escalationStatus === 'imminent' && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[9px] font-bold border border-amber-200 animate-pulse">ESCALATION IMMINENT</span>
                          )}
                        </div>
                        <p className="text-[11px] text-navy-500 mt-0.5">{it.week} · {it.visits} visits planned · Submitted {it.submittedAt}</p>
                        {it.escalationStatus === 'imminent' && (
                          <p className="text-[10px] text-amber-600 font-semibold mt-1">Auto-escalates to DM Kemi Adeyemi in 1h 15m (RSM unresponsive)</p>
                        )}
                        {it.escalationStatus === 'escalated' && (
                          <p className="text-[10px] text-rose-600 font-semibold mt-1">Escalated to DM Kemi Adeyemi (RSM unresponsive &gt; 4 hours)</p>
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
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={() => setExpandedItin(expanded ? null : it.id)} className="px-2.5 py-1.5 rounded-lg border border-navy-200 text-xs font-bold text-navy-700 hover:bg-paper btn-press">
                          {expanded ? 'Hide' : 'Preview'}
                        </button>
                        <button onClick={() => onRejectItinerary(it.id)} className="px-3 py-1.5 rounded-lg border border-navy-200 text-xs font-bold text-navy-700 hover:bg-navy-50 btn-press">Reject</button>
                        <button onClick={() => onApproveItinerary(it.id)} className="px-3 py-1.5 rounded-lg bg-navy-700 text-white text-xs font-bold hover:bg-navy-800 btn-press">Approve</button>
                      </div>
                    </div>
                  </div>
                  {expanded && (
                    <div className="px-5 pb-4">
                      <div className="rounded-xl bg-paper border border-navy-100 overflow-hidden">
                        <p className="px-4 pt-3 text-[10px] font-bold text-navy-400 tracking-wider uppercase">Daily Breakdown</p>
                        <div className="p-3 grid grid-cols-5 gap-2">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d, i) => (
                            <div key={d} className="p-2 rounded-lg bg-white text-center">
                              <p className="text-[10px] font-bold text-navy-500">{d}</p>
                              <p className="font-display text-base font-bold text-ink">{Math.floor(it.visits / 5) + (i < it.visits % 5 ? 1 : 0)}</p>
                              <p className="text-[9px] text-navy-400">visits</p>
                            </div>
                          ))}
                        </div>
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
            ) : adjustmentsPending.map(adj => (
              <div key={adj.id} className={`${adj.dismissing ? 'slide-out-up' : ''} px-5 py-4`}>
                <div className="flex items-start gap-3">
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
                      {adj.escalationStatus === 'escalated' && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[9px] font-bold border border-rose-200">ESCALATED</span>
                      )}
                      {adj.escalationStatus === 'imminent' && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[9px] font-bold border border-amber-200 animate-pulse">IMMINENT</span>
                      )}
                    </div>
                    <p className="text-sm text-navy-700 font-display font-semibold mt-1">{adj.visit}</p>
                    <p className="text-[11px] text-navy-500 mt-0.5">Submitted {adj.submittedAt}</p>
                    {adj.escalationStatus === 'imminent' && (
                      <p className="text-[10px] text-amber-600 font-semibold mt-1">Auto-escalates to DM Kemi Adeyemi in 5m</p>
                    )}
                    {adj.escalationStatus === 'escalated' && (
                      <p className="text-[10px] text-rose-600 font-semibold mt-1">Escalated to DM Kemi Adeyemi</p>
                    )}
                    <div className="mt-2 p-2 rounded-lg bg-paper">
                      <p className="text-[9px] text-navy-400 font-bold tracking-wider uppercase">Reason</p>
                      <p className="text-xs text-navy-700 mt-0.5">{adj.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => onRejectAdjustment(adj.id)} className="px-3 py-1.5 rounded-lg border border-navy-200 text-xs font-bold text-navy-700 hover:bg-navy-50 btn-press">Reject</button>
                    <button onClick={() => onApproveAdjustment(adj.id)} className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 btn-press">Approve</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
