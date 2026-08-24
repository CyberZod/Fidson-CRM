import Icon from './Icon';
import type { CustomerInventoryItem, IconName } from '../types';

interface RepCoachViewProps {
  customerInventory?: CustomerInventoryItem[];
  onNavigate: (view: string) => void;
}

interface InsightCard {
  cat: string;
  icon: IconName;
  color: 'leaf' | 'amber' | 'navy';
  title: string;
  body: string;
  action: string;
}

export default function RepCoachView({ customerInventory = [] }: RepCoachViewProps) {
  const insights: InsightCard[] = [
    { cat: 'Priority', icon: 'target', color: 'leaf', title: 'Focus on Lekki this week', body: '5 untouched A-tier HCPs in your zone. Average LTV ₦8.2M each.', action: 'Plan visits' },
    { cat: 'Conversion', icon: 'trending', color: 'leaf', title: 'Coflin warm leads', body: '3 doctors asked for paediatric data last visit. High likelihood to convert.', action: 'Send clinical pack' },
    { cat: 'Coverage', icon: 'alert', color: 'amber', title: 'MedPlus Yaba · 12 days', body: 'You haven\'t visited in 12 days. They\'re overdue for restock conversation.', action: 'Schedule visit' },
    { cat: 'Win-back', icon: 'refresh', color: 'navy', title: 'HealthPlus declining', body: 'Order frequency dropped 30% in 60 days. Recommend in-person check-in.', action: 'View account' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      <div className="fade-up relative p-6 sm:p-8 rounded-2xl overflow-hidden text-white" style={{ background: 'linear-gradient(120deg, #0F2147 0%, #142A5A 50%, #1a3a6e 100%)' }}>
        <div className="absolute inset-0 ai-shimmer" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-leaf-500 flex items-center justify-center">
              <Icon name="sparkles" size={20} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-leaf-300 tracking-[0.2em] uppercase">Your Personal AI Coach</p>
              <p className="text-white text-base font-display font-semibold">Insights tailored to you</p>
            </div>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mt-4">
            You're on pace for <span className="text-leaf-300">112%</span> of your Q2 target
          </h2>
          <p className="text-sm text-navy-200 mt-2">If you maintain current pace, you'll over-deliver by ₦4.2M. Top 5% in Lagos region.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((c, i) => (
          <div key={i} className={`fade-up stagger-${i + 1} p-5 rounded-2xl bg-white border border-navy-100 card-hover`}>
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-ink">AI Shelf Restock Recommendations</h3>
            <p className="text-xs text-navy-500 mt-0.5">Identified low-stock customer accounts requiring restock conversation</p>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[9px] font-bold">REAL-TIME</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customerInventory.filter(i => i.status === 'Low Stock').map(item => (
            <div key={item.id} className="p-4 rounded-xl border border-navy-200 bg-navy-50 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
                <Icon name="package" size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-sm text-ink">{item.customer}</p>
                <p className="text-xs text-navy-600 mt-0.5">Product: <strong>{item.product}</strong> · Available Stock: <strong>{item.stockOnHand} units</strong> (Min: {item.restockLevel})</p>
                <p className="text-xs text-leaf-700 font-semibold mt-2 flex items-center gap-1">
                  <Icon name="sparkles" size={12} /> Recommendation: {item.recommendation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fade-up rounded-2xl bg-white border border-navy-100 p-5 sm:p-6 mt-6">
        <h3 className="font-display font-bold text-ink mb-4">My Performance · Last 4 Weeks</h3>
        <div className="flex items-end gap-2 h-32">
          {[68, 72, 78, 85, 88, 92, 96, 87].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-md transition-all hover:opacity-80"
                style={{
                  height: `${h}%`,
                  background: i === 7 ? '#5BB749' : 'linear-gradient(180deg, #5BB749 0%, #3B7B2E 100%)',
                  opacity: i === 7 ? 1 : 0.5 + (i * 0.07),
                }}
              />
              <span className="text-[10px] font-mono text-navy-400">W{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
