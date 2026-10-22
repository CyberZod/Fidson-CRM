// Org hierarchy for leadership drill-down: National › Division › Region › Area › Rep.
// Rep rows are the source; every higher level is a roll-up of the reps beneath it.

export type SalesChannel = 'Institution' | 'Trade' | 'Mobile & Frontline';
export const SALES_CHANNELS: SalesChannel[] = ['Institution', 'Trade', 'Mobile & Frontline'];

export type DrillLevel = 'national' | 'division' | 'region' | 'area' | 'rep';

export interface RepFacts {
  channel: SalesChannel;
  target: number;      // Q2, ₦M
  achieved: number;    // Q2, ₦M
  customers: number;   // in call plan
  covered: number;     // visited this cycle
  visits: number;      // logged this cycle
  compliant: number;   // visits with GPS check-in + check-out inside the geofence
  orders: number;
  orderValue: number;  // ₦M, this cycle
  lastVisit: string;
  topAccounts: string[];
}

export interface DrillNode {
  id: string;
  name: string;
  level: DrillLevel;
  lead: string;         // person accountable at this level
  regionCode?: 'NW' | 'NE' | 'NC' | 'SW' | 'SE' | 'SS';
  children: DrillNode[];
  rep?: RepFacts;
}

export interface RollUp {
  target: number;
  achieved: number;
  attainment: number;  // %
  coverage: number;    // %
  compliance: number;  // %
  reps: number;
  visits: number;
  orders: number;
}

// Deterministic jitter so generated reps are stable between renders.
const seeded = (key: string) => {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 1000) / 1000;
};

const r1 = (n: number) => Math.round(n * 10) / 10;

interface RegionTuning { attain: number; coverage: number; compliance: number }

const makeRep = (
  name: string,
  areaId: string,
  channel: SalesChannel,
  tune: RegionTuning,
  fixed?: Partial<RepFacts>,
): DrillNode => {
  const s = seeded(name + areaId);
  const t = seeded(areaId + name);
  const target = fixed?.target ?? r1(7 + s * 6);
  const achieved = fixed?.achieved ?? r1(target * Math.max(0.3, tune.attain + (t - 0.5) * 0.18));
  const customers = fixed?.customers ?? 32 + Math.round(s * 14);
  const covered = fixed?.covered ?? Math.min(customers, Math.round(customers * Math.max(0.3, tune.coverage + (s - 0.5) * 0.16)));
  const visits = fixed?.visits ?? 48 + Math.round(t * 30);
  const compliant = fixed?.compliant ?? Math.min(visits, Math.round(visits * Math.max(0.3, tune.compliance + (t - 0.5) * 0.14)));
  const orders = fixed?.orders ?? 9 + Math.round(s * 14);
  return {
    id: `${areaId}/${name.toLowerCase().replace(/[^a-z]+/g, '-')}`,
    name,
    level: 'rep',
    lead: name,
    children: [],
    rep: {
      channel,
      target,
      achieved,
      customers,
      covered,
      visits,
      compliant,
      orders,
      orderValue: fixed?.orderValue ?? r1(achieved * 0.34),
      lastVisit: fixed?.lastVisit ?? `${1 + Math.round(s * 3)}d ago`,
      topAccounts: fixed?.topAccounts ?? [],
    },
  };
};

const area = (
  id: string,
  name: string,
  lead: string,
  tune: RegionTuning,
  reps: [string, SalesChannel, Partial<RepFacts>?][],
): DrillNode => ({
  id,
  name,
  level: 'area',
  lead,
  children: reps.map(([n, ch, f]) => makeRep(n, id, ch, tune, f)),
});

const T = {
  SW: { attain: 0.92, coverage: 0.86, compliance: 0.9 },
  SS: { attain: 0.84, coverage: 0.8, compliance: 0.84 },
  SE: { attain: 0.78, coverage: 0.74, compliance: 0.8 },
  NW: { attain: 0.62, coverage: 0.64, compliance: 0.76 },
  NE: { attain: 0.48, coverage: 0.52, compliance: 0.62 },
  NC: { attain: 0.76, coverage: 0.7, compliance: 0.82 },
};

export const ORG_TREE: DrillNode = {
  id: 'national',
  name: 'National',
  level: 'national',
  lead: 'Bayo Ogunlana · NSM',
  children: [
    {
      id: 'south', name: 'South', level: 'division', lead: 'Kemi Adeyemi · DM',
      children: [
        {
          id: 'sw', name: 'South-West', level: 'region', lead: 'Tunde Bakare · RSM', regionCode: 'SW',
          children: [
            area('sw-lekki', 'Lekki/V.I.', 'Funmi Adeola · ASM', T.SW, [
              ['Adaeze Okafor', 'Institution', {
                target: 12.0, achieved: 11.3, customers: 42, covered: 38, visits: 74, compliant: 70, orders: 21, orderValue: 4.1,
                lastVisit: 'Today 10:04', topAccounts: ['Lakeshore Specialist Hospital', 'Reddington Hospital', 'St. Nicholas Hospital'],
              }],
              ['Bayo Salami', 'Institution', { target: 9.0, achieved: 5.8, topAccounts: ['Lagoon Hospital V.I.', 'Evercare Lekki'] }],
              ['Yetunde Cole', 'Trade', { target: 8.0, achieved: 8.6, topAccounts: ['HealthPlus V.I.', 'MedPlus Lekki'] }],
              ['Fatima Bello', 'Mobile & Frontline', { target: 7.0, achieved: 3.9, covered: 18, customers: 36, topAccounts: ['Ajah PHC cluster'] }],
            ]),
            area('sw-ikeja', 'Ikeja', 'Segun Ojo · ASM', T.SW, [
              ['Chinedu Eze', 'Institution', { target: 11.0, achieved: 10.7, topAccounts: ['LASUTH', 'Reddington Ikeja'] }],
              ['Joseph Nwafor', 'Trade'],
              ['Halima Sule', 'Mobile & Frontline'],
            ]),
            area('sw-surulere', 'Surulere/Apapa', 'Bisi Akinola · ASM', T.SW, [
              ['Tope Adeola', 'Institution', { target: 10.0, achieved: 9.1, topAccounts: ['LUTH', 'Randle General'] }],
              ['Kola Adeniyi', 'Trade', { topAccounts: ['MedPlus Apapa'] }],
              ['Olamide Martins', 'Mobile & Frontline'],
            ]),
            area('sw-ibadan', 'Ibadan', 'Wale Ogunbiyi · ASM', T.SW, [
              ['Kunle Adebayo', 'Institution'], ['Ronke Alade', 'Trade'], ['Dare Oyelaran', 'Mobile & Frontline'],
            ]),
          ],
        },
        {
          id: 'ss', name: 'South-South', level: 'region', lead: 'Emeka Okoro · RSM', regionCode: 'SS',
          children: [
            area('ss-ph', 'Port Harcourt', 'Ibinabo George · ASM', T.SS, [
              ['Tamuno Briggs', 'Institution'], ['Ebiere Dokubo', 'Trade'], ['Victor Amadi', 'Mobile & Frontline'],
            ]),
            area('ss-benin', 'Benin', 'Osaze Igbinedion · ASM', T.SS, [
              ['Efosa Ogbe', 'Institution'], ['Ivie Omoruyi', 'Trade'],
            ]),
          ],
        },
        {
          id: 'se', name: 'South-East', level: 'region', lead: 'Ngozi Achebe · RSM', regionCode: 'SE',
          children: [
            area('se-enugu', 'Enugu', 'Obinna Nwosu · ASM', T.SE, [
              ['Chidi Okeke', 'Institution'], ['Amaka Ude', 'Trade'], ['Ikenna Obi', 'Mobile & Frontline'],
            ]),
            area('se-onitsha', 'Onitsha/Aba', 'Uche Eze · ASM', T.SE, [
              ['Nkem Anozie', 'Trade'], ['Ebuka Nnaji', 'Institution'],
            ]),
          ],
        },
      ],
    },
    {
      id: 'north', name: 'North', level: 'division', lead: 'Sani Mohammed · DM',
      children: [
        {
          id: 'nc', name: 'North-Central', level: 'region', lead: 'Yusuf Danjuma · RSM', regionCode: 'NC',
          children: [
            area('nc-abuja', 'Abuja (FCT)', 'Grace Audu · ASM', T.NC, [
              ['Aisha Musa', 'Institution'], ['Peter Ochai', 'Trade'], ['Zainab Yakubu', 'Mobile & Frontline'],
            ]),
            area('nc-jos', 'Jos/Ilorin', 'Dauda Pam · ASM', T.NC, [
              ['Mary Dung', 'Institution'], ['Tunde Salawu', 'Trade'],
            ]),
          ],
        },
        {
          id: 'nw', name: 'North-West', level: 'region', lead: 'Aminu Bello · RSM', regionCode: 'NW',
          children: [
            area('nw-kano', 'Kano', 'Ibrahim Garba · ASM', T.NW, [
              ['Sadiq Lawan', 'Institution'], ['Fatima Ahmed', 'Trade'], ['Usman Kabir', 'Mobile & Frontline'],
            ]),
            area('nw-kaduna', 'Kaduna', 'Hadiza Umar · ASM', T.NW, [
              ['Bashir Aliyu', 'Trade'], ['Rakiya Idris', 'Institution'],
            ]),
          ],
        },
        {
          id: 'ne', name: 'North-East', level: 'region', lead: 'Hauwa Ibrahim · RSM', regionCode: 'NE',
          children: [
            area('ne-bauchi', 'Bauchi/Yola', 'Musa Tanko · ASM', T.NE, [
              ['Adamu Waziri', 'Institution'], ['Hajara Bukar', 'Trade'], ['Yakubu Gana', 'Mobile & Frontline'],
            ]),
          ],
        },
      ],
    },
  ],
};

export const leavesOf = (node: DrillNode): DrillNode[] =>
  node.level === 'rep' ? [node] : node.children.flatMap(leavesOf);

export const rollUp = (reps: DrillNode[]): RollUp => {
  let target = 0, achieved = 0, customers = 0, covered = 0, visits = 0, compliant = 0, orders = 0;
  for (const r of reps) {
    if (!r.rep) continue;
    target += r.rep.target; achieved += r.rep.achieved;
    customers += r.rep.customers; covered += r.rep.covered;
    visits += r.rep.visits; compliant += r.rep.compliant; orders += r.rep.orders;
  }
  const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
  return {
    target: r1(target), achieved: r1(achieved),
    attainment: pct(achieved, target), coverage: pct(covered, customers), compliance: pct(compliant, visits),
    reps: reps.length, visits, orders,
  };
};

export const rollUpNode = (node: DrillNode) => rollUp(leavesOf(node));

export const rollUpByChannel = (node: DrillNode) =>
  SALES_CHANNELS.map(ch => ({ channel: ch, stats: rollUp(leavesOf(node).filter(r => r.rep?.channel === ch)) }))
    .filter(c => c.stats.reps > 0);

// Path of node ids from the root to the first node matching the id or name.
export const findPath = (match: string, node: DrillNode = ORG_TREE, trail: string[] = []): string[] | null => {
  const here = [...trail, node.id];
  const m = match.toLowerCase();
  if (node.id === match || node.name.toLowerCase() === m || node.regionCode === match) return here;
  for (const c of node.children) {
    const p = findPath(match, c, here);
    if (p) return p;
  }
  return null;
};

export const nodesOnPath = (path: string[]): DrillNode[] => {
  const out: DrillNode[] = [ORG_TREE];
  let cur = ORG_TREE;
  for (const id of path.slice(1)) {
    const next = cur.children.find(c => c.id === id);
    if (!next) break;
    out.push(next);
    cur = next;
  }
  return out;
};

export const LEVEL_LABEL: Record<DrillLevel, string> = {
  national: 'National', division: 'Division', region: 'Region', area: 'Area', rep: 'Rep',
};
