import { useMemo, useState } from 'react';
import Icon from './Icon';
import type { ContentApprovalRow } from '../types';

interface MMContentApprovalsViewProps {
  contentApprovals: ContentApprovalRow[];
  onApproveContent: (id: string) => void;
  onRejectContent: (id: string) => void;
}

type FilterKey = 'pending' | 'approved' | 'all';

export default function MMContentApprovalsView({ contentApprovals, onApproveContent, onRejectContent }: MMContentApprovalsViewProps) {
  const [filter, setFilter] = useState<FilterKey>('pending');

  const filtered = useMemo(() => {
    if (filter === 'all') return contentApprovals;
    return contentApprovals.filter(c => c.status === filter);
  }, [filter, contentApprovals]);

  const counts: Record<FilterKey, number> = useMemo(() => ({
    all: contentApprovals.length,
    pending: contentApprovals.filter(c => c.status === 'pending').length,
    approved: contentApprovals.filter(c => c.status === 'approved').length,
  }), [contentApprovals]);

  const filters: { k: FilterKey; l: string }[] = [
    { k: 'pending', l: 'Pending' }, { k: 'approved', l: 'Approved' }, { k: 'all', l: 'All' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div className="fade-up p-4 rounded-2xl bg-fuchsia-50 border border-fuchsia-200 flex items-start gap-3">
        <Icon name="file" size={20} className="text-fuchsia-700 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-display font-bold text-ink">Content Approval Gateway</p>
          <p className="text-xs text-navy-700 mt-1">As Marketing Manager, you sign off on all detailing materials and brand content before they're auto-distributed to reps. PMs submit here; you ensure brand consistency, regulatory compliance, and budget alignment.</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden fade-up stagger-1">
        <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-display font-bold text-ink">Content Submissions</h3>
          <div className="flex items-center gap-1 bg-paper rounded-lg p-1">
            {filters.map(f => (
              <button
                key={f.k}
                onClick={() => setFilter(f.k)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                  filter === f.k ? 'bg-white text-fuchsia-700 shadow-sm' : 'text-navy-500'
                }`}
              >
                {f.l}
                <span className={`px-1 rounded text-[9px] ${filter === f.k ? 'bg-fuchsia-100' : 'bg-navy-200/50'}`}>{counts[f.k]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-navy-50">
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-14 h-14 rounded-full bg-leaf-50 mx-auto flex items-center justify-center mb-3">
                <Icon name="check" size={24} className="text-leaf-600" strokeWidth={2.5} />
              </div>
              <p className="font-display font-semibold text-ink">All caught up</p>
              <p className="text-xs text-navy-500 mt-1">No content awaiting your approval</p>
            </div>
          ) : filtered.map(c => (
            <div key={c.id} className={`${c.dismissing ? 'slide-out-up' : ''} px-5 py-4`}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-fuchsia-50 flex items-center justify-center flex-shrink-0">
                  <Icon name="file" size={18} className="text-fuchsia-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display font-semibold text-sm text-ink">{c.material}</p>
                    {c.urgent && <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[9px] font-bold">URGENT</span>}
                    {c.status === 'approved' && <span className="px-1.5 py-0.5 rounded bg-leaf-100 text-leaf-700 text-[9px] font-bold">APPROVED</span>}
                  </div>
                  <p className="text-[11px] text-navy-500 mt-0.5">Submitted by {c.pm} · {c.cat} · {c.format}</p>
                  {c.note && <p className="text-xs text-navy-700 mt-2 p-2 rounded-lg bg-paper">{c.note}</p>}
                  <div className="mt-2 flex items-center gap-3 flex-wrap">
                    <span className="text-[10px] text-navy-500">Target: <span className="font-bold">{c.target}</span></span>
                    <span className="text-[10px] text-navy-500">Budget: <span className="font-mono font-bold text-fuchsia-700">{c.budget}</span></span>
                    <span className="text-[10px] text-navy-500">Submitted: <span className="font-bold">{c.submitted}</span></span>
                  </div>
                </div>
                {c.status === 'pending' && (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => onRejectContent(c.id)} className="px-3 py-1.5 rounded-lg border border-navy-200 text-xs font-bold text-navy-700 hover:bg-navy-50 btn-press">Reject</button>
                    <button onClick={() => onApproveContent(c.id)} className="px-3 py-1.5 rounded-lg bg-fuchsia-500 text-white text-xs font-bold hover:bg-fuchsia-600 btn-press">Approve & Distribute</button>
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
