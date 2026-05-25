import Icon from './Icon';
import type { ApprovalItem, DashboardStats } from '../types';

interface DashboardViewProps {
  approvals: ApprovalItem[];
  onOpenApproval: (item: ApprovalItem) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  dashboardStats: DashboardStats;
}

interface KpiCard {
  l: string;
  v: string;
  d: string;
  trend: 'up' | 'down' | 'flat';
  color: 'leaf' | 'navy' | 'amber';
  chart: number[];
}

export default function DashboardView({ approvals, onOpenApproval, onApprove, dashboardStats }: DashboardViewProps) {
  const kpis: KpiCard[] = [
    { l: 'Team Coverage', v: '78%', d: '+5% vs yesterday', trend: 'up', color: 'leaf', chart: [40, 55, 52, 68, 72, 75, 78] },
    { l: 'Pipeline Value', v: '₦42.3M', d: '96 active orders', trend: 'up', color: 'navy', chart: [28, 32, 35, 40, 38, 42, 42] },
    { l: 'Q2 Attainment', v: '87%', d: 'on track', trend: 'up', color: 'leaf', chart: [55, 62, 68, 72, 78, 82, 87] },
    {
      l: 'Pending Approvals',
      v: dashboardStats.pendingCount.toString(),
      d: dashboardStats.pendingCount > 0 ? `${dashboardStats.pendingCount === 1 ? 'item' : 'items'} waiting` : 'all clear',
      trend: 'flat',
      color: dashboardStats.pendingCount > 0 ? 'amber' : 'leaf',
      chart: [2, 1, 3, 2, 4, 3, 3],
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="fade-up">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-navy-400 tracking-wider uppercase">Lagos Region · Q2 FY26</p>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-ink">
              Welcome back, <span className="gradient-text">Tunde</span>
            </h2>
            <p className="text-sm text-navy-500 mt-1">Your team has 4 active reps in the field right now</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 rounded-lg border border-navy-100 bg-white text-xs font-semibold text-navy-700 flex items-center gap-1.5 btn-press">
              <Icon name="download" size={14} /> Export
            </button>
            <button className="px-3 py-2 rounded-lg bg-navy-700 text-white text-xs font-semibold flex items-center gap-1.5 btn-press">
              <Icon name="send" size={14} /> Push to DM
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((k, i) => (
          <div key={i} className={`fade-up stagger-${i + 1} relative p-4 sm:p-5 rounded-2xl bg-white border border-navy-100 card-hover overflow-hidden`}>
            <p className="stat-label text-navy-400">{k.l}</p>
            <p className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">{k.v}</p>
            <div className="flex items-center gap-1 mt-2">
              {k.trend === 'up' && <Icon name="arrowUp" size={12} className={k.color === 'leaf' ? 'text-leaf-600' : k.color === 'amber' ? 'text-amber-600' : 'text-navy-600'} />}
              <p className={`text-[11px] font-semibold ${k.color === 'leaf' ? 'text-leaf-700' : k.color === 'amber' ? 'text-amber-700' : 'text-navy-600'}`}>{k.d}</p>
            </div>
            <svg className="sparkline absolute bottom-2 right-2 opacity-30" width="60" height="24" viewBox="0 0 60 24" preserveAspectRatio="none">
              <path
                d={k.chart.map((v, idx) => `${idx === 0 ? 'M' : 'L'} ${(idx / (k.chart.length - 1)) * 60} ${24 - (v / 100) * 20}`).join(' ')}
                fill="none"
                stroke={k.color === 'leaf' ? '#5BB749' : k.color === 'amber' ? '#D97706' : '#142A5A'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="fade-up relative p-5 sm:p-6 rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(120deg, #0F2147 0%, #142A5A 50%, #1a3a6e 100%)' }}>
            <div className="absolute inset-0 ai-shimmer" />
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full" style={{ background: 'radial-gradient(circle, rgba(91, 183, 73, 0.25) 0%, transparent 70%)' }} />
            <div className="relative">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-leaf-500 flex items-center justify-center">
                    <Icon name="sparkles" size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-leaf-300 tracking-[0.2em] uppercase">AI Forecast Engine</p>
                    <p className="text-white text-sm font-display font-semibold">Lagos region · 28 days out</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-white/10 text-white text-[10px] font-bold border border-white/10">LIVE</span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-4 sm:gap-6">
                <div><p className="font-display text-2xl sm:text-3xl font-bold text-white">94%</p><p className="text-[10px] text-navy-200 mt-0.5 font-medium tracking-wider uppercase">Target<br />Attainment</p></div>
                <div><p className="font-display text-2xl sm:text-3xl font-bold text-leaf-300">+12%</p><p className="text-[10px] text-navy-200 mt-0.5 font-medium tracking-wider uppercase">vs Last<br />Quarter</p></div>
                <div><p className="font-display text-2xl sm:text-3xl font-bold text-white">₦58M</p><p className="text-[10px] text-navy-200 mt-0.5 font-medium tracking-wider uppercase">Projected<br />Revenue</p></div>
              </div>
              <div className="mt-5 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-start gap-2">
                  <Icon name="trending" size={14} className="text-leaf-300 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-white/90 leading-relaxed">
                    <span className="font-bold text-leaf-300">Insight:</span> Coflin Forte demand surging in Lagos Mainland. Recommend pushing 2 additional reps to Apapa zone by EOW to capture +₦4.2M pipeline.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="fade-up stagger-1 rounded-2xl bg-white border border-navy-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-ink">Pending Approvals</h3>
                {approvals.length > 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold">{approvals.length} WAITING</span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-leaf-50 border border-leaf-200 text-leaf-700 text-[10px] font-bold">ALL CLEAR</span>
                )}
              </div>
              <button className="text-xs font-semibold text-leaf-700 hover:text-leaf-800">View all →</button>
            </div>

            {approvals.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-14 h-14 rounded-full bg-leaf-50 mx-auto flex items-center justify-center">
                  <Icon name="check" size={24} className="text-leaf-600" strokeWidth={2.5} />
                </div>
                <p className="mt-3 font-display font-semibold text-ink">All caught up!</p>
                <p className="text-xs text-navy-500 mt-1">No pending approvals right now.</p>
              </div>
            ) : (
              <div className="divide-y divide-navy-50">
                {approvals.map(a => (
                  <div key={a.id} className={`${a.dismissing ? 'slide-out-up' : ''} px-5 py-3 hover:bg-paper transition-colors flex items-center gap-3 sm:gap-4`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${a.type === 'discount' ? 'bg-amber-50 text-amber-700' : 'bg-navy-50 text-navy-700'}`}>
                      <Icon name={a.type === 'discount' ? 'cart' : 'flask'} size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-display font-semibold text-sm text-ink">{a.rep}</p>
                        {a.urgent && <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[9px] font-bold">URGENT</span>}
                      </div>
                      <p className="text-xs text-navy-500 mt-0.5 truncate">{a.detail}</p>
                    </div>
                    <div className="hidden sm:block text-right">
                      <p className="font-mono text-sm font-bold text-ink">{a.amount}</p>
                      <p className="text-[10px] text-navy-400">{a.time}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => onOpenApproval(a)} className="px-3 py-1.5 rounded-lg border border-navy-200 text-xs font-bold text-navy-700 hover:bg-navy-50 btn-press">View</button>
                      <button onClick={() => onApprove(a.id)} className="px-3 py-1.5 rounded-lg bg-leaf-500 text-white text-xs font-bold hover:bg-leaf-600 btn-press">Approve</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="fade-up stagger-2 rounded-2xl bg-white border border-navy-100 p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <h3 className="font-display font-bold text-ink">Pipeline Health · 8 weeks</h3>
                <p className="text-xs text-navy-500 mt-0.5">Order value vs target by week</p>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-navy-700" /><span className="text-navy-700 font-semibold">Actual</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-leaf-200" /><span className="text-navy-700 font-semibold">Target</span></div>
              </div>
            </div>
            <div className="flex items-end gap-1.5 sm:gap-2 h-40 sm:h-48">
              {[{ a: 55, t: 60 }, { a: 62, t: 60 }, { a: 48, t: 65 }, { a: 72, t: 65 }, { a: 68, t: 70 }, { a: 85, t: 70 }, { a: 78, t: 75 }, { a: 92, t: 80 }].map((b, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end gap-0.5 h-full">
                    <div className="flex-1 rounded-t-md bg-navy-700 transition-all hover:bg-navy-800" style={{ height: `${b.a}%` }} />
                    <div className="flex-1 rounded-t-md bg-leaf-200 transition-all hover:bg-leaf-300" style={{ height: `${b.t}%` }} />
                  </div>
                  <span className="text-[10px] font-mono text-navy-400">W{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="fade-up stagger-3 rounded-2xl bg-white border border-navy-100">
            <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-leaf-500 pulse-dot" />
                <h3 className="font-display font-bold text-ink text-sm">Live Field Activity</h3>
              </div>
              <span className="text-[10px] font-bold text-navy-400 font-mono">4 / 12 ACTIVE</span>
            </div>
            <div className="p-3 space-y-1">
              {[
                { n: 'Adaeze Okafor', p: 87, d: '3/8', s: 'live', loc: 'Lakeshore Hospital' },
                { n: 'Chinedu Eze', p: 72, d: '2/7', s: 'live', loc: 'Reddington Hospital' },
                { n: 'Tope Adeola', p: 91, d: '4/9', s: 'live', loc: 'En route' },
                { n: 'Kola Adeniyi', p: 68, d: '2/6', s: 'live', loc: 'MedPlus Apapa' },
                { n: 'Fatima Bello', p: 45, d: '0/5', s: 'offline', loc: 'Not checked in' },
              ].map((r, i) => (
                <button key={i} className="w-full p-2.5 rounded-lg hover:bg-paper transition-colors text-left flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-navy-100 text-navy-700 font-display font-bold text-xs flex items-center justify-center">
                      {r.n.split(' ').map(x => x[0]).join('')}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${r.s === 'live' ? 'bg-leaf-500' : 'bg-navy-300'} ${r.s === 'live' ? 'pulse-dot' : ''}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between">
                      <p className="font-display font-semibold text-xs text-ink truncate">{r.n}</p>
                      <span className="text-[10px] text-navy-400 font-mono ml-2">{r.d}</span>
                    </div>
                    <p className="text-[10px] text-navy-500 truncate">{r.loc}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 rounded-full bg-navy-100 overflow-hidden">
                        <div className={`h-full rounded-full ${r.p > 70 ? 'bg-leaf-500' : r.p > 50 ? 'bg-amber-500' : 'bg-rose-400'}`} style={{ width: `${r.p}%` }} />
                      </div>
                      <span className="text-[10px] text-navy-500 font-mono">{r.p}%</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="fade-up stagger-4 rounded-2xl bg-white border border-navy-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-ink text-sm">Coverage Heatmap</h3>
              <span className="text-[10px] text-navy-400 font-medium">Last 3 weeks</span>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-3">
              {[0.3, 0.5, 0.7, 0.4, 0.8, 0.6, 0.2, 0.5, 0.7, 0.9, 0.6, 0.4, 0.7, 0.5, 0.8, 0.6, 0.9, 0.7, 0.8, 0.5, 0.6].map((intensity, i) => (
                <div key={i} className="aspect-square rounded-sm" style={{
                  backgroundColor: intensity > 0.7 ? '#3B7B2E' : intensity > 0.5 ? '#5BB749' :
                    intensity > 0.3 ? '#9DD685' : intensity > 0.1 ? '#C5E7B5' : '#F0F3FA',
                }} />
              ))}
            </div>
            <div className="flex items-center justify-between text-[10px] text-navy-400">
              <span>Mon</span>
              <div className="flex items-center gap-1">
                <span>Less</span>
                {['#F0F3FA', '#C5E7B5', '#9DD685', '#5BB749', '#3B7B2E'].map(c => (
                  <div key={c} className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c }} />
                ))}
                <span>More</span>
              </div>
              <span>Sun</span>
            </div>
          </div>

          <div className="fade-up stagger-5 rounded-2xl bg-white border border-navy-100 p-5">
            <h3 className="font-display font-bold text-ink text-sm mb-3">Top Products This Quarter</h3>
            <div className="space-y-3">
              {[
                { n: 'Coflin Forte 600mg', cat: 'RX · Mucolytic', v: '₦8.2M', g: 37 },
                { n: 'Astrazon 10mg', cat: 'Antihistamine', v: '₦5.1M', g: 18 },
                { n: 'Tuxil-N Syrup', cat: 'OTC · Cough', v: '₦3.4M', g: -4 },
              ].map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0">
                    <Icon name="pill" size={16} className="text-navy-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-xs text-ink truncate">{p.n}</p>
                    <p className="text-[10px] text-navy-500">{p.cat}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs font-bold text-ink">{p.v}</p>
                    <p className={`text-[10px] font-bold ${p.g > 0 ? 'text-leaf-700' : 'text-rose-600'}`}>{p.g > 0 ? '+' : ''}{p.g}%</p>
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
