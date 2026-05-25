import { useMemo, useState } from 'react';
import Icon from './Icon';
import { CAMPAIGNS, computeRoi, formatNaira } from '../assets/campaigns';
import type { Campaign, CampaignChannel, CampaignStatus } from '../types';

interface CampaignsViewProps {
  scope?: string;
}

type StatusFilter = 'all' | CampaignStatus;

const channelLabel: Record<CampaignChannel, string> = {
  institution: 'Institution',
  trade: 'Trade',
  'mobile-frontline': 'Mobile & Frontline',
  all: 'All channels',
};

const statusFilters: { k: StatusFilter; l: string }[] = [
  { k: 'all', l: 'All' },
  { k: 'active', l: 'Active' },
  { k: 'paused', l: 'Paused' },
  { k: 'closed', l: 'Closed' },
];

export default function CampaignsView({ scope = 'All campaigns' }: CampaignsViewProps) {
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [selected, setSelected] = useState<Campaign | null>(null);

  const campaigns = useMemo(() => {
    if (filter === 'all') return CAMPAIGNS;
    return CAMPAIGNS.filter(c => c.status === filter);
  }, [filter]);

  const totals = useMemo(() => {
    const spend = CAMPAIGNS.reduce((s, c) => s + c.materialsCost + c.budgetSpent, 0);
    const revenue = CAMPAIGNS.reduce((s, c) => s + c.attributedRevenue, 0);
    const roiPct = spend > 0 ? Math.round(((revenue - spend) / spend) * 100) : 0;
    return { spend, revenue, roiPct, active: CAMPAIGNS.filter(c => c.status === 'active').length };
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="fade-up">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-navy-400 tracking-wider uppercase">Campaign Engine</p>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-ink">
              Campaigns &amp; <span className="gradient-text">ROI</span>
            </h2>
            <p className="text-sm text-navy-500 mt-1">{scope} · Tracking begins when materials dispatch · 60-day attribution</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { l: 'Active Campaigns', v: totals.active.toString(), d: `${CAMPAIGNS.length} total`, c: 'leaf' },
          { l: 'Total Spend YTD', v: formatNaira(totals.spend), d: 'Materials + budget', c: 'navy' },
          { l: 'Attributed Revenue', v: formatNaira(totals.revenue), d: '60-day window', c: 'navy' },
          { l: 'Blended ROI', v: `${totals.roiPct}%`, d: totals.roiPct >= 100 ? 'on track' : 'monitor', c: totals.roiPct >= 100 ? 'leaf' : 'amber' },
        ].map((k, i) => (
          <div key={i} className={`fade-up stagger-${i + 1} p-4 sm:p-5 rounded-2xl bg-white border border-navy-100`}>
            <p className="stat-label text-navy-400">{k.l}</p>
            <p className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">{k.v}</p>
            <p className={`text-[11px] font-semibold mt-1 ${
              k.c === 'leaf' ? 'text-leaf-700' : k.c === 'amber' ? 'text-amber-700' : 'text-navy-500'
            }`}>{k.d}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 bg-paper p-1 rounded-xl w-fit fade-up">
        {statusFilters.map(s => (
          <button
            key={s.k}
            onClick={() => setFilter(s.k)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
              filter === s.k ? 'bg-white text-navy-700 shadow-sm' : 'text-navy-500 hover:text-navy-700'
            }`}
          >
            {s.l}
          </button>
        ))}
      </div>

      <div className="fade-up stagger-2 rounded-2xl bg-white border border-navy-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-navy-100">
          <h3 className="font-display font-bold text-ink">{campaigns.length} campaign{campaigns.length === 1 ? '' : 's'}</h3>
          <p className="text-xs text-navy-500 mt-0.5">Tap a row to inspect spend, attribution, and linked CMs.</p>
        </div>
        <div className="divide-y divide-navy-50">
          {campaigns.length === 0 ? (
            <div className="py-12 text-center text-sm text-navy-500">No campaigns match this filter.</div>
          ) : campaigns.map(c => {
            const roi = computeRoi(c);
            const statusBg = roi.status === 'green' ? 'bg-leaf-50 text-leaf-700 border-leaf-200' : roi.status === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200';
            const channelBadge = c.channel === 'institution' ? 'bg-navy-50 text-navy-700' : c.channel === 'trade' ? 'bg-amber-50 text-amber-700' : 'bg-sky-50 text-sky-700';
            return (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className="w-full text-left px-5 py-4 hover:bg-paper transition-colors flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-leaf-50 flex items-center justify-center flex-shrink-0">
                  <Icon name="trending" size={18} className="text-leaf-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display font-semibold text-sm text-ink truncate">{c.name}</p>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${channelBadge}`}>{channelLabel[c.channel].toUpperCase()}</span>
                    {c.status === 'paused' && <span className="px-1.5 py-0.5 rounded bg-navy-100 text-navy-700 text-[9px] font-bold">PAUSED</span>}
                  </div>
                  <p className="text-[11px] text-navy-500 mt-0.5">{c.product} · {c.owner} · Started {c.startedAt}</p>
                </div>
                <div className="hidden sm:block text-right">
                  <p className="stat-label text-navy-400">Spend</p>
                  <p className="font-mono text-sm font-bold text-ink">{formatNaira(roi.spend)}</p>
                </div>
                <div className="hidden md:block text-right">
                  <p className="stat-label text-navy-400">Revenue</p>
                  <p className="font-mono text-sm font-bold text-ink">{formatNaira(roi.revenue)}</p>
                </div>
                <div className={`text-right px-3 py-2 rounded-lg border ${statusBg}`}>
                  <p className="text-[9px] font-bold tracking-wider uppercase">ROI</p>
                  <p className="font-display text-base font-bold">{roi.roiPct >= 0 ? '+' : ''}{roi.roiPct}%</p>
                </div>
                <Icon name="chevronRight" size={14} className="text-navy-300 hidden sm:block" />
              </button>
            );
          })}
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-40 bg-navy-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 fade-in"
          onClick={() => setSelected(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl border border-navy-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl fade-up"
          >
            <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between sticky top-0 bg-white">
              <div>
                <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">{channelLabel[selected.channel]} · {selected.status}</p>
                <h3 className="font-display font-bold text-ink">{selected.name}</h3>
                <p className="text-xs text-navy-500 mt-0.5">{selected.product} · {selected.owner}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-navy-400 hover:text-navy-700">
                <Icon name="x" size={18} />
              </button>
            </div>
            <div className="p-5 space-y-5">
              {(() => {
                const roi = computeRoi(selected);
                const statusBg = roi.status === 'green' ? 'bg-leaf-50 border-leaf-200 text-leaf-700' : roi.status === 'amber' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-rose-50 border-rose-200 text-rose-700';
                return (
                  <div className={`p-4 rounded-2xl border ${statusBg} flex items-center justify-between`}>
                    <div>
                      <p className="text-[10px] font-bold tracking-wider uppercase">Campaign ROI</p>
                      <p className="font-display text-3xl font-bold">{roi.roiPct >= 0 ? '+' : ''}{roi.roiPct}%</p>
                    </div>
                    <div className="text-right text-[11px]">
                      <p>Spend: <span className="font-mono font-bold">{formatNaira(roi.spend)}</span></p>
                      <p>Revenue: <span className="font-mono font-bold">{formatNaira(roi.revenue)}</span></p>
                      <p className="text-navy-500 mt-1">{selected.attributionWindowDays}-day attribution</p>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-paper border border-navy-100">
                  <p className="stat-label text-navy-400">Materials Cost</p>
                  <p className="font-mono font-bold text-ink mt-1">{formatNaira(selected.materialsCost)}</p>
                </div>
                <div className="p-3 rounded-xl bg-paper border border-navy-100">
                  <p className="stat-label text-navy-400">Budget Spent</p>
                  <p className="font-mono font-bold text-ink mt-1">{formatNaira(selected.budgetSpent)}</p>
                </div>
                <div className="p-3 rounded-xl bg-paper border border-navy-100">
                  <p className="stat-label text-navy-400">Linked CMs</p>
                  <p className="font-mono font-bold text-ink mt-1">{selected.linkedCMs}</p>
                </div>
                <div className="p-3 rounded-xl bg-paper border border-navy-100">
                  <p className="stat-label text-navy-400">Attendees Reached</p>
                  <p className="font-mono font-bold text-ink mt-1">{selected.attendeesReached}</p>
                </div>
              </div>

              {selected.regions && selected.regions.length > 0 && (
                <div>
                  <p className="stat-label text-navy-400 mb-2">Regions in Scope</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.regions.map(r => (
                      <span key={r} className="px-2 py-1 rounded-md bg-navy-50 text-navy-700 text-[10px] font-bold border border-navy-100">{r}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-navy-50 border border-navy-100">
                <p className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">How ROI is computed</p>
                <p className="text-[11px] text-navy-700 mt-1 leading-relaxed">
                  Campaign clock starts the day materials are dispatched. Orders placed by attended HCPs for <strong>{selected.product}</strong> within {selected.attributionWindowDays} days are attributed to this campaign. NSM, DM, RSM and PM can each see this view.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
