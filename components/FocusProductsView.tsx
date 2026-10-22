import { useState } from 'react';
import Icon from './Icon';
import { useFlash } from './TeamFlash';
import { useTeam, repsFor, MANAGERS, FOCUS_SKUS, CURRENT_REP, managerLabel, shortDate, type ManagerKey } from '../stores/team';
import type { ToastInput } from '../types';

interface FocusProductsViewProps {
  manager?: ManagerKey;
  onToast?: (t: ToastInput) => void;
}

const skuName = (id: string) => FOCUS_SKUS.find(s => s.id === id)?.name ?? id;

function SkuPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {FOCUS_SKUS.map(s => {
        const on = value.includes(s.id);
        return (
          <button key={s.id} onClick={() => onChange(on ? value.filter(x => x !== s.id) : [...value, s.id])}
            className={`px-3 py-2 rounded-xl border text-left flex items-center gap-2 ${on ? 'bg-leaf-50 border-leaf-300' : 'bg-white border-navy-200 hover:bg-paper'}`}>
            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${on ? 'bg-leaf-500 text-white' : 'bg-navy-50 text-navy-500'}`}>
              <Icon name={on ? 'check' : 'pill'} size={12} strokeWidth={on ? 3 : 2} />
            </div>
            <div>
              <p className="text-xs font-semibold text-ink">{s.name}</p>
              <p className="text-[10px] text-navy-500">{s.category}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default function FocusProductsView({ manager = 'asm', onToast }: FocusProductsViewProps) {
  const { territoryFocus, repFocus, setTerritoryFocus, setRepFocus } = useTeam();
  const { banner, notify } = useFlash(onToast);
  const reps = repsFor(manager);
  const territories = reps.map(r => r.territory);
  const [sel, setSel] = useState(territories[0]);
  const current = territoryFocus[sel];
  const [draft, setDraft] = useState<string[]>(current?.skus ?? []);
  const repsHere = reps.filter(r => r.territory === sel);
  const [overrideFor, setOverrideFor] = useState<string | null>(null);
  const [overrideDraft, setOverrideDraft] = useState<string[]>([]);

  const pick = (t: string) => {
    setSel(t);
    setDraft(territoryFocus[t]?.skus ?? []);
    setOverrideFor(null);
  };

  const saveTerritory = () => {
    if (draft.length === 0) return;
    setTerritoryFocus(sel, draft, manager);
    notify({ type: 'success', title: `Focus products saved for ${sel}`, msg: `${draft.length} SKU${draft.length === 1 ? '' : 's'} · reps see the list on My Day now` });
  };

  const startOverride = (rep: string) => {
    setOverrideFor(rep);
    setOverrideDraft(repFocus[rep]?.skus ?? territoryFocus[sel]?.skus ?? []);
  };

  const saveOverride = () => {
    if (!overrideFor || overrideDraft.length === 0) return;
    setRepFocus(overrideFor, overrideDraft, manager);
    notify({ type: 'success', title: `Override saved for ${overrideFor}`, msg: overrideDraft.map(skuName).join(', ') });
    setOverrideFor(null);
  };

  const clearOverride = (rep: string) => {
    setRepFocus(rep, null, manager);
    notify({ type: 'info', title: `Override cleared for ${rep}`, msg: `Back to the ${sel} list` });
  };

  const dirty = (current?.skus ?? []).join(',') !== draft.join(',');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1400px] mx-auto">
      <div className="fade-up">
        <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">{MANAGERS[manager].role} · {MANAGERS[manager].scope}</p>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">Focus Products</h2>
        <p className="text-xs text-navy-500 mt-0.5">Set the SKUs each territory leads with. Override for a single rep when their customers need something different.</p>
      </div>

      {banner}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="fade-up rounded-2xl bg-white border border-navy-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-navy-100">
            <h3 className="font-display font-bold text-ink text-sm">Territories</h3>
          </div>
          <div className="p-2">
            {territories.map(t => {
              const f = territoryFocus[t];
              const overrides = reps.filter(r => r.territory === t && repFocus[r.name]).length;
              return (
                <button key={t} onClick={() => pick(t)} className={`w-full p-3 rounded-lg text-left ${sel === t ? 'bg-sky-50 border border-sky-200' : 'hover:bg-paper border border-transparent'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-display font-semibold text-sm text-ink">{t}</p>
                    {overrides > 0 && <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[9px] font-bold">{overrides} OVERRIDE</span>}
                  </div>
                  <p className="text-[11px] text-navy-500 truncate mt-0.5">{f ? f.skus.map(skuName).join(', ') : 'Not set'}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4 fade-up stagger-1">
          <div className="rounded-2xl bg-white border border-navy-100 p-5 space-y-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h3 className="font-display font-bold text-ink">{sel} · territory focus</h3>
                {current && <p className="text-[11px] text-navy-500 mt-0.5">Last set by {managerLabel(current.setBy)} on {shortDate(current.on)}</p>}
              </div>
              <button onClick={saveTerritory} disabled={!dirty || draft.length === 0} className="px-4 py-2 rounded-xl bg-navy-700 disabled:opacity-40 text-white text-xs font-bold btn-press flex items-center gap-1.5">
                <Icon name="check" size={14} /> Save for {sel}
              </button>
            </div>
            <SkuPicker value={draft} onChange={setDraft} />
          </div>

          <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-navy-100">
              <h3 className="font-display font-bold text-ink text-sm">Per-rep overrides</h3>
              <p className="text-[11px] text-navy-500">An override replaces the territory list for that rep only.</p>
            </div>
            <div className="divide-y divide-navy-50">
              {repsHere.map(r => {
                const o = repFocus[r.name];
                return (
                  <div key={r.name} className="px-5 py-3 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="w-9 h-9 rounded-full bg-navy-100 text-navy-700 font-display font-bold text-xs flex items-center justify-center">{r.initials}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-semibold text-sm text-ink">{r.name}{r.name === CURRENT_REP && <span className="ml-2 text-[10px] text-navy-400 font-normal">(demo rep)</span>}</p>
                        <p className="text-[11px] text-navy-500">{o ? `Override · ${o.skus.map(skuName).join(', ')}` : 'Uses territory list'}</p>
                      </div>
                      {o && <button onClick={() => clearOverride(r.name)} className="px-2.5 py-1 rounded-md border border-navy-200 text-[11px] font-bold text-navy-700 btn-press">Clear override</button>}
                      <button onClick={() => overrideFor === r.name ? setOverrideFor(null) : startOverride(r.name)} className="px-2.5 py-1 rounded-md bg-amber-500 text-white text-[11px] font-bold btn-press">
                        {overrideFor === r.name ? 'Cancel' : o ? 'Edit override' : 'Override'}
                      </button>
                    </div>
                    {overrideFor === r.name && (
                      <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200 space-y-3">
                        <SkuPicker value={overrideDraft} onChange={setOverrideDraft} />
                        <button onClick={saveOverride} disabled={overrideDraft.length === 0} className="px-4 py-2 rounded-lg bg-amber-500 disabled:opacity-40 text-white text-xs font-bold btn-press">Save override for {r.name.split(' ')[0]}</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const SKU_PROGRESS: Record<string, string> = { coflin: '47/80', astrazon: '22/50', tuxil: '18/30', ciprotab: '9/25', natalben: '12/20' };

// Rep side: "My Products of Focus" fed by the manager's setting.
export function RepFocusCard({ rep = CURRENT_REP }: { rep?: string }) {
  const { focusFor } = useTeam();
  const f = focusFor(rep);
  return (
    <div className="rounded-2xl bg-white border border-navy-100 p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-display font-bold text-ink text-sm">My Products of Focus</h3>
        <span className="px-2 py-0.5 rounded-full bg-leaf-50 text-leaf-700 text-[9px] font-bold">{f.override ? 'JUST FOR YOU' : f.territory.toUpperCase()}</span>
      </div>
      <p className="text-[10px] text-navy-400 mb-3">Set by {managerLabel(f.setBy)} for {f.override ? 'you' : f.territory}</p>
      <div className="space-y-2">
        {f.skus.map((id, i) => {
          const s = FOCUS_SKUS.find(x => x.id === id);
          const lead = i === 0;
          return (
            <div key={id} className={`p-2.5 rounded-lg ${lead ? 'bg-leaf-50 border border-leaf-200' : 'bg-paper'}`}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg ${lead ? 'bg-leaf-500' : 'bg-navy-100'} flex items-center justify-center flex-shrink-0`}>
                  <Icon name="pill" size={14} className={lead ? 'text-white' : 'text-navy-700'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-xs text-ink truncate">{s?.name ?? id}</p>
                  <p className="text-[10px] text-navy-500">{s?.category}</p>
                </div>
                <p className="font-mono text-[10px] font-bold text-navy-700">{SKU_PROGRESS[id] ?? '0/20'}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
