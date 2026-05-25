import Icon from './Icon';
import type { ClinicalMeetingRow, ContentApprovalRow } from '../types';

interface HoMDashboardProps {
  onNavigate: (view: string) => void;
  clinicalMeetings?: ClinicalMeetingRow[];
  contentApprovals?: ContentApprovalRow[];
}

export default function HoMDashboard({ onNavigate, clinicalMeetings = [], contentApprovals = [] }: HoMDashboardProps) {
  const pendingHighImpactCMs = clinicalMeetings.filter(c => c.s === 'hom-review').length;
  const pendingContent = contentApprovals.filter(c => c.status === 'pending').length;

  const institutionMonths = [62, 68, 71, 78, 84, 92];
  const tradeMonths = [54, 56, 55, 58, 57, 56];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="fade-up">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-fuchsia-100 text-fuchsia-700 text-[10px] font-bold tracking-wider uppercase">Head of Marketing</span>
              <span className="text-xs text-navy-500">Marketing Leadership · 2 Channels</span>
            </div>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-ink">
              Good morning, <span style={{ background: 'linear-gradient(135deg, #142A5A 0%, #D946EF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Ade</span>
            </h2>
            <p className="text-sm text-navy-500 mt-1">Institution + Trade · You report to BMD</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onNavigate('mm-cme')} className="px-3 py-2 rounded-lg border border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 text-xs font-semibold flex items-center gap-1.5 btn-press hover:bg-fuchsia-100">
              <Icon name="flask" size={14} /> Review High-Impact CMs
            </button>
            <button onClick={() => onNavigate('hom-directive')} className="px-3 py-2 rounded-lg bg-fuchsia-500 text-white text-xs font-semibold flex items-center gap-1.5 btn-press hover:bg-fuchsia-600">
              <Icon name="send" size={14} /> Push National Directive
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { l: 'Active Campaigns', v: '4', d: '2 nationwide · 2 regional', c: 'fuchsia' },
          { l: 'High-Impact CMs Pending', v: pendingHighImpactCMs.toString(), d: pendingHighImpactCMs > 0 ? 'awaiting your sign-off' : 'all clear', c: pendingHighImpactCMs > 0 ? 'amber' : 'leaf' },
          { l: 'Content Approved YTD', v: '62', d: pendingContent > 0 ? `${pendingContent} in queue` : 'queue empty', c: 'fuchsia' },
          { l: 'Marketing Spend YTD', v: '₦42M', d: '64% of FY allocation', c: 'fuchsia' },
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
                <h3 className="font-display font-bold text-ink">Campaign Performance · Institution vs Trade</h3>
                <p className="text-xs text-navy-500 mt-0.5">6-month trend · Index vs Jan baseline</p>
              </div>
              <span className="px-2 py-1 rounded-full bg-fuchsia-50 text-fuchsia-700 text-[10px] font-bold">LIVE</span>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border-2 border-fuchsia-200 bg-fuchsia-50/30">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[10px] font-bold text-fuchsia-700 tracking-wider uppercase">Institution Channel</p>
                    <p className="font-display text-lg font-bold text-ink mt-0.5">Lifting strongly</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-fuchsia-500 text-white text-[9px] font-bold">+48%</span>
                </div>
                <div className="flex items-end gap-1.5 h-20 mb-3">
                  {institutionMonths.map((v, i) => (
                    <div key={i} className="flex-1 rounded-t bg-fuchsia-500" style={{ height: `${v}%`, opacity: 0.55 + i * 0.075 }} />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-fuchsia-200">
                  <div>
                    <p className="text-[9px] text-navy-400 font-bold tracking-wider uppercase">Spend</p>
                    <p className="font-mono text-sm font-bold text-ink">₦28M</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-navy-400 font-bold tracking-wider uppercase">ROI</p>
                    <p className="font-mono text-sm font-bold text-leaf-700">4.4×</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border-2 border-navy-100 bg-paper">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[10px] font-bold text-amber-700 tracking-wider uppercase">Trade Channel</p>
                    <p className="font-display text-lg font-bold text-ink mt-0.5">Flat · needs lift</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold">+4%</span>
                </div>
                <div className="flex items-end gap-1.5 h-20 mb-3">
                  {tradeMonths.map((v, i) => (
                    <div key={i} className="flex-1 rounded-t bg-amber-400" style={{ height: `${v}%`, opacity: 0.55 + i * 0.05 }} />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-navy-100">
                  <div>
                    <p className="text-[9px] text-navy-400 font-bold tracking-wider uppercase">Spend</p>
                    <p className="font-mono text-sm font-bold text-ink">₦14M</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-navy-400 font-bold tracking-wider uppercase">ROI</p>
                    <p className="font-mono text-sm font-bold text-amber-700">2.1×</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="fade-up stagger-1 rounded-2xl bg-white border border-navy-100 p-5">
            <h3 className="font-display font-bold text-ink mb-4">Top Active Campaigns</h3>
            <div className="space-y-3">
              {[
                { n: 'Coflin Q3 National Push', ch: 'Institution', pct: 78, vol: '₦14M' },
                { n: 'Cestra Cardio Awareness', ch: 'Institution', pct: 62, vol: '₦9M' },
                { n: 'Tuxil-N OTC Trade Drive', ch: 'Trade', pct: 44, vol: '₦6M' },
                { n: 'Astrazon Pharmacy Refresh', ch: 'Trade', pct: 36, vol: '₦4M' },
              ].map(c => (
                <div key={c.n}>
                  <div className="flex items-baseline justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-medium text-navy-700 truncate">{c.n}</span>
                      <span className="text-[10px] text-navy-400">· {c.ch}</span>
                    </div>
                    <span className="font-mono text-xs"><span className="text-navy-500">{c.pct}%</span> · <span className="font-bold text-fuchsia-700">{c.vol}</span></span>
                  </div>
                  <div className="h-2 rounded-full bg-navy-100 overflow-hidden">
                    <div className={`h-full rounded-full ${c.ch === 'Institution' ? 'bg-fuchsia-500' : 'bg-amber-500'}`} style={{ width: `${c.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="fade-up stagger-2 rounded-2xl bg-white border border-navy-100 p-5">
            <h3 className="font-display font-bold text-ink text-sm mb-3">Strategic AI Insights</h3>
            <div className="space-y-3">
              {[
                { i: 'trending' as const, c: 'fuchsia', t: 'Product volume vs target', s: 'Coflin tracking +37% MoM · 8 pts ahead of FY26 plan' },
                { i: 'barChart' as const, c: 'leaf', t: 'Clinical meeting ROI', s: 'High-impact CMs delivering 5.2× revenue lift vs spend' },
                { i: 'flag' as const, c: 'amber', t: 'Competitor signals', s: 'GSK Augmentin promo + Pfizer detailing pressure on Astrazon' },
              ].map((insight, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-paper">
                  <Icon name={insight.i} size={14} className={`mt-0.5 flex-shrink-0 ${
                    insight.c === 'leaf' ? 'text-leaf-700' :
                    insight.c === 'amber' ? 'text-amber-700' : 'text-fuchsia-700'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-display font-semibold text-ink">{insight.t}</p>
                    <p className="text-[10px] text-navy-500 mt-0.5">{insight.s}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {pendingHighImpactCMs > 0 && (
            <div className="fade-up stagger-3 rounded-2xl bg-amber-50 border border-amber-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="clock" size={14} className="text-amber-700" />
                <p className="text-[10px] font-bold text-amber-700 tracking-wider uppercase">{pendingHighImpactCMs} CM Pending</p>
              </div>
              <p className="text-xs text-navy-700 leading-relaxed">High-impact clinical meeting requests escalated for your sign-off.</p>
              <button onClick={() => onNavigate('mm-cme')} className="mt-2 text-xs font-bold text-amber-700 flex items-center gap-1">
                Review queue <Icon name="arrowRight" size={12} />
              </button>
            </div>
          )}

          <div className="fade-up stagger-4 rounded-2xl bg-white border border-navy-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-ink text-sm">Auto-Generated Reports</h3>
              <span className="px-1.5 py-0.5 rounded bg-fuchsia-100 text-fuchsia-700 text-[9px] font-bold">LIVE</span>
            </div>
            <div className="space-y-2">
              {[
                { l: 'Weekly Marketing Pack', t: 'Auto-pushed Monday 8am' },
                { l: 'Campaign ROI · Q2', t: 'Updated daily' },
                { l: 'BMD Roll-up', t: '1st of each month' },
              ].map(r => (
                <div key={r.l} className="flex items-center gap-2 p-2 rounded-lg hover:bg-paper">
                  <Icon name="file" size={14} className="text-fuchsia-700" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-ink truncate">{r.l}</p>
                    <p className="text-[10px] text-navy-500">{r.t}</p>
                  </div>
                  <Icon name="download" size={12} className="text-navy-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
