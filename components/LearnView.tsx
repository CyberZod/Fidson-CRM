import { useState } from 'react';
import Icon from './Icon';
import type { ToastInput } from '../types';
import { downloadText, useNotice } from './admin/kit';

// AC 11.2: role-based training with short tutorials, quizzes and downloadable manuals.
type LearnRole = 'rep' | 'manager' | 'admin';

interface Question { q: string; options: string[]; answer: number }
interface Tutorial { id: string; title: string; minutes: number; summary: string; quiz: Question[] }
interface Manual { title: string; pages: number; body: string }

const CURRICULA: Record<LearnRole, { title: string; tutorials: Tutorial[]; manuals: Manual[] }> = {
  rep: {
    title: 'Medical rep essentials',
    tutorials: [
      { id: 'r1', title: 'Install the app and sign in', minutes: 3, summary: 'Add FieldForce to your home screen and sign in with your Fidson Microsoft account.', quiz: [
        { q: 'Which account do you sign in with?', options: ['A personal Gmail', 'Your Fidson Microsoft account', 'A PIN from your manager'], answer: 1 },
        { q: 'Where should the app live on your phone?', options: ['On the home screen', 'In a browser bookmark only', 'In email'], answer: 0 },
      ] },
      { id: 'r2', title: 'Plan your week', minutes: 5, summary: 'Build next week\'s itinerary and submit it to your manager by Friday.', quiz: [
        { q: 'When is next week\'s plan due?', options: ['Monday morning', 'Friday', 'Any time'], answer: 1 },
        { q: 'What unlocks check-in at a stop?', options: ['Manager approval of the plan', 'Calling the customer', 'Nothing'], answer: 0 },
      ] },
      { id: 'r3', title: 'Check in and log a visit', minutes: 4, summary: 'GPS check-in, detailing notes, samples left and check-out.', quiz: [
        { q: 'What does check-in record?', options: ['Only the time', 'Time and GPS location', 'Your battery level'], answer: 1 },
        { q: 'When should you check out?', options: ['When you leave the customer', 'At the end of the day', 'Never'], answer: 0 },
        { q: 'Samples left are recorded in', options: ['A paper book', 'The visit log', 'A WhatsApp message'], answer: 1 },
      ] },
      { id: 'r4', title: 'Working with no signal', minutes: 3, summary: 'Visits save on the phone and send when you are back online.', quiz: [
        { q: 'You log a visit with no signal. What happens?', options: ['It is lost', 'It saves and sends later', 'You must retype it'], answer: 1 },
        { q: 'Where do you see how many records are waiting?', options: ['The banner at the top', 'Your email', 'Nowhere'], answer: 0 },
      ] },
    ],
    manuals: [{ title: 'Medical rep manual', pages: 14, body: 'Install the app, plan your week, check in, log visits, place orders, work offline.' }],
  },
  manager: {
    title: 'Manager workflow',
    tutorials: [
      { id: 'm1', title: 'Approve itineraries', minutes: 4, summary: 'Review your team\'s plans and approve or return with a note.', quiz: [
        { q: 'What happens if you return a plan?', options: ['The rep sees your note and edits it', 'It is deleted', 'It is auto-approved'], answer: 0 },
        { q: 'Where do pending plans appear?', options: ['Your dashboard', 'Only by email', 'In SOA'], answer: 0 },
      ] },
      { id: 'm2', title: 'Discount approvals and escalation', minutes: 5, summary: 'Thresholds, timeouts and what escalates to your manager.', quiz: [
        { q: 'A request you do not act on before the timeout', options: ['Expires', 'Escalates to the next approver', 'Is approved'], answer: 1 },
        { q: 'Who sets the thresholds?', options: ['The platform admin', 'Each rep', 'The customer'], answer: 0 },
      ] },
      { id: 'm3', title: 'Coaching from the team view', minutes: 6, summary: 'Spot coverage gaps and open commitments, then coach.', quiz: [
        { q: 'A coverage gap means', options: ['No visit in over two weeks', 'A late order', 'A missing photo'], answer: 0 },
        { q: 'Coaching notes are seen by', options: ['The rep', 'Everyone in Fidson', 'Customers'], answer: 0 },
      ] },
    ],
    manuals: [{ title: 'Manager manual', pages: 11, body: 'Approvals, escalation, team view, coaching, reports.' }],
  },
  admin: {
    title: 'Platform admin',
    tutorials: [
      { id: 'a1', title: 'Add a person and set their role', minutes: 4, summary: 'Entra ID group first, then role, territory and manager.', quiz: [
        { q: 'Access follows which group?', options: ['FieldForce-Users', 'All Staff', 'Domain Admins'], answer: 0 },
        { q: 'Removing someone from the group', options: ['Revokes access on their next request', 'Does nothing', 'Deletes their data'], answer: 0 },
      ] },
      { id: 'a2', title: 'Publish a form or workflow change', minutes: 5, summary: 'Edit, preview on the phone, publish a new version.', quiz: [
        { q: 'Does a form change need a release?', options: ['Yes, from the vendor', 'No, publish from the console', 'Only on weekends'], answer: 1 },
        { q: 'Requests already in flight use', options: ['The old version', 'The new version', 'No version'], answer: 0 },
      ] },
      { id: 'a3', title: 'Read and export the audit log', minutes: 3, summary: 'Filter by person, area and date, then export CSV.', quiz: [
        { q: 'What does each audit entry show?', options: ['Who, what, before, after, when, device', 'Only the time', 'Only the person'], answer: 0 },
        { q: 'The export format is', options: ['CSV', 'PNG', 'MP3'], answer: 0 },
      ] },
    ],
    manuals: [
      { title: 'Platform admin guide', pages: 22, body: 'People, territories, catalogue, permissions, forms, workflows, rules, audit.' },
      { title: 'Cold start runbook', pages: 6, body: 'Bring the platform up from nothing in a new region, step by step.' },
    ],
  },
};

const ROLE_LABEL: Record<LearnRole, string> = { rep: 'Medical rep', manager: 'Manager', admin: 'Platform admin' };

export default function LearnView({ role, onToast }: { role: LearnRole; onToast?: (t: ToastInput) => void }) {
  const { notify, banner } = useNotice(onToast);
  const cur = CURRICULA[role];
  const [done, setDone] = useState<Record<string, boolean>>(role === 'rep' ? { r1: true } : {});
  const [openId, setOpenId] = useState<string | null>(null);
  const [watched, setWatched] = useState<Record<string, number>>({});
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState(false);

  const completed = cur.tutorials.filter(t => done[t.id]).length;
  const pct = Math.round((completed / cur.tutorials.length) * 100);
  const totalMin = cur.tutorials.reduce((s, t) => s + t.minutes, 0);
  const open = cur.tutorials.find(t => t.id === openId);

  const play = (id: string) => {
    setWatched(w => ({ ...w, [id]: 0 }));
    let p = 0;
    const timer = setInterval(() => {
      p += 20;
      setWatched(w => ({ ...w, [id]: Math.min(100, p) }));
      if (p >= 100) clearInterval(timer);
    }, 300);
  };

  const openTutorial = (id: string) => { setOpenId(id); setAnswers({}); setChecked(false); };

  const check = () => {
    if (!open) return;
    setChecked(true);
    const right = open.quiz.filter((q, i) => answers[`${open.id}-${i}`] === q.answer).length;
    if (right === open.quiz.length) {
      setDone(d => ({ ...d, [open.id]: true }));
      notify('Tutorial complete', `${open.title} · ${right} of ${open.quiz.length} correct`);
    } else {
      notify('Not quite', `${right} of ${open.quiz.length} correct. Review and try again.`, 'info');
    }
  };

  const downloadManual = (m: Manual) => {
    downloadText(`${m.title.toLowerCase().replace(/\s+/g, '-')}.txt`, `${m.title}\nFidson FieldForce · ${m.pages} pages\n\n${m.body}\n`);
    notify('Manual downloaded', m.title);
  };

  if (open) {
    const pctWatched = watched[open.id];
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[720px] mx-auto space-y-4">
        <button onClick={() => setOpenId(null)} className="flex items-center gap-1 text-sm font-semibold text-navy-600 py-2"><Icon name="chevronLeft" size={16} /> All tutorials</button>
        <div className="fade-up">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">{open.title}</h2>
          <p className="text-sm text-navy-500 mt-1">{open.minutes} min · {open.summary}</p>
        </div>
        <div className="relative aspect-video rounded-2xl bg-navy-900 overflow-hidden flex items-center justify-center">
          {pctWatched === undefined
            ? <button onClick={() => play(open.id)} aria-label="Play video" className="w-16 h-16 rounded-full bg-white/90 text-navy-900 flex items-center justify-center btn-press"><Icon name="arrowRight" size={28} /></button>
            : <p className="text-white/80 text-sm">{pctWatched >= 100 ? 'Watched · replay below' : 'Playing'}</p>}
          {pctWatched !== undefined && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20"><div className="h-full bg-leaf-400 transition-all" style={{ width: `${pctWatched}%` }} /></div>
          )}
        </div>
        {pctWatched !== undefined && pctWatched >= 100 && <button onClick={() => play(open.id)} className="text-xs font-bold text-navy-600 underline">Replay</button>}

        <div className="rounded-2xl bg-white border border-navy-100 p-4 sm:p-5 space-y-4">
          <p className="font-display font-bold text-ink">Quick check</p>
          {open.quiz.map((q, i) => {
            const key = `${open.id}-${i}`;
            return (
              <fieldset key={key}>
                <legend className="text-sm font-semibold text-ink">{i + 1}. {q.q}</legend>
                <div className="mt-2 space-y-1.5">
                  {q.options.map((o, j) => {
                    const chosen = answers[key] === j;
                    const show = checked && chosen;
                    return (
                      <button key={j} onClick={() => { setAnswers(a => ({ ...a, [key]: j })); setChecked(false); }} aria-pressed={chosen}
                        className={`w-full text-left px-3 py-3 rounded-xl border text-sm btn-press ${show ? (j === q.answer ? 'bg-leaf-50 border-leaf-300 text-leaf-800' : 'bg-rose-50 border-rose-300 text-rose-800') : chosen ? 'bg-navy-50 border-navy-400 text-ink' : 'bg-white border-navy-200 text-navy-700 hover:bg-paper'}`}>
                        {o}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}
          <button onClick={check} disabled={open.quiz.some((_, i) => answers[`${open.id}-${i}`] === undefined)}
            className="w-full h-12 rounded-xl bg-leaf-500 text-white font-bold btn-press disabled:opacity-40">Check answers</button>
          {done[open.id] && <p className="text-xs text-leaf-700 font-semibold flex items-center gap-1"><Icon name="checkCircle" size={14} /> Completed</p>}
        </div>
        {banner}
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-6 lg:p-8 ${role === 'rep' ? 'max-w-[720px]' : 'max-w-[1100px]'} mx-auto space-y-4`}>
      <div className="fade-up">
        <h2 className="font-display text-2xl font-bold text-ink">Learn</h2>
        <p className="text-sm text-navy-500 mt-1">{ROLE_LABEL[role]} curriculum · {cur.title}</p>
      </div>

      <div className="rounded-2xl bg-white border border-navy-100 p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-ink">{completed} of {cur.tutorials.length} tutorials done</span>
          <span className="text-navy-500">{totalMin} min in total</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-navy-100 overflow-hidden"><div className="h-full bg-leaf-500 transition-all" style={{ width: `${pct}%` }} /></div>
      </div>

      <div className={`grid gap-2 ${role === 'rep' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
        {cur.tutorials.map((t, i) => (
          <button key={t.id} onClick={() => openTutorial(t.id)}
            className="fade-up text-left p-4 rounded-2xl bg-white border border-navy-100 hover:border-navy-300 flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-display font-bold ${done[t.id] ? 'bg-leaf-100 text-leaf-700' : 'bg-navy-50 text-navy-600'}`}>
              {done[t.id] ? <Icon name="check" size={18} /> : i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-sm text-ink">{t.title}</p>
              <p className="text-xs text-navy-500 mt-0.5 truncate">{t.minutes} min · {t.quiz.length} questions</p>
            </div>
            <Icon name="chevronRight" size={16} className="text-navy-400" />
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-white border border-navy-100 p-4">
        <p className="stat-label text-navy-400 mb-2">Manuals</p>
        <div className="space-y-2">
          {cur.manuals.map(m => (
            <div key={m.title} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-navy-50 text-navy-600 flex items-center justify-center"><Icon name="file" size={16} /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink">{m.title}</p>
                <p className="text-[11px] text-navy-500">{m.pages} pages</p>
              </div>
              <button onClick={() => downloadManual(m)} className="px-3 py-2 rounded-lg border border-navy-200 text-xs font-bold text-navy-700 btn-press hover:bg-navy-50 flex items-center gap-1">
                <Icon name="download" size={14} /> Download
              </button>
            </div>
          ))}
        </div>
      </div>
      {banner}
    </div>
  );
}
