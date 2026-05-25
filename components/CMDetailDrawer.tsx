import Icon from './Icon';
import { formatNaira } from '../assets/campaigns';
import type { ClinicalMeetingRow, CMCostKind, CMContentKind, IconName } from '../types';

interface CMDetailDrawerProps {
  cm: ClinicalMeetingRow | null;
  onClose: () => void;
  accent?: 'violet' | 'fuchsia';
}

const COST_LABELS: Record<CMCostKind, string> = {
  venue: 'Venue',
  refreshments: 'Refreshments',
  samples: 'Samples',
  print: 'Print materials',
  speaker: 'Speaker',
  transport: 'Transport',
  other: 'Other',
};

const COST_ICONS: Record<CMCostKind, IconName> = {
  venue: 'map',
  refreshments: 'package',
  samples: 'pill',
  print: 'file',
  speaker: 'users',
  transport: 'location',
  other: 'layers',
};

const CONTENT_ICONS: Record<CMContentKind, IconName> = {
  slides: 'layers',
  pdf: 'file',
  'detail-aid': 'file',
  video: 'eye',
  agenda: 'calendar',
};

const CONTENT_LABELS: Record<CMContentKind, string> = {
  slides: 'SLIDES',
  pdf: 'PDF',
  'detail-aid': 'DETAIL AID',
  video: 'VIDEO',
  agenda: 'AGENDA',
};

export default function CMDetailDrawer({ cm, onClose, accent = 'violet' }: CMDetailDrawerProps) {
  if (!cm) return null;
  const materials = cm.materials ?? [];
  const content = cm.content ?? [];
  const totalCost = materials.reduce((s, m) => s + m.amount, 0);
  const accentClasses = accent === 'fuchsia'
    ? { iconBg: 'bg-fuchsia-50', iconText: 'text-fuchsia-700', headerChip: 'bg-fuchsia-100 text-fuchsia-700' }
    : { iconBg: 'bg-violet-50', iconText: 'text-violet-700', headerChip: 'bg-violet-100 text-violet-700' };

  return (
    <div
      className="fixed inset-0 z-40 bg-navy-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 fade-in"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl border border-navy-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl fade-up"
      >
        <div className="px-5 py-4 border-b border-navy-100 flex items-start justify-between sticky top-0 bg-white gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">CM Detail</p>
              {cm.hi && <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[9px] font-bold">HIGH-IMPACT</span>}
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${accentClasses.headerChip}`}>
                {cm.s === 'pm-review' ? 'AWAITING PM' : cm.s === 'hom-review' ? 'AWAITING HOM' : 'APPROVED'}
              </span>
            </div>
            <h3 className="font-display font-bold text-ink mt-1">{cm.t}</h3>
            <p className="text-xs text-navy-500 mt-0.5">{cm.hcp} · {cm.rep} · {cm.date} · {cm.attendees} attendees</p>
          </div>
          <button onClick={onClose} className="text-navy-400 hover:text-navy-700 flex-shrink-0">
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-paper border border-navy-100">
              <p className="stat-label text-navy-400">Budget</p>
              <p className="font-mono font-bold text-ink mt-1">{cm.budget}</p>
            </div>
            <div className="p-3 rounded-xl bg-paper border border-navy-100">
              <p className="stat-label text-navy-400">Itemised Cost</p>
              <p className="font-mono font-bold text-ink mt-1">{materials.length > 0 ? formatNaira(totalCost) : '—'}</p>
            </div>
            <div className="p-3 rounded-xl bg-paper border border-navy-100">
              <p className="stat-label text-navy-400">Attendees</p>
              <p className="font-mono font-bold text-ink mt-1">{cm.attendees}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="stat-label text-navy-400">Materials &amp; Costs</p>
              {materials.length > 0 && (
                <p className="text-[10px] font-mono text-navy-500">{materials.length} line item{materials.length === 1 ? '' : 's'} · {formatNaira(totalCost)}</p>
              )}
            </div>
            {materials.length === 0 ? (
              <p className="text-xs text-navy-500 italic">No itemised costs submitted with this CM.</p>
            ) : (
              <div className="rounded-xl border border-navy-100 overflow-hidden divide-y divide-navy-50">
                {materials.map(m => (
                  <div key={m.id} className="px-3 py-2.5 flex items-center gap-3 hover:bg-paper">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${accentClasses.iconBg}`}>
                      <Icon name={COST_ICONS[m.kind]} size={14} className={accentClasses.iconText} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-navy-400 tracking-wider uppercase">{COST_LABELS[m.kind]}</p>
                      <p className="text-xs text-ink truncate">{m.label}</p>
                    </div>
                    <p className="font-mono text-xs font-bold text-ink">{formatNaira(m.amount)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="stat-label text-navy-400">Meeting Content</p>
              {content.length > 0 && (
                <p className="text-[10px] font-mono text-navy-500">{content.length} item{content.length === 1 ? '' : 's'}</p>
              )}
            </div>
            {content.length === 0 ? (
              <p className="text-xs text-navy-500 italic">No content attached yet.</p>
            ) : (
              <div className="space-y-2">
                {content.map(c => (
                  <div key={c.id} className="p-3 rounded-xl bg-paper border border-navy-100 flex items-center gap-3 hover:bg-white transition-colors">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${accentClasses.iconBg}`}>
                      <Icon name={CONTENT_ICONS[c.kind]} size={14} className={accentClasses.iconText} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-display font-semibold text-ink truncate">{c.name}</p>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${accentClasses.headerChip}`}>{CONTENT_LABELS[c.kind]}</span>
                      </div>
                      {c.size && <p className="text-[10px] text-navy-500 mt-0.5">{c.size}</p>}
                    </div>
                    <button className="px-2.5 py-1 rounded-md border border-navy-200 text-[10px] font-bold text-navy-700 hover:bg-white flex items-center gap-1 flex-shrink-0">
                      <Icon name="eye" size={11} /> Preview
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cm.outcomeNotes && (
            <div className="p-3 rounded-xl bg-leaf-50 border border-leaf-200">
              <p className="text-[10px] font-bold text-leaf-700 tracking-wider uppercase mb-1">Outcome Logged</p>
              <p className="text-xs text-navy-700 leading-relaxed">{cm.outcomeNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
