import { useCallback, useState } from 'react';
import Icon from '../Icon';
import { AdminPage, Badge, Btn, Card, Field, Modal, inputCls, useNotice, type AdminScreenProps } from './kit';
import { useAdmin } from '../../stores/admin';

// AC 6.7 territory editor: division › region › area › territory, rep assignment, customer moves.
interface Terr { id: string; division: string; region: string; area: string; name: string; repId: string | null; customers: string[] }

const SEED: Terr[] = [
  { id: 't1', division: 'Institution', region: 'Lagos', area: 'Lagos Island', name: 'Lekki Cluster', repId: 'p05', customers: ['Lakeshore Specialist Hospital', 'Evercare Hospital Lekki', 'Dr. Amaka Obi'] },
  { id: 't2', division: 'Institution', region: 'Lagos', area: 'Lagos Island', name: 'V.I. Cluster', repId: 'p06', customers: ['Reddington Hospital', 'First Cardiology Consultants'] },
  { id: 't3', division: 'Institution', region: 'Lagos', area: 'Lagos Mainland', name: 'Mainland Cluster', repId: 'p07', customers: ['LUTH Idi-Araba', 'Eko Hospital Ikeja', 'MedPlus Yaba'] },
  { id: 't4', division: 'Institution', region: 'Oyo', area: 'Ibadan', name: 'Ibadan North', repId: 'p10', customers: ['UCH Ibadan', 'Adeoyo Maternity Hospital'] },
  { id: 't5', division: 'Institution', region: 'Oyo', area: 'Ibadan', name: 'Ibadan South', repId: null, customers: ['Oluyoro Catholic Hospital'] },
  { id: 't6', division: 'Trade', region: 'Lagos', area: 'Lagos Mainland', name: 'Surulere', repId: 'p08', customers: ['HealthPlus Surulere', 'Alpha Pharmacy Ojuelegba'] },
  { id: 't7', division: 'Trade', region: 'Lagos', area: 'Apapa', name: 'Lagos Trade', repId: null, customers: ['WestEnd Distributors Ltd', 'Idumota Wholesale Hub'] },
  { id: 't8', division: 'HCP', region: 'FCT', area: 'Abuja', name: 'Abuja Central', repId: null, customers: ['National Hospital Abuja', 'Garki Hospital'] },
];

export default function Territories({ onToast }: AdminScreenProps) {
  const { people, record } = useAdmin();
  const { notify, banner } = useNotice(onToast);
  const [terrs, setTerrs] = useState<Terr[]>(SEED);
  const [selId, setSelId] = useState('t1');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [moving, setMoving] = useState<string | null>(null);
  const [target, setTarget] = useState('');
  const closeMove = useCallback(() => setMoving(null), []);

  const sel = terrs.find(t => t.id === selId) ?? terrs[0];
  const reps = people.filter(p => p.active && p.role === 'Medical Rep');
  const nameOf = (id: string | null) => people.find(p => p.id === id)?.name ?? 'Vacant';

  const tree: Record<string, Record<string, Record<string, Terr[]>>> = {};
  terrs.forEach(t => {
    tree[t.division] ??= {};
    tree[t.division][t.region] ??= {};
    (tree[t.division][t.region][t.area] ??= []).push(t);
  });

  const assignRep = (repId: string) => {
    const before = nameOf(sel.repId);
    setTerrs(ts => ts.map(t => (t.id === sel.id ? { ...t, repId: repId || null } : t)));
    record({ area: 'Territories', what: `Rep for ${sel.name}`, before, after: nameOf(repId || null) });
    notify(`${sel.name} reassigned`, `${before} → ${nameOf(repId || null)} · customers stay with the territory`);
  };

  const move = () => {
    if (!moving || !target) return;
    const to = terrs.find(t => t.id === target)!;
    setTerrs(ts => ts.map(t =>
      t.id === sel.id ? { ...t, customers: t.customers.filter(c => c !== moving) }
        : t.id === target ? { ...t, customers: [...t.customers, moving] } : t));
    record({ area: 'Territories', what: `${moving} moved`, before: sel.name, after: to.name });
    notify(`${moving} moved`, `${sel.name} → ${to.name} · history moves with the account`);
    setMoving(null);
    setTarget('');
  };

  const toggle = (k: string) => setCollapsed(c => ({ ...c, [k]: !c[k] }));
  const node = (k: string, label: string, depth: number) => (
    <button key={k} onClick={() => toggle(k)} aria-expanded={!collapsed[k]} style={{ paddingLeft: depth * 14 + 8 }}
      className="w-full flex items-center gap-1.5 py-1.5 pr-2 text-left text-xs font-bold text-navy-600 hover:bg-navy-50 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400">
      <Icon name={collapsed[k] ? 'chevronRight' : 'chevronDown'} size={12} />{label}
    </button>
  );

  return (
    <AdminPage title="Territories" subtitle="Division › region › area › territory · assign reps and move customers without a release" icon="map">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card title="Territory tree" className="lg:col-span-2">
          <div className="space-y-0.5" role="tree">
            {Object.entries(tree).map(([div, regions]) => (
              <div key={div}>
                {node(div, `${div} division`, 0)}
                {!collapsed[div] && Object.entries(regions).map(([reg, areas]) => (
                  <div key={reg}>
                    {node(`${div}/${reg}`, `${reg} region`, 1)}
                    {!collapsed[`${div}/${reg}`] && Object.entries(areas).map(([area, ts]) => (
                      <div key={area}>
                        {node(`${div}/${reg}/${area}`, `${area} area`, 2)}
                        {!collapsed[`${div}/${reg}/${area}`] && ts.map(t => (
                          <button key={t.id} onClick={() => setSelId(t.id)} role="treeitem" aria-selected={t.id === sel.id} style={{ paddingLeft: 3 * 14 + 8 }}
                            className={`w-full flex items-center justify-between gap-2 py-1.5 pr-2 rounded-md text-left text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400 ${t.id === sel.id ? 'bg-navy-800 text-white' : 'text-ink hover:bg-paper'}`}>
                            <span className="flex items-center gap-1.5 font-semibold"><Icon name="location" size={12} />{t.name}</span>
                            <span className={`text-[10px] ${t.id === sel.id ? 'text-navy-200' : t.repId ? 'text-navy-400' : 'text-rose-600 font-bold'}`}>{nameOf(t.repId)}</span>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Card>

        <div className="lg:col-span-3 space-y-4">
          <Card title={sel.name} actions={sel.repId ? <Badge tone="leaf">Covered</Badge> : <Badge tone="rose">Vacant</Badge>}>
            <p className="text-xs text-navy-500">{sel.division} division · {sel.region} region · {sel.area} area</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <Field label="Assigned rep">
                <select className={inputCls} value={sel.repId ?? ''} onChange={e => assignRep(e.target.value)}>
                  <option value="">Vacant</option>
                  {reps.map(r => <option key={r.id} value={r.id}>{r.name} · {r.territory}</option>)}
                </select>
              </Field>
              <div className="p-3 rounded-xl bg-paper text-xs text-navy-600">
                Customers belong to the territory. When a rep changes, the new rep inherits every account and its full history.
              </div>
            </div>
          </Card>

          <Card title={`Customers in ${sel.name} (${sel.customers.length})`} pad={false}>
            <ul className="divide-y divide-navy-50">
              {sel.customers.map(c => (
                <li key={c} className="px-4 sm:px-5 py-2.5 flex items-center justify-between gap-2">
                  <span className="text-sm text-ink font-semibold">{c}</span>
                  <Btn icon="arrowRight" onClick={() => { setMoving(c); setTarget(''); }}>Move</Btn>
                </li>
              ))}
              {!sel.customers.length && <li className="px-5 py-6 text-center text-sm text-navy-400">No customers in this territory.</li>}
            </ul>
          </Card>
        </div>
      </div>

      <Modal open={!!moving} title={`Move ${moving ?? ''}`} onClose={closeMove}
        footer={<><Btn onClick={closeMove}>Cancel</Btn><Btn kind="primary" icon="check" disabled={!target} onClick={move}>Move customer</Btn></>}>
        <p className="text-xs text-navy-500">From {sel.name}. Visits, orders and open commitments move with the account.</p>
        <Field label="Move to territory">
          <select className={inputCls} value={target} onChange={e => setTarget(e.target.value)}>
            <option value="">Choose a territory</option>
            {terrs.filter(t => t.id !== sel.id).map(t => <option key={t.id} value={t.id}>{t.name} · {t.division} · {t.region}</option>)}
          </select>
        </Field>
      </Modal>
      {banner}
    </AdminPage>
  );
}
