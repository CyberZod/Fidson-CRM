import { useMemo, useState } from 'react';
import Icon from './Icon';
import { CHANNEL_LABEL, LIVE_REP, ROSTER, audienceLabel, useMarketing, type TrackedDirective } from '../stores/marketing';
import type { ToastInput } from '../types';

interface DirectiveTrackerProps {
  directive: TrackedDirective;
  notify: (t: ToastInput) => void;
  accent?: 'violet' | 'indigo';
  defaultOpen?: boolean;
}

type Tab = 'pending' | 'acknowledged' | 'all';

export default function DirectiveTracker({ directive: d, notify, accent = 'violet', defaultOpen = false }: DirectiveTrackerProps) {
  const { remindDirective } = useMarketing();
  const [open, setOpen] = useState(defaultOpen);
  const [tab, setTab] = useState<Tab>('pending');
  const [query, setQuery] = useState('');

  const total = d.recipientNames.length;
  const acked = d.recipientNames.filter(n => d.acks[n]).length;
  const pending = total - acked;
  const pct = total ? Math.round((acked / total) * 100) : 0;
  const bar = accent === 'indigo' ? 'bg-indigo-600' : 'bg-violet-600';

  const rows = useMemo(() => {
    const byName = new Map(ROSTER.map(r => [r.name, r]));
    return d.recipientNames
      .map(n => ({ rep: byName.get(n)!, at: d.acks[n] }))
      .filter(r => r.rep && (tab === 'all' || (tab === 'acknowledged' ? r.at : !r.at)))
      .filter(r => !query || r.rep.name.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => (a.rep.name === LIVE_REP ? -1 : b.rep.name === LIVE_REP ? 1 : 0));
  }, [d, tab, query]);

  if (total === 0) {
    return (
      <p className="text-[11px] text-navy-500">Sent to {d.managerRecipients} managers · no field reps in this audience</p>
    );
  }

  const remind = () => {
    const n = remindDirective(d.id);
    notify({ type: 'info', title: 'Reminder sent', msg: `${n} rep${n === 1 ? '' : 's'} nudged by push notification and email · ${d.title}` });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs text-navy-700"><strong className="font-mono text-ink">{acked} of {total}</strong> acknowledged</p>
        <span className="text-[10px] font-mono text-navy-500">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-navy-100 overflow-hidden">
        <div className={`h-full rounded-full ${bar} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[10px] text-navy-500">{audienceLabel(d.audience)}{d.managerRecipients ? ` · plus ${d.managerRecipients} managers` : ''}{d.remindedAt ? ` · reminded ${d.remindedAt}` : ''}</p>

      <div className="flex items-center gap-2 pt-1 flex-wrap">
        <button type="button" onClick={() => setOpen(!open)} className="px-2.5 py-1.5 rounded-lg border border-navy-200 text-[11px] font-bold text-navy-700 hover:bg-paper btn-press flex items-center gap-1">
          <Icon name={open ? 'chevronUp' : 'chevronDown'} size={12} /> {open ? 'Hide recipients' : 'Per-rep status'}
        </button>
        {pending > 0 && (
          <button type="button" onClick={remind} className="px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-700 hover:bg-amber-100 btn-press flex items-center gap-1">
            <Icon name="bell" size={12} /> Remind non-acknowledgers ({pending})
          </button>
        )}
      </div>

      {open && (
        <div className="mt-2 rounded-xl border border-navy-100 overflow-hidden fade-up">
          <div className="px-3 py-2 bg-paper border-b border-navy-100 flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-white rounded-md p-0.5 border border-navy-100">
              {([{ k: 'pending', l: `Pending ${pending}` }, { k: 'acknowledged', l: `Done ${acked}` }, { k: 'all', l: 'All' }] as { k: Tab; l: string }[]).map(t => (
                <button key={t.k} type="button" onClick={() => setTab(t.k)} className={`px-2 py-1 rounded text-[10px] font-bold ${tab === t.k ? 'bg-navy-700 text-white' : 'text-navy-500'}`}>{t.l}</button>
              ))}
            </div>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Find rep" className="input-field flex-1 min-w-[100px] px-2 py-1 rounded-md bg-white border border-navy-200 text-[11px]" />
          </div>
          <div className="max-h-56 overflow-y-auto divide-y divide-navy-50">
            {rows.length === 0 ? (
              <p className="px-3 py-4 text-center text-[11px] text-navy-500">Nobody in this list</p>
            ) : rows.map(({ rep, at }) => (
              <div key={rep.name} className="px-3 py-2 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-ink truncate">
                    {rep.name}{rep.name === LIVE_REP && <span className="ml-1.5 px-1 py-0.5 rounded bg-sky-50 text-sky-700 text-[9px] font-bold">LIVE DEMO REP</span>}
                  </p>
                  <p className="text-[10px] text-navy-500">{CHANNEL_LABEL[rep.channel]} · {rep.region} · {rep.territory}</p>
                </div>
                {at ? (
                  <span className="px-2 py-0.5 rounded-full bg-leaf-50 text-leaf-700 border border-leaf-200 text-[10px] font-bold flex items-center gap-1">
                    <Icon name="check" size={10} strokeWidth={3} /> {at}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                    {d.reminders ? `Reminded ×${d.reminders}` : 'Pending'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
