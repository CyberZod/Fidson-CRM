import { useState, type FormEvent } from 'react';
import Icon from './Icon';
import type { AccompanimentForm, AccompanimentRow } from '../types';

interface PMFieldViewProps {
  accompaniments?: AccompanimentRow[];
  onSaveAccompaniment: (form: AccompanimentForm) => void;
  onBack?: () => void;
}

const REPS = ['Adaeze Okafor', 'Chinedu Eze', 'Tope Adeola', 'Bayo Salami', 'Yetunde Cole'];

const EMPTY_FORM: AccompanimentForm = {
  rep: 'Adaeze Okafor',
  territory: 'Lekki Cluster',
  visitsShadowed: 4,
  notes: '',
};

export default function PMFieldView({ accompaniments = [], onSaveAccompaniment, onBack }: PMFieldViewProps) {
  const [form, setForm] = useState<AccompanimentForm>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);

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
            <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">Field Shadow Logs</h2>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold btn-press flex items-center gap-1.5 shadow-lg shadow-violet-600/20">
          <Icon name={showForm ? 'x' : 'plus'} size={14} /> {showForm ? 'Cancel Log' : 'Log Accompaniment'}
        </button>
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
              {REPS.map(r => <option key={r}>{r}</option>)}
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
