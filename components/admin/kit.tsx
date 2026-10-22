import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import Icon from '../Icon';
import type { IconName, ToastInput } from '../../types';

// Shared building blocks for the admin console screens.

export interface AdminScreenProps {
  onToast?: (t: ToastInput) => void;
}

export type Tone = 'leaf' | 'navy' | 'amber' | 'rose' | 'sky' | 'violet' | 'muted';

const TONE: Record<Tone, string> = {
  leaf: 'bg-leaf-100 text-leaf-700',
  navy: 'bg-navy-100 text-navy-700',
  amber: 'bg-amber-100 text-amber-700',
  rose: 'bg-rose-100 text-rose-700',
  sky: 'bg-sky-100 text-sky-700',
  violet: 'bg-violet-100 text-violet-700',
  muted: 'bg-navy-50 text-navy-500',
};

export function Badge({ tone = 'navy', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${TONE[tone]}`}>{children}</span>;
}

export function AdminPage({ title, subtitle, icon, actions, children, wide = true }: {
  title: string; subtitle?: string; icon: IconName; actions?: ReactNode; children: ReactNode; wide?: boolean;
}) {
  return (
    <div className={`p-4 sm:p-6 lg:p-8 ${wide ? 'max-w-[1400px]' : 'max-w-[1000px]'} mx-auto space-y-5`}>
      <div className="fade-up flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-navy-800 text-white flex items-center justify-center flex-shrink-0">
            <Icon name={icon} size={20} />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">{title}</h2>
            {subtitle && <p className="text-xs sm:text-sm text-navy-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export function Card({ title, actions, children, className = '', pad = true }: {
  title?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string; pad?: boolean;
}) {
  return (
    <div className={`fade-up rounded-2xl bg-white border border-navy-100 overflow-hidden ${className}`}>
      {(title || actions) && (
        <div className="px-4 sm:px-5 py-3 border-b border-navy-100 flex items-center justify-between gap-2 flex-wrap">
          {title && <h3 className="font-display font-bold text-sm text-ink">{title}</h3>}
          {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
        </div>
      )}
      <div className={pad ? 'p-4 sm:p-5' : ''}>{children}</div>
    </div>
  );
}

export function Stat({ label, value, note, tone = 'navy' }: { label: string; value: ReactNode; note?: string; tone?: Tone }) {
  const c = tone === 'leaf' ? 'text-leaf-700' : tone === 'rose' ? 'text-rose-700' : tone === 'amber' ? 'text-amber-700' : 'text-navy-500';
  return (
    <div className="fade-up p-4 rounded-2xl bg-white border border-navy-100">
      <p className="stat-label text-navy-400">{label}</p>
      <p className="font-display text-2xl font-bold text-ink mt-1">{value}</p>
      {note && <p className={`text-[11px] font-semibold mt-1 ${c}`}>{note}</p>}
    </div>
  );
}

type BtnKind = 'primary' | 'secondary' | 'danger' | 'ghost';
const BTN: Record<BtnKind, string> = {
  primary: 'bg-leaf-500 text-white hover:bg-leaf-600',
  secondary: 'border border-navy-200 text-navy-700 bg-white hover:bg-navy-50',
  danger: 'border border-rose-200 text-rose-700 bg-white hover:bg-rose-50',
  ghost: 'text-navy-600 hover:bg-navy-50',
};

export function Btn({ kind = 'secondary', icon, children, className = '', ...rest }: {
  kind?: BtnKind; icon?: IconName; children?: ReactNode; className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" {...rest}
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold btn-press focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400 disabled:opacity-40 disabled:pointer-events-none ${BTN[kind]} ${className}`}>
      {icon && <Icon name={icon} size={14} />}
      {children}
    </button>
  );
}

export const inputCls = 'input-field w-full px-3 py-2 rounded-lg bg-white border border-navy-200 text-sm text-ink';

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="stat-label text-navy-500">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

export function SearchBox({ value, onChange, placeholder = 'Search' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-navy-400"><Icon name="search" size={14} /></span>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder}
        className="input-field pl-8 pr-3 py-1.5 rounded-lg bg-white border border-navy-200 text-sm text-ink w-full sm:w-64" />
    </div>
  );
}

export function Modal({ open, title, onClose, children, footer, size = 'md' }: {
  open: boolean; title: string; onClose: () => void; children: ReactNode; footer?: ReactNode; size?: 'md' | 'lg';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') closeRef.current(); };
    window.addEventListener('keydown', k);
    const el = ref.current;
    (el?.querySelector<HTMLElement>('[data-modal-body] input, [data-modal-body] select, [data-modal-body] textarea') ?? el?.querySelector<HTMLElement>('button'))?.focus();
    return () => window.removeEventListener('keydown', k);
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-navy-950/40 fade-in" onClick={onClose}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()}
        className={`w-full ${size === 'lg' ? 'sm:max-w-3xl' : 'sm:max-w-lg'} max-h-[90vh] flex flex-col bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl`}>
        <div className="px-5 py-3 border-b border-navy-100 flex items-center justify-between">
          <h3 className="font-display font-bold text-ink">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-navy-500 hover:bg-navy-50"><Icon name="x" size={16} /></button>
        </div>
        <div data-modal-body className="p-5 overflow-y-auto space-y-3">{children}</div>
        {footer && <div className="px-5 py-3 border-t border-navy-100 flex justify-end gap-2 flex-wrap">{footer}</div>}
      </div>
    </div>
  );
}

// Toasts go to the app when it passes onToast; otherwise a local banner shows.
export function useNotice(onToast?: (t: ToastInput) => void) {
  const [notice, setNotice] = useState<ToastInput | null>(null);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(t);
  }, [notice]);
  const notify = (title: string, msg?: string, type: ToastInput['type'] = 'success') => {
    if (onToast) onToast({ type, title, msg });
    else setNotice({ type, title, msg });
  };
  const banner = notice ? (
    <div role="status" className={`fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-[70] fade-up px-4 py-3 rounded-xl shadow-lg border text-sm ${notice.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : notice.type === 'info' ? 'bg-sky-50 border-sky-200 text-sky-800' : 'bg-leaf-50 border-leaf-200 text-leaf-800'}`}>
      <p className="font-bold">{notice.title}</p>
      {notice.msg && <p className="text-xs mt-0.5">{notice.msg}</p>}
    </div>
  ) : null;
  return { notify, banner };
}

export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadText(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
      className={`relative w-9 h-5 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400 ${on ? 'bg-leaf-500' : 'bg-navy-200'}`}>
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${on ? 'left-[18px]' : 'left-0.5'}`} />
    </button>
  );
}

export const thCls = 'px-3 py-2 text-left stat-label text-navy-500 bg-navy-50/60 whitespace-nowrap';
export const tdCls = 'px-3 py-2 text-xs text-navy-700 align-top';
