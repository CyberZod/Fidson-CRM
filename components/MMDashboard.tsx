import Icon from './Icon';
import type { ContentApprovalRow, ClinicalMeetingRow } from '../types';

interface MMDashboardProps {
  onNavigate: (view: string) => void;
  contentApprovals: ContentApprovalRow[];
  clinicalMeetings: ClinicalMeetingRow[];
}

export default function MMDashboard({ onNavigate, contentApprovals, clinicalMeetings }: MMDashboardProps) {
  const pendingContentCount = (contentApprovals || []).filter(c => c.status === 'pending').length;
  const pendingHighImpactCMs = (clinicalMeetings || []).filter(c => c.s === 'hom-review').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="fade-up">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-fuchsia-100 text-fuchsia-700 text-[10px] font-bold tracking-wider uppercase">Marketing Manager</span>
              <span className="text-xs text-navy-500">Institution · Nationwide</span>
            </div>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-ink">
              Hello <span style={{ background: 'linear-gradient(135deg, #142A5A 0%, #D946EF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Tola</span> — brand health is strong
            </h2>
            <p className="text-sm text-navy-500 mt-1">{pendingContentCount} content approvals pending · {pendingHighImpactCMs} high-impact CMs awaiting your sign-off · You report to HoM</p>
          </div>
          <button onClick={() => onNavigate('mm-content')} className="px-3 py-2 rounded-lg bg-fuchsia-500 text-white text-xs font-semibold flex items-center gap-1.5 btn-press hover:bg-fuchsia-600">
            <Icon name="file" size={14} /> Review Content Queue
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { l: 'Active Campaigns', v: '8', d: '3 nationwide', c: 'fuchsia' },
          { l: 'Content Approvals', v: pendingContentCount.toString(), d: 'awaiting review', c: pendingContentCount > 0 ? 'amber' : 'leaf' },
          { l: 'Avg Open Rate', v: '82%', d: '+9% vs Q1', c: 'leaf' },
          { l: 'Campaign ROI', v: '4.1×', d: 'across portfolio', c: 'fuchsia' },
        ].map((k, i) => (
          <div key={i} className={`fade-up stagger-${i + 1} p-4 sm:p-5 rounded-2xl bg-white border border-navy-100`}>
            <p className="stat-label text-navy-400">{k.l}</p>
            <p className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">{k.v}</p>
            <p className={`text-[11px] font-semibold mt-1 ${k.c === 'fuchsia' ? 'text-fuchsia-700' : k.c === 'leaf' ? 'text-leaf-700' : 'text-amber-700'}`}>{k.d}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="fade-up rounded-2xl bg-white border border-navy-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-display font-bold text-ink">Cross-Product Marketing Analytics</h3>
                <p className="text-xs text-navy-500 mt-0.5">All portfolios · Institution channel · Nationwide</p>
              </div>
              <span className="px-2 py-1 rounded-full bg-fuchsia-50 text-fuchsia-700 text-[10px] font-bold">MM SCOPE</span>
            </div>
            <div className="p-5 space-y-3">
              {[
                { portfolio: 'Respiratory (Coflin, Tuxil-N)', pm: 'Dr. Femi Akande', vol: '₦92M', g: 24, content: 14, reach: 89 },
                { portfolio: 'Cardiovascular', pm: 'Dr. Ngozi Eze', vol: '₦68M', g: 12, content: 9, reach: 74 },
                { portfolio: 'Anti-Infectives', pm: 'Dr. Bode Kayode', vol: '₦54M', g: -3, content: 7, reach: 62 },
                { portfolio: 'Diabetes & Endocrine', pm: 'Dr. Aisha Bello', vol: '₦34M', g: 18, content: 5, reach: 48 },
              ].map((p, i) => (
                <div key={i} className="p-4 rounded-xl bg-paper border border-navy-100">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <div>
                      <p className="font-display font-bold text-sm text-ink">{p.portfolio}</p>
                      <p className="text-[11px] text-navy-500">PM: {p.pm}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-mono text-sm font-bold text-ink">{p.vol}</p>
                        <p className={`text-[10px] font-bold ${p.g > 0 ? 'text-leaf-700' : 'text-rose-600'}`}>{p.g > 0 ? '+' : ''}{p.g}% MoM</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-navy-200">
                    <div>
                      <p className="text-[10px] text-navy-400 font-bold tracking-wider uppercase">Materials Live</p>
                      <p className="font-display text-base font-bold text-ink mt-0.5">{p.content}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-navy-400 font-bold tracking-wider uppercase">National Reach</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 rounded-full bg-navy-100 overflow-hidden max-w-[100px]">
                          <div className="h-full rounded-full bg-fuchsia-500" style={{ width: `${p.reach}%` }} />
                        </div>
                        <span className="font-mono text-xs font-bold text-fuchsia-700">{p.reach}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="fade-up stagger-1 rounded-2xl bg-white border border-navy-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-navy-100">
              <h3 className="font-display font-bold text-ink">Active Campaigns</h3>
              <p className="text-xs text-navy-500 mt-0.5">Nationwide marketing initiatives</p>
            </div>
            <div className="divide-y divide-navy-50">
              {[
                { n: 'Q2 Coflin Focus', t: 'Institutional · Respiratory', start: 'Apr 1', spend: '₦8.2M', engage: 92 },
                { n: 'Diabetes Awareness Month', t: 'Multi-channel · Q2', start: 'May 1', spend: '₦4.6M', engage: 71 },
                { n: 'Antibiotic Stewardship', t: 'CM-led · 4 regions', start: 'May 8', spend: '₦3.4M', engage: 84 },
                { n: 'Cardio Year-Round', t: 'Continuous · National', start: 'Jan 1', spend: '₦12M', engage: 68 },
              ].map((c, i) => (
                <div key={i} className="px-5 py-3 hover:bg-paper transition-colors">
                  <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-display font-semibold text-sm text-ink">{c.n}</p>
                        <span className="px-1.5 py-0.5 rounded bg-leaf-100 text-leaf-700 text-[9px] font-bold">LIVE</span>
                      </div>
                      <p className="text-[11px] text-navy-500">{c.t} · Started {c.start}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-bold text-ink">{c.spend}</p>
                      <p className="text-[10px] text-navy-400">spend</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-navy-500 w-20">Engagement</span>
                    <div className="flex-1 h-1.5 rounded-full bg-navy-100 overflow-hidden">
                      <div className="h-full rounded-full bg-fuchsia-500" style={{ width: `${c.engage}%` }} />
                    </div>
                    <span className="font-mono text-[11px] font-bold text-fuchsia-700">{c.engage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="fade-up stagger-2 rounded-2xl bg-white border border-fuchsia-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-fuchsia-100 bg-fuchsia-50/50">
              <div className="flex items-center gap-2">
                <Icon name="file" size={16} className="text-fuchsia-700" />
                <h3 className="font-display font-bold text-ink text-sm">Content Awaiting Approval</h3>
              </div>
              <p className="text-[11px] text-fuchsia-700 mt-0.5">PMs have submitted {pendingContentCount} materials</p>
            </div>
            <div className="divide-y divide-fuchsia-50">
              {(contentApprovals || []).filter(c => c.status === 'pending').slice(0, 3).map((c, i) => (
                <div key={i} className="px-5 py-3">
                  <div className="flex items-start gap-2">
                    <Icon name="file" size={14} className="text-fuchsia-700 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-xs text-ink truncate">{c.material}</p>
                      <p className="text-[10px] text-navy-500">From {c.pm} · {c.cat}</p>
                    </div>
                    {c.urgent && <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[9px] font-bold">URGENT</span>}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => onNavigate('mm-content')} className="w-full py-2.5 border-t border-fuchsia-100 text-xs font-bold text-fuchsia-700 hover:bg-fuchsia-50">
              Review all →
            </button>
          </div>

          {pendingHighImpactCMs > 0 && (
            <div className="fade-up stagger-3 rounded-2xl bg-amber-50 border border-amber-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="alert" size={14} className="text-amber-700" />
                <p className="text-[10px] font-bold text-amber-700 tracking-wider uppercase">{pendingHighImpactCMs} High-Impact CMs</p>
              </div>
              <p className="text-xs text-navy-700 leading-relaxed">PMs have escalated multi-regional clinical events for your strategic sign-off.</p>
              <button onClick={() => onNavigate('mm-cme')} className="mt-2 text-xs font-bold text-amber-700 flex items-center gap-1">
                Review escalations <Icon name="arrowRight" size={12} />
              </button>
            </div>
          )}

          <div className="fade-up stagger-4 relative p-5 rounded-2xl overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, #701A75 0%, #D946EF 100%)' }}>
            <div className="absolute inset-0 ai-shimmer" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-sm">
                  <Icon name="sparkles" size={16} className="text-white" />
                </div>
                <p className="text-[10px] font-bold text-fuchsia-200 tracking-[0.2em] uppercase">Brand AI</p>
              </div>
              <h3 className="font-display text-lg font-bold leading-tight">Coflin reach up 27%</h3>
              <p className="text-sm text-white/85 mt-2">Q2 Coflin Focus campaign is the strongest performer this quarter. Recommend extending to North-East region.</p>
              <button className="mt-4 px-3 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-bold backdrop-blur-sm flex items-center gap-1.5">
                Extend campaign <Icon name="arrowRight" size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
