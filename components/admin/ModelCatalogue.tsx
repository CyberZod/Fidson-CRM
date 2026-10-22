import { useCallback, useState } from 'react';
import Icon from '../Icon';
import { useAdmin } from '../../stores/admin';
import { AdminPage, Card, Btn, Badge, Stat, Modal, Field, useNotice, inputCls, thCls, tdCls, type AdminScreenProps } from './kit';

// AC 8.7: per use case model choice, with month-to-date spend against a cap.
interface ModelOpt { id: string; name: string; note: string; costFactor: number }
const MODELS: ModelOpt[] = [
  { id: 'fast', name: 'Fast', note: 'Lowest cost · short tasks', costFactor: 0.35 },
  { id: 'standard', name: 'Standard', note: 'Balanced cost and quality', costFactor: 1 },
  { id: 'advanced', name: 'Advanced', note: 'Best reasoning · highest cost', costFactor: 3.2 },
  { id: 'speech', name: 'Speech-to-text', note: 'Voice notes · English, Pidgin, Yoruba', costFactor: 0.8 },
];

interface UseCase { key: string; name: string; desc: string; model: string; allowed: string[]; spend: number; cap: number; tokens: number; requests: number }

const SEED: UseCase[] = [
  { key: 'voice', name: 'Voice transcription', desc: 'Rep voice notes into visit text', model: 'speech', allowed: ['speech'], spend: 182_400, cap: 300_000, tokens: 0, requests: 9_812 },
  { key: 'prefill', name: 'Visit pre-fill', desc: 'Drafts the visit log from the voice note', model: 'fast', allowed: ['fast', 'standard', 'advanced'], spend: 96_150, cap: 150_000, tokens: 14_200_000, requests: 9_640 },
  { key: 'summary', name: 'Day summary', desc: 'End-of-day DCR summary for the manager', model: 'standard', allowed: ['fast', 'standard', 'advanced'], spend: 141_900, cap: 200_000, tokens: 8_900_000, requests: 2_310 },
  { key: 'assistant', name: 'Assistant', desc: 'Questions on performance and accounts', model: 'advanced', allowed: ['standard', 'advanced'], spend: 388_700, cap: 400_000, tokens: 11_400_000, requests: 1_874 },
  { key: 'nba', name: 'Next-best action', desc: 'Which account to visit next and why', model: 'standard', allowed: ['fast', 'standard', 'advanced'], spend: 74_300, cap: 150_000, tokens: 5_100_000, requests: 6_420 },
  { key: 'helpdesk', name: 'Help desk agent', desc: 'First-line answers before a ticket reaches support', model: 'fast', allowed: ['fast', 'standard'], spend: 21_800, cap: 80_000, tokens: 3_300_000, requests: 1_205 },
];

const naira = (n: number) => `₦${Math.round(n).toLocaleString('en-NG')}`;
const compact = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));
const modelName = (id: string) => MODELS.find(m => m.id === id)?.name ?? id;

export default function ModelCatalogue({ onToast }: AdminScreenProps) {
  const { record } = useAdmin();
  const { notify, banner } = useNotice(onToast);
  const [rows, setRows] = useState<UseCase[]>(SEED);
  const [capEdit, setCapEdit] = useState<UseCase | null>(null);
  const closeCap = useCallback(() => setCapEdit(null), []);
  const [capValue, setCapValue] = useState('');
  const [totalCap, setTotalCap] = useState(1_300_000);
  const [alertPct, setAlertPct] = useState(80);

  const total = rows.reduce((s, r) => s + r.spend, 0);
  const tokens = rows.reduce((s, r) => s + r.tokens, 0);
  const requests = rows.reduce((s, r) => s + r.requests, 0);
  const near = rows.filter(r => r.spend / r.cap >= alertPct / 100);
  const dayOfMonth = new Date().getDate();
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const projected = (total / Math.max(dayOfMonth, 1)) * daysInMonth;

  const changeModel = (r: UseCase, id: string) => {
    const before = modelName(r.model);
    const prev = MODELS.find(m => m.id === r.model)!.costFactor;
    const next = MODELS.find(m => m.id === id)!.costFactor;
    setRows(rs => rs.map(x => (x.key === r.key ? { ...x, model: id } : x)));
    record({ area: 'Models', what: `${r.name} model`, before, after: modelName(id) });
    const delta = Math.round((next / prev - 1) * 100);
    notify(`${r.name} now uses ${modelName(id)}`, `Applies to new requests · expected cost ${delta >= 0 ? '+' : ''}${delta}% per request`);
  };

  const saveCap = () => {
    if (!capEdit) return;
    const v = Number(capValue.replace(/[^\d]/g, ''));
    if (!v) { notify('Enter a cap in naira', undefined, 'error'); return; }
    setRows(rs => rs.map(x => (x.key === capEdit.key ? { ...x, cap: v } : x)));
    record({ area: 'Models', what: `${capEdit.name} monthly cap`, before: naira(capEdit.cap), after: naira(v) });
    notify('Spend cap updated', `${capEdit.name} · ${naira(v)} a month`);
    setCapEdit(null);
  };

  return (
    <AdminPage title="Model Catalogue" icon="sparkles" subtitle={`AI model per use case · spend month to date · day ${dayOfMonth} of ${daysInMonth}`}>
      {near.length > 0 && (
        <div className="fade-up flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900" role="alert">
          <Icon name="alert" size={18} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Spend limit alert</p>
            <p className="text-xs mt-0.5">{near.map(r => `${r.name} at ${Math.round((r.spend / r.cap) * 100)}% of cap`).join(' · ')}. At 100% the use case falls back to the Fast model until the 1st. Alerts go to Ngozi Ibe and the Fidson IT finance contact.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Spend MTD" value={naira(total)} note={`of ${naira(totalCap)} total cap`} tone={total / totalCap > alertPct / 100 ? 'amber' : 'leaf'} />
        <Stat label="Projected month" value={naira(projected)} note={projected > totalCap ? 'over total cap' : 'within total cap'} tone={projected > totalCap ? 'rose' : 'leaf'} />
        <Stat label="Tokens MTD" value={compact(tokens)} note="text models" />
        <Stat label="Requests MTD" value={compact(requests)} note="all use cases" />
      </div>

      <Card title="Use cases" pad={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead><tr>
              <th className={thCls}>Use case</th><th className={thCls}>Model</th><th className={thCls}>Spend vs cap</th>
              <th className={thCls}>Tokens</th><th className={thCls}>Requests</th><th className={thCls}>Per request</th><th className={thCls}></th>
            </tr></thead>
            <tbody className="divide-y divide-navy-50">
              {rows.map(r => {
                const pct = Math.min(100, Math.round((r.spend / r.cap) * 100));
                const tone = pct >= 95 ? 'bg-rose-500' : pct >= alertPct ? 'bg-amber-500' : 'bg-leaf-500';
                return (
                  <tr key={r.key} className="hover:bg-paper">
                    <td className={tdCls}><p className="font-semibold text-ink text-sm">{r.name}</p><p className="text-[11px] text-navy-500">{r.desc}</p></td>
                    <td className={tdCls}>
                      <select value={r.model} onChange={e => changeModel(r, e.target.value)} aria-label={`${r.name} model`} className={inputCls + ' !py-1.5 !w-40'}>
                        {MODELS.filter(m => r.allowed.includes(m.id)).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                      <p className="text-[10px] text-navy-400 mt-1">{MODELS.find(m => m.id === r.model)?.note}</p>
                    </td>
                    <td className={tdCls + ' w-56'}>
                      <div className="flex justify-between text-[11px]"><span className="font-semibold text-ink">{naira(r.spend)}</span><span className="text-navy-500">{naira(r.cap)}</span></div>
                      <div className="h-1.5 rounded-full bg-navy-100 mt-1 overflow-hidden"><div className={`h-full ${tone}`} style={{ width: `${pct}%` }} /></div>
                      <p className="text-[10px] text-navy-500 mt-0.5">{pct}% used {pct >= alertPct && <Badge tone={pct >= 95 ? 'rose' : 'amber'}>Near cap</Badge>}</p>
                    </td>
                    <td className={tdCls + ' font-mono'}>{r.tokens ? compact(r.tokens) : 'audio'}</td>
                    <td className={tdCls + ' font-mono'}>{compact(r.requests)}</td>
                    <td className={tdCls + ' font-mono'}>{naira(r.spend / r.requests)}</td>
                    <td className={tdCls}><Btn kind="ghost" icon="edit" onClick={() => { setCapEdit(r); setCapValue(String(r.cap)); }}>Cap</Btn></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Limits">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <Field label="Total monthly cap (₦)">
            <input className={inputCls} type="number" value={totalCap} onChange={e => setTotalCap(Number(e.target.value) || 0)} />
          </Field>
          <Field label="Alert at (% of cap)">
            <input className={inputCls} type="number" min={50} max={100} value={alertPct} onChange={e => setAlertPct(Math.min(100, Math.max(50, Number(e.target.value) || 80)))} />
          </Field>
          <Btn kind="primary" icon="check" onClick={() => { record({ area: 'Models', what: 'Spend limits', before: 'Total ₦1,300,000 · alert 80%', after: `Total ${naira(totalCap)} · alert ${alertPct}%` }); notify('Limits saved', `Alert at ${alertPct}% · total cap ${naira(totalCap)}`); }}>Save limits</Btn>
        </div>
      </Card>

      <Modal open={!!capEdit} title={`Monthly cap · ${capEdit?.name ?? ''}`} onClose={closeCap}
        footer={<><Btn onClick={() => setCapEdit(null)}>Cancel</Btn><Btn kind="primary" onClick={saveCap}>Save cap</Btn></>}>
        <p className="text-sm text-navy-600">Spent {capEdit ? naira(capEdit.spend) : ''} so far this month. When the cap is reached, requests fall back to the Fast model until the 1st.</p>
        <Field label="Cap (₦ per month)">
          <input className={inputCls} value={capValue} onChange={e => setCapValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') saveCap(); }} inputMode="numeric" />
        </Field>
      </Modal>
      {banner}
    </AdminPage>
  );
}
