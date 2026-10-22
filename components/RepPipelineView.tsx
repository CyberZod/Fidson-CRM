import { useEffect, useMemo, useState } from 'react';
import Icon from './Icon';
import type { IconName } from '../types';
import AddContactSheet, { type AddContactResult } from './AddContactSheet';
import ConsentCapture, { ConsentReceipt } from './ConsentCapture';
import Customer360 from './Customer360';
import { ACCOUNTS, REP_SCOPE } from '../assets/customers';
import {
  LEAD_STAGES, REP_OWNER, STAGE_COLOR, STAGE_SLA_DAYS, checkDuplicate, slaStatus,
  type ConsentRecord, type DuplicateMatch, type Lead, type LeadEvent, type LeadStage,
} from '../assets/leads';

interface RepPipelineViewProps {
  leads: Lead[];
  onEnrich: (id: string) => void;
  onConsent: (id: string) => void;
  onSend: (id: string) => void;
  onConvert: (id: string) => void;
  onNavigate: (view: string) => void;
  onAddLead?: (lead: Lead) => void;
}

const CHANNEL_BADGE: Record<Lead['channel'], string> = {
  Institution: 'bg-violet-100 text-violet-700',
  Trade: 'bg-amber-100 text-amber-700',
  HCP: 'bg-sky-100 text-sky-700',
};

// Primary action on the card = move to the next stage.
const STAGE_ACTION: Record<LeadStage, { label: string; icon: IconName } | null> = {
  captured: { label: 'Enrich', icon: 'sparkles' },
  enriched: { label: 'Record consent', icon: 'check' },
  consented: { label: 'Send info', icon: 'send' },
  nurturing: { label: 'Convert to customer', icon: 'checkCircle' },
  customer: null,
};

// The sub-steps each action performs, played out so the viewer sees the work.
const ACTION_STEPS: Record<LeadStage, string[]> = {
  captured: ['Linking to account & territory', 'Checking for duplicates', 'Completing profile from Fidson data'],
  enriched: ['Attaching consent record', 'Stamping lawful basis & scope'],
  consented: ['Preparing information pack', 'Sending via Outlook'],
  nurturing: ['Creating account record', 'Adding to My Customers'],
  customer: [],
};

const ORDER: LeadStage[] = LEAD_STAGES.map(s => s.key);
const stageLabel = (s: LeadStage) => LEAD_STAGES.find(x => x.key === s)!.label;

const initials = (name: string) => name.replace(/^(Dr\.|Pharm\.|Mr\.|Mrs\.|Ms\.)\s*/i, '').split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();

function AgeingBar({ lead }: { lead: Lead }) {
  const s = slaStatus(lead);
  if (!s) return null;
  const pct = Math.min(100, (s.ageDays / Math.max(1, s.slaDays)) * 100);
  const color = s.breached ? 'bg-rose-500' : s.dueSoon ? 'bg-amber-500' : 'bg-leaf-500';
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-[9px] font-bold">
        <span className={s.breached ? 'text-rose-700' : s.dueSoon ? 'text-amber-700' : 'text-navy-400'}>
          <Icon name="clock" size={9} className="inline -mt-0.5 mr-0.5" />
          {s.ageDays === 0 ? 'Touched today' : `Untouched ${s.ageDays}d`}
        </span>
        <span className="text-navy-400">SLA {s.slaDays}d{s.breached ? ` · ${s.overdueBy}d over` : ''}</span>
      </div>
      <div className="h-1 rounded-full bg-navy-100 overflow-hidden mt-0.5">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(6, pct)}%` }} />
      </div>
      {s.breached && (
        <p className="mt-1.5 text-[10px] font-bold text-rose-700 bg-rose-50 rounded-md px-2 py-1 leading-snug">
          <Icon name="alert" size={10} className="inline mr-1 -mt-0.5" />SLA breached · escalated to {s.escalatedTo}
        </p>
      )}
    </div>
  );
}

export default function RepPipelineView({ leads, onEnrich, onConsent, onSend, onConvert, onNavigate, onAddLead }: RepPipelineViewProps) {
  const [processing, setProcessing] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [localLeads, setLocalLeads] = useState<Lead[]>([]);
  const [patches, setPatches] = useState<Record<string, Partial<Lead>>>({});
  const [extraEvents, setExtraEvents] = useState<Record<string, LeadEvent[]>>({});
  const [slaOnly, setSlaOnly] = useState(false);
  const [adding, setAdding] = useState(false);
  const [consentFor, setConsentFor] = useState<{ id: string; target?: LeadStage } | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [announce, setAnnounce] = useState('');
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<LeadStage | null>(null);
  const [focusTarget, setFocusTarget] = useState<{ id: string; stage: LeadStage } | null>(null);

  const all = useMemo(() => [...localLeads, ...leads].map(l => {
    const p = patches[l.id];
    const extra = extraEvents[l.id] ?? [];
    return p || extra.length ? { ...l, ...p, timeline: [...extra, ...l.timeline] } : l;
  }), [leads, localLeads, patches, extraEvents]);

  const selected = all.find(l => l.id === selectedId) ?? null;
  const breachedCount = all.filter(l => slaStatus(l)?.breached).length;
  const visible = slaOnly ? all.filter(l => slaStatus(l)?.breached) : all;

  useEffect(() => {
    if (!focusTarget) return;
    const l = all.find(x => x.id === focusTarget.id);
    if (l && l.stage === focusTarget.stage) {
      document.querySelector<HTMLElement>(`[data-lead="${focusTarget.id}"]`)?.focus();
      setFocusTarget(null);
    }
  }, [all, focusTarget]);

  const say = (msg: string) => setAnnounce(msg);
  const isLocal = (id: string) => localLeads.some(l => l.id === id);
  const patch = (id: string, p: Partial<Lead>, event?: LeadEvent) => {
    setPatches(prev => ({ ...prev, [id]: { ...prev[id], ...p } }));
    if (event) setExtraEvents(prev => ({ ...prev, [id]: [event, ...(prev[id] ?? [])] }));
  };
  const clearStagePatch = (id: string) => setPatches(prev => {
    if (!prev[id]?.stage) return prev;
    const { stage: _s, ...rest } = prev[id];
    return { ...prev, [id]: rest };
  });

  // One forward step: App handler for pipeline leads, local patch for leads only on this device.
  const stepTo = (lead: Lead, to: LeadStage) => {
    if (isLocal(lead.id)) {
      patch(lead.id, { stage: to, ...(to === 'enriched' ? { enriched: true, completeness: 90 } : {}) }, { date: 'Just now', title: `Moved to ${stageLabel(to)}`, detail: 'Updated on the board' });
      return;
    }
    clearStagePatch(lead.id);
    if (to === 'enriched') {
      const others = checkDuplicate({ name: lead.name, phone: lead.phone, org: lead.org }, all.filter(l => l.id !== lead.id))
        .filter(m => m.id !== lead.id && !(m.kind === 'account' && m.name === lead.name));
      if (others.length) patch(lead.id, { dedupeNote: `Possible match: ${others[0].name} · ${others[0].reasons.join(', ').toLowerCase()} (${others[0].score}%)` });
      onEnrich(lead.id);
    } else if (to === 'consented') onConsent(lead.id);
    else if (to === 'nurturing') onSend(lead.id);
    else if (to === 'customer') onConvert(lead.id);
  };

  const moveLead = (lead: Lead, target: LeadStage, animate = false) => {
    const from = ORDER.indexOf(lead.stage);
    const to = ORDER.indexOf(target);
    if (from === to || processing[lead.id]) return;
    if (lead.stage === 'customer') {
      say(`${lead.name} is already a customer and stays in My Customers.`);
      return;
    }
    const col = `column ${to + 1} of ${ORDER.length}`;
    if (to < from) {
      patch(lead.id, { stage: target }, { date: 'Just now', title: `Moved back to ${stageLabel(target)}`, detail: `From ${stageLabel(lead.stage)} on the board` });
      setFocusTarget({ id: lead.id, stage: target });
      say(`${lead.name} moved back to ${stageLabel(target)}, ${col}.`);
      return;
    }
    const consentIdx = ORDER.indexOf('consented');
    if (from < consentIdx && to >= consentIdx && !lead.consentRecord) {
      setConsentFor({ id: lead.id, target });
      say(`Consent needed before ${lead.name} can move to ${stageLabel(target)}.`);
      return;
    }
    const steps = ORDER.slice(from + 1, to + 1);
    setFocusTarget({ id: lead.id, stage: target });
    if (animate && steps.length === 1 && ACTION_STEPS[lead.stage].length) {
      const stepMs = 650;
      ACTION_STEPS[lead.stage].forEach((s, idx) => {
        window.setTimeout(() => setProcessing(p => ({ ...p, [lead.id]: s })), idx * stepMs);
      });
      window.setTimeout(() => {
        stepTo(lead, target);
        setProcessing(p => { const n = { ...p }; delete n[lead.id]; return n; });
        say(`${lead.name} moved to ${stageLabel(target)}, ${col}.`);
      }, ACTION_STEPS[lead.stage].length * stepMs);
      return;
    }
    steps.forEach(s => stepTo(lead, s));
    say(`${lead.name} moved to ${stageLabel(target)}, ${col}.`);
  };

  const shift = (lead: Lead, dir: 1 | -1) => {
    const idx = ORDER.indexOf(lead.stage) + dir;
    if (idx < 0 || idx >= ORDER.length) {
      say(dir < 0 ? `${lead.name} is already in the first column.` : `${lead.name} is already a customer.`);
      return;
    }
    moveLead(lead, ORDER[idx]);
  };

  const onConsentCaptured = (record: ConsentRecord) => {
    if (!consentFor) return;
    const lead = all.find(l => l.id === consentFor.id);
    setConsentFor(null);
    if (!lead) return;
    patch(lead.id, { consentRecord: record, consent: true }, { date: 'Just now', title: 'Consent record attached', detail: `Receipt ${record.receiptId} · ${record.lawfulBasis} · ${record.channel}` });
    say(`Consent recorded for ${lead.name}, receipt ${record.receiptId}.`);
    if (consentFor.target) {
      const withConsent = { ...lead, consentRecord: record, consent: true };
      window.setTimeout(() => moveLead(withConsent, consentFor.target!), 0);
    }
  };

  const onContactSaved = ({ lead, mergeInto }: AddContactResult) => {
    setAdding(false);
    if (mergeInto) {
      const existing = all.find(l => l.id === mergeInto.id);
      if (existing) {
        patch(existing.id, {
          phone: existing.phone ?? lead.phone, consent: true, consentRecord: lead.consentRecord,
          dedupeNote: `Merged a second capture of ${lead.name}`,
        }, { date: 'Just now', title: 'Duplicate merged', detail: `New capture merged · consent ${lead.consentRecord?.receiptId} attached` });
        setSelectedId(existing.id);
        say(`Merged into ${existing.name}. Consent attached.`);
      } else {
        say(`${lead.name} added as a contact on ${mergeInto.name} · consent ${lead.consentRecord?.receiptId}.`);
      }
      return;
    }
    if (onAddLead) onAddLead(lead);
    else if (lead.repName === REP_OWNER) setLocalLeads(prev => [lead, ...prev]);
    say(lead.repName === REP_OWNER
      ? `${lead.name} added to First meeting · consent ${lead.consentRecord?.receiptId}.`
      : `${lead.assignmentNote}. ${lead.name} moves to their pipeline with consent ${lead.consentRecord?.receiptId}.`);
  };

  const openExisting = (m: DuplicateMatch) => {
    setAdding(false);
    if (m.kind === 'account') { setAccountId(m.id); return; }
    if (all.some(l => l.id === m.id)) setSelectedId(m.id);
    else say(`${m.name} is an open lead of ${m.owner}. Ask your ASM to reassign it if you met them first.`);
  };

  const consentLead = consentFor ? all.find(l => l.id === consentFor.id) : null;
  const account = accountId ? ACCOUNTS.find(a => a.id === accountId) ?? null : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-5">
      <div className="fade-up flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">Pipeline</h2>
          <p className="text-sm text-navy-500 mt-1">First meeting to customer · drag a card, tap the arrows, or focus it and press ← →</p>
        </div>
        <button type="button" onClick={() => setAdding(true)}
          className="min-h-[44px] px-4 rounded-xl bg-navy-800 hover:bg-navy-900 text-white text-sm font-bold flex items-center gap-1.5 btn-press">
          <Icon name="plus" size={16} /> Add contact
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button type="button" onClick={() => setSlaOnly(false)} aria-pressed={!slaOnly}
          className={`px-3 py-1.5 rounded-full text-xs font-bold btn-press ${!slaOnly ? 'bg-navy-800 text-white' : 'bg-white border border-navy-200 text-navy-600'}`}>
          All leads {all.length}
        </button>
        <button type="button" onClick={() => setSlaOnly(true)} aria-pressed={slaOnly}
          className={`px-3 py-1.5 rounded-full text-xs font-bold btn-press flex items-center gap-1 ${slaOnly ? 'bg-rose-600 text-white' : 'bg-white border border-rose-200 text-rose-700'}`}>
          <Icon name="alert" size={12} /> SLA breached {breachedCount}
        </button>
        <span className="hidden sm:inline text-[11px] text-navy-400 ml-auto">Keys: ← → or [ ] move · Enter opens</span>
      </div>

      {announce && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-navy-50 border border-navy-100 text-xs text-navy-700">
          <Icon name="refresh" size={12} className="text-navy-500 flex-shrink-0" />
          <span className="flex-1">{announce}</span>
          <button type="button" onClick={() => setAnnounce('')} aria-label="Dismiss" className="text-navy-400"><Icon name="x" size={12} /></button>
        </div>
      )}
      <div aria-live="polite" className="sr-only">{announce}</div>

      {/* Column board */}
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 px-4 sm:mx-0 sm:px-0">
        {LEAD_STAGES.map((s, si) => {
          const col = STAGE_COLOR[s.color];
          const cards = visible.filter(l => l.stage === s.key);
          const sla = STAGE_SLA_DAYS[s.key];
          const over = dragOver === s.key;
          return (
            <section
              key={s.key}
              aria-label={`${s.label}, ${cards.length} leads`}
              onDragOver={e => { e.preventDefault(); if (dragOver !== s.key) setDragOver(s.key); }}
              onDragLeave={() => setDragOver(d => (d === s.key ? null : d))}
              onDrop={e => {
                e.preventDefault();
                setDragOver(null);
                const id = e.dataTransfer.getData('text/plain') || dragId;
                const lead = all.find(l => l.id === id);
                if (lead) moveLead(lead, s.key, true);
                setDragId(null);
              }}
              className={`snap-start flex-shrink-0 w-[84vw] sm:w-72 lg:w-auto lg:flex-1 lg:min-w-0 rounded-2xl p-2.5 border-t-4 ${col.head} transition-colors ${over ? 'bg-sky-50 ring-2 ring-sky-300' : 'bg-paper'}`}
            >
              <div className="flex items-center justify-between px-1 pb-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <p className="text-xs font-bold text-navy-800 truncate">{s.label}</p>
                  <span className="text-[10px] font-bold text-navy-500 bg-white rounded-full px-1.5">{cards.length}</span>
                </div>
                <span className="text-[9px] font-semibold text-navy-400">{sla ? `SLA ${sla}d` : s.hint}</span>
              </div>

              <div className="space-y-2 min-h-[80px]">
                {cards.length === 0 && (
                  <div className="rounded-xl border-2 border-dashed border-navy-200 py-6 text-center text-[11px] text-navy-400">Drop a lead here</div>
                )}
                {cards.map(lead => {
                  const action = STAGE_ACTION[lead.stage];
                  const busy = processing[lead.id];
                  return (
                    <article
                      key={lead.id}
                      data-lead={lead.id}
                      tabIndex={0}
                      draggable={!busy}
                      aria-label={`${lead.name}, ${lead.org}, ${s.label}. Arrow keys move between stages, Enter opens.`}
                      onDragStart={e => { e.dataTransfer.setData('text/plain', lead.id); e.dataTransfer.effectAllowed = 'move'; setDragId(lead.id); }}
                      onDragEnd={() => { setDragId(null); setDragOver(null); }}
                      onClick={() => setSelectedId(lead.id)}
                      onKeyDown={e => {
                        if (e.target !== e.currentTarget) return;
                        if (e.key === 'ArrowRight' || e.key === ']') { e.preventDefault(); shift(lead, 1); }
                        else if (e.key === 'ArrowLeft' || e.key === '[') { e.preventDefault(); shift(lead, -1); }
                        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedId(lead.id); }
                      }}
                      className={`relative rounded-xl bg-white border p-3 cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-navy-400 transition-shadow hover:shadow-sm ${dragId === lead.id ? 'opacity-50' : ''} ${slaStatus(lead)?.breached ? 'border-rose-200' : 'border-navy-100'}`}
                    >
                      {busy && (
                        <div className="absolute inset-0 z-10 rounded-xl bg-white/90 flex flex-col items-center justify-center gap-2 px-4">
                          <Icon name="sparkles" size={16} className="text-navy-500" />
                          <div className="ai-shimmer w-28 h-1.5 rounded-full bg-navy-100 overflow-hidden" />
                          <p className="text-[11px] font-bold text-navy-700 text-center">{busy}</p>
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0 font-display font-bold text-navy-600 text-[10px]">{initials(lead.name)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-semibold text-[13px] text-ink truncate">{lead.name}</p>
                          <p className="text-[10px] text-navy-500 truncate">{lead.role} · {lead.org}</p>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold flex-shrink-0 ${CHANNEL_BADGE[lead.channel]}`}>{lead.channel}</span>
                      </div>

                      {lead.enriched && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <div className="flex-1 h-1 rounded-full bg-navy-100 overflow-hidden"><div className="h-full bg-violet-500" style={{ width: `${lead.completeness}%` }} /></div>
                          <span className="text-[9px] font-bold text-navy-500">Profile {lead.completeness}%</span>
                        </div>
                      )}
                      {lead.dedupeNote && (
                        <p className="mt-1.5 text-[10px] text-violet-700 bg-violet-50 rounded-md px-2 py-1 leading-snug truncate" title={lead.dedupeNote}>
                          <Icon name="filter" size={10} className="inline mr-1 -mt-0.5" />{lead.dedupeNote}
                        </p>
                      )}
                      {lead.consentRecord ? (
                        <p className="mt-1.5 text-[10px] font-semibold text-leaf-700 flex items-center gap-1">
                          <Icon name="checkCircle" size={11} /> Consent · <span className="font-mono">{lead.consentRecord.receiptId}</span>
                        </p>
                      ) : lead.consent && (
                        <p className="mt-1.5 text-[10px] font-semibold text-leaf-700 flex items-center gap-1">
                          <Icon name="checkCircle" size={11} /> Consent on record{lead.consentDate ? ` · ${lead.consentDate}` : ''}
                        </p>
                      )}
                      <AgeingBar lead={lead} />

                      <div className="mt-2.5 flex items-center gap-1.5">
                        <button type="button" aria-label={`Move ${lead.name} back`} disabled={si === 0 || lead.stage === 'customer' || !!busy}
                          onClick={e => { e.stopPropagation(); shift(lead, -1); }}
                          className="w-9 h-9 rounded-lg border border-navy-200 text-navy-600 flex items-center justify-center btn-press disabled:opacity-30">
                          <Icon name="chevronLeft" size={14} />
                        </button>
                        {action ? (
                          <button type="button" disabled={!!busy}
                            onClick={e => { e.stopPropagation(); moveLead(lead, ORDER[si + 1], true); }}
                            className="flex-1 h-9 rounded-lg bg-navy-700 hover:bg-navy-800 text-white text-[11px] font-bold flex items-center justify-center gap-1 btn-press disabled:opacity-60">
                            <Icon name={action.icon} size={12} /> {action.label}
                          </button>
                        ) : (
                          <button type="button" onClick={e => { e.stopPropagation(); onNavigate('rep-customers'); }}
                            className="flex-1 h-9 rounded-lg bg-leaf-50 text-leaf-700 border border-leaf-200 text-[11px] font-bold flex items-center justify-center gap-1 btn-press">
                            <Icon name="users" size={12} /> My Customers
                          </button>
                        )}
                        <button type="button" aria-label={`Move ${lead.name} forward`} disabled={si === ORDER.length - 1 || !!busy}
                          onClick={e => { e.stopPropagation(); shift(lead, 1); }}
                          className="w-9 h-9 rounded-lg border border-navy-200 text-navy-600 flex items-center justify-center btn-press disabled:opacity-30">
                          <Icon name="chevronRight" size={14} />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

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
              <button onClick={() => setSelectedId(null)} aria-label="Close" className="text-navy-400 hover:text-navy-700"><Icon name="x" size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-paper"><p className="stat-label text-navy-400">Stage</p><p className="text-navy-700 mt-0.5">{stageLabel(selected.stage)}</p></div>
                <div className="p-3 rounded-xl bg-paper"><p className="stat-label text-navy-400">Territory</p><p className="text-navy-700 mt-0.5">{selected.territory}</p></div>
                <div className="p-3 rounded-xl bg-paper"><p className="stat-label text-navy-400">Phone</p><p className="text-navy-700 mt-0.5">{selected.phone || 'Not captured yet'}</p></div>
                <div className="p-3 rounded-xl bg-paper"><p className="stat-label text-navy-400">Email</p><p className="text-navy-700 mt-0.5 truncate">{selected.email || 'Not captured yet'}</p></div>
              </div>
              <AgeingBar lead={selected} />
              {selected.assignmentNote && (
                <p className="text-[11px] text-sky-800 bg-sky-50 rounded-lg px-3 py-2"><Icon name="users" size={11} className="inline mr-1 -mt-0.5" />{selected.assignmentNote}</p>
              )}
              {selected.consentRecord ? (
                <ConsentReceipt record={selected.consentRecord} />
              ) : (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2">
                  <p className="text-xs text-amber-800">{selected.consent ? 'Consent noted before receipts were issued · re-confirm to get a receipt' : 'No consent record yet'}</p>
                  <button type="button" onClick={() => { setConsentFor({ id: selected.id }); setSelectedId(null); }}
                    className="px-3 py-2 rounded-lg bg-navy-800 text-white text-[11px] font-bold btn-press flex-shrink-0">Capture consent</button>
                </div>
              )}
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

      {/* Consent sheet, opened when a move needs consent or from the drawer */}
      {consentLead && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setConsentFor(null)}>
          <div className="absolute inset-0 bg-navy-900/40" />
          <div role="dialog" aria-modal="true" aria-label="Record consent" className="relative w-full sm:max-w-md max-h-[92vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 fade-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-lg font-bold text-ink">Record consent</h3>
              <button type="button" onClick={() => setConsentFor(null)} aria-label="Close" className="w-10 h-10 rounded-xl flex items-center justify-center text-navy-400"><Icon name="x" size={18} /></button>
            </div>
            <ConsentCapture
              contactName={consentLead.name}
              capturedBy={REP_OWNER}
              onCapture={onConsentCaptured}
              onCancel={() => setConsentFor(null)}
              submitLabel={consentFor?.target ? `Move to ${stageLabel(consentFor.target)}` : 'Done'}
            />
          </div>
        </div>
      )}

      {adding && (
        <AddContactSheet
          leads={all}
          capturedBy={REP_OWNER}
          onSave={onContactSaved}
          onOpenExisting={openExisting}
          onClose={() => setAdding(false)}
        />
      )}

      {account && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setAccountId(null)}>
          <div className="absolute inset-0 bg-navy-900/40" />
          <div className="relative w-full max-w-2xl h-full bg-paper shadow-2xl slide-in-right overflow-y-auto p-4" onClick={e => e.stopPropagation()}>
            <Customer360 key={account.id} account={account} viewer={REP_SCOPE} onClose={() => setAccountId(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
