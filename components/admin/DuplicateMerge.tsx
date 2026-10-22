import { useState } from 'react';
import Icon from '../Icon';
import { AdminPage, Badge, Btn, Card, useNotice, type AdminScreenProps } from './kit';
import { useAdmin } from '../../stores/admin';

// AC 4.2 admin tooling: review suspected duplicate contacts, pick surviving fields, merge.
const FIELDS = ['Name', 'Specialty', 'Institution', 'Phone', 'Email', 'Territory', 'Consent'] as const;
type FieldKey = typeof FIELDS[number];
interface Rec { id: string; values: Record<FieldKey, string>; visits: number; source: string }
interface Pair { id: string; score: number; reason: string; a: Rec; b: Rec; status: 'open' | 'merged' | 'distinct' }

const SEED: Pair[] = [
  {
    id: 'd1', score: 94, reason: 'Same phone, similar name', status: 'open',
    a: { id: 'HCP-10442', source: 'Rep capture · Adaeze Okafor', visits: 14, values: { Name: 'Dr. Amaka Obi', Specialty: 'Paediatrics', Institution: 'Lakeshore Specialist Hospital', Phone: '+234 806 789 0123', Email: 'a.obi@lakeshore.ng', Territory: 'Lekki Cluster', Consent: 'Opted in · 12 Mar' } },
    b: { id: 'HCP-11807', source: 'Legacy import', visits: 3, values: { Name: 'Dr. A. Obi', Specialty: 'Paediatrics', Institution: 'Lakeshore Hospital', Phone: '+234 806 789 0123', Email: '', Territory: 'Lekki Cluster', Consent: 'Unknown' } },
  },
  {
    id: 'd2', score: 88, reason: 'Same email, different institution', status: 'open',
    a: { id: 'HCP-09215', source: 'Legacy import', visits: 9, values: { Name: 'Dr. Femi Coker', Specialty: 'Internal Medicine', Institution: 'Reddington Hospital', Phone: '+234 802 345 6789', Email: 'f.coker@reddington.ng', Territory: 'V.I. Cluster', Consent: 'Opted in · 02 Feb' } },
    b: { id: 'HCP-12033', source: 'Rep capture · Bayo Salami', visits: 2, values: { Name: 'Dr. Olufemi Coker', Specialty: 'Internal Medicine', Institution: 'Reddington Hospital, Ikeja', Phone: '+234 802 345 6790', Email: 'f.coker@reddington.ng', Territory: 'Mainland Cluster', Consent: 'Opted in · 18 Sep' } },
  },
  {
    id: 'd3', score: 76, reason: 'Similar name, same institution', status: 'open',
    a: { id: 'CUS-20311', source: 'Legacy import', visits: 21, values: { Name: 'Mrs. Bisi Adeyemi', Specialty: 'Pharmacist', Institution: 'MedPlus Yaba', Phone: '+234 803 456 7890', Email: 'orders@medplus-yaba.ng', Territory: 'Mainland Cluster', Consent: 'Opted in · 10 Jan' } },
    b: { id: 'CUS-21588', source: 'Rep capture · Tope Adeola', visits: 1, values: { Name: 'Bisi Adeyemi', Specialty: 'Branch Pharmacist', Institution: 'MedPlus Pharmacy Yaba', Phone: '+234 809 112 4410', Email: '', Territory: 'Mainland Cluster', Consent: 'Opted in · 20 Oct' } },
  },
];

export default function DuplicateMerge({ onToast }: AdminScreenProps) {
  const { record } = useAdmin();
  const { notify, banner } = useNotice(onToast);
  const [pairs, setPairs] = useState<Pair[]>(SEED);
  const [selId, setSelId] = useState(SEED[0].id);
  const [pick, setPick] = useState<Record<string, Record<FieldKey, 'a' | 'b'>>>({});

  const sel = pairs.find(p => p.id === selId) ?? pairs[0];
  const open = pairs.filter(p => p.status === 'open').length;
  const choiceFor = (p: Pair, f: FieldKey): 'a' | 'b' => pick[p.id]?.[f] ?? (p.a.values[f] ? 'a' : 'b');
  const choose = (f: FieldKey, side: 'a' | 'b') => setPick(pk => ({ ...pk, [sel.id]: { ...(pk[sel.id] ?? {} as Record<FieldKey, 'a' | 'b'>), [f]: side } }));

  const nextOpen = (afterId: string) => pairs.find(p => p.status === 'open' && p.id !== afterId)?.id ?? afterId;

  const merge = () => {
    const survivor = FIELDS.map(f => sel[choiceFor(sel, f)].values[f]);
    const name = survivor[0];
    setPairs(ps => ps.map(p => (p.id === sel.id ? { ...p, status: 'merged' } : p)));
    record({ area: 'Duplicates', what: `Merged ${sel.b.id} into ${sel.a.id}`, before: `2 records · ${sel.a.values.Name} / ${sel.b.values.Name}`, after: `1 record · ${name} · ${sel.a.visits + sel.b.visits} visits kept` });
    notify(`Merged into ${name}`, `${sel.a.visits + sel.b.visits} visits and all orders kept on ${sel.a.id}`);
    setSelId(nextOpen(sel.id));
  };

  const distinct = () => {
    setPairs(ps => ps.map(p => (p.id === sel.id ? { ...p, status: 'distinct' } : p)));
    record({ area: 'Duplicates', what: `${sel.a.id} and ${sel.b.id} marked as different people`, before: 'Suspected duplicate', after: 'Not a duplicate' });
    notify('Marked as different people', 'This pair will not be suggested again', 'info');
    setSelId(nextOpen(sel.id));
  };

  const side = (s: 'a' | 'b') => {
    const r = sel[s];
    return (
      <div className="min-w-0">
        <p className="font-mono text-[11px] font-bold text-navy-500">{r.id}</p>
        <p className="text-[11px] text-navy-400">{r.source} · {r.visits} visits</p>
      </div>
    );
  };

  return (
    <AdminPage title="Duplicate Contacts" subtitle="Suspected duplicates found by the nightly match · choose the fields that survive, then merge" icon="layers">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card title={`Queue · ${open} open`} pad={false} className="lg:col-span-1">
          <ul className="divide-y divide-navy-50">
            {pairs.map(p => (
              <li key={p.id}>
                <button onClick={() => setSelId(p.id)} aria-current={p.id === sel.id}
                  className={`w-full text-left px-4 py-3 focus:outline-none focus-visible:bg-navy-50 ${p.id === sel.id ? 'bg-navy-50' : 'hover:bg-paper'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink truncate">{p.a.values.Name}</p>
                    {p.status === 'open' ? <Badge tone={p.score >= 90 ? 'rose' : 'amber'}>{p.score}%</Badge>
                      : p.status === 'merged' ? <Badge tone="leaf">Merged</Badge> : <Badge tone="muted">Distinct</Badge>}
                  </div>
                  <p className="text-[11px] text-navy-500 mt-0.5">{p.reason}</p>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="lg:col-span-3" title={`${sel.a.values.Name} · ${sel.b.values.Name}`}
          actions={sel.status === 'open'
            ? <><Btn onClick={distinct}>Not a duplicate</Btn><Btn kind="primary" icon="check" onClick={merge}>Merge</Btn></>
            : <Badge tone={sel.status === 'merged' ? 'leaf' : 'muted'}><Icon name="checkCircle" size={11} /> {sel.status === 'merged' ? 'Merged' : 'Kept separate'}</Badge>}>
          <div className="overflow-x-auto">
            <div className="min-w-[560px]">
              <div className="grid grid-cols-[110px_1fr_1fr] gap-2 pb-2 border-b border-navy-100">
                <span className="stat-label text-navy-400 self-end">Field</span>
                {side('a')}
                {side('b')}
              </div>
              <div role="radiogroup" aria-label="Surviving fields" className="divide-y divide-navy-50">
                {FIELDS.map(f => {
                  const c = choiceFor(sel, f);
                  const same = sel.a.values[f] === sel.b.values[f];
                  return (
                    <div key={f} className="grid grid-cols-[110px_1fr_1fr] gap-2 py-1.5 items-center">
                      <span className="text-xs font-bold text-navy-600">{f}{!same && <span className="ml-1 text-amber-600">•</span>}</span>
                      {(['a', 'b'] as const).map(s => {
                        const v = sel[s].values[f];
                        const on = c === s;
                        return (
                          <button key={s} role="radio" aria-checked={on} disabled={sel.status !== 'open' || same}
                            onClick={() => choose(f, s)}
                            className={`text-left px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400 ${on ? 'border-leaf-300 bg-leaf-50 text-ink font-semibold' : 'border-navy-100 text-navy-500 hover:bg-paper'} ${same ? 'opacity-70' : ''}`}>
                            <span className={`w-3 h-3 rounded-full border flex-shrink-0 ${on ? 'border-leaf-500 bg-leaf-500' : 'border-navy-300'}`} />
                            <span className="truncate">{v || <em className="text-navy-300">empty</em>}</span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-navy-500">The record on the left keeps its ID. Visits, orders, samples and consent history from both records move to it. Fields marked • differ between the two.</p>
        </Card>
      </div>
      {banner}
    </AdminPage>
  );
}
