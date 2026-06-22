// ponytail: mirrors the pure reducers behind the cross-level demo flows (App.tsx,
// FieldActivityView, RepDCRView, NSMDashboard). If a date/aggregation rule changes,
// update both. Run: node utils/demoFlows.check.mjs
import assert from 'node:assert';

const today = new Date();
const iso = (d) => d.toISOString();
const todayAt = (h) => { const d = new Date(today); d.setHours(h, 0, 0, 0); return iso(d); };
const yesterdayAt = (h) => { const d = new Date(today); d.setDate(d.getDate() - 1); d.setHours(h, 0, 0, 0); return iso(d); };

const logs = [
  { id: 'a', repName: 'Adaeze Okafor', timestamp: todayAt(10), institution: 'Lakeshore', productsDiscussed: ['Coflin'] },
  { id: 'b', repName: 'Adaeze Okafor', timestamp: todayAt(13), institution: 'St. Nicholas', productsDiscussed: ['Astrazon'] },
  { id: 'c', repName: 'Adaeze Okafor', timestamp: yesterdayAt(9), institution: 'Old', productsDiscussed: [] },
  { id: 'd', repName: 'Tope Adeola', timestamp: todayAt(11), institution: 'MedPlus', productsDiscussed: ['Tuxil-N'] },
];

// 1) "today" filter (FieldActivityView / RepDCRView / handleSubmitDCR)
const todays = logs.filter(l => new Date(l.timestamp).toDateString() === today.toDateString());
assert.equal(todays.length, 3, 'today filter should drop yesterday');

// 2) liveByRep aggregation (FieldActivityView roster overlay)
const liveByRep = {};
for (const l of todays) {
  if (!liveByRep[l.repName]) liveByRep[l.repName] = { count: 0, latest: l };
  liveByRep[l.repName].count += 1;
}
assert.equal(liveByRep['Adaeze Okafor'].count, 2, 'Adaeze has 2 visits today');
assert.equal(liveByRep['Tope Adeola'].count, 1, 'Tope has 1 visit today');

// 3) DCR carries today's logs only (handleSubmitDCR)
const dcr = { rep: 'Adaeze Okafor', logs: todays.filter(l => l.repName === 'Adaeze Okafor') };
assert.equal(dcr.logs.length, 2, 'DCR includes only today Adaeze logs');

// 4) NSM escalation filter (NSMDashboard)
const approvals = [
  { id: 'ap1', rep: 'Adaeze O.', escalatedToNSM: true },
  { id: 'ap2', rep: 'Chinedu E.' },
  { id: 'ap3', rep: 'Tope A.', escalatedToNSM: true },
];
const nsmEscalations = approvals.filter(a => a.escalatedToNSM);
assert.equal(nsmEscalations.length, 2, 'only escalated-to-NSM items surface at national tier');

console.log('OK — all demo-flow reducers behave');
