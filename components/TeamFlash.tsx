import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import type { ToastInput } from '../types';

// Inline confirmation strip; also forwards to the app toast when the screen is given one.
export function useFlash(onToast?: (t: ToastInput) => void) {
  const [flash, setFlash] = useState<ToastInput | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const notify = (t: ToastInput) => {
    onToast?.(t);
    setFlash(t);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setFlash(null), 3500);
  };

  const banner = flash ? (
    <div className={`fade-up p-3 rounded-xl border flex items-start gap-2 ${
      flash.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : flash.type === 'info' ? 'bg-sky-50 border-sky-200 text-sky-800' : 'bg-leaf-50 border-leaf-200 text-leaf-800'
    }`}>
      <Icon name={flash.type === 'error' ? 'alert' : 'checkCircle'} size={16} className="mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold">{flash.title}</p>
        {flash.msg && <p className="text-[11px] mt-0.5 opacity-80">{flash.msg}</p>}
      </div>
      <button onClick={() => setFlash(null)} aria-label="Dismiss" className="opacity-60 hover:opacity-100">
        <Icon name="x" size={14} />
      </button>
    </div>
  ) : null;

  return { banner, notify };
}
