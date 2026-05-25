import { useEffect, useState } from 'react';
import Icon from './Icon';

interface RepClinicalViewProps {
  onSubmitCM: (form: CMForm) => void;
  prefillHcp?: string;
  onConsumePrefill?: () => void;
}

interface CMForm {
  topic: string;
  hcp: string;
  date: string;
  attendees: string;
  budget: string;
  highImpact: boolean;
}

const EMPTY_FORM: CMForm = { topic: '', hcp: '', date: '', attendees: '', budget: '', highImpact: false };

export default function RepClinicalView({ onSubmitCM, prefillHcp, onConsumePrefill }: RepClinicalViewProps) {
  const [form, setForm] = useState<CMForm>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (prefillHcp && !submitted) {
      setForm(prev => ({ ...prev, hcp: prefillHcp }));
      onConsumePrefill?.();
    }
  }, [prefillHcp, submitted, onConsumePrefill]);

  const handleSubmit = () => {
    onSubmitCM(form);
    setSubmitted(true);
  };

  if (submitted) {
    const steps = [
      { n: 'You submitted', t: 'Just now', done: true },
      { n: 'PM review (Dr. Femi Akande)', t: 'Pending', done: false },
      { n: form.highImpact ? 'HoM approval (high-impact)' : null, t: 'Pending', done: false },
      { n: 'Logged in CRM', t: 'Pending', done: false },
    ].filter((s): s is { n: string; t: string; done: boolean } => s.n !== null);

    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[600px] mx-auto">
        <div className="rounded-2xl bg-white border border-navy-100 p-8 text-center fade-up">
          <div className="w-20 h-20 rounded-full bg-leaf-100 mx-auto flex items-center justify-center mb-4">
            <Icon name="check" size={40} className="text-leaf-600" strokeWidth={3} />
          </div>
          <h2 className="font-display text-2xl font-bold text-ink">CM Request submitted</h2>
          <p className="text-sm text-navy-500 mt-1">Routed to your Product Manager</p>

          <div className="mt-5 p-4 rounded-xl bg-paper text-left">
            <div className="space-y-3">
              {steps.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${s.done ? 'bg-leaf-500' : 'bg-navy-200'}`}>
                    {s.done ? <Icon name="check" size={11} className="text-white" strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div className="flex-1 flex justify-between">
                    <span className="text-xs text-navy-700">{s.n}</span>
                    <span className="text-[10px] text-navy-500">{s.t}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => { setSubmitted(false); setForm(EMPTY_FORM); }}
            className="mt-5 w-full py-3 rounded-xl bg-navy-700 text-white font-display font-semibold btn-press"
          >
            Submit another request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[800px] mx-auto">
      <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden fade-up">
        <div className="px-5 sm:px-6 py-5 border-b border-navy-100">
          <h2 className="font-display text-xl font-bold text-ink">Request Clinical Meeting</h2>
          <p className="text-sm text-navy-500 mt-1">Submit a CM, workshop, or product brief for PM approval</p>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-navy-700 tracking-wider uppercase">Meeting Topic</label>
            <input
              type="text"
              value={form.topic}
              onChange={e => setForm({ ...form, topic: e.target.value })}
              placeholder="e.g. Respiratory Care CM"
              className="input-field w-full mt-1.5 px-3 py-2.5 rounded-xl bg-paper border border-navy-200 text-sm text-ink"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-navy-700 tracking-wider uppercase">Host HCP / Institution</label>
            <input
              type="text"
              value={form.hcp}
              onChange={e => setForm({ ...form, hcp: e.target.value })}
              placeholder="e.g. Lakeshore Specialist Hospital"
              className="input-field w-full mt-1.5 px-3 py-2.5 rounded-xl bg-paper border border-navy-200 text-sm text-ink"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-navy-700 tracking-wider uppercase">Proposed Date</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="input-field w-full mt-1.5 px-3 py-2.5 rounded-xl bg-paper border border-navy-200 text-sm text-ink"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-navy-700 tracking-wider uppercase">Est. Attendees</label>
              <input
                type="number"
                value={form.attendees}
                onChange={e => setForm({ ...form, attendees: e.target.value })}
                placeholder="25"
                className="input-field w-full mt-1.5 px-3 py-2.5 rounded-xl bg-paper border border-navy-200 text-sm text-ink"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-navy-700 tracking-wider uppercase">Budget Required (₦)</label>
            <input
              type="text"
              value={form.budget}
              onChange={e => setForm({ ...form, budget: e.target.value })}
              placeholder="450000"
              className="input-field w-full mt-1.5 px-3 py-2.5 rounded-xl bg-paper border border-navy-200 text-sm text-ink"
            />
          </div>

          <label className="flex items-center gap-3 p-3 rounded-xl bg-paper border border-navy-100 cursor-pointer">
            <input
              type="checkbox"
              checked={form.highImpact}
              onChange={e => setForm({ ...form, highImpact: e.target.checked })}
              className="w-4 h-4 rounded border-navy-300 accent-leaf-500"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink">High-impact meeting</p>
              <p className="text-[11px] text-navy-500">Multi-regional event · Requires HoM sign-off</p>
            </div>
            {form.highImpact && <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[9px] font-bold">+HOM</span>}
          </label>

          <div className="p-3 rounded-xl bg-navy-50 border border-navy-100">
            <p className="text-[10px] font-bold text-navy-700 tracking-wider uppercase mb-1">Approval Route</p>
            <p className="text-xs text-navy-700">You → Product Manager{form.highImpact ? ' → Head of Marketing' : ''} → CRM logged</p>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={() => setForm(EMPTY_FORM)} className="flex-1 py-2.5 rounded-xl border border-navy-200 text-sm font-bold text-navy-700 hover:bg-paper btn-press">
              Reset
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.topic || !form.hcp || !form.date}
              className="flex-1 py-2.5 rounded-xl bg-leaf-500 text-white text-sm font-bold hover:bg-leaf-600 disabled:opacity-50 disabled:cursor-not-allowed btn-press flex items-center justify-center gap-1.5"
            >
              Submit for Approval <Icon name="arrowRight" size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
