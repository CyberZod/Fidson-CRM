import { useState, type FormEvent } from 'react';
import Icon from './Icon';
import type { DirectiveForm, DirectiveRow } from '../types';

interface PMDirectivesViewProps {
  directives?: DirectiveRow[];
  onPushDirective: (form: DirectiveForm) => void;
  onBack?: () => void;
}

const EMPTY_FORM: DirectiveForm = {
  title: '',
  message: '',
  targetProduct: 'Coflin Forte 600mg',
  priority: 'high',
};

export default function PMDirectivesView({ directives = [], onPushDirective, onBack }: PMDirectivesViewProps) {
  const [form, setForm] = useState<DirectiveForm>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.title || !form.message) return;
    onPushDirective(form);
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
            <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">Field Strategy</p>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">Product Directives</h2>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold btn-press flex items-center gap-1.5 shadow-lg shadow-violet-600/20">
          <Icon name={showForm ? 'x' : 'plus'} size={14} /> {showForm ? 'Cancel Directive' : 'Create Directive'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="fade-up rounded-2xl bg-white border border-navy-100 p-5 sm:p-6 max-w-xl mx-auto space-y-4 shadow-xl">
          <h3 className="font-display font-bold text-ink">New Directive to Field Reps</h3>
          <div>
            <label className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Q3 Coflin Focus"
              className="input-field w-full mt-1.5 px-3 py-2 rounded-xl bg-paper border border-navy-200 text-sm text-ink"
              required
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">Target Product</label>
            <select
              value={form.targetProduct}
              onChange={e => setForm({ ...form, targetProduct: e.target.value })}
              className="input-field w-full mt-1.5 px-3 py-2 rounded-xl bg-paper border border-navy-200 text-sm text-ink"
            >
              <option>Coflin Forte 600mg</option>
              <option>Astrazon 10mg</option>
              <option>Tuxil-N Syrup 100ml</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">Priority</label>
              <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
                className="input-field w-full mt-1.5 px-3 py-2 rounded-xl bg-paper border border-navy-200 text-sm text-ink"
              >
                <option value="high">High</option>
                <option value="normal">Normal</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">Directive Message</label>
            <textarea
              rows={4}
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              placeholder="Provide instructions to reps detailing this product..."
              className="input-field w-full mt-1.5 p-3 rounded-xl bg-paper border border-navy-200 text-sm resize-none text-ink"
              required
            />
          </div>
          <button type="submit" className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-display font-semibold text-sm btn-press">
            Push Directive to Field
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {directives.map(d => (
          <div key={d.id} className="p-5 rounded-2xl bg-white border border-navy-100 flex flex-col justify-between card-hover">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                  d.priority === 'high' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-navy-50 text-navy-700 border border-navy-200'
                }`}>
                  {d.priority} Priority
                </span>
                <span className="text-[10px] text-navy-400 font-mono">{d.date}</span>
              </div>
              <h4 className="font-display font-bold text-ink text-base mb-1">{d.title}</h4>
              <p className="text-[11px] text-violet-700 font-semibold uppercase tracking-wider mb-2">Target: {d.targetProduct}</p>
              <p className="text-xs text-navy-600 leading-relaxed bg-navy-50 p-3 rounded-xl">{d.message}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-navy-100 flex items-center justify-between">
              <p className="text-[10px] text-navy-500">Created by: <strong>{d.pm}</strong></p>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                d.acknowledged ? 'bg-leaf-50 text-leaf-700 border border-leaf-200' : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
              }`}>
                {d.acknowledged ? 'Acknowledged' : 'Pending Acknowledgment'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
