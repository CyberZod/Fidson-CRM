import { useState } from 'react';
import Icon from './Icon';
import { useFlash } from './TeamFlash';
import {
  useTeam, repsFor, MANAGERS, TRAINING_CATALOGUE, CURRENT_REP, moduleFor, isOverdue, shortDate, isoDay,
  type ManagerKey, type TrainingTask,
} from '../stores/team';
import type { ToastInput } from '../types';

interface TrainingTasksViewProps {
  manager?: ManagerKey;
  onToast?: (t: ToastInput) => void;
}

type StatusFilter = 'all' | 'not-started' | 'in-progress' | 'done' | 'overdue';

function StatusPill({ t }: { t: TrainingTask }) {
  if (t.status === 'done') return <span className="px-1.5 py-0.5 rounded bg-leaf-50 border border-leaf-200 text-leaf-700 text-[9px] font-bold">DONE</span>;
  if (isOverdue(t)) return <span className="px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-[9px] font-bold">OVERDUE</span>;
  if (t.status === 'in-progress') return <span className="px-1.5 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-700 text-[9px] font-bold">IN PROGRESS</span>;
  return <span className="px-1.5 py-0.5 rounded bg-paper border border-navy-200 text-navy-600 text-[9px] font-bold">NOT STARTED</span>;
}

export default function TrainingTasksView({ manager = 'asm', onToast }: TrainingTasksViewProps) {
  const { training, assignTraining, remindTraining } = useTeam();
  const { banner, notify } = useFlash(onToast);
  const reps = repsFor(manager);
  const repNames = reps.map(r => r.name);
  const [showForm, setShowForm] = useState(false);
  const [moduleId, setModuleId] = useState(TRAINING_CATALOGUE[0].id);
  const [picked, setPicked] = useState<string[]>([]);
  const [due, setDue] = useState(isoDay(3));
  const [filter, setFilter] = useState<StatusFilter>('all');

  const scoped = training.filter(t => repNames.includes(t.rep));
  const done = scoped.filter(t => t.status === 'done').length;
  const overdue = scoped.filter(isOverdue).length;
  const rows = scoped.filter(t =>
    filter === 'all' ? true : filter === 'overdue' ? isOverdue(t) : t.status === filter && !(filter !== 'done' && isOverdue(t)),
  );

  const toggleRep = (n: string) => setPicked(p => p.includes(n) ? p.filter(x => x !== n) : [...p, n]);

  const assign = () => {
    if (picked.length === 0) return;
    assignTraining(picked, moduleId, due, manager);
    const mod = moduleFor(moduleId);
    notify({ type: 'success', title: 'Training assigned', msg: `${mod.title} · ${picked.length} rep${picked.length === 1 ? '' : 's'} · due ${shortDate(due)} · shows on their My Day` });
    setPicked([]);
    setShowForm(false);
  };

  const remind = (t: TrainingTask) => {
    remindTraining(t.id);
    notify({ type: 'info', title: `Reminder sent to ${t.rep}`, msg: `${moduleFor(t.moduleId).title} · in their inbox` });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 fade-up">
        <div>
          <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">{MANAGERS[manager].role} · {MANAGERS[manager].scope}</p>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">Training Tasks</h2>
          <p className="text-xs text-navy-500 mt-0.5">Assign short in-app modules to your reps and track completion</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-xl bg-navy-700 hover:bg-navy-800 text-white text-xs font-bold btn-press flex items-center gap-1.5">
          <Icon name={showForm ? 'x' : 'plus'} size={14} /> {showForm ? 'Cancel' : 'Assign training'}
        </button>
      </div>

      {banner}

      {showForm && (
        <div className="fade-up rounded-2xl bg-white border-2 border-navy-200 p-5 space-y-4">
          <div>
            <p className="text-[10px] font-bold text-navy-700 tracking-wider uppercase mb-2">Module</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {TRAINING_CATALOGUE.map(m => (
                <button key={m.id} onClick={() => setModuleId(m.id)} className={`p-3 rounded-xl border text-left flex items-center gap-3 ${moduleId === m.id ? 'border-navy-700 bg-navy-50' : 'border-navy-100 hover:bg-paper'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${moduleId === m.id ? 'bg-navy-700 text-white' : 'bg-paper text-navy-700'}`}>
                    <Icon name="file" size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ink">{m.title}</p>
                    <p className="text-[10px] text-navy-500">{m.minutes} min · {m.sections} sections</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">Reps ({picked.length} selected)</p>
              <button onClick={() => setPicked(picked.length === repNames.length ? [] : repNames)} className="text-[11px] font-bold text-sky-700">
                {picked.length === repNames.length ? 'Clear' : 'Select all'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {reps.map(r => (
                <button key={r.name} onClick={() => toggleRep(r.name)} className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${picked.includes(r.name) ? 'bg-sky-50 border-sky-300 text-sky-800' : 'bg-white border-navy-200 text-navy-700'}`}>
                  {picked.includes(r.name) && <Icon name="check" size={12} strokeWidth={3} />}{r.name} <span className="text-navy-400 font-normal">· {r.territory}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <p className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">Due date</p>
              <input type="date" value={due} min={isoDay()} onChange={e => setDue(e.target.value)} className="input-field mt-1.5 px-3 py-2 rounded-xl bg-paper border border-navy-200 text-sm" />
            </div>
            <button onClick={assign} disabled={picked.length === 0} className="px-5 py-2.5 rounded-xl bg-navy-700 disabled:opacity-50 text-white text-sm font-display font-semibold btn-press flex items-center gap-1.5">
              <Icon name="send" size={14} /> Assign to {picked.length || 'reps'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { l: 'Assigned', v: scoped.length, d: `${reps.length} reps` },
          { l: 'Completed', v: scoped.length ? `${Math.round((done / scoped.length) * 100)}%` : '0%', d: `${done} done` },
          { l: 'In Progress', v: scoped.filter(t => t.status === 'in-progress' && !isOverdue(t)).length, d: 'started, not finished' },
          { l: 'Overdue', v: overdue, d: overdue ? 'send a reminder' : 'none late' },
        ].map((k, i) => (
          <div key={k.l} className={`fade-up stagger-${i + 1} p-4 rounded-2xl bg-white border border-navy-100`}>
            <p className="stat-label text-navy-400">{k.l}</p>
            <p className={`font-display text-2xl font-bold mt-1 ${k.l === 'Overdue' && overdue ? 'text-rose-600' : 'text-ink'}`}>{k.v}</p>
            <p className="text-[11px] text-navy-500 mt-0.5">{k.d}</p>
          </div>
        ))}
      </div>

      <div className="fade-up rounded-2xl bg-white border border-navy-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-navy-100 flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-display font-bold text-ink">Status by rep</h3>
          <div className="flex gap-1 flex-wrap">
            {([['all', 'All'], ['not-started', 'Not started'], ['in-progress', 'In progress'], ['done', 'Done'], ['overdue', 'Overdue']] as [StatusFilter, string][]).map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} className={`px-2 py-1 rounded-md text-[10px] font-bold ${filter === k ? 'bg-navy-700 text-white' : 'bg-paper text-navy-600 hover:bg-navy-50'}`}>{l}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-bold text-navy-400 tracking-wider uppercase border-b border-navy-100">
                <th className="px-5 py-2">Rep</th>
                <th className="px-3 py-2">Module</th>
                <th className="px-3 py-2">Due</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 w-40">Progress</th>
                <th className="px-5 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {rows.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-navy-500">No tasks match this filter.</td></tr>
              )}
              {rows.map(t => {
                const mod = moduleFor(t.moduleId);
                const late = isOverdue(t);
                return (
                  <tr key={t.id} className="hover:bg-paper">
                    <td className="px-5 py-2.5 font-semibold text-ink whitespace-nowrap">{t.rep}</td>
                    <td className="px-3 py-2.5 text-navy-700">{mod.title} · {mod.minutes} min<p className="text-[10px] text-navy-400">by {MANAGERS[t.assignedBy].name} ({MANAGERS[t.assignedBy].role})</p></td>
                    <td className={`px-3 py-2.5 font-mono text-xs whitespace-nowrap ${late ? 'text-rose-600 font-bold' : 'text-navy-600'}`}>{shortDate(t.due)}</td>
                    <td className="px-3 py-2.5"><StatusPill t={t} /></td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-navy-100 overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${t.status === 'done' ? 'bg-leaf-500' : late ? 'bg-rose-400' : 'bg-sky-500'}`} style={{ width: `${t.progress}%` }} />
                        </div>
                        <span className="font-mono text-[10px] text-navy-600 w-8 text-right">{t.progress}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      {t.status === 'done' ? (
                        <span className="text-[11px] text-leaf-700 font-bold">Complete</span>
                      ) : (
                        <button onClick={() => remind(t)} className="px-2.5 py-1 rounded-md border border-navy-200 text-[11px] font-bold text-navy-700 hover:bg-navy-50 btn-press">Remind</button>
                      )}
                    </td>
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

// Rep side: assigned training on My Day.
export function RepTrainingCard({ rep = CURRENT_REP }: { rep?: string }) {
  const { training, advanceTraining, completeTraining } = useTeam();
  const mine = training.filter(t => t.rep === rep).sort((a, b) => (a.status === 'done' ? 1 : 0) - (b.status === 'done' ? 1 : 0));
  const open = mine.filter(t => t.status !== 'done').length;
  if (mine.length === 0) return null;

  return (
    <div className="rounded-2xl bg-white border border-navy-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-bold text-ink text-sm">My Training</h3>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${open ? 'bg-amber-50 text-amber-700' : 'bg-leaf-50 text-leaf-700'}`}>{open ? `${open} to do` : 'All done'}</span>
      </div>
      <div className="space-y-2">
        {mine.map(t => {
          const mod = moduleFor(t.moduleId);
          const late = isOverdue(t);
          const step = Math.ceil(100 / mod.sections);
          const section = Math.min(mod.sections, Math.floor(t.progress / step) + 1);
          return (
            <div key={t.id} className={`p-3 rounded-xl border ${t.status === 'done' ? 'bg-leaf-50/50 border-leaf-100' : late ? 'border-rose-200 bg-rose-50/40' : 'border-navy-100'}`}>
              <div className="flex items-start gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${t.status === 'done' ? 'bg-leaf-500 text-white' : 'bg-navy-50 text-navy-700'}`}>
                  <Icon name={t.status === 'done' ? 'check' : 'file'} size={14} strokeWidth={t.status === 'done' ? 3 : 2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-ink">{mod.title} · {mod.minutes} min</p>
                  <p className={`text-[10px] mt-0.5 ${late ? 'text-rose-600 font-bold' : 'text-navy-500'}`}>
                    {t.status === 'done' ? 'Completed' : `${late ? 'Overdue · was due' : 'Due'} ${shortDate(t.due)}`} · from {MANAGERS[t.assignedBy].name.split(' ')[0]} ({MANAGERS[t.assignedBy].role})
                  </p>
                </div>
              </div>
              {t.status !== 'done' && (
                <>
                  <div className="mt-2 h-1.5 rounded-full bg-navy-100 overflow-hidden">
                    <div className="h-full rounded-full bg-leaf-500 transition-all" style={{ width: `${t.progress}%` }} />
                  </div>
                  <div className="mt-2 flex gap-2">
                    {t.status === 'not-started' ? (
                      <button onClick={() => advanceTraining(t.id, step)} className="flex-1 py-2.5 rounded-lg bg-leaf-500 text-white text-xs font-bold btn-press flex items-center justify-center gap-1">
                        Start <Icon name="arrowRight" size={12} />
                      </button>
                    ) : (
                      <>
                        <button onClick={() => advanceTraining(t.id, step)} className="flex-1 py-2.5 rounded-lg border border-navy-200 text-navy-700 text-xs font-bold btn-press">
                          Continue · section {section}/{mod.sections}
                        </button>
                        <button onClick={() => completeTraining(t.id)} className="flex-1 py-2.5 rounded-lg bg-leaf-500 text-white text-xs font-bold btn-press flex items-center justify-center gap-1">
                          <Icon name="check" size={12} strokeWidth={3} /> Complete
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
