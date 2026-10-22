import { useMemo, useState } from 'react';
import Icon from './Icon';
import { useNotice } from './useNotice';
import { computeRoi, formatNaira, upliftSeries } from '../assets/campaigns';
import { useMarketing, type TrackedCampaign } from '../stores/marketing';
import type { CampaignChannel, CampaignStatus, ToastInput } from '../types';

interface CampaignsViewProps {
  scope?: string;
  onToast?: (t: ToastInput) => void;
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

export default function CampaignsView({ scope = 'All campaigns', onToast }: CampaignsViewProps) {
  const { campaigns: all, refreshAttribution } = useMarketing();
  const { notify, node } = useNotice(onToast);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const selected = all.find(c => c.id === selectedId) ?? null;

  const campaigns = useMemo(() => {
    if (filter === 'all') return all;
    return all.filter(c => c.status === filter);
  }, [filter, all]);

  const totals = useMemo(() => {
    const spend = all.reduce((s, c) => s + c.materialsCost + c.budgetSpent, 0);
    const revenue = all.reduce((s, c) => s + c.attributedRevenue, 0);
    const roiPct = spend > 0 ? Math.round(((revenue - spend) / spend) * 100) : 0;
    return { spend, revenue, roiPct, active: all.filter(c => c.status === 'active').length };
  }, [all]);

  const refresh = (c: TrackedCampaign) => {
    setSyncing(true);
    window.setTimeout(() => {
      refreshAttribution(c.id);
      setSyncing(false);
      notify({ type: 'success', title: 'Attribution refreshed', msg: `${c.name} · orders pulled from Business Central up to day ${Math.min(60, c.daysElapsed + 14)}` });
    }, 900);
  };

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
          { l: 'Active Campaigns', v: totals.active.toString(), d: `${all.length} total`, c: 'leaf' },
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
                onClick={() => setSelectedId(c.id)}
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
                    {c.sourcePromoId && <span className="px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 text-[9px] font-bold">FIELD REQUEST</span>}
                  </div>
                  <p className="text-[11px] text-navy-500 mt-0.5">{c.product} · {c.owner} · Started {c.startedAt} · Day {c.daysElapsed} of {c.attributionWindowDays}</p>
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
          onClick={() => setSelectedId(null)}
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
              <button onClick={() => setSelectedId(null)} className="text-navy-400 hover:text-navy-700">
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
                    <div className="text-center">
                      <p className="text-[10px] font-bold tracking-wider uppercase">Return</p>
                      <p className="font-display text-3xl font-bold">{(roi.revenue / Math.max(1, roi.spend)).toFixed(1)}x</p>
                    </div>
                    <div className="text-right text-[11px]">
                      <p>Spend: <span className="font-mono font-bold">{formatNaira(roi.spend)}</span></p>
                      <p>Attributed revenue: <span className="font-mono font-bold">{formatNaira(roi.revenue)}</span></p>
                      <p className="text-navy-500 mt-1">{selected.attributionWindowDays}-day attribution</p>
                    </div>
                  </div>
                );
              })()}

              <div className="p-3 rounded-xl border border-navy-100">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-xs text-navy-700">Attribution window · <strong className="font-mono">day {selected.daysElapsed} of {selected.attributionWindowDays}</strong>{selected.daysElapsed >= selected.attributionWindowDays ? ' · final' : ''}</p>
                  {selected.daysElapsed < selected.attributionWindowDays && (
                    <button onClick={() => refresh(selected)} disabled={syncing} className="px-2.5 py-1.5 rounded-lg border border-navy-200 text-[11px] font-bold text-navy-700 hover:bg-paper btn-press flex items-center gap-1 disabled:opacity-50">
                      <Icon name="refresh" size={11} className={syncing ? 'animate-spin' : ''} /> {syncing ? 'Pulling orders' : 'Refresh attribution'}
                    </button>
                  )}
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-navy-100 overflow-hidden">
                  <div className="h-full rounded-full bg-leaf-500 transition-all duration-700" style={{ width: `${(selected.daysElapsed / selected.attributionWindowDays) * 100}%` }} />
                </div>
                {selected.daysElapsed === 0 && (
                  <p className="text-[11px] text-navy-500 mt-2">Launched today. Revenue is attributed as orders for {selected.product} from targeted accounts sync from Business Central.</p>
                )}
              </div>

              <UpliftChart campaign={selected} />

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
      {node}
    </div>
  );
}

function UpliftChart({ campaign }: { campaign: TrackedCampaign }) {
  const { before, after, upliftPct } = upliftSeries(campaign);
  const bars = [...before, ...after];
  const max = Math.max(...bars) * 1.1;
  const W = 560, H = 150, pad = 18, gap = 4;
  const slots = before.length + 9;
  const bw = (W - pad * 2) / slots - gap;
  const x = (i: number) => pad + i * (bw + gap);
  const y = (v: number) => H - 20 - (v / max) * (H - 36);
  const baseline = before.reduce((s, v) => s + v, 0) / before.length;

  return (
    <div className="p-3 rounded-xl border border-navy-100">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">Weekly units · 8 weeks before vs after launch</p>
        {after.length > 0 ? (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${upliftPct >= 0 ? 'bg-leaf-50 text-leaf-700' : 'bg-rose-50 text-rose-700'}`}>
            {upliftPct >= 0 ? '+' : ''}{upliftPct}% vs baseline
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-navy-50 text-navy-500">Baseline captured · after-launch weeks pending</span>
        )}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full mt-2" role="img" aria-label={`Weekly units before and after launch, ${upliftPct}% uplift`}>
        <line x1={pad} x2={W - pad} y1={y(baseline)} y2={y(baseline)} stroke="#94A3B8" strokeDasharray="4 4" strokeWidth={1} />
        <text x={W - pad} y={y(baseline) - 4} textAnchor="end" fontSize="9" fill="#64748B">baseline {Math.round(baseline)}</text>
        {before.map((v, i) => (
          <rect key={`b${i}`} x={x(i)} y={y(v)} width={bw} height={H - 20 - y(v)} rx={2} fill="#CBD5E1" />
        ))}
        <line x1={x(before.length) - gap / 2} x2={x(before.length) - gap / 2} y1={8} y2={H - 20} stroke="#142A5A" strokeWidth={1.5} />
        <text x={x(before.length) + 2} y={14} fontSize="9" fontWeight="700" fill="#142A5A">Launch</text>
        {after.map((v, i) => (
          <rect key={`a${i}`} x={x(before.length + i)} y={y(v)} width={bw} height={H - 20 - y(v)} rx={2} fill="#16A34A" />
        ))}
        <text x={x(0)} y={H - 6} fontSize="9" fill="#64748B">W-8</text>
        <text x={x(before.length - 1)} y={H - 6} fontSize="9" fill="#64748B">W-1</text>
        <text x={x(before.length)} y={H - 6} fontSize="9" fill="#64748B">W1</text>
        <text x={x(slots - 1)} y={H - 6} fontSize="9" fill="#64748B" textAnchor="start">W9</text>
      </svg>
      <div className="flex items-center gap-4 text-[10px] text-navy-500 mt-1">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-navy-200 inline-block" /> Before</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-leaf-600 inline-block" /> After launch</span>
      </div>
    </div>
  );
}
