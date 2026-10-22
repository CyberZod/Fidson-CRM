import { createContext, useContext, useState, type ReactNode } from 'react';
import {
  SEED_LESSONS, SEED_PRIVATE_NOTES, SEED_TICKETS, SEED_FINDINGS, SEED_VERSIONS,
  draftLessonsFor,
  type Lesson, type PrivateNote, type Ticket, type TicketContext, type TicketMessage,
  type LessonProposal, type ReviewFinding, type KbVersion, type TicketSeverity,
} from '../assets/helpdesk';

function clock(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

interface HelpdeskState {
  lessons: Lesson[];
  notes: PrivateNote[];
  tickets: Ticket[];
  proposals: LessonProposal[];
  findings: ReviewFinding[];
  versions: KbVersion[];
  instructionsVersion: number;
  openTicket: (input: { subject: string; userName: string; userEmail: string; context: TicketContext; conversation: TicketMessage[]; severity?: TicketSeverity }) => Ticket;
  replyToTicket: (id: string, agentName: string, text: string) => void;
  resolveTicket: (id: string, agentName: string, resolution: string) => LessonProposal[];
  decideProposal: (id: string, decision: 'approved' | 'rejected', by: string, edits?: Partial<LessonProposal>) => void;
  decideFinding: (id: string, decision: 'applied' | 'dismissed', by: string) => void;
  rollbackTo: (v: number, by: string) => void;
  recordUse: (lessonId: string) => void;
}

const Ctx = createContext<HelpdeskState | null>(null);

export function HelpdeskProvider({ children }: { children: ReactNode }) {
  const [lessons, setLessons] = useState<Lesson[]>(SEED_LESSONS);
  const [archived, setArchived] = useState<Lesson[]>([]);
  const [notes, setNotes] = useState<PrivateNote[]>(SEED_PRIVATE_NOTES);
  const [tickets, setTickets] = useState<Ticket[]>(SEED_TICKETS);
  const [proposals, setProposals] = useState<LessonProposal[]>([]);
  const [findings, setFindings] = useState<ReviewFinding[]>(SEED_FINDINGS);
  const [versions, setVersions] = useState<KbVersion[]>(SEED_VERSIONS);
  const [instructionsVersion, setInstructionsVersion] = useState(6);
  const [seq, setSeq] = useState(1042);

  const pushVersion = (by: string, change: string, live: Lesson[]) => {
    setVersions(prev => [...prev, {
      v: (prev[prev.length - 1]?.v ?? 0) + 1,
      at: `Today · ${clock()}`, by, change, lessonIds: live.map(l => l.id),
    }]);
  };

  const openTicket: HelpdeskState['openTicket'] = ({ subject, userName, userEmail, context, conversation, severity = 'P2' }) => {
    const t: Ticket = {
      id: `T-${seq}`, subject, userName, userEmail, severity, status: 'open',
      openedAt: clock(), slaMinsLeft: severity === 'P1' ? 15 : severity === 'P2' ? 120 : 480,
      context, messages: conversation,
    };
    setSeq(s => s + 1);
    setTickets(prev => [t, ...prev]);
    return t;
  };

  const replyToTicket: HelpdeskState['replyToTicket'] = (id, agentName, text) => {
    setTickets(prev => prev.map(t => t.id === id
      ? { ...t, status: 'waiting', messages: [...t.messages, { from: 'agent', name: agentName, text, at: clock() }] }
      : t));
  };

  const resolveTicket: HelpdeskState['resolveTicket'] = (id, agentName, resolution) => {
    const t = tickets.find(x => x.id === id);
    if (!t) return [];
    setTickets(prev => prev.map(x => x.id === id
      ? { ...x, status: 'resolved', resolution, messages: [...x.messages, { from: 'agent', name: agentName, text: resolution, at: clock() }] }
      : x));
    const drafts = draftLessonsFor(t, resolution);
    setProposals(prev => [...drafts, ...prev]);
    return drafts;
  };

  const decideProposal: HelpdeskState['decideProposal'] = (id, decision, by, edits) => {
    const p = proposals.find(x => x.id === id);
    if (!p) return;
    const merged = { ...p, ...edits };
    setProposals(prev => prev.map(x => x.id === id ? { ...merged, status: decision } : x));
    if (decision !== 'approved') return;
    if (merged.kind === 'private') {
      setNotes(prev => [{
        id: `P-${Date.now()}`, userEmail: merged.userEmail ?? '', userName: merged.userName ?? '',
        note: merged.answer, forUser: merged.forUser, learnedFrom: merged.ticketId,
      }, ...prev]);
      return;
    }
    const lesson: Lesson = {
      id: `L-${String(lessons.length + archived.length + 1).padStart(2, '0')}`,
      title: merged.title, triggers: merged.triggers, answer: merged.answer,
      learnedFrom: merged.ticketId, approvedBy: by, approvedAt: 'Today', uses: 0,
    };
    const live = [...lessons, lesson];
    setLessons(live);
    pushVersion(by, `Added lesson ${lesson.id} "${lesson.title}" from ${merged.ticketId}`, live);
  };

  const decideFinding: HelpdeskState['decideFinding'] = (id, decision, by) => {
    const f = findings.find(x => x.id === id);
    if (!f) return;
    setFindings(prev => prev.map(x => x.id === id ? { ...x, status: decision } : x));
    if (decision === 'applied' && f.kind === 'instruction') {
      setInstructionsVersion(v => v + 1);
      pushVersion(by, `Instructions v${instructionsVersion + 1}: ${f.proposal}`, lessons);
    }
  };

  const rollbackTo: HelpdeskState['rollbackTo'] = (v, by) => {
    const target = versions.find(x => x.v === v);
    if (!target) return;
    const pool = [...lessons, ...archived];
    const live = pool.filter(l => target.lessonIds.includes(l.id));
    setArchived(pool.filter(l => !target.lessonIds.includes(l.id)));
    setLessons(live);
    pushVersion(by, `Rolled back to v${v}`, live);
  };

  const recordUse = (lessonId: string) => {
    setLessons(prev => prev.map(l => l.id === lessonId ? { ...l, uses: l.uses + 1 } : l));
  };

  return (
    <Ctx.Provider value={{
      lessons, notes, tickets, proposals, findings, versions, instructionsVersion,
      openTicket, replyToTicket, resolveTicket, decideProposal, decideFinding, rollbackTo, recordUse,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useHelpdesk(): HelpdeskState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useHelpdesk must be used inside HelpdeskProvider');
  return v;
}
