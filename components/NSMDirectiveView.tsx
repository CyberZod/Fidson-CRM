import { useMemo, useState } from 'react';
import Icon from './Icon';
import AudiencePicker from './AudiencePicker';
import DirectiveTracker from './DirectiveTracker';
import { useNotice } from './useNotice';
import { EMPTY_AUDIENCE, resolveAudience, useMarketing, type Audience } from '../stores/marketing';
import type { ToastInput } from '../types';

interface NSMDirectiveViewProps {
  onToast?: (t: ToastInput) => void;
  sender?: string;
  senderRole?: string;
}

type Priority = 'normal' | 'high' | 'urgent';

interface AudienceMap {
  dms: boolean;
  rsms: boolean;
  fsms: boolean;
  asms: boolean;
  pms: boolean;
  reps: boolean;
}

export interface DirectiveForm {
  title: string;
  message: string;
  priority: Priority;
  audience: AudienceMap;
  repAudience: Audience;
}

const EMPTY_FORM: DirectiveForm = {
  title: '',
  message: '',
  priority: 'normal',
  audience: { dms: true, rsms: true, fsms: true, asms: true, pms: true, reps: true },
  repAudience: EMPTY_AUDIENCE,
};

const MANAGER_GROUPS: { k: Exclude<keyof AudienceMap, 'reps'>; l: string; c: number }[] = [
  { k: 'dms', l: 'Division Managers', c: 2 },
  { k: 'rsms', l: 'Regional Sales Mgrs', c: 6 },
  { k: 'fsms', l: 'Field Sales Mgrs', c: 4 },
  { k: 'asms', l: 'Area Sales Mgrs', c: 14 },
  { k: 'pms', l: 'Product Managers', c: 8 },
];

export default function NSMDirectiveView({ onToast, sender = 'Bayo Ogunlana', senderRole = 'NSM' }: NSMDirectiveViewProps) {
  const { directives, pushDirective } = useMarketing();
  const { notify, node } = useNotice(onToast);
  const [form, setForm] = useState<DirectiveForm>(EMPTY_FORM);
  const [sentId, setSentId] = useState<string | null>(null);
  const [draftSaved, setDraftSaved] = useState<string | null>(null);

  const managerCount = MANAGER_GROUPS.reduce((s, g) => s + (form.audience[g.k] ? g.c : 0), 0);
  const repCount = useMemo(() => (form.audience.reps ? resolveAudience(form.repAudience).length : 0), [form.audience.reps, form.repAudience]);
  const totalRecipients = managerCount + repCount;

  const mine = directives.filter(d => d.pm === sender);
  const sent = sentId ? directives.find(d => d.id === sentId) : undefined;

  const handleSend = () => {
    const d = pushDirective({
      title: form.title, message: form.message, priority: form.priority, kind: 'directive',
      audience: form.repAudience, from: sender, fromRole: senderRole,
      managerRecipients: managerCount, includeReps: form.audience.reps,
    });
    setSentId(d.id);
    notify({ type: 'success', title: 'Directive dispatched', msg: `${form.title} · ${totalRecipients} recipients` });
  };

  if (sent) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[640px] mx-auto">
        <div className="rounded-2xl bg-white border border-navy-100 p-6 sm:p-8 fade-up">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-100 mx-auto flex items-center justify-center mb-4">
              <Icon name="send" size={28} className="text-indigo-600" />
            </div>
            <h2 className="font-display text-2xl font-bold text-ink">Directive Dispatched</h2>
            <p className="text-sm text-navy-500 mt-1">{sent.recipientNames.length + sent.managerRecipients} recipients · in-app notification + email</p>
          </div>

          <div className="mt-5 p-4 rounded-xl bg-paper text-left space-y-2 text-xs">
            <p className="text-[10px] font-bold text-indigo-700 tracking-wider uppercase">Distribution Trail</p>
            {MANAGER_GROUPS.filter(g => form.audience[g.k]).map(g => (
              <div key={g.k} className="flex justify-between"><span className="text-navy-500">{g.l}</span><span className="font-mono">{g.c}</span></div>
            ))}
            {sent.recipientNames.length > 0 && (
              <div className="flex justify-between"><span className="text-navy-500">Field reps · My Day feed</span><span className="font-mono">{sent.recipientNames.length}</span></div>
            )}
          </div>

          <div className="mt-4 p-4 rounded-xl border border-indigo-100">
            <p className="text-[10px] font-bold text-indigo-700 tracking-wider uppercase mb-2">Acknowledgement</p>
            <DirectiveTracker directive={sent} notify={notify} accent="indigo" defaultOpen />
          </div>

          <button
            onClick={() => { setSentId(null); setForm(EMPTY_FORM); }}
            className="mt-5 w-full py-3 rounded-xl bg-indigo-600 text-white font-display font-semibold btn-press hover:bg-indigo-700"
          >
            Compose another directive
          </button>
        </div>
        {node}
      </div>
    );
  }

  const priorities: { k: Priority; l: string; c: string }[] = [
    { k: 'normal', l: 'Normal', c: 'navy' },
    { k: 'high', l: 'High Priority', c: 'amber' },
    { k: 'urgent', l: 'Urgent', c: 'rose' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1000px] mx-auto space-y-6">
      <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden fade-up">
        <div className="px-5 sm:px-6 py-5 border-b border-navy-100 bg-gradient-to-r from-indigo-50 to-paper">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Icon name="send" size={16} className="text-white" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-ink">Push Directive</h2>
              <p className="text-sm text-navy-500">Strategy, policy changes or urgent updates to the people you choose</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5">
          <div className="md:col-span-3 p-5 sm:p-6 space-y-4 md:border-r border-navy-100">
            <div>
              <label className="text-xs font-bold text-navy-700 tracking-wider uppercase">Directive Title</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Q3 Coflin Focus Initiative"
                className="input-field w-full mt-1.5 px-3 py-2.5 rounded-xl bg-paper border border-navy-200 text-sm text-ink"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-navy-700 tracking-wider uppercase">Message</label>
              <textarea
                rows={6}
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder="Effective immediately, all RSMs to prioritise Coflin Forte 600mg detailing in institutional accounts. Q3 targets revised: +25% on respiratory portfolio."
                className="input-field w-full mt-1.5 p-3 rounded-xl bg-paper border border-navy-200 text-sm resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-navy-700 tracking-wider uppercase mb-2 block">Priority</label>
              <div className="grid grid-cols-3 gap-2">
                {priorities.map(p => (
                  <button
                    key={p.k}
                    onClick={() => setForm({ ...form, priority: p.k })}
                    className={`py-2 rounded-lg text-xs font-bold border-2 transition-all ${
                      form.priority === p.k ?
                        (p.c === 'rose' ? 'bg-rose-500 border-rose-500 text-white' :
                         p.c === 'amber' ? 'bg-amber-500 border-amber-500 text-white' :
                         'bg-navy-700 border-navy-700 text-white') :
                        'border-navy-200 text-navy-700 hover:bg-paper'
                    }`}
                  >{p.l}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-2 p-5 sm:p-6 bg-paper space-y-4">
            <div>
              <p className="text-xs font-bold text-navy-700 tracking-wider uppercase mb-2">Managers</p>
              <div className="space-y-1.5">
                {MANAGER_GROUPS.map(g => (
                  <label
                    key={g.k}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      form.audience[g.k] ? 'bg-white border border-indigo-200' : 'hover:bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.audience[g.k]}
                      onChange={e => setForm({ ...form, audience: { ...form.audience, [g.k]: e.target.checked } })}
                      className="w-4 h-4 accent-indigo-600"
                    />
                    <span className="text-xs text-navy-700 flex-1">{g.l}</span>
                    <span className="text-[10px] font-mono font-bold text-navy-500">{g.c}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${form.audience.reps ? 'bg-white border border-indigo-200' : 'hover:bg-white'}`}>
                <input
                  type="checkbox"
                  checked={form.audience.reps}
                  onChange={e => setForm({ ...form, audience: { ...form.audience, reps: e.target.checked } })}
                  className="w-4 h-4 accent-indigo-600"
                />
                <span className="text-xs font-bold text-navy-700 flex-1">Field reps</span>
                <span className="text-[10px] font-mono font-bold text-navy-500">{repCount}</span>
              </label>
              {form.audience.reps && (
                <div className="mt-2 p-3 rounded-xl bg-white border border-navy-100">
                  <AudiencePicker value={form.repAudience} onChange={a => setForm({ ...form, repAudience: a })} accent="indigo" />
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-indigo-600 text-white">
              <p className="text-[10px] font-bold text-indigo-200 tracking-wider uppercase">Total Recipients</p>
              <p className="font-display text-2xl font-bold mt-0.5">{totalRecipients.toLocaleString()}</p>
              <p className="text-[10px] text-indigo-200 mt-0.5">{managerCount} managers · {repCount} reps · acknowledgement tracked per rep</p>
            </div>
          </div>
        </div>

        <div className="px-5 sm:px-6 py-4 border-t border-navy-100 flex gap-2 items-center">
          <button
            onClick={() => setDraftSaved(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))}
            className="flex-1 py-2.5 rounded-lg border border-navy-200 text-sm font-bold text-navy-700 hover:bg-paper btn-press"
          >
            {draftSaved ? `Draft saved ${draftSaved}` : 'Save Draft'}
          </button>
          <button
            onClick={handleSend}
            disabled={!form.title || !form.message || totalRecipients === 0}
            className="flex-1 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 btn-press flex items-center justify-center gap-1.5"
          >
            <Icon name="send" size={14} /> Dispatch to {totalRecipients} recipients
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden fade-up stagger-1">
        <div className="px-5 py-4 border-b border-navy-100">
          <h3 className="font-display font-bold text-ink">Your directives</h3>
          <p className="text-xs text-navy-500 mt-0.5">Acknowledgement by rep · remind anyone who has not confirmed</p>
        </div>
        {mine.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-navy-500">Nothing sent from this desk yet. Directives you dispatch are tracked here.</p>
        ) : (
          <div className="divide-y divide-navy-50">
            {mine.map(d => (
              <div key={d.id} className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display font-semibold text-sm text-ink">{d.title}</p>
                    <span className="px-1.5 py-0.5 rounded bg-navy-50 text-navy-700 text-[9px] font-bold uppercase">{d.priority}</span>
                  </div>
                  <p className="text-[11px] text-navy-500 mt-0.5">{d.date}</p>
                  <p className="text-xs text-navy-600 mt-1.5 line-clamp-2">{d.message}</p>
                </div>
                <DirectiveTracker directive={d} notify={notify} accent="indigo" />
              </div>
            ))}
          </div>
        )}
      </div>
      {node}
    </div>
  );
}
