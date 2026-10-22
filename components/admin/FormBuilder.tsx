import { useCallback, useState } from 'react';
import Icon from '../Icon';
import { useAdmin } from '../../stores/admin';
import { AdminPage, Card, Btn, Badge, Modal, Field, Toggle, useNotice, inputCls, type AdminScreenProps } from './kit';

// AC 6.7/6.8: admins change field forms without a release. Publishing creates a new version.
type FieldType = 'Text' | 'Long text' | 'Number' | 'Dropdown' | 'Yes / No' | 'Date' | 'Photo' | 'Signature';
const FIELD_TYPES: FieldType[] = ['Text', 'Long text', 'Number', 'Dropdown', 'Yes / No', 'Date', 'Photo', 'Signature'];

interface FormField { id: string; label: string; type: FieldType; required: boolean; options?: string }
interface FormDef { key: string; name: string; version: number; published: string; fields: FormField[]; history: { v: number; at: string; note: string }[] }

let seq = 100;
const f = (label: string, type: FieldType, required = false, options?: string): FormField => ({ id: `f${seq++}`, label, type, required, options });

const SEED: FormDef[] = [
  {
    key: 'visit', name: 'Visit log', version: 4, published: '2 days ago',
    fields: [
      f('Customer', 'Dropdown', true, 'From territory list'),
      f('Products detailed', 'Dropdown', true, 'Coflin Forte 600mg, Astrazon 10mg, Tuxil-N Syrup 100ml'),
      f('Outcome', 'Dropdown', true, 'Prescribed, Considering, Not interested'),
      f('Samples left', 'Number'),
      f('Visit notes', 'Long text'),
      f('HCP signature', 'Signature', true),
    ],
    history: [
      { v: 4, at: '2 days ago', note: 'Added "Samples left"' },
      { v: 3, at: '3 weeks ago', note: 'Signature made required' },
      { v: 2, at: '6 weeks ago', note: 'Outcome options updated' },
    ],
  },
  {
    key: 'audit', name: 'Retail audit', version: 2, published: '2 weeks ago',
    fields: [
      f('Outlet', 'Dropdown', true, 'From territory list'),
      f('Coflin Forte 600mg on shelf', 'Yes / No', true),
      f('Facings counted', 'Number', true),
      f('Shelf photo', 'Photo', true),
      f('Competitor price seen (₦)', 'Number'),
    ],
    history: [{ v: 2, at: '2 weeks ago', note: 'Shelf photo made required' }],
  },
  {
    key: 'complaint', name: 'Complaint', version: 1, published: '5 weeks ago',
    fields: [
      f('Product', 'Dropdown', true, 'Coflin Forte 600mg, Astrazon 10mg, Tuxil-N Syrup 100ml'),
      f('Batch number', 'Text', true),
      f('What happened', 'Long text', true),
      f('Date noticed', 'Date', true),
      f('Photo of pack', 'Photo'),
    ],
    history: [{ v: 1, at: '5 weeks ago', note: 'First version' }],
  },
];

function PreviewField({ fd }: { fd: FormField }) {
  const box = 'w-full px-2.5 py-2 rounded-lg border border-navy-200 bg-white text-[11px] text-navy-400';
  return (
    <div>
      <p className="text-[11px] font-semibold text-ink mb-1">{fd.label || 'Untitled field'}{fd.required && <span className="text-rose-600"> *</span>}</p>
      {fd.type === 'Long text' ? <div className={box + ' h-12'}>Type here</div>
        : fd.type === 'Yes / No' ? <div className="flex gap-1.5">{['Yes', 'No'].map(x => <span key={x} className="flex-1 text-center py-1.5 rounded-lg border border-navy-200 text-[11px] text-navy-600">{x}</span>)}</div>
          : fd.type === 'Photo' ? <div className={box + ' h-14 flex items-center justify-center gap-1'}><Icon name="camera" size={14} /> Take photo</div>
            : fd.type === 'Signature' ? <div className={box + ' h-14 flex items-center justify-center italic'}>Sign here</div>
              : fd.type === 'Dropdown' ? <div className={box + ' flex justify-between'}><span>{fd.options?.split(',')[0]?.trim() || 'Choose'}</span><Icon name="chevronDown" size={12} /></div>
                : <div className={box}>{fd.type === 'Number' ? '0' : fd.type === 'Date' ? 'dd/mm/yyyy' : 'Type here'}</div>}
    </div>
  );
}

export default function FormBuilder({ onToast }: AdminScreenProps) {
  const { record } = useAdmin();
  const { notify, banner } = useNotice(onToast);
  const [forms, setForms] = useState<FormDef[]>(SEED);
  const [drafts, setDrafts] = useState<Record<string, FormField[]>>(() => Object.fromEntries(SEED.map(x => [x.key, x.fields])));
  const [key, setKey] = useState('visit');
  const [selected, setSelected] = useState<string | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const closePublish = useCallback(() => setPublishOpen(false), []);
  const [note, setNote] = useState('');

  const form = forms.find(x => x.key === key)!;
  const fields = drafts[key];
  const dirty = JSON.stringify(fields) !== JSON.stringify(form.fields);
  const setFields = (fn: (x: FormField[]) => FormField[]) => setDrafts(d => ({ ...d, [key]: fn(d[key]) }));
  const update = (id: string, patch: Partial<FormField>) => setFields(xs => xs.map(x => (x.id === id ? { ...x, ...patch } : x)));
  const move = (i: number, dir: -1 | 1) => setFields(xs => {
    const j = i + dir;
    if (j < 0 || j >= xs.length) return xs;
    const n = [...xs];
    [n[i], n[j]] = [n[j], n[i]];
    return n;
  });
  const add = () => {
    const nf = f('New field', 'Text');
    setFields(xs => [...xs, nf]);
    setSelected(nf.id);
  };
  const remove = (id: string) => setFields(xs => xs.filter(x => x.id !== id));
  const discard = () => { setFields(() => form.fields); notify('Changes discarded', `${form.name} is back to v${form.version}`, 'info'); };

  const summary = () => {
    const before = new Set(form.fields.map(x => x.id));
    const after = new Set(fields.map(x => x.id));
    const added = fields.filter(x => !before.has(x.id)).length;
    const removed = form.fields.filter(x => !after.has(x.id)).length;
    const parts = [added && `${added} added`, removed && `${removed} removed`, (!added && !removed) && 'fields edited or reordered'].filter(Boolean);
    return parts.join(', ');
  };

  const publish = () => {
    const v = form.version + 1;
    const n = note.trim() || summary();
    setForms(fs => fs.map(x => (x.key === key ? { ...x, version: v, published: 'Just now', fields, history: [{ v, at: 'Just now', note: n }, ...x.history] } : x)));
    record({ area: 'Forms', what: `${form.name} form published`, before: `v${form.version} · ${form.fields.length} fields`, after: `v${v} · ${fields.length} fields · ${n}` });
    notify(`${form.name} v${v} published`, 'Phones pick it up on next sync · no app release needed');
    setPublishOpen(false);
    setNote('');
  };

  return (
    <AdminPage title="Form Builder" icon="edit" subtitle="Change the forms reps fill in the field · publish a new version without an app release"
      actions={<>
        <Btn kind="ghost" onClick={discard} disabled={!dirty}>Discard</Btn>
        <Btn kind="primary" icon="send" onClick={() => setPublishOpen(true)} disabled={!dirty}>Publish v{form.version + 1}</Btn>
      </>}>
      <div className="flex gap-2 flex-wrap" role="tablist" aria-label="Forms">
        {forms.map(x => (
          <button key={x.key} role="tab" aria-selected={key === x.key} onClick={() => { setKey(x.key); setSelected(null); }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold btn-press ${key === x.key ? 'bg-navy-800 text-white' : 'bg-white border border-navy-200 text-navy-600 hover:bg-paper'}`}>
            {x.name} <span className="opacity-70 font-mono">v{x.version}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
        <div className="space-y-4">
          <Card title={<>Fields · {form.name} {dirty ? <Badge tone="amber">Unpublished changes</Badge> : <Badge tone="leaf">Live v{form.version}</Badge>}</>}
            actions={<Btn icon="plus" onClick={add}>Add field</Btn>} pad={false}>
            <ul className="divide-y divide-navy-50">
              {fields.map((fd, i) => (
                <li key={fd.id} className={`px-4 py-3 ${selected === fd.id ? 'bg-leaf-50/50' : ''}`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex flex-col">
                      <button aria-label={`Move ${fd.label} up`} onClick={() => move(i, -1)} disabled={i === 0} className="text-navy-400 hover:text-ink disabled:opacity-30"><Icon name="chevronUp" size={14} /></button>
                      <button aria-label={`Move ${fd.label} down`} onClick={() => move(i, 1)} disabled={i === fields.length - 1} className="text-navy-400 hover:text-ink disabled:opacity-30"><Icon name="chevronDown" size={14} /></button>
                    </div>
                    <span className="font-mono text-[10px] text-navy-400 w-5">{i + 1}</span>
                    <input value={fd.label} onFocus={() => setSelected(fd.id)} onChange={e => update(fd.id, { label: e.target.value })}
                      aria-label="Field label" className={inputCls + ' !py-1.5 flex-1 min-w-[160px]'} />
                    <select value={fd.type} onFocus={() => setSelected(fd.id)} onChange={e => update(fd.id, { type: e.target.value as FieldType })}
                      aria-label="Field type" className={inputCls + ' !py-1.5 !w-36'}>
                      {FIELD_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <div className="flex items-center gap-1.5 text-[11px] text-navy-600">
                      <Toggle on={fd.required} onChange={v => update(fd.id, { required: v })} label={`${fd.label} required`} /> Required
                    </div>
                    <button onClick={() => remove(fd.id)} aria-label={`Remove ${fd.label}`} className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"><Icon name="x" size={14} /></button>
                  </div>
                  {fd.type === 'Dropdown' && (
                    <input value={fd.options ?? ''} onChange={e => update(fd.id, { options: e.target.value })} placeholder="Options, separated by commas"
                      aria-label="Dropdown options" className={inputCls + ' !py-1 mt-2 ml-12 !w-[calc(100%-3rem)] text-xs'} />
                  )}
                </li>
              ))}
              {!fields.length && <li className="px-4 py-8 text-center text-sm text-navy-500">No fields. Add one to start.</li>}
            </ul>
          </Card>

          <Card title="Version history">
            <ol className="space-y-2">
              {form.history.map(h => (
                <li key={h.v} className="flex items-center gap-3 text-xs">
                  <span className="font-mono font-bold text-navy-700 w-8">v{h.v}</span>
                  <span className="text-navy-600 flex-1">{h.note}</span>
                  <span className="text-navy-400">{h.at}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="lg:sticky lg:top-4 self-start">
          <p className="stat-label text-navy-500 mb-2">Live phone preview</p>
          <div className="mx-auto w-[280px] rounded-[2rem] border-[6px] border-navy-900 bg-paper overflow-hidden shadow-xl">
            <div className="bg-navy-800 text-white px-4 pt-3 pb-2.5">
              <p className="text-[10px] opacity-70">FieldForce · {dirty ? 'draft' : `v${form.version}`}</p>
              <p className="font-display font-bold text-sm">{form.name}</p>
            </div>
            <div className="p-3 space-y-3 h-[420px] overflow-y-auto">
              {fields.map(fd => <PreviewField key={fd.id} fd={fd} />)}
              <div className="w-full py-2 rounded-lg bg-leaf-500 text-white text-center text-xs font-bold">Submit</div>
            </div>
          </div>
        </div>
      </div>

      <Modal open={publishOpen} title={`Publish ${form.name} v${form.version + 1}`} onClose={closePublish}
        footer={<><Btn onClick={() => setPublishOpen(false)}>Cancel</Btn><Btn kind="primary" icon="send" onClick={publish}>Publish</Btn></>}>
        <p className="text-sm text-navy-600">{fields.length} fields · {summary()}. Reps get the new version on their next sync. Records already submitted keep the version they were captured on.</p>
        <Field label="Change note">
          <input className={inputCls} value={note} onChange={e => setNote(e.target.value)} placeholder={summary()} />
        </Field>
      </Modal>
      {banner}
    </AdminPage>
  );
}
