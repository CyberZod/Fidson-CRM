import { useMemo } from 'react';
import Icon from './Icon';
import { LEAD_STAGES, STAGE_COLOR, type Lead, type LeadStage } from '../assets/leads';

interface PipelineViewProps {
  leads: Lead[];
  scope?: string;
}

const emptyCounts = (): Record<LeadStage, number> => ({ captured: 0, enriched: 0, consented: 0, nurturing: 0, customer: 0 });

export default function PipelineView({ leads, scope = 'Your reps · this period' }: PipelineViewProps) {
  const total = leads.length;

  const byStage = useMemo(() => {
    const c = emptyCounts();
    leads.forEach(l => { c[l.stage] += 1; });
    return c;
  }, [leads]);

  const customers = byStage.customer;
  const consented = byStage.consented + byStage.nurturing + byStage.customer;
  const conversion = total ? Math.round((customers / total) * 100) : 0;
  const consentRate = total ? Math.round((consented / total) * 100) : 0;

  const byRep = useMemo(() => {
    const map = new Map<string, { rep: string; region: string; total: number; counts: Record<LeadStage, number> }>();
    for (const l of leads) {
      const e = map.get(l.repName) ?? { rep: l.repName, region: l.region, total: 0, counts: emptyCounts() };
      e.total += 1; e.counts[l.stage] += 1;
      map.set(l.repName, e);
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [leads]);

  const byRegion = useMemo(() => {
    const map = new Map<string, { region: string; total: number; customers: number }>();
    for (const l of leads) {
      const e = map.get(l.region) ?? { region: l.region, total: 0, customers: 0 };
      e.total += 1; if (l.stage === 'customer') e.customers += 1;
      map.set(l.region, e);
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [leads]);

  const maxStage = Math.max(1, ...LEAD_STAGES.map(s => byStage[s.key]));

  const stats = [
    { l: 'In Pipeline', v: String(total), d: 'contacts captured to date', c: 'text-navy-500' },
    { l: 'Consent Rate', v: `${consentRate}%`, d: 'lawful basis on record', c: 'text-amber-700' },
    { l: 'Converted', v: String(customers), d: 'now in My Customers', c: 'text-leaf-700' },
    { l: 'Conversion', v: `${conversion}%`, d: 'captured to customer', c: 'text-leaf-700' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1700px] mx-auto space-y-6">
      <div className="fade-up">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">Team Pipeline</h2>
        <p className="text-sm text-navy-500 mt-1">Lead funnel across your field force · {scope}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((k, i) => (
          <div key={i} className={`fade-up stagger-${i + 1} p-4 sm:p-5 rounded-2xl bg-white border border-navy-100`}>
            <p className="stat-label text-navy-400">{k.l}</p>
            <p className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">{k.v}</p>
            <p className={`text-[11px] font-semibold mt-1 ${k.c}`}>{k.d}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Funnel */}
        <div className="lg:col-span-3 rounded-2xl bg-white border border-navy-100 p-5 sm:p-6">
          <h3 className="font-display font-bold text-ink mb-1">Funnel by stage</h3>
          <p className="text-xs text-navy-500 mb-4">Where every captured contact currently sits</p>
          <div className="space-y-3">
            {LEAD_STAGES.map(s => {
              const col = STAGE_COLOR[s.color];
              const n = byStage[s.key];
              return (
                <div key={s.key} className="flex items-center gap-3">
                  <div className="w-24 flex-shrink-0 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <span className="text-xs font-semibold text-navy-700">{s.label}</span>
                  </div>
                  <div className="flex-1 h-7 rounded-lg bg-paper overflow-hidden">
                    <div className={`h-full rounded-lg ${col.dot} flex items-center justify-end px-2`} style={{ width: `${Math.max(8, (n / maxStage) * 100)}%` }}>
                      <span className="text-[11px] font-bold text-white">{n}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* By region */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-navy-100 p-5 sm:p-6">
          <h3 className="font-display font-bold text-ink mb-1">By region</h3>
          <p className="text-xs text-navy-500 mb-4">Pipeline depth and conversions</p>
          <div className="space-y-2">
            {byRegion.map(r => (
              <div key={r.region} className="flex items-center justify-between p-3 rounded-xl bg-paper">
                <div className="flex items-center gap-2">
                  <Icon name="map" size={14} className="text-navy-500" />
                  <span className="text-sm font-semibold text-ink">{r.region}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-display font-bold text-ink">{r.total}</span>
                  <span className="text-[11px] text-leaf-700 font-semibold ml-2">{r.customers} won</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* By rep */}
      <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-navy-100">
          <h3 className="font-display font-bold text-ink">By rep</h3>
          <p className="text-xs text-navy-500 mt-0.5">Each rep's pipeline across the funnel</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-navy-400 bg-paper">
                <th className="px-5 py-2.5 font-bold">Rep</th>
                <th className="px-3 py-2.5 font-bold">Region</th>
                {LEAD_STAGES.map(s => <th key={s.key} className="px-3 py-2.5 font-bold text-center">{s.label}</th>)}
                <th className="px-5 py-2.5 font-bold text-right">Conversion</th>
              </tr>
            </thead>
            <tbody>
              {byRep.map(r => {
                const conv = r.total ? Math.round((r.counts.customer / r.total) * 100) : 0;
                return (
                  <tr key={r.rep} className="border-t border-navy-50">
                    <td className="px-5 py-3 font-semibold text-ink whitespace-nowrap">{r.rep}</td>
                    <td className="px-3 py-3 text-navy-500 whitespace-nowrap">{r.region}</td>
                    {LEAD_STAGES.map(s => (
                      <td key={s.key} className="px-3 py-3 text-center text-navy-700">{r.counts[s.key] || <span className="text-navy-300">·</span>}</td>
                    ))}
                    <td className="px-5 py-3 text-right font-bold text-leaf-700">{conv}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
