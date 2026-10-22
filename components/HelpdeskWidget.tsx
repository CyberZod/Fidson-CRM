import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { useHelpdesk } from '../stores/helpdesk';
import { agentAnswer, contextFor, type Lesson, type PrivateNote, type TicketContext, type TicketMessage } from '../assets/helpdesk';

interface HelpdeskWidgetProps {
  userName: string;
  userEmail: string;
  roleLabel: string;
  isRep: boolean;
  screen: string;
  hidden?: boolean;
}

interface ChatMessage {
  id: number;
  from: 'user' | 'agent';
  text: string;
  time: string;
  lesson?: Lesson;
  note?: PrivateNote;
  refused?: boolean;
  escalateOffer?: { question: string; context: TicketContext };
  ticketId?: string;
}

const SUGGESTIONS = [
  'Check-in button is grey at Lakeshore',
  'Where do I submit my DCR?',
  'Can you approve my 18% discount for me?',
  'My offline visits have not synced',
];

function nowLabel(): string {
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function ContextCard({ ctx }: { ctx: TicketContext }) {
  const rows: [string, string][] = [
    ['Screen', ctx.screen],
    ['Phone', ctx.device],
    ['App', ctx.appVersion],
    ['Network', ctx.network],
    ['Queued to sync', String(ctx.queuedSync)],
  ];
  if (ctx.gps) rows.push(['GPS', ctx.gps]);
  return (
    <div className="mt-2 rounded-xl bg-paper border border-navy-100 p-2.5">
      <p className="text-[10px] font-bold text-navy-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
        <Icon name="eye" size={11} /> Attached automatically
      </p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[11px]">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-navy-400">{k}</dt>
            <dd className="text-ink font-medium truncate">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function HelpdeskWidget({ userName, userEmail, roleLabel, isRep, screen, hidden }: HelpdeskWidgetProps) {
  const hd = useHelpdesk();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'chat' | 'tickets'>('chat');
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [seen, setSeen] = useState<Record<string, number>>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // A new person (role switch) starts a new conversation.
  useEffect(() => {
    setMessages([{
      id: 1, from: 'agent', time: nowLabel(),
      text: `Hi ${userName.split(' ')[0]}. Ask me anything about FieldForce. I answer from lessons the support desk has approved, and when I don't know, I hand you to a person.`,
    }]);
    setTab('chat');
  }, [userEmail, userName]);

  useEffect(() => {
    if (open && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing, open, tab]);

  useEffect(() => {
    if (open && tab === 'chat') inputRef.current?.focus();
  }, [open, tab]);

  const myTickets = hd.tickets.filter(t => t.userEmail === userEmail);
  const unread = myTickets.filter(t => t.messages.filter(m => m.from === 'agent').length > (seen[t.id] ?? 0)).length;

  const ask = (raw?: string) => {
    const text = (raw ?? draft).trim();
    if (!text) return;
    setMessages(prev => [...prev, { id: Date.now(), from: 'user', text, time: nowLabel() }]);
    setDraft('');
    setTyping(true);
    setTimeout(() => {
      const r = agentAnswer(text, hd.lessons, hd.notes, userEmail);
      if (r.lesson) hd.recordUse(r.lesson.id);
      setMessages(prev => [...prev, {
        id: Date.now() + 1, from: 'agent', time: nowLabel(), text: r.text,
        lesson: r.lesson, note: r.note, refused: r.refused,
        escalateOffer: r.escalate ? { question: text, context: contextFor(roleLabel, screen, isRep) } : undefined,
      }]);
      setTyping(false);
    }, 900);
  };

  const escalate = (msgId: number, offer: { question: string; context: TicketContext }) => {
    const convo: TicketMessage[] = messages
      .filter(m => m.id !== 1)
      .map(m => ({ from: m.from === 'user' ? 'user' : 'ai', name: m.from === 'user' ? userName : 'Help desk agent', text: m.text, at: m.time }));
    const t = hd.openTicket({
      subject: offer.question.length > 60 ? `${offer.question.slice(0, 57)}...` : offer.question,
      userName, userEmail, context: offer.context, conversation: convo,
      severity: blocking ? 'P1' : 'P2',
    });
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, escalateOffer: undefined, ticketId: t.id } : m).concat({
      id: Date.now(), from: 'agent', time: nowLabel(),
      text: `Sent to the support desk as ${t.id} (${t.severity}). Grace Okon is on shift. You'll see her reply under My tickets, and I'll learn from how she fixes it once it's approved.`,
    }));
    setBlocking(false);
  };

  const openTickets = () => {
    setTab('tickets');
    setSeen(Object.fromEntries(myTickets.map(t => [t.id, t.messages.filter(m => m.from === 'agent').length])));
  };

  if (hidden) return null;

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open help desk"
          className="fixed left-4 bottom-20 md:bottom-4 z-[90] rounded-full bg-leaf-500 text-white shadow-lg shadow-leaf-500/30 flex items-center justify-center btn-press hover:bg-leaf-600 transition-colors"
          style={{ width: 56, height: 56 }}
        >
          <Icon name="helpCircle" size={24} strokeWidth={2} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-rose-500 border-2 border-white text-[10px] font-bold flex items-center justify-center">{unread}</span>
          )}
        </button>
      )}

      {open && (
        <div className="fixed left-2 right-2 bottom-2 sm:left-4 sm:right-auto sm:bottom-4 z-[95] sm:w-[380px] slide-in-right">
          <div className="bg-white border border-navy-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden h-[78vh] sm:h-[580px] max-h-[640px]">
            <div className="bg-navy-900 text-white px-4 pt-3 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-leaf-500 flex items-center justify-center flex-shrink-0">
                  <Icon name="sparkles" size={18} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-sm leading-tight">FieldForce Help Desk</p>
                  <p className="text-[11px] text-navy-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-leaf-400 inline-block" />
                    Agent answers now · Grace Okon on shift
                  </p>
                </div>
                <button onClick={() => setOpen(false)} aria-label="Close help desk" className="text-navy-200 hover:text-white btn-press w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center">
                  <Icon name="chevronDown" size={20} />
                </button>
              </div>
              <div className="flex gap-4 mt-2 text-xs font-semibold" role="tablist">
                <button role="tab" aria-selected={tab === 'chat'} onClick={() => setTab('chat')} className={`pb-2 border-b-2 ${tab === 'chat' ? 'border-leaf-400 text-white' : 'border-transparent text-navy-300'}`}>Ask</button>
                <button role="tab" aria-selected={tab === 'tickets'} onClick={openTickets} className={`pb-2 border-b-2 flex items-center gap-1.5 ${tab === 'tickets' ? 'border-leaf-400 text-white' : 'border-transparent text-navy-300'}`}>
                  My tickets
                  {myTickets.length > 0 && <span className={`px-1.5 rounded-full text-[10px] ${unread ? 'bg-rose-500 text-white' : 'bg-white/15'}`}>{myTickets.length}</span>}
                </button>
              </div>
            </div>

            {tab === 'chat' ? (
              <>
                <div ref={scrollRef} className="flex-1 overflow-y-auto bg-paper px-3 py-4 space-y-3">
                  {messages.map(m => (
                    <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[88%] ${m.from === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className={`px-3 py-2 rounded-2xl text-sm leading-snug ${
                          m.from === 'user' ? 'bg-leaf-500 text-white rounded-br-sm'
                            : m.refused ? 'bg-amber-50 border border-amber-200 text-ink rounded-bl-sm'
                            : 'bg-white border border-navy-100 text-ink rounded-bl-sm'}`}
                        >
                          {m.text}
                          {m.note && (
                            <p className="mt-2 text-[11px] text-violet-700 bg-violet-50 border border-violet-100 rounded-lg px-2 py-1.5 flex gap-1.5">
                              <Icon name="lock" size={11} className="mt-0.5 flex-shrink-0" />
                              <span>{m.note.forUser ?? m.note.note}</span>
                            </p>
                          )}
                          {m.lesson && (
                            <p className="mt-2 pt-2 border-t border-navy-100 text-[10px] text-navy-500 flex items-center gap-1">
                              <Icon name="checkCircle" size={11} className="text-leaf-600" />
                              Lesson {m.lesson.id} · learned from {m.lesson.learnedFrom} · approved by {m.lesson.approvedBy}
                            </p>
                          )}
                          {m.refused && (
                            <p className="mt-2 pt-2 border-t border-amber-200 text-[10px] text-amber-700 flex items-center gap-1">
                              <Icon name="lock" size={11} /> Approvals stay with people. The agent can't grant them.
                            </p>
                          )}
                          {m.escalateOffer && (
                            <>
                              <ContextCard ctx={m.escalateOffer.context} />
                              <label className="mt-2 flex items-center gap-2 text-[11px] text-navy-600">
                                <input type="checkbox" checked={blocking} onChange={e => setBlocking(e.target.checked)} className="accent-rose-500" />
                                This stops me working (urgent)
                              </label>
                              <button onClick={() => escalate(m.id, m.escalateOffer!)} className="mt-2 w-full py-2 rounded-lg bg-navy-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 btn-press">
                                <Icon name="send" size={12} /> Send to support desk
                              </button>
                            </>
                          )}
                          {m.ticketId && (
                            <p className="mt-2 text-[11px] font-semibold text-leaf-700 flex items-center gap-1"><Icon name="check" size={12} /> Ticket {m.ticketId} opened</p>
                          )}
                        </div>
                        <span className="text-[10px] text-navy-400 mt-1 px-1">{m.time}</span>
                      </div>
                    </div>
                  ))}
                  {typing && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-navy-100 rounded-2xl rounded-bl-sm px-3 py-2.5 flex items-center gap-1">
                        {[0, 150, 300].map(d => <span key={d} className="w-1.5 h-1.5 rounded-full bg-navy-300 pulse-dot" style={{ animationDelay: `${d}ms` }} />)}
                      </div>
                    </div>
                  )}
                  {messages.length <= 1 && !typing && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {SUGGESTIONS.map(s => (
                        <button key={s} onClick={() => ask(s)} className="px-2.5 py-1.5 rounded-full bg-white border border-navy-100 text-[11px] text-navy-700 hover:border-leaf-400 btn-press">{s}</button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="border-t border-navy-100 bg-white px-3 py-2.5 flex items-center gap-2 flex-shrink-0">
                  <input
                    ref={inputRef}
                    type="text"
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); ask(); } }}
                    placeholder="Describe the problem…"
                    aria-label="Message the help desk"
                    className="flex-1 bg-paper border border-navy-100 rounded-full px-4 py-2 text-sm outline-none focus:border-leaf-400 transition-colors placeholder-navy-400"
                  />
                  <button onClick={() => ask()} disabled={!draft.trim()} aria-label="Send message" className="w-9 h-9 rounded-full bg-leaf-500 text-white flex items-center justify-center flex-shrink-0 btn-press hover:bg-leaf-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <Icon name="send" size={16} strokeWidth={2} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto bg-paper p-3 space-y-2.5">
                {myTickets.length === 0 && (
                  <div className="text-center text-sm text-navy-500 py-10">
                    <Icon name="checkCircle" size={28} className="mx-auto text-leaf-500 mb-2" />
                    No tickets. When the agent can't help, it opens one for you here.
                  </div>
                )}
                {myTickets.map(t => {
                  const last = [...t.messages].reverse().find(m => m.from === 'agent');
                  return (
                    <div key={t.id} className="rounded-xl bg-white border border-navy-100 p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-navy-500">{t.id}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${t.severity === 'P1' ? 'bg-rose-100 text-rose-700' : 'bg-navy-100 text-navy-700'}`}>{t.severity}</span>
                        <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${t.status === 'resolved' ? 'bg-leaf-100 text-leaf-700' : t.status === 'waiting' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'}`}>
                          {t.status === 'resolved' ? 'Resolved' : t.status === 'waiting' ? 'Replied' : 'With support'}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-ink mt-1">{t.subject}</p>
                      {last ? (
                        <p className="text-xs text-navy-600 mt-1.5 bg-paper rounded-lg p-2"><span className="font-semibold">{last.name}:</span> {last.text}</p>
                      ) : (
                        <p className="text-xs text-navy-400 mt-1">Opened {t.openedAt} · first reply due within {t.severity === 'P1' ? '15 min' : '2 h'}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
