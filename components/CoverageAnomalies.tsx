import { useMemo, useState } from 'react';
import Icon from './Icon';
import type { VisitLog } from '../types';

interface Territory {
  id: string;
  name: string;
  region: string;
  rsm: string;
  reps: string[];
  planned: number;
  logged: number;
  gpsPct: number;
  medianMins: number;
}

interface VisitRow {
  id: string;
  time: string;
  customer: string;
  rep: string;
  mins: number;
  gpsPct: number;
  distanceM: number;
  live?: boolean;
}

// Flag rules, stated on screen.
const RULES = { gpsPct: 60, medianMins: 8, overPlan: 1.4 };

const TERRITORIES: Territory[] = [
  { id: 'apapa', name: 'Apapa', region: 'SW', rsm: 'Tunde Bakare', reps: ['Kola Adeniyi'], planned: 24, logged: 38, gpsPct: 22, medianMins: 4 },
  { id: 'aba', name: 'Aba', region: 'SE', rsm: 'Ngozi Achebe', reps: ['Nkem Anozie'], planned: 30, logged: 31, gpsPct: 48, medianMins: 11 },
  { id: 'calabar', name: 'Calabar', region: 'SS', rsm: 'Emeka Okoro', reps: ['Ivie Omoruyi'], planned: 20, logged: 33, gpsPct: 71, medianMins: 6 },
  { id: 'yola', name: 'Yola', region: 'NE', rsm: 'Hauwa Ibrahim', reps: ['Yakubu Gana'], planned: 22, logged: 29, gpsPct: 41, medianMins: 7 },
  { id: 'kaduna', name: 'Kaduna North', region: 'NW', rsm: 'Aminu Bello', reps: ['Bashir Aliyu'], planned: 26, logged: 27, gpsPct: 58, medianMins: 14 },
  { id: 'lekki', name: 'Lekki/V.I.', region: 'SW', rsm: 'Tunde Bakare', reps: ['Adaeze Okafor', 'Bayo Salami', 'Yetunde Cole', 'Fatima Bello'], planned: 96, logged: 92, gpsPct: 94, medianMins: 22 },
  { id: 'ph', name: 'Port Harcourt', region: 'SS', rsm: 'Emeka Okoro', reps: ['Tamuno Briggs', 'Ebiere Dokubo'], planned: 54, logged: 51, gpsPct: 89, medianMins: 19 },
  { id: 'abuja', name: 'Abuja (FCT)', region: 'NC', rsm: 'Yusuf Danjuma', reps: ['Aisha Musa', 'Peter Ochai'], planned: 50, logged: 47, gpsPct: 86, medianMins: 18 },
];

const CUSTOMERS: Record<string, string[]> = {
  apapa: ['MedPlus Apapa', 'Apapa General Hospital', 'Wharf Road Pharmacy', 'Tin Can Clinic', 'Ijora Chemists', 'Marine Beach Medical'],
  aba: ['Aba Specialist Hospital', 'Ariaria Pharmacy', 'Faulks Road Clinic', 'Ngwa Road Chemists'],
  calabar: ['UCTH Calabar', 'Marian Road Pharmacy', 'Etta Agbor Clinic', 'Calabar Municipal PHC'],
  yola: ['FMC Yola', 'Jimeta Pharmacy', 'Yola Town Clinic', 'Karewa Chemists'],
  kaduna: ['Barau Dikko Hospital', 'Ahmadu Bello Way Pharmacy', 'Kawo Clinic'],
  lekki: ['Lakeshore Specialist Hospital', 'Reddington Hospital', 'Evercare Lekki', 'HealthPlus V.I.', 'St. Nicholas Hospital'],
  ph: ['UPTH Port Harcourt', 'Rumuola Pharmacy', 'Trans-Amadi Clinic'],
  abuja: ['National Hospital Abuja', 'Garki Hospital', 'Wuse Pharmacy'],
};

const flagsFor = (t: Territory) => {
  const f: string[] = [];
  if (t.gpsPct < RULES.gpsPct) f.push('Low GPS evidence');
  if (t.medianMins < RULES.medianMins) f.push('Short time on site');
  if (t.logged > t.planned * RULES.overPlan) f.push('Visits far above plan');
  return f;
};

const seeded = (key: string) => {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 1000) / 1000;
};

const visitsFor = (t: Territory): VisitRow[] => {
  const custs = CUSTOMERS[t.id] ?? ['Customer'];
  return Array.from({ length: 12 }, (_, i) => {
    const s = seeded(t.id + i);
    const evidenced = s < t.gpsPct / 100;
    const mins = Math.max(2, Math.round(t.medianMins * (0.5 + s)));
    const hour = 8 + Math.floor(i * 0.8);
    return {
      id: `${t.id}-${i}`,
      time: `${hour}:${String(Math.floor(s * 59)).padStart(2, '0')}`,
      customer: custs[i % custs.length],
      rep: t.reps[i % t.reps.length],
      mins,
      gpsPct: evidenced ? 70 + Math.round(s * 30) : Math.round(s * 40),
      distanceM: evidenced ? 20 + Math.round(s * 60) : 400 + Math.round(s * 2600),
    };
  }).sort((a, b) => a.gpsPct - b.gpsPct);
};

interface CoverageAnomaliesProps {
  regions?: string[]; // region codes in scope; omit for national
  visitLogs?: VisitLog[];
}

export default function CoverageAnomalies({ regions, visitLogs = [] }: CoverageAnomaliesProps) {
  const [showAll, setShowAll] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [openVisit, setOpenVisit] = useState<string | null>(null);
  const [actions, setActions] = useState<Record<string, string>>({});

  const scoped = TERRITORIES.filter(t => !regions || regions.includes(t.region));
  const flagged = scoped.filter(t => flagsFor(t).length > 0);
  const list = showAll ? scoped : flagged;
  const territory = scoped.find(t => t.id === openId);

  const visits = useMemo(() => {
    if (!territory) return [];
    const base = visitsFor(territory);
    if (territory.id !== 'lekki') return base;
    const live: VisitRow[] = visitLogs.map(l => ({
      id: l.id,
      time: new Date(l.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      customer: l.institution || l.hcpName,
      rep: l.repName,
      mins: l.timeOnSiteMins ?? 0,
      gpsPct: typeof l.evidencedPct === 'number' ? l.evidencedPct : (l.location.isManual ? 0 : 100),
      distanceM: l.location.isManual ? 0 : 35,
      live: true,
    }));
    return [...live, ...base];
  }, [territory, visitLogs]);

  if (territory) {
    const f = flagsFor(territory);
    const act = actions[territory.id];
    return (
      <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-navy-100 flex items-center gap-2">
          <button onClick={() => { setOpenId(null); setOpenVisit(null); }} aria-label="Back to territories" className="w-7 h-7 rounded-lg hover:bg-paper flex items-center justify-center">
            <Icon name="chevronLeft" size={16} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-navy-400 font-semibold">Coverage anomalies › {territory.name}</p>
            <h3 className="font-display font-bold text-ink text-sm">{territory.name} · {territory.region} · RSM {territory.rsm}</h3>
          </div>
        </div>
        <div className="px-5 py-3 border-b border-navy-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { l: 'Visits logged', v: `${territory.logged}`, s: `plan ${territory.planned}` },
            { l: 'GPS-evidenced', v: `${territory.gpsPct}%`, s: `flag below ${RULES.gpsPct}%` },
            { l: 'Median on site', v: `${territory.medianMins} min`, s: `flag below ${RULES.medianMins} min` },
            { l: 'Reps', v: `${territory.reps.length}`, s: territory.reps.join(', ') },
          ].map(k => (
            <div key={k.l} className="min-w-0">
              <p className="stat-label text-navy-400">{k.l}</p>
              <p className="font-display text-lg font-bold text-ink">{k.v}</p>
              <p className="text-[10px] text-navy-500 truncate">{k.s}</p>
            </div>
          ))}
        </div>
        {f.length > 0 && (
          <div className="px-5 py-2.5 border-b border-navy-100 flex items-center gap-2 flex-wrap">
            {f.map(x => <span key={x} className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">{x}</span>)}
            <div className="ml-auto flex gap-1.5">
              {act ? (
                <span className="text-[11px] font-bold text-leaf-700 flex items-center gap-1"><Icon name="checkCircle" size={12} /> {act}</span>
              ) : (
                <>
                  <button onClick={() => setActions(p => ({ ...p, [territory.id]: `Review requested from ${territory.rsm}` }))} className="px-2.5 py-1 rounded-lg bg-rose-500 text-white text-[11px] font-bold btn-press hover:bg-rose-600">Ask RSM to review</button>
                  <button onClick={() => setActions(p => ({ ...p, [territory.id]: 'Marked as explained' }))} className="px-2.5 py-1 rounded-lg border border-navy-200 text-[11px] font-bold text-navy-700 hover:bg-paper btn-press">Mark explained</button>
                </>
              )}
            </div>
          </div>
        )}
        <p className="px-5 pt-3 text-[10px] text-navy-500">Visits this week · lowest GPS evidence first{visits.some(v => v.live) ? ' · live logs from today at the top' : ''}</p>
        <div className="divide-y divide-navy-50 max-h-[420px] overflow-y-auto">
          {visits.map(v => {
            const bad = v.gpsPct < RULES.gpsPct || v.mins < RULES.medianMins;
            const open = openVisit === v.id;
            return (
              <div key={v.id}>
                <button onClick={() => setOpenVisit(open ? null : v.id)} className="w-full px-5 py-2 flex items-center gap-3 hover:bg-paper text-left">
                  <span className="font-mono text-[10px] text-navy-500 w-12 flex-shrink-0">{v.time}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-ink truncate">{v.customer}{v.live && <span className="ml-1.5 px-1 rounded bg-leaf-100 text-leaf-700 text-[9px] font-bold">LIVE</span>}</p>
                    <p className="text-[10px] text-navy-500 truncate">{v.rep}</p>
                  </div>
                  <span className={`font-mono text-[11px] font-bold ${v.mins < RULES.medianMins ? 'text-rose-700' : 'text-navy-700'}`}>{v.mins} min</span>
                  <span className={`font-mono text-[11px] font-bold w-10 text-right ${v.gpsPct < RULES.gpsPct ? 'text-rose-700' : 'text-leaf-700'}`}>{v.gpsPct}%</span>
                  <Icon name={bad ? 'alert' : 'checkCircle'} size={13} className={bad ? 'text-rose-600' : 'text-leaf-600'} />
                </button>
                {open && (
                  <div className="px-5 pb-2.5 fade-up">
                    <div className="p-2.5 rounded-lg bg-paper border border-navy-100 text-[11px] text-navy-700 space-y-0.5">
                      <p>Check-in {v.distanceM ? `${v.distanceM} m from the customer pin` : 'entered manually · no GPS fix'} · {v.gpsPct}% of the visit evidenced by location samples</p>
                      <p>Time on site {v.mins} min{v.mins < RULES.medianMins ? ' · shorter than a detailing call needs' : ''}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-navy-100 flex items-start justify-between gap-2 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <Icon name="location" size={14} className="text-rose-700" />
            <h3 className="font-display font-bold text-ink text-sm">Geo-Coverage Anomalies</h3>
            <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[9px] font-bold">{flagged.length} FLAGGED</span>
          </div>
          <p className="text-[10px] text-navy-500 mt-1 leading-snug">
            Flagged when GPS-evidenced visits fall below {RULES.gpsPct}%, median time on site is under {RULES.medianMins} min, or visits logged exceed plan by {Math.round((RULES.overPlan - 1) * 100)}%+. This week.
          </p>
        </div>
        <button onClick={() => setShowAll(s => !s)} className="px-2.5 py-1 rounded-lg bg-paper text-navy-600 hover:bg-navy-100 text-[11px] font-bold">
          {showAll ? 'Flagged only' : `All ${scoped.length} territories`}
        </button>
      </div>
      <div className="divide-y divide-navy-50">
        {list.map(t => {
          const f = flagsFor(t);
          return (
            <button key={t.id} onClick={() => setOpenId(t.id)} className="w-full px-5 py-3 flex items-center gap-3 hover:bg-paper text-left">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-[10px] flex-shrink-0 ${f.length ? 'bg-rose-50 text-rose-700' : 'bg-leaf-50 text-leaf-700'}`}>{t.region}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-display font-semibold text-xs text-ink">{t.name}</p>
                  {f.map(x => <span key={x} className="px-1.5 rounded bg-rose-50 text-rose-700 text-[9px] font-bold">{x}</span>)}
                </div>
                <p className="text-[11px] text-navy-600 mt-0.5 font-mono">{t.logged} visits logged · {t.gpsPct}% GPS-evidenced · {t.medianMins} min median on site</p>
                {actions[t.id] && <p className="text-[10px] text-leaf-700 font-bold mt-0.5">{actions[t.id]}</p>}
              </div>
              <Icon name="chevronRight" size={14} className="text-navy-300 flex-shrink-0" />
            </button>
          );
        })}
        {list.length === 0 && <p className="px-5 py-6 text-center text-xs text-navy-500">No anomalies in this scope this week</p>}
      </div>
    </div>
  );
}
