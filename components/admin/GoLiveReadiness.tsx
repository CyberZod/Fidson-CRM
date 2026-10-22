import { useState } from 'react';
import Icon from '../Icon';
import { useAdmin } from '../../stores/admin';
import { AdminPage, Badge, Btn, Card, Stat, thCls, tdCls, useNotice, type AdminScreenProps } from './kit';

// AC 9.5 and 10.x: UAT, load, offline sync, DR, cold start, go/no-go.
type UatStatus = 'Signed off' | 'Awaiting sign-off' | 'Failed';
interface Uat { id: string; scenario: string; persona: string; owner: string; status: UatStatus }

const UAT_SEED: Uat[] = [
  { id: 'u1', scenario: 'Rep plans a week, RSM approves, GPS check-in unlocks', persona: 'Rep · RSM', owner: 'Tunde Bakare', status: 'Signed off' },
  { id: 'u2', scenario: 'Visit logged offline in Ibadan, syncs on reconnect', persona: 'Rep', owner: 'Funke Oladipo', status: 'Signed off' },
  { id: 'u3', scenario: 'Order with 18% discount routes to RSM, then SOA', persona: 'Rep · RSM', owner: 'Tunde Bakare', status: 'Signed off' },
  { id: 'u4', scenario: 'Clinical meeting request approved by DM and PM', persona: 'Rep · DM · PM', owner: 'Chioma Eze', status: 'Awaiting sign-off' },
  { id: 'u5', scenario: 'Admin adds a rep, assigns territory, rep signs in', persona: 'Admin · Rep', owner: 'Ngozi Ibe', status: 'Awaiting sign-off' },
  { id: 'u6', scenario: 'NSM reviews national coverage and exports report', persona: 'NSM', owner: 'Kunle Adebayo', status: 'Signed off' },
];

const LOAD = [
  { metric: 'Field interactions per year', target: '1,000,000', measured: '1,420,000 simulated', pass: true },
  { metric: 'Peak requests per second', target: '≥ 150 rps', measured: '232 rps sustained 30 min', pass: true },
  { metric: 'p95 API latency at peak', target: '≤ 800 ms', measured: '410 ms', pass: true },
  { metric: 'Error rate at peak', target: '< 0.5%', measured: '0.08%', pass: true },
];

const SYNC = [
  { metric: 'Devices offline at once', target: '400', measured: '450', pass: true },
  { metric: 'Records queued per device', target: '200', measured: '260', pass: true },
  { metric: 'Full drain after reconnect', target: '≤ 5 min', measured: '2 min 48 s', pass: true },
  { metric: 'Records lost', target: '0', measured: '0 (11 held in conflict queue)', pass: true },
];

const RUNBOOK = [
  'Confirm Azure subscription and resource group are reachable from the jump host',
  'Deploy infrastructure from the tagged release (database, API, web, storage)',
  'Restore latest database backup into the new server',
  'Apply pending migrations and check schema version matches release notes',
  'Rotate API secrets in Key Vault and restart the API',
  'Point DNS for fieldforce.fidson.com at the new front door',
  'Sign in as a test rep and as an RSM, log a visit, approve it',
  'Post the all-clear in the IT incident channel with the recovery time',
];

const CHECKLIST_SEED = [
  { id: 'g1', item: 'All UAT scenarios signed off by business owners', done: false },
  { id: 'g2', item: 'Load test passed at 1M interactions per year', done: true },
  { id: 'g3', item: 'Offline sync stress test passed, no records lost', done: true },
  { id: 'g4', item: 'DR restore drill within RPO and RTO targets', done: true },
  { id: 'g5', item: 'Cold-start rehearsal completed from the runbook', done: false },
  { id: 'g6', item: 'Data imports reconciled against source counts', done: true },
  { id: 'g7', item: 'Support desk staffed and escalation contacts confirmed', done: true },
  { id: 'g8', item: 'Training completed for the first wave', done: false },
];

export default function GoLiveReadiness({ onToast }: AdminScreenProps) {
  const { record } = useAdmin();
  const { notify, banner } = useNotice(onToast);
  const [uat, setUat] = useState<Uat[]>(UAT_SEED);
  const [steps, setSteps] = useState<(string | null)[]>(RUNBOOK.map(() => null));
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [list, setList] = useState(CHECKLIST_SEED);
  const [decision, setDecision] = useState<'Pending' | 'Go' | 'No-go'>('Pending');
  const criticalOpen = 0;

  const signOff = (id: string) => {
    const u = uat.find(x => x.id === id);
    if (!u) return;
    setUat(us => us.map(x => (x.id === id ? { ...x, status: 'Signed off' } : x)));
    record({ area: 'Go-live', what: `UAT: ${u.scenario}`, before: u.status, after: `Signed off by ${u.owner}` });
    notify('UAT scenario signed off', u.scenario);
  };

  const toggleStep = (i: number) => {
    const now = new Date();
    const stamp = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (startedAt === null) setStartedAt(now.getTime());
    const wasDone = !!steps[i];
    setSteps(s => s.map((v, j) => (j === i ? (wasDone ? null : stamp) : v)));
    record({ area: 'Go-live', what: `Cold-start step ${i + 1}: ${RUNBOOK[i]}`, before: wasDone ? 'Done' : 'Not done', after: wasDone ? 'Not done' : `Done ${stamp}` });
    if (!wasDone && steps.filter(Boolean).length === RUNBOOK.length - 1) {
      const mins = startedAt ? Math.max(1, Math.round((now.getTime() - startedAt) / 60000)) : 1;
      setList(l => l.map(x => (x.id === 'g5' ? { ...x, done: true } : x)));
      notify('Cold-start rehearsal complete', `All ${RUNBOOK.length} steps done · recovery time ${mins} min recorded`);
    }
  };

  const toggleCheck = (id: string) => {
    const c = list.find(x => x.id === id);
    if (!c) return;
    setList(l => l.map(x => (x.id === id ? { ...x, done: !x.done } : x)));
    record({ area: 'Go-live', what: `Go/no-go: ${c.item}`, before: c.done ? 'Checked' : 'Open', after: c.done ? 'Open' : 'Checked' });
  };

  const allChecked = list.every(c => c.done);
  const decide = (d: 'Go' | 'No-go') => {
    record({ area: 'Go-live', what: 'Go/no-go decision', before: decision, after: d });
    setDecision(d);
    notify(d === 'Go' ? 'Go decision recorded' : 'No-go recorded', d === 'Go' ? 'Wave 1 can go live on the planned date' : 'Go-live held, owners notified', d === 'Go' ? 'success' : 'info');
  };

  const signed = uat.filter(u => u.status === 'Signed off').length;
  const stepsDone = steps.filter(Boolean).length;

  return (
    <AdminPage title="Go-live Readiness" icon="checkCircle" subtitle="UAT, performance, resilience and the go/no-go call in one place">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="UAT signed off" value={`${signed}/${uat.length}`} tone={signed === uat.length ? 'leaf' : 'amber'} note={signed === uat.length ? 'Complete' : `${uat.length - signed} waiting`} />
        <Stat label="Critical issues open" value={criticalOpen} tone="leaf" note="None blocking go-live" />
        <Stat label="DR restore" value="38 min" tone="leaf" note="RTO target 4 h · RPO 15 min met" />
        <Stat label="Go/no-go items" value={`${list.filter(c => c.done).length}/${list.length}`} tone={allChecked ? 'leaf' : 'amber'} note={decision === 'Pending' ? 'Decision pending' : `Decision: ${decision}`} />
      </div>

      <Card title="UAT scenarios" pad={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px]">
            <thead><tr>{['Scenario', 'Personas', 'Business owner', 'Status', ''].map(h => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-navy-50">
              {uat.map(u => (
                <tr key={u.id}>
                  <td className={`${tdCls} text-ink font-semibold`}>{u.scenario}</td>
                  <td className={tdCls}>{u.persona}</td>
                  <td className={tdCls}>{u.owner}</td>
                  <td className={tdCls}><Badge tone={u.status === 'Signed off' ? 'leaf' : u.status === 'Failed' ? 'rose' : 'amber'}>{u.status}</Badge></td>
                  <td className={`${tdCls} text-right`}>{u.status !== 'Signed off' && <Btn kind="primary" icon="check" onClick={() => signOff(u.id)}>Record sign-off</Btn>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[{ t: 'Load test · production-sized data', rows: LOAD }, { t: 'Offline sync stress test', rows: SYNC }].map(block => (
          <Card key={block.t} title={block.t} pad={false}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px]">
                <thead><tr>{['Measure', 'Threshold', 'Measured', ''].map(h => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-navy-50">
                  {block.rows.map(r => (
                    <tr key={r.metric}>
                      <td className={tdCls}>{r.metric}</td>
                      <td className={`${tdCls} font-mono`}>{r.target}</td>
                      <td className={`${tdCls} font-mono text-ink`}>{r.measured}</td>
                      <td className={tdCls}><Badge tone={r.pass ? 'leaf' : 'rose'}>{r.pass ? 'Pass' : 'Fail'}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))}
      </div>

      <Card title="Disaster recovery restore drill">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {[
            ['RPO target', '15 min'], ['RPO measured', '6 min of data'],
            ['RTO target', '4 h'], ['RTO measured', '38 min'],
          ].map(([l, v]) => (
            <div key={l} className="p-3 rounded-xl bg-paper"><p className="stat-label text-navy-400">{l}</p><p className="font-display font-bold text-ink text-lg mt-0.5">{v}</p></div>
          ))}
        </div>
        <p className="text-xs text-navy-600 mt-3">Drill run 15 Oct 2026 by Kola Adeyemi (Tales Support) with Fidson IT observing. Point-in-time restore of the database to the secondary region, API and web redeployed, sign-in and visit logging verified by a test rep.</p>
      </Card>

      <Card title={`Cold-start rehearsal · runbook console (${stepsDone}/${RUNBOOK.length})`}
        actions={<Btn icon="refresh" onClick={() => { setSteps(RUNBOOK.map(() => null)); setStartedAt(null); notify('Rehearsal reset', 'Ready for a fresh run', 'info'); }}>Reset run</Btn>}>
        <ol className="space-y-1.5">
          {RUNBOOK.map((s, i) => (
            <li key={i}>
              <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer ${steps[i] ? 'bg-leaf-50 border-leaf-200' : 'bg-white border-navy-100 hover:bg-paper'}`}>
                <input type="checkbox" checked={!!steps[i]} onChange={() => toggleStep(i)} className="mt-0.5 w-5 h-5 accent-leaf-600 flex-shrink-0" />
                <span className="flex-1 text-sm text-ink"><span className="font-mono text-navy-400 mr-2">{i + 1}.</span>{s}</span>
                {steps[i] && <span className="font-mono text-[11px] text-leaf-700 flex-shrink-0">{steps[i]}</span>}
              </label>
            </li>
          ))}
        </ol>
      </Card>

      <Card title="Go/no-go checklist" actions={<Badge tone="leaf">Critical issues open: {criticalOpen}</Badge>}>
        <div className="space-y-1.5">
          {list.map(c => (
            <label key={c.id} className="flex items-center gap-3 p-3 rounded-xl border border-navy-100 cursor-pointer hover:bg-paper">
              <input type="checkbox" checked={c.done} onChange={() => toggleCheck(c.id)} className="w-5 h-5 accent-leaf-600 flex-shrink-0" />
              <span className={`text-sm ${c.done ? 'text-navy-500 line-through' : 'text-ink'}`}>{c.item}</span>
            </label>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-navy-500 flex items-center gap-1.5">
            <Icon name={allChecked ? 'checkCircle' : 'alert'} size={14} className={allChecked ? 'text-leaf-600' : 'text-amber-600'} />
            {allChecked ? 'All items checked. The steering group can call go.' : `${list.filter(c => !c.done).length} items still open`}
          </p>
          <div className="flex gap-2">
            <Btn kind="danger" onClick={() => decide('No-go')}>Record no-go</Btn>
            <Btn kind="primary" icon="check" disabled={!allChecked} onClick={() => decide('Go')}>Record go</Btn>
          </div>
        </div>
      </Card>
      {banner}
    </AdminPage>
  );
}
