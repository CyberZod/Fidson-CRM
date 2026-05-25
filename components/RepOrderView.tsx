import { useState } from 'react';
import Icon from './Icon';
import type { RepActiveVisit, RepOrderItem, RepOrderSubmission } from '../types';

interface RepOrderViewProps {
  activeVisit: RepActiveVisit | null;
  onSubmitOrder: (order: RepOrderSubmission) => void;
  onBack: () => void;
}

type Step = 'cart' | 'success';

export default function RepOrderView({ activeVisit, onSubmitOrder, onBack }: RepOrderViewProps) {
  const [items, setItems] = useState<RepOrderItem[]>([
    { id: 'coflin', n: 'Coflin Forte 600mg', q: 200, p: 1200, pack: 'carton', stockStatus: 'in-stock', stock: 450 },
    { id: 'astrazon', n: 'Astrazon 10mg', q: 50, p: 850, pack: 'pack', stockStatus: 'out-of-stock', stock: 0 },
    { id: 'tuxil', n: 'Tuxil-N Syrup 100ml', q: 100, p: 480, pack: 'bottle', stockStatus: 'in-stock', stock: 120 },
  ]);
  const [discount, setDiscount] = useState(18);
  const [step, setStep] = useState<Step>('cart');
  const [signed, setSigned] = useState(false);
  const [lpoFileName, setLpoFileName] = useState<string>('');

  const subtotal = items.reduce((s, i) => s + i.q * i.p, 0);
  const discountAmt = subtotal * (discount / 100);
  const total = subtotal - discountAmt;
  const requiresApproval = discount > 15;
  const isZeroDiscount = discount === 0;

  const hasOutOfStock = items.some(i => i.q > 0 && i.stockStatus === 'out-of-stock');
  const hasInStock = items.some(i => i.q > 0 && i.stockStatus === 'in-stock');

  const updateQty = (id: string, delta: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, q: Math.max(0, i.q + delta) } : i));
  };

  const handleSubmit = () => {
    onSubmitOrder({
      visit: activeVisit,
      items,
      discount,
      subtotal,
      total,
      requiresApproval,
      channel: hasOutOfStock ? 'booklet' : 'erp',
      lpoFileName: lpoFileName || undefined,
    });
  };

  const handleLpoAttach = () => {
    const stamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    setLpoFileName(`LPO-${stamp}.jpg`);
  };

  if (step === 'success') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[600px] mx-auto">
        <div className="rounded-2xl bg-white border border-navy-100 p-8 text-center fade-up">
          <div className="w-20 h-20 rounded-full bg-leaf-100 mx-auto flex items-center justify-center mb-4">
            <Icon name="check" size={40} className="text-leaf-600" strokeWidth={3} />
          </div>
          <h2 className="font-display text-2xl font-bold text-ink">Order submitted</h2>
          <p className="text-sm text-navy-500 mt-1">Order #FDS-{Math.floor(Math.random() * 9000) + 1000}</p>

          {hasOutOfStock ? (
            <div className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-200 text-left space-y-3">
              <div className="flex items-center gap-2">
                <Icon name="package" size={16} className="text-amber-700" />
                <p className="text-[10px] font-bold text-amber-700 tracking-wider uppercase font-display">Dual-Channel Split Order</p>
              </div>
              {hasInStock && (
                <p className="text-xs text-navy-700">
                  <span className="font-bold text-leaf-700">ERP Channel:</span> In-stock items (Coflin, Tuxil) submitted directly to ERP for immediate invoice generation.
                </p>
              )}
              <p className="text-xs text-navy-700">
                <span className="font-bold text-amber-700">Order Booklet Channel:</span> Out-of-stock items (Astrazon) filled in digital booklet and routed to <strong>Inventory Admin</strong> for manual sourcing and processing.
              </p>
            </div>
          ) : (
            <div className="mt-5 p-4 rounded-xl bg-leaf-50 border border-leaf-200 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="check" size={14} className="text-leaf-700" strokeWidth={3} />
                <p className="text-[10px] font-bold text-leaf-700 tracking-wider uppercase font-display">ERP Direct Flow</p>
              </div>
              <p className="text-xs text-leaf-800">All products in stock. Order submitted directly to ERP. Auto-approved and synced to SOA.</p>
            </div>
          )}

          {isZeroDiscount && !requiresApproval && (
            <div className="mt-3 p-4 rounded-xl bg-sky-50 border border-sky-200 text-left">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="send" size={14} className="text-sky-700" />
                <p className="text-[10px] font-bold text-sky-700 tracking-wider uppercase font-display">Sent to Sales Admin</p>
              </div>
              <p className="text-xs text-sky-800">No discount requested. Routed straight to Sales Admin queue for SOA processing — no manager approval needed.</p>
            </div>
          )}

          {requiresApproval && (
            <div className="mt-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-left">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="clock" size={14} className="text-rose-700" />
                <p className="text-[10px] font-bold text-rose-700 tracking-wider uppercase font-display">Awaiting RSM Approval</p>
              </div>
              <p className="text-xs text-rose-800">Your requested discount of {discount}% exceeds the 15% standard limit. Tunde Bakare (RSM) will review. If unavailable, it will auto-escalate to DM Kemi Adeyemi.</p>
            </div>
          )}

          <button onClick={onBack} className="mt-6 w-full py-3 rounded-xl bg-navy-700 text-white font-display font-semibold btn-press">
            Continue to next visit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={onBack} className="w-8 h-8 rounded-lg bg-white border border-navy-100 flex items-center justify-center btn-press">
          <Icon name="chevronLeft" size={16} className="text-navy-700" />
        </button>
        <div>
          <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">New Order via SOA</p>
          <h2 className="font-display text-xl font-bold text-ink">{activeVisit?.name || 'Lakeshore Specialist Hospital'}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 fade-up space-y-4">
          <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-navy-100">
              <h3 className="font-display font-bold text-ink">Order Items</h3>
            </div>
            <div className="divide-y divide-navy-50">
              {items.map(it => (
                <div key={it.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0">
                    <Icon name="pill" size={16} className="text-navy-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-display font-semibold text-sm text-ink truncate">{it.n}</p>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider ${
                        it.stockStatus === 'in-stock' ? 'bg-leaf-50 text-leaf-700 border border-leaf-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {it.stockStatus === 'in-stock' ? 'ERP DIRECT' : 'ORDER BOOKLET (NO STOCK)'}
                      </span>
                    </div>
                    <p className="text-[11px] text-navy-500">{it.pack} · ₦{it.p.toLocaleString()} {it.stockStatus === 'in-stock' ? `· ${it.stock} in stock` : '· Out of stock'}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-paper rounded-full p-1 border border-navy-100">
                    <button onClick={() => updateQty(it.id, -10)} className="w-7 h-7 rounded-full hover:bg-white text-navy-700 font-bold">−</button>
                    <span className="w-10 text-center font-mono font-bold text-ink text-sm">{it.q}</span>
                    <button onClick={() => updateQty(it.id, 10)} className="w-7 h-7 rounded-full bg-navy-700 hover:bg-navy-800 text-white font-bold">+</button>
                  </div>
                  <p className="font-mono text-sm font-bold text-leaf-700 w-24 text-right">₦{(it.q * it.p).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <button className="w-full py-3 border-t border-navy-100 text-sm font-bold text-leaf-700 hover:bg-paper flex items-center justify-center gap-1">
              <Icon name="plus" size={14} /> Add another product
            </button>
          </div>

          {hasOutOfStock && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 fade-up">
              <Icon name="alert" size={16} className="text-amber-700 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-800 font-display">Digital Order Booklet Routing Triggered</p>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  <strong>Astrazon 10mg</strong> is currently out of stock. This order will automatically utilize the manual <strong>Order Booklet Channel</strong>, routed directly to the inventory admin for offline fulfillment and sourcing.
                </p>
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-white border border-navy-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="stat-label text-navy-400">Discount Requested</p>
              {requiresApproval && (
                <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center gap-1 font-display">
                  <Icon name="alert" size={10} /> EXCEEDS 15% LIMIT
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <p className={`font-display text-4xl font-bold ${requiresApproval ? 'text-amber-700' : 'text-leaf-700'}`}>{discount}%</p>
              <p className="text-sm text-navy-500">−₦{discountAmt.toLocaleString()}</p>
            </div>
            <input
              type="range"
              min={0}
              max={25}
              value={discount}
              onChange={e => setDiscount(parseInt(e.target.value, 10))}
              className="w-full accent-leaf-500"
            />
            <div className="flex justify-between text-[10px] text-navy-400 font-mono mt-1">
              <span>0%</span>
              <span className="text-leaf-700 font-bold">15% Std Limit ↑</span>
              <span>25%</span>
            </div>
            {requiresApproval && (
              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-800">
                  <span className="font-bold">Approval required.</span> This discount needs RSM sign-off before order is finalized via SOA.
                </p>
              </div>
            )}
          </div>

          {requiresApproval && (
            <div className="rounded-2xl bg-white border border-navy-100 p-5">
              <p className="stat-label text-navy-400 mb-2">Justification for RSM</p>
              <textarea
                rows={3}
                defaultValue="Customer ordering 200+ cartons (volume tier 3). Competitor offering 17% on similar SKUs. Lakeshore is a key institutional account, top 5 by quarterly volume."
                className="input-field w-full p-3 rounded-xl bg-paper border border-navy-100 text-sm text-ink resize-none"
              />
            </div>
          )}

          <div className="rounded-2xl bg-white border border-navy-100 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="stat-label text-navy-400">LPO Attachment</p>
              {lpoFileName && <span className="px-1.5 py-0.5 rounded bg-leaf-100 text-leaf-700 text-[9px] font-bold">ATTACHED</span>}
            </div>
            <p className="text-[11px] text-navy-500 mb-3">Snap a photo of the customer's Local Purchase Order. It rides with the order to Sales Admin.</p>
            {lpoFileName ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-leaf-50 border border-leaf-200">
                <div className="w-9 h-9 rounded-lg bg-leaf-600 flex items-center justify-center flex-shrink-0">
                  <Icon name="camera" size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs font-bold text-leaf-800 truncate">{lpoFileName}</p>
                  <p className="text-[10px] text-leaf-700">Photo attached · ready to submit</p>
                </div>
                <button onClick={() => setLpoFileName('')} className="text-leaf-700 hover:text-leaf-900 text-[10px] font-bold">Remove</button>
              </div>
            ) : (
              <button
                onClick={handleLpoAttach}
                className="w-full h-16 rounded-xl border-2 border-dashed border-navy-200 bg-paper hover:border-leaf-400 hover:bg-leaf-50/30 flex items-center justify-center gap-2 btn-press"
              >
                <Icon name="camera" size={18} className="text-navy-500" />
                <span className="text-sm font-bold text-navy-700">Scan / attach LPO photo</span>
              </button>
            )}
          </div>

          <div className="rounded-2xl bg-white border border-navy-100 p-5">
            <p className="stat-label text-navy-400 mb-2">Customer Signature</p>
            <button
              onClick={() => setSigned(!signed)}
              className={`w-full h-24 rounded-xl border-2 border-dashed flex items-center justify-center transition-all ${
                signed ? 'border-leaf-300 bg-leaf-50' : 'border-navy-200 bg-paper hover:border-navy-400'
              }`}
            >
              {signed ? (
                <div className="text-center">
                  <svg viewBox="0 0 200 60" className="mx-auto" style={{ width: '140px', height: '40px' }}>
                    <path d="M 20 40 Q 35 15 50 35 T 80 25 Q 100 40 120 20 T 170 35" stroke="#142A5A" strokeWidth="2" fill="none" strokeLinecap="round" />
                  </svg>
                  <p className="text-[10px] text-leaf-700 font-bold mt-1">Signed by Dr. T. Adebayo</p>
                </div>
              ) : (
                <p className="text-sm text-navy-400 font-medium">Tap to capture signature</p>
              )}
            </button>
          </div>
        </div>

        <div className="fade-up stagger-1 space-y-4">
          <div className="rounded-2xl bg-navy-900 text-white p-5 sticky top-4">
            <h3 className="font-display font-bold text-white text-sm mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-navy-200">Items</span>
                <span className="font-mono">{items.filter(i => i.q > 0).length} SKUs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-200">Units</span>
                <span className="font-mono">{items.reduce((s, i) => s + i.q, 0)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/10">
                <span className="text-navy-200">Subtotal</span>
                <span className="font-mono font-bold">₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-leaf-300">Discount ({discount}%)</span>
                <span className="font-mono font-bold text-leaf-300">−₦{discountAmt.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-white/10 items-baseline">
                <span className="text-xs font-bold tracking-wider uppercase font-display">Net Total</span>
                <span className="font-display text-2xl font-bold">₦{total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => { setStep('success'); handleSubmit(); }}
              disabled={!signed || items.filter(i => i.q > 0).length === 0}
              className={`mt-5 w-full py-3 rounded-xl font-display font-semibold btn-press shadow-lg ${
                hasOutOfStock ?
                  'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-600/30' :
                  (requiresApproval ?
                    'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/30' :
                    (isZeroDiscount ?
                      'bg-sky-600 text-white hover:bg-sky-700 shadow-sky-600/30' :
                      'bg-leaf-500 text-white hover:bg-leaf-600 shadow-leaf-500/30'))
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {hasOutOfStock ?
                (requiresApproval ? 'Submit for RSM Approval (Booklet)' : 'Submit Order Booklet to Admin') :
                (requiresApproval ?
                  'Submit for RSM Approval (ERP)' :
                  (isZeroDiscount ? 'Send to Sales Admin' : 'Submit Order to ERP'))}
            </button>
            {!signed && <p className="text-[10px] text-navy-300 text-center mt-2">Customer signature required</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
