import { useMemo, useState } from 'react';
import Icon from './Icon';
import { PRODUCT_CATALOG } from '../assets/products';
import type { RepVisit, WeekItinerary, AdjustmentRequest } from '../types';

interface RepPlanViewProps {
  visits: RepVisit[];
  onStartVisit: (visit: RepVisit) => void;
  weekItinerary: WeekItinerary;
  onRequestAdjustment?: (req: AdjustmentRequest) => void;
  nextWeekVisits?: RepVisit[];
  nextWeekItinerary?: WeekItinerary;
  onAddPlannedVisit?: (visit: RepVisit) => void;
  onRemovePlannedVisit?: (id: number | string) => void;
  onSubmitItinerary?: () => void;
}

type WeekTab = 'current' | 'next';

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

interface DraftVisitForm {
  day: string;
  name: string;
  time: string;
  dist: string;
  priority: 'high' | 'med' | 'low';
  address: string;
  plannedProducts: string[];
}

const emptyDraftForm = (day: string): DraftVisitForm => ({
  day,
  name: '',
  time: '',
  dist: '',
  priority: 'med',
  address: '',
  plannedProducts: PRODUCT_CATALOG.filter(p => p.focus).map(p => p.name),
});

export default function RepPlanView({
  visits,
  onStartVisit,
  weekItinerary,
  onRequestAdjustment,
  nextWeekVisits = [],
  nextWeekItinerary,
  onAddPlannedVisit,
  onRemovePlannedVisit,
  onSubmitItinerary,
}: RepPlanViewProps) {
  const hasNextWeek = !!nextWeekItinerary;
  const [activeTab, setActiveTab] = useState<WeekTab>('current');
  const effectiveItinerary = activeTab === 'next' && nextWeekItinerary ? nextWeekItinerary : weekItinerary;
  const effectiveVisits = activeTab === 'next' ? nextWeekVisits : visits;
  const isDraft = effectiveItinerary.status === 'draft';
  const [selectedDay, setSelectedDay] = useState<string>('tue');
  const [adjustForm, setAdjustForm] = useState<AdjustForm | null>(null);
  const [adjReason, setAdjReason] = useState('');
  const [draftForm, setDraftForm] = useState<DraftVisitForm | null>(null);

  const currentDays: DaySpec[] = [
    { k: 'mon', l: 'Mon', date: 'May 12', label: 'Monday' },
    { k: 'tue', l: 'Tue', date: 'May 13', label: 'Tuesday', today: true },
    { k: 'wed', l: 'Wed', date: 'May 14', label: 'Wednesday' },
    { k: 'thu', l: 'Thu', date: 'May 15', label: 'Thursday' },
    { k: 'fri', l: 'Fri', date: 'May 16', label: 'Friday' },
  ];
  const nextDays: DaySpec[] = [
    { k: 'mon', l: 'Mon', date: 'May 19', label: 'Monday' },
    { k: 'tue', l: 'Tue', date: 'May 20', label: 'Tuesday' },
    { k: 'wed', l: 'Wed', date: 'May 21', label: 'Wednesday' },
    { k: 'thu', l: 'Thu', date: 'May 22', label: 'Thursday' },
    { k: 'fri', l: 'Fri', date: 'May 23', label: 'Friday' },
  ];
  const days = activeTab === 'next' ? nextDays : currentDays;

  const dayCounts = useMemo(() => {
    const counts: Record<string, { total: number; done: number }> = {};
    days.forEach(d => {
      const dayVisits = effectiveVisits.filter(v => v.day === d.k);
      counts[d.k] = {
        total: dayVisits.length,
        done: dayVisits.filter(v => v.status === 'done').length,
      };
    });
    return counts;
  }, [effectiveVisits, days]);

  const selectedDayLabel = days.find(d => d.k === selectedDay);
  const dayVisits = effectiveVisits.filter(v => v.day === selectedDay);
  const totalWeekVisits = effectiveVisits.length;
  const totalDistance = effectiveVisits.reduce((s, v) => s + parseFloat(String(v.dist || 0)), 0).toFixed(1);

  const isToday = activeTab === 'current' && selectedDay === 'tue';
  const isPast = activeTab === 'current' && selectedDay === 'mon';
  const isFuture = activeTab === 'next' || ['wed', 'thu', 'fri'].includes(selectedDay);

  const adjustmentsRemaining = effectiveItinerary.adjustmentsLimit - effectiveItinerary.adjustmentsUsedToday;

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

  const openDraftForm = () => setDraftForm(emptyDraftForm(selectedDay));
  const updateDraftForm = (patch: Partial<DraftVisitForm>) => {
    setDraftForm(prev => prev ? { ...prev, ...patch } : prev);
  };
  const canSaveDraftVisit = !!draftForm && draftForm.name.trim() !== '' && draftForm.time.trim() !== '';

  const handleSaveDraftVisit = () => {
    if (!draftForm || !canSaveDraftVisit) return;
    const newVisit: RepVisit = {
      id: Date.now(),
      day: draftForm.day,
      name: draftForm.name.trim(),
      time: draftForm.time.trim(),
      dist: draftForm.dist.trim() || '0',
      priority: draftForm.priority,
      status: 'pending',
      address: draftForm.address.trim(),
      plannedProducts: draftForm.plannedProducts.slice(),
    };
    onAddPlannedVisit?.(newVisit);
    setDraftForm(null);
  };

  const toggleDraftProduct = (productName: string) => {
    setDraftForm(prev => {
      if (!prev) return prev;
      const has = prev.plannedProducts.includes(productName);
      return {
        ...prev,
        plannedProducts: has ? prev.plannedProducts.filter(n => n !== productName) : [...prev.plannedProducts, productName],
      };
    });
  };

  const nextWeekStatusLabel = nextWeekItinerary?.status === 'draft' ? 'Draft' : nextWeekItinerary?.status === 'submitted' ? 'Awaiting RSM' : nextWeekItinerary?.status === 'approved' ? 'Approved' : '';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-5">
      {hasNextWeek && (
        <div className="fade-up flex items-center gap-1 bg-paper p-1 rounded-xl w-full sm:w-fit">
          <button
            onClick={() => setActiveTab('current')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'current' ? 'bg-white text-navy-700 shadow-sm' : 'text-navy-500 hover:text-navy-700'
            }`}
          >
            This week
            <span className="text-[9px] font-mono text-navy-400">W20</span>
          </button>
          <button
            onClick={() => setActiveTab('next')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'next' ? 'bg-white text-navy-700 shadow-sm' : 'text-navy-500 hover:text-navy-700'
            }`}
          >
            Plan next week
            <span className="text-[9px] font-mono text-navy-400">W21</span>
            {nextWeekStatusLabel && (
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                nextWeekItinerary?.status === 'draft' ? 'bg-leaf-100 text-leaf-700' :
                nextWeekItinerary?.status === 'submitted' ? 'bg-amber-100 text-amber-700' :
                'bg-leaf-100 text-leaf-700'
              }`}>{nextWeekStatusLabel}</span>
            )}
          </button>
        </div>
      )}

      <div className="fade-up">
        {isDraft && (
          <div className="rounded-2xl bg-white border-l-4 border-leaf-500 border border-navy-100 p-4 sm:p-5">
            <div className="flex items-start gap-3 flex-wrap">
              <div className="w-10 h-10 rounded-xl bg-leaf-100 flex items-center justify-center flex-shrink-0">
                <Icon name="calendar" size={20} className="text-leaf-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-display font-bold text-ink">Plan your week — {effectiveItinerary.weekLabel}</p>
                  <span className="px-2 py-0.5 rounded-full bg-leaf-100 text-leaf-700 text-[10px] font-bold tracking-wider uppercase">Draft</span>
                </div>
                <p className="text-xs text-navy-500 mt-0.5">No itinerary submitted yet. Add visits day by day, then send to your RSM for sign-off.</p>
              </div>
              <button
                onClick={openDraftForm}
                className="px-3 py-2 rounded-lg bg-leaf-600 text-white text-xs font-bold flex items-center gap-1.5 btn-press hover:bg-leaf-700 flex-shrink-0"
              >
                <Icon name="plus" size={12} /> Add visit
              </button>
            </div>
          </div>
        )}
        {effectiveItinerary.status === 'approved' && (
          <div className="rounded-2xl bg-white border-l-4 border-leaf-500 border border-navy-100 p-4 sm:p-5">
            <div className="flex items-start gap-3 flex-wrap">
              <div className="w-10 h-10 rounded-xl bg-leaf-100 flex items-center justify-center flex-shrink-0">
                <Icon name="check" size={20} className="text-leaf-600" strokeWidth={3} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-display font-bold text-ink">{effectiveItinerary.weekLabel}</p>
                  <span className="px-2 py-0.5 rounded-full bg-leaf-100 text-leaf-700 text-[10px] font-bold tracking-wider uppercase">RSM Approved</span>
                </div>
                <p className="text-xs text-navy-500 mt-0.5">Signed off by {effectiveItinerary.approvedBy} · {effectiveItinerary.approvedAt}</p>
                {effectiveItinerary.rsmNote && (
                  <div className="mt-2 p-2 rounded-lg bg-paper text-xs text-navy-700 italic">
                    "{effectiveItinerary.rsmNote}"
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">Adjustments Today</p>
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className={`w-6 h-1.5 rounded-full ${i < effectiveItinerary.adjustmentsUsedToday ? 'bg-amber-500' : 'bg-navy-100'}`} />
                  ))}
                </div>
                <p className="text-[10px] text-navy-500 font-mono">{effectiveItinerary.adjustmentsUsedToday}/{effectiveItinerary.adjustmentsLimit} used</p>
              </div>
            </div>
          </div>
        )}

        {effectiveItinerary.status === 'submitted' && (
          <div className="rounded-2xl bg-white border border-navy-100 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-navy-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  effectiveItinerary.escalationStatus === 'escalated' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  <Icon name={effectiveItinerary.escalationStatus === 'escalated' ? 'alert' : 'clock'} size={20} />
                </div>
                <div>
                  <p className="font-display font-bold text-ink text-sm sm:text-base">{effectiveItinerary.weekLabel}</p>
                  <p className="text-xs text-navy-500 mt-0.5">
                    {effectiveItinerary.escalationStatus === 'escalated' ? (
                      <span className="text-rose-600 font-bold">Escalated to DM Kemi Adeyemi — RSM unavailable</span>
                    ) : effectiveItinerary.escalationStatus === 'imminent' ? (
                      <span className="text-amber-600 font-bold">Escalation Imminent · Auto-escalates to DM in 4 hrs</span>
                    ) : (
                      <span>Awaiting RSM sign-off · Submitted {effectiveItinerary.submittedAt}</span>
                    )}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase self-start sm:self-center ${
                effectiveItinerary.escalationStatus === 'escalated' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {effectiveItinerary.escalationStatus === 'escalated' ? 'Escalated' : 'Awaiting Sign-off'}
              </span>
            </div>

            <div>
              <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase mb-3">Itinerary Approval Pathway</p>
              <div className="grid grid-cols-4 gap-2 relative">
                {[
                  { r: 'Rep', n: 'You', status: 'completed' },
                  { r: 'RSM', n: 'Tunde Bakare', status: effectiveItinerary.escalationStatus === 'escalated' ? 'skipped' : 'pending' },
                  { r: 'DM', n: 'Kemi Adeyemi', status: effectiveItinerary.escalationStatus === 'escalated' ? 'pending' : 'upcoming' },
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
                      step.status === 'pending' ? (effectiveItinerary.escalationStatus === 'escalated' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20 animate-pulse' : 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 animate-pulse') :
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
              {isDraft ? (
                <button onClick={openDraftForm} className="px-3 py-1.5 rounded-lg bg-leaf-600 text-white text-xs font-bold flex items-center gap-1.5 btn-press hover:bg-leaf-700">
                  <Icon name="plus" size={12} /> Add visit
                </button>
              ) : ((isToday || isFuture) && adjustmentsRemaining > 0 && (
                <button onClick={() => setAdjustForm({ type: 'add', visit: null })} className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 btn-press hover:bg-amber-600">
                  <Icon name="plus" size={12} /> Request Adjustment
                </button>
              ))}
            </div>

            {dayVisits.length === 0 ? (
              <div className="py-12 text-center text-sm text-navy-500">
                {isDraft ? `No visits added for ${selectedDayLabel?.label} yet — tap Add visit to plan one.` : 'No visits planned for this day'}
              </div>
            ) : (
              <div className="divide-y divide-navy-50">
                {dayVisits.map((v, idx) => (
                  <button
                    key={v.id}
                    onClick={() => !isDraft && isToday && v.status !== 'done' && onStartVisit(v)}
                    disabled={isDraft || !isToday || v.status === 'done'}
                    className={`w-full px-5 py-3.5 flex items-center gap-3 transition-colors text-left ${
                      v.status === 'done' ? 'bg-leaf-50/30 cursor-default' :
                      v.status === 'next' ? 'bg-navy-50/50 hover:bg-navy-50' :
                      (!isDraft && isToday) ? 'hover:bg-paper' : 'cursor-default'
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
                      <p className="text-[11px] text-navy-500 mt-0.5 truncate">{v.contact || v.address || 'Visit location'}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-mono font-bold text-navy-700">{v.time}</p>
                      <p className="text-[10px] text-navy-400">{v.dist} km</p>
                    </div>
                    {!isDraft && isToday && v.status !== 'done' && <Icon name="chevronRight" size={16} className="text-navy-300" />}
                    {isDraft && (
                      <span
                        onClick={(e) => { e.stopPropagation(); onRemovePlannedVisit?.(v.id); }}
                        title="Remove visit"
                        className="px-2 py-1 rounded-md text-navy-400 hover:bg-rose-50 hover:text-rose-600 text-[10px] font-bold flex-shrink-0 cursor-pointer"
                      >
                        <Icon name="x" size={12} />
                      </span>
                    )}
                    {!isDraft && (isToday || isFuture) && v.status !== 'done' && adjustmentsRemaining > 0 && (
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

          {isDraft && draftForm && (
            <div className="mt-4 rounded-2xl bg-white border-2 border-leaf-300 overflow-hidden fade-up">
              <div className="px-5 py-3 bg-leaf-50 border-b border-leaf-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="plus" size={14} className="text-leaf-700" />
                  <p className="font-display font-bold text-sm text-ink">Add visit</p>
                </div>
                <button onClick={() => setDraftForm(null)} className="text-navy-400 hover:text-navy-700">
                  <Icon name="x" size={16} />
                </button>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">Day</label>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {days.map(d => (
                      <button
                        key={d.k}
                        onClick={() => updateDraftForm({ day: d.k })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${draftForm.day === d.k ? 'bg-navy-700 text-white border-navy-700' : 'bg-paper text-navy-700 border-navy-200 hover:border-leaf-400'}`}
                      >
                        {d.l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">Location</label>
                  <p className="text-[10px] text-navy-500 mt-0.5">You'll record who you met when filling the visit log.</p>
                  <input
                    type="text"
                    value={draftForm.name}
                    onChange={e => updateDraftForm({ name: e.target.value })}
                    placeholder="Lakeshore Specialist Hospital"
                    className="input-field w-full mt-1.5 px-3 py-2 rounded-lg bg-paper border border-navy-200 text-sm text-ink"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">Time</label>
                    <input
                      type="time"
                      value={draftForm.time}
                      onChange={e => updateDraftForm({ time: e.target.value })}
                      className="input-field w-full mt-1.5 px-3 py-2 rounded-lg bg-paper border border-navy-200 text-sm text-ink"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">Distance (km)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={draftForm.dist}
                      onChange={e => updateDraftForm({ dist: e.target.value })}
                      placeholder="1.2"
                      className="input-field w-full mt-1.5 px-3 py-2 rounded-lg bg-paper border border-navy-200 text-sm text-ink"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">Priority</label>
                    <div className="mt-1.5 flex gap-1.5">
                      {(['high', 'med', 'low'] as const).map(p => (
                        <button
                          key={p}
                          onClick={() => updateDraftForm({ priority: p })}
                          className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold border capitalize ${draftForm.priority === p ? 'bg-navy-700 text-white border-navy-700' : 'bg-paper text-navy-700 border-navy-200 hover:border-leaf-400'}`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">Address</label>
                  <input
                    type="text"
                    value={draftForm.address}
                    onChange={e => updateDraftForm({ address: e.target.value })}
                    placeholder="Plot 14, Adeola Odeku, Victoria Island"
                    className="input-field w-full mt-1.5 px-3 py-2 rounded-lg bg-paper border border-navy-200 text-sm text-ink"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">Products to detail</label>
                  <p className="text-[10px] text-navy-500 mt-0.5">Products of Focus are pre-selected. You can edit during the visit.</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {PRODUCT_CATALOG.map(p => {
                      const selected = draftForm.plannedProducts.includes(p.name);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => toggleDraftProduct(p.name)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition-colors ${
                            selected
                              ? (p.focus ? 'bg-leaf-600 text-white border-leaf-600' : 'bg-navy-700 text-white border-navy-700')
                              : 'bg-paper text-navy-700 border-navy-200 hover:border-leaf-400'
                          }`}
                        >
                          {selected && <Icon name="check" size={11} strokeWidth={3} />}
                          {p.name}
                          {p.focus && <span className={`px-1 py-0 rounded text-[8px] ${selected ? 'bg-white/20 text-white' : 'bg-leaf-100 text-leaf-700'}`}>FOCUS</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setDraftForm(null)} className="flex-1 py-2.5 rounded-lg border border-navy-200 text-sm font-bold text-navy-700 hover:bg-paper btn-press">Cancel</button>
                  <button
                    onClick={handleSaveDraftVisit}
                    disabled={!canSaveDraftVisit}
                    className="flex-1 py-2.5 rounded-lg bg-leaf-600 text-white text-sm font-bold hover:bg-leaf-700 disabled:opacity-50 btn-press flex items-center justify-center gap-1.5"
                  >
                    <Icon name="check" size={14} /> Add to plan
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isDraft && adjustForm && (
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
                    <p className="text-[11px] text-navy-500">{adjustForm.visit.contact ? `${adjustForm.visit.contact} · ` : ''}{adjustForm.visit.time} · {selectedDayLabel?.label}</p>
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
                    <span className="font-bold">RSM approval required.</span> You have <span className="font-bold">{adjustmentsRemaining} of {effectiveItinerary.adjustmentsLimit}</span> adjustments left today. Tunde Bakare will be notified immediately. If unavailable, request will auto-escalate to DM Kemi Adeyemi.
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
                { l: 'Product of Focus', v: 'Coflin Forte', i: 'pill' as const },
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

          {isDraft && (
            <div className="rounded-2xl bg-white border-2 border-leaf-300 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-ink text-sm">Submit to RSM</h3>
                <span className="px-1.5 py-0.5 rounded bg-leaf-100 text-leaf-700 text-[9px] font-bold">{visits.length} VISIT{visits.length === 1 ? '' : 'S'}</span>
              </div>
              <p className="text-[11px] text-navy-500 leading-relaxed">Once you submit, Tunde Bakare (RSM) will be notified. Mid-week adjustments are still allowed (up to 3/day) after approval.</p>
              <button
                onClick={onSubmitItinerary}
                disabled={visits.length === 0}
                className="w-full py-2.5 rounded-lg bg-leaf-600 text-white text-sm font-bold hover:bg-leaf-700 disabled:opacity-50 disabled:cursor-not-allowed btn-press flex items-center justify-center gap-1.5"
              >
                <Icon name="send" size={14} /> Submit for RSM approval
              </button>
              {visits.length === 0 && (
                <p className="text-[10px] text-navy-400 text-center">Add at least one visit before submitting</p>
              )}
            </div>
          )}

          {!isDraft && (
          <>
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
                const used = i < effectiveItinerary.adjustmentsUsedToday;
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
          </>
          )}
        </div>
      </div>
    </div>
  );
}
