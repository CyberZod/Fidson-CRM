import { useState } from 'react';
import Icon from './Icon';

interface CoachingNote {
  d: string;
  t: string;
}

interface RepEntry {
  n: string;
  z: string;
  target: number;
  visits: number;
  conv: number;
  status: 'star' | 'attention' | 'ok';
  notes: CoachingNote[];
}

export default function ASMTeamView() {
  const [selectedRep, setSelectedRep] = useState(0);

  const reps: RepEntry[] = [
    {
      n: 'Adaeze Okafor', z: 'V.I. East', target: 87, visits: 142, conv: 42, status: 'star',
      notes: [
        { d: 'May 8', t: 'Q2 review · on track, push for institutional close on Lakeshore' },
        { d: 'May 1', t: 'Discussed Coflin focus strategy · she\'s ahead of plan' },
      ],
    },
    {
      n: 'Tope Adeola', z: 'Lekki Phase 1', target: 91, visits: 156, conv: 48, status: 'star',
      notes: [
        { d: 'May 10', t: 'Top performer this month · suggested KAM track' },
      ],
    },
    {
      n: 'Bayo Salami', z: 'Lekki Phase 2', target: 68, visits: 98, conv: 31, status: 'ok',
      notes: [
        { d: 'May 12', t: 'Improvement in conversion · keep on Coflin focus' },
      ],
    },
    {
      n: 'Yetunde Cole', z: 'V.I. West', target: 54, visits: 78, conv: 24, status: 'attention',
      notes: [
        { d: 'Apr 25', t: 'Last check-in · pipeline volume concern raised' },
      ],
    },
  ];

  const r = reps[selectedRep];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 fade-up">
          <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-navy-100">
              <h3 className="font-display font-bold text-ink text-sm">My 4 Reps</h3>
            </div>
            <div className="p-2">
              {reps.map((rep, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedRep(i)}
                  className={`w-full p-3 rounded-lg text-left flex items-center gap-3 transition-colors ${
                    selectedRep === i ? 'bg-sky-50 border border-sky-200' : 'hover:bg-paper'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full font-display font-bold text-xs flex items-center justify-center flex-shrink-0 ${
                    rep.status === 'star' ? 'bg-sky-100 text-sky-700' :
                    rep.status === 'attention' ? 'bg-amber-100 text-amber-700' : 'bg-navy-100 text-navy-700'
                  }`}>{rep.n.split(' ').map(x => x[0]).join('')}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-sm text-ink truncate">{rep.n}</p>
                    <p className="text-[11px] text-navy-500">{rep.z}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs font-bold text-ink">{rep.target}%</p>
                    {rep.status === 'attention' && <span className="text-[9px] font-bold text-amber-700">ATTN</span>}
                    {rep.status === 'star' && <Icon name="trending" size={10} className="text-sky-600 ml-auto" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 fade-up stagger-1 space-y-4">
          <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold ${
                  r.status === 'star' ? 'bg-sky-500' : r.status === 'attention' ? 'bg-amber-500' : 'bg-navy-700'
                } text-white`}>{r.n.split(' ').map(x => x[0]).join('')}</div>
                <div>
                  <h3 className="font-display font-bold text-ink">{r.n}</h3>
                  <p className="text-xs text-navy-500">{r.z} · Med Rep · Institution</p>
                </div>
              </div>
              <button className="px-3 py-1.5 rounded-lg bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 btn-press">
                <Icon name="send" size={12} /> Send micro-coach
              </button>
            </div>
            <div className="grid grid-cols-3 gap-0">
              {[
                { l: 'Q2 Target', v: `${r.target}%`, c: r.target > 70 ? 'sky' : 'amber' },
                { l: 'Visits QTD', v: r.visits.toString(), c: 'navy' },
                { l: 'Conversion', v: `${r.conv}%`, c: 'navy' },
              ].map((s, i) => (
                <div key={i} className="p-5 border-r last:border-r-0 border-navy-100">
                  <p className="stat-label text-navy-400">{s.l}</p>
                  <p className={`font-display text-2xl font-bold mt-1 ${
                    s.c === 'sky' ? 'text-sky-700' : s.c === 'amber' ? 'text-amber-700' : 'text-ink'
                  }`}>{s.v}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between">
              <h3 className="font-display font-bold text-ink">Coaching Notes</h3>
              <button className="px-3 py-1 rounded-md bg-paper text-xs font-bold text-navy-700 flex items-center gap-1">
                <Icon name="plus" size={12} /> Log 1:1
              </button>
            </div>
            <div className="divide-y divide-navy-50">
              {r.notes.map((n, i) => (
                <div key={i} className="px-5 py-3 flex gap-3">
                  <div className="text-[11px] font-mono text-navy-400 font-bold w-12 flex-shrink-0 pt-0.5">{n.d}</div>
                  <p className="text-sm text-navy-700 flex-1">{n.t}</p>
                </div>
              ))}
              <div className="px-5 py-3 bg-paper">
                <textarea placeholder="Add coaching note..." rows={2} className="input-field w-full p-2 rounded-lg bg-white border border-navy-200 text-sm resize-none" />
                <div className="flex items-center gap-2 mt-2">
                  <button className="px-3 py-1.5 rounded-md bg-sky-500 text-white text-xs font-bold">Save Note</button>
                  <button className="px-3 py-1.5 rounded-md bg-white border border-navy-200 text-xs font-bold text-navy-700">Schedule 1:1</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
