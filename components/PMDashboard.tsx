import Icon from './Icon';
import type { ClinicalMeetingRow, CustomerInventoryItem, AccompanimentRow } from '../types';

interface PMDashboardProps {
  onNavigate: (view: string) => void;
  clinicalMeetings: ClinicalMeetingRow[];
  customerInventory?: CustomerInventoryItem[];
  accompaniments?: AccompanimentRow[];
}

export default function PMDashboard({
  onNavigate,
  clinicalMeetings,
  customerInventory = [],
  accompaniments = [],
}: PMDashboardProps) {
  const pendingCMs = clinicalMeetings ? clinicalMeetings.filter(c => c.s === 'pm-review').length : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="fade-up">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold tracking-wider uppercase">Product Manager</span>
              <span className="text-xs text-navy-500">Respiratory Portfolio</span>
            </div>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-ink">
              <span style={{ background: 'linear-gradient(135deg, #142A5A 0%, #8B5CF6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Coflin Forte</span> is having a great week
            </h2>
            <p className="text-sm text-navy-500 mt-1">+37% MoM uptake · 89 reps actively detailing · You report to MM Institution</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onNavigate('pm-directives')} className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold btn-press flex items-center gap-1.5 shadow-lg shadow-violet-600/20">
              <Icon name="send" size={14} /> Push Directive
            </button>
            <button onClick={() => onNavigate('pm-field')} className="px-4 py-2 rounded-xl bg-white border border-navy-200 text-navy-700 hover:bg-paper text-xs font-bold btn-press flex items-center gap-1.5 shadow-sm">
              <Icon name="location" size={14} /> Log Shadow Visit
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { l: 'Coflin Volume', v: '₦8.2M', d: '+37% MoM', c: 'violet' },
          { l: 'Tuxil-N Volume', v: '₦3.4M', d: '−4% MoM', c: 'amber' },
          { l: 'Detailing Adoption', v: '89/142', d: '63% of reps', c: 'violet' },
          { l: 'CME Approvals', v: pendingCMs.toString(), d: 'awaiting your review', c: 'amber' },
        ].map((k, i) => (
          <div key={i} className={`fade-up stagger-${i + 1} p-4 sm:p-5 rounded-2xl bg-white border border-navy-100`}>
            <p className="stat-label text-navy-400">{k.l}</p>
            <p className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">{k.v}</p>
            <p className={`text-[11px] font-semibold mt-1 ${k.c === 'violet' ? 'text-violet-700' : k.c === 'amber' ? 'text-amber-700' : 'text-navy-500'}`}>{k.d}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="fade-up rounded-2xl bg-white border border-navy-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-navy-100">
              <h3 className="font-display font-bold text-ink">My Product Portfolio</h3>
              <p className="text-xs text-navy-500 mt-0.5">Respiratory Care · National view</p>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { n: 'Coflin Forte 600mg', cat: 'Mucolytic · RX', vol: '₦8.2M', g: 37, reps: 89, regions: 'All 6', star: true },
                { n: 'Tuxil-N Syrup 100ml', cat: 'Cough · OTC', vol: '₦3.4M', g: -4, reps: 42, regions: '4 of 6', star: false },
              ].map((p, i) => (
                <div key={i} className={`p-4 rounded-xl border-2 ${p.star ? 'border-violet-200 bg-violet-50/30' : 'border-navy-100 bg-paper'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg ${p.star ? 'bg-violet-500' : 'bg-navy-200'} flex items-center justify-center`}>
                      <Icon name="pill" size={18} className="text-white" />
                    </div>
                    {p.star && <span className="px-2 py-0.5 rounded-full bg-violet-500 text-white text-[9px] font-bold">STAR</span>}
                  </div>
                  <p className="font-display font-bold text-base text-ink">{p.n}</p>
                  <p className="text-[11px] text-navy-500">{p.cat}</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 pt-3 border-t border-navy-100">
                    <div>
                      <p className="text-[9px] text-navy-400 font-bold tracking-wider uppercase">Volume</p>
                      <p className="font-mono text-sm font-bold text-ink">{p.vol}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-navy-400 font-bold tracking-wider uppercase">Growth</p>
                      <p className={`font-mono text-sm font-bold ${p.g > 0 ? 'text-leaf-700' : 'text-rose-600'}`}>{p.g > 0 ? '+' : ''}{p.g}%</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-navy-400 font-bold tracking-wider uppercase">Reps</p>
                      <p className="font-mono text-sm font-bold text-ink">{p.reps}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="fade-up stagger-1 rounded-2xl bg-white border border-navy-100 p-5">
            <h3 className="font-display font-bold text-ink mb-4">Territory Adoption · Coflin Forte</h3>
            <div className="space-y-3">
              {[
                { r: 'Lagos', pct: 92, vol: '₦3.2M' },
                { r: 'South-West', pct: 78, vol: '₦1.8M' },
                { r: 'South-East', pct: 64, vol: '₦1.4M' },
                { r: 'North-Central', pct: 54, vol: '₦1.1M' },
                { r: 'South-South', pct: 48, vol: '₦0.5M' },
                { r: 'North-West', pct: 32, vol: '₦0.2M' },
              ].map(t => (
                <div key={t.r}>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xs font-medium text-navy-700">{t.r}</span>
                    <span className="font-mono text-xs"><span className="text-navy-500">{t.pct}%</span> · <span className="font-bold text-violet-700">{t.vol}</span></span>
                  </div>
                  <div className="h-2 rounded-full bg-navy-100 overflow-hidden">
                    <div className="h-full rounded-full bg-violet-500" style={{ width: `${t.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="fade-up stagger-2 relative p-5 rounded-2xl overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, #4C1D95 0%, #8B5CF6 100%)' }}>
            <div className="absolute inset-0 ai-shimmer" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-sm">
                  <Icon name="flag" size={16} className="text-white" />
                </div>
                <p className="text-[10px] font-bold text-violet-200 tracking-[0.2em] uppercase">Competitor Signal</p>
              </div>
              <h3 className="font-display text-lg font-bold leading-tight">GSK Augmentin promo detected</h3>
              <p className="text-sm text-white/80 mt-2">5 reps reported 15% trade discount on Augmentin in last 48hrs. May pressure Astrazon conversion.</p>
              <div className="mt-3 p-3 rounded-xl bg-white/10 border border-white/10">
                <p className="text-[10px] font-bold text-violet-200 tracking-wider uppercase mb-1">Affected Regions</p>
                <div className="flex flex-wrap gap-1">
                  {['Lagos VI', 'Lekki', 'Ikoyi', 'Yaba', 'Surulere'].map(r => (
                    <span key={r} className="px-2 py-0.5 rounded bg-white/15 text-[10px] font-medium">{r}</span>
                  ))}
                </div>
              </div>
              <button onClick={() => onNavigate('pm-materials')} className="mt-4 px-3 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-bold btn-press flex items-center gap-1.5 backdrop-blur-sm">
                Push counter-detail brief <Icon name="arrowRight" size={12} />
              </button>
            </div>
          </div>

          {pendingCMs > 0 && (
            <div className="fade-up stagger-3 rounded-2xl bg-amber-50 border border-amber-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="clock" size={14} className="text-amber-700" />
                <p className="text-[10px] font-bold text-amber-700 tracking-wider uppercase">{pendingCMs} CME Pending</p>
              </div>
              <p className="text-xs text-navy-700 leading-relaxed">Reps are waiting for your approval on clinical meeting requests for your portfolio.</p>
              <button onClick={() => onNavigate('pm-clinical')} className="mt-2 text-xs font-bold text-amber-700 flex items-center gap-1">
                Review requests <Icon name="arrowRight" size={12} />
              </button>
            </div>
          )}

          <div className="fade-up stagger-4 rounded-2xl bg-white border border-navy-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-ink text-sm">Latest Materials</h3>
              <button onClick={() => onNavigate('pm-materials')} className="text-[11px] font-semibold text-violet-700">Library →</button>
            </div>
            <div className="space-y-2">
              {[
                { n: 'Coflin Paediatric Guide', t: 'PDF · v2.1 · Today', new: true },
                { n: 'Coflin Clinical Trial Brief', t: 'PDF · 12 pages', new: false },
                { n: 'Tuxil-N OTC Detailing', t: 'PPT · 18 slides', new: false },
              ].map((m, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-paper">
                  <Icon name="file" size={14} className="text-violet-700" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-ink truncate">{m.n}</p>
                      {m.new && <span className="px-1 py-0 rounded bg-violet-100 text-violet-700 text-[8px] font-bold">NEW</span>}
                    </div>
                    <p className="text-[10px] text-navy-500">{m.t}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="fade-up stagger-5 rounded-2xl bg-white border border-navy-100 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-ink text-sm">Customer Stock Insights</h3>
              <button onClick={() => onNavigate('pm-inventory')} className="text-[11px] font-semibold text-violet-700">View All →</button>
            </div>
            <div className="space-y-2">
              {customerInventory.filter(i => i.status === 'Low Stock').slice(0, 2).map(item => (
                <div key={item.id} className="p-3 rounded-xl bg-violet-50 border border-violet-100 text-xs">
                  <p className="font-bold text-ink">{item.customer}</p>
                  <p className="text-navy-500 mt-0.5">Low stock on {item.product} ({item.stockOnHand} left)</p>
                  <p className="text-[11px] text-violet-700 font-semibold mt-1">{item.recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="fade-up stagger-6 rounded-2xl bg-white border border-navy-100 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-ink text-sm">Field Shadow Visits</h3>
              <button onClick={() => onNavigate('pm-field')} className="text-[11px] font-semibold text-violet-700">Logs →</button>
            </div>
            <div className="space-y-2">
              {accompaniments.slice(0, 2).map(a => (
                <div key={a.id} className="p-3 rounded-xl bg-paper border border-navy-100 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-ink">
                    <span>{a.rep}</span>
                    <span className="font-mono text-[9px] text-navy-400 font-normal">{a.date}</span>
                  </div>
                  <p className="text-navy-500 text-[10px]">Shadowed {a.visitsShadowed} visits in {a.territory}</p>
                  <p className="text-navy-700 italic truncate">"{a.notes}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
