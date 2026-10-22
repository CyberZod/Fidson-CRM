import { useState } from 'react';
import Icon from './Icon';

export const CHURN_THRESHOLD = 60;

interface ChurnAccount {
  account: string;
  region: string;
  lastOrderDays: number;
  usualCycleDays: number;
  orders: number[]; // ₦k per month, oldest first (6 months)
  score: number;
  reason: string;
  owner: string;
  channel: 'Institution' | 'Trade' | 'Mobile & Frontline';
}

const ACCOUNTS: ChurnAccount[] = [
  { account: 'Gwarinpa General Hospital', region: 'NC', lastOrderDays: 54, usualCycleDays: 21, orders: [620, 580, 540, 410, 220, 0], score: 88, reason: 'No order in 54 days against a 21-day cycle · GSK Augmentin listed in April', owner: 'Aisha Musa', channel: 'Institution' },
  { account: 'MedPlus Yaba', region: 'SW', lastOrderDays: 33, usualCycleDays: 14, orders: [180, 190, 160, 140, 90, 80], score: 81, reason: 'Unvisited 12 days · order value down 47% vs prior 90 days', owner: 'Adaeze Okafor', channel: 'Institution' },
  { account: 'Bauchi Central Pharmacy', region: 'NE', lastOrderDays: 41, usualCycleDays: 28, orders: [310, 300, 260, 240, 170, 150], score: 76, reason: 'Order value down 41% · 3 planned visits missed', owner: 'Hajara Bukar', channel: 'Trade' },
  { account: 'Onitsha Trade Hub', region: 'SE', lastOrderDays: 26, usualCycleDays: 14, orders: [940, 910, 880, 760, 700, 610], score: 69, reason: 'Steady decline 6 months · switched Tuxil-N volume to a competitor syrup', owner: 'Nkem Anozie', channel: 'Trade' },
  { account: 'Kano Distributors Ltd', region: 'NW', lastOrderDays: 19, usualCycleDays: 14, orders: [1200, 1180, 1100, 1040, 980, 870], score: 63, reason: 'Order value down 18% · Q2 audit overdue', owner: 'Fatima Ahmed', channel: 'Trade' },
  { account: 'Reddington Hospital Ikeja', region: 'SW', lastOrderDays: 9, usualCycleDays: 14, orders: [420, 430, 450, 440, 460, 470], score: 22, reason: 'Healthy', owner: 'Chinedu Eze', channel: 'Institution' },
];

const Spark = ({ values, color }: { values: number[]; color: string }) => {
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 56 + 2},${22 - (v / max) * 18}`).join(' ');
  return (
    <svg width="60" height="24" viewBox="0 0 60 24" aria-hidden>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

interface ChurnRiskProps {
  regions?: string[]; // limit to these region codes; omit for national
  title?: string;
}

export default function ChurnRisk({ regions, title = 'Churn Risk' }: ChurnRiskProps) {
  const [open, setOpen] = useState<string | null>(null);
  const [assigned, setAssigned] = useState<Record<string, boolean>>({});
  const rows = ACCOUNTS
    .filter(a => a.score >= CHURN_THRESHOLD && (!regions || regions.includes(a.region)))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-navy-100">
        <div className="flex items-center gap-2">
          <h3 className="font-display font-bold text-ink text-sm">{title}</h3>
          <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[9px] font-bold">{rows.length} ACCOUNTS</span>
        </div>
        <p className="text-[10px] text-navy-500 mt-1 leading-snug">
          Listed at risk score {CHURN_THRESHOLD}+ out of 100. Score: 50% order-value drop vs prior 90 days, 30% days since last order vs the account's usual cycle, 20% planned visits missed.
        </p>
      </div>
      <div className="divide-y divide-navy-50">
        {rows.map(a => {
          const isOpen = open === a.account;
          const hi = a.score >= 80;
          return (
            <div key={a.account}>
              <button onClick={() => setOpen(isOpen ? null : a.account)} className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-paper text-left">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 ${hi ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{a.score}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-xs text-ink truncate">{a.account}</p>
                  <p className="text-[10px] text-navy-500 truncate">{a.region} · last order {a.lastOrderDays}d ago · {a.owner}</p>
                </div>
                <Spark values={a.orders} color={hi ? '#E11D48' : '#D97706'} />
              </button>
              {isOpen && (
                <div className="px-4 pb-3 fade-up">
                  <div className="p-3 rounded-xl bg-paper border border-navy-100 space-y-1.5">
                    <p className="text-[11px] text-navy-700"><span className="font-bold">Reason:</span> {a.reason}</p>
                    <p className="text-[11px] text-navy-700"><span className="font-bold">Order trend (₦k/month):</span> <span className="font-mono">{a.orders.join(' · ')}</span></p>
                    <p className="text-[11px] text-navy-700"><span className="font-bold">Owner:</span> {a.owner} · {a.channel} · usual cycle {a.usualCycleDays} days</p>
                    {assigned[a.account] ? (
                      <p className="text-[11px] font-bold text-leaf-700 flex items-center gap-1"><Icon name="checkCircle" size={12} /> Retention visit added to {a.owner}'s plan for this week</p>
                    ) : (
                      <button onClick={() => setAssigned(p => ({ ...p, [a.account]: true }))} className="mt-1 px-2.5 py-1.5 rounded-lg bg-rose-500 text-white text-[11px] font-bold btn-press hover:bg-rose-600">
                        Assign retention visit
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {rows.length === 0 && <p className="px-5 py-6 text-center text-xs text-navy-500">No accounts above the threshold in this scope</p>}
      </div>
    </div>
  );
}

interface Market { city: string; region: 'NW' | 'NE' | 'NC' | 'SW' | 'SE' | 'SS'; op: string; pri: 'high' | 'med' }

export const HIGH_POTENTIAL_MARKETS: Market[] = [
  { city: 'Abuja (FCT)', region: 'NC', op: '₦24M', pri: 'high' },
  { city: 'Kano', region: 'NW', op: '₦18M', pri: 'high' },
  { city: 'Port Harcourt', region: 'SS', op: '₦14M', pri: 'med' },
  { city: 'Enugu', region: 'SE', op: '₦9M', pri: 'med' },
  { city: 'Kaduna', region: 'NW', op: '₦7M', pri: 'med' },
];

export function HighPotentialMarkets({ onSelectRegion }: { onSelectRegion?: (code: Market['region']) => void }) {
  return (
    <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-navy-100">
        <h3 className="font-display font-bold text-ink text-sm">High-Potential Markets</h3>
        <p className="text-[10px] text-navy-500 mt-1 leading-snug">Listed when estimated untapped value is ₦5M+ a quarter: institutions in the area not in any call plan, priced at the regional average order.</p>
      </div>
      <div className="divide-y divide-navy-50">
        {HIGH_POTENTIAL_MARKETS.map(m => (
          <button key={m.city} onClick={() => onSelectRegion?.(m.region)} className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-paper text-left">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center font-mono font-bold text-[10px] text-indigo-700 flex-shrink-0">{m.region}</div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-xs text-ink truncate">{m.city}</p>
              <p className="text-[10px] text-navy-500">Underserved · A-tier potential</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-xs font-bold text-leaf-700">{m.op}</p>
              <span className={`text-[9px] font-bold ${m.pri === 'high' ? 'text-rose-700' : 'text-amber-700'}`}>{m.pri.toUpperCase()}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
