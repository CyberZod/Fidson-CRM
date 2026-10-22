import { useState } from 'react';
import Icon from './Icon';
import { useTeam, MANAGERS, type ActivityCategory, type ManagerKey } from '../stores/team';
import { todayLong } from '../utils/dates';

const CAT_COLORS: Record<ActivityCategory, string> = {
  approval: 'bg-leaf-50 border-leaf-200 text-leaf-700',
  field: 'bg-sky-50 border-sky-200 text-sky-700',
  coaching: 'bg-violet-50 border-violet-200 text-violet-700',
  admin: 'bg-navy-50 border-navy-200 text-navy-700',
  meeting: 'bg-amber-50 border-amber-200 text-amber-700',
  system: 'bg-paper border-navy-100 text-navy-500',
  message: 'bg-sky-50 border-sky-200 text-sky-700',
  training: 'bg-leaf-50 border-leaf-200 text-leaf-700',
};

const FILTERS: { k: 'all' | ActivityCategory; l: string }[] = [
  { k: 'all', l: 'All' }, { k: 'field', l: 'Field' }, { k: 'coaching', l: 'Coaching' },
  { k: 'message', l: 'Messages' }, { k: 'training', l: 'Training' }, { k: 'approval', l: 'Approvals' },
];

interface ASMActivityLogViewProps {
  manager?: ManagerKey;
}

export default function ASMActivityLogView({ manager = 'asm' }: ASMActivityLogViewProps) {
  const { activity } = useTeam();
  const [filter, setFilter] = useState<'all' | ActivityCategory>('all');
  const mine = activity.filter(a => a.by === manager);
  const shown = filter === 'all' ? mine : mine.filter(a => a.cat === filter);
  const count = (c: ActivityCategory) => mine.filter(a => a.cat === c).length;
  const visibleTo = manager === 'asm' ? 'BM Cestra and RSM Tunde Bakare' : 'DM Kemi Adeyemi';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto">
      <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden fade-up">
        <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-display font-bold text-ink">Manager Activity Log</h3>
            <p className="text-xs text-navy-500 mt-0.5">{MANAGERS[manager].name} · Auto-captured from your actions · Visible to {visibleTo}</p>
          </div>
          <span className="px-2 py-1 rounded-full bg-sky-50 text-sky-700 text-[10px] font-bold flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-500 pulse-dot" />RECORDING
          </span>
        </div>

        <div className="p-5">
          <div className="mb-4 p-3 rounded-xl bg-paper border border-navy-100">
            <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase mb-1">Today's Summary</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { l: 'Coaching Entries', v: count('coaching') },
                { l: 'Field Visits', v: count('field') },
                { l: 'Messages Sent', v: count('message') },
                { l: 'Approvals Given', v: count('approval') },
              ].map(s => (
                <div key={s.l}>
                  <p className="stat-label text-navy-400">{s.l}</p>
                  <p className="font-display text-xl font-bold text-ink mt-0.5">{s.v}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <p className="stat-label text-navy-400">Timeline · {todayLong()}</p>
            <div className="flex gap-1 flex-wrap">
              {FILTERS.map(f => (
                <button key={f.k} onClick={() => setFilter(f.k)} className={`px-2 py-1 rounded-md text-[10px] font-bold ${filter === f.k ? 'bg-navy-700 text-white' : 'bg-paper text-navy-600 hover:bg-navy-50'}`}>{f.l}</button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            {shown.length === 0 && (
              <div className="py-8 text-center text-sm text-navy-500 flex flex-col items-center gap-2">
                <Icon name="activity" size={20} className="text-navy-300" />
                Nothing in this category yet today.
              </div>
            )}
            {shown.map((a, i) => (
              <div key={a.id} className="flex items-start gap-3 p-2 hover:bg-paper rounded-lg">
                <div className="font-mono text-[11px] text-navy-500 font-bold w-12 flex-shrink-0 pt-1">{a.t}</div>
                <div className="w-2 h-2 rounded-full bg-sky-500 mt-2 flex-shrink-0 relative">
                  {i < shown.length - 1 && <div className="absolute top-2 left-1/2 -translate-x-1/2 w-px h-8 bg-navy-200" />}
                </div>
                <div className="flex-1 min-w-0 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display font-semibold text-sm text-ink">{a.n}</p>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${CAT_COLORS[a.cat]}`}>{a.cat.toUpperCase()}</span>
                  </div>
                  <p className="text-[11px] text-navy-500 mt-0.5">{a.d}</p>
                  <p className="text-[10px] text-navy-400 mt-0.5 font-mono">{a.who}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
