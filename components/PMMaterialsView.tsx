import { useState } from 'react';
import Icon from './Icon';
import type { MaterialItem } from '../types';

interface PMMaterialsViewProps {
  onPushMaterial: (material: MaterialItem) => void;
}

export default function PMMaterialsView({ onPushMaterial }: PMMaterialsViewProps) {
  const [showPushModal, setShowPushModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialItem | null>(null);

  const materials: MaterialItem[] = [
    { id: 1, n: 'Coflin Paediatric Dosing Guide', v: '2.1', size: 'PDF · 4 pages', updated: 'Today', cat: 'Clinical', pushed: 142, opened: 128, new: true },
    { id: 2, n: 'Coflin Clinical Trial Brief', v: '1.4', size: 'PDF · 12 pages', updated: '3 days ago', cat: 'Clinical', pushed: 142, opened: 98 },
    { id: 3, n: 'Coflin Q2 Detailing Deck', v: '3.0', size: 'PPT · 24 slides', updated: '1 week ago', cat: 'Detailing', pushed: 142, opened: 131 },
    { id: 4, n: 'Augmentin Counter-Detail Brief', v: '1.0', size: 'PDF · 6 pages', updated: 'Today', cat: 'Competitive', pushed: 0, opened: 0, new: true },
    { id: 5, n: 'Tuxil-N OTC Detailing Deck', v: '2.2', size: 'PPT · 18 slides', updated: '2 weeks ago', cat: 'Detailing', pushed: 42, opened: 38 },
    { id: 6, n: 'Respiratory Portfolio Brochure', v: '1.0', size: 'PDF · 8 pages', updated: '1 month ago', cat: 'Marketing', pushed: 142, opened: 120 },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="fade-up flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Detailing Materials Library</h2>
          <p className="text-sm text-navy-500 mt-1">Push approved materials directly to rep apps · Track open rates</p>
        </div>
        <button className="px-3 py-2 rounded-lg bg-violet-500 text-white text-xs font-bold flex items-center gap-1.5 btn-press hover:bg-violet-600">
          <Icon name="plus" size={12} /> Upload Material
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {materials.map((m, i) => (
          <div key={m.id} className={`fade-up stagger-${(i % 5) + 1} p-5 rounded-2xl bg-white border border-navy-100 card-hover`}>
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                <Icon name="file" size={18} className="text-violet-700" />
              </div>
              {m.new && <span className="px-1.5 py-0.5 rounded bg-violet-500 text-white text-[9px] font-bold">NEW</span>}
            </div>
            <h4 className="font-display font-bold text-ink text-sm mt-3 leading-tight">{m.n}</h4>
            <p className="text-[11px] text-navy-500 mt-0.5">{m.size} · v{m.v}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                m.cat === 'Clinical' ? 'bg-leaf-50 text-leaf-700' :
                m.cat === 'Competitive' ? 'bg-rose-50 text-rose-700' :
                m.cat === 'Marketing' ? 'bg-amber-50 text-amber-700' :
                'bg-violet-50 text-violet-700'
              }`}>{m.cat.toUpperCase()}</span>
            </div>

            {m.pushed > 0 ? (
              <div className="mt-4 pt-3 border-t border-navy-100">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[10px] font-bold text-navy-500 tracking-wider uppercase">Open Rate</span>
                  <span className="font-mono text-xs font-bold text-ink">{Math.round((m.opened / m.pushed) * 100)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-navy-100 overflow-hidden">
                  <div className="h-full rounded-full bg-violet-500" style={{ width: `${(m.opened / m.pushed) * 100}%` }} />
                </div>
                <p className="text-[10px] text-navy-500 mt-1.5">{m.opened} / {m.pushed} reps opened</p>
              </div>
            ) : (
              <div className="mt-4 pt-3 border-t border-navy-100">
                <p className="text-[10px] text-amber-700 font-bold">Not pushed yet</p>
              </div>
            )}

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => { setSelectedMaterial(m); setShowPushModal(true); }}
                className="flex-1 px-3 py-1.5 rounded-lg bg-violet-500 text-white text-xs font-bold hover:bg-violet-600 btn-press flex items-center justify-center gap-1.5"
              >
                <Icon name="send" size={11} /> Push to Reps
              </button>
              <button className="px-2 py-1.5 rounded-lg bg-paper border border-navy-200 text-navy-700 hover:bg-navy-50 btn-press">
                <Icon name="eye" size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showPushModal && selectedMaterial && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center fade-in"
          style={{ background: 'rgba(10, 24, 48, 0.5)' }}
          onClick={() => setShowPushModal(false)}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 slide-in-right" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between">
              <h3 className="font-display font-bold text-ink">Push Material to Reps</h3>
              <button onClick={() => setShowPushModal(false)} className="w-8 h-8 rounded-lg hover:bg-paper flex items-center justify-center">
                <Icon name="x" size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-3 rounded-xl bg-paper border border-navy-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Icon name="file" size={16} className="text-violet-700" />
                </div>
                <div className="flex-1">
                  <p className="font-display font-bold text-sm text-ink">{selectedMaterial.n}</p>
                  <p className="text-[11px] text-navy-500">{selectedMaterial.size} · v{selectedMaterial.v}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-navy-700 tracking-wider uppercase mb-2">Target Audience</p>
                <div className="space-y-2">
                  {[
                    { l: 'All Medical Reps (Institution)', c: 89, def: true },
                    { l: 'Trade Reps', c: 38, def: false },
                    { l: 'Mobile & Frontline Reps', c: 15, def: false },
                  ].map((g, i) => (
                    <label key={i} className="flex items-center gap-2 p-2 rounded-lg bg-paper cursor-pointer">
                      <input type="checkbox" defaultChecked={g.def} className="w-4 h-4 accent-violet-500" />
                      <span className="text-sm text-navy-700 flex-1">{g.l}</span>
                      <span className="text-xs font-mono text-navy-500">{g.c}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-navy-700 tracking-wider uppercase mb-2">Note to Reps (optional)</p>
                <textarea
                  rows={2}
                  placeholder="e.g. Use this brief for Augmentin comparison conversations"
                  className="input-field w-full p-2 rounded-lg bg-paper border border-navy-200 text-sm resize-none"
                />
              </div>

              <label className="flex items-center gap-2 p-3 rounded-xl border border-violet-200 bg-violet-50/30 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-violet-500" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink">Trigger rep training</p>
                  <p className="text-[11px] text-navy-500">In-app task assigned to all targeted reps</p>
                </div>
              </label>
            </div>
            <div className="px-5 py-4 border-t border-navy-100 flex gap-2">
              <button onClick={() => setShowPushModal(false)} className="flex-1 py-2.5 rounded-lg border border-navy-200 text-sm font-bold text-navy-700 hover:bg-paper btn-press">Cancel</button>
              <button
                onClick={() => { onPushMaterial(selectedMaterial); setShowPushModal(false); }}
                className="flex-1 py-2.5 rounded-lg bg-violet-500 text-white text-sm font-bold hover:bg-violet-600 btn-press flex items-center justify-center gap-1.5"
              >
                <Icon name="send" size={14} /> Push Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
