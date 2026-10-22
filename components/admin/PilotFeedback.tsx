import { useState } from 'react';
import { useAdmin } from '../../stores/admin';
import type { ToastInput } from '../../types';
import { AdminPage, Badge, Btn, Card, Stat, downloadCsv, inputCls, thCls, tdCls, useNotice, type AdminScreenProps } from './kit';

// AC 6.10 / 2.7: structured pilot feedback rounds with sign-off.
export interface FeedbackResponse {
  name: string;
  role: string;
  ease: number;
  speed: number;
  offline: number;
  useful: number;
  comment: string;
}

const QUESTIONS: { key: 'ease' | 'speed' | 'offline' | 'useful'; label: string }[] = [
  { key: 'ease', label: 'Easy to use on the phone' },
  { key: 'speed', label: 'Fast enough during a visit' },
  { key: 'offline', label: 'Works when there is no signal' },
  { key: 'useful', label: 'Saves me time each week' },
];

interface Round {
  id: string;
  name: string;
  window: string;
  status: 'Open' | 'Closed' | 'Signed off';
  signedBy?: string;
  responses: FeedbackResponse[];
  themes: { t: string; n: number; tone: 'leaf' | 'amber' | 'rose' }[];
  quotes: string[];
}

const SEED: Round[] = [
  {
    id: 'r1', name: 'Pilot 1 · week 2', window: '22 to 26 Sep 2026', status: 'Signed off', signedBy: 'Tunde Bakare',
    responses: [
      { name: 'Adaeze Okafor', role: 'Medical Rep', ease: 5, speed: 4, offline: 4, useful: 5, comment: 'Check-in is quick. Logging samples took a few taps too many.' },
      { name: 'Bayo Salami', role: 'Medical Rep', ease: 4, speed: 3, offline: 5, useful: 4, comment: 'Worked at Reddington basement with no signal and synced later.' },
      { name: 'Tope Adeola', role: 'Medical Rep', ease: 4, speed: 4, offline: 3, useful: 4, comment: 'Itinerary edit on the web and the phone clashed once.' },
      { name: 'Femi Ogunleye', role: 'ASM', ease: 5, speed: 5, offline: 4, useful: 5, comment: 'I can see who visited where without calling round.' },
    ],
    themes: [{ t: 'Check-in speed praised', n: 3, tone: 'leaf' }, { t: 'Sample logging needs fewer taps', n: 2, tone: 'amber' }, { t: 'Web and phone edit clash', n: 1, tone: 'rose' }],
    quotes: ['"I can see who visited where without calling round." Femi Ogunleye, ASM', '"Worked in the basement with no signal and synced later." Bayo Salami'],
  },
  {
    id: 'r2', name: 'Pilot 2 · week 6', window: '20 to 24 Oct 2026', status: 'Open',
    responses: [
      { name: 'Segun Ajayi', role: 'Medical Rep', ease: 5, speed: 4, offline: 5, useful: 5, comment: 'Ibadan North coverage gaps now show on my dashboard.' },
      { name: 'Yetunde Cole', role: 'Medical Rep', ease: 4, speed: 4, offline: 4, useful: 4, comment: 'Order capture is clear. Would like stock levels per pharmacy.' },
      { name: 'Funke Oladipo', role: 'ASM', ease: 4, speed: 5, offline: 4, useful: 5, comment: 'Approvals from the phone save me a trip to the office.' },
    ],
    themes: [{ t: 'Sample logging fixed', n: 2, tone: 'leaf' }, { t: 'Wants pharmacy stock levels', n: 1, tone: 'amber' }],
    quotes: ['"Approvals from the phone save me a trip to the office." Funke Oladipo, ASM'],
  },
];

const avg = (rs: FeedbackResponse[], k: keyof Pick<FeedbackResponse, 'ease' | 'speed' | 'offline' | 'useful'>) =>
  rs.length ? (rs.reduce((s, r) => s + r[k], 0) / rs.length).toFixed(1) : '0.0';

export function FeedbackForm({ onSubmit, onToast, name = 'Adaeze Okafor', role = 'Medical Rep' }: {
  onSubmit?: (r: FeedbackResponse) => void; onToast?: (t: ToastInput) => void; name?: string; role?: string;
}) {
  const { notify, banner } = useNotice(onToast);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState(false);
  const complete = QUESTIONS.every(q => scores[q.key]);

  const submit = () => {
    const r: FeedbackResponse = { name, role, ease: scores.ease, speed: scores.speed, offline: scores.offline, useful: scores.useful, comment: comment.trim() };
    onSubmit?.(r);
    setSent(true);
    notify('Feedback sent', 'Thank you. The pilot team reads every response.');
  };

  if (sent) {
    return (
      <div className="rounded-2xl bg-white border border-navy-100 p-5 text-center">
        <p className="font-display font-bold text-ink">Thanks for your feedback</p>
        <p className="text-xs text-navy-500 mt-1">Your answers are in the Pilot 2 · week 6 round.</p>
        <button onClick={() => { setSent(false); setScores({}); setComment(''); }} className="mt-3 text-xs font-bold text-leaf-700 underline">Send another</button>
        {banner}
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-navy-100 p-4 sm:p-5 space-y-4">
      <div>
        <p className="font-display font-bold text-ink">Pilot feedback · week 6</p>
        <p className="text-xs text-navy-500 mt-0.5">Two minutes. Rate each from 1 (poor) to 5 (very good).</p>
      </div>
      {QUESTIONS.map(q => (
        <fieldset key={q.key}>
          <legend className="text-sm font-semibold text-ink">{q.label}</legend>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} type="button" onClick={() => setScores(s => ({ ...s, [q.key]: n }))} aria-pressed={scores[q.key] === n}
                className={`h-11 rounded-xl text-sm font-bold btn-press border ${scores[q.key] === n ? 'bg-navy-800 text-white border-navy-800' : 'bg-white text-navy-700 border-navy-200 hover:bg-paper'}`}>
                {n}
              </button>
            ))}
          </div>
        </fieldset>
      ))}
      <label className="block">
        <span className="text-sm font-semibold text-ink">What should we change?</span>
        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} className={`${inputCls} mt-2 resize-none`} placeholder="One thing that slowed you down this week" />
      </label>
      <button onClick={submit} disabled={!complete}
        className="w-full h-12 rounded-xl bg-leaf-500 text-white font-bold btn-press disabled:opacity-40">Send feedback</button>
      {banner}
    </div>
  );
}

export default function PilotFeedback({ onToast }: AdminScreenProps) {
  const { record } = useAdmin();
  const { notify, banner } = useNotice(onToast);
  const [rounds, setRounds] = useState<Round[]>(SEED);
  const [sel, setSel] = useState('r2');
  const [preview, setPreview] = useState(false);
  const round = rounds.find(r => r.id === sel) ?? rounds[0];

  const update = (patch: Partial<Round>, what: string, before: string, after: string) => {
    setRounds(rs => rs.map(r => (r.id === round.id ? { ...r, ...patch } : r)));
    record({ area: 'Feedback', what: `${round.name}: ${what}`, before, after });
  };

  const close = () => { update({ status: 'Closed' }, 'round closed', 'Open', 'Closed'); notify('Round closed', `${round.responses.length} responses captured`); };
  const signOff = () => { update({ status: 'Signed off', signedBy: 'Tunde Bakare' }, 'round signed off', round.status, 'Signed off by Tunde Bakare'); notify('Round signed off', round.name); };

  const exportCsv = () => {
    downloadCsv(`${round.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.csv`,
      [['Name', 'Role', 'Ease', 'Speed', 'Offline', 'Useful', 'Comment'], ...round.responses.map(r => [r.name, r.role, r.ease, r.speed, r.offline, r.useful, r.comment])]);
    notify('Exported', `${round.responses.length} responses`);
  };

  const addResponse = (r: FeedbackResponse) => {
    setRounds(rs => rs.map(x => (x.id === 'r2' ? { ...x, responses: [...x.responses, r] } : x)));
    setSel('r2');
  };

  return (
    <AdminPage title="Pilot Feedback" icon="flag" subtitle="Structured feedback rounds from pilot users, with business sign-off"
      actions={<>
        <Btn icon="eye" onClick={() => setPreview(p => !p)}>{preview ? 'Hide rep form' : 'Preview rep form'}</Btn>
        <Btn icon="download" onClick={exportCsv}>Export CSV</Btn>
      </>}>
      <div className="flex gap-2 flex-wrap">
        {rounds.map(r => (
          <button key={r.id} onClick={() => setSel(r.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold btn-press ${sel === r.id ? 'bg-navy-800 text-white' : 'bg-white border border-navy-200 text-navy-600 hover:bg-paper'}`}>
            {r.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Stat label="Responses" value={round.responses.length} note={round.window} />
        {QUESTIONS.map(q => <Stat key={q.key} label={q.label} value={`${avg(round.responses, q.key)} / 5`} tone={Number(avg(round.responses, q.key)) >= 4 ? 'leaf' : 'amber'} note={Number(avg(round.responses, q.key)) >= 4 ? 'Meets pilot target 4.0' : 'Below target 4.0'} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Responses" pad={false} className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead><tr>{['Respondent', 'Ease', 'Speed', 'Offline', 'Useful', 'Comment'].map(h => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-navy-50">
                {round.responses.map((r, i) => (
                  <tr key={i}>
                    <td className={tdCls}><span className="font-semibold text-ink">{r.name}</span><br /><span className="text-navy-400">{r.role}</span></td>
                    {QUESTIONS.map(q => <td key={q.key} className={`${tdCls} font-mono ${r[q.key] <= 3 ? 'text-amber-700 font-bold' : ''}`}>{r[q.key]}</td>)}
                    <td className={tdCls}>{r.comment || <span className="text-navy-300">No comment</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="Themes">
            <div className="space-y-2">
              {round.themes.map(t => <div key={t.t} className="flex items-center justify-between gap-2 text-xs"><span className="text-navy-700">{t.t}</span><Badge tone={t.tone}>{t.n}</Badge></div>)}
            </div>
            <div className="mt-4 space-y-2">
              {round.quotes.map(q => <blockquote key={q} className="text-xs text-navy-600 italic border-l-2 border-leaf-300 pl-3">{q}</blockquote>)}
            </div>
          </Card>
          <Card title="Sign-off" actions={<Badge tone={round.status === 'Signed off' ? 'leaf' : round.status === 'Closed' ? 'amber' : 'sky'}>{round.status}</Badge>}>
            {round.status === 'Signed off'
              ? <p className="text-xs text-navy-600">Signed off by {round.signedBy}. Actions from this round are tracked in the backlog.</p>
              : <div className="space-y-2">
                  <p className="text-xs text-navy-600">Close the round when responses are in, then the pilot sponsor signs off the findings.</p>
                  <div className="flex gap-2 flex-wrap">
                    {round.status === 'Open' && <Btn onClick={close}>Close round</Btn>}
                    <Btn kind="primary" icon="check" disabled={round.status === 'Open'} onClick={signOff}>Record sign-off</Btn>
                  </div>
                </div>}
          </Card>
        </div>
      </div>

      {preview && (
        <div className="max-w-sm">
          <p className="stat-label text-navy-400 mb-2">What reps see on the phone</p>
          <FeedbackForm onToast={onToast} onSubmit={addResponse} name="Bayo Salami" />
        </div>
      )}
      {banner}
    </AdminPage>
  );
}
