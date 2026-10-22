import { useState } from 'react';
import Icon from '../Icon';
import { useAdmin } from '../../stores/admin';
import { AdminPage, Card, Btn, Badge, Field, Toggle, useNotice, inputCls, type AdminScreenProps } from './kit';

// AC 5.3 (admin side): approval chains, thresholds, escalation timeouts and delegation, published without a release.
const APPROVERS = ['Auto-approve', 'ASM', 'RSM', 'FSM', 'DM', 'NSM', 'HoM', 'Medical Director', 'Sales Admin'];

interface Step { id: string; condition: string; approvers: string[] }
interface Chain {
  key: string; name: string; measure: string; version: number;
  steps: Step[]; timeoutHours: number; escalateTo: string; delegation: boolean; delegateRule: string; remindAt: number;
}

let seq = 1;
const st = (condition: string, ...approvers: string[]): Step => ({ id: `s${seq++}`, condition, approvers });

const SEED: Chain[] = [
  {
    key: 'discount', name: 'Discount', measure: 'Discount %', version: 3,
    steps: [st('≤ 15%', 'Auto-approve'), st('≤ 20%', 'RSM'), st('> 20%', 'DM', 'NSM')],
    timeoutHours: 24, escalateTo: 'Next approver up', delegation: true, delegateRule: 'When an approver is on leave, their deputy in the same region approves', remindAt: 12,
  },
  {
    key: 'itinerary', name: 'Itinerary adjustment', measure: 'Changes per day', version: 2,
    steps: [st('≤ 2 per day', 'Auto-approve'), st('> 2 per day', 'ASM')],
    timeoutHours: 4, escalateTo: 'RSM', delegation: true, delegateRule: 'ASM deputy approves when the ASM is out of office', remindAt: 2,
  },
  {
    key: 'clinical', name: 'Clinical meeting', measure: 'Budget ₦', version: 1,
    steps: [st('≤ ₦250,000', 'RSM'), st('≤ ₦750,000', 'RSM', 'PM'), st('> ₦750,000', 'PM', 'Medical Director')],
    timeoutHours: 48, escalateTo: 'HoM', delegation: false, delegateRule: 'No delegation · Medical Director must sign personally', remindAt: 24,
  },
  {
    key: 'promo', name: 'Promo', measure: 'Promo value ₦', version: 2,
    steps: [st('≤ ₦500,000', 'FSM'), st('> ₦500,000', 'FSM', 'NSM')],
    timeoutHours: 24, escalateTo: 'Next approver up', delegation: true, delegateRule: 'Deputy FSM approves when the FSM is on leave', remindAt: 12,
  },
];

const describe = (c: Chain) => c.steps.map(s => `${s.condition}: ${s.approvers.join(' → ')}`).join(' | ');

export default function WorkflowBuilder({ onToast }: AdminScreenProps) {
  const { record } = useAdmin();
  const { notify, banner } = useNotice(onToast);
  const [live, setLive] = useState<Chain[]>(SEED);
  const [draft, setDraft] = useState<Chain[]>(SEED);
  const [key, setKey] = useState('discount');

  const chain = draft.find(c => c.key === key)!;
  const liveChain = live.find(c => c.key === key)!;
  const dirty = JSON.stringify(chain) !== JSON.stringify(liveChain);
  const patch = (p: Partial<Chain>) => setDraft(ds => ds.map(c => (c.key === key ? { ...c, ...p } : c)));
  const patchStep = (id: string, p: Partial<Step>) => patch({ steps: chain.steps.map(s => (s.id === id ? { ...s, ...p } : s)) });
  const addApprover = (id: string) => {
    const s = chain.steps.find(x => x.id === id)!;
    patchStep(id, { approvers: [...s.approvers, 'NSM'] });
  };
  const removeApprover = (id: string, idx: number) => {
    const s = chain.steps.find(x => x.id === id)!;
    if (s.approvers.length > 1) patchStep(id, { approvers: s.approvers.filter((_, i) => i !== idx) });
  };

  const publish = () => {
    const v = liveChain.version + 1;
    const next = { ...chain, version: v };
    record({
      area: 'Workflows', what: `${chain.name} approval chain published v${v}`,
      before: `${describe(liveChain)} · escalate after ${liveChain.timeoutHours}h`,
      after: `${describe(chain)} · escalate after ${chain.timeoutHours}h`,
    });
    setLive(ls => ls.map(c => (c.key === key ? next : c)));
    setDraft(ds => ds.map(c => (c.key === key ? next : c)));
    notify(`${chain.name} chain v${v} published`, 'New requests follow it now · requests in flight finish on the old chain');
  };

  return (
    <AdminPage title="Approval Workflows" icon="layers" subtitle="Who approves what, at which threshold, and what happens when nobody answers"
      actions={<>
        <Btn kind="ghost" disabled={!dirty} onClick={() => { setDraft(ds => ds.map(c => (c.key === key ? liveChain : c))); notify('Changes discarded', undefined, 'info'); }}>Discard</Btn>
        <Btn kind="primary" icon="send" disabled={!dirty} onClick={publish}>Publish v{liveChain.version + 1}</Btn>
      </>}>
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5">
        <div className="flex lg:flex-col gap-2 overflow-x-auto" role="tablist" aria-label="Approval chains">
          {draft.map(c => {
            const l = live.find(x => x.key === c.key)!;
            const d = JSON.stringify(c) !== JSON.stringify(l);
            return (
              <button key={c.key} role="tab" aria-selected={key === c.key} onClick={() => setKey(c.key)}
                className={`text-left p-3 rounded-xl border flex-shrink-0 btn-press ${key === c.key ? 'bg-white border-navy-300 ring-1 ring-navy-200' : 'bg-white border-navy-100 hover:bg-paper'}`}>
                <p className="font-display font-semibold text-sm text-ink">{c.name}</p>
                <p className="text-[11px] text-navy-500 mt-0.5">{c.steps.length} steps · v{l.version}</p>
                {d && <span className="mt-1 inline-block"><Badge tone="amber">Draft</Badge></span>}
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          <Card title={<>{chain.name} · steps by {chain.measure}</>} actions={<Btn icon="plus" onClick={() => patch({ steps: [...chain.steps, st('New threshold', 'RSM')] })}>Add step</Btn>} pad={false}>
            <ol className="divide-y divide-navy-50">
              {chain.steps.map((s, i) => (
                <li key={s.id} className="px-4 py-3 flex items-start gap-3 flex-wrap">
                  <span className="w-6 h-6 rounded-full bg-navy-800 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-1">{i + 1}</span>
                  <div className="w-36">
                    <span className="stat-label text-navy-400">When</span>
                    <input value={s.condition} onChange={e => patchStep(s.id, { condition: e.target.value })} aria-label={`Step ${i + 1} threshold`} className={inputCls + ' !py-1.5 mt-1 font-mono text-xs'} />
                  </div>
                  <div className="flex-1 min-w-[220px]">
                    <span className="stat-label text-navy-400">Approved by, in order</span>
                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                      {s.approvers.map((a, ai) => (
                        <span key={ai} className="flex items-center gap-1">
                          {ai > 0 && <Icon name="arrowRight" size={12} className="text-navy-400" />}
                          <select value={a} onChange={e => patchStep(s.id, { approvers: s.approvers.map((x, xi) => (xi === ai ? e.target.value : x)) })}
                            aria-label={`Step ${i + 1} approver ${ai + 1}`}
                            className={`input-field px-2 py-1 rounded-lg border text-xs font-semibold ${a === 'Auto-approve' ? 'bg-leaf-50 border-leaf-200 text-leaf-700' : 'bg-white border-navy-200 text-ink'}`}>
                            {APPROVERS.map(o => <option key={o}>{o}</option>)}
                          </select>
                          {s.approvers.length > 1 && <button onClick={() => removeApprover(s.id, ai)} aria-label="Remove approver" className="text-navy-400 hover:text-rose-600"><Icon name="x" size={12} /></button>}
                        </span>
                      ))}
                      <Btn kind="ghost" icon="plus" onClick={() => addApprover(s.id)}>Approver</Btn>
                    </div>
                  </div>
                  <button onClick={() => patch({ steps: chain.steps.filter(x => x.id !== s.id) })} disabled={chain.steps.length === 1}
                    aria-label={`Remove step ${i + 1}`} className="p-1.5 mt-5 rounded-lg text-rose-600 hover:bg-rose-50 disabled:opacity-30"><Icon name="x" size={14} /></button>
                </li>
              ))}
            </ol>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card title="Escalation">
              <div className="space-y-3">
                <Field label="Escalate if no decision after (hours)">
                  <input type="number" min={1} value={chain.timeoutHours} onChange={e => patch({ timeoutHours: Math.max(1, Number(e.target.value) || 1) })} className={inputCls} />
                </Field>
                <Field label="Reminder to approver after (hours)">
                  <input type="number" min={1} value={chain.remindAt} onChange={e => patch({ remindAt: Math.max(1, Number(e.target.value) || 1) })} className={inputCls} />
                </Field>
                <Field label="Escalate to">
                  <select value={chain.escalateTo} onChange={e => patch({ escalateTo: e.target.value })} className={inputCls}>
                    {['Next approver up', 'RSM', 'DM', 'NSM', 'HoM'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </Field>
              </div>
            </Card>
            <Card title="Delegation">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-ink">
                  <Toggle on={chain.delegation} onChange={v => patch({ delegation: v })} label="Allow delegation" /> Allow approvers to delegate
                </div>
                <Field label="Rule">
                  <textarea rows={3} value={chain.delegateRule} onChange={e => patch({ delegateRule: e.target.value })} disabled={!chain.delegation}
                    className={inputCls + ' resize-none disabled:opacity-50'} />
                </Field>
                <p className="text-[11px] text-navy-500">Delegated approvals are recorded under both names in the approval history.</p>
              </div>
            </Card>
          </div>

          <Card title="How a request moves">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-paper border border-navy-100 font-semibold">Rep submits</span>
              {chain.steps.map(s => (
                <span key={s.id} className="flex items-center gap-2">
                  <Icon name="arrowRight" size={12} className="text-navy-400" />
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-navy-200"><span className="font-mono text-navy-500">{s.condition}</span> · <b className="text-ink">{s.approvers.join(' → ')}</b></span>
                </span>
              ))}
              <Icon name="arrowRight" size={12} className="text-navy-400" />
              <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">No answer in {chain.timeoutHours}h: {chain.escalateTo}</span>
            </div>
          </Card>
        </div>
      </div>
      {banner}
    </AdminPage>
  );
}
