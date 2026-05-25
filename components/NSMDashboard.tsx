import Icon from './Icon';
import NigeriaMap from './NigeriaMap';
import type { IconName, RegionData } from '../types';

interface NSMDashboardProps {
  onNavigate: (view: string) => void;
}

interface InsightRow {
  i: IconName;
  c: 'leaf' | 'amber' | 'indigo';
  t: string;
  s: string;
}

export default function NSMDashboard({ onNavigate }: NSMDashboardProps) {
  const allRegions: RegionData[] = [
    { code: 'NW', intensity: 0.62, label: '62%' },
    { code: 'NE', intensity: 0.48, label: '48%' },
    { code: 'NC', intensity: 0.76, label: '76%' },
    { code: 'SW', intensity: 0.92, label: '92%' },
    { code: 'SE', intensity: 0.78, label: '78%' },
    { code: 'SS', intensity: 0.84, label: '84%' },
  ];

  const insights: InsightRow[] = [
    { i: 'trending', c: 'leaf', t: 'South Division pulling ahead', s: 'Outperforming North by 15 pts on Q2 attainment' },
    { i: 'alert', c: 'amber', t: 'NE region stalling', s: 'No regional growth in 60 days · Recommend leadership review' },
    { i: 'target', c: 'indigo', t: 'Abuja FCT opportunity', s: '₦24M untapped institutional pipeline detected' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="fade-up">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold tracking-wider uppercase">National Sales Manager</span>
              <span className="text-xs text-navy-500">Fidson Healthcare · Nigeria-wide</span>
            </div>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-ink">
              National view, <span style={{ background: 'linear-gradient(135deg, #142A5A 0%, #6366F1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Bayo</span>
            </h2>
            <p className="text-sm text-navy-500 mt-1">2 Divisions · 6 Regions · 142 reps · 18 distributors · You report to CD Dimkpa</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onNavigate('nsm-forecast')} className="px-3 py-2 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 btn-press hover:bg-indigo-100">
              <Icon name="trending" size={14} /> AI Forecast
            </button>
            <button onClick={() => onNavigate('nsm-directive')} className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold flex items-center gap-1.5 btn-press hover:bg-indigo-700">
              <Icon name="send" size={14} /> Push National Directive
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { l: 'National Pipeline', v: '₦248M', d: '+22% YoY', c: 'indigo' },
          { l: 'National Coverage', v: '73%', d: 'across all 6 regions', c: 'indigo' },
          { l: 'Q2 Attainment', v: '81%', d: 'on track for FY26', c: 'leaf' },
          { l: 'High-Potential Markets', v: '7', d: 'AI-identified', c: 'indigo' },
        ].map((k, i) => (
          <div key={i} className={`fade-up stagger-${i + 1} p-4 sm:p-5 rounded-2xl bg-white border border-navy-100`}>
            <p className="stat-label text-navy-400">{k.l}</p>
            <p className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">{k.v}</p>
            <p className={`text-[11px] font-semibold mt-1 ${k.c === 'indigo' ? 'text-indigo-700' : 'text-leaf-700'}`}>{k.d}</p>
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
              <p className="text-white text-sm font-display font-semibold">12-month outlook · 91% confidence</p>
            </div>
            <span className="ml-auto px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-bold border border-white/20">EXECUTIVE TIER</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight">
            Nigeria on pace for <span className="text-indigo-300">₦1.18B</span> FY26 revenue
          </h2>
          <p className="text-sm text-indigo-100 mt-2 max-w-2xl">
            +18% YoY growth driven by Coflin Forte uptake in South and emerging North-Central institutional accounts. Recommend doubling Abuja rep allocation.
          </p>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { l: 'FY26 Forecast', v: '₦1.18B', sub: '+18% YoY' },
              { l: 'South Division', v: '₦780M', sub: '66% of total' },
              { l: 'North Division', v: '₦400M', sub: '34% · growing fast' },
              { l: 'Confidence', v: '91%', sub: 'High' },
            ].map(s => (
              <div key={s.l} className="p-3 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm">
                <p className="text-[9px] text-indigo-200 font-bold tracking-wider uppercase">{s.l}</p>
                <p className="font-display text-lg font-bold text-white mt-0.5">{s.v}</p>
                <p className="text-[10px] text-indigo-200">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="fade-up rounded-2xl bg-white border border-navy-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-display font-bold text-ink">Nigeria · National Heatmap</h3>
                <p className="text-xs text-navy-500 mt-0.5">All 6 regions · Q2 attainment intensity</p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="flex items-center gap-1 text-[10px] text-navy-500"><div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(244, 63, 94, 0.6)' }} />South</span>
                <span className="flex items-center gap-1 text-[10px] text-navy-500"><div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(99, 102, 241, 0.6)' }} />North</span>
              </div>
            </div>
            <div className="p-4 bg-paper">
              <NigeriaMap regions={allRegions} division="all" height={360} onRegionClick={() => {}} />
            </div>
          </div>

          <div className="fade-up stagger-1 rounded-2xl bg-white border border-navy-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-navy-100">
              <h3 className="font-display font-bold text-ink">Division Compare</h3>
              <p className="text-xs text-navy-500 mt-0.5">South vs North · Live performance</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-navy-100">
              {[
                { name: 'South Division', dm: 'Kemi Adeyemi', regions: 'SW, SE, SS', reps: 67, pipeline: '₦128M', attain: 89, vel: '+18%', color: 'rose' },
                { name: 'North Division', dm: 'Sani Mohammed', regions: 'NW, NE, NC', reps: 75, pipeline: '₦120M', attain: 74, vel: '+12%', color: 'indigo' },
              ].map((d, i) => (
                <div key={i} className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-display font-bold text-xs ${
                      d.color === 'rose' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'
                    }`}>{d.name.split(' ')[0][0]}{d.name.split(' ')[1][0]}</div>
                    <div className="flex-1">
                      <p className="font-display font-bold text-sm text-ink">{d.name}</p>
                      <p className="text-[11px] text-navy-500">{d.dm} · {d.regions}</p>
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
                      <div className={`h-full rounded-full ${d.color === 'rose' ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${d.attain}%` }} />
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

          <div className="fade-up stagger-2 rounded-2xl bg-white border border-navy-100 p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="font-display font-bold text-ink">Pipeline by Product · National</h3>
              <span className="text-[10px] text-navy-400">All divisions consolidated</span>
            </div>
            <div className="space-y-3">
              {[
                { n: 'Coflin Forte 600mg', cat: 'Mucolytic · RX', vol: '₦68M', g: 37, share: 42 },
                { n: 'Astrazon 10mg', cat: 'Antihistamine', vol: '₦42M', g: 18, share: 26 },
                { n: 'Tuxil-N Syrup', cat: 'OTC Cough', vol: '₦24M', g: -4, share: 15 },
                { n: 'Cardio Portfolio', cat: 'RX · CV', vol: '₦18M', g: 8, share: 11 },
                { n: 'Other RX', cat: 'Various', vol: '₦10M', g: 5, share: 6 },
              ].map((p, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="font-display font-semibold text-sm text-ink truncate">{p.n}</span>
                      <span className="text-[10px] text-navy-500 hidden sm:inline">· {p.cat}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="font-mono text-xs font-bold text-ink">{p.vol}</span>
                      <span className={`font-mono text-[11px] font-bold ${p.g > 0 ? 'text-leaf-700' : 'text-rose-600'}`}>{p.g > 0 ? '+' : ''}{p.g}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-navy-100 overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${p.share * 2}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="fade-up stagger-3 rounded-2xl bg-white border border-navy-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-navy-100">
              <h3 className="font-display font-bold text-ink text-sm">High-Potential Markets</h3>
              <p className="text-[11px] text-navy-500 mt-0.5">AI-identified · Untapped opportunity</p>
            </div>
            <div className="divide-y divide-navy-50">
              {[
                { city: 'Abuja (FCT)', region: 'NC', op: '₦24M', pri: 'high' },
                { city: 'Kano', region: 'NW', op: '₦18M', pri: 'high' },
                { city: 'Port Harcourt', region: 'SS', op: '₦14M', pri: 'med' },
                { city: 'Enugu', region: 'SE', op: '₦9M', pri: 'med' },
                { city: 'Kaduna', region: 'NW', op: '₦7M', pri: 'med' },
              ].map((m, i) => (
                <div key={i} className="px-4 py-2.5 flex items-center gap-3 hover:bg-paper">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center font-mono font-bold text-[10px] text-indigo-700 flex-shrink-0">
                    {m.region}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-xs text-ink truncate">{m.city}</p>
                    <p className="text-[10px] text-navy-500">Underserved · A-tier potential</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs font-bold text-leaf-700">{m.op}</p>
                    <span className={`text-[9px] font-bold ${m.pri === 'high' ? 'text-rose-700' : 'text-amber-700'}`}>{m.pri.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="fade-up stagger-4 rounded-2xl bg-white border border-navy-100 p-5">
            <h3 className="font-display font-bold text-ink text-sm mb-3">Strategic AI Insights</h3>
            <div className="space-y-3">
              {insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-paper">
                  <Icon name={insight.i} size={14} className={`mt-0.5 flex-shrink-0 ${
                    insight.c === 'leaf' ? 'text-leaf-700' :
                    insight.c === 'amber' ? 'text-amber-700' : 'text-indigo-700'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-display font-semibold text-ink">{insight.t}</p>
                    <p className="text-[10px] text-navy-500 mt-0.5">{insight.s}</p>
                  </div>
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
                { l: 'Daily Performance · 13 May', t: 'Auto-pushed 8am' },
                { l: 'Weekly Division Compare', t: 'Every Monday' },
                { l: 'Monthly Board Pack', t: '1st of each month' },
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
