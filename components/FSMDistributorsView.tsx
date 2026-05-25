import Icon from './Icon';

type DistStatus = 'critical' | 'low' | 'healthy';

interface DistributorRow {
  n: string;
  loc: string;
  vol: string;
  stock: number;
  days: number;
  status: DistStatus;
  audit: boolean;
}

export default function FSMDistributorsView() {
  const distributors: DistributorRow[] = [
    { n: 'WestEnd Distributors Ltd', loc: 'Lagos', vol: '₦4.8M', stock: 23, days: 14, status: 'low', audit: true },
    { n: 'Mainland Pharma Supply', loc: 'Lagos', vol: '₦3.1M', stock: 64, days: 32, status: 'healthy', audit: true },
    { n: 'Ibadan Med Distributors', loc: 'Ibadan', vol: '₦2.4M', stock: 48, days: 24, status: 'healthy', audit: true },
    { n: 'Abeokuta Wholesalers', loc: 'Abeokuta', vol: '₦1.8M', stock: 18, days: 9, status: 'low', audit: true },
    { n: 'PHC Pharmacy Distributors', loc: 'Port Harcourt', vol: '₦1.2M', stock: 8, days: 6, status: 'critical', audit: false },
    { n: 'Onitsha Trade Hub', loc: 'Onitsha', vol: '₦0.9M', stock: 32, days: 18, status: 'healthy', audit: false },
    { n: 'Kano Distributors', loc: 'Kano', vol: '₦1.4M', stock: 28, days: 15, status: 'low', audit: false },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden fade-up">
        <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-display font-bold text-ink">All Distributors · South-West Region</h3>
            <p className="text-xs text-navy-500 mt-0.5">12 distributors · ₦14.2M weekly volume · Quarterly audit Q2</p>
          </div>
          <button className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 btn-press">
            <Icon name="plus" size={12} /> Onboard Distributor
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full hidden md:table">
            <thead>
              <tr className="bg-paper border-b border-navy-100">
                <th className="px-5 py-3 text-left stat-label text-navy-500">Distributor</th>
                <th className="px-5 py-3 text-left stat-label text-navy-500">Location</th>
                <th className="px-5 py-3 text-right stat-label text-navy-500">Weekly Vol.</th>
                <th className="px-5 py-3 text-center stat-label text-navy-500">Stock Health</th>
                <th className="px-5 py-3 text-center stat-label text-navy-500">Days to S/O</th>
                <th className="px-5 py-3 text-center stat-label text-navy-500">Q2 Audit</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {distributors.map((d, i) => (
                <tr key={i} className="hover:bg-paper transition-colors">
                  <td className="px-5 py-3 font-display font-semibold text-sm text-ink">{d.n}</td>
                  <td className="px-5 py-3 text-sm text-navy-500">{d.loc}</td>
                  <td className="px-5 py-3 text-right font-mono text-sm font-bold text-ink">{d.vol}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${
                      d.status === 'critical' ? 'bg-rose-50 text-rose-700' :
                      d.status === 'low' ? 'bg-amber-50 text-amber-700' : 'bg-leaf-50 text-leaf-700'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        d.status === 'critical' ? 'bg-rose-500' : d.status === 'low' ? 'bg-amber-500' : 'bg-leaf-500'
                      }`} />
                      {d.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <p className={`font-mono text-sm font-bold ${
                      d.days <= 7 ? 'text-rose-700' : d.days <= 14 ? 'text-amber-700' : 'text-navy-700'
                    }`}>{d.days}d</p>
                  </td>
                  <td className="px-5 py-3 text-center">
                    {d.audit ? (
                      <Icon name="check" size={16} className="text-leaf-600 mx-auto" strokeWidth={3} />
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700">PENDING</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {d.status === 'critical' || d.status === 'low' ? (
                      <button className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-bold">Reorder</button>
                    ) : (
                      <button className="text-navy-400 hover:text-navy-700"><Icon name="eye" size={14} /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
