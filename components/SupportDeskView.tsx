import { useMemo, useState } from 'react';
import Icon from './Icon';
import { useHelpdesk } from '../stores/helpdesk';
import { agentAnswer, HYPERCARE, type LessonProposal, type Ticket } from '../assets/helpdesk';
import type { ToastInput } from '../types';

export type SupportTab = 'inbox' | 'review' | 'memory' | 'weekly' | 'hypercare';

interface SupportDeskViewProps {
  tab: SupportTab;
  onTab: (t: SupportTab) => void;
  agentName: string;
  onToast: (t: ToastInput) => void;
}

const MACROS = [
  { label: 'Weak GPS', text: 'Your phone reported 180 m accuracy and check-in needs 100 m, which is why the button stayed grey. Step outside or near a window for a few seconds. If it still won\'t lock, tap "Check in with weak signal": it records the accuracy and flags the visit for your manager, so it still counts.' },
  { label: 'Battery saver', text: 'Your phone\'s battery saver is stopping FieldForce in the background. Open Settings › Battery › App launch, find FieldForce and set it to Manage manually with all three switches on.' },
  { label: 'Known bug', text: 'This is a known fault in app 1.8.1 that engineering is fixing. Your order is safe in the queue and will send by itself once the fix ships. No need to re-enter it.' },
];

function slaChip(t: Ticket) {
  if (t.status === 'resolved') return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-leaf-100 text-leaf-700">Resolved</span>;
  if (t.slaMinsLeft < 0) return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">SLA breached {Math.abs(t.slaMinsLeft)}m</span>;
  const h = Math.floor(t.slaMinsLeft / 60), m = t.slaMinsLeft % 60;
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.slaMinsLeft < 30 ? 'bg-amber-100 text-amber-700' : 'bg-navy-100 text-navy-700'}`}>{h ? `${h}h ${m}m` : `${m}m`} left</span>;
}

function sevCls(s: string) {
  return s === 'P1' ? 'bg-rose-500 text-white' : s === 'P2' ? 'bg-amber-100 text-amber-800' : 'bg-navy-100 text-navy-700';
}

// ===== Inbox =====
function Inbox({ agentName, onToast, onReview }: { agentName: string; onToast: SupportDeskViewProps['onToast']; onReview: () => void }) {
  const hd = useHelpdesk();
  const [filter, setFilter] = useState<'open' | 'all'>('open');
  const sorted = useMemo(() => [...hd.tickets]
    .filter(t => filter === 'all' || t.status !== 'resolved')
    .sort((a, b) => (a.status === 'resolved' ? 1 : 0) - (b.status === 'resolved' ? 1 : 0) || a.slaMinsLeft - b.slaMinsLeft), [hd.tickets, filter]);
  const [selId, setSelId] = useState<string | null>(null);
  const sel = hd.tickets.find(t => t.id === (selId ?? sorted[0]?.id));
  const [reply, setReply] = useState('');

  const send = (resolve: boolean) => {
    if (!sel || !reply.trim()) return;
    if (resolve) {
      const drafts = hd.resolveTicket(sel.id, agentName, reply.trim());
      onToast({ type: 'success', title: `${sel.id} resolved`, msg: `The agent drafted ${drafts.length} lesson${drafts.length > 1 ? 's' : ''} from your fix · waiting for review` });
    } else {
      hd.replyToTicket(sel.id, agentName, reply.trim());
      onToast({ type: 'info', title: `Reply sent to ${sel.userName}`, msg: 'They see it under My tickets' });
    }
    setReply('');
  };

  return (
    <div className="grid lg:grid-cols-[340px_1fr] gap-4">
      <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-navy-100 flex items-center gap-2">
          <p className="font-display font-bold text-ink text-sm flex-1">Tickets</p>
          {(['open', 'all'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`text-[11px] font-bold px-2 py-1 rounded-md ${filter === f ? 'bg-navy-900 text-white' : 'text-navy-500 hover:bg-navy-50'}`}>{f === 'open' ? 'Open' : 'All'}</button>
          ))}
        </div>
        <ul className="divide-y divide-navy-50 max-h-[560px] overflow-y-auto" role="listbox" aria-label="Tickets">
          {sorted.map(t => (
            <li key={t.id}>
              <button
                role="option"
                aria-selected={sel?.id === t.id}
                onClick={() => setSelId(t.id)}
                className={`w-full text-left px-4 py-3 hover:bg-paper focus:bg-paper outline-none ${sel?.id === t.id ? 'bg-leaf-50/60 border-l-4 border-leaf-500' : 'border-l-4 border-transparent'}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${sevCls(t.severity)}`}>{t.severity}</span>
                  <span className="text-[11px] font-bold text-navy-500">{t.id}</span>
                  <span className="ml-auto">{slaChip(t)}</span>
                </div>
                <p className="text-sm font-semibold text-ink mt-1 line-clamp-1">{t.subject}</p>
                <p className="text-[11px] text-navy-500">{t.userName} · {t.context.role} · {t.openedAt}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {sel ? (
        <div className="rounded-2xl bg-white border border-navy-100 flex flex-col min-h-[560px]">
          <div className="px-5 py-4 border-b border-navy-100">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${sevCls(sel.severity)}`}>{sel.severity}</span>
              <span className="text-xs font-bold text-navy-500">{sel.id}</span>
              {slaChip(sel)}
            </div>
            <h3 className="font-display text-lg font-bold text-ink mt-1">{sel.subject}</h3>
            <p className="text-xs text-navy-500">{sel.userName} · {sel.userEmail}</p>
          </div>
          <div className="grid md:grid-cols-[1fr_230px] flex-1 min-h-0">
            <div className="p-5 space-y-3 overflow-y-auto">
              {sel.messages.map((m, i) => (
                <div key={i} className={`rounded-xl p-3 text-sm ${m.from === 'user' ? 'bg-paper' : m.from === 'ai' ? 'bg-violet-50 border border-violet-100' : 'bg-leaf-50 border border-leaf-100'}`}>
                  <p className="text-[11px] font-bold text-navy-500 mb-0.5 flex items-center gap-1">
                    {m.from === 'ai' && <Icon name="sparkles" size={11} className="text-violet-600" />}
                    {m.name} · {m.at}
                  </p>
                  <p className="text-ink leading-snug">{m.text}</p>
                </div>
              ))}
              {sel.status === 'resolved' && (
                <button onClick={onReview} className="w-full rounded-xl border border-dashed border-leaf-400 bg-leaf-50 p-3 text-sm text-leaf-800 font-semibold flex items-center gap-2 btn-press">
                  <Icon name="sparkles" size={14} /> The agent drafted lessons from this fix. Review them
                  <Icon name="arrowRight" size={14} className="ml-auto" />
                </button>
              )}
            </div>
            <aside className="border-t md:border-t-0 md:border-l border-navy-100 p-4 bg-paper/60 text-xs space-y-2">
              <p className="text-[10px] font-bold text-navy-500 uppercase tracking-wider">Captured with the ticket</p>
              {([
                ['Role', sel.context.role], ['Screen', sel.context.screen], ['Device', sel.context.device],
                ['App', sel.context.appVersion], ['Network', sel.context.network], ['Queued sync', String(sel.context.queuedSync)],
                ...(sel.context.gps ? [['GPS', sel.context.gps]] : []),
                ...(sel.context.lastError ? [['Last error', sel.context.lastError]] : []),
              ] as [string, string][]).map(([k, v]) => (
                <div key={k}>
                  <p className="text-navy-400">{k}</p>
                  <p className={`font-semibold ${k === 'Last error' || k === 'GPS' ? 'text-rose-700' : 'text-ink'}`}>{v}</p>
                </div>
              ))}
              {hd.notes.filter(n => n.userEmail === sel.userEmail).map(n => (
                <div key={n.id} className="rounded-lg bg-violet-50 border border-violet-100 p-2 text-violet-800">
                  <p className="font-bold flex items-center gap-1"><Icon name="lock" size={11} /> Private note</p>
                  <p className="mt-0.5">{n.note}</p>
                </div>
              ))}
            </aside>
          </div>
          {sel.status !== 'resolved' && (
            <div className="border-t border-navy-100 p-4">
              <div className="flex gap-1.5 mb-2 flex-wrap">
                {MACROS.map(mc => (
                  <button key={mc.label} onClick={() => setReply(mc.text)} className="text-[11px] font-semibold px-2 py-1 rounded-md bg-navy-50 text-navy-700 hover:bg-navy-100">{mc.label}</button>
                ))}
              </div>
              <textarea
                rows={3}
                value={reply}
                onChange={e => setReply(e.target.value)}
                placeholder={`Reply to ${sel.userName.split(' ')[0]}…`}
                aria-label="Reply"
                className="input-field w-full p-3 rounded-xl bg-paper border border-navy-200 text-sm resize-none"
              />
              <div className="mt-2 flex gap-2 justify-end">
                <button onClick={() => send(false)} disabled={!reply.trim()} className="px-4 py-2 rounded-lg border border-navy-200 text-sm font-bold text-navy-700 disabled:opacity-40">Reply</button>
                <button onClick={() => send(true)} disabled={!reply.trim()} className="px-4 py-2 rounded-lg bg-leaf-500 text-white text-sm font-bold flex items-center gap-1.5 disabled:opacity-40 btn-press">
                  <Icon name="checkCircle" size={14} /> Resolve and teach the agent
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-navy-100 p-10 text-center text-navy-500">No tickets</div>
      )}
    </div>
  );
}

// ===== Lessons to review (Loop 1 approvals) =====
function ProposalCard({ p, agentName, onToast }: { p: LessonProposal; agentName: string; onToast: SupportDeskViewProps['onToast'] }) {
  const hd = useHelpdesk();
  const [answer, setAnswer] = useState(p.answer);
  const [triggers, setTriggers] = useState(p.triggers.join(', '));
  const isPrivate = p.kind === 'private';

  const decide = (d: 'approved' | 'rejected') => {
    hd.decideProposal(p.id, d, agentName, { answer, triggers: triggers.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) });
    onToast(d === 'approved'
      ? { type: 'success', title: isPrivate ? `Saved to ${p.userName}'s private memory` : 'Lesson added to shared memory', msg: isPrivate ? 'Only used when they ask' : 'Every user gets this answer from now on · new version saved' }
      : { type: 'info', title: 'Lesson rejected', msg: 'The agent will not use it' });
  };

  return (
    <div className={`rounded-2xl bg-white border p-5 ${isPrivate ? 'border-violet-200' : 'border-navy-100'}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isPrivate ? 'bg-violet-100 text-violet-700' : 'bg-leaf-100 text-leaf-700'}`}>
          {isPrivate ? `Private · ${p.userName}` : 'Shared · every user'}
        </span>
        <span className="text-[11px] text-navy-500">from {p.ticketId}</span>
        {p.status !== 'pending' && <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${p.status === 'approved' ? 'bg-leaf-500 text-white' : 'bg-navy-100 text-navy-600'}`}>{p.status === 'approved' ? 'Approved' : 'Rejected'}</span>}
      </div>
      <h4 className="font-display font-bold text-ink mt-2">{p.title}</h4>
      <p className="text-xs text-navy-500 mt-1"><span className="font-semibold">Why the agent proposed it:</span> {p.why}</p>
      <label className="block mt-3 text-[11px] font-bold text-navy-500 uppercase tracking-wider">{isPrivate ? 'Note' : 'Answer the agent will give'}</label>
      <textarea rows={isPrivate ? 2 : 4} value={answer} onChange={e => setAnswer(e.target.value)} disabled={p.status !== 'pending'} className="input-field w-full mt-1 p-3 rounded-xl bg-paper border border-navy-200 text-sm resize-none disabled:opacity-70" />
      {!isPrivate && (
        <>
          <label className="block mt-2 text-[11px] font-bold text-navy-500 uppercase tracking-wider">When to use it (words in the question)</label>
          <input value={triggers} onChange={e => setTriggers(e.target.value)} disabled={p.status !== 'pending'} className="input-field w-full mt-1 px-3 py-2 rounded-xl bg-paper border border-navy-200 text-sm disabled:opacity-70" />
        </>
      )}
      {p.status === 'pending' && (
        <div className="mt-3 flex gap-2 justify-end">
          <button onClick={() => decide('rejected')} className="px-4 py-2 rounded-lg border border-navy-200 text-sm font-bold text-navy-700">Reject</button>
          <button onClick={() => decide('approved')} className="px-4 py-2 rounded-lg bg-leaf-500 text-white text-sm font-bold flex items-center gap-1.5 btn-press">
            <Icon name="check" size={14} /> {isPrivate ? 'Approve private note' : 'Approve into memory'}
          </button>
        </div>
      )}
    </div>
  );
}

function Review({ agentName, onToast }: { agentName: string; onToast: SupportDeskViewProps['onToast'] }) {
  const hd = useHelpdesk();
  const pending = hd.proposals.filter(p => p.status === 'pending');
  const done = hd.proposals.filter(p => p.status !== 'pending');
  return (
    <div className="max-w-3xl space-y-4">
      <div className="rounded-2xl bg-navy-900 text-white p-5 flex gap-3">
        <Icon name="lock" size={18} className="text-leaf-300 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-navy-100 leading-snug">
          The agent learns from how tickets are fixed, but nothing goes into its memory until someone here approves it. Shared lessons answer everyone. Private notes are about one person and are only used in their conversations. Memory can explain how to do something; it can never approve, unlock or change a limit.
        </p>
      </div>
      {pending.length === 0 && (
        <div className="rounded-2xl bg-white border border-navy-100 p-8 text-center text-sm text-navy-500">
          Nothing to review. Resolve a ticket in the inbox and the agent will draft lessons from your fix.
        </div>
      )}
      {pending.map(p => <ProposalCard key={p.id} p={p} agentName={agentName} onToast={onToast} />)}
      {done.length > 0 && <p className="text-[11px] font-bold text-navy-400 uppercase tracking-wider pt-2">Decided</p>}
      {done.map(p => <ProposalCard key={p.id} p={p} agentName={agentName} onToast={onToast} />)}
    </div>
  );
}

// ===== Agent memory, versions, sandbox =====
const TEST_USERS = [
  { name: 'Tope Adeola', email: 'tope.adeola@fidson.com' },
  { name: 'Adaeze Okafor', email: 'adaeze.okafor@fidson.com' },
  { name: 'Tunde Bakare', email: 'tunde.bakare@fidson.com' },
];

function Memory({ agentName, onToast }: { agentName: string; onToast: SupportDeskViewProps['onToast'] }) {
  const hd = useHelpdesk();
  const [asUser, setAsUser] = useState(TEST_USERS[0]);
  const [q, setQ] = useState('My check-in button stays grey inside the hospital');
  const [result, setResult] = useState<ReturnType<typeof agentAnswer> | null>(null);
  const current = hd.versions[hd.versions.length - 1];

  return (
    <div className="grid xl:grid-cols-[1fr_380px] gap-4">
      <div className="space-y-4">
        <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-navy-100 flex items-center gap-2">
            <p className="font-display font-bold text-ink flex-1">Shared lessons · {hd.lessons.length}</p>
            <span className="text-[11px] text-navy-500">Version {current?.v} · Instructions v{hd.instructionsVersion}</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-paper text-[10px] uppercase tracking-wider text-navy-500">
              <tr><th className="text-left px-5 py-2">Lesson</th><th className="text-left px-3 py-2 hidden md:table-cell">Learned from</th><th className="text-left px-3 py-2 hidden md:table-cell">Approved by</th><th className="text-right px-5 py-2">Used</th></tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {hd.lessons.map(l => (
                <tr key={l.id}>
                  <td className="px-5 py-2.5"><span className="text-[11px] font-bold text-navy-400 mr-2">{l.id}</span><span className="font-semibold text-ink">{l.title}</span></td>
                  <td className="px-3 py-2.5 text-navy-600 hidden md:table-cell">{l.learnedFrom}</td>
                  <td className="px-3 py-2.5 text-navy-600 hidden md:table-cell">{l.approvedBy} · {l.approvedAt}</td>
                  <td className="px-5 py-2.5 text-right font-bold text-ink">{l.uses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl bg-white border border-violet-100 p-5">
          <p className="font-display font-bold text-ink flex items-center gap-2"><Icon name="lock" size={14} className="text-violet-600" /> Private notes · {hd.notes.length}</p>
          <p className="text-xs text-navy-500 mt-0.5 mb-3">Each note is only loaded when that person is talking to the agent.</p>
          <ul className="space-y-2">
            {hd.notes.map(n => (
              <li key={n.id} className="rounded-xl bg-violet-50/60 border border-violet-100 p-3 text-sm">
                <p className="text-[11px] font-bold text-violet-700">{n.userName} · from {n.learnedFrom}</p>
                <p className="text-ink mt-0.5">{n.note}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-white border border-navy-100 p-5">
          <p className="font-display font-bold text-ink">Versions</p>
          <p className="text-xs text-navy-500 mt-0.5 mb-3">Every approved change is a version. Rolling back restores exactly the lessons that were live then.</p>
          <ol className="space-y-2">
            {[...hd.versions].reverse().map((v, i) => (
              <li key={v.v} className="flex items-start gap-3 text-sm">
                <span className={`mt-0.5 text-[11px] font-bold px-2 py-0.5 rounded-md ${i === 0 ? 'bg-leaf-500 text-white' : 'bg-navy-100 text-navy-700'}`}>v{v.v}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-ink">{v.change}</p>
                  <p className="text-[11px] text-navy-500">{v.by} · {v.at} · {v.lessonIds.length} lessons live</p>
                </div>
                {i > 0 && (
                  <button
                    onClick={() => { hd.rollbackTo(v.v, agentName); onToast({ type: 'info', title: `Rolled back to v${v.v}`, msg: 'Saved as a new version, so it can be undone' }); }}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-md border border-navy-200 text-navy-700 hover:bg-navy-50 flex-shrink-0"
                  >
                    Roll back
                  </button>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-navy-100 p-5 h-fit xl:sticky xl:top-4">
        <p className="font-display font-bold text-ink flex items-center gap-2"><Icon name="sparkles" size={14} className="text-leaf-600" /> Try the agent</p>
        <p className="text-xs text-navy-500 mt-0.5 mb-3">Ask as someone else to check a lesson reaches people who never raised the ticket.</p>
        <label className="text-[11px] font-bold text-navy-500 uppercase tracking-wider">Ask as</label>
        <select
          value={asUser.email}
          onChange={e => { setAsUser(TEST_USERS.find(u => u.email === e.target.value) ?? TEST_USERS[0]); setResult(null); }}
          className="input-field w-full mt-1 px-3 py-2 rounded-xl bg-paper border border-navy-200 text-sm"
        >
          {TEST_USERS.map(u => <option key={u.email} value={u.email}>{u.name}</option>)}
        </select>
        <label className="block mt-3 text-[11px] font-bold text-navy-500 uppercase tracking-wider">Question</label>
        <textarea rows={2} value={q} onChange={e => setQ(e.target.value)} className="input-field w-full mt-1 p-3 rounded-xl bg-paper border border-navy-200 text-sm resize-none" />
        <button onClick={() => setResult(agentAnswer(q, hd.lessons, hd.notes, asUser.email))} className="mt-2 w-full py-2 rounded-lg bg-navy-900 text-white text-sm font-bold btn-press">Ask</button>
        {result && (
          <div className={`mt-3 rounded-xl p-3 text-sm ${result.escalate ? 'bg-amber-50 border border-amber-200' : 'bg-leaf-50 border border-leaf-100'}`}>
            <p className="text-ink leading-snug">{result.text}</p>
            <p className="mt-2 text-[11px] font-semibold text-navy-600">
              {result.lesson ? `Answered from ${result.lesson.id} · learned from ${result.lesson.learnedFrom}` : result.refused ? 'Refused: needs a person with authority' : 'No lesson yet · would open a ticket'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== Weekly review (Loop 2) =====
const KIND_META = {
  instruction: { label: 'Change instructions', cls: 'bg-sky-100 text-sky-700', icon: 'edit' as const, applied: 'Instructions updated · new version saved' },
  bug: { label: 'Bug for engineering', cls: 'bg-rose-100 text-rose-700', icon: 'flag' as const, applied: 'Raised FID-512 for engineering with 7 tickets attached' },
  training: { label: 'Assign training', cls: 'bg-amber-100 text-amber-700', icon: 'target' as const, applied: '"Your discount limit" assigned to 5 reps' },
  lesson: { label: 'New lesson', cls: 'bg-leaf-100 text-leaf-700', icon: 'checkCircle' as const, applied: 'Lesson queued for review' },
};

function Weekly({ agentName, onToast }: { agentName: string; onToast: SupportDeskViewProps['onToast'] }) {
  const hd = useHelpdesk();
  return (
    <div className="max-w-4xl space-y-4">
      <div className="rounded-2xl bg-white border border-navy-100 p-5 flex flex-wrap gap-6">
        <div><p className="text-[11px] text-navy-500">Conversations read</p><p className="font-display text-2xl font-bold text-ink">412</p></div>
        <div><p className="text-[11px] text-navy-500">Tickets read</p><p className="font-display text-2xl font-bold text-ink">58</p></div>
        <div><p className="text-[11px] text-navy-500">Patterns found</p><p className="font-display text-2xl font-bold text-ink">{hd.findings.length}</p></div>
        <p className="text-xs text-navy-500 flex-1 min-w-[220px]">Every Monday the agent reads last week's conversations and tickets, groups what keeps going wrong, and proposes a fix. Nothing changes until someone applies it.</p>
      </div>
      {hd.findings.map(f => {
        const k = KIND_META[f.kind];
        return (
          <div key={f.id} className="rounded-2xl bg-white border border-navy-100 p-5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${k.cls}`}><Icon name={k.icon} size={11} /> {k.label}</span>
              <span className="text-[11px] text-navy-500">{f.count} occurrences</span>
              {f.status !== 'pending' && <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${f.status === 'applied' ? 'bg-leaf-500 text-white' : 'bg-navy-100 text-navy-600'}`}>{f.status === 'applied' ? 'Applied' : 'Dismissed'}</span>}
            </div>
            <h4 className="font-display font-bold text-ink mt-2">{f.title}</h4>
            <p className="text-sm text-navy-600 mt-1">{f.evidence}</p>
            <p className="text-sm text-ink mt-2"><span className="font-semibold">Proposed:</span> {f.proposal}</p>
            {f.before && f.after && (
              <div className="mt-3 grid md:grid-cols-2 gap-2 text-xs font-mono">
                <div className="rounded-lg bg-rose-50 border border-rose-100 p-2.5 text-rose-900"><p className="font-sans font-bold text-[10px] uppercase mb-1">Now</p>{f.before}</div>
                <div className="rounded-lg bg-leaf-50 border border-leaf-100 p-2.5 text-leaf-900"><p className="font-sans font-bold text-[10px] uppercase mb-1">After</p>{f.after}</div>
              </div>
            )}
            {f.status === 'pending' && (
              <div className="mt-3 flex gap-2 justify-end">
                <button onClick={() => { hd.decideFinding(f.id, 'dismissed', agentName); onToast({ type: 'info', title: 'Dismissed', msg: 'The review will rank this pattern lower next week' }); }} className="px-4 py-2 rounded-lg border border-navy-200 text-sm font-bold text-navy-700">Dismiss</button>
                <button onClick={() => { hd.decideFinding(f.id, 'applied', agentName); onToast({ type: 'success', title: 'Applied', msg: k.applied }); }} className="px-4 py-2 rounded-lg bg-leaf-500 text-white text-sm font-bold btn-press">Apply</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ===== Hypercare (Schedule A 11.4) =====
function Hypercare({ onToast }: { onToast: SupportDeskViewProps['onToast'] }) {
  const hd = useHelpdesk();
  const [checkIns, setCheckIns] = useState(HYPERCARE.checkIns);
  const [note, setNote] = useState('');
  const open = hd.tickets.filter(t => t.status !== 'resolved');
  const bySev = (s: string) => open.filter(t => t.severity === s).length;
  const max = Math.max(...HYPERCARE.byDay);
  const stats = [
    { l: 'Hypercare day', v: `${HYPERCARE.day} of ${HYPERCARE.of}` },
    { l: 'Open P1', v: String(bySev('P1')), warn: bySev('P1') > 0 },
    { l: 'Open P2 / P3', v: `${bySev('P2')} / ${bySev('P3')}` },
    { l: 'Answered by agent', v: `${HYPERCARE.answeredByAgent}%` },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.l} className={`rounded-2xl bg-white border p-4 ${s.warn ? 'border-rose-200' : 'border-navy-100'}`}>
            <p className="text-[11px] text-navy-500">{s.l}</p>
            <p className={`font-display text-2xl font-bold ${s.warn ? 'text-rose-600' : 'text-ink'}`}>{s.v}</p>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white border border-navy-100 p-5">
          <p className="font-display font-bold text-ink">Fix turnaround vs agreed SLA</p>
          <table className="w-full text-sm mt-3">
            <tbody className="divide-y divide-navy-50">
              {HYPERCARE.turnaround.map(r => (
                <tr key={r.label}>
                  <td className="py-2 text-ink">{r.label}</td>
                  <td className="py-2 text-navy-500 text-right">target {r.target}</td>
                  <td className={`py-2 text-right font-bold ${r.ok ? 'text-leaf-600' : 'text-rose-600'}`}>{r.actual}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="font-display font-bold text-ink mt-5">Tickets per day since go-live</p>
          <svg viewBox={`0 0 ${HYPERCARE.byDay.length * 34} 110`} className="w-full h-32 mt-2" role="img" aria-label="Tickets per day">
            {HYPERCARE.byDay.map((n, i) => {
              const h = (n / max) * 80;
              return (
                <g key={i}>
                  <rect x={i * 34 + 6} y={90 - h} width={22} height={h} rx={4} className={i === HYPERCARE.byDay.length - 1 ? 'fill-leaf-500' : 'fill-navy-200'} />
                  <text x={i * 34 + 17} y={86 - h} textAnchor="middle" className="fill-navy-600" fontSize="9">{n}</text>
                  <text x={i * 34 + 17} y={104} textAnchor="middle" className="fill-navy-400" fontSize="9">D{i + 1}</text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="rounded-2xl bg-white border border-navy-100 p-5">
          <p className="font-display font-bold text-ink">Daily check-ins</p>
          <div className="mt-3 flex gap-2">
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="Notes from today's 09:00 check-in…" className="input-field flex-1 px-3 py-2 rounded-xl bg-paper border border-navy-200 text-sm" />
            <button
              disabled={!note.trim()}
              onClick={() => {
                setCheckIns(prev => [{ day: `Day ${HYPERCARE.day} · today`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), attendees: 'Fidson IT, Sales Ops, Tales', notes: note.trim(), done: true }, ...prev]);
                setNote('');
                onToast({ type: 'success', title: 'Check-in logged', msg: 'Shared with Fidson IT and Sales Ops' });
              }}
              className="px-3 py-2 rounded-lg bg-navy-900 text-white text-sm font-bold disabled:opacity-40"
            >
              Log
            </button>
          </div>
          <ul className="mt-3 space-y-2">
            {checkIns.map((c, i) => (
              <li key={i} className="rounded-xl bg-paper p-3 text-sm">
                <p className="text-[11px] font-bold text-navy-500">{c.day} · {c.time} · {c.attendees}</p>
                <p className="text-ink mt-0.5">{c.notes}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

const TABS: { k: SupportTab; l: string; i: 'mail' | 'checkCircle' | 'layers' | 'refresh' | 'activity' }[] = [
  { k: 'inbox', l: 'Inbox', i: 'mail' },
  { k: 'review', l: 'Lessons to review', i: 'checkCircle' },
  { k: 'memory', l: 'Agent memory', i: 'layers' },
  { k: 'weekly', l: 'Weekly review', i: 'refresh' },
  { k: 'hypercare', l: 'Hypercare', i: 'activity' },
];

export default function SupportDeskView({ tab, onTab, agentName, onToast }: SupportDeskViewProps) {
  const hd = useHelpdesk();
  const counts: Partial<Record<SupportTab, number>> = {
    inbox: hd.tickets.filter(t => t.status !== 'resolved').length,
    review: hd.proposals.filter(p => p.status === 'pending').length,
    weekly: hd.findings.filter(f => f.status === 'pending').length,
  };
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex gap-1 overflow-x-auto pb-1" role="tablist">
        {TABS.map(t => (
          <button
            key={t.k}
            role="tab"
            aria-selected={tab === t.k}
            onClick={() => onTab(t.k)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${tab === t.k ? 'bg-navy-900 text-white' : 'bg-white border border-navy-100 text-navy-600 hover:bg-navy-50'}`}
          >
            <Icon name={t.i} size={14} /> {t.l}
            {!!counts[t.k] && <span className={`px-1.5 rounded-full text-[10px] font-bold ${tab === t.k ? 'bg-white/20' : 'bg-leaf-500 text-white'}`}>{counts[t.k]}</span>}
          </button>
        ))}
      </div>
      {tab === 'inbox' && <Inbox agentName={agentName} onToast={onToast} onReview={() => onTab('review')} />}
      {tab === 'review' && <Review agentName={agentName} onToast={onToast} />}
      {tab === 'memory' && <Memory agentName={agentName} onToast={onToast} />}
      {tab === 'weekly' && <Weekly agentName={agentName} onToast={onToast} />}
      {tab === 'hypercare' && <Hypercare onToast={onToast} />}
    </div>
  );
}
