import Icon from './Icon';

interface ASMDashboardProps {
  onNavigate: (view: string) => void;
}

interface AreaRep {
  n: string;
  z: string;
  s: 'live' | 'idle';
  visits: string;
  target: number;
  lastCheckIn: string;
}

export default function ASMDashboard({ onNavigate }: ASMDashboardProps) {
  const areaReps: AreaRep[] = [
    { n: 'Adaeze Okafor', z: 'V.I. East', s: 'live', visits: '3/8', target: 87, lastCheckIn: '10:04 AM' },
    { n: 'Tope Adeola', z: 'Lekki Phase 1', s: 'live', visits: '4/9', target: 91, lastCheckIn: '10:12 AM' },
    { n: 'Bayo Salami', z: 'Lekki Phase 2', s: 'live', visits: '2/7', target: 68, lastCheckIn: '9:58 AM' },
    { n: 'Yetunde Cole', z: 'V.I. West', s: 'idle', visits: '1/6', target: 54, lastCheckIn: '9:30 AM' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="fade-up">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold tracking-wider uppercase">Area Sales Manager</span>
              <span className="text-xs text-navy-500">Lekki / V.I. Cluster</span>
            </div>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-ink">
              Hi <span style={{ background: 'linear-gradient(135deg, #142A5A 0%, #0EA5E9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Funmi</span> · your cluster is humming
            </h2>
            <p className="text-sm text-navy-500 mt-1">3 of 4 reps active in the field · You report up to BM Cestra</p>
          </div>
          <button onClick={() => onNavigate('asm-pushup')} className="px-3 py-2 rounded-lg bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 btn-press hover:bg-sky-600">
            <Icon name="send" size={14} /> Push Report to BM
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { l: 'Area Coverage', v: '82%', d: '+8% vs yesterday', c: 'sky' },
          { l: 'My 4 Reps', v: '3/4 Live', d: '1 idle', c: 'sky' },
          { l: 'Area Pipeline', v: '₦14.2M', d: '34 active orders', c: 'navy' },
          { l: 'Coaching Due', v: '2', d: '1:1s this week', c: 'amber' },
        ].map((k, i) => (
          <div key={i} className={`fade-up stagger-${i + 1} p-4 sm:p-5 rounded-2xl bg-white border border-navy-100`}>
            <p className="stat-label text-navy-400">{k.l}</p>
            <p className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">{k.v}</p>
            <p className={`text-[11px] font-semibold mt-1 ${k.c === 'sky' ? 'text-sky-700' : k.c === 'amber' ? 'text-amber-700' : 'text-navy-500'}`}>{k.d}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="fade-up rounded-2xl bg-white border border-navy-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-ink">My Cluster · Live View</h3>
                <p className="text-xs text-navy-500 mt-0.5">Zoomed to Lekki/V.I. · Your 4 reps</p>
              </div>
              <span className="px-2 py-1 rounded-full bg-sky-50 text-sky-700 text-[10px] font-bold">AREA SCOPE</span>
            </div>
            <div className="relative map-bg" style={{ height: '320px' }}>
              {[
                { x: '30%', y: '35%', n: 'AO', s: 'live' as const, loc: 'V.I. East' },
                { x: '60%', y: '30%', n: 'TA', s: 'live' as const, loc: 'Lekki Phase 1' },
                { x: '70%', y: '65%', n: 'BS', s: 'live' as const, loc: 'Lekki Phase 2' },
                { x: '25%', y: '70%', n: 'YC', s: 'idle' as const, loc: 'V.I. West' },
              ].map((m, i) => (
                <div key={i} className="fade-up" style={{ left: m.x, top: m.y, position: 'absolute', transform: 'translate(-50%,-50%)' }}>
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full text-white font-display font-bold text-xs flex items-center justify-center shadow-lg ring-4 ${
                      m.s === 'live' ? 'bg-sky-500 ring-sky-100' : 'bg-amber-500 ring-amber-100'
                    }`}>{m.n}</div>
                    {m.s === 'live' && <div className="absolute inset-0 rounded-full gps-pulse pointer-events-none" />}
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-navy-900 text-white text-[9px] font-bold whitespace-nowrap">{m.loc}</div>
                  </div>
                </div>
              ))}
              <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-white shadow-sm flex items-center gap-2">
                <Icon name="target" size={12} className="text-sky-700" />
                <span className="text-[11px] font-bold text-navy-700">Cluster: Lekki/V.I.</span>
              </div>
            </div>
          </div>

          <div className="fade-up stagger-1 rounded-2xl bg-white border border-navy-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between">
              <h3 className="font-display font-bold text-ink">My Team · Today</h3>
              <button onClick={() => onNavigate('asm-team')} className="text-xs font-semibold text-sky-700">Coach 1:1 →</button>
            </div>
            <div className="divide-y divide-navy-50">
              {areaReps.map((r, i) => (
                <div key={i} className="px-5 py-3 hover:bg-paper transition-colors flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full font-display font-bold text-xs flex items-center justify-center ${
                      r.s === 'live' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'
                    }`}>{r.n.split(' ').map(x => x[0]).join('')}</div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                      r.s === 'live' ? 'bg-sky-500' : 'bg-amber-500'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-sm text-ink truncate">{r.n}</p>
                    <p className="text-[11px] text-navy-500">{r.z} · last check-in {r.lastCheckIn}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 rounded-full bg-navy-100 overflow-hidden max-w-[120px]">
                        <div className={`h-full rounded-full ${r.target > 70 ? 'bg-sky-500' : 'bg-amber-500'}`} style={{ width: `${r.target}%` }} />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-navy-700">{r.target}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono font-bold text-ink">{r.visits}</p>
                    <button className="text-[10px] text-sky-700 font-bold mt-1">View detail →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="fade-up stagger-2 relative p-5 rounded-2xl overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, #0F2147 0%, #0369A1 100%)' }}>
            <div className="absolute inset-0 ai-shimmer" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-sky-400 flex items-center justify-center">
                  <Icon name="users" size={16} className="text-white" />
                </div>
                <p className="text-[10px] font-bold text-sky-300 tracking-[0.2em] uppercase">Coach Mode</p>
              </div>
              <h3 className="font-display text-xl font-bold leading-tight">Yetunde needs a check-in</h3>
              <p className="text-sm text-white/80 mt-2">Visit completion dropped to 54% this week. Last coaching note was 18 days ago.</p>
              <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[10px] font-bold text-sky-300 tracking-wider uppercase mb-1">AI-Suggested Talking Points</p>
                <ul className="text-xs space-y-1">
                  <li>• Pipeline volume vs. effort gap</li>
                  <li>• MedPlus V.I. account at risk</li>
                  <li>• Coflin detailing missing on 3 visits</li>
                </ul>
              </div>
              <button onClick={() => onNavigate('asm-team')} className="mt-4 px-3 py-2 rounded-lg bg-sky-400 text-white text-xs font-bold btn-press flex items-center gap-1.5">
                Open coaching note <Icon name="arrowRight" size={12} />
              </button>
            </div>
          </div>

          <div className="fade-up stagger-3 rounded-2xl bg-white border border-navy-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-ink text-sm">My Activity Log</h3>
              <button onClick={() => onNavigate('asm-log')} className="text-[11px] font-semibold text-sky-700">All →</button>
            </div>
            <p className="text-[10px] text-navy-400 mb-3">Visible to BM Cestra</p>
            <div className="space-y-2">
              {[
                { t: '09:40', n: '1:1 with Bayo Salami', d: 'Lekki Phase 2 strategy review' },
                { t: '09:00', n: 'Pushed itinerary changes', d: 'Re-assigned 2 visits to Tope' },
                { t: '08:30', n: 'Daily team huddle', d: '4 reps · 8 min · Coflin focus' },
              ].map((a, i) => (
                <div key={i} className="flex gap-2 text-xs">
                  <span className="font-mono text-navy-400 w-10 flex-shrink-0">{a.t}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink">{a.n}</p>
                    <p className="text-[10px] text-navy-500">{a.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
