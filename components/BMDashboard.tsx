import Icon from './Icon';
import ProductLens from './ProductLens';

interface BMDashboardProps {
  onNavigate: (view: string) => void;
}

export default function BMDashboard({ onNavigate }: BMDashboardProps) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="fade-up">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold tracking-wider uppercase">Brand Manager</span>
              <span className="text-xs text-navy-500">Cestra · Provision · Cardio</span>
            </div>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-ink">
              Cestra is heating up, <span style={{ background: 'linear-gradient(135deg, #142A5A 0%, #10B981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Chioma</span>
            </h2>
            <p className="text-sm text-navy-500 mt-1">Cestra Brand Portfolio · Provision · Cardio · You report to BMD</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onNavigate('bm-directive')} className="px-3 py-2 rounded-lg bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 btn-press hover:bg-emerald-600">
              <Icon name="send" size={14} /> Push Brand Directive
            </button>
          </div>
        </div>
      </div>

      <div className="fade-up">
        <ProductLens scope="Cestra Portfolio · Nationwide" accent="emerald" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { l: 'Brand Revenue Q2', v: '₦14.2M', d: '+19% QoQ', c: 'emerald' },
          { l: 'Brand Adoption', v: '52%', d: 'of detailing rep base', c: 'emerald' },
          { l: 'Active Campaigns', v: '3', d: '1 nationwide · 2 regional', c: 'emerald' },
          { l: 'Reps Engaged', v: '47/89', d: '53% touching portfolio', c: 'emerald' },
        ].map((k, i) => (
          <div key={i} className={`fade-up stagger-${i + 1} p-4 sm:p-5 rounded-2xl bg-white border border-navy-100`}>
            <p className="stat-label text-navy-400">{k.l}</p>
            <p className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">{k.v}</p>
            <p className="text-[11px] font-semibold mt-1 text-emerald-700">{k.d}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="fade-up rounded-2xl bg-white border border-navy-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-navy-100">
              <h3 className="font-display font-bold text-ink">Cestra Portfolio Health</h3>
              <p className="text-xs text-navy-500 mt-0.5">3 SKUs · Volume · MoM growth · Rep mentions</p>
            </div>
            <div className="divide-y divide-navy-50">
              {[
                { n: 'Cestra-A 50mg', cat: 'Cardio · RX', vol: '₦6.8M', g: 24, mentions: 184, star: true },
                { n: 'Cestra-B 100mg', cat: 'Cardio · RX', vol: '₦3.4M', g: -8, mentions: 92, star: false },
                { n: 'Provision-X 250mg', cat: 'Cardio · OTC', vol: '₦4.0M', g: 32, mentions: 142, star: true },
              ].map((p, i) => (
                <div key={i} className="px-5 py-4 hover:bg-paper transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${p.star ? 'bg-emerald-500' : 'bg-navy-200'}`}>
                      <Icon name="pill" size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-display font-bold text-sm text-ink">{p.n}</p>
                        {p.star && <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[9px] font-bold">STAR</span>}
                      </div>
                      <p className="text-[11px] text-navy-500">{p.cat}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-[9px] text-navy-400 font-bold tracking-wider uppercase">Volume</p>
                      <p className="font-mono text-sm font-bold text-ink">{p.vol}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-navy-400 font-bold tracking-wider uppercase">MoM</p>
                      <p className={`font-mono text-sm font-bold ${p.g > 0 ? 'text-leaf-700' : 'text-rose-600'}`}>{p.g > 0 ? '+' : ''}{p.g}%</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-navy-400 font-bold tracking-wider uppercase">Mentions</p>
                      <p className="font-mono text-sm font-bold text-ink">{p.mentions}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="fade-up stagger-1 rounded-2xl bg-white border border-navy-100 p-5">
            <h3 className="font-display font-bold text-ink mb-4">Regional Adoption · Cestra Portfolio</h3>
            <div className="space-y-3">
              {[
                { r: 'Lagos', pct: 78, vol: '₦4.2M' },
                { r: 'South-West', pct: 64, vol: '₦2.8M' },
                { r: 'South-East', pct: 52, vol: '₦2.1M' },
                { r: 'North-Central', pct: 48, vol: '₦2.4M' },
                { r: 'South-South', pct: 38, vol: '₦1.6M' },
                { r: 'North-West', pct: 28, vol: '₦1.1M' },
              ].map(t => (
                <div key={t.r}>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xs font-medium text-navy-700">{t.r}</span>
                    <span className="font-mono text-xs"><span className="text-navy-500">{t.pct}%</span> · <span className="font-bold text-emerald-700">{t.vol}</span></span>
                  </div>
                  <div className="h-2 rounded-full bg-navy-100 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${t.pct}%` }} />
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
                { i: 'alert' as const, c: 'amber', t: 'Cestra-B underperforming SE', s: 'Volume −8% MoM in South-East · low coverage by 4 reps' },
                { i: 'trending' as const, c: 'leaf', t: 'Provision adoption ramping', s: 'Cardio reps lifting Provision-X +32% via co-detailing' },
                { i: 'flag' as const, c: 'amber', t: 'Competitor counter-promo', s: 'GSK detected discounting on Cestra-A in 3 SW clusters' },
              ].map((insight, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-paper">
                  <Icon name={insight.i} size={14} className={`mt-0.5 flex-shrink-0 ${
                    insight.c === 'leaf' ? 'text-leaf-700' :
                    insight.c === 'amber' ? 'text-amber-700' : 'text-emerald-700'
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
              <h3 className="font-display font-bold text-ink text-sm">Top Reps for Portfolio</h3>
              <p className="text-[11px] text-navy-500 mt-0.5">Cestra + Provision · Last 30 days</p>
            </div>
            <div className="divide-y divide-navy-50">
              {[
                { n: 'Adaeze Okafor', terr: 'Lagos · Institution', vol: '₦1.8M', mentions: 42 },
                { n: 'Tope Adeola', terr: 'Lekki · Institution', vol: '₦1.4M', mentions: 36 },
                { n: 'Chinedu Eze', terr: 'Ikeja · Mixed', vol: '₦1.1M', mentions: 28 },
                { n: 'Kola Adebayo', terr: 'Apapa · Trade', vol: '₦0.9M', mentions: 22 },
              ].map((r, i) => (
                <div key={i} className="px-4 py-2.5 flex items-center gap-3 hover:bg-paper">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center font-display font-bold text-[10px] text-emerald-700 flex-shrink-0">
                    {r.n.split(' ').map(p => p[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-xs text-ink truncate">{r.n}</p>
                    <p className="text-[10px] text-navy-500 truncate">{r.terr}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs font-bold text-emerald-700">{r.vol}</p>
                    <p className="text-[9px] text-navy-400">{r.mentions} mentions</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="fade-up stagger-4 rounded-2xl bg-white border border-navy-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-ink text-sm">Auto-Generated Reports</h3>
              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[9px] font-bold">LIVE</span>
            </div>
            <div className="space-y-2">
              {[
                { l: 'Cestra Weekly Pack', t: 'Auto-pushed Monday 8am' },
                { l: 'Brand ROI Snapshot', t: 'Updated daily' },
                { l: 'BMD Roll-up Input', t: '1st of each month' },
              ].map(r => (
                <div key={r.l} className="flex items-center gap-2 p-2 rounded-lg hover:bg-paper">
                  <Icon name="file" size={14} className="text-emerald-700" />
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
