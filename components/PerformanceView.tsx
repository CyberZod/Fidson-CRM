import { useState } from 'react';
import Icon from './Icon';
import DrillDown from './DrillDown';
import { findPath } from '../assets/drillData';

interface PerfRow {
  name: string;
  unit: string;
  target: number;   // ₦M
  achieved: number; // ₦M
}
interface PerformanceViewProps {
  title?: string;
  subtitle?: string;
  rows?: PerfRow[];
  drillRootId?: string; // highest level the viewer may climb to; defaults to the rows' common parent
}

const pathFor = (name: string) => findPath(name.replace(/ (Region|Division)$/i, ''));

// ponytail: read-only target-vs-achieved. Target *setting* (cascade down the hierarchy,
// periods, approval, lock) is deferred · add when the org confirms the target workflow.
const DEFAULT_ROWS: PerfRow[] = [
  { name: 'Adaeze Okafor', unit: 'Lekki Cluster', target: 12.0, achieved: 11.3 },
  { name: 'Tope Adeola', unit: 'Surulere', target: 10.0, achieved: 9.1 },
  { name: 'Bayo Salami', unit: 'Lekki Phase 2', target: 9.0, achieved: 5.8 },
  { name: 'Yetunde Cole', unit: 'V.I. West', target: 8.0, achieved: 8.6 },
  { name: 'Chinedu Eze', unit: 'Ikeja Cluster', target: 11.0, achieved: 10.7 },
];

const band = (pct: number) =>
  pct >= 100 ? { t: 'On target', c: 'text-leaf-700 bg-leaf-50', bar: 'bg-leaf-500' }
    : pct >= 85 ? { t: 'Near target', c: 'text-amber-700 bg-amber-50', bar: 'bg-amber-500' }
      : { t: 'Behind', c: 'text-rose-700 bg-rose-50', bar: 'bg-rose-500' };

export default function PerformanceView({
  title = 'Team Performance',
  subtitle = 'Target vs Achieved · Q2 · the people reporting to you',
  rows = DEFAULT_ROWS,
  drillRootId,
}: PerformanceViewProps) {
  const [drillPath, setDrillPath] = useState<string[] | null>(null);
  const paths = rows.map(r => pathFor(r.name));
  const found = paths.filter((p): p is string[] => !!p);
  let common: string[] = found[0] ? found[0].slice(0, -1) : ['national'];
  for (const p of found) {
    let k = 0;
    while (k < common.length && k < p.length - 1 && common[k] === p[k]) k++;
    common = common.slice(0, k);
  }
  const rootId = drillRootId ?? common[common.length - 1] ?? 'national';

  const totalTarget = rows.reduce((s, r) => s + r.target, 0);
  const totalAchieved = rows.reduce((s, r) => s + r.achieved, 0);
  const teamPct = Math.round((totalAchieved / totalTarget) * 100);
  const teamBand = band(teamPct);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1100px] mx-auto space-y-6">
      <div className="fade-up">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">{title}</h2>
        <p className="text-sm text-navy-500 mt-1">{subtitle}</p>
      </div>

      {/* Roll-up */}
      <div className="fade-up stagger-1 rounded-2xl bg-white border border-navy-100 p-5 sm:p-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="stat-label text-navy-400">Team Attainment · Q2</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="font-display text-3xl sm:text-4xl font-bold text-ink">{teamPct}%</p>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${teamBand.c}`}>{teamBand.t}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-navy-500">₦{totalAchieved.toFixed(1)}M <span className="text-navy-400">of</span> ₦{totalTarget.toFixed(1)}M</p>
            <p className="text-[11px] text-navy-400 mt-0.5">{rows.length} reporting</p>
          </div>
        </div>
        <div className="mt-3 h-2 rounded-full bg-navy-100 overflow-hidden">
          <div className={`h-full rounded-full ${teamBand.bar}`} style={{ width: `${Math.min(100, teamPct)}%` }} />
        </div>
      </div>

      {/* Per-person */}
      <div className="fade-up stagger-2 rounded-2xl bg-white border border-navy-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-navy-100">
          <h3 className="font-display font-bold text-ink">Individual · Expected vs Achieved</h3>
          {found.length > 0 && <p className="text-[11px] text-navy-500 mt-0.5">Select a row to drill into visits, orders and coverage</p>}
        </div>
        <div className="divide-y divide-navy-50">
          {rows.map((r, i) => {
            const pct = Math.round((r.achieved / r.target) * 100);
            const b = band(pct);
            const path = paths[i];
            return (
              <button
                key={i}
                disabled={!path}
                onClick={() => path && setDrillPath(path)}
                className="w-full text-left block px-5 py-4 enabled:hover:bg-paper focus:bg-indigo-50 focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-navy-100 text-navy-600 font-display font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                    {r.name.split(' ').map(x => x[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-sm text-ink truncate">{r.name}</p>
                    <p className="text-[11px] text-navy-500">{r.unit}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-mono font-bold text-ink text-sm">{pct}%</p>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${b.c}`}>{b.t}</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-3 pl-12">
                  <div className="flex-1 h-1.5 rounded-full bg-navy-100 overflow-hidden">
                    <div className={`h-full rounded-full ${b.bar}`} style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                  <span className="text-[10px] font-mono text-navy-500 flex-shrink-0">₦{r.achieved.toFixed(1)}M / ₦{r.target.toFixed(1)}M</span>
                  {path && <Icon name="chevronRight" size={14} className="text-navy-300 flex-shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      {drillPath && <DrillDown path={drillPath} rootId={rootId} onClose={() => setDrillPath(null)} />}
    </div>
  );
}
