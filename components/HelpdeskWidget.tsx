import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';

interface ChatMessage {
  id: number;
  from: 'user' | 'agent';
  text: string;
  time: string;
}

interface AutoReply {
  // First word(s) that trigger this reply (lowercased, no punctuation)
  triggers: string[];
  reply: string;
}

// Built-in auto-responses keyed on the FIRST word the user types.
// First match wins; falls through to the default if nothing matches.
const AUTO_REPLIES: AutoReply[] = [
  {
    triggers: ['hi', 'hello', 'hey', 'good', 'hiya'],
    reply: "Hi there! 👋 You're chatting with the FieldForce Help Desk. Tell me what you need — try starting with words like “order”, “login”, “sync”, “GPS”, “approval”, or “report”.",
  },
  {
    triggers: ['order', 'orders', 'booklet', 'soa'],
    reply: 'For orders: open the Orders screen, tap a customer, add products and submit. Orders with no discount go straight to Sales Admin; discounted ones route to your RSM for approval. Want me to flag a stuck order to the back office?',
  },
  {
    triggers: ['login', 'log', 'password', 'signin', 'sign', 'access', 'locked'],
    reply: 'Trouble signing in? Make sure you’re using your Fidson email. Use “Forgot password” on the login screen to reset, or I can raise a ticket to IT to unlock your account — just reply “ticket”.',
  },
  {
    triggers: ['sync', 'syncing', 'offline', 'data', 'erp'],
    reply: 'Sync issues are usually network-related. Pull down to refresh and check your signal — anything you logged offline will push automatically once you’re back online. Still stuck after 10 minutes? Reply “ticket” and I’ll escalate to support.',
  },
  {
    triggers: ['gps', 'location', 'checkin', 'check-in', 'map', 'route'],
    reply: 'GPS check-in needs location permission enabled for FieldForce. If check-in is greyed out, your itinerary may not be approved yet — your RSM unlocks the GPS gate once the week is signed off.',
  },
  {
    triggers: ['approval', 'approve', 'discount', 'pending', 'reject', 'rejected'],
    reply: 'Approvals (discounts, clinical meetings, itineraries) sit with your line manager. You’ll get a notification the moment they action it. If it’s urgent, reply “escalate” and I’ll nudge the approver.',
  },
  {
    triggers: ['report', 'reports', 'dcr', 'target', 'targets', 'sales'],
    reply: 'Reports & DCRs live under the Reports screen. Your DCR auto-generates from completed visits — just review and submit at end of day. Need a specific figure pulled? Tell me which report.',
  },
  {
    triggers: ['ticket', 'escalate', 'urgent', 'help', 'support', 'agent', 'human'],
    reply: 'Got it — I’ve logged a ticket and a human support agent from the Tales Consulting team will reach out shortly. Reference: #FDS-' + 'SUP. Anything else in the meantime?',
  },
  {
    triggers: ['thanks', 'thank', 'cheers', 'great', 'ok', 'okay', 'cool'],
    reply: 'Anytime! 🙌 I’m here on every screen if anything else comes up. Have a productive day in the field.',
  },
];

const DEFAULT_REPLY =
  "Thanks for reaching out. This has been noted and our support team will reach out to you very soon. 🙌";

function autoReplyFor(text: string): string {
  const firstWord = text
    .trim()
    .toLowerCase()
    .replace(/[^a-z\s-]/g, '')
    .split(/\s+/)[0];
  if (!firstWord) return DEFAULT_REPLY;
  const match = AUTO_REPLIES.find(r => r.triggers.includes(firstWord));
  return match ? match.reply : DEFAULT_REPLY;
}

function nowLabel(): string {
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function HelpdeskWidget() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      from: 'agent',
      text: 'Hi 👋 Welcome to the FieldForce Help Desk. How can we help today? Start your message with a keyword like “order”, “login”, or “sync”.',
      time: nowLabel(),
    },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the conversation pinned to the latest message
  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing, open]);

  // Focus the input when the panel opens
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;

    const userMsg: ChatMessage = { id: Date.now(), from: 'user', text, time: nowLabel() };
    setMessages(prev => [...prev, userMsg]);
    setDraft('');
    setTyping(true);

    // Simulate the agent "typing" then drop in the keyword-based auto-reply
    setTimeout(() => {
      const agentMsg: ChatMessage = {
        id: Date.now() + 1,
        from: 'agent',
        text: autoReplyFor(text),
        time: nowLabel(),
      };
      setMessages(prev => [...prev, agentMsg]);
      setTyping(false);
    }, 900);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating launcher — sits bottom-left, clear of toasts (bottom-right) and the mobile bottom nav */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open help desk"
          className="fixed left-4 bottom-20 md:bottom-4 z-[90] rounded-full bg-leaf-500 text-white shadow-lg shadow-leaf-500/30 flex items-center justify-center btn-press hover:bg-leaf-600 transition-colors"
          style={{ width: 56, height: 56 }}
        >
          <Icon name="helpCircle" size={24} strokeWidth={2} />
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-rose-500 border-2 border-white" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed left-2 right-2 bottom-2 sm:left-4 sm:right-auto sm:bottom-4 z-[95] sm:w-[360px] slide-in-right">
          <div className="bg-white border border-navy-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden h-[70vh] sm:h-[520px] max-h-[600px]">
            {/* Header */}
            <div className="bg-navy-900 text-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-leaf-500 flex items-center justify-center flex-shrink-0">
                <Icon name="helpCircle" size={18} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-sm leading-tight">FieldForce Help Desk</p>
                <p className="text-[11px] text-navy-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-leaf-400 inline-block" />
                  Typically replies in a few minutes
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close help desk"
                className="text-navy-200 hover:text-white btn-press w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center"
              >
                <Icon name="chevronDown" size={20} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto bg-paper px-3 py-4 space-y-3">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${m.from === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div
                      className={`px-3 py-2 rounded-2xl text-sm leading-snug ${
                        m.from === 'user'
                          ? 'bg-leaf-500 text-white rounded-br-sm'
                          : 'bg-white border border-navy-100 text-ink rounded-bl-sm'
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[10px] text-navy-400 mt-1 px-1">{m.time}</span>
                  </div>
                </div>
              ))}

              {typing && (
                <div className="flex justify-start">
                  <div className="bg-white border border-navy-100 rounded-2xl rounded-bl-sm px-3 py-2.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-navy-300 pulse-dot" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-navy-300 pulse-dot" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-navy-300 pulse-dot" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Composer */}
            <div className="border-t border-navy-100 bg-white px-3 py-2.5 flex items-center gap-2 flex-shrink-0">
              <input
                ref={inputRef}
                type="text"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type a message…"
                className="flex-1 bg-paper border border-navy-100 rounded-full px-4 py-2 text-sm outline-none focus:border-leaf-400 transition-colors placeholder-navy-400"
              />
              <button
                onClick={sendMessage}
                disabled={!draft.trim()}
                aria-label="Send message"
                className="w-9 h-9 rounded-full bg-leaf-500 text-white flex items-center justify-center flex-shrink-0 btn-press hover:bg-leaf-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Icon name="send" size={16} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
