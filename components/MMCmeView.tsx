import { useState } from 'react';
import Icon from './Icon';
import CMDetailDrawer from './CMDetailDrawer';
import type { ClinicalMeetingRow } from '../types';

interface MMCmeViewProps {
  clinicalMeetings: ClinicalMeetingRow[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export default function MMCmeView({ clinicalMeetings, onApprove, onReject }: MMCmeViewProps) {
  const highImpactCMs = clinicalMeetings.filter(c => c.s === 'hom-review');
  const [openCm, setOpenCm] = useState<ClinicalMeetingRow | null>(null);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div className="fade-up p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
        <Icon name="flask" size={20} className="text-amber-700 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-display font-bold text-ink">High-Impact CM Approvals</p>
          <p className="text-xs text-navy-700 mt-1">Multi-regional clinical events and high-budget meetings escalated by PMs. Per the URS, formal sign-off sits with the <strong>Head of Marketing</strong>; MM previews here on HoM's behalf until the HoM persona is added.</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden fade-up stagger-1">
        <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between">
          <h3 className="font-display font-bold text-ink">Escalated CMs · {highImpactCMs.length}</h3>
          <span className="px-2 py-1 rounded-full bg-fuchsia-100 text-fuchsia-700 text-[10px] font-bold">MM TIER</span>
        </div>
        <div className="divide-y divide-navy-50">
          {highImpactCMs.length === 0 ? (
            <div className="py-12 text-center text-sm text-navy-500">No high-impact CMs awaiting MM approval</div>
          ) : highImpactCMs.map(cm => (
            <div key={cm.id} className={`${cm.dismissing ? 'slide-out-up' : ''} px-5 py-4`}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-fuchsia-50 flex items-center justify-center flex-shrink-0">
                  <Icon name="flask" size={18} className="text-fuchsia-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display font-semibold text-sm text-ink">{cm.t}</p>
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[9px] font-bold">HIGH-IMPACT</span>
                    <span className="px-1.5 py-0.5 rounded bg-fuchsia-100 text-fuchsia-700 text-[9px] font-bold">ESCALATED BY PM</span>
                  </div>
                  <p className="text-[11px] text-navy-500 mt-0.5">{cm.hcp} · Rep: {cm.rep} · {cm.date} · {cm.attendees} attendees</p>
                  <p className="font-mono text-sm font-bold text-fuchsia-700 mt-2">{cm.budget}</p>
                </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 w-full sm:w-auto">
                  <button onClick={() => setOpenCm(cm)} className="flex-1 sm:flex-none px-2.5 py-2 sm:py-1.5 rounded-lg border border-navy-200 text-xs font-bold text-navy-700 hover:bg-paper btn-press flex items-center justify-center gap-1">
                    <Icon name="eye" size={11} /> Details
                  </button>
                  <button onClick={() => onReject(cm.id)} className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 rounded-lg border border-navy-200 text-xs font-bold text-navy-700 hover:bg-navy-50 btn-press">Reject</button>
                  <button onClick={() => onApprove(cm.id)} className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 rounded-lg bg-fuchsia-500 text-white text-xs font-bold hover:bg-fuchsia-600 btn-press">Approve</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CMDetailDrawer cm={openCm} onClose={() => setOpenCm(null)} accent="fuchsia" />
    </div>
  );
}
