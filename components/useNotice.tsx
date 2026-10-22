import { useEffect, useRef, useState, type ReactNode } from 'react';
import Icon from './Icon';
import type { ToastInput } from '../types';

// Uses the app toast when the screen is given one, else shows its own pill at the bottom.
export function useNotice(onToast?: (t: ToastInput) => void): { notify: (t: ToastInput) => void; node: ReactNode } {
  const [current, setCurrent] = useState<ToastInput | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const notify = (t: ToastInput) => {
    if (onToast) { onToast(t); return; }
    setCurrent(t);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCurrent(null), 3500);
  };

  const node = current ? (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[70] fade-up px-4 w-full max-w-sm">
      <div className={`rounded-xl shadow-2xl border px-4 py-3 flex items-start gap-2.5 bg-white ${
        current.type === 'error' ? 'border-rose-200' : current.type === 'info' ? 'border-sky-200' : 'border-leaf-200'
      }`}>
        <Icon
          name={current.type === 'error' ? 'xCircle' : current.type === 'info' ? 'bell' : 'checkCircle'}
          size={16}
          className={`mt-0.5 flex-shrink-0 ${current.type === 'error' ? 'text-rose-600' : current.type === 'info' ? 'text-sky-600' : 'text-leaf-600'}`}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-display font-bold text-ink">{current.title}</p>
          {current.msg && <p className="text-[11px] text-navy-500 mt-0.5">{current.msg}</p>}
        </div>
        <button onClick={() => setCurrent(null)} className="text-navy-400 hover:text-navy-700" aria-label="Dismiss">
          <Icon name="x" size={14} />
        </button>
      </div>
    </div>
  ) : null;

  return { notify, node };
}

export const clockNow = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
