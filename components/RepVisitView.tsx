import { useEffect, useMemo, useState } from 'react';
import Icon from './Icon';
import { PRODUCT_CATALOG } from '../assets/products';
import type { IconName, RepActiveVisit, CustomerStockEntry, CustomerStockRow } from '../types';

interface RepVisitViewProps {
  activeVisit: RepActiveVisit | null;
  onCheckIn: (id: string | number) => void;
  onCompleteVisit: (id: string | number) => void;
  onPlaceOrder: (visit: RepActiveVisit) => void;
  onNavigate: (view: string) => void;
  onSyncAudit: (customer: string, stock: CustomerStockEntry) => void;
  onRequestCM?: (hcp: string) => void;
}

type Tab = 'detail' | 'samples' | 'market';

export default function RepVisitView({
  activeVisit,
  onCheckIn,
  onCompleteVisit,
  onPlaceOrder,
  onNavigate,
  onSyncAudit,
  onRequestCM,
}: RepVisitViewProps) {
  const [tab, setTab] = useState<Tab>('detail');
  const [checkedIn, setCheckedIn] = useState(false);
  const [responses, setResponses] = useState<{ response: string | null; checks: string[] }>({ response: null, checks: [] });
  const plannedProducts = useMemo(() => activeVisit?.plannedProducts ?? [], [activeVisit]);
  const [detailedProducts, setDetailedProducts] = useState<string[]>(plannedProducts);
  useEffect(() => { setDetailedProducts(plannedProducts); }, [plannedProducts]);
  const toggleDetailedProduct = (name: string) => {
    setDetailedProducts(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };
  const defaultStockRows = (): CustomerStockEntry => [
    { product: 'Coflin Forte 600mg', units: '' },
    { product: 'Astrazon 10mg', units: '' },
    { product: 'Tuxil-N Syrup 100ml', units: '' },
  ];
  const [customerStock, setCustomerStock] = useState<CustomerStockEntry>(defaultStockRows);
  const updateStockRow = (idx: number, patch: Partial<CustomerStockRow>) => {
    setCustomerStock(prev => prev.map((r, i) => i === idx ? { ...r, ...patch } : r));
  };
  const addStockRow = () => setCustomerStock(prev => [...prev, { product: '', units: '' }]);
  const removeStockRow = (idx: number) => setCustomerStock(prev => prev.filter((_, i) => i !== idx));
  const resetCustomerStock = () => setCustomerStock(defaultStockRows());

  useEffect(() => {
    if (activeVisit?.checkedIn) setCheckedIn(true);
  }, [activeVisit]);

  if (!activeVisit) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        <div className="rounded-2xl bg-white border border-navy-100 p-12 text-center fade-up">
          <div className="w-16 h-16 rounded-2xl bg-navy-50 mx-auto flex items-center justify-center mb-4">
            <Icon name="location" size={28} className="text-navy-400" />
          </div>
          <h3 className="font-display text-xl font-bold text-ink">No active visit</h3>
          <p className="text-sm text-navy-500 mt-2 mb-6">Open your itinerary to start your next visit</p>
          <button onClick={() => onNavigate('rep-plan')} className="px-5 py-2.5 rounded-xl bg-navy-700 text-white text-sm font-semibold btn-press">
            View Today's Plan
          </button>
        </div>
      </div>
    );
  }

  if (!checkedIn) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 fade-up">
            <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden">
              <div className="relative map-bg" style={{ height: '200px' }}>
                <div className="absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}>
                  <div className="w-14 h-14 rounded-full bg-leaf-500 flex items-center justify-center shadow-lg gps-pulse">
                    <Icon name="location" size={24} className="text-white" />
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-white shadow-sm">
                  <p className="text-[11px] font-bold text-leaf-700">Within 50m of target</p>
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">Visit #{activeVisit.id} of 8</p>
                <h2 className="font-display text-2xl font-bold text-ink mt-1">{activeVisit.name}</h2>
                <p className="text-sm text-navy-500 mt-1">{activeVisit.address || 'Plot 14, Adeola Odeku, Victoria Island'}</p>

                <div className="mt-5 p-4 rounded-xl bg-paper border border-navy-100">
                  <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">Primary Contact</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="w-11 h-11 rounded-full bg-navy-700 flex items-center justify-center text-white font-display font-bold">
                      {activeVisit.contact?.split(' ').slice(-1)[0]?.[0] || 'A'}
                    </div>
                    <div>
                      <p className="font-display font-semibold text-ink">{activeVisit.contact}</p>
                      <p className="text-xs text-navy-500">{activeVisit.role || 'Internal Medicine'} · 4y relationship</p>
                    </div>
                  </div>
                  <div className="mt-3 p-3 rounded-lg bg-leaf-50 border border-leaf-200">
                    <div className="flex items-center gap-2">
                      <Icon name="sparkles" size={12} className="text-leaf-700" />
                      <p className="text-[10px] font-bold text-leaf-700 tracking-wider uppercase">AI · Last Interaction</p>
                    </div>
                    <p className="text-xs text-navy-700 mt-1.5 leading-relaxed">Requested clinical data on Coflin for paediatric dosing. Brought up Astrazon during last detail.</p>
                  </div>
                </div>

                <button
                  onClick={() => { setCheckedIn(true); onCheckIn(activeVisit.id); }}
                  className="mt-5 w-full py-3.5 rounded-xl bg-leaf-500 text-white font-display font-semibold btn-press flex items-center justify-center gap-2 shadow-lg shadow-leaf-500/30 hover:bg-leaf-600"
                >
                  <Icon name="checkCircle" size={20} />
                  Check In (GPS Verified)
                </button>
                <p className="text-[11px] text-navy-400 text-center mt-3">
                  Location, time, and visit metadata will be auto-captured for compliance
                </p>
              </div>
            </div>
          </div>

          <div className="fade-up stagger-1 space-y-4">
            <div className="rounded-2xl bg-white border border-navy-100 p-5">
              <h3 className="font-display font-bold text-ink text-sm mb-3">Visit Goals</h3>
              <div className="space-y-2">
                {['Detail Coflin Forte updates', 'Discuss Q2 institutional pricing', 'Capture customer stock'].map((g, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-paper">
                    <div className="w-4 h-4 rounded border-2 border-navy-300 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-navy-700">{g}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-navy-100 p-5">
              <h3 className="font-display font-bold text-ink text-sm mb-3">Quick Materials</h3>
              <div className="space-y-2">
                {[
                  { n: 'Coflin Clinical Pack', t: 'PDF · 12 pages' },
                  { n: 'Q2 Price List', t: 'XLSX · Updated today' },
                  { n: 'Paediatric Dosing Guide', t: 'PDF · 4 pages' },
                ].map((m, i) => (
                  <button key={i} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-paper text-left">
                    <Icon name="file" size={14} className="text-navy-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-ink truncate">{m.n}</p>
                      <p className="text-[10px] text-navy-500">{m.t}</p>
                    </div>
                    <Icon name="download" size={12} className="text-navy-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const messages = [
    'Paediatric dosing data shared',
    'New clinical trial results discussed',
    'Sample literature provided',
    'Q2 pricing tier explained',
  ];

  const toggleCheck = (m: string) => {
    setResponses(prev => ({
      ...prev,
      checks: prev.checks.includes(m) ? prev.checks.filter(x => x !== m) : [...prev.checks, m],
    }));
  };

  const tabs: { k: Tab; l: string; i: IconName }[] = [
    { k: 'detail', l: 'Detail Products', i: 'pill' },
    { k: 'samples', l: 'Samples & Stock', i: 'package' },
    { k: 'market', l: 'Market Intel', i: 'flag' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      <div className="fade-up flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-leaf-500 flex items-center justify-center text-white">
            <Icon name="checkCircle" size={20} strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold text-leaf-700 tracking-wider uppercase">Checked In · 10:04 AM</p>
              <div className="w-1.5 h-1.5 rounded-full bg-leaf-500 pulse-dot" />
            </div>
            <h2 className="font-display text-xl font-bold text-ink">{activeVisit.name}</h2>
            <p className="text-xs text-navy-500">{activeVisit.contact} · 6.5244° N, 3.3792° E</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onPlaceOrder(activeVisit)} className="px-4 py-2 rounded-lg bg-leaf-500 text-white text-sm font-bold flex items-center gap-1.5 btn-press">
            <Icon name="cart" size={14} /> Place Order
          </button>
          <button onClick={() => onCompleteVisit(activeVisit.id)} className="px-4 py-2 rounded-lg bg-navy-700 text-white text-sm font-bold flex items-center gap-1.5 btn-press">
            <Icon name="check" size={14} strokeWidth={3} /> Complete Visit
          </button>
        </div>
      </div>

      <div className="flex gap-1 bg-paper p-1 rounded-xl mb-4 fade-up stagger-1 max-w-xl">
        {tabs.map(t => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              tab === t.k ? 'bg-white text-navy-700 shadow-sm' : 'text-navy-500'
            }`}
          >
            <Icon name={t.i} size={12} /> {t.l}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 fade-up stagger-2 space-y-4">
          {tab === 'detail' && (
            <>
              <div className="p-3 rounded-xl border border-leaf-200 bg-leaf-50/50 flex items-start gap-2">
                <Icon name="sparkles" size={14} className="text-leaf-600 mt-0.5" />
                <p className="text-xs text-navy-700"><span className="font-bold text-leaf-700">AI pre-filled</span> based on your last 3 visits with Dr. Adebayo</p>
              </div>

              <div className="rounded-2xl bg-white border border-navy-100 p-5">
                <div className="flex items-center justify-between mb-1">
                  <p className="stat-label text-navy-400">Products Detailed Today</p>
                  <span className="text-[10px] text-navy-500 font-mono">{detailedProducts.length} selected</span>
                </div>
                <p className="text-[11px] text-navy-500 mb-3">{plannedProducts.length > 0 ? 'Pre-filled from your visit plan. Tap to add or remove.' : 'No products were planned for this visit — tap to add what you actually detailed.'}</p>
                <div className="space-y-2">
                  {PRODUCT_CATALOG.map(p => {
                    const selected = detailedProducts.includes(p.name);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => toggleDetailedProduct(p.name)}
                        className={`w-full p-3 rounded-xl border text-left btn-press transition-colors ${
                          selected
                            ? (p.focus ? 'bg-leaf-50 border-leaf-400' : 'bg-navy-50 border-navy-300')
                            : 'bg-paper border-navy-100 hover:border-navy-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${selected ? (p.focus ? 'bg-leaf-500' : 'bg-navy-700') : 'border-2 border-navy-300'}`}>
                            {selected && <Icon name="check" size={12} className="text-white" strokeWidth={3} />}
                          </div>
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${p.focus && selected ? 'bg-leaf-500' : 'bg-navy-100'}`}>
                            <Icon name="pill" size={16} className={p.focus && selected ? 'text-white' : 'text-navy-700'} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-display font-semibold text-sm text-ink">{p.name}</p>
                            <p className="text-[11px] text-navy-500">{p.category}</p>
                          </div>
                          {p.focus && <span className="px-2 py-1 rounded-full bg-leaf-500 text-white text-[9px] font-bold">FOCUS</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-navy-100 p-5">
                <p className="stat-label text-navy-400 mb-3">Key Messages Delivered</p>
                <div className="space-y-2">
                  {messages.map(m => {
                    const checked = responses.checks.includes(m);
                    return (
                      <button
                        key={m}
                        onClick={() => toggleCheck(m)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-paper border border-navy-100 hover:border-leaf-300 transition-all text-left btn-press"
                      >
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                          checked ? 'bg-leaf-500' : 'border-2 border-navy-300'
                        }`}>
                          {checked && <Icon name="check" size={12} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className={`text-sm transition-colors ${checked ? 'text-ink' : 'text-navy-700'}`}>{m}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-navy-100 p-5">
                <p className="stat-label text-navy-400 mb-3">HCP Response</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { l: 'Receptive', emoji: '😊', c: 'leaf' },
                    { l: 'Neutral', emoji: '😐', c: 'navy' },
                    { l: 'Resistant', emoji: '😟', c: 'rose' },
                  ].map(r => (
                    <button
                      key={r.l}
                      onClick={() => setResponses(prev => ({ ...prev, response: r.l }))}
                      className={`p-3 rounded-xl border-2 transition-all btn-press ${
                        responses.response === r.l ?
                          (r.c === 'leaf' ? 'bg-leaf-500 border-leaf-500 text-white' :
                           r.c === 'rose' ? 'bg-rose-500 border-rose-500 text-white' :
                           'bg-navy-700 border-navy-700 text-white') :
                          'bg-white border-navy-200 text-navy-700 hover:border-navy-400'
                      }`}
                    >
                      <p className="text-2xl">{r.emoji}</p>
                      <p className="text-xs font-bold mt-1">{r.l}</p>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === 'samples' && (
            <div className="rounded-2xl bg-white border border-navy-100 p-5 space-y-3">
              <p className="stat-label text-navy-400">Samples Dispensed</p>
              {[
                { n: 'Coflin 600mg blister', b: 'B240511', q: 8 },
                { n: 'Astrazon 10mg pack', b: 'B240502', q: 4 },
              ].map(s => (
                <div key={s.n} className="p-4 rounded-xl bg-paper border border-navy-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display font-semibold text-sm text-ink">{s.n}</p>
                      <p className="text-[11px] text-navy-500 font-mono mt-0.5">Batch: {s.b}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-full p-1 border border-navy-100">
                      <button className="w-7 h-7 rounded-full hover:bg-navy-50 text-navy-700 font-bold">−</button>
                      <span className="w-6 text-center font-display font-bold text-ink">{s.q}</span>
                      <button className="w-7 h-7 rounded-full bg-navy-700 hover:bg-navy-800 text-white font-bold">+</button>
                    </div>
                  </div>
                </div>
              ))}
              <button className="w-full py-3 rounded-xl border-2 border-dashed border-navy-200 text-navy-500 font-semibold text-sm btn-press hover:border-leaf-400 hover:text-leaf-700 flex items-center justify-center gap-2">
                <Icon name="plus" size={14} /> Add another sample
              </button>

              <div className="mt-4 p-4 rounded-xl bg-navy-50 border border-navy-100 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">Q2 Customer Stock</p>
                  <span className="text-[9px] bg-leaf-100 text-leaf-700 font-bold px-2 py-0.5 rounded-full">ACTIVE SNAPSHOT</span>
                </div>
                <p className="text-[10px] text-navy-500">Capture units on hand per product. Add more SKUs as needed.</p>
                <div className="space-y-2">
                  {customerStock.map((row, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Product"
                        value={row.product}
                        onChange={e => updateStockRow(idx, { product: e.target.value })}
                        className="input-field flex-1 min-w-0 px-2 py-1.5 rounded-lg bg-white border border-navy-200 text-xs text-ink"
                      />
                      <input
                        type="number"
                        placeholder="Units"
                        value={row.units}
                        onChange={e => updateStockRow(idx, { units: e.target.value })}
                        className="input-field w-20 px-2 py-1.5 rounded-lg bg-white border border-navy-200 text-xs text-ink"
                      />
                      <button
                        onClick={() => removeStockRow(idx)}
                        title="Remove row"
                        className="w-7 h-7 rounded-lg text-navy-400 hover:text-rose-600 hover:bg-white flex items-center justify-center flex-shrink-0"
                      >
                        <Icon name="x" size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={addStockRow}
                    className="flex-1 py-2 rounded-lg bg-white border border-navy-200 text-xs font-semibold text-navy-700 hover:bg-paper btn-press flex items-center justify-center gap-1.5"
                  >
                    <Icon name="plus" size={12} /> Add product
                  </button>
                  <button
                    onClick={() => { onSyncAudit(activeVisit.name, customerStock); resetCustomerStock(); }}
                    className="flex-1 py-2 rounded-lg bg-leaf-600 hover:bg-leaf-700 text-white text-xs font-semibold btn-press flex items-center justify-center gap-1.5"
                  >
                    <Icon name="check" size={12} /> Sync Customer Stock
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'market' && (
            <div className="space-y-3">
              <div className="rounded-2xl bg-white border border-navy-100 p-5">
                <p className="stat-label text-navy-400 mb-2">Competitor Brand Seen</p>
                <input
                  type="text"
                  defaultValue="GSK · Augmentin"
                  className="input-field w-full px-3 py-2 rounded-lg bg-paper border border-navy-100 text-sm text-ink"
                />
              </div>
              <div className="rounded-2xl bg-white border border-navy-100 p-5">
                <p className="stat-label text-navy-400 mb-2">Promotion Observed</p>
                <input
                  type="text"
                  defaultValue="15% trade discount · BOGOF on cartons"
                  className="input-field w-full px-3 py-2 rounded-lg bg-paper border border-navy-100 text-sm text-ink"
                />
              </div>
              <div className="rounded-2xl bg-white border border-navy-100 p-5">
                <p className="stat-label text-navy-400 mb-2">Pricing Intel</p>
                <textarea
                  rows={3}
                  defaultValue="Augmentin 625mg at ₦950/strip — 8% under our list price. Competitor pushing volume tier 2 incentives."
                  className="input-field w-full px-3 py-2 rounded-lg bg-paper border border-navy-100 text-sm text-ink resize-none"
                />
              </div>

              <div className="rounded-2xl bg-leaf-50 border border-leaf-200 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-leaf-600 flex items-center justify-center flex-shrink-0">
                    <Icon name="flask" size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-sm text-ink">Clinical Meeting Required?</p>
                    <p className="text-[11px] text-navy-700 mt-0.5 leading-relaxed">If this HCP would benefit from a CM (e.g. department-wide brief, paediatric dosing workshop), file the request here. Routes to your PM; HoM signs off if high-impact.</p>
                    <button
                      onClick={() => onRequestCM?.(activeVisit.name)}
                      className="mt-3 px-3 py-1.5 rounded-lg bg-leaf-600 text-white text-xs font-bold btn-press hover:bg-leaf-700 flex items-center gap-1.5"
                    >
                      <Icon name="plus" size={12} /> Request CM for {activeVisit.name.split(' ')[0]}…
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="fade-up stagger-3 space-y-4">
          <div className="rounded-2xl bg-white border border-navy-100 p-5">
            <h3 className="font-display font-bold text-ink text-sm mb-3">Visit Notes</h3>
            <textarea
              rows={6}
              placeholder="Capture key takeaways, action items, follow-ups..."
              defaultValue="Dr. requested data on Coflin for under-12 patients. Open to switching from competitor for paediatric ward. Follow-up with clinical pack."
              className="input-field w-full p-3 rounded-xl bg-paper border border-navy-100 text-sm text-ink resize-none"
            />
            <button className="mt-3 text-[11px] font-bold text-leaf-700 flex items-center gap-1">
              <Icon name="edit" size={11} /> Or hold to voice-record
            </button>
          </div>

          <div className="rounded-2xl p-5 text-white relative overflow-hidden" style={{ background: 'linear-gradient(120deg, #0F2147 0%, #142A5A 100%)' }}>
            <div className="absolute inset-0 ai-shimmer" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="sparkles" size={14} className="text-leaf-300" />
                <p className="text-[10px] font-bold text-leaf-300 tracking-wider uppercase">AI Suggestion</p>
              </div>
              <p className="text-xs text-white/90 leading-relaxed">
                Based on Dr. Adebayo's questions, prepare a follow-up email with the Coflin paediatric clinical pack. Schedule a callback next week.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
