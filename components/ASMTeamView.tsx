import { useState } from 'react';
import Icon from './Icon';
import { useFlash } from './TeamFlash';
import { useTeam, MANAGERS, shortDate, isoDay, moduleFor, isOverdue, type CoachingKind } from '../stores/team';
import type { ToastInput } from '../types';

interface RepEntry {
  n: string;
  z: string;
  target: number;
  visits: number;
  conv: number;
  status: 'star' | 'attention' | 'ok';
}

const REPS: RepEntry[] = [
  { n: 'Adaeze Okafor', z: 'V.I. East', target: 87, visits: 142, conv: 42, status: 'star' },
  { n: 'Tope Adeola', z: 'Lekki Phase 1', target: 91, visits: 156, conv: 48, status: 'star' },
  { n: 'Bayo Salami', z: 'Lekki Phase 2', target: 68, visits: 98, conv: 31, status: 'ok' },
  { n: 'Yetunde Cole', z: 'V.I. West', target: 54, visits: 78, conv: 24, status: 'attention' },
];

const MICRO_TEMPLATES = [
  'Lead with the dosing comparison on Coflin Forte before price comes up.',
  'Log the HCP objection in the visit notes so PM can answer it this week.',
  'Two A-tier accounts untouched this week. Book them before Friday.',
];

const KIND_LABEL: Record<CoachingKind, { l: string; c: string }> = {
  note: { l: 'NOTE', c: 'bg-navy-50 text-navy-700 border-navy-200' },
  '1:1': { l: '1:1', c: 'bg-violet-50 text-violet-700 border-violet-200' },
  'micro-coach': { l: 'MICRO-COACH', c: 'bg-sky-50 text-sky-700 border-sky-200' },
  scheduled: { l: 'BOOKED', c: 'bg-amber-50 text-amber-700 border-amber-200' },
};

interface ASMTeamViewProps {
  onToast?: (t: ToastInput) => void;
}

export default function ASMTeamView({ onToast }: ASMTeamViewProps) {
  const { coaching, training, addCoaching, sendMessage } = useTeam();
  const { banner, notify } = useFlash(onToast);
  const [selectedRep, setSelectedRep] = useState(0);
  const [note, setNote] = useState('');
  const [panel, setPanel] = useState<'none' | 'micro' | 'oneone' | 'schedule'>('none');
  const [micro, setMicro] = useState(MICRO_TEMPLATES[0]);
  const [oneone, setOneone] = useState({ topics: '', actions: '' });
  const [slot, setSlot] = useState({ day: isoDay(2), time: '10:00' });

  const r = REPS[selectedRep];
  const first = r.n.split(' ')[0];
  const history = coaching.filter(c => c.rep === r.n);
  const tasks = training.filter(t => t.rep === r.n);
  const lastCoach = (name: string) => coaching.find(c => c.rep === name)?.date;

  const pick = (i: number) => { setSelectedRep(i); setPanel('none'); setNote(''); };

  const saveNote = () => {
    if (!note.trim()) return;
    addCoaching(r.n, 'asm', 'note', note.trim());
    setNote('');
    notify({ type: 'success', title: 'Coaching note saved', msg: `${r.n} · visible to BM Cestra in your activity log` });
  };

  const sendMicro = () => {
    if (!micro.trim()) return;
    sendMessage(r.n, 'asm', 'manager', micro.trim());
    addCoaching(r.n, 'asm', 'micro-coach', micro.trim());
    setPanel('none');
    notify({ type: 'success', title: `Micro-coach sent to ${first}`, msg: 'Delivered to their inbox on My Day' });
  };

  const logOneOne = () => {
    if (!oneone.topics.trim()) return;
    addCoaching(r.n, 'asm', '1:1', `${oneone.topics.trim()}${oneone.actions.trim() ? ` · Actions: ${oneone.actions.trim()}` : ''}`);
    setOneone({ topics: '', actions: '' });
    setPanel('none');
    notify({ type: 'success', title: '1:1 logged', msg: `${r.n} · added to coaching history` });
  };

  const schedule = () => {
    const when = `${shortDate(slot.day)} at ${slot.time}`;
    addCoaching(r.n, 'asm', 'scheduled', `1:1 booked for ${when}`);
    sendMessage(r.n, 'asm', 'manager', `I have booked a 1:1 with you for ${when}. Bring your pipeline for the week.`);
    setPanel('none');
    notify({ type: 'success', title: '1:1 scheduled', msg: `${r.n} · ${when} · invite sent` });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-4">
      {banner}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 fade-up">
          <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-navy-100">
              <h3 className="font-display font-bold text-ink text-sm">My 4 Reps</h3>
            </div>
            <div className="p-2">
              {REPS.map((rep, i) => {
                const last = lastCoach(rep.n);
                return (
                  <button
                    key={rep.n}
                    onClick={() => pick(i)}
                    className={`w-full p-3 rounded-lg text-left flex items-center gap-3 transition-colors ${
                      selectedRep === i ? 'bg-sky-50 border border-sky-200' : 'hover:bg-paper'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full font-display font-bold text-xs flex items-center justify-center flex-shrink-0 ${
                      rep.status === 'star' ? 'bg-sky-100 text-sky-700' :
                      rep.status === 'attention' ? 'bg-amber-100 text-amber-700' : 'bg-navy-100 text-navy-700'
                    }`}>{rep.n.split(' ').map(x => x[0]).join('')}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-sm text-ink truncate">{rep.n}</p>
                      <p className="text-[11px] text-navy-500">{rep.z}{last ? ` · coached ${last === isoDay() ? 'today' : shortDate(last)}` : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xs font-bold text-ink">{rep.target}%</p>
                      {rep.status === 'attention' && <span className="text-[9px] font-bold text-amber-700">ATTN</span>}
                      {rep.status === 'star' && <Icon name="trending" size={10} className="text-sky-600 ml-auto" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 fade-up stagger-1 space-y-4">
          <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold ${
                  r.status === 'star' ? 'bg-sky-500' : r.status === 'attention' ? 'bg-amber-500' : 'bg-navy-700'
                } text-white`}>{r.n.split(' ').map(x => x[0]).join('')}</div>
                <div>
                  <h3 className="font-display font-bold text-ink">{r.n}</h3>
                  <p className="text-xs text-navy-500">{r.z} · Med Rep · Institution</p>
                </div>
              </div>
              <button onClick={() => setPanel(panel === 'micro' ? 'none' : 'micro')} className="px-3 py-1.5 rounded-lg bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 btn-press">
                <Icon name={panel === 'micro' ? 'x' : 'send'} size={12} /> {panel === 'micro' ? 'Cancel' : 'Send micro-coach'}
              </button>
            </div>
            {panel === 'micro' && (
              <div className="px-5 py-4 border-b border-navy-100 bg-sky-50/40 space-y-2">
                <p className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">Micro-coach to {first} · arrives in their My Day inbox</p>
                <div className="flex flex-wrap gap-1.5">
                  {MICRO_TEMPLATES.map(t => (
                    <button key={t} onClick={() => setMicro(t)} className={`px-2 py-1 rounded-md text-[11px] border text-left ${micro === t ? 'bg-sky-100 border-sky-300 text-sky-800' : 'bg-white border-navy-200 text-navy-700'}`}>{t}</button>
                  ))}
                </div>
                <textarea value={micro} onChange={e => setMicro(e.target.value)} rows={2} className="input-field w-full p-2 rounded-lg bg-white border border-navy-200 text-sm resize-none" />
                <button onClick={sendMicro} disabled={!micro.trim()} className="px-3 py-1.5 rounded-md bg-sky-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 btn-press">
                  <Icon name="send" size={12} /> Send to {first}
                </button>
              </div>
            )}
            <div className="grid grid-cols-3 gap-0">
              {[
                { l: 'Q2 Target', v: `${r.target}%`, c: r.target > 70 ? 'sky' : 'amber' },
                { l: 'Visits QTD', v: r.visits.toString(), c: 'navy' },
                { l: 'Conversion', v: `${r.conv}%`, c: 'navy' },
              ].map((s, i) => (
                <div key={i} className="p-5 border-r last:border-r-0 border-navy-100">
                  <p className="stat-label text-navy-400">{s.l}</p>
                  <p className={`font-display text-2xl font-bold mt-1 ${
                    s.c === 'sky' ? 'text-sky-700' : s.c === 'amber' ? 'text-amber-700' : 'text-ink'
                  }`}>{s.v}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-ink">Coaching History</h3>
                <p className="text-[11px] text-navy-500 mt-0.5">{history.length} entr{history.length === 1 ? 'y' : 'ies'} for {first}</p>
              </div>
              <button onClick={() => setPanel(panel === 'oneone' ? 'none' : 'oneone')} className="px-3 py-1 rounded-md bg-paper text-xs font-bold text-navy-700 flex items-center gap-1 btn-press">
                <Icon name={panel === 'oneone' ? 'x' : 'plus'} size={12} /> {panel === 'oneone' ? 'Cancel' : 'Log 1:1'}
              </button>
            </div>
            {panel === 'oneone' && (
              <div className="px-5 py-4 border-b border-navy-100 bg-violet-50/40 space-y-2">
                <p className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">1:1 with {first} · today</p>
                <textarea value={oneone.topics} onChange={e => setOneone({ ...oneone, topics: e.target.value })} rows={2} placeholder="What you covered" className="input-field w-full p-2 rounded-lg bg-white border border-navy-200 text-sm resize-none" />
                <input value={oneone.actions} onChange={e => setOneone({ ...oneone, actions: e.target.value })} placeholder="Agreed actions (optional)" className="input-field w-full px-2 py-1.5 rounded-lg bg-white border border-navy-200 text-sm" />
                <button onClick={logOneOne} disabled={!oneone.topics.trim()} className="px-3 py-1.5 rounded-md bg-violet-600 disabled:opacity-50 text-white text-xs font-bold btn-press">Save 1:1</button>
              </div>
            )}
            <div className="divide-y divide-navy-50">
              {history.length === 0 && <p className="px-5 py-4 text-sm text-navy-500">No coaching logged for {first} yet.</p>}
              {history.map(n => (
                <div key={n.id} className="px-5 py-3 flex gap-3">
                  <div className="text-[11px] font-mono text-navy-400 font-bold w-14 flex-shrink-0 pt-0.5">{n.date === isoDay() ? 'Today' : shortDate(n.date)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${KIND_LABEL[n.kind].c}`}>{KIND_LABEL[n.kind].l}</span>
                      <span className="text-[10px] text-navy-400">{MANAGERS[n.by].name} ({MANAGERS[n.by].role})</span>
                    </div>
                    <p className="text-sm text-navy-700">{n.text}</p>
                  </div>
                </div>
              ))}
              <div className="px-5 py-3 bg-paper">
                <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add coaching note..." rows={2} className="input-field w-full p-2 rounded-lg bg-white border border-navy-200 text-sm resize-none" />
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <button onClick={saveNote} disabled={!note.trim()} className="px-3 py-1.5 rounded-md bg-sky-500 disabled:opacity-50 text-white text-xs font-bold btn-press">Save Note</button>
                  <button onClick={() => setPanel(panel === 'schedule' ? 'none' : 'schedule')} className="px-3 py-1.5 rounded-md bg-white border border-navy-200 text-xs font-bold text-navy-700 btn-press">Schedule 1:1</button>
                  {panel === 'schedule' && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <input type="date" value={slot.day} onChange={e => setSlot({ ...slot, day: e.target.value })} className="input-field px-2 py-1 rounded-md bg-white border border-navy-200 text-xs" />
                      <input type="time" value={slot.time} onChange={e => setSlot({ ...slot, time: e.target.value })} className="input-field px-2 py-1 rounded-md bg-white border border-navy-200 text-xs" />
                      <button onClick={schedule} className="px-3 py-1.5 rounded-md bg-navy-700 text-white text-xs font-bold btn-press">Book</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-navy-100">
              <h3 className="font-display font-bold text-ink text-sm">Training Assigned to {first}</h3>
            </div>
            <div className="divide-y divide-navy-50">
              {tasks.length === 0 && <p className="px-5 py-3 text-xs text-navy-500">Nothing assigned. Use Training Tasks to assign a module.</p>}
              {tasks.map(t => {
                const mod = moduleFor(t.moduleId);
                const late = isOverdue(t);
                return (
                  <div key={t.id} className="px-5 py-2.5 flex items-center gap-3">
                    <p className="text-xs text-ink flex-1 min-w-0 truncate">{mod.title} · {mod.minutes} min</p>
                    <div className="w-24 h-1.5 rounded-full bg-navy-100 overflow-hidden">
                      <div className={`h-full rounded-full ${t.status === 'done' ? 'bg-leaf-500' : late ? 'bg-rose-400' : 'bg-sky-500'}`} style={{ width: `${t.progress}%` }} />
                    </div>
                    <span className={`text-[10px] font-bold w-20 text-right ${t.status === 'done' ? 'text-leaf-700' : late ? 'text-rose-600' : 'text-navy-500'}`}>
                      {t.status === 'done' ? 'Done' : late ? 'Overdue' : `${t.progress}%`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
