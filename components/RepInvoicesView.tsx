import Icon from './Icon';
import type { OrderRow } from '../types';

interface RepInvoicesViewProps {
  orders?: OrderRow[];
}

// An invoice exists once an order clears the approval gate. Business Central is the
// real generator in production; here we surface the rep-facing copy off order status.
// ponytail: derived from orders, no parallel state · discount-approval flips status and the invoice appears.
const INVOICED = new Set(['approved', 'synced', 'sent-to-sales-admin']);

const stage = (s: OrderRow['status']) =>
  s === 'synced' ? { t: 'Paid · synced to BC', c: 'text-leaf-700 bg-leaf-50 border-leaf-200' }
    : s === 'approved' ? { t: 'Invoice generated', c: 'text-sky-700 bg-sky-50 border-sky-200' }
      : { t: 'With Sales Admin', c: 'text-amber-700 bg-amber-50 border-amber-200' };

export default function RepInvoicesView({ orders = [] }: RepInvoicesViewProps) {
  const invoices = orders.filter(o => INVOICED.has(o.status));
  const pending = orders.filter(o => o.status === 'pending');

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1100px] mx-auto space-y-6">
      <div className="fade-up">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">My Invoices</h2>
        <p className="text-sm text-navy-500 mt-1">Auto-generated when an order is approved · Business Central is the system of record</p>
      </div>

      {pending.length > 0 && (
        <div className="fade-up p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3">
          <Icon name="alert" size={18} className="text-amber-700 flex-shrink-0" />
          <p className="text-xs text-navy-700">{pending.length} order{pending.length > 1 ? 's' : ''} awaiting discount approval · an invoice generates automatically once approved.</p>
        </div>
      )}

      <div className="space-y-2 fade-up stagger-1">
        {invoices.length === 0 ? (
          <div className="py-12 text-center rounded-2xl bg-white border border-navy-100">
            <div className="w-14 h-14 rounded-full bg-paper mx-auto flex items-center justify-center mb-3">
              <Icon name="file" size={24} className="text-navy-400" />
            </div>
            <p className="font-display font-semibold text-ink">No invoices yet</p>
            <p className="text-xs text-navy-500 mt-1">Approved orders appear here as invoices</p>
          </div>
        ) : invoices.map(o => {
          const st = stage(o.status);
          return (
            <div key={o.id} className="p-4 sm:p-5 rounded-2xl bg-white border border-navy-100 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-navy-50 flex items-center justify-center flex-shrink-0">
                <Icon name="file" size={18} className="text-navy-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-display font-bold text-sm text-ink">{o.id.replace('FDS-', 'INV-')}</p>
                  <span className="text-[10px] text-navy-400 font-mono">from {o.id}</span>
                </div>
                <p className="text-xs text-navy-600 mt-0.5 truncate">{o.cust}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-mono font-bold text-ink text-sm">{o.value}</p>
                <p className="text-[10px] text-navy-400">{o.disc} disc.</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex-shrink-0 ${st.c}`}>{st.t}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
