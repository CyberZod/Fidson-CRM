import Icon from './Icon';
import ProductLens from './ProductLens';
import type { ApprovalModalItem, SubmittedDCR, ClinicalMeetingRow } from '../types';

interface CDDashboardProps {
  onNavigate: (view: string) => void;
  approvals?: ApprovalModalItem[];
  dcrs?: SubmittedDCR[];
  clinicalMeetings?: ClinicalMeetingRow[];
}

export default function CDDashboard({ onNavigate, approvals = [], dcrs = [], clinicalMeetings = [] }: CDDashboardProps) {
  const nsmEscalations = approvals.filter(a => a.escalatedToNSM);
  const cmRequests = clinicalMeetings.filter(c => c.s === 'pm-review' || c.s === 'hom-review').length;
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="fade-up">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold tracking-wider uppercase">Commercial Director</span>
              <span className="text-xs text-navy-500">National · ₦2.4TN FY26 target</span>
            </div>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-ink">
              National command, <span style={{ background: 'linear-gradient(135deg, #142A5A 0%, #6366F1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Tunji</span>
            </h2>
            <p className="text-sm text-navy-500 mt-1">All channels · 142 reps national · ₦2.4TN FY26 target</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onNavigate('cd-directive')} className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold flex items-center gap-1.5 btn-press hover:bg-indigo-700">
              <Icon name="send" size={14} /> Push National Directive
            </button>
          </div>
        </div>
      </div>

      <div className="fade-up rounded-2xl bg-white border border-navy-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-navy-100 flex items-center gap-2 flex-wrap">
          <div className="w-1.5 h-1.5 rounded-full bg-leaf-500 pulse-dot" />
          <h3 className="font-display font-bold text-ink">Live from the field · All channels</h3>
          <span className="text-[11px] text-navy-500">Every region rolling up to your desk</span>
          {nsmEscalations.length > 0 && (
            <span className="ml-auto px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">{nsmEscalations.length} escalated nationally</span>
          )}
        </div>
        <div className="grid grid-cols-3 divide-x divide-navy-100">
          {[
            { l: 'Field Approvals', v: approvals.length, sub: 'pending across regions' },
            { l: 'DCRs Submitted', v: dcrs.length, sub: 'today' },
            { l: 'Clinical Meetings', v: cmRequests, sub: 'awaiting review' },
          ].map(s => (
            <div key={s.l} className="px-5 py-4">
              <p className="stat-label text-navy-400">{s.l}</p>
              <p className="font-display text-2xl font-bold text-ink mt-0.5">{s.v}</p>
              <p className="text-[10px] text-navy-500">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="fade-up">
        <ProductLens scope="Nationwide · All Channels" accent="navy" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { l: 'National Pipeline', v: '₦128M', d: '+22% YoY', c: 'indigo' },
          { l: 'FY26 Progress', v: '38%', d: 'of ₦2.4TN target', c: 'indigo' },
          { l: 'National Attainment', v: '88%', d: 'on plan for FY26', c: 'leaf' },
          { l: 'Reps Live Now', v: '84/142', d: 'GPS-verified', c: 'indigo' },
        ].map((k, i) => (
          <div key={i} className={`fade-up stagger-${i + 1} p-4 sm:p-5 rounded-2xl bg-white border border-navy-100`}>
            <p className="stat-label text-navy-400">{k.l}</p>
            <p className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">{k.v}</p>
            <p className={`text-[11px] font-semibold mt-1 ${k.c === 'leaf' ? 'text-leaf-700' : 'text-indigo-700'}`}>{k.d}</p>
          </div>
        ))}
      </div>

      <div className="fade-up relative p-6 sm:p-8 rounded-2xl overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4F46E5 100%)' }}>
        <div className="absolute inset-0 ai-shimmer" />
        <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(165, 180, 252, 0.25) 0%, transparent 70%)' }} />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="w-10 h-10 rounded-xl bg-indigo-400 flex items-center justify-center">
              <Icon name="sparkles" size={20} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-indigo-200 tracking-[0.2em] uppercase">National AI Forecast Engine</p>
              <p className="text-white text-sm font-display font-semibold">FY26 outlook · 92% confidence</p>
            </div>
            <span className="ml-auto px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-bold border border-white/20">EXECUTIVE TIER</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight">
            On pace for <span className="text-indigo-300">92%</span> of ₦2.4TN FY26 target
          </h2>
          <p className="text-sm text-indigo-100 mt-2 max-w-2xl">
            All three channels tracking on plan. Institution leads with +24% YoY. Recommend reallocating 6 reps from NW to NC to close the gap.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="fade-up rounded-2xl bg-white border border-navy-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-display font-bold text-ink">National Roll-up · All Channels</h3>
                <p className="text-xs text-navy-500 mt-0.5">Pipeline · Attainment · Active reps</p>
              </div>
              <span className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold">CD SCOPE</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-navy-100">
              {[
                { ch: 'Institution', nsm: 'Segun Adebanjo (NSM-I)', reps: 62, pipeline: '₦62M', attain: 92, color: 'indigo' },
                { ch: 'Trade', nsm: 'Musa Lawal (NSM-T)', reps: 38, pipeline: '₦48M', attain: 86, color: 'amber' },
                { ch: 'Mobile & Frontline', nsm: 'Bayo Ogunlana (NSM-MF)', reps: 42, pipeline: '₦18M', attain: 82, color: 'rose' },
              ].map((d, i) => (
                <div key={i} className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-display font-bold text-[11px] ${
                      d.color === 'indigo' ? 'bg-indigo-100 text-indigo-700' :
                      d.color === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {d.ch.split(' ').slice(0, 2).map(p => p[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-sm text-ink truncate">{d.ch}</p>
                      <p className="text-[10px] text-navy-500 truncate">{d.nsm}</p>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <div>
                      <p className="stat-label text-navy-400">Pipeline</p>
                      <p className="font-display text-xl font-bold text-ink">{d.pipeline}</p>
                    </div>
                    <div>
                      <p className="stat-label text-navy-400">Attainment</p>
                      <div className="flex items-center gap-2">
                        <p className="font-display text-xl font-bold text-ink">{d.attain}%</p>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-navy-100 overflow-hidden">
                        <div className={`h-full rounded-full ${
                          d.color === 'indigo' ? 'bg-indigo-500' :
                          d.color === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
                        }`} style={{ width: `${d.attain}%` }} />
                      </div>
                    </div>
                    <div className="pt-2 border-t border-navy-100 flex items-center justify-between">
                      <span className="text-[11px] text-navy-500">{d.reps} reps</span>
                      <span className="text-[10px] font-bold text-navy-400">CHANNEL</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="fade-up stagger-1 rounded-2xl bg-white border border-navy-100 p-5">
            <h3 className="font-display font-bold text-ink mb-4">National Pipeline by Region</h3>
            <div className="space-y-3">
              {[
                { r: 'South-West', pct: 92, vol: '₦32M' },
                { r: 'North-Central', pct: 84, vol: '₦24M' },
                { r: 'South-South', pct: 80, vol: '₦20M' },
                { r: 'South-East', pct: 76, vol: '₦18M' },
                { r: 'North-West', pct: 62, vol: '₦18M' },
                { r: 'North-East', pct: 48, vol: '₦16M' },
              ].map(t => (
                <div key={t.r}>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xs font-medium text-navy-700">{t.r}</span>
                    <span className="font-mono text-xs"><span className="text-navy-500">{t.pct}%</span> · <span className="font-bold text-indigo-700">{t.vol}</span></span>
                  </div>
                  <div className="h-2 rounded-full bg-navy-100 overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${t.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="fade-up stagger-2 relative p-5 rounded-2xl overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #4F46E5 100%)' }}>
            <div className="absolute inset-0 ai-shimmer" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-sm">
                  <Icon name="target" size={16} className="text-white" />
                </div>
                <p className="text-[10px] font-bold text-indigo-200 tracking-[0.2em] uppercase">₦2.4TN Tracker</p>
              </div>
              <h3 className="font-display text-xl font-bold leading-tight">38% delivered</h3>
              <p className="text-sm text-indigo-100 mt-1">₦910BN of ₦2.4TN FY26 commitment</p>
              <div className="mt-3 h-2.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-indigo-300" style={{ width: '38%' }} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-white/10 border border-white/10">
                  <p className="text-[9px] text-indigo-200 font-bold tracking-wider uppercase">Q3 Target</p>
                  <p className="font-display text-sm font-bold text-white">₦650BN</p>
                </div>
                <div className="p-2 rounded-lg bg-white/10 border border-white/10">
                  <p className="text-[9px] text-indigo-200 font-bold tracking-wider uppercase">Run-rate</p>
                  <p className="font-display text-sm font-bold text-white">+18% MoM</p>
                </div>
              </div>
            </div>
          </div>

          <div className="fade-up stagger-3 rounded-2xl bg-white border border-navy-100 p-5">
            <h3 className="font-display font-bold text-ink text-sm mb-3">Strategic AI Insights</h3>
            <div className="space-y-3">
              {[
                { i: 'trending' as const, c: 'leaf', t: 'National AI forecast: 92% of FY26 target', s: 'Trajectory consistent · 8 pts upside if NC closes gap' },
                { i: 'barChart' as const, c: 'indigo', t: 'Division benchmarking', s: 'South leads · +15 pts vs North on Q2 attainment' },
                { i: 'pill' as const, c: 'indigo', t: 'Product trend', s: 'Coflin +37% MoM nationwide · launch readiness 78%' },
              ].map((insight, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-paper">
                  <Icon name={insight.i} size={14} className={`mt-0.5 flex-shrink-0 ${
                    insight.c === 'leaf' ? 'text-leaf-700' : 'text-indigo-700'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-display font-semibold text-ink">{insight.t}</p>
                    <p className="text-[10px] text-navy-500 mt-0.5">{insight.s}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="fade-up stagger-4 rounded-2xl bg-white border border-navy-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-navy-100">
              <h3 className="font-display font-bold text-ink text-sm">Direct Reports</h3>
              <p className="text-[11px] text-navy-500 mt-0.5">National commercial line</p>
            </div>
            <div className="divide-y divide-navy-50">
              {[
                { n: 'Segun Adebanjo', r: 'NSM Institution', team: '2 DMs · 6 RSMs · 62 reps', accent: 'indigo' },
                { n: 'Remi Adeoye', r: 'ADC', team: 'NSM Trade + NSM M&F · 80 reps', accent: 'rose' },
              ].map((dr, i) => (
                <div key={i} className="px-4 py-3 flex items-center gap-3 hover:bg-paper">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-xs flex-shrink-0 ${
                    dr.accent === 'indigo' ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {dr.n.split(' ').map(p => p[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-sm text-ink truncate">{dr.n}</p>
                    <p className="text-[10px] text-navy-500 truncate">{dr.r} · {dr.team}</p>
                  </div>
                  <Icon name="chevronRight" size={12} className="text-navy-300" />
                </div>
              ))}
            </div>
          </div>

          <div className="fade-up stagger-5 rounded-2xl bg-white border border-navy-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-ink text-sm">Auto-Generated Reports</h3>
              <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[9px] font-bold">LIVE</span>
            </div>
            <div className="space-y-2">
              {[
                { l: 'National Daily Performance', t: 'Auto-pushed 8am' },
                { l: '₦2.4TN Tracker · Weekly', t: 'Every Monday' },
                { l: 'Board Commercial Pack', t: 'Quarterly · Q2 ready' },
              ].map(r => (
                <div key={r.l} className="flex items-center gap-2 p-2 rounded-lg hover:bg-paper">
                  <Icon name="file" size={14} className="text-indigo-700" />
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
