import { useState } from 'react';
import Icon from './Icon';
import DcrPrintModal from './DcrPrintModal';
import { buildDcrRows, sampleTotal, useFieldCall } from '../stores/fieldCall';
import type { IconName, SubmittedDCR } from '../types';

type ReportKey = 'dcr' | 'clinical' | 'intel' | 'trade';

interface ReportSpec {
  k: ReportKey;
  i: IconName;
  l: string;
  s: string;
  c: number;
}

interface ReportsViewProps {
  dcrs?: SubmittedDCR[];
}

const hhmm = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function ReportsView({ dcrs = [] }: ReportsViewProps) {
  const fc = useFieldCall();
  const [active, setActive] = useState<ReportKey>('dcr');
  const [printId, setPrintId] = useState<string | null>(null);
  const [forwarded, setForwarded] = useState<Record<string, boolean>>({});

  const intelRecords = fc.records.filter(r => r.intelCategories.length > 0);

  const reports: ReportSpec[] = [
    { k: 'dcr', i: 'file', l: 'Daily Call Reports', s: 'Auto-generated from visits', c: 148 },
    { k: 'clinical', i: 'flask', l: 'Clinical Meeting Reports', s: 'Outcomes & attendees', c: 42 },
    { k: 'intel', i: 'flag', l: 'Market Intelligence', s: 'Competitor & pricing intel', c: 67 },
    { k: 'trade', i: 'barChart', l: 'Weekly Trade Activity', s: 'Distributor performance', c: 12 },
  ];

  const printing = dcrs.find(d => d.id === printId);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          {reports.map((r, i) => (
            <button
              key={r.k}
              onClick={() => setActive(r.k)}
              aria-pressed={active === r.k}
              className={`fade-up stagger-${i + 1} w-full p-4 rounded-2xl bg-white border card-hover text-left flex items-center gap-3 ${active === r.k ? 'border-navy-400 ring-1 ring-navy-200' : 'border-navy-100'}`}
            >
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
          {active === 'dcr' && (
            <>
              <div className="flex items-center gap-2 px-1">
                <h3 className="font-display font-bold text-ink">Submitted DCRs · Today</h3>
                <span className="px-1.5 rounded bg-leaf-100 text-leaf-700 text-[10px] font-bold">{dcrs.length}</span>
              </div>

              {dcrs.length === 0 && (
                <div className="fade-up rounded-2xl bg-white border border-navy-100 p-8 text-center text-sm text-navy-500">
                  No DCRs submitted yet today. Reps' reports appear here as they submit.
                </div>
              )}

              {dcrs.map((d, di) => {
                const rows = buildDcrRows(d.logs, fc.records, fc.orders);
                const complaints = rows.reduce((n, r) => n + r.complaints.length, 0);
                const signatures = rows.filter(r => r.signed).length;
                return (
                  <div key={d.id} className={`fade-up stagger-${Math.min(di + 1, 4)} rounded-2xl bg-white border ${di === 0 ? 'border-leaf-200' : 'border-navy-100'} overflow-hidden`}>
                    <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        {di === 0 && <div className="w-1.5 h-1.5 rounded-full bg-leaf-500 pulse-dot" />}
                        <div>
                          <h3 className="font-display font-bold text-ink">{d.rep}</h3>
                          <p className="text-[11px] text-navy-500">Submitted {d.submittedAt} · Auto-compiled</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setPrintId(d.id)}
                          className="px-3 py-1.5 rounded-lg border border-navy-200 text-xs font-bold text-navy-700 hover:bg-paper btn-press flex items-center gap-1.5"
                        >
                          <Icon name="file" size={12} /> Open DCR form
                        </button>
                        <button
                          onClick={() => setForwarded(prev => ({ ...prev, [d.id]: true }))}
                          disabled={forwarded[d.id]}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold btn-press flex items-center gap-1.5 ${forwarded[d.id] ? 'bg-leaf-100 text-leaf-700' : 'bg-navy-700 text-white'}`}
                        >
                          <Icon name={forwarded[d.id] ? 'check' : 'send'} size={12} /> {forwarded[d.id] ? 'Forwarded to DM' : 'Forward'}
                        </button>
                      </div>
                    </div>

                    <div className="p-5 space-y-5">
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-4">
                        <div className="p-3 rounded-xl bg-paper"><p className="stat-label text-navy-400">Visits</p><p className="font-display text-xl font-bold text-ink mt-0.5">{d.visitsCompleted}</p></div>
                        <div className="p-3 rounded-xl bg-paper"><p className="stat-label text-navy-400">Orders</p><p className="font-display text-xl font-bold text-leaf-700 mt-0.5">{d.ordersToday}</p></div>
                        <div className="p-3 rounded-xl bg-paper"><p className="stat-label text-navy-400">Samples</p><p className="font-display text-xl font-bold text-ink mt-0.5">{d.samples ?? 0}</p></div>
                        <div className="p-3 rounded-xl bg-paper"><p className="stat-label text-navy-400">Complaints</p><p className={`font-display text-xl font-bold mt-0.5 ${complaints ? 'text-rose-700' : 'text-ink'}`}>{complaints}</p></div>
                        <div className="p-3 rounded-xl bg-paper"><p className="stat-label text-navy-400">Signed</p><p className="font-display text-xl font-bold text-ink mt-0.5">{signatures}</p></div>
                      </div>

                      {d.logs.length > 0 && (
                        <div>
                          <p className="stat-label text-navy-400 mb-3">Visit Log</p>
                          <div className="space-y-2">
                            {d.logs.map((l, i) => {
                              const r = buildDcrRows([l], fc.records, fc.orders)[0];
                              const extras = [
                                r.samples ? `${r.samples} samples` : '',
                                r.intel ? `Intel: ${r.intel}` : '',
                                r.complaints.length ? `Complaint ${r.complaints.join(', ')}` : '',
                                r.signed ? 'Signed' : '',
                              ].filter(Boolean).join(' · ');
                              return (
                                <div key={l.id} className="flex items-start gap-3">
                                  <div className="font-mono text-[11px] text-navy-500 font-bold w-12 flex-shrink-0 pt-1">{hhmm(l.timestamp)}</div>
                                  <div className="w-2 h-2 rounded-full bg-leaf-500 mt-2 flex-shrink-0 relative">
                                    {i < d.logs.length - 1 && <div className="absolute top-2 left-1/2 -translate-x-1/2 w-px h-7 bg-navy-200" />}
                                  </div>
                                  <div className="flex-1 min-w-0 pb-3">
                                    <p className="font-display font-semibold text-sm text-ink truncate">{l.hcpName} · {l.institution}</p>
                                    <p className="text-[11px] text-navy-500 truncate">{l.productsDiscussed.join(', ') || 'No products detailed'}</p>
                                    {extras && <p className="text-[11px] text-navy-700 font-medium truncate">{extras}</p>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {d.aiSummary && (
                        <div className="p-4 rounded-xl border border-navy-200 bg-navy-50">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon name="sparkles" size={14} className="text-leaf-700" />
                            <p className="text-[10px] font-bold text-leaf-700 tracking-wider uppercase">AI Summary</p>
                          </div>
                          <p className="text-xs text-navy-700 leading-relaxed">{d.aiSummary}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {active === 'intel' && (
            <div className="fade-up rounded-2xl bg-white border border-navy-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-navy-100">
                <h3 className="font-display font-bold text-ink">Market intel from calls</h3>
                <p className="text-[11px] text-navy-500">Tagged by the rep during the visit</p>
              </div>
              {intelRecords.length === 0 ? (
                <p className="p-8 text-center text-sm text-navy-500">No tagged intel yet.</p>
              ) : (
                <div className="divide-y divide-navy-50">
                  {intelRecords.map(r => (
                    <div key={r.logId} className="px-5 py-3 flex items-center justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">{r.institution}</p>
                        <p className="text-[11px] text-navy-500">{r.repName} · {r.hcpName}{sampleTotal(r.samples) ? ` · ${sampleTotal(r.samples)} samples` : ''}</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {r.intelCategories.map(c => (
                          <span key={c} className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 text-[10px] font-bold">{c}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {(active === 'clinical' || active === 'trade') && (
            <div className="fade-up rounded-2xl bg-white border border-navy-100 p-8 text-center">
              <Icon name={active === 'clinical' ? 'flask' : 'barChart'} size={24} className="text-navy-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-ink">{active === 'clinical' ? '42 clinical meeting reports this quarter' : '12 weekly trade activity reports this quarter'}</p>
              <p className="text-xs text-navy-500 mt-1">{active === 'clinical' ? 'Open a meeting from Clinical to see its report.' : 'Distributor reports are compiled every Friday at 18:00.'}</p>
            </div>
          )}
        </div>
      </div>

      {printing && (
        <DcrPrintModal
          repName={printing.rep}
          territory={printing.rep === 'Chinedu Eze' ? 'Lagos · Ikeja Cluster' : 'Lagos · V.I. / Lekki Cluster'}
          date={new Date().toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          submittedAt={printing.submittedAt}
          managerName="Tunde Bakare"
          rows={buildDcrRows(printing.logs, fc.records, fc.orders)}
          ordersCount={printing.ordersToday}
          onClose={() => setPrintId(null)}
        />
      )}
    </div>
  );
}
