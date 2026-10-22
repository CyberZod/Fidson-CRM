import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { useTeam, repsFor, MANAGERS, CURRENT_REP, type ManagerKey, type Message } from '../stores/team';
import type { ToastInput } from '../types';

interface MessagesViewProps {
  manager?: ManagerKey;
  onToast?: (t: ToastInput) => void;
}

function Bubble({ m, mine }: { m: Message; mine: boolean }) {
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${mine ? 'bg-navy-700 text-white rounded-br-md' : 'bg-paper text-ink border border-navy-100 rounded-bl-md'}`}>
        <p className="whitespace-pre-wrap">{m.text}</p>
        <p className={`text-[9px] mt-1 font-mono ${mine ? 'text-white/60' : 'text-navy-400'}`}>{m.at}{mine && (m.read ? ' · Read' : ' · Delivered')}</p>
      </div>
    </div>
  );
}

export default function MessagesView({ manager = 'asm', onToast }: MessagesViewProps) {
  const { messages, sendMessage, markThreadRead } = useTeam();
  const reps = repsFor(manager);
  const [active, setActive] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const thread = (rep: string) => messages.filter(m => m.rep === rep && m.manager === manager);
  const unread = (rep: string) => thread(rep).filter(m => m.from === 'rep' && !m.read).length;
  const ordered = [...reps].sort((a, b) => {
    const la = thread(a.name).length ? messages.indexOf(thread(a.name).slice(-1)[0]) : -1;
    const lb = thread(b.name).length ? messages.indexOf(thread(b.name).slice(-1)[0]) : -1;
    return lb - la;
  });
  const current = active ?? ordered[0]?.name ?? null;
  const conv = current ? thread(current) : [];

  useEffect(() => {
    if (current && unread(current) > 0) markThreadRead(current, manager, 'manager');
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [current, conv.length]);

  const send = () => {
    if (!current || !draft.trim()) return;
    sendMessage(current, manager, 'manager', draft.trim());
    setDraft('');
    onToast?.({ type: 'success', title: `Message sent to ${current}`, msg: 'Appears in their inbox on My Day' });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      <div className="fade-up rounded-2xl bg-white border border-navy-100 overflow-hidden grid grid-cols-1 md:grid-cols-3" style={{ minHeight: 520 }}>
        <div className={`border-r border-navy-100 ${active ? 'hidden md:block' : ''}`}>
          <div className="px-4 py-3 border-b border-navy-100">
            <h3 className="font-display font-bold text-ink text-sm">Messages</h3>
            <p className="text-[11px] text-navy-500">Direct to your {reps.length} reps</p>
          </div>
          <div className="p-2 space-y-0.5">
            {ordered.map(r => {
              const t = thread(r.name);
              const last = t[t.length - 1];
              const u = unread(r.name);
              return (
                <button key={r.name} onClick={() => setActive(r.name)} className={`w-full p-2.5 rounded-lg text-left flex items-center gap-3 ${current === r.name ? 'bg-sky-50 border border-sky-200' : 'hover:bg-paper border border-transparent'}`}>
                  <div className="w-9 h-9 rounded-full bg-navy-100 text-navy-700 font-display font-bold text-xs flex items-center justify-center flex-shrink-0">{r.initials}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={`text-sm truncate ${u ? 'font-bold text-ink' : 'font-semibold text-ink'}`}>{r.name}</p>
                      <span className="text-[9px] font-mono text-navy-400 flex-shrink-0">{last?.at ?? ''}</span>
                    </div>
                    <p className={`text-[11px] truncate ${u ? 'text-ink font-semibold' : 'text-navy-500'}`}>{last ? `${last.from === 'manager' ? 'You: ' : ''}${last.text}` : `${r.territory} · no messages yet`}</p>
                  </div>
                  {u > 0 && <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-sky-500 text-white text-[10px] font-bold flex items-center justify-center">{u}</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className={`md:col-span-2 flex flex-col ${active ? '' : 'hidden md:flex'}`}>
          {current && (
            <>
              <div className="px-4 py-3 border-b border-navy-100 flex items-center gap-3">
                <button onClick={() => setActive(null)} className="md:hidden w-8 h-8 rounded-lg border border-navy-100 flex items-center justify-center" aria-label="Back">
                  <Icon name="chevronLeft" size={16} className="text-navy-700" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-ink text-sm">{current}</p>
                  <p className="text-[11px] text-navy-500">{reps.find(r => r.name === current)?.territory} · Med Rep</p>
                </div>
              </div>
              <div className="flex-1 p-4 space-y-2 overflow-y-auto" style={{ maxHeight: 420 }}>
                {conv.length === 0 && <p className="text-center text-sm text-navy-500 py-10">Start the conversation with {current.split(' ')[0]}.</p>}
                {conv.map(m => <Bubble key={m.id} m={m} mine={m.from === 'manager'} />)}
                <div ref={endRef} />
              </div>
              <div className="p-3 border-t border-navy-100 flex items-end gap-2">
                <textarea
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                  rows={1}
                  placeholder={`Message ${current.split(' ')[0]} · Enter to send`}
                  className="input-field flex-1 px-3 py-2 rounded-xl bg-paper border border-navy-200 text-sm resize-none"
                />
                <button onClick={send} disabled={!draft.trim()} className="px-3 py-2 rounded-xl bg-navy-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 btn-press">
                  <Icon name="send" size={14} /> Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <p className="mt-2 text-[11px] text-navy-400">Sent as {MANAGERS[manager].name} ({MANAGERS[manager].role}). Messages are kept with the rep record.</p>
    </div>
  );
}

// Rep side: manager messages on My Day, with reply.
export function RepInbox({ rep = CURRENT_REP }: { rep?: string }) {
  const { messages, sendMessage, markThreadRead } = useTeam();
  const [open, setOpen] = useState<ManagerKey | null>(null);
  const [draft, setDraft] = useState('');
  const keys: ManagerKey[] = ['asm', 'manager'];
  const threads = keys.map(k => ({ k, msgs: messages.filter(m => m.rep === rep && m.manager === k) })).filter(t => t.msgs.length > 0);
  const totalUnread = threads.reduce((s, t) => s + t.msgs.filter(m => m.from === 'manager' && !m.read).length, 0);

  const toggle = (k: ManagerKey) => {
    const next = open === k ? null : k;
    setOpen(next);
    setDraft('');
    if (next) markThreadRead(rep, next, 'rep');
  };

  const reply = () => {
    if (!open || !draft.trim()) return;
    sendMessage(rep, open, 'rep', draft.trim());
    setDraft('');
  };

  return (
    <div className="rounded-2xl bg-white border border-navy-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-bold text-ink text-sm">From Your Managers</h3>
        {totalUnread > 0 && <span className="px-2 py-0.5 rounded-full bg-leaf-500 text-white text-[10px] font-bold">{totalUnread} new</span>}
      </div>
      {threads.length === 0 && <p className="text-xs text-navy-500">No messages yet.</p>}
      <div className="space-y-2">
        {threads.map(({ k, msgs }) => {
          const mgr = MANAGERS[k];
          const last = msgs[msgs.length - 1];
          const u = msgs.filter(m => m.from === 'manager' && !m.read).length;
          const isOpen = open === k;
          return (
            <div key={k} className={`rounded-xl border ${u ? 'border-leaf-200 bg-leaf-50/40' : 'border-navy-100'}`}>
              <button onClick={() => toggle(k)} className="w-full p-3 flex items-start gap-3 text-left">
                <div className="w-9 h-9 rounded-full bg-navy-700 flex items-center justify-center text-white font-display font-bold text-xs flex-shrink-0">{mgr.initials}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-xs font-semibold text-ink">{mgr.name} <span className="text-navy-400 font-normal">· {mgr.role}</span></p>
                    <span className="text-[10px] text-navy-400 font-mono flex-shrink-0">{last.at}</span>
                  </div>
                  {!isOpen && <p className={`text-[11px] mt-0.5 line-clamp-2 ${u ? 'text-ink font-semibold' : 'text-navy-500'}`}>{last.from === 'rep' ? 'You: ' : ''}{last.text}</p>}
                </div>
                {u > 0 && !isOpen && <span className="w-2 h-2 rounded-full bg-leaf-500 mt-1.5 flex-shrink-0" />}
              </button>
              {isOpen && (
                <div className="px-3 pb-3 space-y-2">
                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {msgs.map(m => <Bubble key={m.id} m={m} mine={m.from === 'rep'} />)}
                  </div>
                  <div className="flex items-end gap-2">
                    <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={1} placeholder={`Reply to ${mgr.name.split(' ')[0]}`} className="input-field flex-1 px-3 py-2.5 rounded-xl bg-paper border border-navy-200 text-sm resize-none" />
                    <button onClick={reply} disabled={!draft.trim()} className="h-10 px-3 rounded-xl bg-leaf-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1 btn-press">
                      <Icon name="send" size={14} /> Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
