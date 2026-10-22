import { useEffect, useMemo, useState } from 'react';
import Icon from './Icon';
import { useNotice } from './useNotice';
import { LIVE_REP, useMarketing, type Material } from '../stores/marketing';
import type { ToastInput } from '../types';

interface RepMaterialsViewProps {
  rep?: string;
  onToast?: (t: ToastInput) => void;
}

const catChip: Record<string, string> = {
  Clinical: 'bg-leaf-50 text-leaf-700',
  Competitive: 'bg-rose-50 text-rose-700',
  Marketing: 'bg-amber-50 text-amber-700',
  Detailing: 'bg-violet-50 text-violet-700',
};

export default function RepMaterialsView({ rep = LIVE_REP, onToast }: RepMaterialsViewProps) {
  const { libraryFor, offline, saveOffline, removeOffline, markOpened } = useMarketing();
  const { notify, node } = useNotice(onToast);
  const [filter, setFilter] = useState<'all' | 'offline'>('all');
  const [noSignal, setNoSignal] = useState(false);
  const [saving, setSaving] = useState<Record<string, number>>({});
  const [viewing, setViewing] = useState<Material | null>(null);

  const library = libraryFor(rep);
  const shown = filter === 'offline' ? library.filter(m => offline[m.id]) : library;
  const savedMb = library.filter(m => offline[m.id]).reduce((s, m) => s + m.sizeMb, 0);

  const startSave = (m: Material) => {
    setSaving(s => ({ ...s, [m.id]: 0 }));
    let p = 0;
    const t = window.setInterval(() => {
      p += 20;
      setSaving(s => ({ ...s, [m.id]: p }));
      if (p >= 100) {
        window.clearInterval(t);
        setSaving(s => { const n = { ...s }; delete n[m.id]; return n; });
        saveOffline(m.id);
        notify({ type: 'success', title: 'Saved for offline', msg: `${m.title} · ${m.sizeMb} MB on this phone` });
      }
    }, 220);
  };

  const open = (m: Material) => {
    markOpened(m.id);
    setViewing(m);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1100px] mx-auto space-y-5">
      <div className="fade-up">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">Detailing Materials</h2>
        <p className="text-sm text-navy-500 mt-1">Approved by Marketing · save to your phone before you leave signal</p>
      </div>

      <div className="fade-up stagger-1 grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-navy-100">
          <p className="stat-label text-navy-400">Available to you</p>
          <p className="font-display text-2xl font-bold text-ink mt-1">{library.length}</p>
          <p className="text-[11px] text-navy-500 mt-0.5">{library.filter(m => m.isNew).length} new this week</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-navy-100">
          <p className="stat-label text-navy-400">On this phone</p>
          <p className="font-display text-2xl font-bold text-ink mt-1">{library.filter(m => offline[m.id]).length}</p>
          <p className="text-[11px] text-navy-500 mt-0.5">{savedMb.toFixed(1)} MB used</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1 bg-paper rounded-lg p-1">
          {([{ k: 'all', l: 'All' }, { k: 'offline', l: 'Saved offline' }] as const).map(f => (
            <button key={f.k} onClick={() => setFilter(f.k)} className={`px-3 py-1.5 rounded-md text-[11px] font-bold ${filter === f.k ? 'bg-white text-ink shadow-sm' : 'text-navy-500'}`}>{f.l}</button>
          ))}
        </div>
        <button
          onClick={() => setNoSignal(!noSignal)}
          className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 btn-press ${noSignal ? 'bg-navy-700 text-white border-navy-700' : 'bg-white text-navy-700 border-navy-200'}`}
        >
          <Icon name={noSignal ? 'eyeOff' : 'activity'} size={12} /> {noSignal ? 'No signal (simulated)' : 'Online'}
        </button>
      </div>

      {noSignal && (
        <div className="p-3 rounded-xl bg-navy-50 border border-navy-200 text-xs text-navy-700 flex items-center gap-2">
          <Icon name="alert" size={14} className="text-navy-500 flex-shrink-0" /> You are offline. Materials saved to this phone still open.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {shown.length === 0 && (
          <div className="sm:col-span-2 py-12 text-center rounded-2xl bg-white border border-navy-100">
            <Icon name="download" size={24} className="text-navy-300 mx-auto mb-2" />
            <p className="font-display font-semibold text-ink">Nothing saved yet</p>
            <p className="text-xs text-navy-500 mt-1">Tap "Save offline" on a material to keep it on this phone</p>
          </div>
        )}
        {shown.map(m => {
          const isSaved = !!offline[m.id];
          const progress = saving[m.id];
          const blocked = noSignal && !isSaved;
          return (
            <div key={m.id} className="p-4 rounded-2xl bg-white border border-navy-100 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                  <Icon name="file" size={18} className="text-violet-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-display font-bold text-sm text-ink leading-tight">{m.title}</p>
                    {m.isNew && <span className="px-1.5 py-0.5 rounded bg-violet-500 text-white text-[9px] font-bold">NEW</span>}
                  </div>
                  <p className="text-[11px] text-navy-500 mt-0.5">{m.product} · {m.format} · {m.pages} {m.format === 'PPT' ? 'slides' : 'pages'} · v{m.version}</p>
                  <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${catChip[m.cat]}`}>{m.cat.toUpperCase()}</span>
                    <span className="text-[10px] text-navy-400">Approved by {m.approvedBy} · {m.approvedAt}</span>
                  </div>
                </div>
              </div>

              {progress !== undefined ? (
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-violet-700 mb-1"><span>Saving to phone</span><span className="font-mono">{progress}%</span></div>
                  <div className="h-1.5 rounded-full bg-navy-100 overflow-hidden"><div className="h-full bg-violet-500 transition-all" style={{ width: `${progress}%` }} /></div>
                </div>
              ) : isSaved ? (
                <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-leaf-50 border border-leaf-200">
                  <span className="text-[11px] font-bold text-leaf-700 flex items-center gap-1"><Icon name="checkCircle" size={12} /> Available offline · {m.sizeMb} MB</span>
                  <button onClick={() => { removeOffline(m.id); notify({ type: 'info', title: 'Removed from phone', msg: `${m.title} · ${m.sizeMb} MB freed` }); }} className="text-[10px] font-bold text-navy-500 hover:text-rose-600">Remove</button>
                </div>
              ) : null}

              <div className="flex gap-2">
                {!isSaved && progress === undefined && (
                  <button
                    onClick={() => startSave(m)}
                    disabled={noSignal}
                    className="flex-1 py-2.5 rounded-lg border border-violet-200 bg-violet-50 text-violet-700 text-xs font-bold btn-press disabled:opacity-40 flex items-center justify-center gap-1.5"
                  >
                    <Icon name="download" size={13} /> Save offline · {m.sizeMb} MB
                  </button>
                )}
                <button
                  onClick={() => open(m)}
                  disabled={blocked}
                  className="flex-1 py-2.5 rounded-lg bg-violet-600 text-white text-xs font-bold btn-press hover:bg-violet-700 disabled:opacity-40 flex items-center justify-center gap-1.5"
                >
                  <Icon name="eye" size={13} /> {blocked ? 'Needs signal' : 'Open'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {viewing && <MaterialViewer material={viewing} offline={!!offline[viewing.id]} onClose={() => setViewing(null)} />}
      {node}
    </div>
  );
}

interface MaterialViewerProps {
  material: Material;
  offline?: boolean;
  onClose: () => void;
  footer?: string;
}

export function MaterialViewer({ material: m, offline = false, onClose, footer }: MaterialViewerProps) {
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(!offline);
  const shownPages = Math.min(m.pages, 4);

  useEffect(() => {
    if (offline) return;
    const t = window.setTimeout(() => setLoading(false), 900);
    return () => window.clearTimeout(t);
  }, [offline]);

  const pages = useMemo(() => [
    <div key="cover" className="h-full flex flex-col justify-between p-6 bg-gradient-to-br from-violet-600 to-navy-800 text-white rounded-lg">
      <p className="text-[10px] font-bold tracking-widest uppercase opacity-80">Fidson Healthcare Plc · {m.cat}</p>
      <div>
        <p className="font-display text-2xl font-bold leading-tight">{m.title}</p>
        <p className="text-sm opacity-90 mt-1">{m.product}</p>
      </div>
      <p className="text-[10px] opacity-70">Version {m.version} · For healthcare professionals only</p>
    </div>,
    <div key="msgs" className="h-full p-6 bg-white rounded-lg">
      <p className="text-[10px] font-bold text-violet-700 tracking-wider uppercase">Key messages</p>
      <ol className="mt-3 space-y-3">
        {m.keyMessages.map((k, i) => (
          <li key={i} className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
            <span className="text-sm text-ink">{k}</span>
          </li>
        ))}
      </ol>
    </div>,
    <div key="table" className="h-full p-6 bg-white rounded-lg">
      <p className="text-[10px] font-bold text-violet-700 tracking-wider uppercase">Dosing summary</p>
      <table className="w-full mt-3 text-xs">
        <thead><tr className="border-b border-navy-100 text-navy-500"><th className="py-1.5 text-left">Patient</th><th className="py-1.5 text-left">Dose</th><th className="py-1.5 text-left">Frequency</th></tr></thead>
        <tbody className="divide-y divide-navy-50 text-ink">
          <tr><td className="py-1.5">Adults</td><td>1 tablet</td><td>Twice daily</td></tr>
          <tr><td className="py-1.5">Children 6 to 12</td><td>½ tablet</td><td>Twice daily</td></tr>
          <tr><td className="py-1.5">Children 2 to 5</td><td>Syrup 5 ml</td><td>Three times daily</td></tr>
        </tbody>
      </table>
      <p className="text-[10px] text-navy-400 mt-3">Refer to the full prescribing information.</p>
    </div>,
    <div key="refs" className="h-full p-6 bg-white rounded-lg">
      <p className="text-[10px] font-bold text-violet-700 tracking-wider uppercase">References and approval</p>
      <div className="mt-3 space-y-2">
        {[85, 70, 92, 60].map((w, i) => <div key={i} className="h-2 rounded bg-navy-100" style={{ width: `${w}%` }} />)}
      </div>
      <p className="text-[11px] text-navy-500 mt-4">Approved for field use by {m.approvedBy ?? 'Marketing (pending)'}{m.approvedAt ? ` · ${m.approvedAt}` : ''}</p>
    </div>,
  ], [m]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center fade-in" style={{ background: 'rgba(10, 24, 48, 0.6)' }} onClick={onClose}>
      <div className="bg-paper w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-4 py-3 bg-white border-b border-navy-100 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-sm text-ink truncate">{m.title}</p>
            <p className="text-[10px] text-navy-500 font-mono">{m.fileName}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-lg hover:bg-paper flex items-center justify-center" aria-label="Close"><Icon name="x" size={16} /></button>
        </div>
        <div className={`px-4 py-2 text-[11px] font-bold flex items-center gap-1.5 ${offline ? 'bg-leaf-50 text-leaf-700' : 'bg-sky-50 text-sky-700'}`}>
          <Icon name={offline ? 'checkCircle' : 'refresh'} size={12} />
          {footer ?? (offline ? 'Opened offline · copy saved on this phone, no signal needed' : 'Streaming from Fidson library · save offline to open without signal')}
        </div>
        <div className="p-4">
          <div className="aspect-[3/4] max-h-[55vh] mx-auto shadow-lg rounded-lg border border-navy-100 bg-white">
            {loading ? (
              <div className="h-full p-6 space-y-3 animate-pulse">
                <div className="h-6 rounded bg-navy-100 w-2/3" />
                <div className="h-3 rounded bg-navy-100" />
                <div className="h-3 rounded bg-navy-100 w-5/6" />
                <p className="text-[11px] text-navy-400 pt-4">Loading over network</p>
              </div>
            ) : pages[page]}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-2 rounded-lg bg-white border border-navy-200 text-xs font-bold disabled:opacity-40 flex items-center gap-1"><Icon name="chevronLeft" size={12} /> Prev</button>
            <span className="text-[11px] font-mono text-navy-500">Page {page + 1} of {m.pages}</span>
            <button onClick={() => setPage(p => Math.min(shownPages - 1, p + 1))} disabled={page >= shownPages - 1} className="px-3 py-2 rounded-lg bg-white border border-navy-200 text-xs font-bold disabled:opacity-40 flex items-center gap-1">Next <Icon name="chevronRight" size={12} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
