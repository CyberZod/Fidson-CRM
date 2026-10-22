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

// How far each seeded campaign is into its attribution window, and the product's
// weekly units before launch (the baseline the uplift chart compares against).
export const CAMPAIGN_TRACKING: Record<string, { daysElapsed: number; baselineWeeklyUnits: number }> = {
  'cmp-1': { daysElapsed: 52, baselineWeeklyUnits: 410 },
  'cmp-2': { daysElapsed: 45, baselineWeeklyUnits: 260 },
  'cmp-3': { daysElapsed: 60, baselineWeeklyUnits: 180 },
  'cmp-4': { daysElapsed: 38, baselineWeeklyUnits: 140 },
};

// 8 weeks before launch, then one bar per elapsed week. Deterministic so the chart is stable.
export const upliftSeries = (c: Campaign & { daysElapsed: number; baselineWeeklyUnits: number; targetRevenue: number }) => {
  const spend = c.materialsCost + c.budgetSpent;
  const lift = Math.min(0.6, Math.max(0.06, (c.targetRevenue / Math.max(1, spend)) / 8));
  const wobble = (i: number) => ((Math.sin((i + c.id.length) * 12.9898) * 43758.5453) % 1 + 1) % 1;
  const before = Array.from({ length: 8 }, (_, i) => Math.round(c.baselineWeeklyUnits * (0.92 + 0.16 * wobble(i))));
  const weeks = Math.min(9, Math.ceil(c.daysElapsed / 7));
  const after = Array.from({ length: weeks }, (_, i) => {
    const ramp = Math.min(1, (i + 1) / 3);
    return Math.round(c.baselineWeeklyUnits * (1 + lift * ramp) * (0.94 + 0.12 * wobble(i + 20)));
  });
  const avg = (a: number[]) => a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0;
  const upliftPct = after.length ? Math.round(((avg(after) - avg(before)) / avg(before)) * 100) : 0;
  return { before, after, upliftPct };
};
