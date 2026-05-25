import type { Campaign, CampaignROI } from '../types';

// Mock campaign data. Each campaign's "spend" = materialsCost + budgetSpent;
// "revenue" = attributedRevenue. ROI% = (rev - spend) / spend * 100.

export const CAMPAIGNS: Campaign[] = [
  {
    id: 'cmp-1',
    name: 'Q3 Coflin Paediatric Focus',
    product: 'Coflin Forte 600mg',
    channel: 'institution',
    owner: 'Dr. Femi Akande (PM)',
    status: 'active',
    startedAt: 'May 1, 2026',
    attributionWindowDays: 60,
    materialsCost: 1_800_000,
    budgetSpent: 6_400_000,
    linkedCMs: 4,
    attendeesReached: 142,
    attributedRevenue: 28_400_000,
    regions: ['SW', 'SE', 'NC'],
  },
  {
    id: 'cmp-2',
    name: 'Antibiotic Stewardship · Cross-product',
    product: 'Astrazon 10mg + Coflin Forte',
    channel: 'institution',
    owner: 'Tola Adekunle (MM)',
    status: 'active',
    startedAt: 'May 8, 2026',
    attributionWindowDays: 60,
    materialsCost: 980_000,
    budgetSpent: 3_400_000,
    linkedCMs: 6,
    attendeesReached: 218,
    attributedRevenue: 9_800_000,
    regions: ['SW', 'NC', 'NW', 'SE'],
  },
  {
    id: 'cmp-3',
    name: 'Tuxil-N Trade Push · South-West',
    product: 'Tuxil-N Syrup 100ml',
    channel: 'trade',
    owner: 'Dr. Femi Akande (PM)',
    status: 'active',
    startedAt: 'Apr 22, 2026',
    attributionWindowDays: 60,
    materialsCost: 420_000,
    budgetSpent: 1_100_000,
    linkedCMs: 1,
    attendeesReached: 38,
    attributedRevenue: 1_320_000,
    regions: ['SW'],
  },
  {
    id: 'cmp-4',
    name: 'Cardio Q3 Detailing Refresh',
    product: 'Astrazon 10mg',
    channel: 'institution',
    owner: 'Dr. Ngozi Eze (PM)',
    status: 'paused',
    startedAt: 'Apr 30, 2026',
    attributionWindowDays: 60,
    materialsCost: 680_000,
    budgetSpent: 1_900_000,
    linkedCMs: 2,
    attendeesReached: 64,
    attributedRevenue: 2_080_000,
    regions: ['SW', 'NC'],
  },
];

export const formatNaira = (n: number): string => {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}k`;
  return `₦${n.toLocaleString()}`;
};

export const computeRoi = (c: Campaign): CampaignROI => {
  const spend = c.materialsCost + c.budgetSpent;
  const revenue = c.attributedRevenue;
  const roiPct = spend > 0 ? Math.round(((revenue - spend) / spend) * 100) : 0;
  const status: CampaignROI['status'] = roiPct >= 100 ? 'green' : roiPct >= 0 ? 'amber' : 'red';
  return { spend, revenue, roiPct, status };
};
