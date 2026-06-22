import Icon from './Icon';
import type { IconName, SubmittedDCR } from '../types';

interface ReportSpec {
  i: IconName;
  l: string;
  s: string;
  c: number;
}

interface ReportsViewProps {
  dcrs?: SubmittedDCR[];
}

export default function ReportsView({ dcrs = [] }: ReportsViewProps) {
  const reports: ReportSpec[] = [
    { i: 'file', l: 'Daily Call Reports', s: 'Auto-generated from visits', c: 148 },
    { i: 'flask', l: 'Clinical Meeting Reports', s: 'Outcomes & attendees', c: 42 },
    { i: 'flag', l: 'Market Intelligence', s: 'Competitor & pricing intel', c: 67 },
    { i: 'barChart', l: 'Weekly Trade Activity', s: 'Distributor performance', c: 12 },
  ];

  const visitLog = [
    { t: '08:42', n: 'Day Started', loc: 'Yaba · GPS verified' },
    { t: '10:04', n: 'Lakeshore Specialist Hospital', loc: 'Dr. T. Adebayo · Coflin detailed' },
    { t: '11:32', n: 'MedPlus — Yaba', loc: 'Mrs. F. Eze · 50 packs ordered' },
    { t: '13:18', n: 'St. Nicholas Hospital', loc: 'Dr. C. Okonkwo · Astrazon detailed' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          {reports.map((r, i) => (
            <button key={i} className={`fade-up stagger-${i + 1} w-full p-4 rounded-2xl bg-white border border-navy-100 card-hover text-left flex items-center gap-3`}>
              <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0">
                <Icon name={r.i} size={18} className="text-navy-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-sm text-ink">{r.l}</p>
                <p className="text-[11px] text-navy-500">{r.s}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-lg font-bold text-leaf-700">{r.c}</p>
                <p className="text-[9px] text-navy-400 font-mono">THIS QTR</p>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2 space-y-6">
        {dcrs.length > 0 && (
          <div className="fade-up rounded-2xl bg-white border border-leaf-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-navy-100 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-leaf-500 pulse-dot" />
              <h3 className="font-display font-bold text-ink">Submitted DCRs · Today</h3>
              <span className="px-1.5 rounded bg-leaf-100 text-leaf-700 text-[10px] font-bold">{dcrs.length} new</span>
            </div>
            <div className="divide-y divide-navy-100">
              {dcrs.map(d => (
                <div key={d.id} className="px-5 py-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="font-display font-bold text-sm text-ink">{d.rep}</p>
                    <p className="text-[11px] text-navy-500 font-mono">Submitted {d.submittedAt}</p>
                  </div>
                  <p className="text-[11px] text-navy-500 mt-0.5">{d.visitsCompleted} visits done · {d.ordersToday} order(s) · {d.logs.length} logged</p>
                  {d.logs.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {d.logs.map(l => (
                        <div key={l.id} className="flex items-start gap-2.5">
                          <span className="font-mono text-[10px] text-navy-500 font-bold w-12 flex-shrink-0 pt-0.5">{new Date(l.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-display font-semibold text-xs text-ink truncate">{l.hcpName} · {l.institution}</p>
                            <p className="text-[10px] text-navy-500 truncate">{l.productsDiscussed.join(', ') || 'No products'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="fade-up stagger-2 rounded-2xl bg-white border border-navy-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-display font-bold text-ink">Daily Call Report Preview</h3>
              <p className="text-[11px] text-navy-500">Adaeze Okafor · Today · Auto-generated</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button className="px-3 py-1.5 rounded-lg border border-navy-200 text-xs font-bold text-navy-700 hover:bg-paper btn-press flex items-center gap-1.5">
                <Icon name="download" size={12} /> Export
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-navy-700 text-white text-xs font-bold btn-press flex items-center gap-1.5">
                <Icon name="send" size={12} /> Send
              </button>
            </div>
          </div>

          <div className="p-5 space-y-5">
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="p-3 rounded-xl bg-paper"><p className="stat-label text-navy-400">Visits</p><p className="font-display text-xl font-bold text-ink mt-0.5">3 / 8</p></div>
              <div className="p-3 rounded-xl bg-paper"><p className="stat-label text-navy-400">Orders</p><p className="font-display text-xl font-bold text-leaf-700 mt-0.5">₦438k</p></div>
              <div className="p-3 rounded-xl bg-paper"><p className="stat-label text-navy-400">Samples</p><p className="font-display text-xl font-bold text-ink mt-0.5">24</p></div>
            </div>

            <div>
              <p className="stat-label text-navy-400 mb-3">Visit Log</p>
              <div className="space-y-2">
                {visitLog.map((v, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="font-mono text-[11px] text-navy-500 font-bold w-12 flex-shrink-0 pt-1">{v.t}</div>
                    <div className="w-2 h-2 rounded-full bg-leaf-500 mt-2 flex-shrink-0 relative">
                      {i < 3 && <div className="absolute top-2 left-1/2 -translate-x-1/2 w-px h-7 bg-navy-200" />}
                    </div>
                    <div className="flex-1 min-w-0 pb-3">
                      <p className="font-display font-semibold text-sm text-ink">{v.n}</p>
                      <p className="text-[11px] text-navy-500">{v.loc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-navy-200 bg-navy-50">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="sparkles" size={14} className="text-leaf-700" />
                <p className="text-[10px] font-bold text-leaf-700 tracking-wider uppercase">AI Summary</p>
              </div>
              <p className="text-xs text-navy-700 leading-relaxed">
                Strong morning. Adaeze focused on institutional accounts in V.I. with 100% Coflin focus. Recommend afternoon push to remaining pharmacy stops in Lekki. Tracking 87% target attainment for the day.
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
