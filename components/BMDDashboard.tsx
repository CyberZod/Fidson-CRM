import Icon from './Icon';

interface BMDDashboardProps {
  onNavigate: (view: string) => void;
}

export default function BMDDashboard({ onNavigate }: BMDDashboardProps) {
  const brands = [
    { n: 'Cestra Portfolio', owner: 'Chioma Eze (BM)', rev: '₦14.2M', mom: 19, status: 'on-track' as const },
    { n: 'Respiratory (Coflin / Tuxil-N)', owner: 'Dr. Femi Akande (PM)', rev: '₦11.6M', mom: 37, status: 'outperforming' as const },
    { n: 'Astrazon / Antihistamine', owner: 'Dr. Ngozi Eze (PM)', rev: '₦5.1M', mom: -4, status: 'at-risk' as const },
    { n: 'Diabetes Line', owner: 'Vacant · TBD', rev: '₦3.2M', mom: -12, status: 'under-indexed' as const },
    { n: 'Pain Management', owner: 'Tunde Ola (PM)', rev: '₦8.4M', mom: 6, status: 'on-track' as const },
    { n: 'Vitamins & Wellness', owner: 'Bisi Adeleke (PM)', rev: '₦4.8M', mom: 11, status: 'on-track' as const },
  ];

  const statusBadge = (s: typeof brands[number]['status']) => {
    switch (s) {
      case 'outperforming': return { bg: 'bg-leaf-100', text: 'text-leaf-700', l: 'Outperforming' };
      case 'on-track': return { bg: 'bg-teal-100', text: 'text-teal-700', l: 'On track' };
      case 'at-risk': return { bg: 'bg-amber-100', text: 'text-amber-700', l: 'At risk' };
      case 'under-indexed': return { bg: 'bg-rose-100', text: 'text-rose-700', l: 'Under-indexed' };
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="fade-up">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-bold tracking-wider uppercase">Brand Management Director</span>
              <span className="text-xs text-navy-500">Top of marketing line</span>
            </div>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-ink">
              Marketing roll-up, <span style={{ background: 'linear-gradient(135deg, #142A5A 0%, #14B8A6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Olu</span>
            </h2>
            <p className="text-sm text-navy-500 mt-1">All marketing tracks · Institution + Trade · Top of marketing line</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onNavigate('bmd-directive')} className="px-3 py-2 rounded-lg bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 btn-press hover:bg-teal-600">
              <Icon name="send" size={14} /> Push National Directive
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { l: 'Marketing P&L YTD', v: '₦128M', d: '+22% YoY', c: 'teal' },
          { l: 'Active Brands', v: '8', d: 'across 4 categories', c: 'teal' },
          { l: 'National Pipeline Impact', v: '₦42M', d: 'marketing-attributed', c: 'leaf' },
          { l: 'HoM / MM Direct Reports', v: '5', d: 'HoM I + HoM T + 3 MMs', c: 'teal' },
        ].map((k, i) => (
          <div key={i} className={`fade-up stagger-${i + 1} p-4 sm:p-5 rounded-2xl bg-white border border-navy-100`}>
            <p className="stat-label text-navy-400">{k.l}</p>
            <p className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">{k.v}</p>
            <p className={`text-[11px] font-semibold mt-1 ${k.c === 'leaf' ? 'text-leaf-700' : 'text-teal-700'}`}>{k.d}</p>
          </div>
        ))}
      </div>

      <div className="fade-up relative p-6 sm:p-8 rounded-2xl overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, #134E4A 0%, #115E59 50%, #14B8A6 100%)' }}>
        <div className="absolute inset-0 ai-shimmer" />
        <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(94, 234, 212, 0.25) 0%, transparent 70%)' }} />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="w-10 h-10 rounded-xl bg-teal-400 flex items-center justify-center">
              <Icon name="sparkles" size={20} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-teal-200 tracking-[0.2em] uppercase">Brand AI Forecast</p>
              <p className="text-white text-sm font-display font-semibold">Cross-portfolio outlook · 86% confidence</p>
            </div>
            <span className="ml-auto px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-bold border border-white/20">EXECUTIVE TIER</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight">
            Marketing on pace for <span className="text-teal-200">+24% YoY</span> brand growth
          </h2>
          <p className="text-sm text-teal-100 mt-2 max-w-2xl">
            Cestra portfolio outperforming forecast by 8 pts. Diabetes line needs a PM hire to unlock ₦18M of trapped demand.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="fade-up rounded-2xl bg-white border border-navy-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-display font-bold text-ink">All Brands Roll-up</h3>
                <p className="text-xs text-navy-500 mt-0.5">8 brands · Owner · Revenue · MoM</p>
              </div>
              <span className="px-2 py-1 rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold">BMD SCOPE</span>
            </div>
            <div className="divide-y divide-navy-50">
              {brands.map((b, i) => {
                const bd = statusBadge(b.status);
                return (
                  <div key={i} className="px-5 py-3 flex items-center gap-3 hover:bg-paper transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <Icon name="pill" size={16} className="text-teal-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-sm text-ink truncate">{b.n}</p>
                      <p className="text-[11px] text-navy-500 truncate">{b.owner}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-bold text-ink">{b.rev}</p>
                      <p className={`font-mono text-[11px] font-bold ${b.mom > 0 ? 'text-leaf-700' : 'text-rose-600'}`}>{b.mom > 0 ? '+' : ''}{b.mom}%</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full ${bd.bg} ${bd.text} text-[10px] font-bold flex-shrink-0`}>{bd.l}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="fade-up stagger-1 rounded-2xl bg-white border border-navy-100 p-5">
            <h3 className="font-display font-bold text-ink mb-4">Channel Split · Marketing Spend</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { ch: 'Institution', val: '₦82M', pct: 64, color: 'fuchsia' },
                { ch: 'Trade', val: '₦46M', pct: 36, color: 'amber' },
              ].map(c => (
                <div key={c.ch} className="p-4 rounded-xl border border-navy-100 bg-paper">
                  <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">{c.ch}</p>
                  <p className="font-display text-2xl font-bold text-ink mt-1">{c.val}</p>
                  <p className="text-[11px] text-navy-500 mt-0.5">{c.pct}% of YTD spend</p>
                  <div className="mt-3 h-2 rounded-full bg-navy-100 overflow-hidden">
                    <div className={`h-full rounded-full ${c.color === 'fuchsia' ? 'bg-fuchsia-500' : 'bg-amber-500'}`} style={{ width: `${c.pct}%` }} />
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
                { i: 'trending' as const, c: 'leaf', t: 'Cestra portfolio outperforming forecast', s: '+8 pts ahead of FY26 plan · driven by Provision uptake' },
                { i: 'alert' as const, c: 'amber', t: 'Diabetes line under-indexed', s: 'No active PM · ₦18M of trapped demand · hiring priority' },
                { i: 'target' as const, c: 'teal', t: 'Q3 launch readiness 78%', s: '2 of 3 launch decks signed off · clinical brief pending' },
              ].map((insight, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-paper">
                  <Icon name={insight.i} size={14} className={`mt-0.5 flex-shrink-0 ${
                    insight.c === 'leaf' ? 'text-leaf-700' :
                    insight.c === 'amber' ? 'text-amber-700' : 'text-teal-700'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-display font-semibold text-ink">{insight.t}</p>
                    <p className="text-[10px] text-navy-500 mt-0.5">{insight.s}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="fade-up stagger-3 rounded-2xl bg-white border border-navy-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-navy-100">
              <h3 className="font-display font-bold text-ink text-sm">Reports to BMD</h3>
              <p className="text-[11px] text-navy-500 mt-0.5">Marketing direct line</p>
            </div>
            <div className="divide-y divide-navy-50">
              {[
                { n: 'Ade Olawale', r: 'HoM Institution', team: '3 MMs · 8 PMs', accent: 'fuchsia' },
                { n: 'Bisi Adeyemi', r: 'HoM Trade', team: '2 MMs · 4 BMs', accent: 'amber' },
                { n: 'Layi Bankole', r: 'Consumer Marketing', team: '6 marketers', accent: 'teal' },
              ].map((dr, i) => (
                <div key={i} className="px-4 py-2.5 flex items-center gap-3 hover:bg-paper">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-display font-bold text-[11px] flex-shrink-0 ${
                    dr.accent === 'fuchsia' ? 'bg-fuchsia-100 text-fuchsia-700' :
                    dr.accent === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700'
                  }`}>
                    {dr.n.split(' ').map(p => p[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-xs text-ink truncate">{dr.n}</p>
                    <p className="text-[10px] text-navy-500 truncate">{dr.r} · {dr.team}</p>
                  </div>
                  <Icon name="chevronRight" size={12} className="text-navy-300" />
                </div>
              ))}
            </div>
          </div>

          <div className="fade-up stagger-4 rounded-2xl bg-white border border-navy-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-ink text-sm">Auto-Generated Reports</h3>
              <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-700 text-[9px] font-bold">LIVE</span>
            </div>
            <div className="space-y-2">
              {[
                { l: 'Marketing P&L · Monthly', t: '1st of each month' },
                { l: 'Brand-by-Brand Tracker', t: 'Updated weekly' },
                { l: 'Board Marketing Pack', t: 'Quarterly · Q2 ready' },
              ].map(r => (
                <div key={r.l} className="flex items-center gap-2 p-2 rounded-lg hover:bg-paper">
                  <Icon name="file" size={14} className="text-teal-700" />
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
