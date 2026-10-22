import { useMemo, useState } from 'react';
import Icon from './Icon';
import { useNotice } from './useNotice';
import type { OrderRow, ToastInput } from '../types';

interface OrdersViewProps {
  orders: OrderRow[];
  onOpenApproval: (item: OrderRow) => void;
  onApprove: (id: string) => void;
  searchQuery: string;
  onToast?: (t: ToastInput) => void;
}

type StatusFilterKey = 'all' | 'pending' | 'approved' | 'synced' | 'sent-to-sales-admin';

const DISCOUNT_CEILING = 15;

// the same rule the rep order screen applies: above the ceiling goes RSM, then DM
const discountRule = (o: OrderRow) => {
  const pct = parseFloat(o.disc) || 0;
  if (pct === 0) return { t: 'No discount · straight to Sales Admin', c: 'text-sky-700' };
  if (pct <= DISCOUNT_CEILING) return { t: `Within ${DISCOUNT_CEILING}% limit · auto-approved`, c: 'text-leaf-700' };
  return { t: 'Above ceiling · escalated to RSM → DM', c: 'text-amber-700' };
};

const signerOf = (o: OrderRow) => {
  const x = o as OrderRow & { signature?: { signer?: string } | string };
  if (x.signedBy) return x.signedBy;
  if (x.signature) return typeof x.signature === 'object' && x.signature.signer ? x.signature.signer : 'customer';
  return null;
};

const SignedChip = ({ o }: { o: OrderRow }) => {
  const s = signerOf(o);
  if (!s) return null;
  return (
    <span title={`Signed by ${s}`} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-violet-50 text-violet-700 border border-violet-200">
      <Icon name="edit" size={8} /> SIGNED
    </span>
  );
};

export default function OrdersView({ orders, onOpenApproval, searchQuery, onToast }: OrdersViewProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilterKey>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const { notify, node } = useNotice(onToast);
  const opened = orders.find(o => o.id === openId);

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (statusFilter !== 'all') result = result.filter(o => o.status === statusFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => o.id.toLowerCase().includes(q) || o.cust.toLowerCase().includes(q) || o.rep.toLowerCase().includes(q));
    }
    return result;
  }, [orders, statusFilter, searchQuery]);

  const counts: Record<StatusFilterKey, number> = useMemo(() => ({
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    approved: orders.filter(o => o.status === 'approved').length,
    synced: orders.filter(o => o.status === 'synced').length,
    'sent-to-sales-admin': orders.filter(o => o.status === 'sent-to-sales-admin').length,
  }), [orders]);

  const statusButtons: { k: StatusFilterKey; l: string }[] = [
    { k: 'all', l: 'All' }, { k: 'pending', l: 'Pending' },
    { k: 'sent-to-sales-admin', l: 'Sales Admin' },
    { k: 'approved', l: 'Approved' }, { k: 'synced', l: 'Synced' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { l: 'Today', v: '₦4.2M', d: '24 orders', c: 'navy' },
          { l: 'This Week', v: '₦18.7M', d: '112 orders', c: 'navy' },
          { l: 'Pending Approval', v: counts.pending.toString(), d: counts.pending > 0 ? `${counts.pending} ${counts.pending === 1 ? 'item' : 'items'}` : 'all clear', c: counts.pending > 0 ? 'amber' : 'leaf' },
          { l: 'Avg. Discount', v: '13.2%', d: '+0.8% vs target', c: 'leaf' },
        ].map((k, i) => (
          <div key={i} className={`fade-up stagger-${i + 1} p-5 rounded-2xl bg-white border border-navy-100`}>
            <p className="stat-label text-navy-400">{k.l}</p>
            <p className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">{k.v}</p>
            <p className={`text-[11px] font-semibold mt-1 ${
              k.c === 'leaf' ? 'text-leaf-700' : k.c === 'amber' ? 'text-amber-700' : 'text-navy-500'
            }`}>{k.d}</p>
          </div>
        ))}
      </div>

      <div className="fade-up stagger-2 rounded-2xl bg-white border border-navy-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-display font-bold text-ink">All Orders</h3>
            <p className="text-xs text-navy-500 mt-0.5">{filteredOrders.length} of {orders.length} · SOA-integrated · Live sync</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-paper rounded-lg p-1">
              {statusButtons.map(s => (
                <button
                  key={s.k}
                  onClick={() => setStatusFilter(s.k)}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                    statusFilter === s.k ? 'bg-white text-navy-700 shadow-sm' : 'text-navy-500 hover:text-navy-700'
                  }`}
                >
                  {s.l}
                  <span className={`px-1 rounded text-[9px] ${statusFilter === s.k ? 'bg-navy-100' : 'bg-navy-200/50'}`}>{counts[s.k]}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => notify({ type: 'info', title: 'Orders start in the field', msg: 'Reps capture orders at the visit with the customer signature · they land here for review and Business Central sync' })}
              className="px-3 py-1.5 rounded-lg bg-navy-700 text-white text-xs font-bold flex items-center gap-1.5 btn-press"
            >
              <Icon name="plus" size={12} /> New Order
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full hidden md:table">
            <thead>
              <tr className="bg-paper border-b border-navy-100">
                <th className="px-5 py-3 text-left stat-label text-navy-500">Order #</th>
                <th className="px-5 py-3 text-left stat-label text-navy-500">Rep</th>
                <th className="px-5 py-3 text-left stat-label text-navy-500">Customer</th>
                <th className="px-5 py-3 text-left stat-label text-navy-500">Channel</th>
                <th className="px-5 py-3 text-right stat-label text-navy-500">Value</th>
                <th className="px-5 py-3 text-center stat-label text-navy-500">Discount</th>
                <th className="px-5 py-3 text-center stat-label text-navy-500">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {filteredOrders.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-sm text-navy-500">No orders match these filters</td></tr>
              ) : filteredOrders.map(o => (
                <tr key={o.id} className={`${o.dismissing ? 'slide-out-up' : ''} hover:bg-paper transition-colors`}>
                  <td className="px-5 py-3 font-mono text-xs font-bold text-navy-700">{o.id}</td>
                  <td className="px-5 py-3 text-sm text-ink">{o.rep}</td>
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-ink">{o.cust}</p>
                    <p className={`text-[10px] font-semibold mt-0.5 ${discountRule(o).c}`}>{discountRule(o).t}</p>
                  </td>
                  <td className="px-5 py-3 text-xs font-semibold">
                    <div className="flex items-center gap-1 flex-wrap">
                      {o.channel === 'booklet' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Icon name="file" size={8} /> BOOKLET
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-leaf-50 text-leaf-700 border border-leaf-200">
                          <Icon name="check" size={8} /> ERP DIRECT
                        </span>
                      )}
                      {o.lpoAttached && (
                        <span title={o.lpoFileName} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                          <Icon name="camera" size={8} /> LPO
                        </span>
                      )}
                      <SignedChip o={o} />
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-sm font-bold text-ink">{o.value}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-[11px] font-bold font-mono ${
                      o.flag ? 'bg-amber-50 text-amber-700' : 'bg-navy-50 text-navy-700'
                    }`}>{o.disc}</span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      o.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                      o.status === 'approved' ? 'bg-leaf-50 text-leaf-700' :
                      o.status === 'sent-to-sales-admin' ? 'bg-sky-50 text-sky-700' :
                      'bg-navy-50 text-navy-700'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        o.status === 'pending' ? 'bg-amber-500' :
                        o.status === 'approved' ? 'bg-leaf-500' :
                        o.status === 'sent-to-sales-admin' ? 'bg-sky-500' :
                        'bg-navy-500'
                      }`} />
                      {o.status === 'sent-to-sales-admin' ? 'SALES ADMIN' : o.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {o.status === 'pending' ? (
                      <button onClick={() => onOpenApproval(o)} className="px-3 py-1.5 rounded-lg bg-leaf-500 text-white text-xs font-bold hover:bg-leaf-600 btn-press">Review</button>
                    ) : (
                      <button onClick={() => setOpenId(o.id)} className="text-navy-400 hover:text-navy-700" aria-label={`Open ${o.id}`}><Icon name="eye" size={14} /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="md:hidden divide-y divide-navy-50">
            {filteredOrders.length === 0 ? (
              <div className="py-12 text-center text-sm text-navy-500">No orders match these filters</div>
            ) : filteredOrders.map(o => (
              <div key={o.id} className={`${o.dismissing ? 'slide-out-up' : ''} px-4 py-3 hover:bg-paper`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[11px] font-bold text-navy-500">{o.id}</span>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                        o.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                        o.status === 'approved' ? 'bg-leaf-50 text-leaf-700' :
                        o.status === 'sent-to-sales-admin' ? 'bg-sky-50 text-sky-700' :
                        'bg-navy-50 text-navy-700'
                      }`}>{o.status === 'sent-to-sales-admin' ? 'SALES ADMIN' : o.status.toUpperCase()}</span>
                      {o.channel === 'booklet' ? (
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[9px] font-bold border border-amber-200">BOOKLET</span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-leaf-50 text-leaf-700 text-[9px] font-bold border border-leaf-200">ERP</span>
                      )}
                      <SignedChip o={o} />
                    </div>
                    <p className="font-display font-semibold text-sm text-ink mt-1 truncate">{o.cust}</p>
                    <p className="text-[11px] text-navy-500 mt-0.5">{o.rep} · {o.disc} discount</p>
                    <p className={`text-[10px] font-semibold mt-0.5 ${discountRule(o).c}`}>{discountRule(o).t}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-mono text-sm font-bold text-ink">{o.value}</p>
                    {o.status === 'pending' ? (
                      <button onClick={() => onOpenApproval(o)} className="mt-1 px-2 py-1 rounded-md bg-leaf-500 text-white text-[10px] font-bold">Review</button>
                    ) : (
                      <button onClick={() => setOpenId(o.id)} className="mt-1 px-2 py-1 rounded-md border border-navy-200 text-navy-700 text-[10px] font-bold">Details</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {opened && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center fade-in" style={{ background: 'rgba(10, 24, 48, 0.5)' }} onClick={() => setOpenId(null)}>
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between">
              <div>
                <p className="font-mono text-xs font-bold text-navy-500">{opened.id}</p>
                <h3 className="font-display font-bold text-ink">{opened.cust}</h3>
              </div>
              <button onClick={() => setOpenId(null)} className="w-8 h-8 rounded-lg hover:bg-paper flex items-center justify-center" aria-label="Close"><Icon name="x" size={16} /></button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              {[
                ['Rep', opened.rep],
                ['Channel', opened.channel === 'booklet' ? 'Booklet (paper, keyed in)' : 'ERP direct'],
                ['Value', opened.value],
                ['Discount', opened.disc],
                ['Status', opened.status === 'sent-to-sales-admin' ? 'With Sales Admin' : opened.status],
                ['Business Central', opened.status === 'synced' ? `Sales order SO-${opened.id.replace('FDS-', '')} · synced` : opened.status === 'approved' ? 'Queued for next sync' : 'Not yet sent'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3"><span className="text-navy-500">{k}</span><span className="font-semibold text-ink text-right capitalize">{v}</span></div>
              ))}
              <div className={`p-3 rounded-xl bg-paper border border-navy-100 text-xs font-semibold ${discountRule(opened).c}`}>{discountRule(opened).t}</div>
              <div className="p-3 rounded-xl border border-navy-100 flex items-center gap-2">
                <Icon name="edit" size={14} className={signerOf(opened) ? 'text-violet-700' : 'text-navy-300'} />
                <span className="text-xs text-navy-700">{signerOf(opened) ? `Signed at the visit by ${signerOf(opened)}` : 'No customer signature captured'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {node}
    </div>
  );
}
