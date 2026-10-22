import { useState } from 'react';
import Icon from '../Icon';
import { useAdmin } from '../../stores/admin';
import { AdminPage, Card, Btn, Badge, Stat, useNotice, inputCls, thCls, tdCls, type AdminScreenProps } from './kit';

// AC 8.6: admins write alert and recommendation rules in plain language, check them against history, then publish.
type Kind = 'no-visit' | 'discount' | 'stock' | 'commitment' | 'unknown';
interface Parsed { kind: Kind; recipient: string; tier: string | null; channel: string | null; n: number | null; action: 'Alert' | 'Recommend' }
type Status = 'Live' | 'Draft' | 'Disabled';
interface Rule { id: string; text: string; status: Status; firedLast30: number }
interface Hit { account: string; date: string; recipient: string; detail: string }

const SEED: Rule[] = [
  { id: 'r1', text: 'Alert the ASM when an A-tier account has no visit in 21 days', status: 'Live', firedLast30: 14 },
  { id: 'r2', text: 'Alert the RSM when a discount request is above 18%', status: 'Live', firedLast30: 9 },
  { id: 'r3', text: 'Recommend a reorder visit to the rep when a Trade outlet has stock below 2 weeks', status: 'Live', firedLast30: 31 },
  { id: 'r4', text: 'Alert the DM when an open commitment is older than 14 days', status: 'Draft', firedLast30: 0 },
  { id: 'r5', text: 'Alert the RSM when a B-tier Institution account has no visit in 30 days', status: 'Disabled', firedLast30: 0 },
];

const ACCOUNTS: { name: string; tier: string; channel: string; rep: string; asm: string }[] = [
  { name: 'Lakeshore Specialist Hospital', tier: 'A', channel: 'Institution', rep: 'Adaeze Okafor', asm: 'Femi Ogunleye' },
  { name: 'Reddington Hospital', tier: 'A', channel: 'Institution', rep: 'Bayo Salami', asm: 'Femi Ogunleye' },
  { name: 'WestEnd Distributors Ltd', tier: 'A', channel: 'Trade', rep: 'Yetunde Cole', asm: 'Ibrahim Musa' },
  { name: 'MedPlus Yaba', tier: 'B', channel: 'Trade', rep: 'Tope Adeola', asm: 'Femi Ogunleye' },
  { name: 'HealthPlus Surulere', tier: 'B', channel: 'Trade', rep: 'Yetunde Cole', asm: 'Ibrahim Musa' },
  { name: 'University College Hospital, Ibadan', tier: 'A', channel: 'Institution', rep: 'Segun Ajayi', asm: 'Funke Oladipo' },
  { name: 'Eko Hospital, Ikeja', tier: 'B', channel: 'Institution', rep: 'Tope Adeola', asm: 'Femi Ogunleye' },
  { name: 'National Hospital Abuja', tier: 'A', channel: 'Institution', rep: 'Emeka Nwosu', asm: 'Hauwa Bello' },
  { name: 'Alpha Pharmacy, Ibadan', tier: 'C', channel: 'Trade', rep: 'Segun Ajayi', asm: 'Funke Oladipo' },
  { name: 'Dr. Amaka Obi', tier: 'A', channel: 'HCP', rep: 'Adaeze Okafor', asm: 'Femi Ogunleye' },
  { name: 'Garki Hospital', tier: 'B', channel: 'Institution', rep: 'Emeka Nwosu', asm: 'Hauwa Bello' },
  { name: 'Bola Pharmacy, Lekki', tier: 'B', channel: 'Trade', rep: 'Adaeze Okafor', asm: 'Femi Ogunleye' },
];
const MANAGER: Record<string, string> = { RSM: 'Tunde Bakare', DM: 'Chioma Eze', NSM: 'Kunle Adebayo', FSM: 'Ibrahim Musa', PM: 'Product Manager' };

export function parseRule(text: string): Parsed {
  const t = text.toLowerCase();
  const rm = t.match(/\b(asm|rsm|dm|nsm|fsm|pm|rep)\b/);
  const recipient = rm ? (rm[1] === 'rep' ? 'Rep' : rm[1].toUpperCase()) : 'Rep';
  const tm = t.match(/\b([abc])[- ]tier\b/) || t.match(/\btier ([abc])\b/);
  const cm = t.match(/\b(institution|trade|hcp)\b/);
  const num = t.match(/(\d+)\s*(%|days?|weeks?)/);
  const n = num ? Number(num[1]) : null;
  const kind: Kind = /no visit|not visited|unvisited/.test(t) ? 'no-visit'
    : /discount/.test(t) ? 'discount'
      : /stock/.test(t) ? 'stock'
        : /commitment/.test(t) ? 'commitment' : 'unknown';
  return {
    kind, recipient, n,
    tier: tm ? tm[1].toUpperCase() : null,
    channel: cm ? cm[1][0].toUpperCase() + cm[1].slice(1) : null,
    action: /recommend|suggest/.test(t) ? 'Recommend' : 'Alert',
  };
}

const KIND_LABEL: Record<Kind, string> = {
  'no-visit': 'Days since last visit', discount: 'Discount requested', stock: 'Weeks of stock at outlet', commitment: 'Age of open commitment', unknown: 'Not recognised',
};

const hash = (s: string) => Array.from(s).reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

function dryRun(p: Parsed, text: string): Hit[] {
  if (p.kind === 'unknown' || p.n === null) return [];
  const n = p.n;
  const pool = ACCOUNTS.filter(a => (!p.tier || a.tier === p.tier) && (!p.channel || a.channel === p.channel));
  const hits: Hit[] = [];
  let h = hash(text);
  const today = new Date();
  for (let day = 89; day >= 0; day--) {
    for (const a of pool) {
      h = (h * 1103515245 + 12345) >>> 0;
      const r = (h % 1000) / 1000;
      const strictness = p.kind === 'no-visit' ? Math.min(0.03, 0.6 / Math.max(n, 1)) : p.kind === 'discount' ? Math.max(0.002, (30 - n) / 900) : p.kind === 'stock' ? 0.004 * n : 0.25 / Math.max(n, 1);
      if (r >= strictness) continue;
      const d = new Date(today);
      d.setDate(d.getDate() - day);
      const who = p.recipient === 'Rep' ? a.rep : p.recipient === 'ASM' ? a.asm : MANAGER[p.recipient] ?? p.recipient;
      const detail = p.kind === 'no-visit' ? `${n + (h % 9)} days since last visit`
        : p.kind === 'discount' ? `${n + 1 + (h % 6)}% requested on ₦${(120 + (h % 500)) * 1000}`.replace(/(\d)(?=(\d{3})+$)/g, '$1,')
          : p.kind === 'stock' ? `${(n * 0.5 + (h % 3) * 0.3).toFixed(1)} weeks of Coflin Forte 600mg left`
            : `Commitment open ${n + (h % 10)} days`;
      hits.push({ account: a.name, date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }), recipient: `${p.recipient} · ${who}`, detail });
    }
  }
  return hits.reverse();
}

export default function RulesStudio({ onToast }: AdminScreenProps) {
  const { record } = useAdmin();
  const { notify, banner } = useNotice(onToast);
  const [rules, setRules] = useState<Rule[]>(SEED);
  const [selId, setSelId] = useState<string>('r1');
  const [text, setText] = useState(SEED[0].text);
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [running, setRunning] = useState(false);

  const sel = rules.find(r => r.id === selId) ?? null;
  const parsed = parseRule(text);
  const understood = parsed.kind !== 'unknown' && parsed.n !== null;

  const pick = (r: Rule) => { setSelId(r.id); setText(r.text); setHits(null); };
  const startNew = () => { setSelId(''); setText(''); setHits(null); };

  const run = () => {
    setRunning(true);
    setHits(null);
    setTimeout(() => {
      const res = dryRun(parsed, text);
      setHits(res);
      setRunning(false);
      notify('Dry run finished', `${res.length} alerts would have fired in the last 90 days`, 'info');
    }, 700);
  };

  const save = (status: Status) => {
    const before = sel ? `${sel.status} · "${sel.text}"` : 'None';
    if (sel) {
      setRules(rs => rs.map(r => (r.id === sel.id ? { ...r, text, status } : r)));
    } else {
      const id = `r${Date.now()}`;
      setRules(rs => [{ id, text, status, firedLast30: 0 }, ...rs]);
      setSelId(id);
    }
    record({ area: 'Rules', what: `Rule ${status === 'Live' ? 'published' : status === 'Disabled' ? 'disabled' : 'saved as draft'}`, before, after: `${status} · "${text}"` });
    notify(status === 'Live' ? 'Rule published' : status === 'Disabled' ? 'Rule disabled' : 'Draft saved', status === 'Live' ? 'Checked every night at 02:00 against the day\'s data' : undefined);
  };

  const counts = hits ? {
    accounts: new Set(hits.map(h => h.account)).size,
    recipients: new Set(hits.map(h => h.recipient)).size,
    perWeek: (hits.length / 13).toFixed(1),
  } : null;

  return (
    <AdminPage title="Rules Studio" icon="sparkles" subtitle="Alert and recommendation rules in plain language · test against the last 90 days before they go live"
      actions={<Btn icon="plus" onClick={startNew}>New rule</Btn>}>
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
        <Card title="Rules" pad={false}>
          <ul className="divide-y divide-navy-50">
            {rules.map(r => (
              <li key={r.id}>
                <button onClick={() => pick(r)} className={`w-full text-left px-4 py-3 hover:bg-paper focus:outline-none focus-visible:bg-leaf-50 ${selId === r.id ? 'bg-leaf-50/60' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge tone={r.status === 'Live' ? 'leaf' : r.status === 'Draft' ? 'amber' : 'muted'}>{r.status}</Badge>
                    {r.status === 'Live' && <span className="text-[10px] text-navy-400">fired {r.firedLast30}× in 30 days</span>}
                  </div>
                  <p className="text-xs text-ink leading-snug">{r.text}</p>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-4">
          <Card title={sel ? 'Edit rule' : 'New rule'}>
            <label className="block">
              <span className="stat-label text-navy-500">Write the rule</span>
              <textarea rows={2} value={text} onChange={e => { setText(e.target.value); setHits(null); }}
                placeholder="Alert the ASM when an A-tier account has no visit in 21 days" className={inputCls + ' mt-1 resize-none'} />
            </label>
            <div className={`mt-3 p-3 rounded-xl border text-xs ${understood ? 'bg-paper border-navy-100' : 'bg-amber-50 border-amber-200'}`}>
              <p className="stat-label text-navy-500 mb-2">How FieldForce reads it</p>
              {understood ? (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    ['Action', parsed.action],
                    ['Sent to', parsed.recipient],
                    ['Measure', KIND_LABEL[parsed.kind]],
                    ['Threshold', `${parsed.kind === 'stock' ? 'below' : 'over'} ${parsed.n}${parsed.kind === 'discount' ? '%' : parsed.kind === 'stock' ? ' weeks' : ' days'}`],
                    ['Applies to', [parsed.tier && `Tier ${parsed.tier}`, parsed.channel].filter(Boolean).join(' · ') || 'All accounts'],
                  ].map(([k, v]) => (
                    <div key={k}><p className="text-[10px] text-navy-400">{k}</p><p className="font-semibold text-ink">{v}</p></div>
                  ))}
                </div>
              ) : (
                <p className="text-amber-800 flex items-center gap-1.5"><Icon name="alert" size={14} /> Not understood yet. Name who gets it (ASM, RSM, rep), what to watch (no visit, discount, stock, commitment) and a number.</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <Btn icon="refresh" onClick={run} disabled={!understood || running}>{running ? 'Running...' : 'Dry run · last 90 days'}</Btn>
              <Btn onClick={() => save('Draft')} disabled={!text.trim()}>Save draft</Btn>
              {sel?.status === 'Live'
                ? <Btn kind="danger" icon="xCircle" onClick={() => save('Disabled')}>Disable</Btn>
                : <Btn kind="primary" icon="send" onClick={() => save('Live')} disabled={!understood || !hits}>Publish</Btn>}
            </div>
            {!hits && understood && sel?.status !== 'Live' && <p className="text-[11px] text-navy-500 mt-2">Run a dry run before publishing.</p>}
          </Card>

          {hits && counts && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Stat label="Would have fired" value={hits.length} note="last 90 days" tone={hits.length > 150 ? 'rose' : 'leaf'} />
                <Stat label="Accounts" value={counts.accounts} note="distinct accounts" />
                <Stat label="Recipients" value={counts.recipients} note="people notified" />
                <Stat label="Per week" value={counts.perWeek} note={hits.length > 150 ? 'too noisy · tighten it' : 'manageable volume'} tone={hits.length > 150 ? 'rose' : 'amber'} />
              </div>
              <Card title="What it would have fired on" pad={false}>
                <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
                  <table className="w-full min-w-[640px]">
                    <thead className="sticky top-0"><tr><th className={thCls}>Date</th><th className={thCls}>Account</th><th className={thCls}>Why</th><th className={thCls}>Recipient</th></tr></thead>
                    <tbody className="divide-y divide-navy-50">
                      {hits.map((h, i) => (
                        <tr key={i} className="hover:bg-paper">
                          <td className={tdCls + ' font-mono whitespace-nowrap'}>{h.date}</td>
                          <td className={tdCls + ' font-semibold text-ink'}>{h.account}</td>
                          <td className={tdCls}>{h.detail}</td>
                          <td className={tdCls + ' whitespace-nowrap'}>{h.recipient}</td>
                        </tr>
                      ))}
                      {!hits.length && <tr><td colSpan={4} className="px-3 py-8 text-center text-sm text-navy-500">Nothing would have fired. The threshold may be too strict.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
      {banner}
    </AdminPage>
  );
}
