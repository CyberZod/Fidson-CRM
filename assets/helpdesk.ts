// Help desk seed data and the scripted agent's reasoning.
//
// The design follows two learning loops:
//   Loop 1 · a question the agent can't answer goes to a human on the support desk.
//            The human's resolution becomes a proposed lesson. Nothing enters the
//            agent's memory until a person approves it.
//   Loop 2 · a weekly review reads every conversation and ticket, clusters what keeps
//            going wrong, and proposes changes (instructions, training, bug reports),
//            again only applied on approval. Every applied change is a version that
//            can be rolled back.
// Memory has two layers: shared lessons (every user) and private notes (one person).
// Memory can explain how to do something; it never grants authority or skips an approval.

export type TicketSeverity = 'P1' | 'P2' | 'P3';
export type TicketStatus = 'open' | 'waiting' | 'resolved';

export interface Lesson {
  id: string;
  title: string;
  triggers: string[];        // words that make the agent reach for this lesson
  answer: string;
  learnedFrom: string;       // ticket id, or 'Launch pack' for the starting set
  approvedBy: string;
  approvedAt: string;
  uses: number;              // times the agent answered with it
}

export interface PrivateNote {
  id: string;
  userEmail: string;
  userName: string;
  note: string;              // how the support desk reads it
  forUser?: string;          // how the agent says it to the person
  learnedFrom: string;
}

export interface TicketContext {
  role: string;
  screen: string;
  device: string;
  appVersion: string;
  network: string;
  queuedSync: number;
  gps?: string;
  lastError?: string;
}

export interface TicketMessage {
  from: 'user' | 'ai' | 'agent';
  name: string;
  text: string;
  at: string;
}

export interface Ticket {
  id: string;
  subject: string;
  userName: string;
  userEmail: string;
  severity: TicketSeverity;
  status: TicketStatus;
  openedAt: string;
  slaMinsLeft: number;       // negative = breached
  context: TicketContext;
  messages: TicketMessage[];
  resolution?: string;
}

export interface LessonProposal {
  id: string;
  ticketId: string;
  kind: 'shared' | 'private';
  title: string;
  triggers: string[];
  answer: string;            // for private: the note
  forUser?: string;
  userEmail?: string;
  userName?: string;
  why: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ReviewFinding {
  id: string;
  title: string;
  evidence: string;
  count: number;
  kind: 'instruction' | 'bug' | 'training' | 'lesson';
  proposal: string;
  before?: string;
  after?: string;
  status: 'pending' | 'applied' | 'dismissed';
}

export interface KbVersion {
  v: number;
  at: string;
  by: string;
  change: string;
  lessonIds: string[];       // snapshot of which shared lessons were live
}

export const AGENT_INSTRUCTIONS_V = 'Instructions v6';

export const SEED_LESSONS: Lesson[] = [
  {
    id: 'L-01', title: 'Signing in with Microsoft 365',
    triggers: ['login', 'log in', 'sign in', 'signin', 'password', 'locked', 'access', 'microsoft'],
    answer: 'You sign in with your Fidson Microsoft 365 account, so there is no FieldForce password to reset. If Microsoft lets you in but FieldForce says "no access", you are not in the FieldForce security group yet. Fidson IT adds you and access works on your next sign-in.',
    learnedFrom: 'Launch pack', approvedBy: 'Fidson IT · Service Desk', approvedAt: 'Aug 24', uses: 41,
  },
  {
    id: 'L-02', title: 'Work logged offline',
    triggers: ['offline', 'sync', 'syncing', 'network', 'signal', 'queued', 'pending upload'],
    answer: 'Everything you log offline is kept on the phone and sent when you are back on network, with no duplicates. The grey cloud icon on a record means it is still queued. If two people changed the same record, it goes to the admin conflict queue, so nothing is lost.',
    learnedFrom: 'Launch pack', approvedBy: 'Fidson IT · Service Desk', approvedAt: 'Aug 24', uses: 63,
  },
  {
    id: 'L-03', title: 'Discount approvals',
    triggers: ['discount', 'approval', 'approve', 'ceiling', 'pending', 'rejected'],
    answer: 'Discounts up to your limit are approved automatically. Anything above the ceiling goes to your RSM, then up the chain if it is higher still, and you get a notification the moment someone decides. I can show you where it is waiting, but I cannot approve it for you.',
    learnedFrom: 'Launch pack', approvedBy: 'Sales Operations', approvedAt: 'Sep 2', uses: 28,
  },
  {
    id: 'L-04', title: 'Submitting the Daily Call Report',
    triggers: ['dcr', 'daily call report', 'report', 'end of day', 'submit'],
    answer: 'Your DCR builds itself from the visits you logged today. Open My DCR, check the summary, and tap Submit. It goes to your RSM straight away. Visits you planned but did not log show as gaps so you can add a note.',
    learnedFrom: 'T-0981', approvedBy: 'Grace Okon · Support Desk', approvedAt: 'Sep 30', uses: 19,
  },
  {
    id: 'L-05', title: 'Detailing material offline',
    triggers: ['material', 'detail aid', 'brochure', 'pdf', 'slides', 'download'],
    answer: 'Approved detailing material downloads to your phone automatically when it is released. It opens without network from the Materials tab. If something is missing, pull down to refresh while you have signal.',
    learnedFrom: 'T-1003', approvedBy: 'Grace Okon · Support Desk', approvedAt: 'Oct 8', uses: 12,
  },
];

export const SEED_PRIVATE_NOTES: PrivateNote[] = [
  {
    id: 'P-01', userEmail: 'adaeze.okafor@fidson.com', userName: 'Adaeze Okafor',
    note: 'Uses a Tecno Spark 10. Its battery saver stops FieldForce in the background, so check that first when her GPS or sync misbehaves.',
    forUser: 'You use a Tecno Spark 10, and its battery saver can stop FieldForce in the background. Worth checking that first.',
    learnedFrom: 'T-0994',
  },
  {
    id: 'P-02', userEmail: 'tunde.bakare@fidson.com', userName: 'Tunde Bakare',
    note: 'Approves from the desktop app in the evening. Prefers answers with the exact screen name.',
    learnedFrom: 'T-1011',
  },
];

export const SEED_TICKETS: Ticket[] = [
  {
    id: 'T-1038', subject: 'Order stuck as "sending" since morning', userName: 'Tope Adeola', userEmail: 'tope.adeola@fidson.com',
    severity: 'P2', status: 'open', openedAt: '09:12', slaMinsLeft: 74,
    context: { role: 'Medical Rep · Lekki', screen: 'Place Order', device: 'Samsung A14 · Android 14', appVersion: '1.8.1', network: '4G · weak', queuedSync: 3, lastError: 'BC-409 order already exists' },
    messages: [
      { from: 'user', name: 'Tope Adeola', text: 'My order for HealthPlus Surulere has said sending since morning.', at: '09:10' },
      { from: 'ai', name: 'Help desk agent', text: 'Orders you log offline go out when you have network, and yours has three records still queued. This one came back from Business Central with an error I have no lesson for yet, so I have passed it to the support desk with your phone details attached.', at: '09:12' },
    ],
  },
  {
    id: 'T-1036', subject: 'Cannot see Bayo in My Team', userName: 'Funmi Adeola', userEmail: 'funmi.adeola@fidson.com',
    severity: 'P3', status: 'waiting', openedAt: 'Yesterday', slaMinsLeft: 300,
    context: { role: 'ASM · Lekki/V.I.', screen: 'Team Coaching', device: 'Windows desktop app', appVersion: '1.8.2', network: 'Wi-Fi', queuedSync: 0 },
    messages: [
      { from: 'user', name: 'Funmi Adeola', text: 'Bayo Salami moved to my area on Monday but he is not in my team list.', at: 'Yesterday 16:40' },
      { from: 'ai', name: 'Help desk agent', text: 'Team lists come from the reporting lines Fidson admins keep. I cannot change those, so I have asked the support desk to check Bayo\'s reporting line.', at: 'Yesterday 16:41' },
      { from: 'agent', name: 'Grace Okon', text: 'Asked Fidson HR admin to move Bayo\'s reporting line. Waiting on them.', at: 'Yesterday 17:05' },
    ],
  },
  {
    id: 'T-1031', subject: 'App closes when opening Customer 360 on old phone', userName: 'Kola Adebayo', userEmail: 'kola.adebayo@fidson.com',
    severity: 'P1', status: 'open', openedAt: '08:31', slaMinsLeft: -12,
    context: { role: 'Medical Rep · Apapa', screen: 'Customer 360', device: 'itel A70 · Android 13 Go', appVersion: '1.8.2', network: '3G', queuedSync: 0, lastError: 'Out of memory on timeline render' },
    messages: [
      { from: 'user', name: 'Kola Adebayo', text: 'Every time I open MedPlus Apapa the app shuts.', at: '08:30' },
      { from: 'ai', name: 'Help desk agent', text: 'That looks like a fault, not something you did. I have sent it to the support desk as urgent with the error from your phone.', at: '08:31' },
    ],
  },
];

export const SEED_FINDINGS: ReviewFinding[] = [
  {
    id: 'F-1', kind: 'instruction', count: 11,
    title: 'Reps ask for the DCR screen after 6pm and get directions instead of the screen',
    evidence: '11 conversations this week, 9 from the Institution channel. Each needed a second question before the rep found My DCR.',
    proposal: 'When someone asks about the DCR after 5pm, open My DCR for them instead of describing where it is.',
    before: 'Answer how-to questions with the steps.',
    after: 'Answer how-to questions with the steps. After 5pm, if the question is about the DCR, offer an Open My DCR button first.',
    status: 'pending',
  },
  {
    id: 'F-2', kind: 'bug', count: 7,
    title: 'Orders stuck on "sending" after the 1.8.1 update',
    evidence: '7 tickets since Tuesday, all on app 1.8.1, all returning BC-409 from Business Central.',
    proposal: 'Raise a P2 bug for engineering with the 7 tickets attached, and tell affected reps a fix is coming instead of asking them to retry.',
    status: 'pending',
  },
  {
    id: 'F-3', kind: 'training', count: 5,
    title: 'Five reps do not know their discount limit',
    evidence: '5 reps asked why a 12% discount needed approval. Their limit is 10%.',
    proposal: 'Assign the 4-minute "Your discount limit" lesson to these 5 reps through Training Tasks.',
    status: 'pending',
  },
];

export const SEED_VERSIONS: KbVersion[] = [
  { v: 11, at: 'Sep 30 · 17:20', by: 'Grace Okon', change: 'Added lesson L-04 "Submitting the Daily Call Report" from T-0981', lessonIds: ['L-01', 'L-02', 'L-03', 'L-04'] },
  { v: 12, at: 'Oct 8 · 11:02', by: 'Grace Okon', change: 'Added lesson L-05 "Detailing material offline" from T-1003', lessonIds: ['L-01', 'L-02', 'L-03', 'L-04', 'L-05'] },
];

// Hypercare: four weeks after national go-live (Schedule A, 11.4).
export const HYPERCARE = {
  day: 9, of: 28,
  checkIns: [
    { day: 'Day 9 · today', time: '09:00', attendees: 'Fidson IT, Sales Ops, Tales', notes: '1 P1 open (Customer 360 on Android Go). Fix in staging, ships today.', done: true },
    { day: 'Day 8', time: '09:00', attendees: 'Fidson IT, Sales Ops, Tales', notes: 'Order sync errors after 1.8.1 traced to Business Central duplicate check.', done: true },
    { day: 'Day 7', time: '09:00', attendees: 'Fidson IT, Tales', notes: 'Wave 2 (North) live. 38 new users, 4 tickets.', done: true },
  ],
  turnaround: [
    { label: 'P1 · first response', target: '15 min', actual: '9 min', ok: true },
    { label: 'P1 · fix shipped', target: '24 h', actual: '19 h', ok: true },
    { label: 'P2 · fix shipped', target: '3 days', actual: '2.1 days', ok: true },
    { label: 'P3 · resolved', target: '5 days', actual: '5.6 days', ok: false },
  ],
  byDay: [14, 22, 19, 17, 12, 15, 21, 11, 8],
  answeredByAgent: 71,
};

// ===== The scripted agent =====

export interface AgentReply {
  text: string;
  lesson?: Lesson;
  note?: PrivateNote;
  escalate: boolean;
  refused?: boolean;
}

const AUTHORITY = /\b(approve|override|unlock|bypass|raise my limit|increase my limit|delete)\b.*\b(for me|my|this)\b/i;
const GREETING = /^(hi|hello|hey|good (morning|afternoon|evening))\b/i;
const THANKS = /^(thanks|thank you|ok|okay|great|cool)\b/i;

function score(text: string, l: Lesson): number {
  const t = ` ${text.toLowerCase()} `;
  return l.triggers.reduce((s, w) => s + (t.includes(w) ? (w.includes(' ') ? 2 : 1) : 0), 0);
}

export function agentAnswer(text: string, lessons: Lesson[], notes: PrivateNote[], userEmail: string): AgentReply {
  const clean = text.trim();
  if (GREETING.test(clean) && clean.split(/\s+/).length <= 3) {
    return { text: 'Hi. Tell me what is going wrong, in your own words. I can see which screen you are on, so you do not need to describe the app.', escalate: false };
  }
  if (THANKS.test(clean) && clean.split(/\s+/).length <= 3) {
    return { text: 'Glad that helped. I am on every screen if anything else comes up.', escalate: false };
  }
  if (AUTHORITY.test(clean)) {
    return {
      text: 'I cannot approve, unlock or change limits. Those decisions stay with your manager and the approval chain, and nothing I learn changes that. I can tell you where your request is waiting.',
      escalate: false, refused: true,
    };
  }
  const ranked = lessons.map(l => ({ l, s: score(clean, l) })).filter(x => x.s > 0).sort((a, b) => b.s - a.s);
  const mine = notes.filter(n => n.userEmail === userEmail);
  const note = mine.find(n => /gps|sync|location|battery|check/i.test(clean) && /gps|sync|battery/i.test(n.note));
  if (ranked.length) {
    const lesson = ranked[0].l;
    return { text: lesson.answer, lesson, note, escalate: false };
  }
  return {
    text: 'I have not learned how to fix this yet, so I will not guess. I can pass it to the support desk now with your screen, phone and sync details attached, so you do not have to explain it again.',
    escalate: true, note,
  };
}

// What the agent drafts once a human resolves a ticket. Scripted for the demo
// ticket; any other ticket gets a generic draft built from the resolution text.
export function draftLessonsFor(t: Ticket, resolution: string): LessonProposal[] {
  const base = `${t.id}-${Date.now()}`;
  if (/gps|check-?in|location/i.test(t.subject + ' ' + resolution)) {
    const out: LessonProposal[] = [{
      id: `LP-${base}`, ticketId: t.id, kind: 'shared',
      title: 'Check-in button grey on weak GPS',
      triggers: ['check-in', 'checkin', 'check in', 'gps', 'grey', 'gray', 'location', 'weak signal'],
      answer: 'Check-in needs your location to within 100 metres. When the signal is weak the button stays grey. Step outside or near a window for a few seconds. If it still will not lock, tap "Check in with weak signal": it records the accuracy it has and marks the visit for your manager to see, so the visit still counts.',
      why: `${t.userName}'s phone reported 180 m accuracy. Grace's fix worked first time and applies to anyone on weak signal.`,
      status: 'pending',
    }];
    out.push({
      id: `LPP-${base}`, ticketId: t.id, kind: 'private',
      title: `Note about ${t.userName}`,
      triggers: [], userEmail: t.userEmail, userName: t.userName,
      answer: `${t.userName} works Victoria Island hospitals where indoor GPS is weak. Suggest the weak-signal check-in early.`,
      forUser: 'Several of your hospitals have weak indoor GPS, so the weak-signal check-in is worth using early.',
      why: 'Only true for this person, so it stays in their private memory.',
      status: 'pending',
    });
    return out;
  }
  const words = t.subject.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(w => w.length > 4).slice(0, 4);
  return [{
    id: `LP-${base}`, ticketId: t.id, kind: 'shared',
    title: t.subject, triggers: words, answer: resolution,
    why: 'Drafted from the resolution. Edit it into something any user could follow before approving.',
    status: 'pending',
  }];
}

export function contextFor(roleLabel: string, screen: string, isRep: boolean): TicketContext {
  return isRep
    ? { role: roleLabel, screen, device: 'Tecno Spark 10 · Android 13', appVersion: '1.8.2', network: '4G · weak', queuedSync: 2, gps: '±180 m (needs 100 m)' }
    : { role: roleLabel, screen, device: 'Windows 11 · desktop app', appVersion: '1.8.2', network: 'Wi-Fi', queuedSync: 0 };
}
