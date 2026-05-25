import { useMemo, useState } from 'react';
import Icon from './Icon';

interface FieldActivityViewProps {
  searchQuery: string;
}

type FilterKey = 'all' | 'live' | 'idle' | 'offline';

interface Rep {
  n: string;
  z: string;
  s: 'live' | 'idle' | 'offline';
  visits: string;
  loc: string;
  last: string;
  value: string;
  percent: number;
}

export default function FieldActivityView({ searchQuery }: FieldActivityViewProps) {
  const [filter, setFilter] = useState<FilterKey>('all');

  const allReps: Rep[] = [
    { n: 'Adaeze Okafor', z: 'V.I./Lekki', s: 'live', visits: '3/8', loc: 'Lakeshore Hospital', last: '10:04 AM', value: '₦340k', percent: 87 },
    { n: 'Chinedu Eze', z: 'Ikeja', s: 'live', visits: '2/7', loc: 'Reddington', last: '9:48 AM', value: '₦210k', percent: 72 },
    { n: 'Tope Adeola', z: 'Surulere', s: 'live', visits: '4/9', loc: 'En route', last: '10:12 AM', value: '₦520k', percent: 91 },
    { n: 'Kola Adeniyi', z: 'Apapa', s: 'live', visits: '2/6', loc: 'MedPlus Apapa', last: '10:02 AM', value: '₦180k', percent: 68 },
    { n: 'Fatima Bello', z: 'Ojuelegba', s: 'idle', visits: '1/5', loc: 'On break', last: '9:30 AM', value: '₦45k', percent: 45 },
    { n: 'Joseph Nwafor', z: 'Yaba', s: 'offline', visits: '0/6', loc: 'On leave', last: '—', value: '—', percent: 0 },
    { n: 'Olamide Martins', z: 'Festac', s: 'offline', visits: '0/4', loc: 'Late', last: '—', value: '—', percent: 0 },
  ];

  const filteredReps = useMemo(() => {
    let result = allReps;
    if (filter !== 'all') result = result.filter(r => r.s === filter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => r.n.toLowerCase().includes(q) || r.z.toLowerCase().includes(q) || r.loc.toLowerCase().includes(q));
    }
    return result;
  }, [filter, searchQuery]);

  const counts: Record<FilterKey, number> = useMemo(() => ({
    all: allReps.length,
    live: allReps.filter(r => r.s === 'live').length,
    idle: allReps.filter(r => r.s === 'idle').length,
    offline: allReps.filter(r => r.s === 'offline').length,
  }), []);

  const filterButtons: { k: FilterKey; l: string }[] = [
    { k: 'all', l: 'All' },
    { k: 'live', l: 'Live' },
    { k: 'idle', l: 'Idle' },
    { k: 'offline', l: 'Offline' },
  ];

  const mapPins: { x: string; y: string; n: string; s: 'live' | 'idle' | 'offline' }[] = [
    { x: '25%', y: '30%', n: 'AO', s: 'live' }, { x: '48%', y: '25%', n: 'CE', s: 'live' },
    { x: '68%', y: '45%', n: 'TA', s: 'live' }, { x: '30%', y: '65%', n: 'KA', s: 'live' },
    { x: '78%', y: '72%', n: 'FB', s: 'idle' }, { x: '15%', y: '50%', n: 'JN', s: 'offline' },
    { x: '55%', y: '78%', n: 'OM', s: 'offline' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 fade-up">
          <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-display font-bold text-ink">Live Field Map</h3>
                <p className="text-xs text-navy-500">Real-time rep locations · Lagos metro</p>
              </div>
              <div className="flex items-center gap-1">
                {filterButtons.map(f => (
                  <button
                    key={f.k}
                    onClick={() => setFilter(f.k)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                      filter === f.k ? 'bg-navy-700 text-white' : 'bg-paper text-navy-600 hover:bg-navy-100'
                    }`}
                  >
                    {f.l}
                    <span className={`px-1 rounded text-[9px] ${filter === f.k ? 'bg-white/20' : 'bg-navy-200/50'}`}>{counts[f.k]}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="relative map-bg" style={{ height: '500px' }}>
              {mapPins.filter(m => filter === 'all' || m.s === filter).map((m, i) => (
                <div key={i} className="fade-up" style={{ left: m.x, top: m.y, position: 'absolute', transform: 'translate(-50%,-50%)' }}>
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full text-white font-display font-bold text-xs flex items-center justify-center shadow-lg ring-4 ${
                      m.s === 'live' ? 'bg-leaf-500 ring-leaf-100' :
                      m.s === 'idle' ? 'bg-amber-500 ring-amber-100' :
                      'bg-navy-400 ring-navy-100'
                    }`}>{m.n}</div>
                    {m.s === 'live' && <div className="absolute inset-0 rounded-full gps-pulse pointer-events-none" />}
                  </div>
                </div>
              ))}
              <div className="absolute top-4 left-4 px-3 py-2 rounded-xl bg-white shadow-md">
                <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase mb-1">Lagos Region</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-leaf-500 pulse-dot" />
                    <span className="text-xs font-bold text-navy-700">{counts.live} Live</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-xs font-bold text-navy-700">{counts.idle} Idle</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-navy-400" />
                    <span className="text-xs font-bold text-navy-700">{counts.offline} Off</span>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-4 right-4 px-3 py-2 rounded-xl bg-navy-900 text-white shadow-lg">
                <p className="text-[10px] font-bold text-leaf-300 tracking-wider">AI ROUTE OPTIMIZER</p>
                <p className="text-xs font-display font-bold mt-0.5">28% less driving today</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 fade-up stagger-1">
            {[
              { l: 'Planned', v: '62', c: 'navy' }, { l: 'Completed', v: '28', c: 'leaf' },
              { l: 'In Progress', v: '4', c: 'amber' }, { l: 'Missed', v: '2', c: 'rose' },
            ].map(s => (
              <div key={s.l} className="p-4 rounded-xl bg-white border border-navy-100">
                <p className="stat-label text-navy-400">{s.l}</p>
                <p className={`font-display text-2xl font-bold mt-1 ${
                  s.c === 'leaf' ? 'text-leaf-700' : s.c === 'amber' ? 'text-amber-700' :
                  s.c === 'rose' ? 'text-rose-700' : 'text-ink'
                }`}>{s.v}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="fade-up stagger-2 rounded-2xl bg-white border border-navy-100 h-fit">
          <div className="px-5 py-4 border-b border-navy-100">
            <h3 className="font-display font-bold text-ink">Team Roster</h3>
            <p className="text-xs text-navy-500 mt-0.5">{filteredReps.length} of {allReps.length} reps {filter !== 'all' ? `· ${filter}` : ''}</p>
          </div>
          <div className="p-3 max-h-[600px] overflow-y-auto space-y-1">
            {filteredReps.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-navy-500">No reps match this filter</p>
              </div>
            ) : filteredReps.map((r, i) => (
              <button key={i} className="w-full p-3 rounded-lg hover:bg-paper transition-colors text-left flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full font-display font-bold text-xs flex items-center justify-center ${
                    r.s === 'live' ? 'bg-leaf-100 text-leaf-700' :
                    r.s === 'idle' ? 'bg-amber-100 text-amber-700' : 'bg-navy-100 text-navy-700'
                  }`}>{r.n.split(' ').map(x => x[0]).join('')}</div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                    r.s === 'live' ? 'bg-leaf-500' : r.s === 'idle' ? 'bg-amber-500' : 'bg-navy-300'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-sm text-ink truncate">{r.n}</p>
                  <p className="text-[11px] text-navy-500 truncate">{r.z} · {r.loc}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-ink">{r.visits}</p>
                  <p className="text-[10px] text-leaf-700 font-bold">{r.value}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
