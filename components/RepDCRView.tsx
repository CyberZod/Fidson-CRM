import { useState } from 'react';
import Icon from './Icon';
import DcrPrintModal from './DcrPrintModal';
import { MyComplaints } from './ComplaintsView';
import { todayLong } from '../utils/dates';
import { buildDcrRows, useFieldCall } from '../stores/fieldCall';
import type { VisitLog } from '../types';

// What the DCR adds up from the field-call store; App puts it on the submitted DCR.
export interface DcrSubmitSummary {
  samples: number;
  complaints: number;
  signatures: number;
}

interface RepDCRViewProps {
  visitsCompleted: number;
  ordersToday: number;
  visitLogs?: VisitLog[];
  repName?: string;
  territory?: string;
  onSubmit?: (summary: DcrSubmitSummary) => void;
}

const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function RepDCRView({
  visitsCompleted,
  ordersToday,
  visitLogs = [],
  repName = 'Adaeze Okafor',
  territory = 'Lagos · V.I. / Lekki Cluster',
  onSubmit,
}: RepDCRViewProps) {
  const fc = useFieldCall();
  const [submitted, setSubmitted] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);

  const today = new Date().toDateString();
  const todaysLogs = visitLogs.filter(l => new Date(l.timestamp).toDateString() === today);
  const rows = buildDcrRows(todaysLogs, fc.records, fc.orders);
  const samples = fc.samplesIssued(repName, todaysLogs.map(l => l.id));
  const complaints = rows.reduce((n, r) => n + r.complaints.length, 0);
  const signatures = rows.filter(r => r.signed).length;

  const stats = [
    { l: 'Visits Done', v: visitsCompleted.toString() },
    { l: 'Orders Placed', v: ordersToday.toString() },
    { l: 'Samples Given', v: samples.toString() },
    { l: 'Distance Driven', v: '18 km' },
  ];

  // Real logged visits if any, else the seeded example timeline.
  const timeline = todaysLogs.length > 0
    ? todaysLogs.map(l => {
        const r = buildDcrRows([l], fc.records, fc.orders)[0];
        const extras = [
          r && r.samples > 0 ? `${r.samples} samples` : '',
          r?.intel ? `Intel: ${r.intel}` : '',
          r && r.complaints.length ? `Complaint ${r.complaints.join(', ')}` : '',
          r?.signed ? 'Signed' : '',
        ].filter(Boolean);
        return {
          t: fmtTime(l.timestamp),
          n: `${l.hcpName} · ${l.institution}`,
          loc: `${l.specialty || l.hcpType} · ${l.productsDiscussed.join(', ') || 'No products'}`,
          extra: extras.join(' · '),
        };
      }).reverse()
    : [
        { t: '08:42', n: 'Day Started', loc: 'Yaba · GPS verified · Itinerary approved', extra: '' },
        { t: '10:04', n: 'Lakeshore Specialist Hospital', loc: 'Dr. T. Adebayo · Coflin Forte detailed · ₦438k order placed', extra: '' },
        { t: '11:32', n: 'MedPlus · Yaba', loc: 'Mrs. F. Eze · 50 packs Tuxil-N ordered', extra: '' },
        { t: '13:18', n: 'St. Nicholas Hospital', loc: 'Dr. C. Okonkwo · Astrazon detailed · Sample left', extra: '' },
      ];

  const handleSubmit = () => {
    onSubmit?.({ samples, complaints, signatures });
    setSubmitted(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto space-y-4">
      <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden fade-up">
        <div className="px-5 sm:px-6 py-5 border-b border-navy-100 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">Daily Call Report</p>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-ink mt-1">{todayLong()}</h2>
            <p className="text-xs text-navy-500 mt-1">{repName} · Auto-generated from visits & orders</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPrintOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-navy-200 text-xs font-bold text-navy-700 hover:bg-paper btn-press flex items-center gap-1.5"
            >
              <Icon name="download" size={12} /> Export PDF
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitted}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold btn-press flex items-center gap-1.5 ${submitted ? 'bg-leaf-100 text-leaf-700' : 'bg-navy-700 text-white'}`}
            >
              <Icon name={submitted ? 'check' : 'send'} size={12} /> {submitted ? 'Submitted to RSM' : 'Submit to RSM'}
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map(s => (
              <div key={s.l} className="p-3 rounded-xl bg-paper">
                <p className="stat-label text-navy-400">{s.l}</p>
                <p className="font-display text-2xl font-bold text-ink mt-1">{s.v}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="stat-label text-navy-400 mb-3">Visit Timeline</p>
            <div className="space-y-1">
              {timeline.map((v, i) => (
                <div key={i} className="flex items-start gap-3 p-2 hover:bg-paper rounded-lg">
                  <div className="font-mono text-[11px] text-navy-500 font-bold w-12 flex-shrink-0 pt-1">{v.t}</div>
                  <div className="w-2 h-2 rounded-full bg-leaf-500 mt-2 flex-shrink-0 relative">
                    {i < timeline.length - 1 && <div className="absolute top-2 left-1/2 -translate-x-1/2 w-px h-8 bg-navy-200" />}
                  </div>
                  <div className="flex-1 min-w-0 pb-3">
                    <p className="font-display font-semibold text-sm text-ink">{v.n}</p>
                    <p className="text-xs text-navy-500 mt-0.5">{v.loc}</p>
                    {v.extra && <p className="text-[11px] text-navy-700 mt-0.5 font-medium">{v.extra}</p>}
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
            <p className="text-sm text-navy-700 leading-relaxed">
              Strong morning. Adaeze focused on institutional accounts in V.I. with 100% Coflin focus. Recommend afternoon push to remaining pharmacy stops in Lekki. Tracking 87% target attainment for the day.
            </p>
          </div>
        </div>
      </div>

      <div className="fade-up stagger-1">
        <MyComplaints repName={repName} />
      </div>

      {printOpen && (
        <DcrPrintModal
          repName={repName}
          territory={territory}
          date={todayLong()}
          submittedAt={submitted ? 'Today' : undefined}
          managerName="Tunde Bakare"
          rows={rows}
          ordersCount={ordersToday}
          onClose={() => setPrintOpen(false)}
        />
      )}
    </div>
  );
}
