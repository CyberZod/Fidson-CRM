import type { PersonaKey } from '../types';

export interface ChatInsight {
  title: string;
  detail: string;
}

export interface ChatProfile {
  greeting: string;
  scope: string;
  wins: ChatInsight[];
  concerns: ChatInsight[];
  suggestions: string[];
  // Keyword-matched canned responses. Order matters — first match wins.
  cannedResponses: { keywords: string[]; reply: string }[];
}

const sharedDefaultResponse = "I'm running on demo data for this prototype. The full model wires up to live Fidson data — order velocity, GPS, campaign attribution, stock — and answers in seconds. Try one of the suggestion chips above for sample answers.";

const REP_PROFILE: ChatProfile = {
  greeting: 'Hi Adaeze',
  scope: 'Lekki / V.I. · Institution channel',
  wins: [
    { title: '3 visits done by 11am', detail: 'You\'re tracking 92% of plan with two stops to go.' },
    { title: 'Lakeshore Coflin uptake confirmed', detail: 'Dr. Adebayo committed to 200-carton paediatric order.' },
    { title: 'Products of Focus coverage 78%', detail: 'Above the 70% Q2 target. Push Tuxil-N today to hit 85%.' },
  ],
  concerns: [
    { title: 'MedPlus Yaba unvisited 12 days', detail: 'They\'re overdue for a restock conversation.' },
    { title: 'GSK promo flagged · 5 sites', detail: '15% trade discount on Augmentin may dent Astrazon conversion this week.' },
    { title: 'Lagoon Hospital cancelled tomorrow', detail: 'Open slot at 16:00 — consider swapping in a Coflin follow-up.' },
  ],
  suggestions: [
    'What\'s my next best action?',
    'Any low-stock customers today?',
    'How am I tracking on Products of Focus?',
    'Show me competitor activity in my zone',
  ],
  cannedResponses: [
    { keywords: ['next best', 'next action', 'what should i'], reply: 'Head to MedPlus Yaba first — they\'re 12 days overdue and your Coflin paediatric materials match their pharmacist\'s last question on dosing. Backup: re-engage Lagoon Hospital VI with the new clinical trial brief.' },
    { keywords: ['low stock', 'stock', 'restock'], reply: 'Two customers are below restock level: Lakeshore Specialist Hospital (Coflin Forte at 12 vs target 50) and St. Nicholas (Tuxil-N at 8 vs target 30). I\'ve queued recommended order quantities on both.' },
    { keywords: ['focus', 'coverage', 'products of focus'], reply: 'Coflin Forte coverage 78%, Astrazon 41%, Tuxil-N 28%. To hit 85% on Coflin by Friday, prioritise detailing on the next 3 institutional visits.' },
    { keywords: ['competitor', 'augmentin', 'gsk'], reply: 'GSK is running a 15% trade discount on Augmentin in 5 SW sites. The Augmentin Counter-Detail Brief was pushed by PM today — open the Detailing Materials tab to load it.' },
    { keywords: ['coflin'], reply: 'Coflin Forte 600mg is your strongest line — +37% MoM nationally. Locally Lakeshore committed to 200 cartons and Reddington adoption is climbing. Push paediatric dosing at St. Nicholas next.' },
    { keywords: ['lagoon', 'reschedule', 'cancellation'], reply: 'Lagoon Hospital cancelled the 16:00 slot. Auto-suggest: swap to Reddington (Dr. Bello, follow-up on Coflin) — same drive time, high-yield. File an adjustment request to RSM if you do.' },
  ],
};

const RSM_PROFILE: ChatProfile = {
  greeting: 'Hi Tunde',
  scope: 'South-West Region · 12 reps · Q2 FY26',
  wins: [
    { title: 'Region 87% to Q2 target', detail: '+5% vs Q1 same-period · Coflin Forte driving the lift.' },
    { title: '4 reps active right now', detail: 'Adaeze, Chinedu, Tope, Kola — heatmap clean across Lagos metro.' },
    { title: 'Lakeshore institutional close', detail: '₦438k order with 18% discount escalated to DM — likely approval.' },
  ],
  concerns: [
    { title: 'Apapa zone gap — 21 days', detail: '3 institutional accounts unvisited. ₦480k pipeline at risk.' },
    { title: 'Fatima B. visit completion 45%', detail: 'Well below team avg 78%. Suggest a 1:1 this week.' },
    { title: 'Distributor stock-out risk · PHC', detail: 'Tuxil-N at PHC will run out in 6 days.' },
  ],
  suggestions: [
    'How is my region tracking vs target?',
    'Which reps need coaching this week?',
    'Any pipeline risks in the next 30 days?',
    'Which campaigns are paying off in SW?',
  ],
  cannedResponses: [
    { keywords: ['target', 'attainment', 'tracking'], reply: 'SW region is 87% to Q2 target with two weeks left. Coflin Forte is +37% MoM and pulling the rest of the portfolio up. Risk: Astrazon flat — recommend Tunde to lean into Tope\'s Surulere territory.' },
    { keywords: ['coaching', 'rep', 'performance'], reply: 'Fatima Bello is the standout — 45% visit completion vs team avg 78%. Pattern: late starts on Mon/Tue, no Friday visits in 3 weeks. Schedule a 30-min 1:1 and consider a PM joint call.' },
    { keywords: ['risk', 'pipeline', 'churn'], reply: 'Three risks: (1) Apapa zone gap (21 days unvisited) — ₦480k exposed. (2) PHC distributor Tuxil-N stock-out in 6 days. (3) GSK Augmentin promo could dent Astrazon conversion. I\'d push on (1) first — quickest fix.' },
    { keywords: ['campaign', 'roi'], reply: 'In SW: Q3 Coflin Paediatric Focus is at +260% ROI (₦8.2M spend, attributed ₦28.4M). Antibiotic Stewardship at +124%. The Cardio Q3 launch is paused — Ngozi Eze\'s call.' },
    { keywords: ['discount', 'approval'], reply: 'Discount approvals route to DM Kemi Adeyemi now — you\'ll see them read-only on your dashboard. Lakeshore\'s 18% is queued and AI flags it as recommend-approve.' },
  ],
};

const PM_PROFILE: ChatProfile = {
  greeting: 'Hi Dr. Akande',
  scope: 'Respiratory Portfolio · Coflin & Tuxil-N · Nationwide',
  wins: [
    { title: 'Coflin Forte +37% MoM', detail: '63% of reps actively detailing · Teaching hospitals leading.' },
    { title: 'Q3 Coflin Paediatric campaign ROI +260%', detail: '₦8.2M spend → ₦28.4M attributed.' },
    { title: 'Coflin Paediatric Guide v2.1 cleared', detail: 'Medical Affairs signed off · ready to push to 89 reps.' },
  ],
  concerns: [
    { title: 'Tuxil-N flat for 8 weeks', detail: 'Adoption 28%. Trade push in SW barely breaking even.' },
    { title: 'GSK Augmentin counter-promo detected', detail: 'May affect Astrazon co-detail. Time-sensitive — push counter-brief.' },
    { title: '3 CMs awaiting your review', detail: 'Including a high-impact multi-regional from Tope Adeola.' },
  ],
  suggestions: [
    'How is Coflin doing nationwide?',
    'Which campaigns are returning the best ROI?',
    'Where should I run a joint call?',
    'Anything to flag for HoM this week?',
  ],
  cannedResponses: [
    { keywords: ['coflin'], reply: 'Coflin Forte 600mg is +37% MoM nationally. 63% rep adoption · 124 visit mentions in the last 14 days · Adaeze Okafor leads in detail count. Teaching hospitals over-indexed; Apapa zone under-indexed.' },
    { keywords: ['roi', 'campaign', 'returning'], reply: 'Top performer: Q3 Coflin Paediatric Focus (+260% ROI, ₦28.4M attributed from ₦8.2M spend). Watch: Cardio Q3 paused (Ngozi Eze) at -44%. Tuxil-N Trade Push at +14% — marginal.' },
    { keywords: ['joint call', 'shadow', 'observe'], reply: 'Recommend a joint call with Fatima Bello (SE region) — visit completion 45% and Coflin uptake lagging in her territory. Or Tope Adeola in Surulere where Tuxil-N OTC conversion is slow.' },
    { keywords: ['hom', 'escalate', 'flag'], reply: 'Two things for HoM: (1) the Augmentin Counter-Detail Brief needs nationwide push — it\'s your urgent content approval. (2) Tope\'s Paediatric Dosing Webinar (₦1.2M, high-impact) is waiting in HoM queue.' },
    { keywords: ['tuxil', 'underperform'], reply: 'Tuxil-N is the laggard — 28% rep adoption, 8 weeks flat in volume. The SW Trade Push campaign barely broke even (+14%). Consider repositioning to mobile/frontline or pausing pending a brief refresh.' },
    { keywords: ['competitor', 'augmentin', 'gsk'], reply: 'GSK Augmentin: 15% trade discount detected in 5 SW sites. The Counter-Detail Brief is queued for your sign-off — once approved it auto-pushes to all 142 reps.' },
  ],
};

const NSM_PROFILE: ChatProfile = {
  greeting: 'Hi Bayo',
  scope: 'National · 2 divisions · 6 regions · 142 reps',
  wins: [
    { title: 'National forecast 92% of FY26 target', detail: '₦230BN projected vs ₦250BN — confidence 84%.' },
    { title: 'South Division +15 pts vs North', detail: 'SW region pulling hardest on Coflin uptake.' },
    { title: 'Coflin nationwide +37% MoM', detail: 'Strongest single-product trend across portfolio.' },
  ],
  concerns: [
    { title: 'NE region stalling · 60 days', detail: 'No regional growth · Recommend leadership review.' },
    { title: 'Astrazon nationally flat', detail: '−4% MoM · Possibly dragged by GSK Augmentin promo.' },
    { title: 'Abuja FCT under-tapped', detail: '₦24M institutional pipeline detected — no FSM coverage.' },
  ],
  suggestions: [
    'How are we tracking against the ₦250BN FY26 target?',
    'Where are the biggest opportunities right now?',
    'Which division is at risk?',
    'Show me ROI across active campaigns',
  ],
  cannedResponses: [
    { keywords: ['250', 'target', 'fy26', 'national'], reply: 'FY26 trajectory is at 92% of the ₦250BN target with 38% of the year complete. South division is the engine (SW + SE + SS combined at 96% of plan). North is the drag at 78% — NE region the worst.' },
    { keywords: ['opportunity', 'untapped', 'growth'], reply: 'Three opportunities ranked: (1) Abuja FCT institutional pipeline — ₦24M detected, no FSM coverage. (2) Apabuja zone gap in SW — 21 days unvisited. (3) Lagoon Hospital VI showing 3x order velocity, ready for KAM elevation.' },
    { keywords: ['risk', 'division', 'failing', 'stalling'], reply: 'NE region is the priority risk: zero growth for 60 days. Recommend dispatching DM Kemi for an on-the-ground assessment. North division as a whole is 14 pts below South — structural issue worth a quarterly review.' },
    { keywords: ['roi', 'campaign'], reply: 'Active campaigns this quarter: Q3 Coflin Paediatric (+260% ROI), Antibiotic Stewardship (+124%), Tuxil-N Trade SW (+14%), Cardio Q3 paused (-44%). Aggregate ROI is +198%. Tell HoM to consider re-scoping the Cardio campaign.' },
  ],
};

const HOM_PROFILE: ChatProfile = {
  greeting: 'Hi Ade',
  scope: 'Head of Marketing · Institution + Trade',
  wins: [
    { title: '4 active campaigns · 1 paused', detail: 'Aggregate ROI +198% across active tracks.' },
    { title: 'Content Approved YTD: 62', detail: 'Average sign-off cycle 1.4 days — best ever.' },
    { title: 'Coflin paediatric brand health strong', detail: 'PM Akande recommends doubling spend in Q3.' },
  ],
  concerns: [
    { title: '2 high-impact CMs awaiting you', detail: 'Antibiotic Stewardship + Paediatric Dosing Webinar.' },
    { title: 'Cardio Q3 ROI -44%', detail: 'Paused by Ngozi Eze. Decision needed: redirect or kill.' },
    { title: 'Augmentin Counter-Detail Brief urgent', detail: 'Time-sensitive · pushed by PM, awaiting MM/your sign-off.' },
  ],
  suggestions: [
    'Show me campaign ROI by channel',
    'What\'s waiting on my approval?',
    'Which products need brand reinforcement?',
    'How is Q3 spend pacing vs budget?',
  ],
  cannedResponses: [
    { keywords: ['roi', 'channel'], reply: 'Institution channel ROI +212% (Coflin Paediatric + Antibiotic Stewardship). Trade channel +14% (Tuxil-N push struggling). Recommend rebalancing Q3 spend 60/40 toward Institution.' },
    { keywords: ['approval', 'pending', 'queue', 'waiting'], reply: 'Two high-impact CMs in your queue: Antibiotic Stewardship (₦820k · 40 attendees, multi-regional) and Paediatric Dosing Webinar (₦1.2M · 65 attendees). Also the Augmentin Counter-Detail Brief is time-sensitive.' },
    { keywords: ['brand', 'reinforce', 'product'], reply: 'Coflin is healthy — keep momentum. Astrazon flat and under competitive pressure (GSK) — refresh detail aid. Tuxil-N drifting — consider repositioning under mobile/frontline channel.' },
    { keywords: ['budget', 'spend', 'pacing'], reply: 'Marketing spend YTD ₦42M against full-year ₦128M plan — pacing slightly ahead at 38% of year, 33% of budget. Cardio Q3 pause freed ₦1.9M — recommend redirecting to Coflin.' },
  ],
};

const DM_PROFILE: ChatProfile = {
  greeting: 'Hi Kemi',
  scope: 'South Division · SW, SE, SS · 67 reps',
  wins: [
    { title: 'Division pipeline +18% MoM', detail: '₦128M active · SW leading at 92% attainment.' },
    { title: 'Lakeshore institutional close', detail: '₦438k discount approved (was queued by Tunde).' },
    { title: 'Coflin uptake division-wide', detail: '+37% MoM matches national leader.' },
  ],
  concerns: [
    { title: 'SE region under-indexing on Coflin', detail: '28% behind SW on respiratory portfolio adoption.' },
    { title: '2 escalated discounts awaiting you', detail: '22% Reddington + 25% Q2 marketing exception.' },
    { title: 'Tuxil-N stock-out risk · PHC', detail: 'Distributor at 8 cartons, 6 days runway.' },
  ],
  suggestions: [
    'How is the division tracking?',
    'Which discounts need my approval?',
    'Where is SE under-indexing?',
    'Any escalations from RSMs?',
  ],
  cannedResponses: [
    { keywords: ['division', 'tracking', 'attainment'], reply: 'South Division at +18% MoM. SW leading 92% attainment, SS 84%, SE 76%. Coflin uptake division-wide +37% — strong signal. Distributor stock health needs eyes on PHC.' },
    { keywords: ['discount', 'approval', 'escalat'], reply: 'Two discounts await your sign-off: (1) Reddington Hospital ₦1.42M at 22% (Tunde Bakare\'s region — AI recommends approve). (2) Q2 trade promo marketing exception ₦3.2M at 25% — urgent, AI recommends approve.' },
    { keywords: ['se', 'south-east', 'under'], reply: 'SE under-indexing primarily on Coflin (-28% vs SW). PM detailing materials reaching only 64% of SE reps. Recommend a PM-led brief refresh + a joint call coordinated through Tunde.' },
    { keywords: ['rsm', 'escalation'], reply: 'Tunde (SW) is clean. Emeka (SS) escalated a PHC distributor stock-out and the Reddington discount. No SE-specific escalations this week, but the under-indexing is louder than any single ticket.' },
  ],
};

const FSM_PROFILE: ChatProfile = {
  greeting: 'Hi Ifeanyi',
  scope: 'Trade South-West · 12 distributors · 8 reps',
  wins: [
    { title: 'Trade pipeline ₦28.4M', detail: '+8% vs Q1 same-period · 62 active orders.' },
    { title: 'Avg order cycle 4.2 days', detail: '−0.8 days vs Q1 — best ever.' },
    { title: 'Mainland Pharma Supply healthy', detail: '64 cartons, 32 days runway.' },
  ],
  concerns: [
    { title: 'PHC Pharmacy Distributors critical', detail: '8 cartons, 6 days to stock-out.' },
    { title: 'Q2 audit 4 of 12 distributors pending', detail: 'Due May 31 — push remaining audits.' },
    { title: 'GSK Augmentin 15% promo in SW trade', detail: 'May pull volume from Astrazon.' },
  ],
  suggestions: [
    'Which distributors are at risk?',
    'How is the trade pipeline tracking?',
    'What\'s the Q2 audit status?',
    'Show me competitor activity in trade',
  ],
  cannedResponses: [
    { keywords: ['risk', 'distributor', 'critical'], reply: 'Two distributors at risk: PHC Pharmacy (8 cartons, 6 days · CRITICAL) and Abeokuta Wholesalers (18 cartons, 9 days · LOW). Push reorder on PHC today.' },
    { keywords: ['pipeline', 'trade', 'order'], reply: 'Trade pipeline ₦28.4M with 62 active orders. Avg cycle 4.2 days, down from 5.0 in Q1 — clearest improvement metric this quarter. SW pulling above Q2 plan by 8%.' },
    { keywords: ['audit', 'quarterly'], reply: 'Q2 audit progress: 8 of 12 complete. Remaining: Kano Distributors, Onitsha Trade Hub, Mainland Pharma (overdue), PHC (priority). Deadline May 31.' },
    { keywords: ['competitor', 'gsk', 'augmentin'], reply: 'GSK is running a 15% trade discount on Augmentin across 5 SW outlets. PM Akande pushed the Augmentin Counter-Detail Brief to all reps — make sure your trade team uses it on next visits.' },
  ],
};

const ASM_PROFILE: ChatProfile = {
  greeting: 'Hi Funmi',
  scope: 'Lekki / V.I. Cluster · 4 reps',
  wins: [
    { title: 'Area on track at 89% of Q2 plan', detail: 'Adaeze + Tope are the leaders.' },
    { title: '3 of 4 reps live right now', detail: 'Clean coverage across V.I. and Lekki.' },
    { title: 'Coflin paediatric story landing', detail: 'Lakeshore + St Nicholas both showing uptake.' },
  ],
  concerns: [
    { title: 'Fatima B. visit completion 45%', detail: 'Coaching needed — possible engagement issue.' },
    { title: 'MedPlus Yaba unvisited 12 days', detail: 'Adaeze\'s territory · churn risk.' },
    { title: 'Lagoon Hospital cancellation today', detail: 'Open slot to fill at 16:00.' },
  ],
  suggestions: [
    'How are my reps doing today?',
    'Who needs coaching this week?',
    'Any churn risk in my cluster?',
    'What\'s in my activity log to push up?',
  ],
  cannedResponses: [
    { keywords: ['rep', 'today', 'live'], reply: '3 of 4 reps live: Adaeze (Lakeshore), Tope (Surulere), Kola (Apapa). Fatima not checked in. Adaeze hit 3 of 8 visits by 11am — pace is on target.' },
    { keywords: ['coach', 'fatima', 'low'], reply: 'Fatima Bello — visit completion 45% vs team average 78%, no Friday visits in 3 weeks. Recommend a 1:1 this week and a PM joint call (Femi Akande available SW per his calendar).' },
    { keywords: ['churn', 'risk', 'unvisited'], reply: 'MedPlus Yaba (Adaeze\'s area) — 12 days unvisited, ₦80k recurring book of business at risk. Reddington follow-up missed twice. Push Adaeze to wrap MedPlus into today\'s plan.' },
    { keywords: ['push', 'report', 'bm'], reply: 'Auto-summary ready to push to BM Chioma Eze: 89% Q2 attainment, 3 active reps, 1 coaching need (Fatima), 1 churn risk (MedPlus Yaba). Hit Push to BM to send.' },
  ],
};

const MM_PROFILE: ChatProfile = {
  greeting: 'Hi Tola',
  scope: 'MM Institution · Nationwide · cross-portfolio',
  wins: [
    { title: 'Active campaigns reaching 218 attendees', detail: 'Antibiotic Stewardship pulling hardest.' },
    { title: '62 pieces of detailing content approved YTD', detail: 'Cycle time 1.4 days — fastest yet.' },
    { title: 'Coflin paediatric brand metrics strong', detail: 'Driving the institutional portfolio nationally.' },
  ],
  concerns: [
    { title: 'Augmentin Counter-Detail urgent', detail: 'GSK promo in 5 sites — time-sensitive content sign-off.' },
    { title: '2 high-impact CMs in HoM queue', detail: 'You preview these on HoM\'s behalf.' },
    { title: 'Cardio Q3 campaign paused', detail: 'Spend question pending HoM decision.' },
  ],
  suggestions: [
    'What content needs my sign-off?',
    'How are campaigns performing nationwide?',
    'Which high-impact CMs are waiting?',
    'What\'s the competitor pressure right now?',
  ],
  cannedResponses: [
    { keywords: ['content', 'approval', 'sign-off'], reply: 'Three content items waiting: (1) Coflin Paediatric Dosing Guide v2.1 (cleared by Medical Affairs). (2) Augmentin Counter-Detail Brief — URGENT due to GSK promo. (3) Cardio Q3 Detailing Deck v1.0 — ₦680k production cost.' },
    { keywords: ['campaign', 'nationwide', 'roi'], reply: 'Aggregate national campaign ROI +198%. Q3 Coflin Paediatric leading at +260%. Cardio Q3 paused at -44% — flagged for HoM decision. Tuxil-N Trade barely returning (+14%).' },
    { keywords: ['cme', 'cm', 'high-impact'], reply: 'Two high-impact CMs in HoM queue (you preview): Antibiotic Stewardship ₦820k by Chinedu Eze, Paediatric Dosing Webinar ₦1.2M by Tope Adeola. Both reach >40 attendees across multiple regions.' },
    { keywords: ['competitor', 'pressure', 'gsk'], reply: 'Active competitor signal: GSK Augmentin 15% promo across 5 SW outlets. PM has pushed counter-detail brief — once approved by you and HoM, it auto-distributes to 142 reps.' },
  ],
};

const BM_PROFILE: ChatProfile = {
  greeting: 'Hi Chioma',
  scope: 'BM · Cestra Brand Portfolio · reports to BMD',
  wins: [
    { title: 'Cestra Q2 revenue ₦14.2M', detail: '52% adoption · ahead of plan.' },
    { title: 'Provision adoption ramping with Cardio reps', detail: 'Q3 cross-sell uplift visible.' },
    { title: '3 active campaigns on Cestra portfolio', detail: 'Brand health score 78/100.' },
  ],
  concerns: [
    { title: 'Cestra-B underperforming in SE', detail: '-12% vs plan · regional gap.' },
    { title: 'Competitor counter-promo on Cestra-A', detail: 'Detected this week in Lagos trade.' },
    { title: '4 of 89 reps haven\'t detailed in 14 days', detail: 'Pattern: same cluster (Apapa).' },
  ],
  suggestions: [
    'How are my brands doing this quarter?',
    'Which territories are dragging?',
    'What\'s the competitor activity on my portfolio?',
    'Who are the top reps for my portfolio?',
  ],
  cannedResponses: [
    { keywords: ['brand', 'quarter', 'doing'], reply: 'Cestra ₦14.2M (ahead of plan, +52% adoption). Provision ramping with Cardio reps. Cestra-B is the laggard at -12% vs plan in SE. Overall brand health 78/100.' },
    { keywords: ['territory', 'drag', 'underperform'], reply: 'SE region drags Cestra-B (-12%). Apapa zone (SW) has 4 reps with no detail in 14 days. The pattern correlates with competitor counter-promo in Lagos trade.' },
    { keywords: ['competitor', 'counter', 'promo'], reply: 'Counter-promo on Cestra-A detected in 3 Lagos trade outlets this week. Recommendation: brief the SW trade team and surface a counter-detail aid through MM.' },
    { keywords: ['top reps', 'leaderboard'], reply: 'Top portfolio reps: Adaeze Okafor (Lekki) leads with 47 detail moments, Tope Adeola (Surulere) 38, Chinedu Eze (Ikeja) 32. Bottom quartile concentrated in Apapa cluster.' },
  ],
};

const CD_PROFILE: ChatProfile = {
  greeting: 'Hi Tunji',
  scope: 'Commercial Director · National · ₦250BN FY26 target',
  wins: [
    { title: '38% of FY26 target hit', detail: 'On pace at the macro level; mix shift toward institution.' },
    { title: 'Institution channel ROI +212% on Q3 campaigns', detail: 'Healthier than trade by a wide margin.' },
    { title: '84 reps live across the country right now', detail: 'Field activity above the daily baseline.' },
  ],
  concerns: [
    { title: 'Trade Q2 attainment 76%', detail: 'Below the institution channel by 16 pts.' },
    { title: 'Mobile & Frontline coverage thin in NE', detail: 'BM Mobile only has 6 active reps there.' },
    { title: 'Augmentin competitor pressure intensifying', detail: 'GSK pushing trade discount in 5 SW sites this week.' },
  ],
  suggestions: [
    'How are we tracking against ₦250BN?',
    'Which channel is at biggest risk?',
    'Show me ROI across all campaigns',
    'Where should I push leadership attention?',
  ],
  cannedResponses: [
    { keywords: ['250', 'target', 'fy26'], reply: 'At 38% of the ₦250BN target with 31% of the fiscal year complete — slightly ahead. Confidence to land at 92-96% by year-end. Mix is shifting: Institution +212% ROI, Trade +14% ROI.' },
    { keywords: ['channel', 'risk', 'at risk'], reply: 'Trade channel is the risk — 76% Q2 attainment vs Institution at 92%. ADC should focus weekly reviews there. Mobile & Frontline is thin in NE — consider a BM Mobile redistribution.' },
    { keywords: ['roi', 'campaign'], reply: 'Aggregate ROI +198%. Institution-led campaigns at +212% (Coflin Paediatric + Antibiotic Stewardship). Trade at +14% (Tuxil-N push under-performing). Cardio Q3 paused at -44% — Ngozi Eze\'s call still pending HoM.' },
    { keywords: ['leadership', 'attention', 'push'], reply: 'Three places: (1) Trade channel attainment gap — pull ADC into a weekly. (2) NE region stalled for 60 days — broadcast a NSM/DM directive. (3) GSK Augmentin pressure — make sure HoM signs off on the counter-brief today.' },
  ],
};

const GENERIC_LEADER_PROFILE: ChatProfile = {
  greeting: 'Welcome back',
  scope: 'Strategic view · all reporting lines',
  wins: [
    { title: 'National pipeline ₦128M', detail: 'On track to land Q2 above plan.' },
    { title: 'Coflin Forte +37% MoM', detail: 'Driver of overall portfolio lift.' },
    { title: '4 active campaigns trending green', detail: 'Aggregate ROI +198% YTD.' },
  ],
  concerns: [
    { title: 'NE region stalled · 60 days', detail: 'Leadership review recommended.' },
    { title: 'Astrazon flat nationally', detail: '−4% MoM · competitor pressure.' },
    { title: 'Trade channel under-indexing', detail: '76% attainment vs Institution at 92%.' },
  ],
  suggestions: [
    'How are we tracking against plan?',
    'Where are the biggest risks?',
    'Which campaigns are paying off?',
    'What should I broadcast to the field?',
  ],
  cannedResponses: [
    { keywords: ['track', 'plan', 'attainment'], reply: 'Nationally 88% of Q2 plan, Institution channel pacing well ahead of Trade. Confidence to deliver Q2 in green sits at 84%.' },
    { keywords: ['risk'], reply: 'Top risks: (1) NE region stalled for 60 days. (2) Astrazon flat under GSK pressure. (3) Trade channel attainment lagging Institution by 16 pts. (4) Tuxil-N adoption stuck at 28%.' },
    { keywords: ['campaign', 'roi'], reply: 'Aggregate campaign ROI +198%. Best: Q3 Coflin Paediatric Focus +260%. Worst: Cardio Q3 paused at -44%. The Tuxil-N Trade Push is barely returning.' },
    { keywords: ['broadcast', 'directive', 'field'], reply: 'Most useful broadcast right now: a national push on Augmentin counter-detail. Secondary: highlight the Coflin Paediatric dosing guide refresh.' },
  ],
};

export const CHAT_PROFILES: Record<PersonaKey, ChatProfile> = {
  rep: REP_PROFILE,
  manager: RSM_PROFILE,
  asm: ASM_PROFILE,
  fsm: FSM_PROFILE,
  pm: PM_PROFILE,
  mm: MM_PROFILE,
  hom: HOM_PROFILE,
  bm: BM_PROFILE,
  bmd: GENERIC_LEADER_PROFILE,
  dm: DM_PROFILE,
  nsm: NSM_PROFILE,
  nsm_inst: NSM_PROFILE,
  nsm_trade: NSM_PROFILE,
  adc: GENERIC_LEADER_PROFILE,
  cd: CD_PROFILE,
};

export const answerFromChatLibrary = (role: PersonaKey, question: string): string => {
  const profile = CHAT_PROFILES[role] ?? GENERIC_LEADER_PROFILE;
  const q = question.toLowerCase();
  for (const candidate of profile.cannedResponses) {
    if (candidate.keywords.some(k => q.includes(k.toLowerCase()))) {
      return candidate.reply;
    }
  }
  return sharedDefaultResponse;
};
