import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import Icon from './Icon';
import { CHAT_PROFILES, answerFromChatLibrary } from '../assets/aiChat';
import type { PersonaKey } from '../types';

interface AIInsightsChatProps {
  role: PersonaKey;
}

interface ChatMessage {
  id: number;
  from: 'user' | 'assistant';
  text: string;
  pending?: boolean;
}

type NewsTab = 'good' | 'bad';

export default function AIInsightsChat({ role }: AIInsightsChatProps) {
  const profile = useMemo(() => CHAT_PROFILES[role] ?? CHAT_PROFILES.manager, [role]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [newsTab, setNewsTab] = useState<NewsTab>('good');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([]);
    setDraft('');
    setNewsTab('good');
  }, [role]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const sendQuestion = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: ChatMessage = { id: Date.now(), from: 'user', text: trimmed };
    const pendingId = Date.now() + 1;
    const pendingMsg: ChatMessage = { id: pendingId, from: 'assistant', text: 'Thinking…', pending: true };
    setMessages(prev => [...prev, userMsg, pendingMsg]);
    setDraft('');

    setTimeout(() => {
      const reply = answerFromChatLibrary(role, trimmed);
      setMessages(prev => prev.map(m => m.id === pendingId ? { ...m, text: reply, pending: false } : m));
    }, 550);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendQuestion(draft);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="p-3 sm:p-4 lg:p-6 max-w-[1400px] mx-auto space-y-3">
      <div className="fade-up relative px-4 py-2.5 rounded-xl overflow-hidden text-white" style={{ background: 'linear-gradient(120deg, #0F2147 0%, #142A5A 50%, #1a3a6e 100%)' }}>
        <div className="absolute inset-0 ai-shimmer" />
        <div className="relative flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-leaf-500 flex items-center justify-center flex-shrink-0">
              <Icon name="sparkles" size={13} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-bold text-leaf-300 tracking-[0.2em] uppercase leading-none">AI Insights · {profile.greeting}</p>
              <p className="text-white text-xs sm:text-sm font-display font-bold truncate mt-0.5">{profile.scope}</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[9px] font-bold border border-white/10">DEMO</span>
        </div>
      </div>

      <div className="fade-up stagger-1 rounded-2xl bg-white border border-navy-100 overflow-hidden">
        <div className="flex items-stretch border-b border-navy-100">
          <button
            onClick={() => setNewsTab('good')}
            className={`flex-1 px-4 py-2.5 flex items-center justify-center gap-2 transition-colors ${
              newsTab === 'good' ? 'bg-leaf-50' : 'bg-paper hover:bg-leaf-50/50'
            }`}
          >
            <Icon name="trending" size={13} className={newsTab === 'good' ? 'text-leaf-700' : 'text-navy-400'} />
            <p className={`font-display font-bold text-xs tracking-wider uppercase ${newsTab === 'good' ? 'text-leaf-800' : 'text-navy-500'}`}>Good news</p>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${newsTab === 'good' ? 'bg-leaf-200 text-leaf-800' : 'bg-navy-100 text-navy-500'}`}>{profile.wins.length}</span>
          </button>
          <button
            onClick={() => setNewsTab('bad')}
            className={`flex-1 px-4 py-2.5 flex items-center justify-center gap-2 transition-colors border-l border-navy-100 ${
              newsTab === 'bad' ? 'bg-rose-50' : 'bg-paper hover:bg-rose-50/50'
            }`}
          >
            <Icon name="alert" size={13} className={newsTab === 'bad' ? 'text-rose-700' : 'text-navy-400'} />
            <p className={`font-display font-bold text-xs tracking-wider uppercase ${newsTab === 'bad' ? 'text-rose-800' : 'text-navy-500'}`}>Bad news</p>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${newsTab === 'bad' ? 'bg-rose-200 text-rose-800' : 'bg-navy-100 text-navy-500'}`}>{profile.concerns.length}</span>
          </button>
        </div>
        <ul className={`divide-y ${newsTab === 'good' ? 'divide-leaf-50' : 'divide-rose-50'}`}>
          {(newsTab === 'good' ? profile.wins : profile.concerns).map((item, i) => (
            <li key={i} className="px-4 py-3">
              <p className="font-display font-semibold text-sm text-ink leading-snug">{item.title}</p>
              <p className="text-xs text-navy-600 mt-1 leading-relaxed">{item.detail}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="fade-up stagger-2 rounded-2xl bg-white border border-navy-100 overflow-hidden">
        <div className="px-4 py-2 border-b border-navy-100 flex items-center gap-2">
          <Icon name="sparkles" size={12} className="text-leaf-600" />
          <p className="font-display font-bold text-ink text-xs">Ask Fidson AI</p>
          <span className="text-[10px] text-navy-500 hidden sm:inline">· freeform · tap a chip or type</span>
        </div>

        <div className="px-4 py-2 border-b border-navy-50 flex flex-wrap gap-1.5">
          {profile.suggestions.map(s => (
            <button
              key={s}
              onClick={() => sendQuestion(s)}
              className="px-2.5 py-1 rounded-full bg-paper border border-navy-200 text-[10px] font-semibold text-navy-700 hover:bg-leaf-50 hover:border-leaf-400 hover:text-leaf-700 transition-colors btn-press"
            >
              {s}
            </button>
          ))}
        </div>

        {hasMessages && (
          <div className="overflow-y-auto p-4 space-y-2.5 bg-paper" style={{ maxHeight: '50vh' }}>
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] rounded-2xl px-3 py-2 ${
                  m.from === 'user'
                    ? 'bg-navy-700 text-white rounded-br-md'
                    : 'bg-white border border-navy-100 text-ink rounded-bl-md'
                }`}>
                  {m.from === 'assistant' && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon name="sparkles" size={10} className="text-leaf-600" />
                      <p className="text-[9px] font-bold text-leaf-700 tracking-wider uppercase">Fidson AI</p>
                    </div>
                  )}
                  <p className={`text-xs leading-relaxed ${m.pending ? 'italic opacity-70' : ''}`}>{m.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="border-t border-navy-100 p-2 flex items-center gap-2 bg-white">
          <input
            type="text"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Ask about pipeline, products, reps, campaigns…"
            className="input-field flex-1 min-w-0 px-3 py-2 rounded-lg bg-paper border border-navy-200 text-sm text-ink"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="px-3 py-2 rounded-lg bg-leaf-600 text-white text-xs font-bold flex items-center gap-1.5 btn-press hover:bg-leaf-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="send" size={12} /> Send
          </button>
        </form>
      </div>
    </div>
  );
}
