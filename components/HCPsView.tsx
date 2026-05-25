import { useMemo, useState } from 'react';
import Icon from './Icon';

interface HCPsViewProps {
  searchQuery: string;
}

interface HCP {
  n: string;
  t: string;
  loc: string;
  tier: string;
  last: string;
  value: string;
  rep: string;
}

export default function HCPsView({ searchQuery }: HCPsViewProps) {
  const [tierFilter, setTierFilter] = useState<string>('all');

  const allHcps: HCP[] = [
    { n: 'Lakeshore Specialist Hospital', t: 'Hospital · Institutional', loc: 'Victoria Island', tier: 'A+', last: '10:04 AM', value: '₦18.4M', rep: 'Adaeze O.' },
    { n: 'Reddington Hospital', t: 'Hospital · Private', loc: 'Ikoyi', tier: 'A', last: 'Yesterday', value: '₦12.2M', rep: 'Chinedu E.' },
    { n: 'St. Nicholas Hospital', t: 'Hospital · Private', loc: 'Lagos Island', tier: 'A', last: '2 days ago', value: '₦9.8M', rep: 'Adaeze O.' },
    { n: 'HealthPlus — Surulere', t: 'Pharmacy · Chain', loc: 'Surulere', tier: 'B+', last: 'Today', value: '₦4.5M', rep: 'Tope A.' },
    { n: 'MedPlus Pharmacy — Yaba', t: 'Pharmacy · Chain', loc: 'Yaba', tier: 'B', last: '5 days ago', value: '₦3.2M', rep: 'Adaeze O.' },
    { n: 'Lagoon Hospital VI', t: 'Hospital · Private', loc: 'Victoria Island', tier: 'A', last: 'Today', value: '₦11.1M', rep: 'Tope A.' },
    { n: 'EHA Clinic', t: 'Clinic · Specialist', loc: 'Lekki', tier: 'B+', last: '1 week ago', value: '₦2.8M', rep: 'Kola A.' },
  ];

  const filteredHcps = useMemo(() => {
    let result = allHcps;
    if (tierFilter !== 'all') result = result.filter(h => h.tier.startsWith(tierFilter));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(h => h.n.toLowerCase().includes(q) || h.loc.toLowerCase().includes(q) || h.rep.toLowerCase().includes(q));
    }
    return result;
  }, [tierFilter, searchQuery]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { l: 'Total HCPs', v: '342', d: '+14 this month' },
          { l: 'Hospitals', v: '87', d: '68% institutional' },
          { l: 'Pharmacies', v: '198', d: 'Trade channel' },
          { l: 'Top Tier (A+)', v: '24', d: 'High volume' },
        ].map((k, i) => (
          <div key={i} className={`fade-up stagger-${i + 1} p-5 rounded-2xl bg-white border border-navy-100`}>
            <p className="stat-label text-navy-400">{k.l}</p>
            <p className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">{k.v}</p>
            <p className="text-[11px] text-navy-500 mt-1">{k.d}</p>
          </div>
        ))}
      </div>

      <div className="fade-up stagger-2 rounded-2xl bg-white border border-navy-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-display font-bold text-ink">HCP Database</h3>
            <p className="text-xs text-navy-500 mt-0.5">{filteredHcps.length} of {allHcps.length} accounts</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-paper rounded-lg p-1">
              {[{ k: 'all', l: 'All' }, { k: 'A', l: 'A Tier' }, { k: 'B', l: 'B Tier' }].map(t => (
                <button
                  key={t.k}
                  onClick={() => setTierFilter(t.k)}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                    tierFilter === t.k ? 'bg-white text-navy-700 shadow-sm' : 'text-navy-500'
                  }`}
                >{t.l}</button>
              ))}
            </div>
            <button className="px-3 py-1.5 rounded-lg bg-navy-700 text-white text-xs font-bold flex items-center gap-1.5 btn-press">
              <Icon name="plus" size={12} /> Add HCP
            </button>
          </div>
        </div>

        <div className="divide-y divide-navy-50">
          {filteredHcps.length === 0 ? (
            <div className="py-12 text-center text-sm text-navy-500">No HCPs match these filters</div>
          ) : filteredHcps.map((h, i) => (
            <div key={i} className="px-5 py-3 hover:bg-paper transition-colors flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0">
                <Icon name={h.t.includes('Hospital') ? 'flask' : h.t.includes('Pharmacy') ? 'pill' : 'users'} size={18} className="text-navy-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-sm text-ink truncate">{h.n}</p>
                <p className="text-[11px] text-navy-500 truncate">{h.t} · {h.loc}</p>
              </div>
              <div className="hidden sm:block">
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold font-mono ${
                  h.tier.startsWith('A') ? 'bg-leaf-100 text-leaf-700' : 'bg-navy-100 text-navy-700'
                }`}>{h.tier}</span>
              </div>
              <div className="hidden md:block text-right">
                <p className="font-mono text-sm font-bold text-ink">{h.value}</p>
                <p className="text-[10px] text-navy-400">LTV</p>
              </div>
              <div className="hidden lg:block text-right">
                <p className="text-xs text-navy-700 font-medium">{h.rep}</p>
                <p className="text-[10px] text-navy-400">{h.last}</p>
              </div>
              <button className="text-navy-400 hover:text-navy-700"><Icon name="chevronRight" size={16} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
