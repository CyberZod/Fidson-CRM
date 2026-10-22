import Icon from './Icon';
import type { DuplicateMatch } from '../assets/leads';

interface DuplicatePromptProps {
  matches: DuplicateMatch[];
  onMerge: (match: DuplicateMatch) => void;
  onKeepBoth: () => void;
  onOpen: (match: DuplicateMatch) => void;
}

// Inline prompt shown when a save hits a fuzzy match. Top match drives the buttons.
export default function DuplicatePrompt({ matches, onMerge, onKeepBoth, onOpen }: DuplicatePromptProps) {
  if (!matches.length) return null;
  const top = matches[0];
  return (
    <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-3 fade-up">
      <div className="flex items-start gap-2">
        <Icon name="alert" size={16} className="text-amber-700 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-amber-800">Possible duplicate</p>
          <p className="text-xs text-navy-700 mt-0.5">
            <span className="font-semibold">{top.name}</span> · {top.org}
            {top.owner ? ` · ${top.kind === 'account' ? 'account of' : 'lead of'} ${top.owner}` : ''}
          </p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-200 text-amber-800">{top.score}% match</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white text-navy-600 border border-amber-200">{top.kind === 'account' ? 'Existing customer' : 'Open lead'}</span>
            {top.reasons.map(r => <span key={r} className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white text-navy-600 border border-amber-200">{r}</span>)}
          </div>
          {matches.length > 1 && (
            <p className="text-[10px] text-navy-500 mt-1.5">Also similar: {matches.slice(1).map(m => `${m.name} (${m.score}%)`).join(', ')}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3">
        <button type="button" onClick={() => onMerge(top)} className="min-h-[44px] rounded-lg bg-navy-800 text-white text-xs font-bold btn-press">Merge</button>
        <button type="button" onClick={onKeepBoth} className="min-h-[44px] rounded-lg bg-white border border-navy-200 text-navy-700 text-xs font-bold btn-press">Keep both</button>
        <button type="button" onClick={() => onOpen(top)} className="min-h-[44px] rounded-lg bg-white border border-navy-200 text-navy-700 text-xs font-bold btn-press">Open existing</button>
      </div>
    </div>
  );
}
