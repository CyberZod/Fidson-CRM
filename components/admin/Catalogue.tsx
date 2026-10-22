import { useCallback, useState } from 'react';
import { AdminPage, Badge, Btn, Card, Field, Modal, SearchBox, inputCls, tdCls, thCls, useNotice, type AdminScreenProps } from './kit';
import { useAdmin } from '../../stores/admin';

// AC 6.7 product catalogue and product-to-manager assignment.
type Detailing = 'Focus' | 'Active' | 'Paused';
interface Sku { id: string; sku: string; name: string; pack: string; price: number; channels: string[]; detailing: Detailing; managers: string[] }

const CHANNELS = ['Institution', 'Trade', 'HCP', 'Consumer'];
const DETAILING: Detailing[] = ['Focus', 'Active', 'Paused'];

const SEED: Sku[] = [
  { id: 's1', sku: 'FID-COF-600', name: 'Coflin Forte 600mg', pack: '10 x 10 tablets', price: 4500, channels: ['Institution', 'HCP'], detailing: 'Focus', managers: ['p03', 'p04'] },
  { id: 's2', sku: 'FID-AST-010', name: 'Astrazon 10mg', pack: '3 x 10 tablets', price: 2850, channels: ['Institution', 'Trade', 'HCP'], detailing: 'Active', managers: ['p11'] },
  { id: 's3', sku: 'FID-TUX-100', name: 'Tuxil-N Syrup 100ml', pack: '1 bottle', price: 1650, channels: ['Trade', 'Consumer'], detailing: 'Active', managers: ['p09'] },
  { id: 's4', sku: 'FID-CIP-500', name: 'Ciprofidson 500mg', pack: '1 x 10 tablets', price: 2200, channels: ['Institution', 'Trade'], detailing: 'Active', managers: ['p03'] },
  { id: 's5', sku: 'FID-AML-005', name: 'Amlofid 5mg', pack: '3 x 10 tablets', price: 1900, channels: ['Institution', 'HCP'], detailing: 'Paused', managers: [] },
  { id: 's6', sku: 'FID-VIT-C1K', name: 'Fidson Vitamin C 1000mg', pack: '20 effervescent tablets', price: 3100, channels: ['Trade', 'Consumer'], detailing: 'Active', managers: ['p09'] },
];

const EMPTY: Omit<Sku, 'id' | 'managers'> = { sku: '', name: '', pack: '', price: 0, channels: ['Institution'], detailing: 'Active' };
const naira = (n: number) => `₦${n.toLocaleString()}`;
const TONE: Record<Detailing, 'leaf' | 'sky' | 'muted'> = { Focus: 'leaf', Active: 'sky', Paused: 'muted' };

export default function Catalogue({ onToast }: AdminScreenProps) {
  const { people, record } = useAdmin();
  const { notify, banner } = useNotice(onToast);
  const [skus, setSkus] = useState<Sku[]>(SEED);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<Sku | 'new' | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [assignFor, setAssignFor] = useState<Sku | null>(null);
  const [assignSel, setAssignSel] = useState<string[]>([]);
  const closeEdit = useCallback(() => setEditing(null), []);
  const closeAssign = useCallback(() => setAssignFor(null), []);

  const managers = people.filter(p => p.active && ['ASM', 'RSM', 'FSM', 'DM', 'PM'].includes(p.role));
  const nameOf = (id: string) => people.find(p => p.id === id)?.name ?? id;
  const shown = skus.filter(s => `${s.sku} ${s.name}`.toLowerCase().includes(q.toLowerCase()));

  const open = (s: Sku | 'new') => {
    setEditing(s);
    setForm(s === 'new' ? EMPTY : { sku: s.sku, name: s.name, pack: s.pack, price: s.price, channels: s.channels, detailing: s.detailing });
  };

  const save = () => {
    if (!form.sku.trim() || !form.name.trim() || form.price <= 0) {
      notify('SKU, name and a price above zero are required', undefined, 'error');
      return;
    }
    if (editing === 'new') {
      setSkus(ss => [...ss, { ...form, id: `s-${Date.now()}`, managers: [] }]);
      record({ area: 'Catalogue', what: `Added ${form.name}`, before: 'None', after: `${form.sku} · ${form.pack} · ${naira(form.price)}` });
      notify(`${form.name} added`, 'Available to reps on next sync');
    } else if (editing) {
      const diffs: string[][] = [];
      if (editing.price !== form.price) diffs.push([`Price for ${form.name}`, naira(editing.price), naira(form.price)]);
      if (editing.detailing !== form.detailing) diffs.push([`Detailing status for ${form.name}`, editing.detailing, form.detailing]);
      if (editing.pack !== form.pack) diffs.push([`Pack size for ${form.name}`, editing.pack, form.pack]);
      if (editing.channels.join() !== form.channels.join()) diffs.push([`Channels for ${form.name}`, editing.channels.join(', '), form.channels.join(', ')]);
      if (editing.name !== form.name || editing.sku !== form.sku) diffs.push([`Name or SKU for ${editing.name}`, `${editing.sku} ${editing.name}`, `${form.sku} ${form.name}`]);
      setSkus(ss => ss.map(s => (s.id === editing.id ? { ...s, ...form } : s)));
      diffs.forEach(([what, before, after]) => record({ area: 'Catalogue', what, before, after }));
      notify(diffs.length ? `${form.name} updated` : 'No changes', diffs.length ? `${diffs.length} change${diffs.length > 1 ? 's' : ''} recorded in the audit log` : undefined, diffs.length ? 'success' : 'info');
    }
    setEditing(null);
  };

  const saveAssign = () => {
    if (!assignFor) return;
    const before = assignFor.managers.map(nameOf).join(', ') || 'None';
    const after = assignSel.map(nameOf).join(', ') || 'None';
    setSkus(ss => ss.map(s => (s.id === assignFor.id ? { ...s, managers: assignSel } : s)));
    record({ area: 'Catalogue', what: `Managers for ${assignFor.name}`, before, after });
    notify(`${assignFor.name} assigned`, after);
    setAssignFor(null);
  };

  return (
    <AdminPage title="Product Catalogue" subtitle="SKUs, pack sizes, prices and detailing status by channel · changes reach reps on next sync" icon="package"
      actions={<Btn kind="primary" icon="plus" onClick={() => open('new')}>Add product</Btn>}>
      <Card pad={false} title={`${shown.length} products`} actions={<SearchBox value={q} onChange={setQ} placeholder="Search SKU or name" />}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px]">
            <thead><tr>{['SKU', 'Product', 'Pack size', 'Price', 'Channels', 'Detailing', 'Managers', ''].map(h => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-navy-50">
              {shown.map(s => (
                <tr key={s.id} className="hover:bg-paper">
                  <td className={`${tdCls} font-mono text-[11px]`}>{s.sku}</td>
                  <td className={`${tdCls} font-semibold text-ink text-sm`}>{s.name}</td>
                  <td className={tdCls}>{s.pack}</td>
                  <td className={`${tdCls} font-semibold`}>{naira(s.price)}</td>
                  <td className={tdCls}><div className="flex flex-wrap gap-1">{s.channels.map(c => <Badge key={c} tone="muted">{c}</Badge>)}</div></td>
                  <td className={tdCls}><Badge tone={TONE[s.detailing]}>{s.detailing}</Badge></td>
                  <td className={tdCls}>{s.managers.length ? s.managers.map(nameOf).join(', ') : <span className="text-rose-600 font-semibold">Unassigned</span>}</td>
                  <td className={`${tdCls} text-right whitespace-nowrap`}>
                    <Btn icon="edit" onClick={() => open(s)} className="mr-1">Edit</Btn>
                    <Btn icon="users" onClick={() => { setAssignFor(s); setAssignSel(s.managers); }}>Assign</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={!!editing} title={editing === 'new' ? 'Add product' : `Edit ${editing?.name ?? ''}`} onClose={closeEdit}
        footer={<><Btn onClick={closeEdit}>Cancel</Btn><Btn kind="primary" icon="check" onClick={save}>Save</Btn></>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="SKU"><input className={inputCls} value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="FID-XXX-000" /></Field>
          <Field label="Product name"><input className={inputCls} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Pack size"><input className={inputCls} value={form.pack} onChange={e => setForm({ ...form, pack: e.target.value })} placeholder="e.g. 3 x 10 tablets" /></Field>
          <Field label="Price (₦)"><input type="number" min={0} className={inputCls} value={form.price || ''} onChange={e => setForm({ ...form, price: Number(e.target.value) })} /></Field>
          <Field label="Detailing status">
            <select className={inputCls} value={form.detailing} onChange={e => setForm({ ...form, detailing: e.target.value as Detailing })}>{DETAILING.map(d => <option key={d}>{d}</option>)}</select>
          </Field>
          <fieldset>
            <legend className="stat-label text-navy-500">Channels</legend>
            <div className="mt-1 flex flex-wrap gap-2">
              {CHANNELS.map(c => (
                <label key={c} className="flex items-center gap-1.5 text-xs text-navy-700">
                  <input type="checkbox" checked={form.channels.includes(c)}
                    onChange={e => setForm({ ...form, channels: e.target.checked ? [...form.channels, c] : form.channels.filter(x => x !== c) })} />{c}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </Modal>

      <Modal open={!!assignFor} title={`Assign ${assignFor?.name ?? ''} to managers`} onClose={closeAssign}
        footer={<><Btn onClick={closeAssign}>Cancel</Btn><Btn kind="primary" icon="check" onClick={saveAssign}>Save assignment</Btn></>}>
        <p className="text-xs text-navy-500">Assigned managers see this product in their targets, detailing plans and team reports.</p>
        <div className="divide-y divide-navy-50 border border-navy-100 rounded-xl">
          {managers.map(m => (
            <label key={m.id} className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-paper cursor-pointer">
              <input type="checkbox" checked={assignSel.includes(m.id)}
                onChange={e => setAssignSel(sel => (e.target.checked ? [...sel, m.id] : sel.filter(x => x !== m.id)))} />
              <span className="font-semibold text-ink">{m.name}</span>
              <span className="text-xs text-navy-500">{m.role} · {m.territory}</span>
            </label>
          ))}
        </div>
      </Modal>
      {banner}
    </AdminPage>
  );
}
