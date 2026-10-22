import { useState } from 'react';
import Icon from './Icon';
import StatementView from './StatementView';
import { useNotice } from './useNotice';
import type { OrderRow, ToastInput } from '../types';

interface RepInvoicesViewProps {
  orders?: OrderRow[];
  onToast?: (t: ToastInput) => void;
}

// An invoice exists once an order clears the approval gate. Business Central is the
// real generator in production; here we surface the rep-facing copy off order status.
// ponytail: derived from orders, no parallel state · discount-approval flips status and the invoice appears.
const INVOICED = new Set(['approved', 'synced', 'sent-to-sales-admin']);

const stage = (s: OrderRow['status']) =>
  s === 'synced' ? { t: 'Paid · synced to BC', c: 'text-leaf-700 bg-leaf-50 border-leaf-200' }
    : s === 'approved' ? { t: 'Invoice generated', c: 'text-sky-700 bg-sky-50 border-sky-200' }
      : { t: 'With Sales Admin', c: 'text-amber-700 bg-amber-50 border-amber-200' };

const PRICES: Record<string, number> = { 'Coflin Forte 600mg': 8_500, 'Astrazon 10mg': 9_650, 'Tuxil-N Syrup 100ml': 2_800 };

// split the order value into believable lines (unit price × qty) so the invoice reads like the BC copy
const invoiceLines = (o: OrderRow) => {
  const net = Number(o.value.replace(/[^\d]/g, '')) || 0;
  const pct = (parseFloat(o.disc) || 0) / 100;
  const gross = Math.round(net / (1 - pct));
  const names = Object.keys(PRICES);
  const first = names[o.id.charCodeAt(o.id.length - 1) % names.length];
  const second = names[(names.indexOf(first) + 1) % names.length];
  const aQty = Math.max(1, Math.floor((gross * 0.7) / PRICES[first]));
  const aAmt = aQty * PRICES[first];
  const bAmt = gross - aAmt;
  const bQty = Math.max(1, Math.round(bAmt / PRICES[second]));
  return { net, gross, discount: gross - net, lines: [
    { p: first, qty: aQty, unit: PRICES[first], amt: aAmt },
    { p: second, qty: bQty, unit: Math.round(bAmt / bQty), amt: bAmt },
  ] };
};

const naira = (n: number) => `₦${n.toLocaleString()}`;

export default function RepInvoicesView({ orders = [], onToast }: RepInvoicesViewProps) {
  const { notify, node } = useNotice(onToast);
  const [tab, setTab] = useState<'invoices' | 'statement'>('invoices');
  const [openId, setOpenId] = useState<string | null>(null);
  const invoices = orders.filter(o => INVOICED.has(o.status));
  const pending = orders.filter(o => o.status === 'pending');
  const opened = invoices.find(o => o.id === openId);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1100px] mx-auto space-y-6">
      <div className="fade-up">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">Invoices & Statements</h2>
        <p className="text-sm text-navy-500 mt-1">Auto-generated when an order is approved · Business Central is the system of record</p>
      </div>

      <div className="flex items-center gap-1 bg-paper rounded-lg p-1 w-fit">
        {([{ k: 'invoices', l: `Invoices ${invoices.length}` }, { k: 'statement', l: 'Statement of account' }] as const).map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} className={`px-3 py-1.5 rounded-md text-[11px] font-bold ${tab === t.k ? 'bg-white text-ink shadow-sm' : 'text-navy-500'}`}>{t.l}</button>
        ))}
      </div>

      {tab === 'statement' ? (
        <StatementView onToast={onToast} />
      ) : (
        <>
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
                <button key={o.id} onClick={() => setOpenId(o.id)} className="w-full text-left p-4 sm:p-5 rounded-2xl bg-white border border-navy-100 hover:border-navy-200 flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
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
                </button>
              );
            })}
          </div>
        </>
      )}

      {opened && (() => {
        const inv = invoiceLines(opened);
        const no = opened.id.replace('FDS-', 'INV-');
        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center fade-in" style={{ background: 'rgba(10, 24, 48, 0.55)' }} onClick={() => setOpenId(null)}>
            <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="px-5 py-4 border-b border-navy-100 flex items-start justify-between sticky top-0 bg-white">
                <div>
                  <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">Tax invoice · Fidson Healthcare Plc</p>
                  <h3 className="font-display font-bold text-ink text-lg">{no}</h3>
                  <p className="text-[11px] text-navy-500">Business Central doc {no.replace('INV-', 'PSI-')} · Net 30</p>
                </div>
                <button onClick={() => setOpenId(null)} className="w-9 h-9 rounded-lg hover:bg-paper flex items-center justify-center" aria-label="Close"><Icon name="x" size={16} /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="stat-label text-navy-400">Bill to</p>
                  <p className="text-sm font-semibold text-ink mt-0.5">{opened.cust}</p>
                  <p className="text-[11px] text-navy-500">Order {opened.id} · {opened.rep}</p>
                </div>
                <div className="divide-y divide-navy-50 border-y border-navy-100">
                  {inv.lines.map(l => (
                    <div key={l.p} className="py-2.5 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm text-ink font-semibold">{l.p}</p>
                        <p className="text-[11px] text-navy-500 font-mono">{l.qty} × {naira(l.unit)}</p>
                      </div>
                      <p className="font-mono text-sm text-ink">{naira(l.amt)}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-navy-500">Subtotal</span><span className="font-mono">{naira(inv.gross)}</span></div>
                  <div className="flex justify-between"><span className="text-navy-500">Discount {opened.disc}</span><span className="font-mono">−{naira(inv.discount)}</span></div>
                  <div className="flex justify-between"><span className="text-navy-500">VAT</span><span className="text-[11px] text-navy-500">Exempt · medical products</span></div>
                  <div className="flex justify-between pt-2 border-t border-navy-100 font-bold"><span className="text-ink">Total due</span><span className="font-mono text-ink text-lg">{naira(inv.net)}</span></div>
                </div>
                <div className={`px-3 py-2 rounded-lg border text-[11px] font-bold ${stage(opened.status).c}`}>{stage(opened.status).t}</div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => notify({ type: 'success', title: 'Invoice downloaded', msg: `${no} · PDF saved to this phone` })} className="py-2.5 rounded-lg border border-navy-200 text-xs font-bold text-navy-700 btn-press flex items-center justify-center gap-1.5"><Icon name="download" size={13} /> PDF</button>
                  <button onClick={() => notify({ type: 'success', title: 'Invoice shared', msg: `${no} sent to ${opened.cust} accounts` })} className="py-2.5 rounded-lg bg-navy-700 text-white text-xs font-bold btn-press flex items-center justify-center gap-1.5"><Icon name="send" size={13} /> Send to customer</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      {node}
    </div>
  );
}
