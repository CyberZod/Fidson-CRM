import Icon from './Icon';
import type { Toast } from '../types';

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full sm:w-auto px-4 sm:px-0">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`${t.dismissing ? 'toast-out' : 'toast-in'} bg-white border rounded-xl shadow-lg overflow-hidden flex items-center gap-3 p-3 pr-4`}
          style={{ borderColor: t.type === 'success' ? '#C5E7B5' : t.type === 'error' ? '#FECACA' : '#DCE3F2' }}
        >
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
              t.type === 'success' ? 'bg-leaf-50 text-leaf-600' :
              t.type === 'error' ? 'bg-rose-50 text-rose-600' :
              'bg-navy-50 text-navy-600'
            }`}
          >
            <Icon name={t.type === 'success' ? 'check' : t.type === 'error' ? 'x' : 'bell'} size={18} strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-semibold text-sm text-ink">{t.title}</p>
            {t.msg && <p className="text-xs text-navy-500 mt-0.5">{t.msg}</p>}
          </div>
          <button onClick={() => onDismiss(t.id)} className="text-navy-300 hover:text-navy-700">
            <Icon name="x" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
