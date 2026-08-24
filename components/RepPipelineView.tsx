import { useMemo, useState } from 'react';
import Icon from './Icon';
import type { IconName } from '../types';
import { LEAD_STAGES, STAGE_COLOR, type Lead, type LeadStage } from '../assets/leads';

interface RepPipelineViewProps {
  leads: Lead[];
  onEnrich: (id: string) => void;
  onConsent: (id: string) => void;
  onSend: (id: string) => void;
  onConvert: (id: string) => void;
  onNavigate: (view: string) => void;
}

const CHANNEL_BADGE: Record<Lead['channel'], string> = {
  Institution: 'bg-violet-100 text-violet-700',
  Trade: 'bg-amber-100 text-amber-700',
  HCP: 'bg-sky-100 text-sky-700',
};

// Per-stage primary action shown on the card.
const STAGE_ACTION: Record<LeadStage, { label: string; icon: IconName } | null> = {
  captured: { label: 'Enrich', icon: 'sparkles' },
  enriched: { label: 'Record consent', icon: 'check' },
  consented: { label: 'Send info', icon: 'send' },
  nurturing: { label: 'Convert to customer', icon: 'checkCircle' },
  customer: null,
};

// The actual sub-steps each action performs, played out so the viewer sees the work.
const ACTION_STEPS: Record<LeadStage, string[]> = {
  captured: ['Linking to account & territory', 'Checking for duplicates', 'Completing profile from Fidson data'],
  enriched: ['Recording consent', 'Stamping lawful basis & scope'],
  consented: ['Preparing information pack', 'Sending via Outlook'],
  nurturing: ['Creating account record', 'Adding to My Customers'],
  customer: [],
};

const initials = (name: string) => name.replace(/^(Dr\.|Pharm\.|Mr\.|Mrs\.|Ms\.)\s*/i, '').split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();

type StageFilter = LeadStage | 'all';

export default function RepPipelineView({ leads, onEnrich, onConsent, onSend, onConvert, onNavigate }: RepPipelineViewProps) {
  const [processing, setProcessing] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState<StageFilter>('captured');

  const selected = leads.find(l => l.id === selectedId) ?? null;

  const counts = useMemo(() => {
    const c: Record<LeadStage, number> = { captured: 0, enriched: 0, consented: 0, nurturing: 0, customer: 0 };
    leads.forEach(l => { c[l.stage] += 1; });
    return c;
  }, [leads]);

  const visible = stageFilter === 'all' ? leads : leads.filter(l => l.stage === stageFilter);
  const activeStageMeta = LEAD_STAGES.find(s => s.key === stageFilter) ?? null;

  // Scripted, no real backend: play out the sub-steps, then advance the stage.
  const runAction = (lead: Lead) => {
    const action = STAGE_ACTION[lead.stage];
    const steps = ACTION_STEPS[lead.stage];
    if (!action || !steps.length || processing[lead.id]) return;
    const stepMs = 650;
    steps.forEach((s, idx) => {
      window.setTimeout(() => setProcessing(p => ({ ...p, [lead.id]: s })), idx * stepMs);
    });
    window.setTimeout(() => {
      if (lead.stage === 'captured') onEnrich(lead.id);
      else if (lead.stage === 'enriched') onConsent(lead.id);
      else if (lead.stage === 'consented') onSend(lead.id);
      else if (lead.stage === 'nurturing') onConvert(lead.id);
      setProcessing(p => { const n = { ...p }; delete n[lead.id]; return n; });
    }, steps.length * stepMs);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div className="fade-up">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">Pipeline</h2>
        <p className="text-sm text-navy-500 mt-1">From first meeting to customer · every contact you met, moving through the funnel</p>
      </div>

      {/* Funnel strip · also the quick stage filter */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {LEAD_STAGES.map((s, i) => {
          const col = STAGE_COLOR[s.color];
          const active = stageFilter === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setStageFilter(active ? 'all' : s.key)}
              className={`fade-up stagger-${i + 1} text-left p-4 rounded-2xl bg-white border transition-all btn-press ${active ? 'border-navy-400 ring-1 ring-navy-200' : 'border-navy-100 hover:border-navy-200'}`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                <p className="stat-label text-navy-400">{s.label}</p>
              </div>
              <p className="font-display text-2xl font-bold text-ink mt-1">{counts[s.key]}</p>
              <p className="text-[11px] text-navy-500 mt-0.5">{s.hint}</p>
            </button>
          );
        })}
      </div>

      {/* Toolbar · dropdown filter */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-navy-500">Showing</label>
          <div className="relative">
            <select
              value={stageFilter}
              onChange={e => setStageFilter(e.target.value as StageFilter)}
              className="appearance-none pl-3 pr-9 py-2 rounded-lg bg-white border border-navy-200 text-sm font-semibold text-ink cursor-pointer focus:outline-none focus:border-navy-400"
            >
              <option value="all">All stages ({leads.length})</option>
              {LEAD_STAGES.map(s => (
                <option key={s.key} value={s.key}>{s.label} ({counts[s.key]})</option>
              ))}
            </select>
            <Icon name="chevronDown" size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none" />
          </div>
        </div>
        <span className="text-xs text-navy-500">{visible.length} {visible.length === 1 ? 'lead' : 'leads'}{activeStageMeta ? ` · ${activeStageMeta.hint.toLowerCase()}` : ''}</span>
      </div>

      {/* Lead list */}
      {visible.length === 0 ? (
        <div className="rounded-2xl bg-white border border-navy-100 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-navy-50 mx-auto flex items-center justify-center mb-3">
            <Icon name="filter" size={24} className="text-navy-300" />
          </div>
          <p className="font-display font-bold text-ink">No leads in this stage</p>
          <p className="text-sm text-navy-500 mt-1">Pick another stage from the dropdown above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {visible.map(lead => {
            const action = STAGE_ACTION[lead.stage];
            const busy = processing[lead.id];
            const stageMeta = LEAD_STAGES.find(s => s.key === lead.stage)!;
            const col = STAGE_COLOR[stageMeta.color];
            return (
              <div
                key={lead.id}
                onClick={() => setSelectedId(lead.id)}
                className="relative rounded-2xl bg-white border border-navy-100 p-4 cursor-pointer hover:border-navy-300 transition-colors"
              >
                {busy && (
                  <div className="absolute inset-0 z-10 rounded-2xl bg-white/90 flex flex-col items-center justify-center gap-2 px-4">
                    <Icon name="sparkles" size={18} className="text-navy-500" />
                    <div className="ai-shimmer w-32 h-1.5 rounded-full bg-navy-100 overflow-hidden" />
                    <p className="text-[11px] font-bold text-navy-700 text-center">{busy}</p>
                    <p className="text-[9px] text-navy-400">working…</p>
                  </div>
                )}
                <div className="flex items-start gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0 font-display font-bold text-navy-600 text-[11px]">
                    {initials(lead.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-sm text-ink truncate">{lead.name}</p>
                    <p className="text-[11px] text-navy-500 truncate">{lead.role}</p>
                    <p className="text-[10px] text-navy-400 truncate">{lead.org}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${CHANNEL_BADGE[lead.channel]}`}>{lead.channel}</span>
                    {stageFilter === 'all' && <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${col.chip}`}>{stageMeta.label}</span>}
                  </div>
                </div>

                {lead.enriched && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-bold text-leaf-700 tracking-wider uppercase">Enriched · profile</span>
                      <span className="text-[9px] font-bold text-navy-500">{lead.completeness}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-navy-100 overflow-hidden">
                      <div className="h-full rounded-full bg-leaf-500" style={{ width: `${lead.completeness}%` }} />
                    </div>
                    <p className="text-[10px] text-navy-600 mt-1.5 truncate flex items-center gap-1">
                      <Icon name="layers" size={10} className="text-leaf-600 flex-shrink-0" /> Linked: {lead.territory}{lead.email ? ` · ${lead.email}` : ''}
                    </p>
                  </div>
                )}

                {lead.dedupeNote && (
                  <p className="mt-2 text-[10px] text-violet-700 bg-violet-50 rounded-md px-2 py-1 leading-snug">
                    <Icon name="filter" size={10} className="inline mr-1 -mt-0.5" />Dedupe: {lead.dedupeNote}
                  </p>
                )}

                {lead.consent && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-leaf-700">
                    <Icon name="checkCircle" size={11} className="flex-shrink-0" /> Consent · product &amp; pricing info{lead.consentDate ? ` · ${lead.consentDate}` : ''}
                  </div>
                )}

                {action ? (
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); runAction(lead); }}
                    disabled={!!busy}
                    className="mt-3 w-full py-2 rounded-lg bg-navy-700 hover:bg-navy-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 btn-press disabled:opacity-60"
                  >
                    <Icon name={action.icon} size={13} /> {action.label}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); onNavigate('rep-customers'); }}
                    className="mt-3 w-full py-2 rounded-lg bg-leaf-50 text-leaf-700 border border-leaf-200 text-xs font-bold flex items-center justify-center gap-1.5 btn-press"
                  >
                    <Icon name="users" size={13} /> View in My Customers
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedId(null)}>
          <div className="absolute inset-0 bg-navy-900/40" />
          <div className="relative w-full max-w-md h-full bg-white shadow-2xl slide-in-right overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-navy-100 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-navy-50 flex items-center justify-center font-display font-bold text-navy-600 text-sm">{initials(selected.name)}</div>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink leading-tight">{selected.name}</h3>
                  <p className="text-xs text-navy-500">{selected.role} · {selected.org}</p>
                </div>
              </div>
              <button onClick={() => setSelectedId(null)} className="text-navy-400 hover:text-navy-700"><Icon name="x" size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-paper"><p className="stat-label text-navy-400">Channel</p><p className="text-navy-700 mt-0.5">{selected.channel}</p></div>
                <div className="p-3 rounded-xl bg-paper"><p className="stat-label text-navy-400">Territory</p><p className="text-navy-700 mt-0.5">{selected.territory}</p></div>
                <div className="p-3 rounded-xl bg-paper"><p className="stat-label text-navy-400">Phone</p><p className="text-navy-700 mt-0.5">{selected.phone || ' · '}</p></div>
                <div className="p-3 rounded-xl bg-paper"><p className="stat-label text-navy-400">Email</p><p className="text-navy-700 mt-0.5 truncate">{selected.email || 'Not captured yet'}</p></div>
              </div>
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-100">
                <p className="stat-label text-sky-700">How we met</p>
                <p className="text-xs text-navy-700 mt-1">{selected.metContext}</p>
                <p className="text-[10px] text-navy-400 mt-1">Source: {selected.source}</p>
              </div>
              <div>
                <p className="stat-label text-navy-400 mb-2">Funnel history</p>
                <div className="space-y-3">
                  {selected.timeline.map((e, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-navy-300 mt-1.5 flex-shrink-0" />
                      <div className="flex-1 pb-3 border-b border-navy-50 last:border-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-display font-semibold text-sm text-ink">{e.title}</p>
                          <span className="text-[10px] text-navy-400 flex-shrink-0">{e.date}</span>
                        </div>
                        <p className="text-xs text-navy-600 mt-0.5">{e.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
