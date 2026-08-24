import { useMemo, useState } from 'react';
import { PERSONAS } from './assets/personas';
import Sidebar from './components/Sidebar';
import RepSidebar from './components/RepSidebar';
import RepTeamView from './components/RepTeamView';
import SyncQueueView from './components/SyncQueueView';
import RoleSidebar from './components/RoleSidebar';
import TopBar from './components/TopBar';
import BottomNav from './components/BottomNav';
import LoginScreen from './components/LoginScreen';
import ToastContainer from './components/ToastContainer';
import ApprovalModal from './components/ApprovalModal';
import HelpdeskWidget from './components/HelpdeskWidget';
import Icon from './components/Icon';

import DashboardView from './components/DashboardView';
import FieldActivityView from './components/FieldActivityView';
import OrdersView from './components/OrdersView';
import HCPsView from './components/HCPsView';
import AIInsightsChat from './components/AIInsightsChat';
import ClinicalView from './components/ClinicalView';
import ReportsView from './components/ReportsView';
import RSMItinerariesView from './components/RSMItinerariesView';

import RepDashboard from './components/RepDashboard';
import RepPlanView from './components/RepPlanView';
import RepVisitLogView from './components/RepVisitLogView';
import RepOrderView from './components/RepOrderView';
import RepCoachView from './components/RepCoachView';
import RepDCRView from './components/RepDCRView';
import RepClinicalView from './components/RepClinicalView';
import CustomersView from './components/CustomersView';
import type { Account } from './components/CustomersView';
import RepInvoicesView from './components/RepInvoicesView';
import RepPipelineView from './components/RepPipelineView';
import PipelineView from './components/PipelineView';
import { SEED_LEADS, REP_OWNER, type Lead } from './assets/leads';
import PerformanceView from './components/PerformanceView';

import ASMDashboard from './components/ASMDashboard';
import ASMTeamView from './components/ASMTeamView';
import ASMActivityLogView from './components/ASMActivityLogView';

import FSMDashboard from './components/FSMDashboard';
import FSMDistributorsView from './components/FSMDistributorsView';

import PMDashboard from './components/PMDashboard';
import PMMaterialsView from './components/PMMaterialsView';
import PMClinicalView from './components/PMClinicalView';
import PMDirectivesView from './components/PMDirectivesView';
import PMFieldView from './components/PMFieldView';

import MMDashboard from './components/MMDashboard';
import MMContentApprovalsView from './components/MMContentApprovalsView';
import MMCmeView from './components/MMCmeView';

import DMDashboard from './components/DMDashboard';
import DMEscalatedView from './components/DMEscalatedView';

import NSMDashboard from './components/NSMDashboard';
import NSMDirectiveView from './components/NSMDirectiveView';

import HoMDashboard from './components/HoMDashboard';
import BMDashboard from './components/BMDashboard';
import BMDDashboard from './components/BMDDashboard';
import ADCDashboard from './components/ADCDashboard';
import CDDashboard from './components/CDDashboard';
import CampaignsView from './components/CampaignsView';
import PMPromoView from './components/PMPromoView';

import CustomerInventoryView from './components/CustomerInventoryView';

import { weekLabel, weekId, weekRangeShort } from './utils/dates';

import type {
  Toast,
  ToastInput,
  AuthUser,
  PersonaKey,
  ApprovalModalItem,
  OrderRow,
  ApprovalItem,
  ItineraryPending,
  AdjustmentPending,
  ClinicalMeetingRow,
  ContentApprovalRow,
  DirectiveRow,
  DirectiveForm,
  AccompanimentRow,
  AccompanimentForm,
  JointCall,
  JointCallForm,
  PromoRequest,
  CustomerInventoryItem,
  RepVisit,
  RepActiveVisit,
  AdjustmentRequest,
  CustomerStockEntry,
  RepOrderSubmission,
  RepAdjustment,
  CMForm,
  VisitLog,
  SubmittedDCR,
  SignedInUser,
  MaterialItem,
  NavItem,
  ColorKey,
} from './types';
import type { DirectiveForm as NSMDirectiveFormType } from './components/NSMDirectiveView';

interface ViewMeta {
  t: string;
  s: string;
}

interface BottomNavSpec {
  items: NavItem[];
  color: ColorKey;
}

// Build an ISO timestamp for today at the given hour:minute (for seeded/auto-filled DCR visits).
function atToday(h: number, m: number): string {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

// One pre-submitted DCR from a second rep so the RSM feed shows multi-rep activity
// before Adaeze even submits. Same shape as a live submission.
function seedDcrs(): SubmittedDCR[] {
  const mk = (id: string, hcpName: string, institution: string, specialty: string, h: number, m: number, products: string[], pharm = false): VisitLog => ({
    id, repId: 'chinedu', repName: 'Chinedu Eze', timestamp: atToday(h, m),
    hcpType: pharm ? 'Pharmacist' : 'Doctor', hcpName, institution, specialty,
    location: { latitude: 6.6, longitude: 3.35, isManual: false },
    productsDiscussed: products,
    attendees: { doctors: pharm ? 0 : 1, pharmacists: pharm ? 1 : 0, nurses: 0, others: 0 },
    summary: 'Detailed call completed; product focus delivered.', nextSteps: 'Follow up next cycle.',
  });
  const logs = [
    mk('ce-1', 'Dr. K. Balogun', 'Reddington Hospital Ikeja', 'Cardiology', 9, 15, ['Coflin Forte 600mg']),
    mk('ce-2', 'Mrs. A. Nwosu', 'HealthPlus Ikeja', 'Pharmacist', 10, 40, ['Astrazon', 'Coflin Forte 600mg'], true),
    mk('ce-3', 'Dr. S. Oyelaran', 'Eko Hospital Ikeja', 'Paediatrics', 12, 30, ['Coflin Forte 600mg']),
    mk('ce-4', 'Dr. I. Okafor', 'First Consultant Ikeja', 'Internal Medicine', 14, 50, ['Astrazon']),
  ];
  return [{
    id: 'dcr-seed-chinedu', rep: 'Chinedu Eze', submittedAt: '4:55 PM',
    visitsCompleted: logs.length, ordersToday: 2, logs, samples: 28,
    aiSummary: 'Solid institutional day across the Ikeja cluster · 4 A-tier calls with consistent Coflin focus and strong pharmacy pull-through at HealthPlus. 2 orders booked. Recommend follow-up on the Eko Hospital paediatrics lead next cycle.',
  }];
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [view, setView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [approvalModalItem, setApprovalModalItem] = useState<ApprovalModalItem | null>(null);

  // ===== REP-SPECIFIC STATE =====
  const [activeVisit, setActiveVisit] = useState<RepActiveVisit | null>(null);
  const [cmPrefillHcp, setCmPrefillHcp] = useState<string>('');
  const [visitLogs, setVisitLogs] = useState<VisitLog[]>([]);
  const [leads, setLeads] = useState<Lead[]>(SEED_LEADS);
  const [convertedCustomers, setConvertedCustomers] = useState<Account[]>([]);
  const [dcrs, setDcrs] = useState<SubmittedDCR[]>(seedDcrs);
  // Adaeze's own daily-adjustment records · drives the rep's adjustment cap and
  // round-trips status (pending → approved/rejected) when the RSM decides.
  const [repAdjustments, setRepAdjustments] = useState<RepAdjustment[]>([]);

  const [repVisits, setRepVisits] = useState<RepVisit[]>([
    // Monday May 12
    { id: 101, day: 'mon', name: 'Reddington Hospital', contact: 'Dr. Akin Bello', role: 'Internal Med', time: '09:30', dist: '2.4', priority: 'high', status: 'done', address: '12 Idowu Martins, V.I.' },
    { id: 102, day: 'mon', name: 'St. Nicholas Hospital', contact: 'Dr. C. Okonkwo', role: 'Paediatrics', time: '11:00', dist: '4.1', priority: 'med', status: 'done', address: '57 Campbell Street, Lagos Island' },
    { id: 103, day: 'mon', name: 'HealthPlus Ikoyi', contact: 'Mrs. R. Doherty', role: 'Pharmacist', time: '14:00', dist: '5.8', priority: 'med', status: 'done', address: 'Awolowo Road, Ikoyi' },
    // Tuesday May 13 · TODAY (fresh day, AI-optimized route, nothing completed yet)
    { id: 1, day: 'tue', name: 'Reddington Hospital VI', contact: 'Dr. Akin Bello', role: 'Internal Medicine', time: '09:30', fixedTime: true, dist: '2.4', priority: 'high', status: 'next', address: '12 Idowu Martins, Victoria Island', plannedProducts: ['Coflin Forte 600mg'] },
    { id: 2, day: 'tue', name: 'MedPlus Lekki Phase 1', contact: 'Mrs. Funke Eze', role: 'Pharmacist', time: '10:25', dist: '5.9', priority: 'med', status: 'pending', address: 'Admiralty Way, Lekki Phase 1' },
    { id: 3, day: 'tue', name: 'Lakeshore Specialist Hospital', contact: 'Dr. T. Adebayo', role: 'Internal Medicine', time: '11:05', dist: '0.6', priority: 'high', status: 'pending', address: 'Plot 14, Adeola Odeku, Victoria Island' },
    { id: 4, day: 'tue', name: 'St Nicholas Hospital', contact: 'Dr. C. Okonkwo', role: 'Paediatrics', time: '13:00', fixedTime: true, dist: '7.8', priority: 'med', status: 'pending', address: '57 Campbell Street, Lagos Island' },
    { id: 5, day: 'tue', name: 'Eko Hospital Ikeja', contact: 'Dr. N. Olaniyan', role: 'Paediatrics', time: '14:35', dist: '15.6', priority: 'high', status: 'pending', address: 'Mobolaji Bank Anthony Way, Ikeja' },
    // Wednesday May 14
    { id: 201, day: 'wed', name: 'EHA Clinic', contact: 'Dr. F. Onuoha', role: 'GP', time: '09:00', dist: '3.2', priority: 'med', status: 'pending', address: 'Lekki Phase 1' },
    { id: 202, day: 'wed', name: 'Vedic Lifecare', contact: 'Dr. M. Singh', role: 'Cardiology', time: '10:30', dist: '4.8', priority: 'high', status: 'pending', address: 'Eko Atlantic' },
    { id: 203, day: 'wed', name: 'MedPlus VI', contact: 'Mrs. T. Bello', role: 'Pharmacist', time: '13:00', dist: '2.1', priority: 'med', status: 'pending', address: 'Adeola Odeku' },
    { id: 204, day: 'wed', name: 'Lakeshore (follow-up)', contact: 'Dr. T. Adebayo', role: 'Internal Med', time: '15:00', dist: '1.2', priority: 'med', status: 'pending', address: 'Plot 14, Adeola Odeku' },
    // Thursday May 15
    { id: 301, day: 'thu', name: 'First Cardiology Consultants', contact: 'Dr. O. Bandele', role: 'Cardiology', time: '09:30', dist: '7.1', priority: 'high', status: 'pending', address: 'Ikoyi' },
    { id: 302, day: 'thu', name: 'HealthPlus Lekki', contact: 'Mr. Adamu', role: 'Pharmacist', time: '11:00', dist: '5.4', priority: 'med', status: 'pending', address: 'Lekki Phase 1' },
    { id: 303, day: 'thu', name: 'Eko Hospital', contact: 'Dr. N. Olaniyan', role: 'Paediatrics', time: '13:30', dist: '8.2', priority: 'high', status: 'pending', address: 'Ikeja' },
    // Friday May 16
    { id: 401, day: 'fri', name: 'Lagos Island Maternity', contact: 'Dr. R. Adesanya', role: 'OB/GYN', time: '10:00', dist: '6.7', priority: 'med', status: 'pending', address: 'Lagos Island' },
    { id: 402, day: 'fri', name: 'MedPlus Lekki', contact: 'Mrs. F. Okoli', role: 'Pharmacist', time: '12:00', dist: '5.4', priority: 'med', status: 'pending', address: 'Lekki Phase 1' },
    { id: 403, day: 'fri', name: 'Weekly Wrap (Internal)', contact: 'Funmi Adeola (ASM)', role: '1:1', time: '15:00', dist: '0.5', priority: 'low', status: 'pending', address: 'Lekki Hub' },
  ]);

  const [weekItinerary, setWeekItinerary] = useState({
    weekId: weekId(0),
    weekLabel: weekLabel(0),
    status: 'approved' as 'draft' | 'submitted' | 'approved' | 'rejected',
    submittedAt: 'Friday 9 May, 17:42',
    approvedBy: 'Tunde Bakare (RSM)',
    approvedAt: 'Sunday 21 June, 19:30',
    rsmNote: 'Solid plan. Push for Lakeshore institutional close. Lagoon Hospital re-engagement is a priority.',
    adjustmentsUsedToday: 0,
    adjustmentsLimit: 3,
    escalationStatus: null as 'escalated' | 'imminent' | null,
  });

  const [nextWeekVisits, setNextWeekVisits] = useState<RepVisit[]>([]);
  const [nextWeekItinerary, setNextWeekItinerary] = useState({
    weekId: weekId(1),
    weekLabel: weekLabel(1),
    status: 'draft' as 'draft' | 'submitted' | 'approved' | 'rejected',
    submittedAt: '',
    approvedBy: 'Tunde Bakare (RSM)',
    approvedAt: '',
    rsmNote: '',
    adjustmentsUsedToday: 0,
    adjustmentsLimit: 3,
    escalationStatus: null as 'escalated' | 'imminent' | null,
  });

  const [itinerariesPending, setItinerariesPending] = useState<ItineraryPending[]>([
    { id: 'it-1', rep: 'Chinedu Eze', area: 'Ikeja Cluster', week: weekRangeShort(1), visits: 32, submittedAt: 'Today 14:20', focus: 'Coflin push · Institutional', highlights: '5 A-tier targets · 2 new HCPs', escalationStatus: 'escalated' },
    { id: 'it-2', rep: 'Tope Adeola', area: 'Lekki Phase 1', week: weekRangeShort(1), visits: 36, submittedAt: 'Today 13:45', focus: 'Antibiotics · Q2 close', highlights: 'Tope is 91% to target', escalationStatus: 'imminent' },
    { id: 'it-3', rep: 'Bayo Salami', area: 'Lekki Phase 2', week: weekRangeShort(1), visits: 28, submittedAt: 'Today 11:10', focus: 'Mixed portfolio', highlights: 'Needs review · 4 fewer visits than W20', escalationStatus: null },
    { id: 'it-4', rep: 'Yetunde Cole', area: 'V.I. West', week: weekRangeShort(1), visits: 24, submittedAt: 'Yesterday 16:50', focus: 'Pharmacy + retail', highlights: 'Coaching needed · low coverage', escalationStatus: 'escalated' },
  ]);

  const [adjustmentsPending, setAdjustmentsPending] = useState<AdjustmentPending[]>([
    { id: 'adj-1', rep: 'Tope Adeola', visit: 'MedPlus Lekki → Eko Atlantic Clinic', type: 'reroute', reason: 'Dr. Singh requested urgent product brief on Astrazon', submittedAt: '10:42', urgent: true, todayUsed: 1, escalationStatus: 'escalated' },
    { id: 'adj-2', rep: 'Bayo Salami', visit: 'Add Vedic Lifecare 15:00', type: 'add', reason: 'Walk-in introduction opportunity from neighbor visit', submittedAt: '11:15', urgent: false, todayUsed: 1, escalationStatus: null },
  ]);

  const [directives, setDirectives] = useState<DirectiveRow[]>([
    { id: 'dir-1', pm: 'Dr. Femi Akande', title: 'Q3 Coflin Focus Initiative', message: 'Effective immediately, all reps to prioritize Coflin Forte 600mg detailing in institutional accounts. Push new pediatric dosing thresholds.', priority: 'high', targetProduct: 'Coflin Forte 600mg', date: 'Today, 10:15 AM', status: 'active', acknowledged: false },
    { id: 'dir-2', pm: 'Dr. Ngozi Eze', title: 'Cardio Portfolio Refresh', message: 'Incorporate new data cards for Astrazon 10mg. Focus on cardiology specialist clinics.', priority: 'normal', targetProduct: 'Astrazon 10mg', date: 'Yesterday', status: 'active', acknowledged: true },
  ]);

  const [accompaniments, setAccompaniments] = useState<AccompanimentRow[]>([
    { id: 'acc-1', pm: 'Dr. Femi Akande', rep: 'Adaeze Okafor', date: 'May 12, 2026', territory: 'Lekki Cluster', visitsShadowed: 4, notes: 'Adaeze handled detailing very professionally. Hospital pharmacist raised questions on Coflin pediatric packaging. Accompaniment complete.', status: 'synced' },
  ]);

  const [promoRequests, setPromoRequests] = useState<PromoRequest[]>([
    { id: 'pr-1', rep: 'Adaeze Okafor', title: 'Coflin Bulk Trade Promo · Q3', product: 'Coflin Forte 600mg', channel: 'trade', scope: '12 Lagos distributors · 6 weeks', estimatedReach: 240, budget: 1_800_000, rationale: 'Augmentin counter-detail · Lagos trade distributors signaling demand swing if we run a 12% incentive band.', date: 'May 13, 2026', status: 'pending' },
    { id: 'pr-2', rep: 'Tope Adeola', title: 'Tuxil-N Retail Sampling · SW', product: 'Tuxil-N Syrup 100ml', channel: 'mobile-frontline', scope: '8 community pharmacies', estimatedReach: 90, budget: 420_000, rationale: 'OTC pull-through ahead of cough season. Sampling + posters.', date: 'May 12, 2026', status: 'pm-approved' },
    { id: 'pr-3', rep: 'Chinedu Eze', title: 'Astrazon Hospital Bundle', product: 'Astrazon 10mg', channel: 'institution', scope: '4 teaching hospitals', estimatedReach: 60, budget: 2_400_000, rationale: 'Co-prescription with Coflin for paediatric ENT clinics.', date: 'May 10, 2026', status: 'launched' },
  ]);

  const [jointCalls, setJointCalls] = useState<JointCall[]>([
    { id: 'jc-1', rep: 'Adaeze Okafor', pm: 'Dr. Femi Akande', division: 'South', region: 'SW', territory: 'Lekki / V.I.', customer: 'Lakeshore Specialist Hospital', product: 'Coflin Forte 600mg', scheduledFor: 'May 22, 2026 · 10:00', rationale: 'Coflin uptake below target in Apapa zone · observe paediatric detailing.', status: 'scheduled' },
    { id: 'jc-2', rep: 'Tope Adeola', pm: 'Dr. Femi Akande', division: 'South', region: 'SW', territory: 'Surulere', customer: 'HealthPlus Surulere', product: 'Tuxil-N Syrup 100ml', scheduledFor: 'May 27, 2026 · 14:30', rationale: 'Tuxil OTC conversion lagging at retail outlets.', status: 'scheduled' },
  ]);

  const [customerInventory, setCustomerInventory] = useState<CustomerInventoryItem[]>([
    { id: 'inv-1', customer: 'Lakeshore Specialist Hospital', product: 'Coflin Forte 600mg', stockOnHand: 12, restockLevel: 50, lastAudited: 'May 12, 2026', status: 'Low Stock', recommendation: 'Push 40 cartons of Coflin Forte.' },
    { id: 'inv-2', customer: 'Lakeshore Specialist Hospital', product: 'Astrazon 10mg', stockOnHand: 5, restockLevel: 15, lastAudited: 'May 12, 2026', status: 'Low Stock', recommendation: 'Push 10 packs of Astrazon 10mg.' },
    { id: 'inv-3', customer: 'Reddington Hospital', product: 'Coflin Forte 600mg', stockOnHand: 65, restockLevel: 40, lastAudited: 'May 12, 2026', status: 'Optimal', recommendation: 'None' },
    { id: 'inv-4', customer: 'St. Nicholas Hospital', product: 'Tuxil-N Syrup 100ml', stockOnHand: 8, restockLevel: 30, lastAudited: 'May 12, 2026', status: 'Low Stock', recommendation: 'Push 25 bottles of Tuxil-N Syrup.' },
    { id: 'inv-5', customer: 'HealthPlus Ikoyi', product: 'Coflin Forte 600mg', stockOnHand: 42, restockLevel: 25, lastAudited: 'May 11, 2026', status: 'Optimal', recommendation: 'None' },
  ]);

  const repStats = useMemo(() => {
    const todayVisits = repVisits.filter(v => v.day === 'tue');
    const completed = todayVisits.filter(v => v.status === 'done').length;
    const planned = todayVisits.length;
    const remaining = Math.max(0, planned - completed);
    return {
      completed,
      planned,
      remaining,
      completionPct: planned > 0 ? Math.round((completed / planned) * 100) : 0,
      ordersCount: 3,
      ordersValue: '438k',
    };
  }, [repVisits]);

  // HCPs met today = people logged across today's visit logs (at least the named
  // HCP per log). Drives the "HCPs Met" progress on My Day.
  const hcpsMetToday = useMemo(() => {
    const today = new Date().toDateString();
    const me = user?.email || 'rep';
    return visitLogs
      .filter(v => v.repId === me && new Date(v.timestamp).toDateString() === today)
      .reduce((s, v) => s + Math.max(1, v.attendees.doctors + v.attendees.pharmacists + v.attendees.nurses + v.attendees.others), 0);
  }, [visitLogs, user]);

  const [approvals, setApprovals] = useState<ApprovalItem[]>([
    { id: 'apr-1', type: 'discount', rep: 'Yetunde Cole', detail: '18% on Lakeshore Specialist order', amount: '₦438,000', time: '2 min ago', urgent: true, nsmChannel: 'Institution' },
    { id: 'apr-2', type: 'visit-summary', rep: 'Chinedu Eze', detail: 'Respiratory CM · 25 attendees · Reddington', amount: '₦650,000', time: '12 min ago', nsmChannel: 'Institution' },
    { id: 'apr-3', type: 'discount', rep: 'Tope Adeola', detail: '16% on HealthPlus Surulere', amount: '₦210,000', time: '45 min ago', nsmChannel: 'Trade' },
    { id: 'apr-trade-1', type: 'order', rep: 'Babatunde Owolabi', detail: '12% Q3 bulk scheme · 12 Lagos distributors', amount: '₦4,800,000', time: '8 min ago', urgent: true, customer: 'WestEnd Distributors Ltd', discountPct: '12%', nsmChannel: 'Trade' },
  ]);

  const [orders, setOrders] = useState<OrderRow[]>([
    { id: 'FDS-0428', rep: 'Adaeze O.', cust: 'Lakeshore Specialist Hospital', value: '₦438,000', disc: '18%', status: 'pending', flag: true, channel: 'booklet' },
    { id: 'FDS-0427', rep: 'Chinedu E.', cust: 'Reddington Hospital', value: '₦650,000', disc: '12%', status: 'approved', channel: 'erp' },
    { id: 'FDS-0426', rep: 'Tope A.', cust: 'HealthPlus Surulere', value: '₦210,000', disc: '16%', status: 'pending', flag: true, channel: 'booklet' },
    { id: 'FDS-0425', rep: 'Kola A.', cust: 'MedPlus Apapa', value: '₦185,000', disc: '10%', status: 'approved', channel: 'erp' },
    { id: 'FDS-0424', rep: 'Adaeze O.', cust: 'St. Nicholas Hospital', value: '₦298,000', disc: '14%', status: 'synced', channel: 'erp' },
    { id: 'FDS-0423', rep: 'Tope A.', cust: 'Lagoon Hospital VI', value: '₦890,000', disc: '15%', status: 'synced', channel: 'erp' },
    { id: 'FDS-0422', rep: 'Joseph N.', cust: 'EHA Clinic', value: '₦125,000', disc: '8%', status: 'synced', channel: 'erp' },
  ]);

  const [clinicalMeetings, setClinicalMeetings] = useState<ClinicalMeetingRow[]>([
    {
      id: 'cm-1', rep: 'Adaeze O.', t: 'Respiratory Care CM', hcp: 'Lakeshore Specialist', date: 'May 22, 2026', attendees: 25, budget: '₦450k', s: 'pm-review', hi: false,
      materials: [
        { id: 'cm1-1', kind: 'venue', label: 'Conference room · 3 hours', amount: 120_000 },
        { id: 'cm1-2', kind: 'refreshments', label: 'Lunch + coffee for 25', amount: 180_000 },
        { id: 'cm1-3', kind: 'print', label: 'Coflin Paediatric Detail Aid · 25 sets', amount: 60_000 },
        { id: 'cm1-4', kind: 'samples', label: 'Coflin 600mg blister samples', amount: 90_000 },
      ],
      content: [
        { id: 'cm1-c1', kind: 'slides', name: 'Respiratory Care · Coflin Forte PPT', size: '4.2 MB · 28 slides' },
        { id: 'cm1-c2', kind: 'detail-aid', name: 'Coflin Paediatric Dosing Guide v2.1', size: 'PDF · 4 pages' },
        { id: 'cm1-c3', kind: 'agenda', name: 'Meeting Agenda · 3 sessions', size: 'PDF · 1 page' },
      ],
    },
    {
      id: 'cm-2', rep: 'Chinedu E.', t: 'Antibiotic Stewardship Workshop', hcp: 'Reddington Hospital', date: 'May 28, 2026', attendees: 40, budget: '₦820k', s: 'hom-review', hi: true,
      materials: [
        { id: 'cm2-1', kind: 'venue', label: 'Auditorium · half-day', amount: 220_000 },
        { id: 'cm2-2', kind: 'refreshments', label: 'Catering for 40', amount: 280_000 },
        { id: 'cm2-3', kind: 'speaker', label: 'Honorarium · Dr. Akin (key opinion leader)', amount: 200_000 },
        { id: 'cm2-4', kind: 'print', label: 'Astrazon + Coflin co-detail packs', amount: 120_000 },
      ],
      content: [
        { id: 'cm2-c1', kind: 'slides', name: 'Antibiotic Stewardship Master Deck', size: '8.6 MB · 52 slides' },
        { id: 'cm2-c2', kind: 'video', name: 'Case-study walkthrough', size: '12 min · MP4' },
        { id: 'cm2-c3', kind: 'pdf', name: 'WHO AMR briefing', size: 'PDF · 12 pages' },
      ],
    },
    {
      id: 'cm-3', rep: 'Tope A.', t: 'Paediatric Dosing Webinar', hcp: 'Multi-hospital', date: 'Jun 5, 2026', attendees: 65, budget: '₦1.2M', s: 'hom-review', hi: true,
      materials: [
        { id: 'cm3-1', kind: 'venue', label: 'Zoom Webinar pro · 2 hours', amount: 60_000 },
        { id: 'cm3-2', kind: 'speaker', label: 'KOL panel × 3', amount: 700_000 },
        { id: 'cm3-3', kind: 'print', label: 'Mail-out detail packs · 65 reps', amount: 240_000 },
        { id: 'cm3-4', kind: 'other', label: 'Recording & post-prod', amount: 200_000 },
      ],
      content: [
        { id: 'cm3-c1', kind: 'slides', name: 'Paediatric Dosing Masterclass', size: '10.4 MB · 64 slides' },
        { id: 'cm3-c2', kind: 'agenda', name: 'Webinar run-of-show', size: 'PDF · 2 pages' },
      ],
    },
    {
      id: 'cm-4', rep: 'Kola A.', t: 'New Product Launch Brief', hcp: 'MedPlus Apapa', date: 'May 18, 2026', attendees: 12, budget: '₦180k', s: 'approved', hi: false,
      materials: [
        { id: 'cm4-1', kind: 'refreshments', label: 'Brunch for 12', amount: 80_000 },
        { id: 'cm4-2', kind: 'print', label: 'Launch brochure', amount: 50_000 },
        { id: 'cm4-3', kind: 'samples', label: 'New SKU samples', amount: 50_000 },
      ],
      content: [
        { id: 'cm4-c1', kind: 'slides', name: 'Launch Brief · MedPlus edition', size: '2.1 MB · 18 slides' },
      ],
      outcomeNotes: '12 attended · Coflin uptake commitment from MedPlus pharmacy lead · 8 orders attributed in 30 days.',
    },
    {
      id: 'cm-5', rep: 'Adaeze O.', t: 'Mucolytic Use Cases', hcp: 'St. Nicholas', date: 'May 14, 2026', attendees: 18, budget: '₦220k', s: 'approved', hi: false,
      materials: [
        { id: 'cm5-1', kind: 'venue', label: 'Hospital boardroom', amount: 60_000 },
        { id: 'cm5-2', kind: 'refreshments', label: 'Tea + biscuits', amount: 30_000 },
        { id: 'cm5-3', kind: 'print', label: 'Mucolytic clinical pack', amount: 70_000 },
        { id: 'cm5-4', kind: 'samples', label: 'Coflin samples', amount: 60_000 },
      ],
      content: [
        { id: 'cm5-c1', kind: 'slides', name: 'Mucolytic Clinical Cases', size: '3.4 MB · 24 slides' },
        { id: 'cm5-c2', kind: 'detail-aid', name: 'Coflin Detail Aid v2.0', size: 'PDF · 6 pages' },
      ],
      outcomeNotes: '18 attended · 4 new prescribers · ₦680k attributed orders in 30 days.',
    },
  ]);

  const [contentApprovals, setContentApprovals] = useState<ContentApprovalRow[]>([
    { id: 'ca-1', pm: 'Dr. Femi Akande', material: 'Coflin Paediatric Dosing Guide v2.1', cat: 'Clinical', format: 'PDF · 4 pages', target: '89 Med Reps', budget: ' · ', submitted: '2 hours ago', status: 'pending', urgent: false, note: 'Updated to include new WHO paediatric dosing thresholds. Cleared by Medical Affairs.' },
    { id: 'ca-2', pm: 'Dr. Femi Akande', material: 'Augmentin Counter-Detail Brief', cat: 'Competitive', format: 'PDF · 6 pages', target: '142 reps (all channels)', budget: ' · ', submitted: '45 min ago', status: 'pending', urgent: true, note: 'In response to GSK 15% Augmentin promo detected in 5 regions. Time-sensitive.' },
    { id: 'ca-3', pm: 'Dr. Ngozi Eze', material: 'Cardio Q3 Detailing Deck v1.0', cat: 'Detailing', format: 'PPT · 28 slides', target: 'Cardio reps · 32 reps', budget: '₦680k production', submitted: 'Yesterday', status: 'pending', urgent: false, note: 'Q3 launch deck for the cardio portfolio refresh.' },
    { id: 'ca-4', pm: 'Dr. Femi Akande', material: 'Coflin Forte Q2 Brochure', cat: 'Marketing', format: 'PDF · 8 pages', target: 'Institutional accounts', budget: '₦420k print', submitted: '3 days ago', status: 'approved', urgent: false },
  ]);

  // ===== TOAST HELPERS =====
  const addToast = (toast: ToastInput) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, dismissing: true } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, 4000);
  };

  const dismissToast = (id: number) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, dismissing: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
  };

  // ===== REP HANDLERS =====
  const handleStartVisit = (visit: RepVisit) => {
    setActiveVisit({
      id: visit.id,
      name: visit.name,
      contact: visit.contact,
      address: visit.address,
      role: visit.role,
      plannedProducts: visit.plannedProducts ?? [],
    });
    setRepVisits(prev => prev.map(v =>
      v.id === visit.id ? { ...v, status: 'next' } : (v.status === 'next' && v.id !== visit.id ? { ...v, status: 'pending' } : v)
    ));
    setView('rep-visit');
    addToast({ type: 'info', title: `Starting visit ${visit.id}`, msg: `${visit.name} · GPS tracking` });
  };

  const handleCheckIn = (_visitId: string | number) => {
    addToast({ type: 'success', title: 'Checked in', msg: 'GPS verified · Time-stamped' });
  };

  const handleCompleteVisit = (visitId: string | number) => {
    setRepVisits(prev => prev.map(v => v.id === visitId ? { ...v, status: 'done' } : v));
    setActiveVisit(null);
    setView('rep-plan');
    addToast({ type: 'success', title: 'Visit complete', msg: 'DCR auto-generated · Synced to CRM' });
  };

  const handleLogVisit = (log: VisitLog) => {
    setVisitLogs(prev => [log, ...prev]);
    addToast({
      type: 'success',
      title: 'Visit logged',
      msg: `${log.hcpName} · ${log.institution} · ${log.productsDiscussed.length} product(s) detailed`,
    });
  };

  // ===== PIPELINE / LEAD HANDLERS (scripted) =====
  const handleEnrichLead = (id: string) => {
    const lead = leads.find(l => l.id === id);
    setLeads(prev => prev.map(l => l.id === id ? {
      ...l, stage: 'enriched', enriched: true, completeness: 90,
      dedupeNote: l.dedupeNote ?? 'New record · no duplicate found',
      timeline: [{ date: 'Just now', title: 'Enriched', detail: 'Linked to the account and territory; profile completed from Fidson data; checked for duplicates' }, ...l.timeline],
    } : l));
    addToast({ type: 'success', title: 'Lead enriched', msg: lead ? `Linked to ${lead.org} · ${lead.territory} · deduped · profile 90%` : 'Profile completed and deduped' });
  };

  const handleConsentLead = (id: string) => {
    const lead = leads.find(l => l.id === id);
    setLeads(prev => prev.map(l => l.id === id ? {
      ...l, stage: 'consented', consent: true, consentDate: 'Just now', completeness: Math.max(l.completeness, 95),
      timeline: [{ date: 'Just now', title: 'Consent recorded', detail: 'Opted in to product and pricing information; lawful basis and scope stamped for NDPA' }, ...l.timeline],
    } : l));
    addToast({ type: 'success', title: 'Consent recorded', msg: lead ? `${lead.name} opted in · lawful basis logged for outreach` : 'Lawful basis captured for outreach' });
  };

  const handleSendLead = (id: string) => {
    const lead = leads.find(l => l.id === id);
    setLeads(prev => prev.map(l => l.id === id ? {
      ...l, stage: 'nurturing',
      timeline: [{ date: 'Just now', title: 'Information sent', detail: 'Product information pack emailed via M365 / Outlook; unsubscribe honoured' }, ...l.timeline],
    } : l));
    addToast({ type: 'success', title: 'Information sent', msg: lead ? `Product pack emailed to ${lead.name} via Outlook` : 'Outreach logged to the lead timeline' });
  };

  const leadToAccount = (l: Lead): Account => ({
    id: `conv-${l.id}`,
    name: l.channel === 'HCP' ? l.name : l.org,
    channel: l.channel,
    tier: 'B',
    territory: l.territory,
    address: l.org,
    phone: l.phone ?? ' · ',
    email: l.email ?? ' · ',
    lastVisitDays: 0,
    lifetimeValue: 'New',
    openCommitments: 0,
    people: [{ name: l.name, role: l.role }],
    timeline: [
      { kind: 'visit', date: 'Today', title: 'Converted from pipeline', detail: `${l.name} · ${l.role}` },
      { kind: 'commitment', date: 'Earlier', title: 'Consent on record', detail: 'Opted in to product information' },
    ],
  });

  const handleConvertLead = (id: string) => {
    const lead = leads.find(l => l.id === id);
    if (!lead) return;
    setLeads(prev => prev.map(l => l.id === id ? {
      ...l, stage: 'customer',
      timeline: [{ date: 'Just now', title: 'Converted to customer', detail: 'Now an active account in My Customers' }, ...l.timeline],
    } : l));
    setConvertedCustomers(prev => [leadToAccount(lead), ...prev]);
    addToast({ type: 'success', title: 'Converted to customer', msg: `${lead.name} is now in My Customers` });
  };

  const handleAddLead = (lead: Lead) => {
    setLeads(prev => [lead, ...prev]);
    addToast({ type: 'success', title: 'Added to pipeline', msg: `${lead.name} · ${lead.role}` });
  };

  const handleSubmitDCR = () => {
    const today = new Date().toDateString();
    const todaysLogs = visitLogs.filter(l => new Date(l.timestamp).toDateString() === today);
    // Whatever Adaeze logged live shows as-is; auto-fill the rest of today's plan so the
    // report always reads as a full end-of-day DCR ("this is what her day looks like").
    const loggedInstitutions = new Set(todaysLogs.map(l => l.institution));
    const fillerLogs: VisitLog[] = repVisits
      .filter(v => v.day === 'tue' && !loggedInstitutions.has(v.name))
      .map(v => {
        const [h, m] = (v.time || '12:00').split(':').map(Number);
        const pharm = (v.role || '').toLowerCase().includes('pharmac');
        return {
          id: `fill-${v.id}`, repId: 'adaeze', repName: 'Adaeze Okafor', timestamp: atToday(h, m),
          activeVisitId: v.id, hcpType: pharm ? 'Pharmacist' : 'Doctor', hcpName: v.contact ?? 'HCP',
          institution: v.name, specialty: v.role ?? '',
          location: { latitude: 6.43, longitude: 3.42, isManual: false },
          productsDiscussed: v.plannedProducts ?? ['Coflin Forte 600mg'],
          attendees: { doctors: pharm ? 0 : 1, pharmacists: pharm ? 1 : 0, nurses: 0, others: 0 },
          summary: 'Detailed call completed; product focus delivered.', nextSteps: 'Follow up next cycle.',
        };
      });
    const fullLogs = [...todaysLogs, ...fillerLogs].sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp));
    const dcr: SubmittedDCR = {
      id: `dcr-${Date.now()}`,
      rep: 'Adaeze Okafor',
      submittedAt: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      visitsCompleted: fullLogs.length,
      ordersToday: orders.filter(o => o.rep === 'Adaeze O.').length,
      logs: fullLogs,
      samples: fullLogs.length * 6,
      aiSummary: `Full day across ${fullLogs.length} calls in the V.I.–Lekki corridor with strong Coflin focus · ${todaysLogs.length} detailed live, the rest auto-compiled from her plan. Tracking 87% target attainment for the day.`,
    };
    setDcrs(prev => [dcr, ...prev]);
    addToast({ type: 'success', title: 'DCR submitted to RSM', msg: `Tunde Bakare (RSM) will see your ${fullLogs.length}-visit report` });
  };

  const handlePlaceOrder = (visit: RepActiveVisit) => {
    setActiveVisit(visit);
    setView('rep-order');
  };

  const handleRequestCMFromVisit = (hcp: string) => {
    setCmPrefillHcp(hcp);
    setView('rep-clinical');
  };

  const handleSubmitOrder = (orderData: RepOrderSubmission) => {
    const orderId = `FDS-${Math.floor(Math.random() * 9000) + 1000}`;
    const isZeroDiscount = orderData.discount === 0;
    const newOrder: OrderRow = {
      id: orderId,
      rep: 'Adaeze O.',
      cust: orderData.visit?.name || 'Unknown',
      value: `₦${orderData.total.toLocaleString()}`,
      disc: `${orderData.discount}%`,
      status: isZeroDiscount
        ? 'sent-to-sales-admin'
        : (orderData.requiresApproval ? 'pending' : 'approved'),
      flag: orderData.requiresApproval,
      channel: orderData.channel,
      lpoAttached: !!orderData.lpoFileName,
      lpoFileName: orderData.lpoFileName,
    };
    setOrders(prev => [newOrder, ...prev]);

    if (orderData.requiresApproval) {
      const newApproval: ApprovalModalItem = {
        id: `apr-${Date.now()}`,
        orderId,
        type: 'discount',
        rep: 'Adaeze Okafor',
        detail: `${orderData.discount}% on ${orderData.visit?.name || 'order'}`,
        amount: `₦${orderData.total.toLocaleString()}`,
        requestedDiscount: `${orderData.discount}%`,
        urgent: orderData.discount > 17,
        time: 'just now',
        items: orderData.items.filter(i => i.q > 0).map(i => ({ n: i.n, q: i.q, p: `₦${(i.q * i.p).toLocaleString()}` })),
      };
      setApprovals(prev => [newApproval, ...prev]);
      addToast({ type: 'info', title: 'Order submitted for approval', msg: `Tunde Bakare (RSM) will review · ${orderData.discount}% discount` });
    } else if (isZeroDiscount) {
      addToast({ type: 'success', title: 'Sent to Sales Admin', msg: `No discount · ₦${orderData.total.toLocaleString()} queued for SOA processing` });
    } else {
      addToast({ type: 'success', title: 'Order placed', msg: `Auto-approved · ₦${orderData.total.toLocaleString()} synced to SOA` });
    }
  };

  const handleSubmitCM = (form: CMForm) => {
    const newCM: ClinicalMeetingRow = {
      id: `cm-${Date.now()}`,
      rep: 'Adaeze O.',
      t: form.topic,
      hcp: form.hcp,
      date: form.date,
      attendees: parseInt(form.attendees, 10) || 0,
      budget: `₦${form.budget || '0'}`,
      s: form.highImpact ? 'hom-review' : 'pm-review',
      hi: form.highImpact,
    };
    setClinicalMeetings(prev => [newCM, ...prev]);

    const newApproval: ApprovalModalItem = {
      id: `apr-${Date.now()}`,
      orderId: newCM.id,
      type: 'visit-summary',
      rep: 'Adaeze Okafor',
      detail: `${form.topic} · ${form.attendees} attendees · ${form.hcp}`,
      amount: `₦${form.budget || '0'}`,
      urgent: false,
      time: 'just now',
    };
    setApprovals(prev => [newApproval, ...prev]);

    addToast({
      type: 'info',
      title: 'CM request submitted',
      msg: form.highImpact ? 'Routed to PM and HoM' : 'Routed to Product Manager',
    });
  };

  const handleAddPlannedVisit = (visit: RepVisit) => {
    setNextWeekVisits(prev => [...prev, visit]);
  };

  const handleRemovePlannedVisit = (id: number | string) => {
    setNextWeekVisits(prev => prev.filter(v => v.id !== id));
  };

  const handleApplyOptimizedRoute = (day: string, optimized: RepVisit[]) => {
    setNextWeekVisits(prev => [...prev.filter(v => v.day !== day), ...optimized]);
  };

  const handleSubmitItinerary = () => {
    if (nextWeekVisits.length === 0) {
      addToast({ type: 'error', title: 'Nothing to submit', msg: 'Add at least one visit before sending to RSM' });
      return;
    }
    const submittedAt = 'Just now';
    setNextWeekItinerary(prev => ({ ...prev, status: 'submitted', submittedAt }));
    const newPending: ItineraryPending = {
      id: `it-${Date.now()}`,
      rep: 'Adaeze Okafor',
      area: 'V.I. / Lekki',
      week: nextWeekItinerary.weekLabel,
      visits: nextWeekVisits.length,
      plannedVisits: nextWeekVisits,
      submittedAt,
      focus: 'Mixed portfolio',
      highlights: `${nextWeekVisits.length} stops planned across the week`,
      escalationStatus: null,
    };
    setItinerariesPending(prev => [newPending, ...prev]);
    addToast({ type: 'success', title: `${nextWeekItinerary.weekLabel} submitted`, msg: `Tunde Bakare (RSM) will review your ${nextWeekVisits.length}-visit plan` });
  };

  const handleRequestAdjustment = (req: AdjustmentRequest) => {
    if (repAdjustments.length >= weekItinerary.adjustmentsLimit) {
      addToast({ type: 'error', title: 'Daily cap reached', msg: `You've used all ${weekItinerary.adjustmentsLimit} adjustments today` });
      return;
    }
    const id = `adj-${Date.now()}`;

    // A swap names a replacement call point; build the visit that will take the
    // original's place if the RSM approves.
    const replacementVisit: RepVisit | undefined = req.type === 'swap' && req.visit && req.replacement
      ? {
          id: `swap-${id}`,
          name: req.replacement.name,
          contact: undefined,
          time: req.replacement.time || req.visit.time,
          day: req.visit.day,
          dist: req.visit.dist,
          priority: req.visit.priority,
          status: 'pending',
          address: req.replacement.area,
          plannedProducts: req.visit.plannedProducts,
        }
      : undefined;

    const label = replacementVisit
      ? `${req.visit!.name} → ${replacementVisit.name}`
      : req.visit ? req.visit.name : 'New visit add';

    const newAdj: AdjustmentPending = {
      id,
      rep: 'Adaeze Okafor',
      visit: replacementVisit
        ? `${req.visit!.name} → ${replacementVisit.name} (${replacementVisit.time})`
        : req.visit ? `${req.visit.name} (${req.visit.time})` : 'New visit add',
      type: req.type,
      reason: req.reason,
      submittedAt: 'just now',
      urgent: false,
      todayUsed: repAdjustments.length + 1,
    };
    setAdjustmentsPending(prev => [newAdj, ...prev]);

    // Mirror it onto the rep's own cap as a pending record...
    setRepAdjustments(prev => [...prev, { id, label, type: req.type, status: 'pending', visitId: req.visit?.id ?? null, replacement: replacementVisit }]);
    // ...and flag the affected visit so the rep's itinerary shows it in-flight.
    if (req.visit) {
      setRepVisits(prev => prev.map(v => v.id === req.visit!.id ? { ...v, adjustmentStatus: 'pending' } : v));
    }
    setWeekItinerary(prev => ({ ...prev, adjustmentsUsedToday: prev.adjustmentsUsedToday + 1 }));
    addToast({
      type: 'info',
      title: 'Adjustment submitted',
      msg: `Tunde Bakare (RSM) notified · ${weekItinerary.adjustmentsLimit - repAdjustments.length - 1} left today`,
    });
  };

  // ===== RSM SIGNOFF HANDLERS =====
  const handleApproveItinerary = (id: string) => {
    const it = itinerariesPending.find(x => x.id === id);
    if (!it) return;
    setItinerariesPending(prev => prev.map(x => x.id === id ? { ...x, dismissing: true } : x));
    setTimeout(() => setItinerariesPending(prev => prev.filter(x => x.id !== id)), 400);
    addToast({ type: 'success', title: `${it.rep}'s itinerary approved`, msg: `${it.week} · ${it.rep} notified · GPS gate unlocked` });
  };

  const handleRejectItinerary = (id: string) => {
    const it = itinerariesPending.find(x => x.id === id);
    if (!it) return;
    setItinerariesPending(prev => prev.map(x => x.id === id ? { ...x, dismissing: true } : x));
    setTimeout(() => setItinerariesPending(prev => prev.filter(x => x.id !== id)), 400);
    addToast({ type: 'error', title: 'Itinerary sent back', msg: `${it.rep} notified · Needs rework before Monday` });
  };

  const handleApproveAdjustment = (id: string) => {
    const adj = adjustmentsPending.find(x => x.id === id);
    if (!adj) return;
    setAdjustmentsPending(prev => prev.map(x => x.id === id ? { ...x, dismissing: true } : x));
    setTimeout(() => setAdjustmentsPending(prev => prev.filter(x => x.id !== id)), 400);
    // Round-trip the decision back to the rep: mark the cap record approved and
    // reflect it on the affected visit in the rep's itinerary.
    const radj = repAdjustments.find(a => a.id === id);
    setRepAdjustments(prev => prev.map(a => a.id === id ? { ...a, status: 'approved' } : a));
    if (radj?.visitId != null) {
      setRepVisits(prev => prev.map(v => {
        if (v.id !== radj.visitId) return v;
        // Swap: drop the original stop and slot in the replacement call point.
        if (radj.replacement) return { ...radj.replacement, adjustmentStatus: 'approved' };
        // Non-swap approval: just mark the original.
        return { ...v, adjustmentStatus: 'approved' };
      }));
    }
    addToast({ type: 'success', title: 'Adjustment approved', msg: `${adj.rep} · Route updated · GPS synced` });
  };

  const handleRejectAdjustment = (id: string) => {
    const adj = adjustmentsPending.find(x => x.id === id);
    if (!adj) return;
    setAdjustmentsPending(prev => prev.map(x => x.id === id ? { ...x, dismissing: true } : x));
    setTimeout(() => setAdjustmentsPending(prev => prev.filter(x => x.id !== id)), 400);
    // Round-trip the rejection: the rep's cap slot flips to "Rejected · <visit>".
    const radj = repAdjustments.find(a => a.id === id);
    setRepAdjustments(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' } : a));
    if (radj?.visitId != null) {
      setRepVisits(prev => prev.map(v => v.id === radj.visitId ? { ...v, adjustmentStatus: 'rejected' } : v));
    }
    addToast({ type: 'info', title: 'Adjustment denied', msg: `${adj.rep} · Stay on planned route` });
  };

  // ===== APPROVAL ACTIONS =====
  const approveItem = (id: string) => {
    const item = approvals.find(a => a.id === id) as ApprovalModalItem | undefined;
    if (!item) return;

    setApprovals(prev => prev.map(a => a.id === id ? { ...a, dismissing: true } : a));
    setTimeout(() => {
      setApprovals(prev => prev.filter(a => a.id !== id));

      if (item.orderId && item.type === 'discount') {
        setOrders(prev => prev.map(o => o.id === item.orderId ? { ...o, status: 'approved', flag: false } : o));
      }
      if (item.type === 'visit-summary' && item.orderId) {
        setClinicalMeetings(prev => prev.map(cm => cm.id === item.orderId ? { ...cm, s: 'approved' } : cm));
      }

      addToast({
        type: 'success',
        title: `${item.type === 'discount' ? 'Discount' : 'Clinical meeting'} approved`,
        msg: `${item.rep} has been notified · ${item.amount}`,
      });
    }, 400);
  };

  const handleEscalateToNSM = (id: string) => {
    const item = approvals.find(a => a.id === id) as ApprovalModalItem | undefined;
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, escalatedToNSM: true } as ApprovalModalItem : a));
    addToast({ type: 'info', title: 'Escalated to NSM', msg: `${item?.rep ?? 'Item'} · ${item?.amount ?? ''} routed to national tier` });
  };

  const rejectItem = (id: string, _reason?: string) => {
    const item = approvals.find(a => a.id === id);
    if (!item) return;

    setApprovals(prev => prev.map(a => a.id === id ? { ...a, dismissing: true } : a));
    setTimeout(() => {
      setApprovals(prev => prev.filter(a => a.id !== id));
      addToast({ type: 'error', title: 'Request rejected', msg: `${item.rep} notified with reason` });
    }, 400);
  };

  const approveCM = (id: string) => {
    const cm = clinicalMeetings.find(c => c.id === id);
    if (!cm) return;
    setClinicalMeetings(prev => prev.map(c => c.id === id ? { ...c, s: 'approved' } : c));
    setApprovals(prev => prev.filter(a => (a as ApprovalModalItem).orderId !== id));
    addToast({ type: 'success', title: 'Clinical meeting approved', msg: `${cm.t} · ${cm.rep} notified` });
  };

  const rejectCM = (id: string) => {
    const cm = clinicalMeetings.find(c => c.id === id);
    if (!cm) return;
    setClinicalMeetings(prev => prev.map(c => c.id === id ? { ...c, dismissing: true } : c));
    setTimeout(() => {
      setClinicalMeetings(prev => prev.filter(c => c.id !== id));
      setApprovals(prev => prev.filter(a => (a as ApprovalModalItem).orderId !== id));
      addToast({ type: 'error', title: 'Clinical meeting rejected', msg: `${cm.rep} has been notified` });
    }, 400);
  };

  const openOrderApproval = (order: OrderRow) => {
    const existing = approvals.find(a => (a as ApprovalModalItem).orderId === order.id) as ApprovalModalItem | undefined;
    if (existing) {
      setApprovalModalItem(existing);
    } else {
      setApprovalModalItem({
        id: `apr-${order.id}`,
        orderId: order.id,
        type: 'discount',
        rep: order.rep,
        detail: `${order.disc} on ${order.cust}`,
        amount: order.value,
        time: '',
        requestedDiscount: order.disc,
      });
    }
  };

  // ===== LOGIN / ROLE SWITCH =====
  const handleLogin = (loginData: SignedInUser) => {
    const defaultRole: PersonaKey = 'manager';
    const persona = PERSONAS[defaultRole];
    setUser({
      ...persona,
      signedInEmail: loginData.signedInEmail || loginData.email,
      currentRole: defaultRole,
    });
    setIsAuthenticated(true);
    setView('dashboard');
    addToast({
      type: 'success',
      title: 'Welcome to FieldForce',
      msg: `Signed in · Viewing as ${persona.name} (${persona.tag}). Use the switcher to change roles.`,
    });
  };

  const handleSwitchRole = (newRoleKey: PersonaKey) => {
    const persona = PERSONAS[newRoleKey];
    if (!persona) return;
    setUser(prev => prev ? {
      ...prev,
      ...persona,
      signedInEmail: prev.signedInEmail || persona.email,
      currentRole: newRoleKey,
    } : null);

    const landingView: Record<PersonaKey, string> = {
      rep: 'rep-day',
      asm: 'asm-area',
      fsm: 'fsm-trade',
      pm: 'pm-portfolio',
      mm: 'mm-marketing',
      dm: 'dm-division',
      nsm: 'nsm-national',
      nsm_inst: 'nsm_inst-dashboard',
      nsm_trade: 'nsm_trade-dashboard',
      hom: 'hom-dashboard',
      bm: 'bm-portfolio',
      bmd: 'bmd-dashboard',
      adc: 'adc-dashboard',
      cd: 'cd-dashboard',
      manager: 'dashboard',
    };
    setView(landingView[newRoleKey]);
    setApprovalModalItem(null);
    setActiveVisit(null);

    const welcome: Record<PersonaKey, string> = {
      rep: 'Field rep view · Ready for the day',
      asm: 'Area Sales Manager · Lekki/V.I. Cluster',
      fsm: 'Field Sales Manager · Trade Channel',
      pm: 'Product Manager · Respiratory Portfolio',
      mm: 'Marketing Manager · Cross-product · National',
      dm: 'Division Manager · South Division',
      nsm: 'National Sales Manager · Fidson Healthcare',
      nsm_inst: 'NSM Institution · 4 regions',
      nsm_trade: 'NSM Trade · 6 FSMs · 38 reps',
      hom: 'Head of Marketing · Institution + Trade',
      bm: 'Brand Manager · Cestra portfolio',
      bmd: 'Brand Management Director · All marketing',
      adc: 'ADC · Trade + Mobile & Frontline',
      cd: 'Commercial Director · National',
      manager: 'Regional Sales Manager · South-West',
    };

    addToast({ type: 'info', title: `Now viewing as ${persona.name}`, msg: welcome[newRoleKey] });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setView('dashboard');
    setApprovalModalItem(null);
    setActiveVisit(null);
  };

  const isRep = user?.roleType === 'rep';
  const isASM = user?.roleType === 'asm';
  const isFSM = user?.roleType === 'fsm';
  const isPM = user?.roleType === 'pm';
  const isMM = user?.roleType === 'mm';
  const isDM = user?.roleType === 'dm';
  const isNSM = user?.roleType === 'nsm';
  const isNSMInst = user?.roleType === 'nsm_inst';
  const isNSMTrade = user?.roleType === 'nsm_trade';
  const isHoM = user?.roleType === 'hom';
  const isBM = user?.roleType === 'bm';
  const isBMD = user?.roleType === 'bmd';
  const isADC = user?.roleType === 'adc';
  const isCD = user?.roleType === 'cd';

  // ===== PM / MM / NSM handlers =====
  const handlePushMaterial = (material: MaterialItem) => {
    addToast({ type: 'success', title: 'Material pushed to reps', msg: `${material.n} · 89 reps notified · Training task triggered` });
  };

  const handleSendDirective = (form: NSMDirectiveFormType) => {
    addToast({ type: 'success', title: 'National directive dispatched', msg: `${form.title} · Broadcast to entire org` });
  };

  const handleApproveContent = (id: string) => {
    const item = contentApprovals.find(c => c.id === id);
    if (!item) return;
    setContentApprovals(prev => prev.map(c => c.id === id ? { ...c, dismissing: true } : c));
    setTimeout(() => {
      setContentApprovals(prev => prev.map(c => c.id === id ? { ...c, status: 'approved', dismissing: false } : c));
    }, 400);
    addToast({ type: 'success', title: 'Content approved', msg: `${item.material} · Auto-distributing to ${item.target}` });
  };

  const handleRejectContent = (id: string) => {
    const item = contentApprovals.find(c => c.id === id);
    if (!item) return;
    setContentApprovals(prev => prev.map(c => c.id === id ? { ...c, dismissing: true } : c));
    setTimeout(() => {
      setContentApprovals(prev => prev.filter(c => c.id !== id));
    }, 400);
    addToast({ type: 'error', title: 'Content rejected', msg: `${item.pm} notified · Sent back for revision` });
  };

  const handleMMApproveCM = (id: string) => {
    const cm = clinicalMeetings.find(c => c.id === id);
    if (!cm) return;
    setClinicalMeetings(prev => prev.map(c => c.id === id ? { ...c, s: 'approved' } : c));
    setApprovals(prev => prev.filter(a => (a as ApprovalModalItem).orderId !== id));
    addToast({ type: 'success', title: 'High-impact CM approved', msg: `${cm.t} · ${cm.rep} notified · Distribution pending` });
  };

  const handlePMApproveCM = (id: string) => {
    const cm = clinicalMeetings.find(c => c.id === id);
    if (!cm) return;
    if (cm.hi) {
      setClinicalMeetings(prev => prev.map(c => c.id === id ? { ...c, s: 'hom-review' } : c));
      addToast({ type: 'info', title: 'CM escalated to HoM', msg: `High-impact · ${cm.t}` });
    } else {
      setClinicalMeetings(prev => prev.map(c => c.id === id ? { ...c, s: 'approved' } : c));
      setApprovals(prev => prev.filter(a => (a as ApprovalModalItem).orderId !== id));
      addToast({ type: 'success', title: 'CM approved by PM', msg: `${cm.t} · ${cm.rep} notified` });
    }
  };

  const handleSyncAudit = (customerName: string, stock: CustomerStockEntry) => {
    setCustomerInventory(prev => {
      const updated = [...prev];
      stock.forEach(row => {
        const productName = row.product.trim();
        if (!productName || row.units.trim() === '') return;
        const qty = parseInt(row.units, 10) || 0;
        const existingIdx = updated.findIndex(i => i.customer === customerName && i.product === productName);
        if (existingIdx > -1) {
          const ex = updated[existingIdx];
          const isLow = qty <= ex.restockLevel;
          updated[existingIdx] = {
            ...ex,
            stockOnHand: qty,
            status: isLow ? 'Low Stock' : 'Optimal',
            lastAudited: 'Today',
            recommendation: isLow ? `Push restock of ${productName}.` : 'None',
          };
        } else {
          const defaultTarget = 30;
          const isLow = qty <= defaultTarget;
          updated.push({
            id: `inv-${Date.now()}-${productName.replace(/\s+/g, '')}`,
            customer: customerName,
            product: productName,
            stockOnHand: qty,
            restockLevel: defaultTarget,
            lastAudited: 'Today',
            status: isLow ? 'Low Stock' : 'Optimal',
            recommendation: isLow ? `Push restock of ${productName}.` : 'None',
          });
        }
      });
      return updated;
    });
    addToast({ type: 'success', title: 'Customer stock synced', msg: `${customerName} stock updated · AI recommendation refreshed.` });
  };

  const handlePushDirective = (form: DirectiveForm) => {
    const kind = form.kind ?? 'directive';
    const newDir: DirectiveRow = {
      id: `dir-${Date.now()}`,
      pm: 'Dr. Femi Akande',
      title: form.title,
      message: form.message,
      priority: form.priority,
      targetProduct: form.targetProduct,
      date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'active',
      acknowledged: false,
      kind,
    };
    setDirectives(prev => [newDir, ...prev]);
    addToast({
      type: 'success',
      title: kind === 'new-product' ? 'New product notification sent' : 'Directive pushed',
      msg: kind === 'new-product'
        ? `${form.targetProduct} broadcast to 89 active field reps as "Update from PM"`
        : 'Directive shared with 89 active field representatives.',
    });
  };

  const handleAcknowledgeDirective = (id: string) => {
    setDirectives(prev => prev.map(d => d.id === id ? { ...d, acknowledged: true } : d));
    addToast({ type: 'success', title: 'Directive Acknowledged', msg: 'Confirmation logged & shared with PM.' });
  };

  const handleApprovePromo = (id: string) => {
    const p = promoRequests.find(x => x.id === id);
    if (!p) return;
    setPromoRequests(prev => prev.map(x => x.id === id ? { ...x, status: 'pm-approved' } : x));
    addToast({ type: 'success', title: 'Promo approved', msg: `${p.title} · ready to launch as a tracked Campaign` });
  };

  const handleRejectPromo = (id: string) => {
    const p = promoRequests.find(x => x.id === id);
    if (!p) return;
    setPromoRequests(prev => prev.map(x => x.id === id ? { ...x, status: 'rejected', dismissing: true } : x));
    setTimeout(() => setPromoRequests(prev => prev.filter(x => x.id !== id)), 400);
    addToast({ type: 'error', title: 'Promo rejected', msg: `${p.rep} notified · ${p.title}` });
  };

  const handleLaunchPromo = (id: string) => {
    const p = promoRequests.find(x => x.id === id);
    if (!p) return;
    setPromoRequests(prev => prev.map(x => x.id === id ? { ...x, status: 'launched' } : x));
    addToast({ type: 'success', title: 'Campaign launched', msg: `${p.title} · materials dispatching · ROI clock started` });
  };

  const handleScheduleJointCall = (form: JointCallForm) => {
    const newCall: JointCall = {
      id: `jc-${Date.now()}`,
      rep: form.rep,
      pm: 'Dr. Femi Akande',
      division: form.division,
      region: form.region,
      territory: form.territory,
      customer: form.customer,
      product: form.product,
      scheduledFor: form.scheduledFor,
      rationale: form.rationale,
      status: 'scheduled',
    };
    setJointCalls(prev => [newCall, ...prev]);
    addToast({ type: 'success', title: 'Joint call scheduled', msg: `Heads-up sent to ${form.rep} · ${form.customer} on ${form.scheduledFor}` });
  };

  const handleSaveAccompaniment = (form: AccompanimentForm) => {
    const newAcc: AccompanimentRow = {
      id: `acc-${Date.now()}`,
      pm: 'Dr. Femi Akande',
      rep: form.rep,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      territory: form.territory,
      visitsShadowed: form.visitsShadowed,
      notes: form.notes,
      status: 'synced',
    };
    setAccompaniments(prev => [newAcc, ...prev]);
    addToast({ type: 'success', title: 'Accompaniment Logged', msg: `Shadow visit with ${form.rep} synchronized to CRM.` });
  };

  // ===== VIEW META =====
  const viewMeta: Record<string, ViewMeta> = {
    dashboard: { t: 'Dashboard', s: 'South-West Region · Q2 FY26' },
    activity: { t: 'Field Activity', s: 'Real-time rep tracking' },
    orders: { t: 'Orders & Approvals', s: 'SOA-integrated order management' },
    hcps: { t: 'HCPs & Customers', s: '342 contacts across SW region' },
    insights: { t: 'AI Insights', s: 'Forecasting & predictive analytics' },
    clinical: { t: 'Clinical Meetings', s: 'CM requests & approval workflow' },
    reports: { t: 'Reports & DCRs', s: 'Auto-generated reports' },
    itineraries: { t: 'Itinerary Governance', s: `${itinerariesPending.length} weekly · ${adjustmentsPending.length} daily adjustments pending` },
    'rep-day': { t: 'My Day', s: `${repStats.completed}/${repStats.planned} visits · Lagos region` },
    'rep-plan': { t: "Today's Plan", s: '8 stops · AI-optimized · GPS active' },
    'rep-team': { t: 'My Team', s: 'Lekki/V.I. Cluster · ASM Funmi Adeola' },
    'sync-queue': { t: 'Sync Queue', s: 'Offline conflicts held for review · nothing is silently lost' },
    'rep-visit': { t: activeVisit ? `Visit: ${activeVisit.name}` : 'Active Visit', s: activeVisit ? `Visit ${activeVisit.id} of 8${activeVisit.contact ? ` · ${activeVisit.contact}` : ''}` : 'No active visit' },
    'rep-order': { t: 'Place Order', s: 'SOA-integrated · Real-time pricing' },
    'rep-coach': { t: 'AI Coach', s: 'Personalized insights & recommendations' },
    'rep-dcr': { t: 'My DCR', s: 'Daily Call Report · Auto-generated' },
    'rep-clinical': { t: 'Request CM', s: 'Submit clinical meeting request' },
    'rep-orders': { t: 'My Orders', s: 'Your order history · SOA synced' },
    'asm-area': { t: 'Area Overview', s: 'Lekki/V.I. Cluster · 4 reps' },
    'asm-team': { t: 'Team Coaching', s: '1:1 notes · Performance tracking' },
    'asm-log': { t: 'My Activity Log', s: 'Auto-captured · Visible to BM' },
    'asm-pushup': { t: 'Push Report to BM', s: 'Compose & send upward summary' },
    'fsm-trade': { t: 'Trade Dashboard', s: 'Distributor health · Trade pipeline' },
    'fsm-distributors': { t: 'Distributor Management', s: '12 distributors · Q2 audit' },
    'pm-portfolio': { t: 'Product Portfolio', s: 'Respiratory Care · Coflin & Tuxil-N' },
    'pm-materials': { t: 'Detailing Materials', s: 'Push approved content to reps' },
    'pm-clinical': { t: 'CM Approvals', s: 'Phase 6 · Your portfolio requests' },
    'pm-inventory': { t: 'Customer Inventory Insights', s: 'Verify HCP Stock Levels' },
    'pm-directives': { t: 'Field Strategy & Directives', s: 'Issue directives to reps' },
    'pm-field': { t: 'Field Shadow Visits', s: 'Coaching & field accompaniment logs' },
    'mm-marketing': { t: 'Marketing Dashboard', s: 'Cross-product · Nationwide · Institution' },
    'mm-content': { t: 'Content Approvals', s: 'Sign-off on detailing materials' },
    'mm-cme': { t: 'High-Impact CM Approvals', s: 'Escalated multi-regional clinical events' },
    'mm-campaigns': { t: 'Campaign Performance', s: 'Nationwide marketing campaigns' },
    'dm-division': { t: 'Division Overview', s: 'South Division · 3 regions · 67 reps' },
    'dm-regions': { t: 'Regional Performance', s: 'SW, SE, SS · Cross-regional intelligence' },
    'dm-escalated': { t: 'Escalated Approvals', s: 'Beyond RSM tier · Your decision' },
    'dm-push': { t: 'Push to NSM', s: 'Divisional summary to National' },
    'nsm-national': { t: 'National Dashboard', s: 'Fidson Healthcare · All of Nigeria' },
    'nsm-divisions': { t: 'Divisions', s: 'South vs North · Cross-divisional view' },
    'nsm-forecast': { t: 'Forecast', s: '12-month national outlook' },
    'nsm-directive': { t: 'Push National Directive', s: 'Broadcast across the organization' },
    'hom-dashboard': { t: 'Head of Marketing', s: 'Institution + Trade · Marketing oversight' },
    'hom-directive': { t: 'Push National Directive', s: 'Broadcast to field' },
    'bm-portfolio': { t: 'Brand Portfolio', s: 'Cestra / Provision / Cardio' },
    'bm-directive': { t: 'Push Brand Directive', s: 'Broadcast to portfolio reps' },
    'bmd-dashboard': { t: 'Brand Management', s: 'All brands · Marketing P&L' },
    'bmd-directive': { t: 'Push National Directive', s: 'Broadcast to all marketing' },
    'adc-dashboard': { t: 'Associate Commercial Director', s: 'Trade + Mobile & Frontline' },
    'adc-directive': { t: 'Push Channel Directive', s: 'Broadcast to Trade + Mobile/Frontline' },
    'cd-dashboard': { t: 'Commercial Director', s: 'National · All channels' },
    'cd-directive': { t: 'Push National Directive', s: 'Broadcast to all reps' },
    'nsm_inst-dashboard': { t: 'NSM Institution', s: 'Institution channel · 4 regions' },
    'nsm_trade-dashboard': { t: 'NSM Trade', s: 'Trade channel · reports to ADC' },
    campaigns: { t: 'Campaigns & ROI', s: 'Material dispatch · 60-day attribution · cross-product' },
    'pm-promo': { t: 'Promo Requests', s: 'Field-submitted promo campaigns · approve & launch' },
  };

  // ===== NAV CONFIGS =====
  const asmNav: NavItem[] = [
    { k: 'asm-area', i: 'dashboard', l: 'Area Overview' },
    { k: 'performance', i: 'trending', l: 'Performance' },
    { k: 'asm-team', i: 'users', l: 'Team Coaching', badge: 1 },
    { k: 'pipeline', i: 'filter', l: 'Team Pipeline' },
    { k: 'asm-log', i: 'activity', l: 'My Activity Log' },
    { k: 'orders', i: 'cart', l: 'Area Orders', badge: approvals.filter(a => a.type === 'discount').length },
    { k: 'asm-pushup', i: 'send', l: 'Push to BM' },
  ];

  const fsmNav: NavItem[] = [
    { k: 'fsm-trade', i: 'dashboard', l: 'Trade Dashboard' },
    { k: 'performance', i: 'trending', l: 'Performance' },
    { k: 'fsm-distributors', i: 'package', l: 'Distributors', badge: 2 },
    { k: 'activity', i: 'activity', l: 'Trade Reps' },
    { k: 'orders', i: 'cart', l: 'Trade Orders' },
    { k: 'insights', i: 'sparkles', l: 'AI Insights' },
  ];

  const pmNav: NavItem[] = [
    { k: 'pm-portfolio', i: 'pill', l: 'My Portfolio' },
    { k: 'pm-materials', i: 'file', l: 'Detailing Materials' },
    { k: 'pm-clinical', i: 'flask', l: 'CM Approvals', badge: clinicalMeetings.filter(c => c.s === 'pm-review').length },
    { k: 'pm-promo', i: 'sparkles', l: 'Promo Requests', badge: promoRequests.filter(p => p.status === 'pending').length },
    { k: 'campaigns', i: 'trending', l: 'Campaigns & ROI' },
    { k: 'pm-inventory', i: 'package', l: 'Customer Inventory' },
    { k: 'pm-directives', i: 'send', l: 'Rep Directives' },
    { k: 'pm-field', i: 'location', l: 'Shadow Logs' },
    { k: 'insights', i: 'sparkles', l: 'Product Insights' },
  ];

  const mmNav: NavItem[] = [
    { k: 'mm-marketing', i: 'dashboard', l: 'Marketing Dashboard' },
    { k: 'mm-content', i: 'file', l: 'Content Approvals', badge: contentApprovals.filter(c => c.status === 'pending').length },
    { k: 'mm-cme', i: 'flask', l: 'High-Impact CMs', badge: clinicalMeetings.filter(c => c.s === 'hom-review').length },
    { k: 'campaigns', i: 'trending', l: 'Campaigns & ROI' },
    { k: 'insights', i: 'sparkles', l: 'Brand Insights' },
  ];

  const dmNav: NavItem[] = [
    { k: 'dm-division', i: 'dashboard', l: 'Division Overview' },
    { k: 'dm-regions', i: 'map', l: 'Regional Performance' },
    { k: 'pipeline', i: 'filter', l: 'Division Pipeline' },
    { k: 'performance', i: 'trending', l: 'Target vs Achieved' },
    { k: 'dm-escalated', i: 'alert', l: 'Escalated Approvals', badge: 2 },
    { k: 'campaigns', i: 'trending', l: 'Campaigns & ROI' },
    { k: 'insights', i: 'sparkles', l: 'Cross-Regional Intel' },
    { k: 'dm-push', i: 'send', l: 'Push to NSM' },
  ];

  const nsmNav: NavItem[] = [
    { k: 'nsm-national', i: 'dashboard', l: 'National Dashboard' },
    { k: 'nsm-divisions', i: 'layers', l: 'Divisions' },
    { k: 'campaigns', i: 'trending', l: 'Campaigns & ROI' },
    { k: 'nsm-forecast', i: 'trending', l: 'Forecast' },
    { k: 'nsm-directive', i: 'send', l: 'Push Directive' },
  ];

  const homNav: NavItem[] = [
    { k: 'hom-dashboard', i: 'dashboard', l: 'Marketing Overview' },
    { k: 'mm-content', i: 'file', l: 'Content Approvals', badge: contentApprovals.filter(c => c.status === 'pending').length },
    { k: 'mm-cme', i: 'flask', l: 'High-Impact CMs', badge: clinicalMeetings.filter(c => c.s === 'hom-review').length },
    { k: 'campaigns', i: 'trending', l: 'Campaigns & ROI' },
    { k: 'insights', i: 'sparkles', l: 'Brand Insights' },
    { k: 'hom-directive', i: 'send', l: 'Push Directive' },
  ];

  const bmNav: NavItem[] = [
    { k: 'bm-portfolio', i: 'pill', l: 'Brand Portfolio' },
    { k: 'insights', i: 'sparkles', l: 'Brand Insights' },
    { k: 'bm-directive', i: 'send', l: 'Push Directive' },
  ];

  const bmdNav: NavItem[] = [
    { k: 'bmd-dashboard', i: 'dashboard', l: 'Brand Management' },
    { k: 'campaigns', i: 'trending', l: 'Campaigns & ROI' },
    { k: 'insights', i: 'sparkles', l: 'Strategic Insights' },
    { k: 'bmd-directive', i: 'send', l: 'Push Directive' },
  ];

  const nsmInstNav: NavItem[] = [
    { k: 'nsm_inst-dashboard', i: 'dashboard', l: 'Institution Dashboard' },
    { k: 'nsm-divisions', i: 'layers', l: 'Regions' },
    { k: 'campaigns', i: 'trending', l: 'Campaigns & ROI' },
    { k: 'nsm-forecast', i: 'trending', l: 'Forecast' },
    { k: 'nsm-directive', i: 'send', l: 'Push Directive' },
  ];

  const nsmTradeNav: NavItem[] = [
    { k: 'nsm_trade-dashboard', i: 'dashboard', l: 'Trade Dashboard' },
    { k: 'nsm-divisions', i: 'layers', l: 'Regions' },
    { k: 'campaigns', i: 'trending', l: 'Campaigns & ROI' },
    { k: 'nsm-forecast', i: 'trending', l: 'Forecast' },
    { k: 'nsm-directive', i: 'send', l: 'Push Directive' },
  ];

  const adcNav: NavItem[] = [
    { k: 'adc-dashboard', i: 'dashboard', l: 'Channel Overview' },
    { k: 'campaigns', i: 'trending', l: 'Campaigns & ROI' },
    { k: 'insights', i: 'sparkles', l: 'Channel Insights' },
    { k: 'adc-directive', i: 'send', l: 'Push Directive' },
  ];

  const cdNav: NavItem[] = [
    { k: 'cd-dashboard', i: 'dashboard', l: 'National Command' },
    { k: 'pipeline', i: 'filter', l: 'National Pipeline' },
    { k: 'campaigns', i: 'trending', l: 'Campaigns & ROI' },
    { k: 'insights', i: 'sparkles', l: 'Strategic Insights' },
    { k: 'cd-directive', i: 'send', l: 'Push Directive' },
  ];

  // ===== RENDER VIEW =====
  const renderView = () => {
    const dashboardStats = { pendingCount: approvals.length };
    const nsmScope = isNSMTrade ? 'Trade' : isNSMInst ? 'Institution' : 'Mobile & Frontline';

    if (view === 'campaigns') {
      return <CampaignsView scope="All campaigns · Cross-product · 60-day attribution" />;
    }

    // Shared manager-side lead funnel (all non-rep roles reach it via 'pipeline').
    if (view === 'pipeline' && !isRep) {
      return <PipelineView leads={leads} />;
    }

    if (isRep) {
      switch (view) {
        case 'rep-day': return <RepDashboard visits={repVisits} onNavigate={setView} onStartVisit={handleStartVisit} repStats={repStats} hcpsMet={hcpsMetToday} directives={directives} onAcknowledgeDirective={handleAcknowledgeDirective} customerInventory={customerInventory} />;
        case 'rep-plan': return <RepPlanView visits={repVisits} onStartVisit={handleStartVisit} weekItinerary={weekItinerary} repAdjustments={repAdjustments} onRequestAdjustment={handleRequestAdjustment} nextWeekVisits={nextWeekVisits} nextWeekItinerary={nextWeekItinerary} onAddPlannedVisit={handleAddPlannedVisit} onRemovePlannedVisit={handleRemovePlannedVisit} onApplyOptimizedRoute={handleApplyOptimizedRoute} onSubmitItinerary={handleSubmitItinerary} />;
        case 'rep-visit': return <RepVisitLogView activeVisit={activeVisit} visitLogs={visitLogs} currentUserId={user?.email || 'rep'} currentUserName={user?.name || 'Rep'} onLogVisit={handleLogVisit} onCompleteVisit={handleCompleteVisit} onPlaceOrder={handlePlaceOrder} onNavigate={setView} onAddLead={handleAddLead} />;
        case 'rep-order': return <RepOrderView activeVisit={activeVisit} onSubmitOrder={handleSubmitOrder} onBack={() => setView('rep-visit')} />;
        case 'rep-coach': return <RepCoachView customerInventory={customerInventory} onNavigate={setView} />;
        case 'rep-dcr': return <RepDCRView visitsCompleted={repStats.completed} ordersToday={orders.filter(o => o.rep === 'Adaeze O.').length} visitLogs={visitLogs} onSubmit={handleSubmitDCR} />;
        case 'rep-clinical': return <RepClinicalView onSubmitCM={handleSubmitCM} prefillHcp={cmPrefillHcp} onConsumePrefill={() => setCmPrefillHcp('')} />;
        case 'rep-orders': return <OrdersView orders={orders.filter(o => o.rep === 'Adaeze O.')} onOpenApproval={openOrderApproval} onApprove={approveItem} searchQuery={searchQuery} />;
        case 'rep-team': return <RepTeamView />;
        case 'rep-customers': return <CustomersView extraAccounts={convertedCustomers} />;
        case 'rep-pipeline': return <RepPipelineView leads={leads.filter(l => l.repName === REP_OWNER)} onEnrich={handleEnrichLead} onConsent={handleConsentLead} onSend={handleSendLead} onConvert={handleConvertLead} onNavigate={setView} />;
        case 'rep-invoices': return <RepInvoicesView orders={orders.filter(o => o.rep === 'Adaeze O.')} />;
        default: return <RepDashboard visits={repVisits} onNavigate={setView} onStartVisit={handleStartVisit} repStats={repStats} hcpsMet={hcpsMetToday} directives={directives} onAcknowledgeDirective={handleAcknowledgeDirective} customerInventory={customerInventory} />;
      }
    }

    if (isASM) {
      switch (view) {
        case 'asm-area': return <ASMDashboard onNavigate={setView} />;
        case 'performance': return <PerformanceView subtitle="Target vs Achieved · Q2 · your area reps" />;
        case 'asm-team': return <ASMTeamView />;
        case 'asm-log': return <ASMActivityLogView />;
        case 'orders': return <OrdersView orders={orders.filter(o => ['Adaeze O.', 'Tope A.'].includes(o.rep))} onOpenApproval={openOrderApproval} onApprove={approveItem} searchQuery={searchQuery} />;
        case 'asm-pushup': return (
          <div className="p-8 max-w-2xl mx-auto">
            <div className="rounded-2xl bg-white border border-navy-100 p-6 fade-up">
              <h3 className="font-display text-xl font-bold text-ink">Compose Report to BM Cestra</h3>
              <p className="text-sm text-navy-500 mt-1 mb-5">Weekly area summary · Auto-includes KPIs and activity log</p>
              <textarea
                rows={8}
                defaultValue="Week 19 summary: Cluster delivered 82% coverage (+8% vs prior week). Adaeze and Tope continue to over-deliver. Yetunde flagged for coaching - 1:1 scheduled for Friday. Lekki Phase 2 still has 2 untouched A-tier accounts; have re-assigned to Bayo."
                className="input-field w-full p-3 rounded-xl bg-paper border border-navy-200 text-sm resize-none"
              />
              <div className="mt-4 flex gap-2">
                <button className="flex-1 py-2.5 rounded-lg border border-navy-200 text-sm font-bold text-navy-700">Save Draft</button>
                <button
                  onClick={() => { addToast({ type: 'success', title: 'Report pushed to BM', msg: 'BM Cestra · Week 19 summary' }); setView('asm-area'); }}
                  className="flex-1 py-2.5 rounded-lg bg-sky-500 text-white text-sm font-bold flex items-center justify-center gap-1.5"
                >
                  <Icon name="send" size={14} /> Push to BM
                </button>
              </div>
            </div>
          </div>
        );
        default: return <ASMDashboard onNavigate={setView} />;
      }
    }

    if (isFSM) {
      switch (view) {
        case 'fsm-trade': return <FSMDashboard onNavigate={setView} approvals={approvals} onEscalateToNSM={handleEscalateToNSM} />;
        case 'performance': return <PerformanceView title="Trade Rep Performance" subtitle="Target vs Achieved · Q2 · your trade reps" />;
        case 'fsm-distributors': return <FSMDistributorsView />;
        case 'activity': return <FieldActivityView searchQuery={searchQuery} visitLogs={visitLogs} />;
        case 'sync-queue': return <SyncQueueView />;
        case 'orders': return <OrdersView orders={orders} onOpenApproval={openOrderApproval} onApprove={approveItem} searchQuery={searchQuery} />;
        case 'insights': return <AIInsightsChat role={user?.roleType ?? 'manager'} />;
        default: return <FSMDashboard onNavigate={setView} approvals={approvals} onEscalateToNSM={handleEscalateToNSM} />;
      }
    }

    if (isPM) {
      switch (view) {
        case 'pm-portfolio': return <PMDashboard onNavigate={setView} clinicalMeetings={clinicalMeetings} customerInventory={customerInventory} accompaniments={accompaniments} approvals={approvals} visitLogs={visitLogs} />;
        case 'pm-materials': return <PMMaterialsView onPushMaterial={handlePushMaterial} />;
        case 'pm-clinical': return <PMClinicalView clinicalMeetings={clinicalMeetings} onApproveCM={handlePMApproveCM} onRejectCM={rejectCM} />;
        case 'pm-inventory': return <CustomerInventoryView customerInventory={customerInventory} onBack={() => setView('pm-portfolio')} isPM />;
        case 'pm-directives': return <PMDirectivesView directives={directives} onPushDirective={handlePushDirective} onBack={() => setView('pm-portfolio')} />;
        case 'pm-field': return <PMFieldView accompaniments={accompaniments} onSaveAccompaniment={handleSaveAccompaniment} jointCalls={jointCalls} onScheduleJointCall={handleScheduleJointCall} onBack={() => setView('pm-portfolio')} />;
        case 'pm-promo': return <PMPromoView promoRequests={promoRequests} onApprove={handleApprovePromo} onReject={handleRejectPromo} onLaunch={handleLaunchPromo} />;
        case 'insights': return <AIInsightsChat role={user?.roleType ?? 'manager'} />;
        default: return <PMDashboard onNavigate={setView} clinicalMeetings={clinicalMeetings} customerInventory={customerInventory} accompaniments={accompaniments} approvals={approvals} visitLogs={visitLogs} />;
      }
    }

    if (isMM) {
      switch (view) {
        case 'mm-marketing': return <MMDashboard onNavigate={setView} contentApprovals={contentApprovals} clinicalMeetings={clinicalMeetings} />;
        case 'mm-content': return <MMContentApprovalsView contentApprovals={contentApprovals} onApproveContent={handleApproveContent} onRejectContent={handleRejectContent} />;
        case 'mm-cme': return <MMCmeView clinicalMeetings={clinicalMeetings} onApprove={handleMMApproveCM} onReject={rejectCM} />;
        case 'insights': return <AIInsightsChat role={user?.roleType ?? 'manager'} />;
        default: return <MMDashboard onNavigate={setView} contentApprovals={contentApprovals} clinicalMeetings={clinicalMeetings} />;
      }
    }

    if (isDM) {
      switch (view) {
        case 'dm-division': return <DMDashboard onNavigate={setView} approvals={approvals} />;
        case 'dm-regions': return <DMDashboard onNavigate={setView} approvals={approvals} />;
        case 'performance': return <PerformanceView title="Regional Performance" subtitle="Target vs Achieved · Q2 · regions reporting to you" rows={[
          { name: 'South-West Region', unit: 'RSM · A. Bello', target: 48, achieved: 44.2 },
          { name: 'South-East Region', unit: 'RSM · N. Eze', target: 40, achieved: 41.5 },
          { name: 'South-South Region', unit: 'RSM · P. Etim', target: 36, achieved: 28.9 },
        ]} />;
        case 'dm-escalated': return <DMEscalatedView approvals={approvals} onOpenApproval={setApprovalModalItem as (item: ApprovalItem) => void} onApprove={approveItem} onReject={rejectItem} onEscalateToNSM={handleEscalateToNSM} />;
        case 'insights': return <AIInsightsChat role={user?.roleType ?? 'manager'} />;
        case 'dm-push': return (
          <div className="p-8 max-w-2xl mx-auto">
            <div className="rounded-2xl bg-white border border-navy-100 p-6 fade-up">
              <h3 className="font-display text-xl font-bold text-ink">Push Divisional Report to NSM</h3>
              <p className="text-sm text-navy-500 mt-1 mb-5">Weekly division summary · Auto-includes 3 regions' KPIs</p>
              <textarea
                rows={8}
                defaultValue="Week 19 · South Division: Pipeline up 18% MoM to ₦128M. SW leading at 92% attainment, SE under-indexing on Coflin (recommend PM Akande engagement). 2 escalated discounts approved this week. Distributor stockout risk in Onitsha resolved via priority push."
                className="input-field w-full p-3 rounded-xl bg-paper border border-navy-200 text-sm resize-none"
              />
              <div className="mt-4 flex gap-2">
                <button className="flex-1 py-2.5 rounded-lg border border-navy-200 text-sm font-bold text-navy-700">Save Draft</button>
                <button
                  onClick={() => { addToast({ type: 'success', title: 'Pushed to NSM', msg: 'Bayo Ogunlana · Week 19 division summary' }); setView('dm-division'); }}
                  className="flex-1 py-2.5 rounded-lg bg-rose-500 text-white text-sm font-bold flex items-center justify-center gap-1.5"
                >
                  <Icon name="send" size={14} /> Push to NSM
                </button>
              </div>
            </div>
          </div>
        );
        default: return <DMDashboard onNavigate={setView} approvals={approvals} />;
      }
    }

    if (isNSM) {
      switch (view) {
        case 'nsm-national': return <NSMDashboard onNavigate={setView} approvals={approvals} dcrs={dcrs} clinicalMeetings={clinicalMeetings} scope={nsmScope} />;
        case 'nsm-divisions': return <NSMDashboard onNavigate={setView} approvals={approvals} dcrs={dcrs} clinicalMeetings={clinicalMeetings} scope={nsmScope} />;
        case 'nsm-forecast': return <AIInsightsChat role={user?.roleType ?? 'manager'} />;
        case 'nsm-directive': return <NSMDirectiveView onSendDirective={handleSendDirective} />;
        case 'insights': return <AIInsightsChat role={user?.roleType ?? 'manager'} />;
        default: return <NSMDashboard onNavigate={setView} approvals={approvals} dcrs={dcrs} clinicalMeetings={clinicalMeetings} scope={nsmScope} />;
      }
    }

    if (isNSMInst) {
      switch (view) {
        case 'nsm_inst-dashboard': return <NSMDashboard onNavigate={setView} approvals={approvals} dcrs={dcrs} clinicalMeetings={clinicalMeetings} scope={nsmScope} />;
        case 'nsm-divisions': return <NSMDashboard onNavigate={setView} approvals={approvals} dcrs={dcrs} clinicalMeetings={clinicalMeetings} scope={nsmScope} />;
        case 'nsm-forecast': return <AIInsightsChat role={user?.roleType ?? 'manager'} />;
        case 'nsm-directive': return <NSMDirectiveView onSendDirective={handleSendDirective} />;
        case 'insights': return <AIInsightsChat role={user?.roleType ?? 'manager'} />;
        default: return <NSMDashboard onNavigate={setView} approvals={approvals} dcrs={dcrs} clinicalMeetings={clinicalMeetings} scope={nsmScope} />;
      }
    }

    if (isNSMTrade) {
      switch (view) {
        case 'nsm_trade-dashboard': return <NSMDashboard onNavigate={setView} approvals={approvals} dcrs={dcrs} clinicalMeetings={clinicalMeetings} scope={nsmScope} />;
        case 'nsm-divisions': return <NSMDashboard onNavigate={setView} approvals={approvals} dcrs={dcrs} clinicalMeetings={clinicalMeetings} scope={nsmScope} />;
        case 'nsm-forecast': return <AIInsightsChat role={user?.roleType ?? 'manager'} />;
        case 'nsm-directive': return <NSMDirectiveView onSendDirective={handleSendDirective} />;
        case 'insights': return <AIInsightsChat role={user?.roleType ?? 'manager'} />;
        default: return <NSMDashboard onNavigate={setView} approvals={approvals} dcrs={dcrs} clinicalMeetings={clinicalMeetings} scope={nsmScope} />;
      }
    }

    if (isHoM) {
      switch (view) {
        case 'hom-dashboard': return <HoMDashboard onNavigate={setView} clinicalMeetings={clinicalMeetings} contentApprovals={contentApprovals} />;
        case 'hom-directive': return <NSMDirectiveView onSendDirective={handleSendDirective} />;
        case 'mm-content': return <MMContentApprovalsView contentApprovals={contentApprovals} onApproveContent={handleApproveContent} onRejectContent={handleRejectContent} />;
        case 'mm-cme': return <MMCmeView clinicalMeetings={clinicalMeetings} onApprove={handleMMApproveCM} onReject={rejectCM} />;
        case 'insights': return <AIInsightsChat role={user?.roleType ?? 'manager'} />;
        default: return <HoMDashboard onNavigate={setView} clinicalMeetings={clinicalMeetings} contentApprovals={contentApprovals} />;
      }
    }

    if (isBM) {
      switch (view) {
        case 'bm-portfolio': return <BMDashboard onNavigate={setView} />;
        case 'bm-directive': return <NSMDirectiveView onSendDirective={handleSendDirective} />;
        case 'insights': return <AIInsightsChat role={user?.roleType ?? 'manager'} />;
        default: return <BMDashboard onNavigate={setView} />;
      }
    }

    if (isBMD) {
      switch (view) {
        case 'bmd-dashboard': return <BMDDashboard onNavigate={setView} />;
        case 'bmd-directive': return <NSMDirectiveView onSendDirective={handleSendDirective} />;
        case 'insights': return <AIInsightsChat role={user?.roleType ?? 'manager'} />;
        default: return <BMDDashboard onNavigate={setView} />;
      }
    }

    if (isADC) {
      switch (view) {
        case 'adc-dashboard': return <ADCDashboard onNavigate={setView} />;
        case 'adc-directive': return <NSMDirectiveView onSendDirective={handleSendDirective} />;
        case 'insights': return <AIInsightsChat role={user?.roleType ?? 'manager'} />;
        default: return <ADCDashboard onNavigate={setView} />;
      }
    }

    if (isCD) {
      switch (view) {
        case 'cd-dashboard': return <CDDashboard onNavigate={setView} approvals={approvals} dcrs={dcrs} clinicalMeetings={clinicalMeetings} />;
        case 'cd-directive': return <NSMDirectiveView onSendDirective={handleSendDirective} />;
        case 'insights': return <AIInsightsChat role={user?.roleType ?? 'manager'} />;
        default: return <CDDashboard onNavigate={setView} approvals={approvals} dcrs={dcrs} clinicalMeetings={clinicalMeetings} />;
      }
    }

    // MANAGER (RSM) ROUTES
    switch (view) {
      case 'dashboard': return <DashboardView approvals={approvals} onOpenApproval={setApprovalModalItem as (item: ApprovalItem) => void} onApprove={approveItem} onReject={rejectItem} dashboardStats={dashboardStats} />;
      case 'activity': return <FieldActivityView searchQuery={searchQuery} visitLogs={visitLogs} />;
        case 'sync-queue': return <SyncQueueView />;
      case 'orders': return <OrdersView orders={orders} onOpenApproval={openOrderApproval} onApprove={approveItem} searchQuery={searchQuery} />;
      case 'hcps': return <HCPsView searchQuery={searchQuery} />;
      case 'insights': return <AIInsightsChat role={user?.roleType ?? 'manager'} />;
      case 'clinical': return <ClinicalView clinicalMeetings={clinicalMeetings} onApproveCM={approveCM} onRejectCM={rejectCM} />;
      case 'reports': return <ReportsView dcrs={dcrs} />;
      case 'itineraries': return (
        <RSMItinerariesView
          itinerariesPending={itinerariesPending}
          adjustmentsPending={adjustmentsPending}
          onApproveItinerary={handleApproveItinerary}
          onRejectItinerary={handleRejectItinerary}
          onApproveAdjustment={handleApproveAdjustment}
          onRejectAdjustment={handleRejectAdjustment}
        />
      );
      default: return <DashboardView approvals={approvals} onOpenApproval={setApprovalModalItem as (item: ApprovalItem) => void} onApprove={approveItem} onReject={rejectItem} dashboardStats={dashboardStats} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen onLogin={handleLogin} />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  const bottomNavMap: Record<PersonaKey, BottomNavSpec> = {
    rep: { items: [
      { k: 'rep-day', i: 'dashboard', l: 'Day' },
      { k: 'rep-plan', i: 'map', l: 'Plan', badge: 5 },
      { k: 'rep-visit', i: 'location', l: 'Visit', live: !!activeVisit },
      { k: 'rep-orders', i: 'cart', l: 'Orders' },
      { k: 'rep-coach', i: 'sparkles', l: 'Coach' },
    ], color: 'leaf' },
    manager: { items: [
      { k: 'dashboard', i: 'dashboard', l: 'Home' },
      { k: 'itineraries', i: 'calendar', l: 'Plans', badge: itinerariesPending.length + adjustmentsPending.length },
      { k: 'orders', i: 'cart', l: 'Orders', badge: approvals.length },
      { k: 'activity', i: 'activity', l: 'Field' },
      { k: 'insights', i: 'sparkles', l: 'AI' },
    ], color: 'navy' },
    asm: { items: [
      { k: 'asm-area', i: 'dashboard', l: 'Area' },
      { k: 'asm-team', i: 'users', l: 'Team', badge: 1 },
      { k: 'asm-log', i: 'activity', l: 'Log' },
      { k: 'orders', i: 'cart', l: 'Orders' },
      { k: 'asm-pushup', i: 'send', l: 'Push' },
    ], color: 'sky' },
    fsm: { items: [
      { k: 'fsm-trade', i: 'dashboard', l: 'Trade' },
      { k: 'fsm-distributors', i: 'package', l: 'Dist.', badge: 2 },
      { k: 'orders', i: 'cart', l: 'Orders' },
      { k: 'activity', i: 'activity', l: 'Reps' },
      { k: 'insights', i: 'sparkles', l: 'AI' },
    ], color: 'amber' },
    pm: { items: [
      { k: 'pm-portfolio', i: 'pill', l: 'Brand' },
      { k: 'pm-materials', i: 'file', l: 'Materials' },
      { k: 'pm-clinical', i: 'flask', l: 'CMs', badge: clinicalMeetings.filter(c => c.s === 'pm-review').length },
      { k: 'pm-directives', i: 'send', l: 'Directives' },
      { k: 'pm-inventory', i: 'package', l: 'Inventory' },
    ], color: 'violet' },
    mm: { items: [
      { k: 'mm-marketing', i: 'dashboard', l: 'Brand' },
      { k: 'mm-content', i: 'file', l: 'Content', badge: contentApprovals.filter(c => c.status === 'pending').length },
      { k: 'mm-cme', i: 'flask', l: 'CMs', badge: clinicalMeetings.filter(c => c.s === 'hom-review').length },
      { k: 'insights', i: 'sparkles', l: 'AI' },
    ], color: 'fuchsia' },
    dm: { items: [
      { k: 'dm-division', i: 'dashboard', l: 'Division' },
      { k: 'dm-regions', i: 'map', l: 'Regions' },
      { k: 'dm-escalated', i: 'alert', l: 'Escalated', badge: 2 },
      { k: 'insights', i: 'sparkles', l: 'AI' },
      { k: 'dm-push', i: 'send', l: 'Push' },
    ], color: 'rose' },
    nsm: { items: [
      { k: 'nsm-national', i: 'dashboard', l: 'National' },
      { k: 'nsm-divisions', i: 'layers', l: 'Divisions' },
      { k: 'nsm-forecast', i: 'trending', l: 'Forecast' },
      { k: 'nsm-directive', i: 'send', l: 'Push' },
    ], color: 'indigo' },
    nsm_inst: { items: [
      { k: 'nsm_inst-dashboard', i: 'dashboard', l: 'Institution' },
      { k: 'nsm-divisions', i: 'layers', l: 'Regions' },
      { k: 'nsm-forecast', i: 'trending', l: 'Forecast' },
      { k: 'nsm-directive', i: 'send', l: 'Push' },
    ], color: 'indigo' },
    nsm_trade: { items: [
      { k: 'nsm_trade-dashboard', i: 'dashboard', l: 'Trade' },
      { k: 'nsm-divisions', i: 'layers', l: 'Regions' },
      { k: 'nsm-forecast', i: 'trending', l: 'Forecast' },
      { k: 'nsm-directive', i: 'send', l: 'Push' },
    ], color: 'amber' },
    hom: { items: [
      { k: 'hom-dashboard', i: 'dashboard', l: 'Marketing' },
      { k: 'mm-content', i: 'file', l: 'Content', badge: contentApprovals.filter(c => c.status === 'pending').length },
      { k: 'mm-cme', i: 'flask', l: 'CMs', badge: clinicalMeetings.filter(c => c.s === 'hom-review').length },
      { k: 'insights', i: 'sparkles', l: 'AI' },
      { k: 'hom-directive', i: 'send', l: 'Push' },
    ], color: 'fuchsia' },
    bm: { items: [
      { k: 'bm-portfolio', i: 'pill', l: 'Brand' },
      { k: 'insights', i: 'sparkles', l: 'AI' },
      { k: 'bm-directive', i: 'send', l: 'Push' },
    ], color: 'emerald' },
    bmd: { items: [
      { k: 'bmd-dashboard', i: 'dashboard', l: 'Brands' },
      { k: 'insights', i: 'sparkles', l: 'AI' },
      { k: 'bmd-directive', i: 'send', l: 'Push' },
    ], color: 'teal' },
    adc: { items: [
      { k: 'adc-dashboard', i: 'dashboard', l: 'Channels' },
      { k: 'insights', i: 'sparkles', l: 'AI' },
      { k: 'adc-directive', i: 'send', l: 'Push' },
    ], color: 'rose' },
    cd: { items: [
      { k: 'cd-dashboard', i: 'dashboard', l: 'National' },
      { k: 'insights', i: 'sparkles', l: 'AI' },
      { k: 'cd-directive', i: 'send', l: 'Push' },
    ], color: 'indigo' },
  };

  const currentBottomNav = bottomNavMap[user?.roleType || 'manager'] || bottomNavMap.manager;

  const sidebarUser = user ? { name: user.name, role: user.role } : undefined;

  const renderSidebar = (isMobile: boolean, closeFn?: () => void) => {
    const common = {
      active: view,
      onNavigate: setView,
      isMobile,
      onClose: closeFn,
      onLogout: handleLogout,
      user: sidebarUser,
      collapsed: !isMobile && sidebarCollapsed,
      onToggleCollapse: () => setSidebarCollapsed(c => !c),
    };
    if (isRep) return <RepSidebar {...common} activeVisit={activeVisit} />;
    if (isASM) return <RoleSidebar {...common} roleType="asm" navItems={asmNav} statusPill={{ label: 'Area Active', detail: 'Lekki/V.I. · 4 reps live' }} />;
    if (isFSM) return <RoleSidebar {...common} roleType="fsm" navItems={fsmNav} statusPill={{ label: 'Trade Channel', detail: 'South-West · 12 distributors' }} />;
    if (isPM) return <RoleSidebar {...common} roleType="pm" navItems={pmNav} statusPill={{ label: 'Portfolio Active', detail: 'Respiratory Care' }} />;
    if (isMM) return <RoleSidebar {...common} roleType="mm" navItems={mmNav} statusPill={{ label: 'Marketing · National', detail: 'Institution · 4 portfolios' }} />;
    if (isDM) return <RoleSidebar {...common} roleType="dm" navItems={dmNav} statusPill={{ label: 'Division Active', detail: 'South · 3 regions · 67 reps' }} />;
    if (isNSM) return <RoleSidebar {...common} roleType="nsm" navItems={nsmNav} statusPill={{ label: 'National', detail: 'Nigeria · 2 div · 6 regions' }} />;
    if (isNSMInst) return <RoleSidebar {...common} roleType="nsm_inst" navItems={nsmInstNav} statusPill={{ label: 'Institution · National', detail: '4 regions · 62 reps' }} />;
    if (isNSMTrade) return <RoleSidebar {...common} roleType="nsm_trade" navItems={nsmTradeNav} statusPill={{ label: 'Trade · National', detail: '6 FSMs · 38 reps' }} />;
    if (isHoM) return <RoleSidebar {...common} roleType="hom" navItems={homNav} statusPill={{ label: 'Marketing Lead', detail: 'Institution + Trade' }} />;
    if (isBM) return <RoleSidebar {...common} roleType="bm" navItems={bmNav} statusPill={{ label: 'Cestra Brand', detail: '3 SKUs · Nationwide' }} />;
    if (isBMD) return <RoleSidebar {...common} roleType="bmd" navItems={bmdNav} statusPill={{ label: 'Brand Management', detail: '8 brands · 5 direct reports' }} />;
    if (isADC) return <RoleSidebar {...common} roleType="adc" navItems={adcNav} statusPill={{ label: 'Trade + M&F', detail: '80 reps · 2 NSMs' }} />;
    if (isCD) return <RoleSidebar {...common} roleType="cd" navItems={cdNav} statusPill={{ label: 'Commercial', detail: '142 reps · ₦2.4TN FY26' }} />;
    return <Sidebar {...common} approvalsCount={approvals.length} itinerariesBadge={itinerariesPending.length + adjustmentsPending.length} />;
  };

  return (
    <div className="flex flex-row-reverse h-screen overflow-hidden">
      {renderSidebar(false)}

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          title={viewMeta[view]?.t || 'FieldForce'}
          subtitle={viewMeta[view]?.s || ''}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentRole={user?.currentRole}
          onSwitchRole={handleSwitchRole}
        />
        <main className="flex-1 overflow-y-auto bg-paper pb-20 md:pb-0">
          {renderView()}
        </main>
        {currentBottomNav && (
          <BottomNav
            items={currentBottomNav.items}
            active={view}
            onNavigate={setView}
            accentColor={currentBottomNav.color}
          />
        )}
      </div>

      {sidebarOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 fade-in"
            style={{ background: 'rgba(10, 24, 48, 0.5)' }}
            onClick={() => setSidebarOpen(false)}
          />
          {renderSidebar(true, () => setSidebarOpen(false))}
        </>
      )}

      {approvalModalItem && (
        <ApprovalModal
          item={approvalModalItem}
          onClose={() => setApprovalModalItem(null)}
          onApprove={approveItem}
          onReject={rejectItem}
          readOnly={!isDM}
        />
      )}

      <HelpdeskWidget />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
