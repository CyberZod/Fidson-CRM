import { useMemo, useState, type FormEvent } from 'react';
import Icon from './Icon';
import { PRODUCT_CATALOG } from '../assets/products';
import type { AccompanimentForm, AccompanimentRow, JointCall, JointCallForm } from '../types';

interface PMFieldViewProps {
  accompaniments?: AccompanimentRow[];
  onSaveAccompaniment: (form: AccompanimentForm) => void;
  jointCalls?: JointCall[];
  onScheduleJointCall?: (form: JointCallForm) => void;
  onBack?: () => void;
}

interface RepProfile {
  name: string;
  division: string;
  region: string;
  territory: string;
}

const REPS: RepProfile[] = [
  { name: 'Adaeze Okafor', division: 'South', region: 'SW', territory: 'Lekki / V.I.' },
  { name: 'Chinedu Eze', division: 'South', region: 'SW', territory: 'Ikeja' },
  { name: 'Tope Adeola', division: 'South', region: 'SW', territory: 'Surulere' },
  { name: 'Bayo Salami', division: 'South', region: 'SE', territory: 'Enugu' },
  { name: 'Yetunde Cole', division: 'South', region: 'SS', territory: 'Port Harcourt' },
  { name: 'Sani Garba', division: 'North', region: 'NC', territory: 'Abuja' },
  { name: 'Hauwa Bello', division: 'North', region: 'NW', territory: 'Kano' },
];

const DIVISIONS = ['All', 'South', 'North'];
const REGIONS = ['All', 'SW', 'SE', 'SS', 'NC', 'NW', 'NE'];

const EMPTY_FORM: AccompanimentForm = {
  rep: 'Adaeze Okafor',
  territory: 'Lekki Cluster',
  visitsShadowed: 4,
  notes: '',
};

const EMPTY_JOINT_FORM: JointCallForm = {
  division: 'South',
  region: 'SW',
  territory: 'Lekki / V.I.',
  rep: 'Adaeze Okafor',
  customer: '',
  product: 'Coflin Forte 600mg',
  scheduledFor: '',
  rationale: '',
};

export default function PMFieldView({ accompaniments = [], onSaveAccompaniment, jointCalls = [], onScheduleJointCall, onBack }: PMFieldViewProps) {
  const [form, setForm] = useState<AccompanimentForm>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [jcForm, setJcForm] = useState<JointCallForm>(EMPTY_JOINT_FORM);
  const [showJcForm, setShowJcForm] = useState(false);
  const [filterDivision, setFilterDivision] = useState<string>('All');
  const [filterRegion, setFilterRegion] = useState<string>('All');

  const filteredReps = useMemo(() => REPS.filter(r =>
    (filterDivision === 'All' || r.division === filterDivision) &&
    (filterRegion === 'All' || r.region === filterRegion),
  ), [filterDivision, filterRegion]);

  const handleScheduleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!jcForm.customer || !jcForm.scheduledFor) return;
    onScheduleJointCall?.(jcForm);
    setJcForm(EMPTY_JOINT_FORM);
    setShowJcForm(false);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.notes) return;
    onSaveAccompaniment(form);
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="w-8 h-8 rounded-lg bg-white border border-navy-100 flex items-center justify-center btn-press">
              <Icon name="chevronLeft" size={16} className="text-navy-700" />
            </button>
          )}
          <div>
            <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">Coaching & Mentorship</p>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">Field Shadow Logs & Joint Calls</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setShowJcForm(!showJcForm); setShowForm(false); }} className="px-4 py-2 rounded-xl bg-leaf-600 hover:bg-leaf-700 text-white text-xs font-bold btn-press flex items-center gap-1.5 shadow-lg shadow-leaf-600/20">
            <Icon name={showJcForm ? 'x' : 'plus'} size={14} /> {showJcForm ? 'Cancel' : 'Schedule Joint Call'}
          </button>
          <button onClick={() => { setShowForm(!showForm); setShowJcForm(false); }} className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold btn-press flex items-center gap-1.5 shadow-lg shadow-violet-600/20">
            <Icon name={showForm ? 'x' : 'edit'} size={14} /> {showForm ? 'Cancel Log' : 'Log Accompaniment'}
          </button>
        </div>
      </div>

      {showJcForm && (
        <form onSubmit={handleScheduleSubmit} className="fade-up rounded-2xl bg-white border-2 border-leaf-300 p-5 sm:p-6 max-w-2xl mx-auto space-y-4 shadow-xl">
          <div className="flex items-center gap-2">
            <Icon name="users" size={16} className="text-leaf-700" />
            <h3 className="font-display font-bold text-ink">Schedule Joint Call</h3>
            <span className="px-1.5 py-0.5 rounded bg-leaf-100 text-leaf-700 text-[9px] font-bold">FILTER BY ORG</span>
          </div>
          <p className="text-[11px] text-navy-500 -mt-2">Pick the division and region you're focused on, then choose the rep + customer + product to join. The rep will see a heads-up on their dashboard.</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">Division</label>
              <select
                value={filterDivision}
                onChange={e => setFilterDivision(e.target.value)}
                className="input-field w-full mt-1.5 px-3 py-2 rounded-xl bg-paper border border-navy-200 text-sm text-ink"
              >
                {DIVISIONS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">Region</label>
              <select
                value={filterRegion}
                onChange={e => setFilterRegion(e.target.value)}
                className="input-field w-full mt-1.5 px-3 py-2 rounded-xl bg-paper border border-navy-200 text-sm text-ink"
              >
                {REGIONS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">Rep ({filteredReps.length} match)</label>
              <select
                value={jcForm.rep}
                onChange={e => {
                  const picked = filteredReps.find(r => r.name === e.target.value) || filteredReps[0];
                  if (picked) {
                    setJcForm({ ...jcForm, rep: picked.name, division: picked.division, region: picked.region, territory: picked.territory });
                  }
                }}
                className="input-field w-full mt-1.5 px-3 py-2 rounded-xl bg-paper border border-navy-200 text-sm text-ink"
              >
                {filteredReps.length === 0 ? (
                  <option>No reps match these filters</option>
                ) : filteredReps.map(r => <option key={r.name}>{r.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">Customer / HCP</label>
              <input
                type="text"
                value={jcForm.customer}
                onChange={e => setJcForm({ ...jcForm, customer: e.target.value })}
                placeholder="e.g. Lakeshore Specialist Hospital"
                className="input-field w-full mt-1.5 px-3 py-2 rounded-xl bg-paper border border-navy-200 text-sm text-ink"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">Product Focus</label>
              <select
                value={jcForm.product}
                onChange={e => setJcForm({ ...jcForm, product: e.target.value })}
                className="input-field w-full mt-1.5 px-3 py-2 rounded-xl bg-paper border border-navy-200 text-sm text-ink"
              >
                {PRODUCT_CATALOG.map(p => <option key={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">Scheduled For</label>
              <input
                type="text"
                value={jcForm.scheduledFor}
                onChange={e => setJcForm({ ...jcForm, scheduledFor: e.target.value })}
                placeholder="e.g. May 22, 2026 · 10:00"
                className="input-field w-full mt-1.5 px-3 py-2 rounded-xl bg-paper border border-navy-200 text-sm text-ink"
                required
              />
            </div>
            <div className="text-[11px] text-navy-500 self-end pb-2">
              <p className="font-bold">Locked from rep filters</p>
              <p>{jcForm.division} · {jcForm.region} · {jcForm.territory}</p>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">Why this joint call?</label>
            <textarea
              rows={3}
              value={jcForm.rationale}
              onChange={e => setJcForm({ ...jcForm, rationale: e.target.value })}
              placeholder="e.g. Coflin uptake below target in Apapa zone — want to observe paediatric detailing approach."
              className="input-field w-full mt-1.5 p-3 rounded-xl bg-paper border border-navy-200 text-sm resize-none text-ink"
            />
          </div>

          <button
            type="submit"
            disabled={!jcForm.customer || !jcForm.scheduledFor || filteredReps.length === 0}
            className="w-full py-3 rounded-xl bg-leaf-600 hover:bg-leaf-700 disabled:opacity-50 text-white font-display font-semibold text-sm btn-press flex items-center justify-center gap-1.5"
          >
            <Icon name="send" size={14} /> Send heads-up to {jcForm.rep}
          </button>
        </form>
      )}

      <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-display font-bold text-ink">Upcoming Joint Calls</h3>
            <p className="text-xs text-navy-500 mt-0.5">{jointCalls.filter(j => j.status === 'scheduled').length} scheduled</p>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-leaf-100 text-leaf-700 text-[9px] font-bold">PM SHADOWING</span>
        </div>
        <div className="divide-y divide-navy-50">
          {jointCalls.length === 0 ? (
            <div className="p-8 text-center text-sm text-navy-500 font-medium">No joint calls scheduled yet.</div>
          ) : jointCalls.map(j => (
            <div key={j.id} className="p-5 flex flex-col md:flex-row md:items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-leaf-50 flex items-center justify-center flex-shrink-0">
                <Icon name="users" size={18} className="text-leaf-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-display font-semibold text-sm text-ink">{j.rep} → {j.customer}</p>
                  <span className="px-1.5 py-0.5 rounded bg-paper text-navy-700 text-[9px] font-bold border border-navy-100">{j.division} · {j.region} · {j.territory}</span>
                  <span className="px-1.5 py-0.5 rounded bg-leaf-100 text-leaf-700 text-[9px] font-bold">{j.scheduledFor}</span>
                </div>
                <p className="text-[11px] text-navy-500 mt-1">Product focus: <strong>{j.product}</strong> · with {j.pm}</p>
                {j.rationale && (
                  <p className="text-xs text-navy-700 bg-paper p-2 rounded-lg border border-navy-100 mt-2 italic">"{j.rationale}"</p>
                )}
              </div>
              <span className="px-2.5 py-1 rounded-full bg-leaf-50 text-leaf-700 border border-leaf-200 text-[10px] font-bold flex items-center gap-1 flex-shrink-0 self-start md:self-center">
                <Icon name="calendar" size={10} /> {j.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="fade-up rounded-2xl bg-white border border-navy-100 p-5 sm:p-6 max-w-xl mx-auto space-y-4 shadow-xl">
          <h3 className="font-display font-bold text-ink">New Shadow Visit Accompaniment</h3>
          <div>
            <label className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">Select Medical Representative</label>
            <select
              value={form.rep}
              onChange={e => setForm({ ...form, rep: e.target.value })}
              className="input-field w-full mt-1.5 px-3 py-2 rounded-xl bg-paper border border-navy-200 text-sm text-ink"
            >
              {REPS.map(r => <option key={r.name}>{r.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">Territory / Zone</label>
              <input
                type="text"
                value={form.territory}
                onChange={e => setForm({ ...form, territory: e.target.value })}
                className="input-field w-full mt-1.5 px-3 py-2 rounded-xl bg-paper border border-navy-200 text-sm text-ink"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">Visits Shadowed</label>
              <input
                type="number"
                min={1}
                value={form.visitsShadowed}
                onChange={e => setForm({ ...form, visitsShadowed: parseInt(e.target.value, 10) || 1 })}
                className="input-field w-full mt-1.5 px-3 py-2 rounded-xl bg-paper border border-navy-200 text-sm text-ink"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">Observation Notes & Feedback</label>
            <textarea
              rows={4}
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Detail detailing capability, objections handled, doctor engagement..."
              className="input-field w-full mt-1.5 p-3 rounded-xl bg-paper border border-navy-200 text-sm resize-none text-ink"
              required
            />
          </div>
          <button type="submit" className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-display font-semibold text-sm btn-press">
            Sync Shadow Visit to CRM
          </button>
        </form>
      )}

      <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-navy-100">
          <h3 className="font-display font-bold text-ink">Accompaniment Log History</h3>
        </div>
        <div className="divide-y divide-navy-50">
          {accompaniments.length === 0 ? (
            <div className="p-8 text-center text-sm text-navy-500 font-medium">No field accompaniment logs stored yet</div>
          ) : accompaniments.map(a => (
            <div key={a.id} className="p-5 flex flex-col md:flex-row md:items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                <Icon name="users" size={20} className="text-violet-600" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="font-display font-bold text-ink">{a.rep} shadow visit</h4>
                  <span className="text-xs font-mono text-navy-400">{a.date}</span>
                </div>
                <p className="text-[11px] text-navy-500">Zone: <strong>{a.territory}</strong> · Shadowed: <strong>{a.visitsShadowed} HCP visits</strong> · Evaluated by: <strong>{a.pm || 'PM'}</strong></p>
                <p className="text-xs text-navy-700 leading-relaxed bg-paper p-3 rounded-lg border border-navy-100 font-semibold">{a.notes}</p>
              </div>
              <div className="flex items-center gap-1.5 self-end md:self-start bg-leaf-50 text-leaf-700 font-bold px-2 py-0.5 rounded-full text-[10px]">
                <Icon name="check" size={8} strokeWidth={3} /> SYNCED
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
