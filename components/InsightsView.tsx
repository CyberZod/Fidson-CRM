import Icon from './Icon';
import type { IconName } from '../types';

interface InsightCard {
  cat: string;
  icon: IconName;
  color: 'leaf' | 'amber' | 'navy';
  title: string;
  body: string;
  action: string;
}

export default function InsightsView() {
  const insights: InsightCard[] = [
    { cat: 'Coverage', icon: 'target', color: 'leaf', title: 'Apapa zone gap — 21 days', body: '3 institutional accounts haven\'t been visited. ₦480k pipeline at risk of churn.', action: 'Re-assign to backup rep' },
    { cat: 'Distributor', icon: 'alert', color: 'amber', title: 'Tuxil-N low stock · PHC', body: 'Distributor expected to stock out in 6 days. Recommend Q4 reorder push.', action: 'Push reorder' },
    { cat: 'Conversion', icon: 'trending', color: 'leaf', title: 'Coflin uptake +37% MoM', body: 'Strong response from teaching hospitals. Recommend dedicated detailing campaign.', action: 'Launch campaign' },
    { cat: 'Competitor', icon: 'flag', color: 'amber', title: 'GSK promo detected · 5 sites', body: '15% trade discount on Augmentin. May affect Astrazon conversion rates.', action: 'Brief team' },
    { cat: 'Rep Performance', icon: 'users', color: 'navy', title: 'Anomaly: Fatima B.', body: 'Visit completion 45% vs team avg 78%. Suggests engagement check.', action: 'Schedule 1:1' },
    { cat: 'Opportunity', icon: 'sparkles', color: 'leaf', title: 'New tier-A prospect', body: 'Lagoon Hospital VI showing 3x order velocity. Recommend KAM elevation.', action: 'Convert account' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="fade-up relative p-6 sm:p-8 rounded-2xl overflow-hidden text-white" style={{ background: 'linear-gradient(120deg, #0F2147 0%, #142A5A 50%, #1a3a6e 100%)' }}>
        <div className="absolute inset-0 ai-shimmer" />
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(91, 183, 73, 0.25) 0%, transparent 70%)' }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-leaf-500 flex items-center justify-center">
              <Icon name="sparkles" size={20} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-leaf-300 tracking-[0.2em] uppercase">AI Engine</p>
              <p className="text-white text-base font-display font-semibold">Forecasting & Insights</p>
            </div>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mt-4">
            Lagos is on track for <span className="text-leaf-300">94%</span> Q2 attainment
          </h2>
          <p className="text-sm text-navy-200 mt-2 max-w-2xl">
            Based on current rep activity, conversion trends, and historical Q2 patterns. Confidence: 87%.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((c, i) => (
          <div key={i} className={`fade-up stagger-${(i % 5) + 1} p-5 rounded-2xl bg-white border border-navy-100 card-hover`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                c.color === 'leaf' ? 'bg-leaf-50 text-leaf-700' :
                c.color === 'amber' ? 'bg-amber-50 text-amber-700' : 'bg-navy-50 text-navy-700'
              }`}><Icon name={c.icon} size={16} /></div>
              <p className="stat-label text-navy-400">{c.cat}</p>
            </div>
            <h4 className="font-display font-bold text-ink text-base leading-tight">{c.title}</h4>
            <p className="text-xs text-navy-500 mt-2 leading-relaxed">{c.body}</p>
            <button className={`mt-4 text-xs font-bold flex items-center gap-1 ${
              c.color === 'leaf' ? 'text-leaf-700' : c.color === 'amber' ? 'text-amber-700' : 'text-navy-700'
            }`}>{c.action} <Icon name="arrowRight" size={12} /></button>
          </div>
        ))}
      </div>

      <div className="fade-up rounded-2xl bg-white border border-navy-100 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h3 className="font-display font-bold text-ink">Revenue Forecast · 12 weeks ahead</h3>
            <p className="text-xs text-navy-500 mt-0.5">Confidence interval shown</p>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-navy-700" /><span className="text-navy-700 font-semibold">Actual</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-leaf-300" /><span className="text-navy-700 font-semibold">Forecast</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-leaf-100" /><span className="text-navy-700 font-semibold">Confidence</span></div>
          </div>
        </div>
        <div className="relative h-48 sm:h-64">
          <svg className="w-full h-full" viewBox="0 0 600 240" preserveAspectRatio="none">
            {[0, 60, 120, 180].map(y => (
              <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="#DCE3F2" strokeWidth="1" strokeDasharray="3 3" />
            ))}
            <path d="M 300 120 Q 350 100 400 110 T 500 95 T 600 80 L 600 130 Q 500 145 400 140 T 300 120 Z" fill="#E1F3D9" opacity="0.7" />
            <path d="M 0 180 L 50 160 L 100 165 L 150 140 L 200 130 L 250 125 L 300 120" fill="none" stroke="#142A5A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 300 120 Q 350 110 400 115 T 500 95 T 600 80" fill="none" stroke="#5BB749" strokeWidth="3" strokeDasharray="6 4" strokeLinecap="round" />
            {[[0, 180], [50, 160], [100, 165], [150, 140], [200, 130], [250, 125], [300, 120]].map((p, i) => (
              <circle key={i} cx={p[0]} cy={p[1]} r="4" fill="#142A5A" />
            ))}
            <circle cx="300" cy="120" r="6" fill="#5BB749" stroke="white" strokeWidth="2" />
          </svg>
          <div className="absolute top-2 right-2 px-2 py-1 rounded bg-navy-900 text-white text-[10px] font-mono">TODAY</div>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-navy-100">
          {[
            { l: 'Current Run-Rate', v: '₦42.3M' },
            { l: 'Q2 End Forecast', v: '₦58.0M' },
            { l: 'vs Target', v: '+₦3.2M' },
            { l: 'Confidence', v: '87%' },
          ].map(s => (
            <div key={s.l}>
              <p className="stat-label text-navy-400">{s.l}</p>
              <p className="font-display text-lg font-bold text-ink mt-0.5">{s.v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
