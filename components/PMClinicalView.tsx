import { useState } from 'react';
import Icon from './Icon';
import type { ClinicalMeetingRow } from '../types';

interface PMClinicalViewProps {
  clinicalMeetings: ClinicalMeetingRow[];
  onApproveCM: (id: string) => void;
  onRejectCM: (id: string) => void;
}

type FilterKey = 'pending' | 'approved' | 'all';

export default function PMClinicalView({ clinicalMeetings, onApproveCM, onRejectCM }: PMClinicalViewProps) {
  const [filter, setFilter] = useState<FilterKey>('pending');

  const allCMs = clinicalMeetings.filter(c =>
    c.t.toLowerCase().includes('respirat') || c.t.toLowerCase().includes('coflin') ||
    c.t.toLowerCase().includes('mucolytic') || c.t.toLowerCase().includes('paediatric') ||
    c.t.toLowerCase().includes('cme') || c.s === 'pm-review'
  );

  const filtered = filter === 'pending' ? allCMs.filter(c => c.s === 'pm-review' || c.s === 'hom-review') :
    filter === 'approved' ? allCMs.filter(c => c.s === 'approved') : allCMs;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      <div className="fade-up rounded-2xl bg-white border border-navy-100 p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-display font-bold text-ink">Phase 6 · CME Approval Flow</h3>
          <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[9px] font-bold">YOU ARE PM</span>
        </div>
        <p className="text-xs text-navy-500 mb-5">Rep submits → PM reviews → HoM (if high-impact) → Logged in CRM</p>

        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          {[
            { l: 'Rep submits', s: 'CM form + budget', c: 'done' },
            { l: 'PM reviews', s: 'You · Content + budget check', c: 'active' },
            { l: 'HoM approval', s: 'If high-impact', c: 'pending' },
            { l: 'Logged in CRM', s: 'Auto-archived', c: 'pending' },
          ].map((s, i) => (
            <div key={i} className="flex md:flex-1 md:flex-col gap-3">
              <div className={`md:flex-1 p-3 rounded-xl border w-full ${
                s.c === 'done' ? 'bg-leaf-50 border-leaf-200' :
                s.c === 'active' ? 'bg-violet-50 border-violet-300 ring-2 ring-violet-200' : 'bg-paper border-navy-100'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-display font-bold text-[10px] ${
                    s.c === 'done' ? 'bg-leaf-500 text-white' :
                    s.c === 'active' ? 'bg-violet-500 text-white' : 'bg-navy-200 text-navy-500'
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

      <div className="fade-up stagger-1 rounded-2xl bg-white border border-navy-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-display font-bold text-ink">CMs for Your Portfolio</h3>
          <div className="flex items-center gap-1 bg-paper rounded-lg p-1">
            {([{ k: 'pending', l: 'Pending' }, { k: 'approved', l: 'Approved' }, { k: 'all', l: 'All' }] as { k: FilterKey; l: string }[]).map(f => (
              <button
                key={f.k}
                onClick={() => setFilter(f.k)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                  filter === f.k ? 'bg-white text-violet-700 shadow-sm' : 'text-navy-500'
                }`}
              >{f.l}</button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-navy-50">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-navy-500">No clinical meetings in this view</div>
          ) : filtered.map(cm => (
            <div key={cm.id} className={`${cm.dismissing ? 'slide-out-up' : ''} px-5 py-4 hover:bg-paper transition-colors`}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                  <Icon name="flask" size={18} className="text-violet-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display font-semibold text-sm text-ink">{cm.t}</p>
                    {cm.hi && <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[9px] font-bold">HIGH-IMPACT · NEEDS HOM</span>}
                  </div>
                  <p className="text-[11px] text-navy-500 mt-1">{cm.hcp} · {cm.rep} · {cm.date} · {cm.attendees} attendees</p>
                  <div className="mt-2 flex items-center gap-3 flex-wrap">
                    <p className="font-mono text-sm font-bold text-violet-700">{cm.budget}</p>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      cm.s === 'pm-review' ? 'bg-violet-100 text-violet-700' :
                      cm.s === 'hom-review' ? 'bg-amber-100 text-amber-700' : 'bg-leaf-100 text-leaf-700'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        cm.s === 'pm-review' ? 'bg-violet-500' :
                        cm.s === 'hom-review' ? 'bg-amber-500' : 'bg-leaf-500'
                      }`} />
                      {cm.s === 'pm-review' ? 'AWAITING YOU' : cm.s === 'hom-review' ? 'WITH HOM' : 'APPROVED'}
                    </span>
                  </div>
                </div>
                {cm.s === 'pm-review' && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => onRejectCM(cm.id)} className="px-3 py-1.5 rounded-lg border border-navy-200 text-xs font-bold text-navy-700 hover:bg-navy-50 btn-press">Reject</button>
                    <button onClick={() => onApproveCM(cm.id)} className="px-3 py-1.5 rounded-lg bg-violet-500 text-white text-xs font-bold hover:bg-violet-600 btn-press">Approve</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
