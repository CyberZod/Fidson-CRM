import { useMemo, useState } from 'react';
import Icon from './Icon';

interface NSMDirectiveViewProps {
  onSendDirective: (form: DirectiveForm) => void;
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
}

const EMPTY_FORM: DirectiveForm = {
  title: '',
  message: '',
  priority: 'normal',
  audience: { dms: true, rsms: true, fsms: true, asms: true, pms: true, reps: false },
};

const AUDIENCE_COUNTS: Record<keyof AudienceMap, number> = {
  dms: 2, rsms: 6, fsms: 4, asms: 14, pms: 8, reps: 142,
};

export default function NSMDirectiveView({ onSendDirective }: NSMDirectiveViewProps) {
  const [form, setForm] = useState<DirectiveForm>(EMPTY_FORM);
  const [sent, setSent] = useState(false);

  const totalRecipients = useMemo(() => {
    return (Object.keys(form.audience) as (keyof AudienceMap)[])
      .reduce((sum, k) => sum + (form.audience[k] ? AUDIENCE_COUNTS[k] : 0), 0);
  }, [form.audience]);

  const handleSend = () => {
    setSent(true);
    onSendDirective(form);
  };

  if (sent) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[600px] mx-auto">
        <div className="rounded-2xl bg-white border border-navy-100 p-8 text-center fade-up">
          <div className="w-20 h-20 rounded-full bg-indigo-100 mx-auto flex items-center justify-center mb-4">
            <Icon name="send" size={36} className="text-indigo-600" />
          </div>
          <h2 className="font-display text-2xl font-bold text-ink">Directive Dispatched</h2>
          <p className="text-sm text-navy-500 mt-1">{totalRecipients} recipients notified across the network</p>

          <div className="mt-5 p-4 rounded-xl bg-paper text-left">
            <p className="text-[10px] font-bold text-indigo-700 tracking-wider uppercase mb-2">Distribution Trail</p>
            <div className="space-y-2 text-xs">
              {form.audience.dms && <div className="flex justify-between"><span className="text-navy-500">Division Managers</span><span className="font-mono">2</span></div>}
              {form.audience.rsms && <div className="flex justify-between"><span className="text-navy-500">Regional Sales Mgrs</span><span className="font-mono">6</span></div>}
              {form.audience.fsms && <div className="flex justify-between"><span className="text-navy-500">Field Sales Mgrs</span><span className="font-mono">4</span></div>}
              {form.audience.asms && <div className="flex justify-between"><span className="text-navy-500">Area Sales Mgrs</span><span className="font-mono">14</span></div>}
              {form.audience.pms && <div className="flex justify-between"><span className="text-navy-500">Product Managers</span><span className="font-mono">8</span></div>}
              {form.audience.reps && <div className="flex justify-between"><span className="text-navy-500">All Reps</span><span className="font-mono">142</span></div>}
            </div>
          </div>

          <button
            onClick={() => { setSent(false); setForm(EMPTY_FORM); }}
            className="mt-5 w-full py-3 rounded-xl bg-indigo-600 text-white font-display font-semibold btn-press hover:bg-indigo-700"
          >
            Compose another directive
          </button>
        </div>
      </div>
    );
  }

  const priorities: { k: Priority; l: string; c: string }[] = [
    { k: 'normal', l: 'Normal', c: 'navy' },
    { k: 'high', l: 'High Priority', c: 'amber' },
    { k: 'urgent', l: 'Urgent', c: 'rose' },
  ];

  const groups: { k: keyof AudienceMap; l: string; c: number }[] = [
    { k: 'dms', l: 'Division Managers', c: 2 },
    { k: 'rsms', l: 'Regional Sales Mgrs', c: 6 },
    { k: 'fsms', l: 'Field Sales Mgrs', c: 4 },
    { k: 'asms', l: 'Area Sales Mgrs', c: 14 },
    { k: 'pms', l: 'Product Managers', c: 8 },
    { k: 'reps', l: 'All Reps (national)', c: 142 },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[900px] mx-auto">
      <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden fade-up">
        <div className="px-5 sm:px-6 py-5 border-b border-navy-100 bg-gradient-to-r from-indigo-50 to-paper">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Icon name="send" size={16} className="text-white" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-ink">Push National Directive</h2>
              <p className="text-sm text-navy-500">Broadcast strategy, policy changes, or urgent updates across Fidson</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-2 p-5 sm:p-6 space-y-4 border-r border-navy-100">
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
                placeholder="Effective immediately, all RSMs to prioritize Coflin Forte 600mg detailing in institutional accounts. Q3 targets revised: +25% on respiratory portfolio. PM Akande to push updated detailing pack by EOW..."
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

          <div className="p-5 sm:p-6 bg-paper">
            <p className="text-xs font-bold text-navy-700 tracking-wider uppercase mb-3">Distribution</p>
            <div className="space-y-1.5">
              {groups.map(g => (
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

            <div className="mt-4 p-3 rounded-xl bg-indigo-600 text-white">
              <p className="text-[10px] font-bold text-indigo-200 tracking-wider uppercase">Total Recipients</p>
              <p className="font-display text-2xl font-bold mt-0.5">{totalRecipients.toLocaleString()}</p>
              <p className="text-[10px] text-indigo-200 mt-0.5">In-app notification + email</p>
            </div>
          </div>
        </div>

        <div className="px-5 sm:px-6 py-4 border-t border-navy-100 flex gap-2">
          <button className="flex-1 py-2.5 rounded-lg border border-navy-200 text-sm font-bold text-navy-700 hover:bg-paper btn-press">Save Draft</button>
          <button
            onClick={handleSend}
            disabled={!form.title || !form.message || totalRecipients === 0}
            className="flex-1 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 btn-press flex items-center justify-center gap-1.5"
          >
            <Icon name="send" size={14} /> Dispatch to {totalRecipients} recipients
          </button>
        </div>
      </div>
    </div>
  );
}
