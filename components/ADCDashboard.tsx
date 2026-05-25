import Icon from './Icon';

interface ADCDashboardProps {
  onNavigate: (view: string) => void;
}

export default function ADCDashboard({ onNavigate }: ADCDashboardProps) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="fade-up">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold tracking-wider uppercase">Associate Commercial Director</span>
              <span className="text-xs text-navy-500">Trade + Mobile & Frontline</span>
            </div>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-ink">
              Channels are live, <span style={{ background: 'linear-gradient(135deg, #142A5A 0%, #F43F5E 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Remi</span>
            </h2>
            <p className="text-sm text-navy-500 mt-1">Trade + Mobile &amp; Frontline · 80 reps · Reports to CD</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onNavigate('adc-directive')} className="px-3 py-2 rounded-lg bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 btn-press hover:bg-rose-600">
              <Icon name="send" size={14} /> Push Channel Directive
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { l: 'Trade Pipeline', v: '₦48M', d: '+14% MoM', c: 'rose' },
          { l: 'Mobile & Frontline Pipeline', v: '₦32M', d: '+9% MoM', c: 'rose' },
          { l: 'Combined Q2 Attainment', v: '84%', d: 'on track for FY26', c: 'leaf' },
          { l: 'Reps Active Today', v: '54/80', d: 'GPS-verified', c: 'rose' },
        ].map((k, i) => (
          <div key={i} className={`fade-up stagger-${i + 1} p-4 sm:p-5 rounded-2xl bg-white border border-navy-100`}>
            <p className="stat-label text-navy-400">{k.l}</p>
            <p className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">{k.v}</p>
            <p className={`text-[11px] font-semibold mt-1 ${k.c === 'leaf' ? 'text-leaf-700' : 'text-rose-700'}`}>{k.d}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="fade-up rounded-2xl bg-white border border-navy-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-display font-bold text-ink">Channel Comparison · Trade vs Mobile & Frontline</h3>
                <p className="text-xs text-navy-500 mt-0.5">Pipeline · Coverage · Velocity</p>
              </div>
              <span className="px-2 py-1 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold">ADC SCOPE</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-navy-100">
              {[
                { ch: 'Trade', nsm: 'Musa Lawal (NSM-T)', reps: 38, pipeline: '₦48M', attain: 86, vel: '+14%', color: 'amber' },
                { ch: 'Mobile & Frontline', nsm: 'Bayo Ogunlana (NSM-MF)', reps: 42, pipeline: '₦32M', attain: 82, vel: '+9%', color: 'indigo' },
              ].map((d, i) => (
                <div key={i} className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-display font-bold text-xs ${
                      d.color === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {d.ch.split(' ').slice(0, 2).map(p => p[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <p className="font-display font-bold text-sm text-ink">{d.ch}</p>
                      <p className="text-[11px] text-navy-500">{d.nsm}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="stat-label text-navy-400">Pipeline</p>
                      <p className="font-display text-xl font-bold text-ink">{d.pipeline}</p>
                    </div>
                    <div>
                      <p className="stat-label text-navy-400">Attainment</p>
                      <p className="font-display text-xl font-bold text-ink">{d.attain}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-2 rounded-full bg-navy-100 overflow-hidden">
                      <div className={`h-full rounded-full ${d.color === 'amber' ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${d.attain}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-navy-500">{d.reps} reps</span>
                    <span className={`text-[11px] font-bold ${d.vel.startsWith('+') ? 'text-leaf-700' : 'text-rose-600'}`}>{d.vel} velocity</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="fade-up stagger-1 rounded-2xl bg-white border border-navy-100 p-5">
            <h3 className="font-display font-bold text-ink mb-4">Combined Pipeline by Region</h3>
            <div className="space-y-3">
              {[
                { r: 'South-West', pct: 88, vol: '₦22M' },
                { r: 'South-South', pct: 78, vol: '₦14M' },
                { r: 'North-Central', pct: 74, vol: '₦16M' },
                { r: 'South-East', pct: 62, vol: '₦11M' },
                { r: 'North-West', pct: 58, vol: '₦10M' },
                { r: 'North-East', pct: 44, vol: '₦7M' },
              ].map(t => (
                <div key={t.r}>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xs font-medium text-navy-700">{t.r}</span>
                    <span className="font-mono text-xs"><span className="text-navy-500">{t.pct}%</span> · <span className="font-bold text-rose-700">{t.vol}</span></span>
                  </div>
                  <div className="h-2 rounded-full bg-navy-100 overflow-hidden">
                    <div className="h-full rounded-full bg-rose-500" style={{ width: `${t.pct}%` }} />
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
                { i: 'trending' as const, c: 'leaf', t: 'Trade pipeline accelerating in NC', s: 'North-Central up 28% MoM · Abuja distributors lifting' },
                { i: 'alert' as const, c: 'amber', t: 'Frontline coverage gap in SE', s: '4 of 12 LGAs untouched · Reassign 2 mobile reps' },
                { i: 'flag' as const, c: 'rose', t: 'ADC escalation', s: '2 distributors in critical stock · risk of weekend stockout' },
              ].map((insight, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-paper">
                  <Icon name={insight.i} size={14} className={`mt-0.5 flex-shrink-0 ${
                    insight.c === 'leaf' ? 'text-leaf-700' :
                    insight.c === 'amber' ? 'text-amber-700' : 'text-rose-700'
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
              <h3 className="font-display font-bold text-ink text-sm">Direct Reports</h3>
              <p className="text-[11px] text-navy-500 mt-0.5">2 NSMs · 80 field reps</p>
            </div>
            <div className="divide-y divide-navy-50">
              {[
                { n: 'Musa Lawal', r: 'NSM Trade', team: '6 FSMs · 38 reps', accent: 'amber' },
                { n: 'Bayo Ogunlana', r: 'NSM Mobile & Frontline', team: '4 ASMs · 42 reps', accent: 'indigo' },
              ].map((dr, i) => (
                <div key={i} className="px-4 py-3 flex items-center gap-3 hover:bg-paper">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-xs flex-shrink-0 ${
                    dr.accent === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
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

          <div className="fade-up stagger-4 rounded-2xl bg-white border border-navy-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-ink text-sm">Auto-Generated Reports</h3>
              <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[9px] font-bold">LIVE</span>
            </div>
            <div className="space-y-2">
              {[
                { l: 'Combined Channel Daily', t: 'Auto-pushed 8am' },
                { l: 'Distributor Health Weekly', t: 'Every Monday' },
                { l: 'CD Roll-up Pack', t: '1st of each month' },
              ].map(r => (
                <div key={r.l} className="flex items-center gap-2 p-2 rounded-lg hover:bg-paper">
                  <Icon name="file" size={14} className="text-rose-700" />
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
