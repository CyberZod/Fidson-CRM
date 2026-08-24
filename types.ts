// ===== Icons =====
export type IconName =
  | 'dashboard' | 'activity' | 'map' | 'users' | 'cart' | 'sparkles' | 'flask'
  | 'file' | 'settings' | 'bell' | 'search' | 'chevronRight' | 'chevronDown'
  | 'chevronUp' | 'chevronLeft' | 'arrowUp' | 'arrowDown' | 'arrowRight' | 'plus'
  | 'check' | 'checkCircle' | 'x' | 'xCircle' | 'menu' | 'alert' | 'trending'
  | 'location' | 'clock' | 'pill' | 'package' | 'camera' | 'layers' | 'filter'
  | 'download' | 'eye' | 'refresh' | 'target' | 'calendar' | 'helpCircle'
  | 'logout' | 'send' | 'edit' | 'flag' | 'barChart' | 'fingerprint' | 'mail'
  | 'lock' | 'eyeOff' | 'panelClose' | 'panelOpen' | 'mic';

// ===== Toasts =====
export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  title: string;
  msg?: string;
  dismissing?: boolean;
}

// ===== Personas / Roles =====
export type PersonaKey =
  | 'manager' | 'rep' | 'asm' | 'fsm' | 'pm' | 'mm' | 'dm' | 'nsm'
  | 'nsm_inst' | 'nsm_trade'
  | 'hom' | 'bm' | 'bmd' | 'adc' | 'cd';

export type ColorKey =
  | 'leaf' | 'sky' | 'navy' | 'amber' | 'violet' | 'rose' | 'indigo' | 'fuchsia'
  | 'emerald' | 'teal';

export interface Persona {
  email: string;
  name: string;
  role: string;
  roleType: PersonaKey;
  initials: string;
  tag: string;
  tagColor: ColorKey;
  desc: string;
  category: string;
}

export interface ColorPalette {
  avBg: string;
  tagBg: string;
  tagText: string;
  ring: string;
  border: string;
  hover: string;
}

// ===== Nigeria Geography =====
export type DivisionKey = 'north' | 'south';

export interface NigeriaRegion {
  code: 'NW' | 'NE' | 'NC' | 'SW' | 'SE' | 'SS';
  name: string;
  cities: string;
  hq: string;
  div: DivisionKey;
}

export interface RegionData {
  code: NigeriaRegion['code'];
  intensity?: number;
  label?: string;
}

// ===== Signed-in user =====
export interface SignedInUser {
  email: string;
  signedInEmail: string;
}

// ===== Sidebar user profile (display) =====
export interface SidebarUser {
  name: string;
  role: string;
}

// ===== Nav items =====
export interface NavItem {
  k: string;
  i: IconName;
  l: string;
  badge?: number;
  live?: boolean;
}

// ===== Approvals (RSM dashboard / orders) =====
export type EscalationStatus = 'escalated' | 'imminent' | null;

export interface ApprovalItem {
  id: string;
  type: 'discount' | 'sample' | 'order' | 'expense' | 'visit-summary' | string;
  rep: string;
  detail: string;
  amount: string;
  time: string;
  urgent?: boolean;
  customer?: string;
  product?: string;
  qty?: number;
  baseValue?: string;
  discountPct?: string;
  finalValue?: string;
  reason?: string;
  rationale?: string;
  channel?: 'booklet' | 'erp';
  nsmChannel?: 'Institution' | 'Trade'; // which NSM desk owns this on escalation
  approvalThreshold?: string;
  escalationStatus?: EscalationStatus;
  dismissing?: boolean;
}

export interface OrderRow {
  id: string;
  rep: string;
  cust: string;
  channel: 'booklet' | 'erp';
  value: string;
  disc: string;
  flag?: boolean;
  status: 'pending' | 'approved' | 'synced' | 'rejected' | 'sent-to-sales-admin';
  dismissing?: boolean;
  lpoAttached?: boolean;
  lpoFileName?: string;
}

// ===== Promo Requests (PM-reviewed larger campaigns) =====
export type PromoStatus = 'pending' | 'pm-approved' | 'rejected' | 'launched';

export interface PromoRequest {
  id: string;
  rep: string;
  title: string;
  product: string;
  channel: 'institution' | 'trade' | 'mobile-frontline' | string;
  scope: string;
  estimatedReach: number;
  budget: number;
  rationale: string;
  date: string;
  status: PromoStatus;
  dismissing?: boolean;
}

// ===== Itineraries (RSM) =====
export interface ItineraryPending {
  id: string;
  rep: string;
  area: string;
  week: string;
  visits: number;
  focus: string;
  highlights: string;
  submittedAt: string;
  plannedVisits?: RepVisit[];
  escalationStatus?: EscalationStatus;
  dismissing?: boolean;
}

export interface AdjustmentPending {
  id: string;
  rep: string;
  type: 'reroute' | 'add' | 'swap' | string;
  urgent?: boolean;
  todayUsed: number;
  visit: string;
  submittedAt: string;
  reason: string;
  escalationStatus?: EscalationStatus;
  dismissing?: boolean;
}

// ===== Rep view shapes =====
export interface RepVisitSummary {
  id: string;
  customer: string;
  type: 'institution' | 'trade' | 'retail' | string;
  time?: string;
  status: 'planned' | 'completed' | 'in-progress' | 'missed' | string;
  brick?: string;
  doctor?: string;
  notes?: string;
  productsDiscussed?: string[];
  orderPlaced?: boolean;
  value?: string;
  checkInAt?: string;
  checkOutAt?: string;
  gpsVerified?: boolean;
  auditSynced?: boolean;
}

export interface RepStats {
  visitsCompleted: number;
  visitsPlanned: number;
  ordersToday: number;
  orderValue: string;
  weekTarget: string;
  weekActual: string;
  attainment: number;
}

export interface ActiveVisit {
  id: string;
  customer: string;
  doctor?: string;
  type: string;
  brick?: string;
  status: 'checked-in' | 'in-progress' | 'completed' | string;
  checkInAt?: string;
  checkOutAt?: string;
  notes?: string;
  productsDiscussed?: string[];
  orderPlaced?: boolean;
  gpsVerified?: boolean;
  auditSynced?: boolean;
  location?: string;
}

export interface RepWeekDay {
  day: string;
  date: string;
  visits: number;
  customers: string[];
  brick?: string;
  status?: 'planned' | 'pending-adjust' | 'completed' | string;
}

// ===== Directives, inventory, accompaniments, clinical =====
export interface Directive {
  id: string;
  from: string;
  fromRole: string;
  title: string;
  message: string;
  product?: string;
  priority: 'high' | 'medium' | 'low' | string;
  date: string;
  acknowledged?: boolean;
  expiresOn?: string;
  region?: string;
  recipients?: number;
}

export interface CustomerInventoryRow {
  id: string;
  customer: string;
  product: string;
  onHand: number;
  weeksOfStock: number;
  lastChecked: string;
  rep: string;
  status?: 'healthy' | 'low' | 'out' | string;
}

export interface Accompaniment {
  id: string;
  rep: string;
  date: string;
  customer: string;
  product?: string;
  pmNotes?: string;
  rating?: number;
  observations?: string[];
  status: 'scheduled' | 'completed' | 'cancelled' | string;
}

export interface ClinicalMeeting {
  id: string;
  title: string;
  doctor: string;
  institution: string;
  date: string;
  attendees: number;
  organizer: string;
  product: string;
  status: 'proposed' | 'pm_approved' | 'mm_approved' | 'rejected' | string;
  budget: number;
  outcome?: string;
  pendingFor?: 'rsm' | 'pm' | 'mm' | string;
}

export interface ContentApproval {
  id: string;
  title: string;
  type: 'detail-aid' | 'leaflet' | 'video' | 'email-template' | string;
  submittedBy: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | string;
  thumbnail?: string;
  description?: string;
}

// ===== Dashboard stats =====
export interface DashboardStats {
  pendingCount: number;
}

// ===== Campaigns + ROI =====
// A campaign starts the moment marketing material is dispatched. Orders
// from attended/targeted HCPs within an attribution window count toward
// revenue; ROI is (revenue - spend) / spend.
export type CampaignChannel = 'institution' | 'trade' | 'mobile-frontline' | 'all';
export type CampaignStatus = 'active' | 'paused' | 'closed';

export interface Campaign {
  id: string;
  name: string;
  product: string;
  channel: CampaignChannel;
  owner: string;
  status: CampaignStatus;
  startedAt: string;
  attributionWindowDays: number;
  materialsCost: number;
  budgetSpent: number;
  linkedCMs: number;
  attendeesReached: number;
  attributedRevenue: number;
  regions?: string[];
}

export interface CampaignROI {
  spend: number;
  revenue: number;
  roiPct: number;
  status: 'green' | 'amber' | 'red';
}

// ===== Approval modal item shape (extended) =====
export interface ApprovalModalItem extends ApprovalItem {
  orderId?: string;
  items?: { n: string; q: number; p: string }[];
  requestedDiscount?: string;
  justification?: string;
  escalatedToNSM?: boolean;
}

// ===== Clinical row shape used by RSM/PM/MM clinical views =====
export type CMCostKind = 'venue' | 'refreshments' | 'samples' | 'print' | 'speaker' | 'transport' | 'other';

export interface CMCostLine {
  id: string;
  kind: CMCostKind;
  label: string;
  amount: number;
}

export type CMContentKind = 'slides' | 'pdf' | 'detail-aid' | 'video' | 'agenda';

export interface CMContentItem {
  id: string;
  kind: CMContentKind;
  name: string;
  size?: string;
  url?: string;
}

export interface ClinicalMeetingRow {
  id: string;
  t: string;
  hcp: string;
  rep: string;
  date: string;
  attendees: number;
  budget: string;
  s: 'pm-review' | 'hom-review' | 'approved' | string;
  hi?: boolean;
  dismissing?: boolean;
  materials?: CMCostLine[];
  content?: CMContentItem[];
  outcomeNotes?: string;
}

// ===== Rep visit / itinerary stop =====
export interface RepVisit {
  plannedProducts?: string[];
  id: number | string;
  name: string;
  contact?: string;
  time: string;
  fixedTime?: boolean; // HCP gave this slot — optimizer treats it as an anchor
  dist: string | number;
  day?: string;
  status: 'done' | 'next' | 'pending' | 'in-progress' | string;
  priority?: 'high' | 'medium' | 'low' | string;
  address?: string;
  role?: string;
  checkedIn?: boolean;
  // Set when this visit is the subject of a daily adjustment request.
  adjustmentStatus?: 'pending' | 'approved' | 'rejected';
}

// ===== Rep stats / dashboard =====
export interface RepDashboardStats {
  completed: number;
  planned: number;
  completionPct: number;
  remaining: number;
  ordersCount: number;
  ordersValue: string;
}

// ===== Week itinerary =====
export interface WeekItinerary {
  weekLabel: string;
  status: 'approved' | 'submitted' | string;
  approvedBy?: string;
  approvedAt?: string;
  submittedAt?: string;
  rsmNote?: string;
  escalationStatus?: EscalationStatus;
  adjustmentsUsedToday: number;
  adjustmentsLimit: number;
}

// ===== Rep active visit =====
export interface RepActiveVisit {
  id: number | string;
  name: string;
  contact?: string;
  address?: string;
  role?: string;
  checkedIn?: boolean;
  plannedProducts?: string[];
}

// ===== Rep order submission =====
export interface RepOrderItem {
  id: string;
  n: string;
  q: number;
  p: number;
  pack: string;
  stockStatus: 'in-stock' | 'out-of-stock' | string;
  stock: number;
}

export interface RepOrderSubmission {
  visit: RepActiveVisit | null;
  items: RepOrderItem[];
  discount: number;
  subtotal: number;
  total: number;
  requiresApproval: boolean;
  channel: 'booklet' | 'erp';
  lpoFileName?: string;
}

// ===== Directives (PM/Manager push) - extended shape used in the prototype =====
export type DirectiveKind = 'directive' | 'new-product';

export interface DirectiveRow {
  id: string;
  pm: string;
  title: string;
  message: string;
  date: string;
  acknowledged?: boolean;
  product?: string;
  region?: string;
  priority?: string;
  recipients?: number;
  expiresOn?: string;
  targetProduct?: string;
  status?: string;
  kind?: DirectiveKind;
}

// ===== Directive form (PM submits) =====
export interface DirectiveForm {
  title: string;
  message: string;
  targetProduct: string;
  priority: 'high' | 'normal' | string;
  kind?: DirectiveKind;
}

// ===== Accompaniment form (PM submits) =====
export interface AccompanimentForm {
  rep: string;
  territory: string;
  visitsShadowed: number;
  notes: string;
}

// ===== CME form (Rep submits) =====
export interface CMForm {
  topic: string;
  hcp: string;
  date: string;
  attendees: string;
  budget: string;
  highImpact: boolean;
}

// ===== Generic toast input (without id) =====
export interface ToastInput {
  type: 'success' | 'error' | 'info';
  title: string;
  msg?: string;
}

// ===== Authenticated user shape (extended from Persona) =====
export interface AuthUser extends Persona {
  signedInEmail: string;
  currentRole: PersonaKey;
}

// ===== Login data payload =====
export interface LoginData {
  email: string;
  signedInEmail?: string;
}

// ===== Customer inventory row (extended) =====
export interface CustomerInventoryItem {
  id: string;
  customer: string;
  product: string;
  stockOnHand: number;
  restockLevel: number;
  status: 'Low Stock' | 'Optimal' | 'Healthy' | 'Out of Stock' | string;
  recommendation?: string;
  rep?: string;
  lastChecked?: string;
  lastAudited?: string;
}

// ===== Adjustment request payload =====
export interface AdjustmentRequest {
  type: 'add' | 'swap' | 'reroute' | string;
  visit: RepVisit | null;
  reason: string;
  // For a swap: the call point the rep wants to visit instead.
  replacement?: { name: string; time: string; area?: string } | null;
}

// ===== Rep's own daily-adjustment record (drives the rep's adjustment cap) =====
export interface RepAdjustment {
  id: string;
  label: string;
  type: 'add' | 'swap' | 'reroute' | string;
  status: 'pending' | 'approved' | 'rejected';
  visitId?: number | string | null;
  // For a swap: the fully-formed visit that replaces visitId once approved.
  replacement?: RepVisit;
}

// ===== Visit Log (rep-visit form submission) =====
export type HcpType = 'Doctor' | 'Pharmacist' | 'Nurse' | 'Other';

export interface VisitLogAttendees {
  doctors: number;
  pharmacists: number;
  nurses: number;
  others: number;
}

export interface VisitLogLocation {
  latitude: number;
  longitude: number;
  isManual: boolean;
  address?: string;
}

export interface VisitLog {
  id: string;
  repId: string;
  repName: string;
  timestamp: string;
  activeVisitId?: number | string;
  hcpType: HcpType;
  hcpName: string;
  institution: string;
  specialty: string;
  email?: string;
  phone?: string;
  location: VisitLogLocation;
  productsDiscussed: string[];
  attendees: VisitLogAttendees;
  // Named non-doctor/pharmacist/nurse attendee groups (role + headcount).
  otherAttendees?: { label: string; count: number }[];
  summary: string;
  nextSteps: string;
  reminderDate?: string;
  // Optional competitor/market intel captured during the call. Omitted when the
  // rep left all three fields blank.
  marketIntel?: { competitor: string; promo: string; pricing: string };
  // Check-out capture (AC 2.6): location and time on leaving; time on site is the interval.
  checkOut?: { timestamp: string; latitude: number; longitude: number; isManual?: boolean };
  timeOnSiteMins?: number;
  // Share of the open-visit duration evidenced by periodic location sampling (AC 2.5).
  evidencedPct?: number;
}

export interface SubmittedDCR {
  id: string;
  rep: string;
  submittedAt: string;
  visitsCompleted: number;
  ordersToday: number;
  logs: VisitLog[];
  samples?: number;
  aiSummary?: string;
}

// ===== Customer Stock check (was Shelf Audit) =====
// One row per product at the customer. Reps can add rows for SKUs beyond the defaults.
export interface CustomerStockRow {
  product: string;
  units: string;
}

export type CustomerStockEntry = CustomerStockRow[];

// ===== Joint Call (PM-scheduled, forward-looking shadow visit) =====
export type JointCallStatus = 'scheduled' | 'completed' | 'cancelled';

export interface JointCall {
  id: string;
  rep: string;
  pm: string;
  division: string;
  region: string;
  territory: string;
  customer: string;
  product: string;
  scheduledFor: string;
  rationale?: string;
  status: JointCallStatus;
}

export interface JointCallForm {
  division: string;
  region: string;
  territory: string;
  rep: string;
  customer: string;
  product: string;
  scheduledFor: string;
  rationale: string;
}

// ===== Accompaniment (extended) =====
export interface AccompanimentRow {
  id: string;
  rep: string;
  date: string;
  customer?: string;
  product?: string;
  pm?: string;
  pmNotes?: string;
  rating?: number;
  observations?: string[];
  status?: 'scheduled' | 'completed' | 'cancelled' | 'synced' | string;
  visitsShadowed?: number;
  territory?: string;
  notes?: string;
}

// ===== Material (PM library) =====
export interface MaterialItem {
  id: number;
  n: string;
  v: string;
  size: string;
  updated: string;
  cat: 'Clinical' | 'Detailing' | 'Competitive' | 'Marketing' | string;
  pushed: number;
  opened: number;
  new?: boolean;
}

// ===== Content approval (extended row) =====
export interface ContentApprovalRow {
  id: string;
  material: string;
  pm: string;
  cat: string;
  format?: string;
  target?: string;
  budget?: string;
  submitted?: string;
  note?: string;
  status: 'pending' | 'approved' | 'rejected' | string;
  urgent?: boolean;
  dismissing?: boolean;
}

// ===== Escalated approval row (DM) =====
export interface EscalatedApproval {
  id: string;
  rep: string;
  src: string;
  cust: string;
  value: string;
  disc: string;
  urgent?: boolean;
  ai?: 'recommend-approve' | 'recommend-review' | string;
  dismissing?: boolean;
}

// ===== Role nav items grouping =====
export interface RoleNavItem {
  k: string;
  i: IconName;
  l: string;
  badge?: number;
  live?: boolean;
}

// ===== Status pill for role sidebar =====
export interface StatusPill {
  label: string;
  detail: string;
}
