import Icon from './Icon';
import type { RepVisit, RepDashboardStats, DirectiveRow, CustomerInventoryItem } from '../types';

interface RepDashboardProps {
  visits: RepVisit[];
  onNavigate: (view: string) => void;
  onStartVisit: (visit: RepVisit) => void;
  repStats: RepDashboardStats;
  directives?: DirectiveRow[];
  onAcknowledgeDirective: (id: string) => void;
  customerInventory?: CustomerInventoryItem[];
}

export default function RepDashboard({
  visits,
  onNavigate,
  onStartVisit,
  repStats,
  directives = [],
  onAcknowledgeDirective,
  customerInventory = [],
}: RepDashboardProps) {
  const nextVisit = visits.find(v => v.status === 'pending' || v.status === 'next') || visits[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="fade-up">
        <p className="text-xs font-bold text-navy-400 tracking-wider uppercase">Wednesday · May 13, 2026</p>
        <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-ink">
          Good morning, <span className="gradient-text">Adaeze</span>
        </h2>
        <p className="text-sm text-navy-500 mt-1">You have {repStats.remaining} visits left today across V.I. and Lekki</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { l: 'Visits Today', v: `${repStats.completed}/${repStats.planned}`, d: `${repStats.completionPct}% complete`, c: 'leaf' },
          { l: 'Orders Placed', v: `₦${repStats.ordersValue}`, d: `${repStats.ordersCount} orders`, c: 'navy' },
          { l: 'My Q2 Target', v: '87%', d: 'on track', c: 'leaf' },
          { l: 'Coverage Score', v: 'A+', d: 'Top quartile', c: 'leaf' },
        ].map((k, i) => (
          <div key={i} className={`fade-up stagger-${i + 1} p-4 sm:p-5 rounded-2xl bg-white border border-navy-100`}>
            <p className="stat-label text-navy-400">{k.l}</p>
            <p className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">{k.v}</p>
            <p className={`text-[11px] font-semibold mt-1 ${k.c === 'leaf' ? 'text-leaf-700' : 'text-navy-600'}`}>{k.d}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="fade-up relative p-5 sm:p-6 rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(120deg, #0F2147 0%, #142A5A 50%, #1a3a6e 100%)' }}>
            <div className="absolute inset-0 ai-shimmer" />
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full" style={{ background: 'radial-gradient(circle, rgba(91, 183, 73, 0.25) 0%, transparent 70%)' }} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-leaf-500 flex items-center justify-center">
                  <Icon name="sparkles" size={16} className="text-white" />
                </div>
                <p className="text-[10px] font-bold text-leaf-300 tracking-[0.2em] uppercase">AI Coach · Next Best Action</p>
              </div>
              <h3 className="font-display text-white text-xl sm:text-2xl font-bold leading-tight">
                Start with <span className="text-leaf-300">Lakeshore Specialist Hospital</span>
              </h3>
              <p className="text-sm text-white/80 mt-2">
                Dr. Adebayo is on shift until 11am. Coflin RX uptake from last visit jumped 37%. High likelihood of restock order today.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-full bg-white/10 text-leaf-300 text-[10px] font-bold border border-leaf-500/30">+₦340k expected</span>
                <span className="px-2.5 py-1 rounded-full bg-white/10 text-white text-[10px] font-bold">1.2 km away</span>
                <span className="px-2.5 py-1 rounded-full bg-white/10 text-white text-[10px] font-bold">High priority</span>
              </div>
              <button onClick={() => onStartVisit(nextVisit)} className="mt-5 px-4 py-2.5 rounded-lg bg-leaf-500 text-white text-sm font-display font-semibold btn-press hover:bg-leaf-600 flex items-center gap-2">
                Start visit <Icon name="arrowRight" size={14} />
              </button>
            </div>
          </div>

          <div className="fade-up stagger-1 rounded-2xl bg-white border border-navy-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between">
              <h3 className="font-display font-bold text-ink">Upcoming Visits</h3>
              <button onClick={() => onNavigate('rep-plan')} className="text-xs font-semibold text-leaf-700 hover:text-leaf-800">See all →</button>
            </div>
            <div className="divide-y divide-navy-50">
              {visits.slice(0, 4).map(v => (
                <button key={v.id} onClick={() => onStartVisit(v)} className="w-full px-5 py-3 hover:bg-paper transition-colors flex items-center gap-3 text-left btn-press">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-xs flex-shrink-0 ${
                    v.status === 'done' ? 'bg-leaf-500 text-white' : v.status === 'next' ? 'bg-navy-700 text-white' : 'bg-navy-100 text-navy-700'
                  }`}>
                    {v.status === 'done' ? <Icon name="check" size={14} strokeWidth={3} /> : v.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-sm text-ink truncate">{v.name}</p>
                    <p className="text-[11px] text-navy-500 truncate">{v.contact} · {v.time} · {v.dist} km</p>
                  </div>
                  {v.priority === 'high' && <span className="px-1.5 py-0.5 rounded bg-leaf-50 text-leaf-700 text-[9px] font-bold">HIGH</span>}
                  {v.status !== 'done' && <Icon name="chevronRight" size={16} className="text-navy-300" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="fade-up stagger-2 rounded-2xl bg-white border border-navy-100 p-5">
            <h3 className="font-display font-bold text-ink text-sm mb-3">Today's Progress</h3>
            <div className="space-y-3">
              {[
                { l: 'Visits', val: repStats.completed, max: repStats.planned, c: 'leaf' },
                { l: 'Samples Given', val: 14, max: 30, c: 'navy' },
                { l: 'Detailing Calls', val: 6, max: 10, c: 'leaf' },
                { l: 'Orders Closed', val: repStats.ordersCount, max: 6, c: 'leaf' },
              ].map(s => (
                <div key={s.l}>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xs font-medium text-navy-700">{s.l}</span>
                    <span className="font-mono text-xs text-navy-500">{s.val}/{s.max}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-navy-100 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${s.c === 'leaf' ? 'bg-leaf-500' : 'bg-navy-700'}`} style={{ width: `${(s.val / s.max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="fade-up stagger-3 rounded-2xl bg-white border border-navy-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-ink text-sm">My Focus Products</h3>
              <span className="px-2 py-0.5 rounded-full bg-leaf-50 text-leaf-700 text-[9px] font-bold">Q2</span>
            </div>
            <div className="space-y-2">
              {[
                { n: 'Coflin Forte 600mg', t: 'Mucolytic · RX', focus: true, v: '47/80' },
                { n: 'Astrazon 10mg', t: 'Antihistamine', focus: false, v: '22/50' },
                { n: 'Tuxil-N Syrup', t: 'OTC · Cough', focus: false, v: '18/30' },
              ].map((p, i) => (
                <div key={i} className={`p-2.5 rounded-lg ${p.focus ? 'bg-leaf-50 border border-leaf-200' : 'bg-paper'}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg ${p.focus ? 'bg-leaf-500' : 'bg-navy-100'} flex items-center justify-center flex-shrink-0`}>
                      <Icon name="pill" size={14} className={p.focus ? 'text-white' : 'text-navy-700'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-xs text-ink truncate">{p.n}</p>
                      <p className="text-[10px] text-navy-500">{p.t}</p>
                    </div>
                    <p className="font-mono text-[10px] font-bold text-navy-700">{p.v}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="fade-up stagger-4 rounded-2xl bg-white border border-navy-100 p-5">
            <h3 className="font-display font-bold text-ink text-sm mb-3">From Your RSM</h3>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-navy-700 flex items-center justify-center text-white font-display font-bold text-xs flex-shrink-0">TB</div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-ink">Tunde Bakare</p>
                <p className="text-[11px] text-navy-500 mt-0.5">"Strong start this week. Push for institutional close on Lakeshore — they're top tier for Q2."</p>
                <p className="text-[10px] text-navy-400 mt-1.5">15 min ago</p>
              </div>
            </div>
          </div>

          {directives.length > 0 && (
            <div className="fade-up stagger-5 rounded-2xl bg-white border border-navy-100 p-5">
              <h3 className="font-display font-bold text-ink text-sm mb-3">From Your PM</h3>
              {directives.slice(0, 1).map(dir => (
                <div key={dir.id} className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white font-display font-bold text-xs flex-shrink-0">
                      {dir.pm.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-semibold text-ink">{dir.pm}</p>
                        <span className="text-[10px] text-navy-400 font-mono">{dir.date}</span>
                      </div>
                      <p className="text-[11px] font-bold text-violet-700 uppercase tracking-wider mt-0.5">{dir.title}</p>
                      <p className="text-[11px] text-navy-500 mt-1 leading-relaxed bg-violet-50/50 p-2.5 rounded-lg border border-violet-100">"{dir.message}"</p>
                    </div>
                  </div>
                  {!dir.acknowledged ? (
                    <button onClick={() => onAcknowledgeDirective(dir.id)} className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold btn-press flex items-center justify-center gap-1">
                      <Icon name="check" size={12} strokeWidth={3} /> Acknowledge Directive
                    </button>
                  ) : (
                    <div className="w-full py-1.5 bg-leaf-50 text-leaf-700 border border-leaf-200 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1">
                      <Icon name="check" size={12} strokeWidth={3} /> Directive Acknowledged
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="fade-up stagger-6 rounded-2xl bg-white border border-navy-100 p-5">
            <h3 className="font-display font-bold text-ink text-sm mb-3">AI Inventory Alerts</h3>
            <div className="space-y-2">
              {customerInventory.filter(i => i.status === 'Low Stock').slice(0, 2).map(item => (
                <div key={item.id} className="p-2.5 rounded-lg bg-rose-50 border border-rose-100 flex items-start gap-2">
                  <Icon name="alert" size={14} className="text-rose-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-xs text-ink truncate">{item.customer}</p>
                    <p className="text-[10px] text-navy-500 mt-0.5">Low stock on <strong>{item.product}</strong> ({item.stockOnHand} left)</p>
                    <button onClick={() => onNavigate('rep-inventory')} className="text-[10px] font-bold text-rose-700 hover:text-rose-800 mt-1 flex items-center gap-0.5">
                      View details <Icon name="arrowRight" size={10} />
                    </button>
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
