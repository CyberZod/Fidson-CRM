import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from './Icon';
import {
  ORG_TREE, LEVEL_LABEL, SALES_CHANNELS, leavesOf, rollUp, nodesOnPath,
  type DrillNode, type SalesChannel,
} from '../assets/drillData';

// Multi-level drill-down overlay. Open with a path from findPath() in assets/drillData.
// rootId caps how high the viewer can climb (a DM starts at their division).
export interface DrillDownProps {
  path: string[];
  onClose: () => void;
  rootId?: string;
  initialChannel?: SalesChannel;
}

const band = (pct: number) =>
  pct >= 95 ? { c: 'text-leaf-700', bar: 'bg-leaf-500' }
    : pct >= 80 ? { c: 'text-amber-700', bar: 'bg-amber-500' }
      : { c: 'text-rose-700', bar: 'bg-rose-500' };

const childLabel: Record<string, string> = { national: 'Division', division: 'Region', region: 'Area', area: 'Rep' };

export default function DrillDown({ path: initialPath, onClose, rootId = 'national', initialChannel }: DrillDownProps) {
  const [path, setPath] = useState<string[]>(initialPath.length ? initialPath : ['national']);
  const [mode, setMode] = useState<'org' | 'channel'>('org');
  const [channel, setChannel] = useState<SalesChannel | null>(initialChannel ?? null);
  const [note, setNote] = useState<string | null>(null);
  const firstRowRef = useRef<HTMLButtonElement>(null);

  const trail = useMemo(() => nodesOnPath(path), [path]);
  const rootIdx = Math.max(0, trail.findIndex(n => n.id === rootId));
  const visibleTrail = trail.slice(rootIdx);
  const node = trail[trail.length - 1] ?? ORG_TREE;

  const inChannel = (n: DrillNode) => leavesOf(n).filter(r => !channel || r.rep?.channel === channel);
  const stats = rollUp(inChannel(node));

  const goUp = () => {
    if (trail.length - 1 <= rootIdx) { onClose(); return; }
    setPath(p => p.slice(0, -1));
    setNote(null);
  };
  const goTo = (id: string) => { setPath(p => [...p, id]); setMode('org'); setNote(null); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.key === 'Escape' || e.key === 'Backspace') { e.preventDefault(); goUp(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => { firstRowRef.current?.focus(); }, [path, mode]);

  const children = node.children.filter(c => inChannel(c).length > 0);
  const channelRows = SALES_CHANNELS
    .map(ch => ({ ch, s: rollUp(leavesOf(node).filter(r => r.rep?.channel === ch)) }))
    .filter(r => r.s.reps > 0);

  const rep = node.level === 'rep' ? node.rep : undefined;
  const areaName = trail.find(n => n.level === 'area')?.name;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center fade-in" style={{ background: 'rgba(10, 24, 48, 0.5)' }} onClick={onClose}>
      <div role="dialog" aria-label="Performance drill-down" className="bg-white w-full sm:w-[960px] sm:max-w-[94vw] sm:max-h-[90vh] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden slide-in-right" onClick={e => e.stopPropagation()}>
        <div className="px-4 sm:px-5 py-3 border-b border-navy-100 flex items-start gap-3">
          <button onClick={goUp} aria-label="Up one level" className="w-8 h-8 rounded-lg hover:bg-paper flex items-center justify-center flex-shrink-0 mt-0.5">
            <Icon name="chevronLeft" size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1 flex-wrap text-[11px]">
              {visibleTrail.map((n, i) => {
                const last = i === visibleTrail.length - 1;
                return (
                  <span key={n.id} className="flex items-center gap-1">
                    {i > 0 && <span className="text-navy-300">›</span>}
                    <button
                      disabled={last}
                      onClick={() => { setPath(trail.slice(0, rootIdx + i + 1).map(x => x.id)); setNote(null); }}
                      className={last ? 'font-bold text-ink' : 'font-semibold text-indigo-700 hover:underline'}
                    >{n.name}</button>
                  </span>
                );
              })}
            </nav>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <h3 className="font-display font-bold text-ink text-lg leading-tight">{node.name}</h3>
              <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[9px] font-bold uppercase tracking-wider">{LEVEL_LABEL[node.level]}</span>
              {channel && (
                <button onClick={() => setChannel(null)} className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[9px] font-bold border border-amber-200 flex items-center gap-1">
                  Channel: {channel} <Icon name="x" size={9} />
                </button>
              )}
            </div>
            <p className="text-[11px] text-navy-500 mt-0.5">{node.level === 'rep' ? `${rep?.channel} · ${areaName ?? ''}` : node.lead} · Q2 FY26</p>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[10px] text-navy-400 flex-shrink-0 mt-1">
            <kbd className="px-1.5 py-0.5 rounded border border-navy-200 font-mono">Esc</kbd>
            <kbd className="px-1.5 py-0.5 rounded border border-navy-200 font-mono">⌫</kbd>
            <span>up a level</span>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-lg hover:bg-paper flex items-center justify-center flex-shrink-0">
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { l: 'Target', v: `₦${stats.target.toFixed(1)}M`, c: 'text-ink' },
              { l: 'Achieved', v: `₦${stats.achieved.toFixed(1)}M`, c: 'text-ink' },
              { l: 'Attainment', v: `${stats.attainment}%`, c: band(stats.attainment).c },
              { l: 'Coverage', v: `${stats.coverage}%`, c: band(stats.coverage + 10).c },
              { l: 'Compliance', v: `${stats.compliance}%`, c: band(stats.compliance + 5).c },
            ].map(k => (
              <div key={k.l} className="p-3 rounded-xl bg-paper border border-navy-100">
                <p className="stat-label text-navy-400">{k.l}</p>
                <p className={`font-display text-xl font-bold mt-0.5 ${k.c}`}>{k.v}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-navy-400">
            Coverage = customers visited this cycle ÷ customers in call plan. Compliance = visits with GPS check-in and check-out inside the customer geofence ÷ visits logged.
          </p>

          {node.level !== 'rep' ? (
            <div className="rounded-2xl border border-navy-100 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-navy-100 flex items-center justify-between gap-2 flex-wrap">
                <p className="font-display font-bold text-ink text-sm">
                  {mode === 'org' ? `By ${childLabel[node.level].toLowerCase()} · ${children.length}` : 'By channel'}
                </p>
                <div className="flex items-center gap-1">
                  {(['org', 'channel'] as const).map(m => (
                    <button key={m} onClick={() => setMode(m)} className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${mode === m ? 'bg-navy-700 text-white' : 'bg-paper text-navy-600 hover:bg-navy-100'}`}>
                      {m === 'org' ? childLabel[node.level] : 'Channel'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="hidden sm:grid grid-cols-[1.6fr_1fr_1fr_1.3fr_0.8fr_0.8fr_20px] gap-3 px-4 py-2 bg-paper text-[10px] font-bold text-navy-400 uppercase tracking-wider">
                <span>{mode === 'org' ? childLabel[node.level] : 'Channel'}</span><span className="text-right">Target</span><span className="text-right">Achieved</span><span>Attainment</span><span className="text-right">Coverage</span><span className="text-right">Compliance</span><span />
              </div>
              <div className="divide-y divide-navy-50">
                {(mode === 'org'
                  ? children.map(c => ({ key: c.id, name: c.name, sub: c.level === 'rep' ? c.rep!.channel : `${c.lead} · ${rollUp(inChannel(c)).reps} reps`, s: rollUp(inChannel(c)), act: () => goTo(c.id) }))
                  : channelRows.map(r => ({ key: r.ch, name: r.ch, sub: `${r.s.reps} reps · filter and drill`, s: r.s, act: () => { setChannel(r.ch); setMode('org'); } }))
                ).map((row, i) => {
                  const b = band(row.s.attainment);
                  return (
                    <button
                      key={row.key}
                      ref={i === 0 ? firstRowRef : undefined}
                      onClick={row.act}
                      className="w-full text-left px-4 py-2.5 hover:bg-paper focus:bg-indigo-50 focus:outline-none grid grid-cols-[1fr_auto] sm:grid-cols-[1.6fr_1fr_1fr_1.3fr_0.8fr_0.8fr_20px] gap-x-3 gap-y-1 items-center"
                    >
                      <div className="min-w-0">
                        <p className="font-display font-semibold text-sm text-ink truncate">{row.name}</p>
                        <p className="text-[10px] text-navy-500 truncate">{row.sub}</p>
                      </div>
                      <span className="sm:hidden font-mono text-sm font-bold text-ink text-right">{row.s.attainment}%</span>
                      <span className="hidden sm:block font-mono text-xs text-navy-700 text-right">₦{row.s.target.toFixed(1)}M</span>
                      <span className="hidden sm:block font-mono text-xs font-bold text-ink text-right">₦{row.s.achieved.toFixed(1)}M</span>
                      <div className="col-span-2 sm:col-span-1 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-navy-100 overflow-hidden">
                          <div className={`h-full rounded-full ${b.bar}`} style={{ width: `${Math.min(100, row.s.attainment)}%` }} />
                        </div>
                        <span className={`hidden sm:inline font-mono text-[11px] font-bold ${b.c}`}>{row.s.attainment}%</span>
                      </div>
                      <span className="hidden sm:block font-mono text-xs text-navy-700 text-right">{row.s.coverage}%</span>
                      <span className="hidden sm:block font-mono text-xs text-navy-700 text-right">{row.s.compliance}%</span>
                      <Icon name="chevronRight" size={14} className="hidden sm:block text-navy-300" />
                      <p className="sm:hidden col-span-2 text-[10px] text-navy-500 font-mono">₦{row.s.achieved.toFixed(1)}M / ₦{row.s.target.toFixed(1)}M · cov {row.s.coverage}% · comp {row.s.compliance}%</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : rep && (
            <div className="rounded-2xl border border-navy-100 overflow-hidden">
              <div className="p-4 flex items-center gap-3 border-b border-navy-100">
                <div className="w-12 h-12 rounded-full bg-leaf-100 text-leaf-700 font-display font-bold flex items-center justify-center">
                  {node.name.split(' ').map(x => x[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-ink">{node.name}</p>
                  <p className="text-[11px] text-navy-500">{rep.channel} rep · {areaName} · last visit {rep.lastVisit}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-navy-100">
                {[
                  { l: 'Visits logged', v: `${rep.visits}`, s: `${rep.compliant} GPS-compliant` },
                  { l: 'Orders', v: `${rep.orders}`, s: `₦${rep.orderValue.toFixed(1)}M this cycle` },
                  { l: 'Coverage', v: `${rep.covered}/${rep.customers}`, s: `${Math.round((rep.covered / rep.customers) * 100)}% of call plan` },
                  { l: 'Target', v: `₦${rep.achieved.toFixed(1)}M`, s: `of ₦${rep.target.toFixed(1)}M Q2` },
                ].map(k => (
                  <div key={k.l} className="p-4">
                    <p className="stat-label text-navy-400">{k.l}</p>
                    <p className="font-display text-xl font-bold text-ink mt-0.5">{k.v}</p>
                    <p className="text-[10px] text-navy-500">{k.s}</p>
                  </div>
                ))}
              </div>
              {rep.topAccounts.length > 0 && (
                <div className="px-4 py-3 border-t border-navy-100">
                  <p className="stat-label text-navy-400 mb-1.5">Top accounts</p>
                  <div className="flex flex-wrap gap-1.5">
                    {rep.topAccounts.map(a => <span key={a} className="px-2 py-1 rounded-lg bg-paper border border-navy-100 text-[11px] text-navy-700">{a}</span>)}
                  </div>
                </div>
              )}
              <div className="px-4 py-3 border-t border-navy-100 flex gap-2 flex-wrap">
                <button ref={firstRowRef} onClick={() => setNote(`Coaching session requested with ${node.name}. Their line manager has been copied.`)} className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold btn-press hover:bg-indigo-700 flex items-center gap-1.5">
                  <Icon name="calendar" size={12} /> Schedule coaching
                </button>
                <button onClick={() => setNote(`Note sent to ${node.name}: "Please review your Q2 gap with your ASM this week."`)} className="px-3 py-2 rounded-lg border border-navy-200 text-xs font-bold text-navy-700 hover:bg-paper btn-press flex items-center gap-1.5">
                  <Icon name="send" size={12} /> Send note
                </button>
              </div>
            </div>
          )}

          {note && (
            <div className="p-3 rounded-xl bg-leaf-50 border border-leaf-200 flex items-center gap-2 fade-up">
              <Icon name="checkCircle" size={14} className="text-leaf-700" />
              <p className="text-xs text-leaf-800">{note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
