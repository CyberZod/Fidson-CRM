import { useState } from 'react';
import Icon from './Icon';
import type { ApprovalModalItem } from '../types';

interface ApprovalModalProps {
  item: ApprovalModalItem | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason?: string) => void;
  readOnly?: boolean; // ponytail: RSM/PM view discounts but only DM signs off
  actorName?: string;
}

type Step = 'review' | 'reject' | 'approving' | 'rejecting' | 'approved';

interface TrailStep {
  stage: string;
  who: string;
  when: string;
  decision: string;
  note?: string;
  state: 'done' | 'current' | 'skipped' | 'waiting';
}

const STD_LIMIT = 15;
const DM_LIMIT = 25;

const hhmm = (minsAgo: number) => new Date(Date.now() - minsAgo * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// Approval chain for a discount: rep → auto-check → RSM → DM → NSM.
const buildTrail = (item: ApprovalModalItem, outcome: 'pending' | 'approved' | 'rejected', actor: string): TrailStep[] => {
  const pctText = item.requestedDiscount || item.discountPct || '18%';
  const pct = parseFloat(pctText) || 18;
  if (item.type !== 'discount') {
    return [
      { stage: 'Submitted', who: item.rep, when: hhmm(190), decision: 'Submitted', note: item.detail, state: 'done' },
      { stage: 'Review', who: actor, when: outcome === 'pending' ? 'now' : hhmm(0), decision: outcome === 'pending' ? 'Awaiting decision' : outcome === 'approved' ? 'Approved' : 'Rejected', state: outcome === 'pending' ? 'current' : 'done' },
    ];
  }
  const nsm = !!item.escalatedToNSM || pct > DM_LIMIT;
  const dmDecision = outcome === 'approved' ? 'Approved' : outcome === 'rejected' ? 'Rejected' : nsm ? 'Escalated to NSM' : 'Awaiting decision';
  return [
    { stage: 'Submitted by rep', who: item.rep, when: hhmm(190), decision: `Requested ${pctText} on ${item.amount}`, note: item.justification ? item.justification.slice(0, 90) : undefined, state: 'done' },
    { stage: 'Auto-check against limit', who: 'System rule', when: hhmm(190), decision: pct > STD_LIMIT ? `Above ${STD_LIMIT}% standard limit · routed for sign-off` : `Within ${STD_LIMIT}% limit`, state: 'done' },
    { stage: 'RSM', who: 'Tunde Bakare', when: hhmm(150), decision: 'Endorsed', note: 'Key institutional account, competitor at 17%', state: 'done' },
    { stage: 'DM', who: actor, when: outcome === 'pending' && !nsm ? `SLA 4h · ${Math.max(0, 240 - 150)} min left` : hhmm(nsm && outcome === 'pending' ? 40 : 0), decision: dmDecision, state: outcome !== 'pending' || nsm ? 'done' : 'current' },
    nsm
      ? { stage: 'NSM', who: 'Bayo Ogunlana', when: outcome === 'pending' ? 'SLA 8h' : hhmm(0), decision: outcome === 'pending' ? 'Awaiting national decision' : dmDecision, state: outcome === 'pending' ? 'current' : 'done' }
      : { stage: 'NSM', who: 'Bayo Ogunlana', when: '', decision: `Not required · DM can sign up to ${DM_LIMIT}%`, state: 'skipped' },
  ];
};

function AuditTrail({ steps }: { steps: TrailStep[] }) {
  return (
    <div>
      <p className="stat-label text-navy-400 mb-2">Audit trail</p>
      <ol className="relative pl-5 space-y-3">
        <span className="absolute left-[7px] top-1 bottom-1 w-px bg-navy-200" aria-hidden />
        {steps.map((s, i) => (
          <li key={i} className="relative">
            <span className={`absolute -left-5 top-0.5 w-3.5 h-3.5 rounded-full border-2 ${
              s.state === 'done' ? 'bg-leaf-500 border-leaf-500' : s.state === 'current' ? 'bg-white border-amber-500 pulse-dot' : 'bg-white border-navy-200'
            }`} />
            <div className="flex items-baseline justify-between gap-2">
              <p className={`text-xs font-bold ${s.state === 'skipped' ? 'text-navy-400' : 'text-ink'}`}>{s.stage} · <span className="font-semibold text-navy-600">{s.who}</span></p>
              {s.when && <span className={`font-mono text-[10px] flex-shrink-0 ${s.state === 'current' ? 'text-amber-700 font-bold' : 'text-navy-400'}`}>{s.when}</span>}
            </div>
            <p className={`text-[11px] ${s.state === 'current' ? 'text-amber-700 font-semibold' : s.state === 'skipped' ? 'text-navy-400' : 'text-navy-600'}`}>{s.decision}</p>
            {s.note && <p className="text-[10px] text-navy-500 italic mt-0.5">"{s.note}"</p>}
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function ApprovalModal({ item, onClose, onApprove, onReject, readOnly = false, actorName = 'Kemi Adeyemi' }: ApprovalModalProps) {
  const [step, setStep] = useState<Step>('review');
  const [rejectReason, setRejectReason] = useState('');

  if (!item) return null;

  const handleApprove = () => {
    setStep('approving');
    setTimeout(() => {
      setStep('approved');
      setTimeout(() => {
        onApprove(item.id);
        onClose();
      }, 2600);
    }, 800);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      setStep('reject');
      return;
    }
    setStep('rejecting');
    setTimeout(() => {
      onReject(item.id, rejectReason);
      onClose();
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-end sm:justify-center fade-in"
      style={{ background: 'rgba(10, 24, 48, 0.5)' }}
      onClick={onClose}
    >
      <div className="bg-white w-full sm:w-[480px] sm:max-w-[90vw] sm:rounded-2xl shadow-2xl overflow-hidden slide-in-right" onClick={e => e.stopPropagation()}>
        {step === 'review' && (
          <>
            <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">{item.orderId || item.id}</p>
                <h3 className="font-display font-bold text-ink">{item.type === 'discount' ? 'Discount Approval' : 'Clinical Meeting Approval'}</h3>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-paper flex items-center justify-center">
                <Icon name="x" size={18} />
              </button>
            </div>

            <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
              <div className="p-4 rounded-xl bg-paper">
                <p className="stat-label text-navy-400">Submitted by</p>
                <p className="font-display font-bold text-ink mt-1">{item.rep}</p>
                <p className="text-xs text-navy-500 mt-0.5">{item.detail}</p>
              </div>

              {item.type === 'discount' && (
                <>
                  <div>
                    <p className="stat-label text-navy-400 mb-2">Order Items</p>
                    <div className="p-3 rounded-xl bg-white border border-navy-100 space-y-2">
                      {(item.items || [
                        { n: 'Coflin Forte 600mg', q: 200, p: '₦240,000' },
                        { n: 'Astrazon 10mg', q: 50, p: '₦42,500' },
                        { n: 'Tuxil-N Syrup 100ml', q: 100, p: '₦48,000' },
                      ]).map((it, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div>
                            <p className="font-medium text-ink">{it.n}</p>
                            <p className="text-[11px] text-navy-500">× {it.q}</p>
                          </div>
                          <p className="font-mono font-bold text-ink">{it.p}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border-2 border-amber-200 bg-amber-50/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="alert" size={14} className="text-amber-700" />
                      <p className="text-[10px] font-bold text-amber-700 tracking-wider uppercase">Exceeds Standard Threshold</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><p className="stat-label text-navy-400">Requested</p><p className="font-display text-2xl font-bold text-amber-700">{item.requestedDiscount || '18%'}</p></div>
                      <div><p className="stat-label text-navy-400">Std. Limit</p><p className="font-display text-2xl font-bold text-navy-700">15%</p></div>
                    </div>
                  </div>
                </>
              )}

              <div>
                <p className="stat-label text-navy-400 mb-2">Rep Justification</p>
                <div className="p-3 rounded-xl bg-paper border border-navy-100">
                  <p className="text-sm text-navy-700 leading-relaxed">
                    {item.justification || `"Customer ordering 200+ cartons (volume tier 3). Competitor offering 17% on similar SKUs. ${item.detail.split(' on ')[1] || 'Key institutional account'} is a key institutional account, top 5 by quarterly volume."`}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl text-white relative overflow-hidden" style={{ background: 'linear-gradient(120deg, #0F2147 0%, #142A5A 100%)' }}>
                <div className="absolute inset-0 ai-shimmer" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="sparkles" size={14} className="text-leaf-300" />
                    <p className="text-[10px] font-bold text-leaf-300 tracking-wider uppercase">AI Recommendation</p>
                  </div>
                  <p className="text-sm leading-relaxed">
                    <span className="font-bold text-leaf-300">Approve.</span> Customer LTV is ₦18.4M; similar discount tiers historically yielded +23% reorder rate within 60 days.
                  </p>
                </div>
              </div>

              <AuditTrail steps={buildTrail(item, 'pending', actorName)} />

              {item.type === 'discount' && (
                <div className="p-4 rounded-xl bg-navy-900 text-white space-y-2">
                  <div className="flex justify-between text-xs"><span className="text-navy-200">Subtotal</span><span className="font-mono">₦330,500</span></div>
                  <div className="flex justify-between text-xs"><span className="text-leaf-300">Discount ({item.requestedDiscount || '18%'})</span><span className="font-mono text-leaf-300">−₦59,490</span></div>
                  <div className="flex justify-between pt-2 border-t border-white/10"><span className="text-xs font-bold tracking-wider uppercase">Net Total</span><span className="font-display font-bold text-lg">{item.amount || '₦271,010'}</span></div>
                </div>
              )}
            </div>

            {readOnly ? (
              <div className="px-5 py-4 border-t border-navy-100 flex items-center justify-center gap-2 bg-paper">
                <Icon name="lock" size={14} className="text-navy-400" />
                <p className="text-xs font-semibold text-navy-500">Read-only · sign-off authority sits with the DM</p>
              </div>
            ) : (
              <div className="px-5 py-4 border-t border-navy-100 flex gap-2">
                <button onClick={() => setStep('reject')} className="flex-1 py-2.5 rounded-lg border border-navy-200 text-sm font-bold text-navy-700 hover:bg-paper btn-press">Reject</button>
                <button onClick={handleApprove} className="flex-1 py-2.5 rounded-lg bg-leaf-500 text-white text-sm font-bold hover:bg-leaf-600 btn-press">Approve</button>
              </div>
            )}
          </>
        )}

        {step === 'reject' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button onClick={() => setStep('review')} className="text-navy-500 hover:text-navy-700">
                  <Icon name="chevronLeft" size={20} />
                </button>
                <h3 className="font-display font-bold text-ink">Reject Request</h3>
              </div>
              <button onClick={onClose} className="text-navy-400 hover:text-navy-700"><Icon name="x" size={18} /></button>
            </div>
            <p className="text-sm text-navy-500 mb-4">Provide a reason for rejection. {item.rep} will be notified in-app.</p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Discount exceeds quarterly margin allocation. Try volume-based negotiation."
              rows={4}
              className="input-field w-full p-3 rounded-xl bg-white border border-navy-200 text-sm text-ink transition-all resize-none"
            />

            <div className="mt-4 flex gap-2">
              <button onClick={() => setStep('review')} className="flex-1 py-2.5 rounded-lg border border-navy-200 text-sm font-bold text-navy-700 hover:bg-paper btn-press">Cancel</button>
              <button onClick={handleReject} disabled={!rejectReason.trim()} className="flex-1 py-2.5 rounded-lg bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 disabled:opacity-50 btn-press">Confirm Reject</button>
            </div>
          </div>
        )}

        {(step === 'approving' || step === 'rejecting') && (
          <div className="p-12 text-center">
            <Icon name="refresh" size={40} className="text-navy-400 spin mx-auto" />
            <p className="mt-4 font-display font-semibold text-ink">{step === 'approving' ? 'Approving' : 'Rejecting'}...</p>
            <p className="text-xs text-navy-500 mt-1">Syncing decision via SOA API</p>
          </div>
        )}

        {step === 'approved' && (
          <div className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-leaf-100 mx-auto flex items-center justify-center fade-up">
              <Icon name="check" size={40} className="text-leaf-600" strokeWidth={3} />
            </div>
            <h3 className="mt-5 font-display text-2xl font-bold text-ink fade-up stagger-1">Approved</h3>
            <p className="text-sm text-navy-500 mt-1 fade-up stagger-2">{item.rep} notified · SOA syncing now</p>
            <div className="mt-5 text-left fade-up stagger-3">
              <AuditTrail steps={buildTrail(item, 'approved', actorName)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
