import { useCallback, useState } from 'react';
import { AdminPage, Badge, Btn, Card, Field, Modal, SearchBox, inputCls, tdCls, thCls, useNotice, type AdminScreenProps } from './kit';
import { useAdmin } from '../../stores/admin';

// AC 6.7 add customers and institutions with territory and channel.
type Channel = 'Institution' | 'Trade' | 'HCP' | 'Consumer';
type Kind = 'Hospital' | 'Clinic' | 'Pharmacy' | 'Distributor' | 'Doctor' | 'Supermarket';
interface Cust { id: string; name: string; kind: Kind; channel: Channel; tier: 'A' | 'B' | 'C'; territory: string; city: string; added: string }

const TERRITORIES = ['Lekki Cluster', 'V.I. Cluster', 'Mainland Cluster', 'Surulere', 'Lagos Trade', 'Ibadan North', 'Ibadan South', 'Abuja Central'];
const KINDS: Kind[] = ['Hospital', 'Clinic', 'Pharmacy', 'Distributor', 'Doctor', 'Supermarket'];
const CHANNELS: Channel[] = ['Institution', 'Trade', 'HCP', 'Consumer'];
const CH_TONE: Record<Channel, 'violet' | 'amber' | 'sky' | 'leaf'> = { Institution: 'violet', Trade: 'amber', HCP: 'sky', Consumer: 'leaf' };

const SEED: Cust[] = [
  { id: 'c1', name: 'Lakeshore Specialist Hospital', kind: 'Hospital', channel: 'Institution', tier: 'A', territory: 'Lekki Cluster', city: 'Lagos', added: 'Migrated' },
  { id: 'c2', name: 'Reddington Hospital', kind: 'Hospital', channel: 'Institution', tier: 'A', territory: 'V.I. Cluster', city: 'Lagos', added: 'Migrated' },
  { id: 'c3', name: 'Eko Hospital Ikeja', kind: 'Hospital', channel: 'Institution', tier: 'B', territory: 'Mainland Cluster', city: 'Lagos', added: '6 days ago' },
  { id: 'c4', name: 'MedPlus Yaba', kind: 'Pharmacy', channel: 'Trade', tier: 'B', territory: 'Mainland Cluster', city: 'Lagos', added: 'Migrated' },
  { id: 'c5', name: 'HealthPlus Surulere', kind: 'Pharmacy', channel: 'Trade', tier: 'B', territory: 'Surulere', city: 'Lagos', added: 'Migrated' },
  { id: 'c6', name: 'WestEnd Distributors Ltd', kind: 'Distributor', channel: 'Trade', tier: 'A', territory: 'Lagos Trade', city: 'Lagos', added: 'Migrated' },
  { id: 'c7', name: 'UCH Ibadan', kind: 'Hospital', channel: 'Institution', tier: 'A', territory: 'Ibadan North', city: 'Ibadan', added: 'Migrated' },
  { id: 'c8', name: 'Dr. Amaka Obi', kind: 'Doctor', channel: 'HCP', tier: 'A', territory: 'Lekki Cluster', city: 'Lagos', added: 'Migrated' },
  { id: 'c9', name: 'National Hospital Abuja', kind: 'Hospital', channel: 'Institution', tier: 'A', territory: 'Abuja Central', city: 'Abuja', added: 'Migrated' },
];

const EMPTY = { name: '', kind: 'Hospital' as Kind, channel: 'Institution' as Channel, tier: 'B' as Cust['tier'], territory: TERRITORIES[0], city: 'Lagos' };

export default function Customers({ onToast }: AdminScreenProps) {
  const { record } = useAdmin();
  const { notify, banner } = useNotice(onToast);
  const [rows, setRows] = useState<Cust[]>(SEED);
  const [q, setQ] = useState('');
  const [ch, setCh] = useState<'All' | Channel>('All');
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const close = useCallback(() => setAdding(false), []);

  const shown = rows.filter(r => (ch === 'All' || r.channel === ch) && `${r.name} ${r.territory} ${r.city}`.toLowerCase().includes(q.toLowerCase()));

  const add = () => {
    const name = form.name.trim();
    if (!name) { notify('Customer name is required', undefined, 'error'); return; }
    const dup = rows.find(r => r.name.toLowerCase() === name.toLowerCase());
    if (dup) { notify('Already in the master list', `${dup.name} is in ${dup.territory}`, 'error'); return; }
    setRows(rs => [{ ...form, name, id: `c-${Date.now()}`, added: 'Just now' }, ...rs]);
    record({ area: 'Customers', what: `Added ${name}`, before: 'None', after: `${form.channel} · ${form.kind} · Tier ${form.tier} · ${form.territory}` });
    notify(`${name} added`, `Visible to the ${form.territory} rep on next sync`);
    setForm(EMPTY);
    setAdding(false);
  };

  return (
    <AdminPage title="Customers & Institutions" subtitle="Add a hospital, pharmacy, distributor or doctor to the master list with its territory and channel" icon="layers"
      actions={<Btn kind="primary" icon="plus" onClick={() => setAdding(true)}>Add customer</Btn>}>
      <Card pad={false} title={`${shown.length} of ${rows.length} customers`} actions={
        <>
          <SearchBox value={q} onChange={setQ} placeholder="Search name, territory, city" />
          <div className="flex gap-1">
            {(['All', ...CHANNELS] as const).map(c => (
              <button key={c} onClick={() => setCh(c)} aria-pressed={ch === c}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold btn-press ${ch === c ? 'bg-navy-800 text-white' : 'bg-white border border-navy-200 text-navy-600 hover:bg-paper'}`}>{c}</button>
            ))}
          </div>
        </>
      }>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead><tr>{['Customer', 'Type', 'Channel', 'Tier', 'Territory', 'City', 'Added'].map(h => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-navy-50">
              {shown.map(r => (
                <tr key={r.id} className={r.added === 'Just now' ? 'bg-leaf-50/60' : 'hover:bg-paper'}>
                  <td className={`${tdCls} font-semibold text-sm text-ink`}>{r.name}</td>
                  <td className={tdCls}>{r.kind}</td>
                  <td className={tdCls}><Badge tone={CH_TONE[r.channel]}>{r.channel}</Badge></td>
                  <td className={tdCls}><Badge tone={r.tier === 'A' ? 'leaf' : 'muted'}>Tier {r.tier}</Badge></td>
                  <td className={tdCls}>{r.territory}</td>
                  <td className={tdCls}>{r.city}</td>
                  <td className={tdCls}>{r.added}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={adding} title="Add customer" onClose={close}
        footer={<><Btn onClick={close}>Cancel</Btn><Btn kind="primary" icon="check" onClick={add}>Add to master list</Btn></>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2"><Field label="Name"><input className={inputCls} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. St. Nicholas Hospital" /></Field></div>
          <Field label="Type"><select className={inputCls} value={form.kind} onChange={e => setForm({ ...form, kind: e.target.value as Kind })}>{KINDS.map(k => <option key={k}>{k}</option>)}</select></Field>
          <Field label="Channel"><select className={inputCls} value={form.channel} onChange={e => setForm({ ...form, channel: e.target.value as Channel })}>{CHANNELS.map(c => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Tier"><select className={inputCls} value={form.tier} onChange={e => setForm({ ...form, tier: e.target.value as Cust['tier'] })}>{['A', 'B', 'C'].map(t => <option key={t}>{t}</option>)}</select></Field>
          <Field label="City"><select className={inputCls} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}>{['Lagos', 'Ibadan', 'Abuja', 'Port Harcourt', 'Kano'].map(c => <option key={c}>{c}</option>)}</select></Field>
          <div className="sm:col-span-2"><Field label="Territory"><select className={inputCls} value={form.territory} onChange={e => setForm({ ...form, territory: e.target.value })}>{TERRITORIES.map(t => <option key={t}>{t}</option>)}</select></Field></div>
        </div>
        <p className="text-[11px] text-navy-500">The account belongs to the territory, so whoever covers it sees it. A name already in the list is blocked to avoid duplicates.</p>
      </Modal>
      {banner}
    </AdminPage>
  );
}
