import { useState, type FormEvent } from 'react';
import Icon from './Icon';
import { useFlash } from './TeamFlash';
import { useTeam, repsFor, FOCUS_SKUS, MANAGERS, clock, shortDate, isoDay, type ManagerKey, type JointVisit } from '../stores/team';
import type { ToastInput } from '../types';

interface ManagerFieldLogProps {
  manager?: ManagerKey;
  onToast?: (t: ToastInput) => void;
}

const GPS_FIXES = [
  '6.4281° N, 3.4219° E · ±9 m',
  '6.4474° N, 3.4723° E · ±14 m',
  '6.6018° N, 3.3515° E · ±11 m',
];

const CUSTOMERS = ['Lakeshore Specialist Hospital', 'MedPlus Lekki', 'Reddington Hospital', 'Eko Hospital, Ikeja', 'HealthPlus Surulere', 'Lagoon Hospital V.I.'];

export default function ManagerFieldLog({ manager = 'asm', onToast }: ManagerFieldLogProps) {
  const { ownVisits, jointVisits, logOwnVisit, logJointVisit } = useTeam();
  const { banner, notify } = useFlash(onToast);
  const reps = repsFor(manager);
  const me = MANAGERS[manager];
  const accent = manager === 'asm' ? 'sky' : 'navy';

  const [form, setForm] = useState<'none' | 'own' | 'joint'>('none');
  const [own, setOwn] = useState({ customer: '', checkIn: clock(), gps: '', notes: '' });
  const [locating, setLocating] = useState(false);
  const [joint, setJoint] = useState<{ kind: JointVisit['kind']; rep: string; customer: string; product: string; minutes: number; notes: string }>({
    kind: 'accompaniment', rep: reps[0].name, customer: '', product: FOCUS_SKUS[0].name, minutes: 30, notes: '',
  });

  const myOwn = ownVisits.filter(v => v.by === manager);
  const myJoint = jointVisits.filter(v => v.by === manager);

  const captureGps = () => {
    setLocating(true);
    setTimeout(() => {
      setOwn(o => ({ ...o, gps: GPS_FIXES[myOwn.length % GPS_FIXES.length], checkIn: clock() }));
      setLocating(false);
    }, 700);
  };

  const submitOwn = (e: FormEvent) => {
    e.preventDefault();
    if (!own.customer || !own.gps) return;
    logOwnVisit({ by: manager, customer: own.customer, checkIn: own.checkIn, gps: own.gps, notes: own.notes || 'No notes' });
    notify({ type: 'success', title: 'Field visit logged', msg: `${own.customer} · checked in ${own.checkIn} · added to your activity log` });
    setOwn({ customer: '', checkIn: clock(), gps: '', notes: '' });
    setForm('none');
  };

  const submitJoint = (e: FormEvent) => {
    e.preventDefault();
    if (!joint.customer || !joint.notes) return;
    logJointVisit({ by: manager, ...joint });
    notify({ type: 'success', title: joint.kind === 'joint-call' ? 'Joint call recorded' : 'Accompaniment recorded', msg: `${joint.rep} · ${joint.customer} · ${joint.minutes} min` });
    setJoint({ ...joint, customer: '', notes: '' });
    setForm('none');
  };

  const label = 'text-[10px] font-bold text-navy-700 tracking-wider uppercase';
  const input = 'input-field w-full mt-1.5 px-3 py-2 rounded-xl bg-paper border border-navy-200 text-sm text-ink';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 fade-up">
        <div>
          <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">{me.role} · {me.scope}</p>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">My Field Log</h2>
          <p className="text-xs text-navy-500 mt-0.5">Your own customer visits, joint calls and rep accompaniments · each entry lands in your activity log</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setForm(form === 'own' ? 'none' : 'own')} className={`px-4 py-2 rounded-xl ${accent === 'sky' ? 'bg-sky-500 hover:bg-sky-600' : 'bg-navy-700 hover:bg-navy-800'} text-white text-xs font-bold btn-press flex items-center gap-1.5`}>
            <Icon name={form === 'own' ? 'x' : 'location'} size={14} /> {form === 'own' ? 'Cancel' : 'Log my visit'}
          </button>
          <button onClick={() => setForm(form === 'joint' ? 'none' : 'joint')} className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold btn-press flex items-center gap-1.5">
            <Icon name={form === 'joint' ? 'x' : 'users'} size={14} /> {form === 'joint' ? 'Cancel' : 'Joint call / accompaniment'}
          </button>
        </div>
      </div>

      {banner}

      {form === 'own' && (
        <form onSubmit={submitOwn} className="fade-up rounded-2xl bg-white border-2 border-sky-200 p-5 max-w-2xl space-y-4">
          <div className="flex items-center gap-2">
            <Icon name="location" size={16} className="text-sky-700" />
            <h3 className="font-display font-bold text-ink">Log my own field visit</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={label}>Customer</label>
              <input list="mfl-customers" value={own.customer} onChange={e => setOwn({ ...own, customer: e.target.value })} placeholder="Hospital, pharmacy or clinic" className={input} />
              <datalist id="mfl-customers">{CUSTOMERS.map(c => <option key={c} value={c} />)}</datalist>
            </div>
            <div>
              <label className={label}>Check-in time</label>
              <input type="time" value={own.checkIn} onChange={e => setOwn({ ...own, checkIn: e.target.value })} className={input} />
            </div>
          </div>
          <div className="p-3 rounded-xl bg-paper border border-navy-100 flex items-center gap-3">
            <Icon name="target" size={16} className={own.gps ? 'text-leaf-600' : 'text-navy-400'} />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-navy-500 tracking-wider uppercase">GPS check-in</p>
              <p className="text-xs text-ink font-mono">{locating ? 'Locating...' : own.gps || 'Not captured yet'}</p>
            </div>
            <button type="button" onClick={captureGps} disabled={locating} className="px-3 py-1.5 rounded-lg border border-navy-200 bg-white text-xs font-bold text-navy-700 btn-press">
              {own.gps ? 'Recapture' : 'Capture GPS'}
            </button>
          </div>
          <div>
            <label className={label}>Notes</label>
            <textarea rows={3} value={own.notes} onChange={e => setOwn({ ...own, notes: e.target.value })} placeholder="Who you met and what was agreed" className={`${input} resize-none`} />
          </div>
          <button type="submit" disabled={!own.customer || !own.gps} className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-display font-semibold text-sm btn-press">
            Save visit
          </button>
        </form>
      )}

      {form === 'joint' && (
        <form onSubmit={submitJoint} className="fade-up rounded-2xl bg-white border-2 border-violet-200 p-5 max-w-2xl space-y-4">
          <div className="flex items-center gap-2">
            <Icon name="users" size={16} className="text-violet-700" />
            <h3 className="font-display font-bold text-ink">Record joint call or accompaniment</h3>
          </div>
          <div className="flex gap-1 bg-paper p-1 rounded-xl max-w-sm">
            {(['accompaniment', 'joint-call'] as const).map(k => (
              <button type="button" key={k} onClick={() => setJoint({ ...joint, kind: k })} className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-bold ${joint.kind === k ? 'bg-white text-violet-700 shadow-sm' : 'text-navy-500'}`}>
                {k === 'joint-call' ? 'Joint call' : 'Accompaniment'}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={label}>Rep</label>
              <select value={joint.rep} onChange={e => setJoint({ ...joint, rep: e.target.value })} className={input}>
                {reps.map(r => <option key={r.name} value={r.name}>{r.name} · {r.territory}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Customer</label>
              <input list="mfl-customers-j" value={joint.customer} onChange={e => setJoint({ ...joint, customer: e.target.value })} placeholder="Where you went together" className={input} />
              <datalist id="mfl-customers-j">{CUSTOMERS.map(c => <option key={c} value={c} />)}</datalist>
            </div>
            <div>
              <label className={label}>Product detailed</label>
              <select value={joint.product} onChange={e => setJoint({ ...joint, product: e.target.value })} className={input}>
                {FOCUS_SKUS.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Minutes together</label>
              <input type="number" min={5} step={5} value={joint.minutes} onChange={e => setJoint({ ...joint, minutes: Number(e.target.value) || 0 })} className={input} />
            </div>
          </div>
          <div>
            <label className={label}>Observation and coaching given</label>
            <textarea rows={3} value={joint.notes} onChange={e => setJoint({ ...joint, notes: e.target.value })} placeholder="What went well, what to work on" className={`${input} resize-none`} />
          </div>
          <button type="submit" disabled={!joint.customer || !joint.notes} className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-display font-semibold text-sm btn-press">
            Save {joint.kind === 'joint-call' ? 'joint call' : 'accompaniment'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden fade-up">
          <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between">
            <h3 className="font-display font-bold text-ink">My Visits</h3>
            <span className="text-[10px] font-bold text-navy-400 font-mono">{myOwn.length} LOGGED</span>
          </div>
          <div className="divide-y divide-navy-50">
            {myOwn.length === 0 && <p className="p-6 text-center text-sm text-navy-500">No visits logged yet.</p>}
            {myOwn.map(v => (
              <div key={v.id} className="px-5 py-3 flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
                  <Icon name="location" size={16} className="text-sky-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-display font-semibold text-sm text-ink truncate">{v.customer}</p>
                    <span className="text-[10px] font-mono text-navy-400 flex-shrink-0">{v.date === isoDay() ? 'Today' : shortDate(v.date)} · {v.checkIn}</span>
                  </div>
                  <p className="text-[10px] font-mono text-leaf-700 mt-0.5">GPS verified · {v.gps}</p>
                  <p className="text-xs text-navy-600 mt-1">{v.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden fade-up stagger-1">
          <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between">
            <h3 className="font-display font-bold text-ink">Joint Calls & Accompaniments</h3>
            <span className="text-[10px] font-bold text-navy-400 font-mono">{myJoint.length} RECORDED</span>
          </div>
          <div className="divide-y divide-navy-50">
            {myJoint.length === 0 && <p className="p-6 text-center text-sm text-navy-500">Nothing recorded yet.</p>}
            {myJoint.map(j => (
              <div key={j.id} className="px-5 py-3 flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                  <Icon name="users" size={16} className="text-violet-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display font-semibold text-sm text-ink">{j.rep} · {j.customer}</p>
                    <span className="px-1.5 py-0.5 rounded bg-violet-50 border border-violet-200 text-violet-700 text-[9px] font-bold">{j.kind === 'joint-call' ? 'JOINT CALL' : 'ACCOMPANIMENT'}</span>
                  </div>
                  <p className="text-[11px] text-navy-500 mt-0.5">{j.product} · {j.minutes} min · {j.date === isoDay() ? 'Today' : shortDate(j.date)}</p>
                  <p className="text-xs text-navy-600 mt-1">{j.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
