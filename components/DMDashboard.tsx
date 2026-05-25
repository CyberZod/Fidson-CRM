import Icon from './Icon';
import NigeriaMap from './NigeriaMap';
import type { ApprovalItem, EscalatedApproval, RegionData } from '../types';

interface DMDashboardProps {
  onNavigate: (view: string) => void;
  escalatedApprovals?: EscalatedApproval[];
  approvals?: ApprovalItem[];
}

export default function DMDashboard({ onNavigate, escalatedApprovals }: DMDashboardProps) {
  const southRegionsData: RegionData[] = [
    { code: 'SW', intensity: 0.92, label: '92%' },
    { code: 'SE', intensity: 0.78, label: '78%' },
    { code: 'SS', intensity: 0.84, label: '84%' },
  ];
  const escalatedCount = escalatedApprovals?.length || 2;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="fade-up">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold tracking-wider uppercase">Division Manager</span>
              <span className="text-xs text-navy-500">South Division · 3 Regions</span>
            </div>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-ink">
              Good morning, <span style={{ background: 'linear-gradient(135deg, #142A5A 0%, #F43F5E 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Kemi</span>
            </h2>
            <p className="text-sm text-navy-500 mt-1">3 RSMs · 2 FSMs · 67 reps across SW, SE, SS · You report to NSM Ogunlana</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onNavigate('dm-escalated')} className="px-3 py-2 rounded-lg border border-rose-300 bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-1.5 btn-press hover:bg-rose-100">
              <Icon name="alert" size={14} /> {escalatedCount} escalated
            </button>
            <button onClick={() => onNavigate('dm-push')} className="px-3 py-2 rounded-lg bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 btn-press hover:bg-rose-600">
              <Icon name="send" size={14} /> Push to NSM
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { l: 'Division Pipeline', v: '₦128M', d: '+18% MoM', c: 'rose' },
          { l: 'Regional Coverage', v: '85%', d: 'avg across 3 regions', c: 'rose' },
          { l: 'Q2 Attainment', v: '89%', d: 'leading division', c: 'leaf' },
          { l: 'Escalated Approvals', v: escalatedCount.toString(), d: escalatedCount > 0 ? 'awaiting decision' : 'all clear', c: escalatedCount > 0 ? 'amber' : 'leaf' },
        ].map((k, i) => (
          <div key={i} className={`fade-up stagger-${i + 1} p-4 sm:p-5 rounded-2xl bg-white border border-navy-100`}>
            <p className="stat-label text-navy-400">{k.l}</p>
            <p className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">{k.v}</p>
            <p className={`text-[11px] font-semibold mt-1 ${k.c === 'rose' ? 'text-rose-700' : k.c === 'leaf' ? 'text-leaf-700' : k.c === 'amber' ? 'text-amber-700' : 'text-navy-500'}`}>{k.d}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="fade-up rounded-2xl bg-white border border-navy-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-display font-bold text-ink">South Division Map</h3>
                <p className="text-xs text-navy-500 mt-0.5">3 regions · Click any region for deep dive</p>
              </div>
              <span className="px-2 py-1 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold">DIVISION SCOPE</span>
            </div>
            <div className="p-4 bg-paper">
              <NigeriaMap regions={southRegionsData} division="south" height={300} onRegionClick={() => {}} />
            </div>
          </div>

          <div className="fade-up stagger-1 rounded-2xl bg-white border border-navy-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-navy-100">
              <h3 className="font-display font-bold text-ink">Regional Performance · This Quarter</h3>
              <p className="text-xs text-navy-500 mt-0.5">Cross-regional intelligence · Your 3 regions</p>
            </div>
            <div className="divide-y divide-navy-50">
              {[
                { name: 'South-West', rsm: 'Tunde Bakare', reps: 32, pipeline: '₦58M', attain: 92, vel: '+15%', accent: 'leaf' },
                { name: 'South-South', rsm: 'Emeka Okoro', reps: 21, pipeline: '₦41M', attain: 84, vel: '+8%', accent: 'sky' },
                { name: 'South-East', rsm: 'Ngozi Achebe', reps: 14, pipeline: '₦29M', attain: 78, vel: '+2%', accent: 'amber' },
              ].map((r, i) => (
                <div key={i} className="px-5 py-3 hover:bg-paper transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-xs flex-shrink-0 ${
                      r.accent === 'leaf' ? 'bg-leaf-100 text-leaf-700' :
                      r.accent === 'sky' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'
                    }`}>{r.name.split('-').map(x => x[0]).join('')}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-display font-semibold text-sm text-ink">{r.name}</p>
                        <span className="text-[10px] text-navy-500">· {r.reps} reps · {r.rsm}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-[11px] text-navy-500 font-medium">{r.pipeline} pipeline</p>
                        <p className={`text-[11px] font-bold ${r.vel.startsWith('+') ? 'text-leaf-700' : 'text-rose-600'}`}>{r.vel} vel.</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-lg font-bold text-ink">{r.attain}%</p>
                      <p className="text-[10px] text-navy-400">attainment</p>
                    </div>
                  </div>
                  <div className="pl-13 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-navy-100 overflow-hidden">
                      <div className={`h-full rounded-full ${
                        r.accent === 'leaf' ? 'bg-leaf-500' :
                        r.accent === 'sky' ? 'bg-sky-500' : 'bg-amber-500'
                      }`} style={{ width: `${r.attain}%` }} />
                    </div>
                    <button className="text-[10px] font-bold text-rose-700 hover:text-rose-800">Drill in →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="fade-up stagger-2 rounded-2xl bg-white border border-rose-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-rose-100 bg-rose-50/50">
              <div className="flex items-center gap-2">
                <Icon name="alert" size={16} className="text-rose-700" />
                <h3 className="font-display font-bold text-ink text-sm">Escalated to You</h3>
              </div>
              <p className="text-[11px] text-rose-700 mt-0.5">Discounts above RSM limit · Marketing exceptions</p>
            </div>
            <div className="divide-y divide-rose-50">
              {[
                { rep: 'Tunde Bakare', detail: '22% on Reddington Hospital · ₦1.4M order', src: 'RSM South-West', urgent: true },
                { rep: 'Emeka Okoro', detail: '19% on PHC Med Plaza · ₦820k order', src: 'RSM South-South', urgent: false },
              ].map((e, i) => (
                <div key={i} className="px-5 py-3">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-display font-semibold text-xs text-ink">{e.rep}</p>
                    {e.urgent && <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[9px] font-bold">URGENT</span>}
                    <span className="text-[10px] text-navy-500">· from {e.src}</span>
                  </div>
                  <p className="text-xs text-navy-700">{e.detail}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <button className="px-2 py-1 rounded-md border border-navy-200 text-[10px] font-bold text-navy-700 hover:bg-navy-50">Review</button>
                    <button className="px-2 py-1 rounded-md bg-rose-500 text-white text-[10px] font-bold hover:bg-rose-600">Approve</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="fade-up stagger-3 relative p-5 rounded-2xl overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, #4C0519 0%, #F43F5E 100%)' }}>
            <div className="absolute inset-0 ai-shimmer" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-sm">
                  <Icon name="sparkles" size={16} className="text-white" />
                </div>
                <p className="text-[10px] font-bold text-rose-200 tracking-[0.2em] uppercase">Cross-Regional Intelligence</p>
              </div>
              <h3 className="font-display text-lg font-bold leading-tight">SE region under-indexing on Coflin</h3>
              <p className="text-sm text-white/85 mt-2">South-East trails SW by 28% on respiratory portfolio adoption. PM detailing materials reaching only 64% of reps there.</p>
              <button onClick={() => onNavigate('dm-regions')} className="mt-4 px-3 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm">
                Investigate SE region <Icon name="arrowRight" size={12} />
              </button>
            </div>
          </div>

          <div className="fade-up stagger-4 rounded-2xl bg-white border border-navy-100 p-5">
            <h3 className="font-display font-bold text-ink text-sm mb-3">Division Actions</h3>
            <div className="space-y-2">
              {[
                { i: 'send' as const, l: 'Push Weekly to NSM', s: 'Bayo Ogunlana' },
                { i: 'users' as const, l: 'Coordinate with DM North', s: 'Sani Mohammed' },
                { i: 'file' as const, l: 'View Auto Division Report', s: 'Generated daily' },
              ].map(a => (
                <button key={a.l} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-paper text-left">
                  <Icon name={a.i} size={14} className="text-rose-700" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-ink">{a.l}</p>
                    <p className="text-[10px] text-navy-500">{a.s}</p>
                  </div>
                  <Icon name="chevronRight" size={12} className="text-navy-300" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
