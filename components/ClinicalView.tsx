import { useMemo, useState } from 'react';
import Icon from './Icon';
import type { ClinicalMeetingRow } from '../types';

interface ClinicalViewProps {
  clinicalMeetings: ClinicalMeetingRow[];
  onApproveCM: (id: string) => void;
  onRejectCM: (id: string) => void;
}

type StatusKey = 'all' | 'pm-review' | 'hom-review' | 'approved';

export default function ClinicalView({ clinicalMeetings, onApproveCM, onRejectCM }: ClinicalViewProps) {
  const [statusFilter, setStatusFilter] = useState<StatusKey>('all');

  const filteredCMs = useMemo(() => {
    if (statusFilter === 'all') return clinicalMeetings;
    return clinicalMeetings.filter(cm => cm.s === statusFilter);
  }, [clinicalMeetings, statusFilter]);

  const counts: Record<StatusKey, number> = useMemo(() => ({
    all: clinicalMeetings.length,
    'pm-review': clinicalMeetings.filter(cm => cm.s === 'pm-review').length,
    'hom-review': clinicalMeetings.filter(cm => cm.s === 'hom-review').length,
    approved: clinicalMeetings.filter(cm => cm.s === 'approved').length,
  }), [clinicalMeetings]);

  const statusButtons: { k: StatusKey; l: string }[] = [
    { k: 'all', l: 'All' }, { k: 'pm-review', l: 'PM Review' },
    { k: 'hom-review', l: 'HoM Review' }, { k: 'approved', l: 'Approved' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { l: 'CMs This Quarter', v: '42', d: '+8 vs Q1' },
          { l: 'Total Attendees', v: '1,247', d: '29.7 avg' },
          { l: 'Pending Review', v: (counts['pm-review'] + counts['hom-review']).toString(), d: `${counts['hom-review']} high-impact` },
          { l: 'ROI Score', v: '3.2×', d: 'Per ₦ spent' },
        ].map((k, i) => (
          <div key={i} className={`fade-up stagger-${i + 1} p-5 rounded-2xl bg-white border border-navy-100`}>
            <p className="stat-label text-navy-400">{k.l}</p>
            <p className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">{k.v}</p>
            <p className="text-[11px] text-navy-500 mt-1">{k.d}</p>
          </div>
        ))}
      </div>

      <div className="fade-up stagger-2 rounded-2xl bg-white border border-navy-100 p-5 sm:p-6">
        <h3 className="font-display font-bold text-ink mb-1">Approval Workflow · Phase 6</h3>
        <p className="text-xs text-navy-500 mb-5">Rep → Product Manager → Head of Marketing (high-impact only)</p>

        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          {[
            { l: 'Rep submits', s: 'CM form + budget', c: 'done' },
            { l: 'PM reviews', s: 'Content + budget check', c: 'active' },
            { l: 'HoM approval', s: 'High-impact escalation', c: 'pending' },
            { l: 'Logged in CRM', s: 'Auto-archived', c: 'pending' },
          ].map((s, i) => (
            <div key={i} className="flex md:flex-1 md:flex-col items-center md:items-stretch gap-3">
              <div className={`md:flex-1 p-3 rounded-xl border w-full ${
                s.c === 'done' ? 'bg-leaf-50 border-leaf-200' :
                s.c === 'active' ? 'bg-amber-50 border-amber-200' : 'bg-paper border-navy-100'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-display font-bold text-[10px] ${
                    s.c === 'done' ? 'bg-leaf-500 text-white' :
                    s.c === 'active' ? 'bg-amber-500 text-white' : 'bg-navy-200 text-navy-500'
                  }`}>
                    {s.c === 'done' ? <Icon name="check" size={12} strokeWidth={3} /> : i + 1}
                  </div>
                  <p className="font-display font-bold text-xs text-ink">{s.l}</p>
                </div>
                <p className="text-[10px] text-navy-500 pl-8">{s.s}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fade-up stagger-3 rounded-2xl bg-white border border-navy-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-display font-bold text-ink">Clinical Meeting Requests</h3>
          <div className="flex items-center gap-1 bg-paper rounded-lg p-1">
            {statusButtons.map(s => (
              <button
                key={s.k}
                onClick={() => setStatusFilter(s.k)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                  statusFilter === s.k ? 'bg-white text-navy-700 shadow-sm' : 'text-navy-500'
                }`}
              >
                {s.l}
                <span className={`px-1 rounded text-[9px] ${statusFilter === s.k ? 'bg-navy-100' : 'bg-navy-200/50'}`}>{counts[s.k]}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-navy-50">
          {filteredCMs.length === 0 ? (
            <div className="py-12 text-center text-sm text-navy-500">No clinical meetings in this status</div>
          ) : filteredCMs.map(cm => (
            <div key={cm.id} className={`${cm.dismissing ? 'slide-out-up' : ''} px-5 py-3 hover:bg-paper transition-colors flex items-center gap-3 sm:gap-4`}>
              <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0">
                <Icon name="flask" size={18} className="text-navy-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-display font-semibold text-sm text-ink">{cm.t}</p>
                  {cm.hi && <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[9px] font-bold">HIGH-IMPACT</span>}
                </div>
                <p className="text-[11px] text-navy-500 mt-0.5 truncate">{cm.hcp} · {cm.rep} · {cm.date}</p>
              </div>
              <div className="hidden md:block text-right">
                <p className="font-mono text-xs font-bold text-ink">{cm.budget}</p>
                <p className="text-[10px] text-navy-400">{cm.attendees} attendees</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                cm.s === 'pm-review' ? 'bg-amber-50 text-amber-700' :
                cm.s === 'hom-review' ? 'bg-rose-50 text-rose-700' : 'bg-leaf-50 text-leaf-700'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  cm.s === 'pm-review' ? 'bg-amber-500' :
                  cm.s === 'hom-review' ? 'bg-rose-500' : 'bg-leaf-500'
                }`} />
                {cm.s === 'pm-review' ? 'PM REVIEW' : cm.s === 'hom-review' ? 'HOM REVIEW' : 'APPROVED'}
              </span>
              {cm.s !== 'approved' && (
                <div className="flex items-center gap-1">
                  <button onClick={() => onRejectCM(cm.id)} className="px-2 py-1 rounded-md border border-navy-200 text-[10px] font-bold text-navy-700 hover:bg-navy-50 btn-press">Reject</button>
                  <button onClick={() => onApproveCM(cm.id)} className="px-2 py-1 rounded-md bg-leaf-500 text-white text-[10px] font-bold hover:bg-leaf-600 btn-press">Approve</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
