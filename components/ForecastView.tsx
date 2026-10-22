import { useMemo, useState } from 'react';
import Icon from './Icon';
import { ORG_TREE, rollUpNode } from '../assets/drillData';

// Executive forecast screen.
// Props:
//   scope  · 'National' (default) or a channel desk ('Institution' | 'Trade' | 'Mobile & Frontline');
//            channel desks see the national series scaled to their channel's share.
//   onOpenDivision · optional, called with a division id ('south' | 'north') from the benchmark table,
//            e.g. to open DrillDown at that division.
export interface ForecastViewProps {
  scope?: string;
  onOpenDivision?: (divisionId: string) => void;
}

type Horizon = 'month' | 'quarter' | 'fy';

const MONTHS = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// ₦BN per month. Jun 2025 to May 2026 actual, Jun to Dec 2026 forecast.
const ACTUAL = [150, 145, 147, 152, 156, 162, 165, 168, 174, 181, 191, 198];
const FORECAST = [182, 176, 178, 184, 186, 190, 192];
const BAND = [0.04, 0.05, 0.06, 0.07, 0.09, 0.1, 0.12];
const MONTHLY_TARGET = 200; // ₦2.4TN / 12
const YTD_ACTUAL = 912; // Jan to May 2026

const SCOPE_SHARE: Record<string, number> = { Institution: 0.48, Trade: 0.37, 'Mobile & Frontline': 0.15 };

const HORIZONS: Record<Horizon, { label: string; sub: string; months: [number, number]; target: number; confidence: number; note: string }> = {
  month: { label: 'Next month', sub: 'June 2026', months: [0, 1], target: 200, confidence: 93, note: 'June dips as it did last year, after Q2-close orders were pulled into May.' },
  quarter: { label: 'Next quarter', sub: 'Q3 · Jul to Sep 2026', months: [1, 4], target: 650, confidence: 88, note: 'Rainy-season slowdown in Jul and Aug, recovering in September with the Coflin paediatric push.' },
  fy: { label: 'Full year', sub: 'FY26 · Jan to Dec 2026', months: [0, 7], target: 2400, confidence: 84, note: 'Includes ₦912BN booked Jan to May. North-Central institutional growth is the main upside.' },
};

const PRODUCTS: { name: string; cat: string; color: string; series: number[] }[] = [
  { name: 'Coflin Forte 600mg', cat: 'Mucolytic · RX', color: '#4F46E5', series: [30, 31, 33, 34, 36, 38, 40, 43, 46, 48, 49.5, 68] },
  { name: 'Astrazon 10mg', cat: 'Antihistamine', color: '#E11D48', series: [46, 47, 47, 46, 45, 45, 44, 44, 43, 43, 43.8, 42] },
  { name: 'Tuxil-N Syrup 100ml', cat: 'Cough · OTC', color: '#D97706', series: [24, 24, 25, 24, 24, 25, 24, 24, 24, 25, 24, 24] },
  { name: 'Cardio portfolio', cat: 'RX · CV', color: '#0EA5E9', series: [14, 14, 15, 15, 15, 16, 16, 16, 17, 17, 17, 18] },
];

// Benchmark index, stated on screen.
const W = { attainment: 0.5, coverage: 0.3, compliance: 0.2 };

const fmtBN = (v: number) => (v >= 1000 ? `₦${(v / 1000).toFixed(2)}TN` : `₦${Math.round(v)}BN`);

export default function ForecastView({ scope = 'National', onOpenDivision }: ForecastViewProps) {
  const [horizon, setHorizon] = useState<Horizon>('fy');
  const [span, setSpan] = useState<6 | 12>(12);
  const [exported, setExported] = useState<string | null>(null);
  const share = SCOPE_SHARE[scope] ?? 1;
  const h = HORIZONS[horizon];

  const actual = ACTUAL.map(v => v * share);
  const forecast = FORECAST.map(v => v * share);
  const [from, to] = h.months;
  const fSlice = forecast.slice(from, to);
  const bandSlice = BAND.slice(from, to);
  const ytd = horizon === 'fy' ? YTD_ACTUAL * share : 0;
  const point = ytd + fSlice.reduce((s, v) => s + v, 0);
  const low = ytd + fSlice.reduce((s, v, i) => s + v * (1 - bandSlice[i]), 0);
  const high = ytd + fSlice.reduce((s, v, i) => s + v * (1 + bandSlice[i]), 0);
  const target = h.target * share;
  const pctOfTarget = Math.round((point / target) * 100);

  // Chart geometry
  const CW = 720, CH = 230, PL = 40, PR = 12, PT = 12, PB = 26;
  const yMax = 260 * share, yMin = 100 * share;
  const x = (i: number) => PL + (i / (MONTHS.length - 1)) * (CW - PL - PR);
  const y = (v: number) => PT + (1 - (v - yMin) / (yMax - yMin)) * (CH - PT - PB);
  const n = ACTUAL.length;
  const actualPts = actual.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const fcPts = [`${x(n - 1)},${y(actual[n - 1])}`, ...forecast.map((v, i) => `${x(n + i)},${y(v)}`)].join(' ');
  const bandPath = [
    `M ${x(n - 1)} ${y(actual[n - 1])}`,
    ...forecast.map((v, i) => `L ${x(n + i)} ${y(v * (1 + BAND[i]))}`),
    ...forecast.map((v, i) => `L ${x(n + i)} ${y(v * (1 - BAND[i]))}`).reverse(),
    'Z',
  ].join(' ');
  const ticks = [0, 1, 2, 3].map(k => yMin + ((yMax - yMin) * k) / 3);

  const divisions = useMemo(() => ORG_TREE.children.map(d => {
    const s = rollUpNode(d);
    const index = Math.round(s.attainment * W.attainment + s.coverage * W.coverage + s.compliance * W.compliance);
    return { id: d.id, name: `${d.name} Division`, lead: d.lead, s, index };
  }), []);
  const best = Math.max(...divisions.map(d => d.index));

  const benchRows: { l: string; get: (d: typeof divisions[number]) => string }[] = [
    { l: 'Q2 target', get: d => `₦${d.s.target.toFixed(1)}M` },
    { l: 'Q2 achieved', get: d => `₦${d.s.achieved.toFixed(1)}M` },
    { l: 'Attainment', get: d => `${d.s.attainment}%` },
    { l: 'Coverage', get: d => `${d.s.coverage}%` },
    { l: 'Compliance', get: d => `${d.s.compliance}%` },
    { l: 'Reps sampled', get: d => `${d.s.reps}` },
    { l: 'Benchmark index', get: d => `${d.index}` },
  ];

  const exportCsv = () => {
    const header = ['Metric', ...divisions.map(d => d.name)];
    const lines = [header, ...benchRows.map(r => [r.l, ...divisions.map(d => r.get(d))])]
      .map(row => row.map(c => `"${c.replace(/"/g, '""')}"`).join(','));
    lines.push('', `"Benchmark index = ${W.attainment} x attainment + ${W.coverage} x coverage + ${W.compliance} x compliance"`);
    const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const name = `division-benchmark-q2-fy26-${scope.toLowerCase().replace(/[^a-z]+/g, '-')}.csv`;
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setExported(name);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="fade-up flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold tracking-wider uppercase">Forecast</span>
            <span className="text-xs text-navy-500">{scope}{share < 1 ? ` · ${Math.round(share * 100)}% of national revenue` : ' · all channels'}</span>
          </div>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-ink">Revenue forecast</h2>
          <p className="text-sm text-navy-500 mt-1">Actuals to May 2026 · forecast from order velocity, call plans and last year's seasonality</p>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-navy-100" role="tablist">
          {(Object.keys(HORIZONS) as Horizon[]).map(k => (
            <button key={k} role="tab" aria-selected={horizon === k} onClick={() => setHorizon(k)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${horizon === k ? 'bg-indigo-600 text-white' : 'text-navy-600 hover:bg-paper'}`}>
              {HORIZONS[k].label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { l: `Forecast · ${h.sub}`, v: fmtBN(point), d: `range ${fmtBN(low)} to ${fmtBN(high)}`, c: 'text-indigo-700' },
          { l: 'Target', v: fmtBN(target), d: horizon === 'fy' ? 'FY26 commitment' : 'phased plan', c: 'text-navy-500' },
          { l: 'Forecast vs target', v: `${pctOfTarget}%`, d: `gap ${fmtBN(Math.max(0, target - point))}`, c: pctOfTarget >= 95 ? 'text-leaf-700' : 'text-amber-700' },
          { l: 'Confidence', v: `${h.confidence}%`, d: 'share of back-tests inside the range', c: 'text-navy-500' },
        ].map((k, i) => (
          <div key={k.l} className={`fade-up stagger-${i + 1} p-4 sm:p-5 rounded-2xl bg-white border border-navy-100`}>
            <p className="stat-label text-navy-400 truncate">{k.l}</p>
            <p className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">{k.v}</p>
            <p className={`text-[11px] font-semibold mt-1 ${k.c}`}>{k.d}</p>
          </div>
        ))}
      </div>

      <div className="fade-up rounded-2xl bg-white border border-navy-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h3 className="font-display font-bold text-ink">Monthly revenue · ₦BN</h3>
            <p className="text-xs text-navy-500 mt-0.5">{h.note}</p>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-navy-500 flex-wrap">
            <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-navy-700 inline-block" />Actual</span>
            <span className="flex items-center gap-1"><span className="w-4 h-0.5 border-t-2 border-dashed border-indigo-500 inline-block" />Forecast</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-indigo-100 inline-block" />Range</span>
            <span className="flex items-center gap-1"><span className="w-4 h-0.5 border-t border-dashed border-navy-400 inline-block" />Monthly target</span>
          </div>
        </div>
        <div className="p-3 sm:p-4 overflow-x-auto">
          <svg viewBox={`0 0 ${CW} ${CH}`} className="w-full min-w-[520px]" role="img" aria-label={`Revenue actuals and forecast, ${h.label}`}>
            <rect x={x(n - 1 + from)} y={PT} width={x(n - 1 + to) - x(n - 1 + from)} height={CH - PT - PB} fill="rgba(99, 102, 241, 0.06)" />
            {ticks.map(t => (
              <g key={t}>
                <line x1={PL} x2={CW - PR} y1={y(t)} y2={y(t)} stroke="#E5EAF4" strokeWidth="1" />
                <text x={PL - 6} y={y(t) + 3} textAnchor="end" fontSize="9" fill="#8FA5D1" fontFamily="JetBrains Mono, monospace">{Math.round(t)}</text>
              </g>
            ))}
            <line x1={PL} x2={CW - PR} y1={y(MONTHLY_TARGET * share)} y2={y(MONTHLY_TARGET * share)} stroke="#8FA5D1" strokeDasharray="4 4" strokeWidth="1" />
            <path d={bandPath} fill="rgba(99, 102, 241, 0.14)" />
            <polyline points={actualPts} fill="none" stroke="#142A5A" strokeWidth="2.25" strokeLinejoin="round" />
            <polyline points={fcPts} fill="none" stroke="#6366F1" strokeWidth="2.25" strokeDasharray="6 4" strokeLinejoin="round" />
            {forecast.slice(from, to).map((v, i) => (
              <circle key={i} cx={x(n + from + i)} cy={y(v)} r="3" fill="#6366F1" />
            ))}
            {MONTHS.map((m, i) => (
              <text key={i} x={x(i)} y={CH - 8} textAnchor="middle" fontSize="9" fill={i >= n ? '#6366F1' : '#5B6F99'} fontFamily="Sora, sans-serif">{m}</text>
            ))}
            <line x1={x(n - 1)} x2={x(n - 1)} y1={PT} y2={CH - PB} stroke="#CBD5E1" strokeWidth="1" />
            <text x={x(n - 1) + 4} y={PT + 9} fontSize="9" fill="#5B6F99">today</text>
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <div className="fade-up rounded-2xl bg-white border border-navy-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-navy-100 flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h3 className="font-display font-bold text-ink">Division benchmarking · Q2</h3>
              <p className="text-[10px] text-navy-500 mt-1">Benchmark index = {W.attainment} × attainment + {W.coverage} × coverage + {W.compliance} × compliance (each in %)</p>
            </div>
            <button onClick={exportCsv} className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center gap-1.5 btn-press hover:bg-indigo-100">
              <Icon name="download" size={12} /> Export CSV
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-paper">
                <th className="px-5 py-2 text-left text-[10px] font-bold text-navy-400 uppercase tracking-wider">Metric</th>
                {divisions.map(d => (
                  <th key={d.id} className="px-3 py-2 text-right">
                    <button onClick={() => onOpenDivision?.(d.id)} disabled={!onOpenDivision} className="text-[11px] font-display font-bold text-ink enabled:hover:text-indigo-700 enabled:hover:underline">{d.name}</button>
                    <p className="text-[9px] font-normal text-navy-400">{d.lead}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {benchRows.map(r => (
                <tr key={r.l} className={r.l === 'Benchmark index' ? 'bg-indigo-50/50' : ''}>
                  <td className="px-5 py-2 text-xs text-navy-600">{r.l}</td>
                  {divisions.map(d => (
                    <td key={d.id} className={`px-3 py-2 text-right font-mono text-xs ${r.l === 'Benchmark index' ? (d.index === best ? 'font-bold text-leaf-700' : 'font-bold text-amber-700') : 'text-ink'}`}>{r.get(d)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {exported && (
            <p className="px-5 py-2.5 border-t border-navy-100 text-[11px] text-leaf-700 font-semibold flex items-center gap-1.5">
              <Icon name="checkCircle" size={12} /> Downloaded {exported}
            </p>
          )}
        </div>

        <div className="fade-up rounded-2xl bg-white border border-navy-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between gap-2 flex-wrap">
            <div>
              <h3 className="font-display font-bold text-ink">Product trends · ₦M per month</h3>
              <p className="text-xs text-navy-500 mt-0.5">National sell-in, last {span} months</p>
            </div>
            <div className="flex items-center gap-1">
              {([6, 12] as const).map(w => (
                <button key={w} onClick={() => setSpan(w)} className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${span === w ? 'bg-navy-700 text-white' : 'bg-paper text-navy-600 hover:bg-navy-100'}`}>{w} mo</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 divide-navy-50">
            {PRODUCTS.map(p => {
              const s = p.series.slice(-span).map(v => v * share);
              const first = s[0], last = s[s.length - 1], prev = s[s.length - 2];
              const chg = Math.round(((last - first) / first) * 100);
              const mom = Math.round(((last - prev) / prev) * 100);
              const lo = Math.min(...s) * 0.95, hi = Math.max(...s) * 1.05;
              const px = (i: number) => 4 + (i / (s.length - 1)) * 232;
              const py = (v: number) => 4 + (1 - (v - lo) / (hi - lo)) * 52;
              return (
                <div key={p.name} className="p-4 border-navy-50 sm:odd:border-r sm:[&:nth-child(n+3)]:border-t">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-display font-semibold text-sm text-ink truncate">{p.name}</p>
                      <p className="text-[10px] text-navy-500">{p.cat}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-mono text-sm font-bold text-ink">₦{last.toFixed(1)}M</p>
                      <p className={`font-mono text-[10px] font-bold ${mom >= 0 ? 'text-leaf-700' : 'text-rose-600'}`}>{mom >= 0 ? '+' : ''}{mom}% MoM</p>
                    </div>
                  </div>
                  <svg viewBox="0 0 240 60" className="w-full mt-2" role="img" aria-label={`${p.name} trend`}>
                    <polyline points={s.map((v, i) => `${px(i)},${py(v)}`).join(' ')} fill="none" stroke={p.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                    <circle cx={px(s.length - 1)} cy={py(last)} r="3" fill={p.color} />
                  </svg>
                  <p className="text-[10px] text-navy-500 mt-1">{chg >= 0 ? '+' : ''}{chg}% over {span} months</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
