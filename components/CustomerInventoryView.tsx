import { useMemo, useState } from 'react';
import Icon from './Icon';
import type { CustomerInventoryItem } from '../types';

interface CustomerInventoryViewProps {
  customerInventory?: CustomerInventoryItem[];
  onBack?: () => void;
  isPM?: boolean;
}

export default function CustomerInventoryView({ customerInventory = [], onBack }: CustomerInventoryViewProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return customerInventory;
    const q = search.toLowerCase();
    return customerInventory.filter(i =>
      i.customer.toLowerCase().includes(q) ||
      i.product.toLowerCase().includes(q) ||
      i.status.toLowerCase().includes(q)
    );
  }, [customerInventory, search]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto animate-fade-in">
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="w-8 h-8 rounded-lg bg-white border border-navy-100 flex items-center justify-center btn-press">
            <Icon name="chevronLeft" size={16} className="text-navy-700" />
          </button>
        )}
        <div>
          <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">Customer Stock-on-Hand</p>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">Q2 Customer Inventory Audit</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-display font-bold text-ink">Audit Logs</h3>
              <input
                type="text"
                placeholder="Filter by customer or product..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field px-3 py-1.5 rounded-lg bg-paper border border-navy-200 text-xs w-64 max-w-full"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-paper border-b border-navy-100 text-[10px] font-bold text-navy-500 tracking-wider uppercase">
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Product</th>
                    <th className="px-5 py-3 text-center">Stock</th>
                    <th className="px-5 py-3">Audited</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-50 text-ink">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="py-12 text-center text-sm text-navy-500 font-medium">No inventory audits found</td></tr>
                  ) : filtered.map(i => (
                    <tr key={i.id} className="hover:bg-paper transition-colors text-sm">
                      <td className="px-5 py-3.5 font-semibold">{i.customer}</td>
                      <td className="px-5 py-3.5 text-navy-600">{i.product}</td>
                      <td className="px-5 py-3.5 text-center font-mono font-bold">{i.stockOnHand}</td>
                      <td className="px-5 py-3.5 text-xs text-navy-500">{i.lastAudited}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          i.status === 'Low Stock' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-leaf-50 text-leaf-700 border border-leaf-200'
                        }`}>
                          {i.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-xs font-semibold text-navy-700">{i.recommendation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-white border border-navy-100 p-5 space-y-4">
            <h3 className="font-display font-bold text-ink">Quarterly Stock Trends</h3>
            <p className="text-xs text-navy-500">Inventory coverage trend across Lagos region.</p>
            <div className="flex items-center justify-between py-2 border-b border-navy-50">
              <span className="text-xs font-bold text-navy-500">Q1 SNAPSHOT</span>
              <span className="text-xs font-mono text-navy-400">82% Stocked</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs font-bold text-leaf-600">Q2 SNAPSHOT (ACTIVE)</span>
              <span className="text-xs font-mono font-bold text-leaf-700">67% Stocked (15% Low Risk)</span>
            </div>
            <div className="h-2 rounded-full bg-navy-100 overflow-hidden">
              <div className="h-full bg-leaf-500 rounded-full" style={{ width: '67%' }} />
            </div>
          </div>

          <div className="rounded-2xl p-5 text-white space-y-3 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F2147 0%, #142A5A 100%)' }}>
            <div className="absolute inset-0 ai-shimmer" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="sparkles" size={16} className="text-leaf-300" />
                <p className="text-[10px] font-bold text-leaf-300 tracking-wider uppercase font-display">AI Customer Stock Signals</p>
              </div>
              <div className="space-y-3">
                {filtered.filter(i => i.status === 'Low Stock').map(i => (
                  <div key={i.id} className="p-3 rounded-xl bg-white/10 border border-white/10 text-xs space-y-1">
                    <p className="font-bold text-white">{i.customer}</p>
                    <p className="text-navy-200">Stock: <span className="text-rose-300 font-bold">{i.stockOnHand}</span> (Target: {i.restockLevel})</p>
                    <p className="text-[11px] text-leaf-300 font-semibold italic">{i.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
