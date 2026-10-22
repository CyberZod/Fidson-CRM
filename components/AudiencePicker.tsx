import { useMemo, useState } from 'react';
import Icon from './Icon';
import {
  CHANNEL_LABEL, REGION_LABEL, ROSTER, TERRITORIES, resolveAudience,
  type Audience, type RegionCode, type RepChannel,
} from '../stores/marketing';

interface AudiencePickerProps {
  value: Audience;
  onChange: (a: Audience) => void;
  accent?: 'violet' | 'indigo';
  showTerritories?: boolean;
}

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter(x => x !== v) : [...list, v]);

export default function AudiencePicker({ value, onChange, accent = 'violet', showTerritories = true }: AudiencePickerProps) {
  const [mode, setMode] = useState<'groups' | 'reps'>(value.reps.length ? 'reps' : 'groups');
  const [query, setQuery] = useState('');
  const count = mode === 'reps' ? value.reps.length : resolveAudience(value).length;

  const on = accent === 'indigo' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-violet-600 border-violet-600 text-white';
  const off = 'bg-white border-navy-200 text-navy-700 hover:bg-paper';
  const chip = (active: boolean) => `px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-colors ${active ? on : off}`;

  const channelCounts = useMemo(() => {
    const c: Record<RepChannel, number> = { institution: 0, trade: 0, 'mobile-frontline': 0 };
    ROSTER.forEach(r => { c[r.channel]++; });
    return c;
  }, []);

  const territoryOptions = (value.regions.length ? value.regions : []).flatMap(r => TERRITORIES[r]);
  const matches = query.trim().length < 2 ? [] : ROSTER
    .filter(r => r.name.toLowerCase().includes(query.toLowerCase()) && !value.reps.includes(r.name))
    .slice(0, 6);

  const switchMode = (m: 'groups' | 'reps') => {
    setMode(m);
    onChange(m === 'groups' ? { ...value, reps: [] } : value);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1 bg-paper rounded-lg p-1 w-fit">
        {([{ k: 'groups', l: 'By channel & area' }, { k: 'reps', l: 'Specific reps' }] as const).map(m => (
          <button
            key={m.k}
            type="button"
            onClick={() => switchMode(m.k)}
            className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${mode === m.k ? 'bg-white text-ink shadow-sm' : 'text-navy-500'}`}
          >{m.l}</button>
        ))}
      </div>

      {mode === 'groups' ? (
        <>
          <div>
            <p className="text-[10px] font-bold text-navy-500 tracking-wider uppercase mb-1.5">Channel</p>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(CHANNEL_LABEL) as RepChannel[]).map(c => (
                <button key={c} type="button" onClick={() => onChange({ ...value, channels: toggle(value.channels, c) })} className={chip(value.channels.includes(c))}>
                  {CHANNEL_LABEL[c]} <span className="font-mono opacity-70">{channelCounts[c]}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-navy-500 tracking-wider uppercase mb-1.5">Region</p>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(REGION_LABEL) as RegionCode[]).map(r => (
                <button
                  key={r}
                  type="button"
                  title={REGION_LABEL[r]}
                  onClick={() => {
                    const regions = toggle(value.regions, r);
                    onChange({ ...value, regions, territories: value.territories.filter(t => regions.some(x => TERRITORIES[x].includes(t))) });
                  }}
                  className={chip(value.regions.includes(r))}
                >{r}</button>
              ))}
            </div>
          </div>
          {showTerritories && territoryOptions.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-navy-500 tracking-wider uppercase mb-1.5">Territory</p>
              <div className="flex flex-wrap gap-1.5">
                {territoryOptions.map(t => (
                  <button key={t} type="button" onClick={() => onChange({ ...value, territories: toggle(value.territories, t) })} className={chip(value.territories.includes(t))}>{t}</button>
                ))}
              </div>
            </div>
          )}
          <p className="text-[10px] text-navy-400">Leave a row empty to include all of it.</p>
        </>
      ) : (
        <div>
          <div className="relative">
            <Icon name="search" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Type a rep's name"
              className="input-field w-full pl-8 pr-3 py-2 rounded-lg bg-paper border border-navy-200 text-sm"
            />
          </div>
          {matches.length > 0 && (
            <div className="mt-1 rounded-lg border border-navy-100 bg-white divide-y divide-navy-50 shadow-sm">
              {matches.map(r => (
                <button
                  key={r.name}
                  type="button"
                  onClick={() => { onChange({ ...value, reps: [...value.reps, r.name] }); setQuery(''); }}
                  className="w-full text-left px-3 py-2 hover:bg-paper flex items-center justify-between"
                >
                  <span className="text-xs font-semibold text-ink">{r.name}</span>
                  <span className="text-[10px] text-navy-500">{CHANNEL_LABEL[r.channel]} · {r.territory}</span>
                </button>
              ))}
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {value.reps.map(n => (
              <span key={n} className="inline-flex items-center gap-1 pl-2 pr-1 py-1 rounded-lg bg-paper border border-navy-200 text-[11px] font-semibold text-navy-700">
                {n}
                <button type="button" onClick={() => onChange({ ...value, reps: value.reps.filter(x => x !== n) })} className="w-4 h-4 rounded hover:bg-navy-100 flex items-center justify-center" aria-label={`Remove ${n}`}>
                  <Icon name="x" size={10} />
                </button>
              </span>
            ))}
            {value.reps.length === 0 && <span className="text-[11px] text-navy-400">No reps picked yet</span>}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-paper border border-navy-100">
        <Icon name="users" size={14} className="text-navy-500" />
        <span className="text-xs text-navy-700">Reaches <strong className="font-mono">{count}</strong> rep{count === 1 ? '' : 's'}</span>
      </div>
    </div>
  );
}
