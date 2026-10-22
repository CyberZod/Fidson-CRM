import { useCallback, useMemo, useState } from 'react';
import Icon from '../Icon';
import { AdminPage, Badge, Btn, Card, Field, Modal, SearchBox, Stat, inputCls, tdCls, thCls, useNotice, type AdminScreenProps } from './kit';
import { useAdmin, type AdminPerson, type AdminRole, type Division } from '../../stores/admin';

// AC 6.7 / 6.8 people and roles, AC 1.5 access follows the Entra ID security group.
const ROLES: AdminRole[] = ['Medical Rep', 'ASM', 'RSM', 'FSM', 'DM', 'NSM', 'PM', 'MM', 'HoM', 'Platform Admin', 'Support Desk'];
const DIVISIONS: Division[] = ['Institution', 'Trade', 'HCP', 'Consumer'];
type SortKey = 'name' | 'role' | 'territory' | 'manager' | 'lastSeen';

const EMPTY = { name: '', email: '', role: 'Medical Rep' as AdminRole, division: 'Institution' as Division, region: 'Lagos', territory: '', managerId: '' };

export default function PeopleRoles({ onToast }: AdminScreenProps) {
  const { people, setPeople, record } = useAdmin();
  const { notify, banner } = useNotice(onToast);
  const [q, setQ] = useState('');
  const [roleF, setRoleF] = useState<'All' | AdminRole>('All');
  const [statusF, setStatusF] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [sort, setSort] = useState<{ k: SortKey; asc: boolean }>({ k: 'name', asc: true });
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [confirm, setConfirm] = useState<AdminPerson | null>(null);
  const closeAdd = useCallback(() => setAdding(false), []);
  const closeConfirm = useCallback(() => setConfirm(null), []);

  const nameOf = (id: string | null) => people.find(p => p.id === id)?.name ?? 'None';

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = people.filter(p =>
      (roleF === 'All' || p.role === roleF) &&
      (statusF === 'All' || (statusF === 'Active') === p.active) &&
      (!s || `${p.name} ${p.email} ${p.territory} ${p.region}`.toLowerCase().includes(s)));
    const val = (p: AdminPerson) => sort.k === 'manager' ? nameOf(p.managerId) : String(p[sort.k]);
    return [...list].sort((a, b) => val(a).localeCompare(val(b)) * (sort.asc ? 1 : -1));
  }, [people, q, roleF, statusF, sort]);

  const update = (p: AdminPerson, patch: Partial<AdminPerson>, what: string, before: string, after: string) => {
    setPeople(ps => ps.map(x => (x.id === p.id ? { ...x, ...patch } : x)));
    record({ area: 'People & roles', what, before, after });
    notify(what, `${before} → ${after}`);
  };

  const changeRole = (p: AdminPerson, role: AdminRole) => update(p, { role }, `Role for ${p.name}`, p.role, role);
  const changeManager = (p: AdminPerson, managerId: string) =>
    update(p, { managerId: managerId || null }, `Reporting line for ${p.name}`, `Manager: ${nameOf(p.managerId)}`, `Manager: ${nameOf(managerId || null)}`);

  const toggleActive = (p: AdminPerson) => {
    setPeople(ps => ps.map(x => (x.id === p.id ? { ...x, active: !p.active } : x)));
    record({
      area: 'People & roles',
      what: `${p.name} ${p.active ? 'deactivated' : 'reactivated'}`,
      before: p.active ? 'Active' : 'Inactive',
      after: p.active ? 'Inactive · removed from FieldForce-Users group' : 'Active · added to FieldForce-Users group',
    });
    notify(p.active ? `${p.name} deactivated` : `${p.name} reactivated`, p.active ? 'Access ends on their next request' : 'Access returns on next sign-in');
    setConfirm(null);
  };

  const add = () => {
    if (!form.name.trim() || !form.email.includes('@')) {
      notify('Name and work email are required', 'Use the person\'s @fidson.com address', 'error');
      return;
    }
    const p: AdminPerson = {
      id: `p-${Date.now()}`, name: form.name.trim(), email: form.email.trim(), role: form.role, division: form.division,
      region: form.region, territory: form.territory || 'Unassigned', managerId: form.managerId || null, active: true, lastSeen: 'Never',
    };
    setPeople(ps => [p, ...ps]);
    record({ area: 'People & roles', what: `Added ${p.name}`, before: 'None', after: `${p.role} · ${p.territory} · reports to ${nameOf(p.managerId)}` });
    notify(`${p.name} added`, 'Added to the FieldForce-Users Entra ID group · invite sent');
    setForm(EMPTY);
    setAdding(false);
  };

  const sortBtn = (k: SortKey, label: string) => (
    <th className={thCls}>
      <button onClick={() => setSort(s => ({ k, asc: s.k === k ? !s.asc : true }))} className="inline-flex items-center gap-1 hover:text-ink focus:outline-none focus-visible:underline">
        {label}{sort.k === k && <Icon name={sort.asc ? 'chevronUp' : 'chevronDown'} size={11} />}
      </button>
    </th>
  );

  const active = people.filter(p => p.active).length;
  const managers = people.filter(p => p.active && p.role !== 'Medical Rep');

  return (
    <AdminPage title="People & Roles" subtitle="Add people, change roles and reporting lines, deactivate leavers · no release needed" icon="users"
      actions={<Btn kind="primary" icon="plus" onClick={() => setAdding(true)}>Add person</Btn>}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="People" value={people.length} note="in directory" />
        <Stat label="Active" value={active} note="can sign in" tone="leaf" />
        <Stat label="Inactive" value={people.length - active} note="access revoked" tone="rose" />
        <Stat label="Field reps" value={people.filter(p => p.role === 'Medical Rep').length} note="on phones" tone="amber" />
      </div>

      <div className="fade-up flex items-start gap-3 p-3 rounded-xl bg-sky-50 border border-sky-100 text-xs text-sky-800">
        <Icon name="lock" size={16} className="flex-shrink-0 mt-0.5" />
        <p><span className="font-bold">Access follows the FieldForce-Users Entra ID group.</span> Removing a person there revokes access on next request. Deactivating here removes them from the group and keeps their history.</p>
      </div>

      <Card pad={false} title={`${rows.length} of ${people.length} people`} actions={
        <>
          <SearchBox value={q} onChange={setQ} placeholder="Search name, email, territory" />
          <select aria-label="Filter by role" value={roleF} onChange={e => setRoleF(e.target.value as 'All' | AdminRole)} className="input-field px-2 py-1.5 rounded-lg border border-navy-200 text-xs bg-white">
            <option value="All">All roles</option>{ROLES.map(r => <option key={r}>{r}</option>)}
          </select>
          <select aria-label="Filter by status" value={statusF} onChange={e => setStatusF(e.target.value as 'All' | 'Active' | 'Inactive')} className="input-field px-2 py-1.5 rounded-lg border border-navy-200 text-xs bg-white">
            <option>All</option><option>Active</option><option>Inactive</option>
          </select>
        </>
      }>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead><tr>{sortBtn('name', 'Person')}{sortBtn('role', 'Role')}{sortBtn('territory', 'Territory')}{sortBtn('manager', 'Reports to')}{sortBtn('lastSeen', 'Last seen')}<th className={thCls}>Status</th><th className={thCls} /></tr></thead>
            <tbody className="divide-y divide-navy-50">
              {rows.map(p => (
                <tr key={p.id} className={p.active ? 'hover:bg-paper' : 'bg-navy-50/40 opacity-70'}>
                  <td className={tdCls}>
                    <p className="font-semibold text-ink text-sm">{p.name}</p>
                    <p className="text-[11px] text-navy-500">{p.email}</p>
                  </td>
                  <td className={tdCls}>
                    <select aria-label={`Role for ${p.name}`} value={p.role} disabled={!p.active} onChange={e => changeRole(p, e.target.value as AdminRole)}
                      className="input-field px-2 py-1 rounded-md border border-navy-200 text-xs bg-white">
                      {ROLES.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className={tdCls}>{p.territory}<p className="text-[11px] text-navy-400">{p.division} · {p.region}</p></td>
                  <td className={tdCls}>
                    <select aria-label={`Manager for ${p.name}`} value={p.managerId ?? ''} disabled={!p.active} onChange={e => changeManager(p, e.target.value)}
                      className="input-field px-2 py-1 rounded-md border border-navy-200 text-xs bg-white max-w-[180px]">
                      <option value="">None</option>
                      {managers.filter(m => m.id !== p.id).map(m => <option key={m.id} value={m.id}>{m.name} · {m.role}</option>)}
                    </select>
                  </td>
                  <td className={tdCls}>{p.lastSeen}</td>
                  <td className={tdCls}>{p.active ? <Badge tone="leaf">Active</Badge> : <Badge tone="rose">Inactive</Badge>}</td>
                  <td className={`${tdCls} text-right`}>
                    {p.active
                      ? <Btn kind="danger" onClick={() => setConfirm(p)}>Deactivate</Btn>
                      : <Btn onClick={() => toggleActive(p)}>Reactivate</Btn>}
                  </td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={7} className="px-3 py-8 text-center text-sm text-navy-400">No people match these filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={adding} title="Add person" onClose={closeAdd}
        footer={<><Btn onClick={closeAdd}>Cancel</Btn><Btn kind="primary" icon="check" onClick={add}>Add and send invite</Btn></>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Full name"><input className={inputCls} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Kemi Adewale" /></Field>
          <Field label="Work email"><input className={inputCls} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="k.adewale@fidson.com" /></Field>
          <Field label="Role"><select className={inputCls} value={form.role} onChange={e => setForm({ ...form, role: e.target.value as AdminRole })}>{ROLES.map(r => <option key={r}>{r}</option>)}</select></Field>
          <Field label="Division"><select className={inputCls} value={form.division} onChange={e => setForm({ ...form, division: e.target.value as Division })}>{DIVISIONS.map(d => <option key={d}>{d}</option>)}</select></Field>
          <Field label="Region"><select className={inputCls} value={form.region} onChange={e => setForm({ ...form, region: e.target.value })}>{['Lagos', 'Oyo', 'FCT', 'Rivers', 'Kano', 'Head Office'].map(r => <option key={r}>{r}</option>)}</select></Field>
          <Field label="Territory"><input className={inputCls} value={form.territory} onChange={e => setForm({ ...form, territory: e.target.value })} placeholder="e.g. Ikeja Cluster" /></Field>
          <div className="sm:col-span-2">
            <Field label="Reports to"><select className={inputCls} value={form.managerId} onChange={e => setForm({ ...form, managerId: e.target.value })}>
              <option value="">None</option>{managers.map(m => <option key={m.id} value={m.id}>{m.name} · {m.role} · {m.territory}</option>)}
            </select></Field>
          </div>
        </div>
        <p className="text-[11px] text-navy-500">Adding a person also adds them to the FieldForce-Users Entra ID group. They sign in with their Microsoft work account.</p>
      </Modal>

      <Modal open={!!confirm} title={`Deactivate ${confirm?.name ?? ''}?`} onClose={closeConfirm}
        footer={<><Btn onClick={closeConfirm}>Cancel</Btn><Btn kind="danger" onClick={() => confirm && toggleActive(confirm)}>Deactivate</Btn></>}>
        <p className="text-sm text-navy-700">They are removed from the FieldForce-Users Entra ID group and lose access on their next request. Their visits, orders and customers stay with the territory.</p>
      </Modal>
      {banner}
    </AdminPage>
  );
}
