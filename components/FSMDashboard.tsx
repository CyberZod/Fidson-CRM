import Icon from './Icon';

interface FSMDashboardProps {
  onNavigate: (view: string) => void;
}

type DistStatus = 'critical' | 'low' | 'healthy';

interface Distributor {
  n: string;
  loc: string;
  stock: number;
  days: number;
  status: DistStatus;
  orders: string;
  sku: string;
}

const DIST_COLORS: Record<DistStatus, { bar: string; badge: string; text: string }> = {
  critical: { bar: 'bg-rose-500', badge: 'bg-rose-100 text-rose-700', text: 'text-rose-700' },
  low: { bar: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700', text: 'text-amber-700' },
  healthy: { bar: 'bg-leaf-500', badge: 'bg-leaf-100 text-leaf-700', text: 'text-leaf-700' },
};

export default function FSMDashboard({ onNavigate }: FSMDashboardProps) {
  const distributors: Distributor[] = [
    { n: 'PHC Pharmacy Distributors', loc: 'Port Harcourt', stock: 8, days: 6, status: 'critical', orders: '₦1.2M/wk', sku: 'Tuxil-N' },
    { n: 'WestEnd Distributors Ltd', loc: 'Lagos', stock: 23, days: 14, status: 'low', orders: '₦4.8M/wk', sku: 'Coflin' },
    { n: 'Mainland Pharma Supply', loc: 'Lagos', stock: 64, days: 32, status: 'healthy', orders: '₦3.1M/wk', sku: 'All' },
    { n: 'Ibadan Med Distributors', loc: 'Ibadan', stock: 48, days: 24, status: 'healthy', orders: '₦2.4M/wk', sku: 'All' },
    { n: 'Abeokuta Wholesalers', loc: 'Abeokuta', stock: 18, days: 9, status: 'low', orders: '₦1.8M/wk', sku: 'Coflin' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="fade-up">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold tracking-wider uppercase">Trade Channel</span>
              <span className="text-xs text-navy-500">South-West Region</span>
            </div>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-ink">
              Welcome, <span style={{ background: 'linear-gradient(135deg, #142A5A 0%, #D97706 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Ifeanyi</span>
            </h2>
            <p className="text-sm text-navy-500 mt-1">8 trade reps active · 12 distributors under management · You report to DM Trade</p>
          </div>
          <button className="px-3 py-2 rounded-lg bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 btn-press hover:bg-amber-600">
            <Icon name="alert" size={14} /> 2 stock-out alerts
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { l: 'Trade Pipeline', v: '₦28.4M', d: '62 active orders', c: 'amber' },
          { l: 'Distributors', v: '12', d: '9 healthy · 2 critical', c: 'amber' },
          { l: 'Avg. Order Cycle', v: '4.2 days', d: '−0.8 vs Q1', c: 'leaf' },
          { l: 'Quarterly Audit', v: '8/12', d: '4 distributors pending', c: 'amber' },
        ].map((k, i) => (
          <div key={i} className={`fade-up stagger-${i + 1} p-4 sm:p-5 rounded-2xl bg-white border border-navy-100`}>
            <p className="stat-label text-navy-400">{k.l}</p>
            <p className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">{k.v}</p>
            <p className={`text-[11px] font-semibold mt-1 ${k.c === 'leaf' ? 'text-leaf-700' : k.c === 'amber' ? 'text-amber-700' : 'text-navy-500'}`}>{k.d}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="fade-up rounded-2xl bg-white border border-navy-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-display font-bold text-ink">Distributor Health Monitor</h3>
                <p className="text-xs text-navy-500 mt-0.5">Real-time stock balance · Auto-alerts on threshold breach</p>
              </div>
              <button onClick={() => onNavigate('fsm-distributors')} className="text-xs font-semibold text-amber-700">View all 12 →</button>
            </div>
            <div className="divide-y divide-navy-50">
              {distributors.map((d, i) => {
                const c = DIST_COLORS[d.status];
                return (
                  <div key={i} className="px-5 py-3 hover:bg-paper transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <Icon name="package" size={16} className="text-amber-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-display font-semibold text-sm text-ink truncate">{d.n}</p>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${c.badge}`}>{d.status.toUpperCase()}</span>
                        </div>
                        <p className="text-[11px] text-navy-500">{d.loc} · ~{d.orders} · {d.sku} focus</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-display text-lg font-bold ${c.text}`}>{d.days}d</p>
                        <p className="text-[10px] text-navy-400">to stock-out</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pl-12">
                      <div className="flex-1 h-1.5 rounded-full bg-navy-100 overflow-hidden max-w-xs">
                        <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${Math.min(100, (d.stock / 80) * 100)}%` }} />
                      </div>
                      <span className="text-[10px] font-mono text-navy-500">{d.stock} cartons</span>
                      {d.status === 'critical' && <button className="ml-auto px-2 py-1 rounded-md bg-rose-500 text-white text-[10px] font-bold">Push Reorder</button>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="fade-up stagger-1 rounded-2xl bg-white border border-navy-100 p-5">
            <h3 className="font-display font-bold text-ink mb-4">Trade Order Velocity · 8 weeks</h3>
            <div className="flex items-end gap-2 h-32">
              {[58, 64, 52, 72, 68, 78, 82, 88].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${h}%`,
                      background: i === 7 ? '#D97706' : '#FCD34D',
                      opacity: 0.6 + (i * 0.05),
                    }}
                  />
                  <span className="text-[10px] font-mono text-navy-400">W{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="fade-up stagger-2 rounded-2xl bg-white border border-amber-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-amber-100 bg-amber-50/50">
              <div className="flex items-center gap-2">
                <Icon name="calendar" size={16} className="text-amber-700" />
                <h3 className="font-display font-bold text-ink text-sm">Q2 Distributor Audit</h3>
              </div>
              <p className="text-[11px] text-amber-700 mt-0.5">Per Fidson policy: quarterly stock balance check</p>
            </div>
            <div className="p-3 space-y-1.5">
              {[
                { n: 'WestEnd Distributors', done: true },
                { n: 'Mainland Pharma', done: true },
                { n: 'Ibadan Med', done: true },
                { n: 'Abeokuta Wholesalers', done: true },
                { n: 'PHC Pharmacy', done: false },
                { n: 'Onitsha Trade Hub', done: false },
                { n: 'Kano Distributors', done: false },
                { n: 'Kaduna Med Supply', done: false },
              ].map((d, i) => (
                <div key={i} className={`p-2 rounded-lg flex items-center gap-2 ${d.done ? 'bg-leaf-50' : 'bg-paper'}`}>
                  <div className={`w-4 h-4 rounded ${d.done ? 'bg-leaf-500' : 'border-2 border-navy-300'} flex items-center justify-center flex-shrink-0`}>
                    {d.done && <Icon name="check" size={10} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className={`text-xs ${d.done ? 'text-navy-500 line-through' : 'text-navy-700'}`}>{d.n}</span>
                  {!d.done && <button className="ml-auto text-[10px] font-bold text-amber-700">Audit</button>}
                </div>
              ))}
              <div className="px-2 pt-2 border-t border-navy-100">
                <p className="text-[10px] text-navy-500">4 of 12 distributors still pending audit. Due May 31.</p>
              </div>
            </div>
          </div>

          <div className="fade-up stagger-3 rounded-2xl bg-white border border-navy-100 p-5">
            <h3 className="font-display font-bold text-ink text-sm mb-3">Top Trade Reps</h3>
            <div className="space-y-2">
              {[
                { n: 'Babatunde Owolabi', z: 'Lagos Trade', v: '₦8.2M' },
                { n: 'Chioma Igwe', z: 'Ibadan', v: '₦5.4M' },
                { n: 'Sodiq Ajao', z: 'Abeokuta', v: '₦4.1M' },
              ].map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-display font-bold text-[10px] flex items-center justify-center">
                    {r.n.split(' ').map(x => x[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-display font-semibold text-ink truncate">{r.n}</p>
                    <p className="text-[10px] text-navy-500">{r.z}</p>
                  </div>
                  <p className="font-mono text-xs font-bold text-amber-700">{r.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
