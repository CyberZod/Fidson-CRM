import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react';

// Trade distributors for the FSM: stock health, reorder pushes and the quarterly audit.
// Shared by FSMDashboard and FSMDistributorsView so a reorder or audit shows on both.

export type DistStatus = 'critical' | 'low' | 'healthy';

export interface AuditRecord {
  date: string;
  auditor: string;
  countedCartons?: number;
  systemCartons?: number;
  nearExpiry?: number;
  tempC?: number;
  pricingOk?: boolean;
  signedBy?: string;
  signature?: string;
}

export interface ReorderRecord {
  sku: string;
  qty: number;
  at: string;
  recipients: string[];
}

export interface Distributor {
  id: string;
  n: string;
  loc: string;
  region: string;
  vol: string;
  stock: number;
  days: number;
  sku: string;
  contact: string;
  audit?: AuditRecord;
  reorder?: ReorderRecord;
}

export const statusOf = (d: Distributor): DistStatus => (d.days <= 7 ? 'critical' : d.days <= 15 ? 'low' : 'healthy');

export const FSM_NAME = 'Ifeanyi Obi';

const SEED: Distributor[] = [
  { id: 'd-01', n: 'PHC Pharmacy Distributors', loc: 'Port Harcourt', region: 'SS', vol: '₦1.2M', stock: 8, days: 6, sku: 'Tuxil-N Syrup 100ml', contact: 'Mrs. Ibiere Dappa' },
  { id: 'd-02', n: 'WestEnd Distributors Ltd', loc: 'Lagos', region: 'SW', vol: '₦4.8M', stock: 23, days: 14, sku: 'Coflin Forte 600mg', contact: 'Mr. Kunle Ojo', audit: { date: 'May 6', auditor: 'Ifeanyi Obi', signedBy: 'Kunle Ojo' } },
  { id: 'd-03', n: 'Mainland Pharma Supply', loc: 'Lagos', region: 'SW', vol: '₦3.1M', stock: 64, days: 32, sku: 'All lines', contact: 'Mrs. Bisi Ade', audit: { date: 'May 7', auditor: 'Babatunde Owolabi', signedBy: 'Bisi Ade' } },
  { id: 'd-04', n: 'Ibadan Med Distributors', loc: 'Ibadan', region: 'SW', vol: '₦2.4M', stock: 48, days: 24, sku: 'All lines', contact: 'Mr. Wale Akintola', audit: { date: 'May 9', auditor: 'Chioma Igwe', signedBy: 'Wale Akintola' } },
  { id: 'd-05', n: 'Abeokuta Wholesalers', loc: 'Abeokuta', region: 'SW', vol: '₦1.8M', stock: 18, days: 9, sku: 'Coflin Forte 600mg', contact: 'Alhaji Rasaq Bello', audit: { date: 'May 12', auditor: 'Sodiq Ajao', signedBy: 'Rasaq Bello' } },
  { id: 'd-06', n: 'Kano Distributors', loc: 'Kano', region: 'NW', vol: '₦1.4M', stock: 28, days: 15, sku: 'Astrazon 10mg', contact: 'Malam Sani Idris' },
  { id: 'd-07', n: 'Onitsha Trade Hub', loc: 'Onitsha', region: 'SE', vol: '₦0.9M', stock: 32, days: 18, sku: 'Tuxil-N Syrup 100ml', contact: 'Chief Obiora Nnadi' },
  { id: 'd-08', n: 'Kaduna Med Supply', loc: 'Kaduna', region: 'NW', vol: '₦0.8M', stock: 36, days: 21, sku: 'All lines', contact: 'Mrs. Hauwa Yakubu' },
  { id: 'd-09', n: 'Benin Pharma Link', loc: 'Benin', region: 'SS', vol: '₦1.1M', stock: 41, days: 26, sku: 'Coflin Forte 600mg', contact: 'Mr. Osas Igbinedion', audit: { date: 'May 5', auditor: 'Ifeanyi Obi', signedBy: 'Osas Igbinedion' } },
  { id: 'd-10', n: 'Enugu Medical Depot', loc: 'Enugu', region: 'SE', vol: '₦1.0M', stock: 39, days: 22, sku: 'All lines', contact: 'Mrs. Adaobi Okafor', audit: { date: 'May 8', auditor: 'Ifeanyi Obi', signedBy: 'Adaobi Okafor' } },
  { id: 'd-11', n: 'Abuja Central Pharma', loc: 'Abuja', region: 'NC', vol: '₦2.1M', stock: 52, days: 28, sku: 'Astrazon 10mg', contact: 'Mr. Danladi Musa', audit: { date: 'May 13', auditor: 'Ifeanyi Obi', signedBy: 'Danladi Musa' } },
  { id: 'd-12', n: 'Ilorin Health Supplies', loc: 'Ilorin', region: 'NC', vol: '₦0.7M', stock: 30, days: 19, sku: 'Tuxil-N Syrup 100ml', contact: 'Mr. Yusuf Alabi', audit: { date: 'May 14', auditor: 'Chioma Igwe', signedBy: 'Yusuf Alabi' } },
];

let state: { distributors: Distributor[] } = { distributors: SEED };
const listeners = new Set<() => void>();
const set = (distributors: Distributor[]) => {
  state = { distributors };
  listeners.forEach(l => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

const clock = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

// cartons per day from current cover, and how many to order for 35 days of cover after a 5-day lead time
export const suggestReorder = (d: Distributor) => {
  const perDay = d.stock / Math.max(1, d.days);
  const qty = Math.max(10, Math.ceil(perDay * (35 + 5) - d.stock));
  return { perDay, qty, coverAfter: Math.round((d.stock + qty) / perDay) - 5 };
};

const actions = {
  pushReorder(id: string, r: Omit<ReorderRecord, 'at'>): ReorderRecord {
    const rec = { ...r, at: clock() };
    set(state.distributors.map(d => d.id === id ? { ...d, reorder: rec } : d));
    return rec;
  },
  completeAudit(id: string, a: Omit<AuditRecord, 'date'>) {
    set(state.distributors.map(d => d.id === id ? { ...d, audit: { ...a, date: `Today ${clock()}` } } : d));
  },
};

export type DistributionApi = { distributors: Distributor[]; auditDone: number; auditTotal: number } & typeof actions;

const DistributionContext = createContext<true | null>(null);

export function DistributionProvider({ children }: { children: ReactNode }) {
  return <DistributionContext.Provider value={true}>{children}</DistributionContext.Provider>;
}

export function useDistribution(): DistributionApi {
  useContext(DistributionContext);
  const s = useSyncExternalStore(subscribe, () => state);
  return {
    distributors: s.distributors,
    auditDone: s.distributors.filter(d => d.audit).length,
    auditTotal: s.distributors.length,
    ...actions,
  };
}
