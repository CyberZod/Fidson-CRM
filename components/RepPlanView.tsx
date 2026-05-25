import { useMemo, useState } from 'react';
import Icon from './Icon';
import type { RepVisit, WeekItinerary, AdjustmentRequest } from '../types';

interface RepPlanViewProps {
  visits: RepVisit[];
  onStartVisit: (visit: RepVisit) => void;
  weekItinerary: WeekItinerary;
  onRequestAdjustment?: (req: AdjustmentRequest) => void;
}

interface DaySpec {
  k: string;
  l: string;
  date: string;
  label: string;
  today?: boolean;
}

interface AdjustForm {
  type: 'add' | 'swap';
  visit: RepVisit | null;
}

export default function RepPlanView({ visits, onStartVisit, weekItinerary, onRequestAdjustment }: RepPlanViewProps) {
  const [selectedDay, setSelectedDay] = useState<string>('tue');
  const [adjustForm, setAdjustForm] = useState<AdjustForm | null>(null);
  const [adjReason, setAdjReason] = useState('');

  const days: DaySpec[] = [
    { k: 'mon', l: 'Mon', date: 'May 12', label: 'Monday' },
    { k: 'tue', l: 'Tue', date: 'May 13', label: 'Tuesday', today: true },
    { k: 'wed', l: 'Wed', date: 'May 14', label: 'Wednesday' },
    { k: 'thu', l: 'Thu', date: 'May 15', label: 'Thursday' },
    { k: 'fri', l: 'Fri', date: 'May 16', label: 'Friday' },
  ];

  const dayCounts = useMemo(() => {
    const counts: Record<string, { total: number; done: number }> = {};
    days.forEach(d => {
      const dayVisits = visits.filter(v => v.day === d.k);
      counts[d.k] = {
        total: dayVisits.length,
        done: dayVisits.filter(v => v.status === 'done').length,
      };
    });
    return counts;
  }, [visits]);

  const selectedDayLabel = days.find(d => d.k === selectedDay);
  const dayVisits = visits.filter(v => v.day === selectedDay);
  const totalWeekVisits = visits.length;
  const totalDistance = visits.reduce((s, v) => s + parseFloat(String(v.dist || 0)), 0).toFixed(1);

  const isToday = selectedDay === 'tue';
  const isPast = ['mon'].includes(selectedDay);
  const isFuture = ['wed', 'thu', 'fri'].includes(selectedDay);

  const adjustmentsRemaining = weekItinerary.adjustmentsLimit - weekItinerary.adjustmentsUsedToday;

  const handleSubmitAdjustment = () => {
    if (!adjustForm || !adjReason.trim()) return;
    onRequestAdjustment?.({
      type: adjustForm.type,
      visit: adjustForm.visit,
      reason: adjReason,
    });
    setAdjustForm(null);
    setAdjReason('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-5">
      <div className="fade-up">
        {weekItinerary.status === 'approved' && (
          <div className="rounded-2xl bg-white border-l-4 border-leaf-500 border border-navy-100 p-4 sm:p-5">
            <div className="flex items-start gap-3 flex-wrap">
              <div className="w-10 h-10 rounded-xl bg-leaf-100 flex items-center justify-center flex-shrink-0">
                <Icon name="check" size={20} className="text-leaf-600" strokeWidth={3} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-display font-bold text-ink">{weekItinerary.weekLabel}</p>
                  <span className="px-2 py-0.5 rounded-full bg-leaf-100 text-leaf-700 text-[10px] font-bold tracking-wider uppercase">RSM Approved</span>
                </div>
                <p className="text-xs text-navy-500 mt-0.5">Signed off by {weekItinerary.approvedBy} · {weekItinerary.approvedAt}</p>
                {weekItinerary.rsmNote && (
                  <div className="mt-2 p-2 rounded-lg bg-paper text-xs text-navy-700 italic">
                    "{weekItinerary.rsmNote}"
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">Adjustments Today</p>
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className={`w-6 h-1.5 rounded-full ${i < weekItinerary.adjustmentsUsedToday ? 'bg-amber-500' : 'bg-navy-100'}`} />
                  ))}
                </div>
                <p className="text-[10px] text-navy-500 font-mono">{weekItinerary.adjustmentsUsedToday}/{weekItinerary.adjustmentsLimit} used</p>
              </div>
            </div>
          </div>
        )}

        {weekItinerary.status === 'submitted' && (
          <div className="rounded-2xl bg-white border border-navy-100 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-navy-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  weekItinerary.escalationStatus === 'escalated' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  <Icon name={weekItinerary.escalationStatus === 'escalated' ? 'alert' : 'clock'} size={20} />
                </div>
                <div>
                  <p className="font-display font-bold text-ink text-sm sm:text-base">{weekItinerary.weekLabel}</p>
                  <p className="text-xs text-navy-500 mt-0.5">
                    {weekItinerary.escalationStatus === 'escalated' ? (
                      <span className="text-rose-600 font-bold">Escalated to DM Kemi Adeyemi — RSM unavailable</span>
                    ) : weekItinerary.escalationStatus === 'imminent' ? (
                      <span className="text-amber-600 font-bold">Escalation Imminent · Auto-escalates to DM in 4 hrs</span>
                    ) : (
                      <span>Awaiting RSM sign-off · Submitted {weekItinerary.submittedAt}</span>
                    )}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase self-start sm:self-center ${
                weekItinerary.escalationStatus === 'escalated' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {weekItinerary.escalationStatus === 'escalated' ? 'Escalated' : 'Awaiting Sign-off'}
              </span>
            </div>

            <div>
              <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase mb-3">Itinerary Approval Pathway</p>
              <div className="grid grid-cols-4 gap-2 relative">
                {[
                  { r: 'Rep', n: 'You', status: 'completed' },
                  { r: 'RSM', n: 'Tunde Bakare', status: weekItinerary.escalationStatus === 'escalated' ? 'skipped' : 'pending' },
                  { r: 'DM', n: 'Kemi Adeyemi', status: weekItinerary.escalationStatus === 'escalated' ? 'pending' : 'upcoming' },
                  { r: 'NSM', n: 'National Sales Mgr', status: 'upcoming' },
                ].map((step, idx) => (
                  <div key={idx} className="relative flex flex-col items-center text-center">
                    {idx < 3 && (
                      <div className={`absolute top-4 left-[55%] right-[-45%] h-0.5 z-0 ${
                        step.status === 'completed' ? 'bg-leaf-500' :
                        step.status === 'skipped' ? 'bg-rose-300 border-dashed border-t' : 'bg-navy-200'
                      }`} />
                    )}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs z-10 ${
                      step.status === 'completed' ? 'bg-leaf-500 text-white shadow-lg shadow-leaf-500/20' :
                      step.status === 'pending' ? (weekItinerary.escalationStatus === 'escalated' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20 animate-pulse' : 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 animate-pulse') :
                      step.status === 'skipped' ? 'bg-navy-200 text-navy-500 line-through' :
                      'bg-navy-100 text-navy-400'
                    }`}>
                      {step.status === 'completed' ? '✓' : idx + 1}
                    </div>
                    <p className="text-[11px] font-bold text-ink mt-2">{step.r}</p>
                    <p className="text-[9px] text-navy-500 mt-0.5 truncate max-w-full">{step.n}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fade-up stagger-1 rounded-2xl bg-white border border-navy-100 overflow-hidden">
        <div className="grid grid-cols-5 divide-x divide-navy-100">
          {days.map(d => {
            const counts = dayCounts[d.k];
            const isSelected = selectedDay === d.k;
            const completionPct = counts.total > 0 ? (counts.done / counts.total) * 100 : 0;
            return (
              <button
                key={d.k}
                onClick={() => setSelectedDay(d.k)}
                className={`p-3 sm:p-4 text-left transition-colors relative ${
                  isSelected ? 'bg-leaf-50/50' : 'hover:bg-paper'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold tracking-wider uppercase ${d.today ? 'text-leaf-700' : 'text-navy-400'}`}>{d.l}</span>
                    {d.today && <span className="w-1.5 h-1.5 rounded-full bg-leaf-500 pulse-dot" />}
                  </div>
                </div>
                <p className="font-display text-base sm:text-lg font-bold text-ink leading-none">{d.date.split(' ')[1]}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <p className="text-[10px] font-mono text-navy-500">{counts.done}/{counts.total}</p>
                  {counts.total > 0 && (
                    <div className="flex-1 h-1 rounded-full bg-navy-100 overflow-hidden">
                      <div className={`h-full ${completionPct === 100 ? 'bg-leaf-500' : 'bg-navy-700'}`} style={{ width: `${completionPct}%` }} />
                    </div>
                  )}
                </div>
                {isSelected && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-leaf-500" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 fade-up stagger-2">
          <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-bold text-ink">{selectedDayLabel?.label}'s Itinerary</h3>
                  {isToday && <span className="px-1.5 py-0.5 rounded bg-leaf-500 text-white text-[9px] font-bold">TODAY</span>}
                  {isPast && <span className="px-1.5 py-0.5 rounded bg-navy-100 text-navy-700 text-[9px] font-bold">COMPLETED</span>}
                  {isFuture && <span className="px-1.5 py-0.5 rounded bg-paper border border-navy-200 text-navy-700 text-[9px] font-bold">UPCOMING</span>}
                </div>
                <p className="text-xs text-navy-500 mt-0.5">{dayVisits.length} stops · AI-optimized route</p>
              </div>
              {(isToday || isFuture) && adjustmentsRemaining > 0 && (
                <button onClick={() => setAdjustForm({ type: 'add', visit: null })} className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 btn-press hover:bg-amber-600">
                  <Icon name="plus" size={12} /> Request Adjustment
                </button>
              )}
            </div>

            {dayVisits.length === 0 ? (
              <div className="py-12 text-center text-sm text-navy-500">No visits planned for this day</div>
            ) : (
              <div className="divide-y divide-navy-50">
                {dayVisits.map((v, idx) => (
                  <button
                    key={v.id}
                    onClick={() => isToday && v.status !== 'done' && onStartVisit(v)}
                    disabled={!isToday || v.status === 'done'}
                    className={`w-full px-5 py-3.5 flex items-center gap-3 transition-colors text-left ${
                      v.status === 'done' ? 'bg-leaf-50/30 cursor-default' :
                      v.status === 'next' ? 'bg-navy-50/50 hover:bg-navy-50' :
                      isToday ? 'hover:bg-paper' : 'cursor-default'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-sm flex-shrink-0 ${
                      v.status === 'done' ? 'bg-leaf-500 text-white' :
                      v.status === 'next' ? 'bg-navy-700 text-white' : 'bg-navy-100 text-navy-700'
                    }`}>
                      {v.status === 'done' ? <Icon name="check" size={16} strokeWidth={3} /> : idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-display font-semibold text-sm ${v.status === 'done' ? 'text-navy-500 line-through' : 'text-ink'}`}>{v.name}</p>
                        {v.status === 'next' && <span className="px-1.5 py-0.5 rounded bg-leaf-500 text-white text-[9px] font-bold">NEXT</span>}
                        {v.priority === 'high' && v.status !== 'done' && <span className="px-1.5 py-0.5 rounded bg-leaf-50 text-leaf-700 text-[9px] font-bold">HIGH</span>}
                      </div>
                      <p className="text-[11px] text-navy-500 mt-0.5">{v.contact}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-mono font-bold text-navy-700">{v.time}</p>
                      <p className="text-[10px] text-navy-400">{v.dist} km</p>
                    </div>
                    {isToday && v.status !== 'done' && <Icon name="chevronRight" size={16} className="text-navy-300" />}
                    {(isToday || isFuture) && v.status !== 'done' && adjustmentsRemaining > 0 && (
                      <span
                        onClick={(e) => { e.stopPropagation(); setAdjustForm({ type: 'swap', visit: v }); }}
                        className="px-2 py-1 rounded-md border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-bold flex-shrink-0 cursor-pointer"
                      >
                        Swap
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {adjustForm && (
            <div className="mt-4 rounded-2xl bg-white border-2 border-amber-300 overflow-hidden fade-up">
              <div className="px-5 py-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="edit" size={14} className="text-amber-700" />
                  <p className="font-display font-bold text-sm text-ink">
                    {adjustForm.type === 'add' ? 'Add Visit' : 'Swap Visit'} · Request RSM Approval
                  </p>
                </div>
                <button onClick={() => { setAdjustForm(null); setAdjReason(''); }} className="text-navy-400 hover:text-navy-700">
                  <Icon name="x" size={16} />
                </button>
              </div>
              <div className="p-5 space-y-3">
                {adjustForm.visit && (
                  <div className="p-3 rounded-lg bg-paper">
                    <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">Currently Planned</p>
                    <p className="text-sm font-display font-semibold text-ink mt-1">{adjustForm.visit.name}</p>
                    <p className="text-[11px] text-navy-500">{adjustForm.visit.contact} · {adjustForm.visit.time} · {selectedDayLabel?.label}</p>
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">
                    {adjustForm.type === 'add' ? 'New visit details' : 'Reason for swap & replacement'}
                  </label>
                  <textarea
                    rows={3}
                    value={adjReason}
                    onChange={e => setAdjReason(e.target.value)}
                    placeholder="e.g. Dr. Adebayo cancelled — Reddington (Dr. Bello) requested urgent meeting on Coflin paediatric dosing. Same time slot, similar distance."
                    className="input-field w-full mt-1.5 p-3 rounded-xl bg-paper border border-navy-200 text-sm resize-none"
                  />
                </div>
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
                  <Icon name="alert" size={14} className="text-amber-700 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-amber-800">
                    <span className="font-bold">RSM approval required.</span> You have <span className="font-bold">{adjustmentsRemaining} of {weekItinerary.adjustmentsLimit}</span> adjustments left today. Tunde Bakare will be notified immediately. If unavailable, request will auto-escalate to DM Kemi Adeyemi.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setAdjustForm(null); setAdjReason(''); }} className="flex-1 py-2.5 rounded-lg border border-navy-200 text-sm font-bold text-navy-700 hover:bg-paper btn-press">Cancel</button>
                  <button
                    onClick={handleSubmitAdjustment}
                    disabled={!adjReason.trim()}
                    className="flex-1 py-2.5 rounded-lg bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 disabled:opacity-50 btn-press flex items-center justify-center gap-1.5"
                  >
                    <Icon name="send" size={14} /> Submit to RSM
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="fade-up stagger-3 space-y-4">
          <div className="rounded-2xl bg-white border border-navy-100 p-5">
            <h3 className="font-display font-bold text-ink text-sm mb-3">Week 20 at a Glance</h3>
            <div className="space-y-3">
              {[
                { l: 'Total Visits', v: `${totalWeekVisits}`, i: 'location' as const },
                { l: 'Total Distance', v: `${totalDistance} km`, i: 'map' as const },
                { l: 'Fuel Estimate', v: '₦24,800', i: 'target' as const },
                { l: 'Expected Revenue', v: '₦8.4M', i: 'trending' as const },
                { l: 'Focus Product', v: 'Coflin Forte', i: 'pill' as const },
              ].map(s => (
                <div key={s.l} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center">
                      <Icon name={s.i} size={14} className="text-navy-700" />
                    </div>
                    <span className="text-xs text-navy-700">{s.l}</span>
                  </div>
                  <p className="font-display font-bold text-sm text-ink">{s.v}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-navy-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-ink text-sm">Daily Adjustment Cap</h3>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                adjustmentsRemaining === 0 ? 'bg-rose-100 text-rose-700' :
                adjustmentsRemaining === 1 ? 'bg-amber-100 text-amber-700' : 'bg-leaf-100 text-leaf-700'
              }`}>{adjustmentsRemaining} LEFT</span>
            </div>
            <div className="space-y-2 mb-3">
              {[0, 1, 2].map(i => {
                const used = i < weekItinerary.adjustmentsUsedToday;
                return (
                  <div key={i} className={`flex items-center gap-2 p-2 rounded-lg ${used ? 'bg-amber-50 border border-amber-200' : 'bg-paper border border-navy-100'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${used ? 'bg-amber-500' : 'bg-navy-200'}`}>
                      {used ? <Icon name="check" size={10} className="text-white" strokeWidth={3} /> : <span className="text-[10px] font-bold text-navy-500">{i + 1}</span>}
                    </div>
                    <p className="text-[11px] text-navy-700">{used ? 'Used · MedPlus → Eko Atlantic' : `Slot ${i + 1} available`}</p>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-navy-500 leading-relaxed">Per Fidson policy: max 3 itinerary adjustments per day, each requiring RSM sign-off.</p>
          </div>

          <div className="rounded-2xl bg-white border border-navy-100 p-5">
            <h3 className="font-display font-bold text-ink text-sm mb-3">Week Lock Status</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-leaf-50">
                <Icon name="check" size={14} className="text-leaf-600" strokeWidth={3} />
                <p className="text-xs text-navy-700">Submitted Fri 9 May</p>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-leaf-50">
                <Icon name="check" size={14} className="text-leaf-600" strokeWidth={3} />
                <p className="text-xs text-navy-700">RSM signed Sun 11 May</p>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-leaf-50">
                <Icon name="check" size={14} className="text-leaf-600" strokeWidth={3} />
                <p className="text-xs text-navy-700">GPS tracking active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
