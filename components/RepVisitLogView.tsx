import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Icon from './Icon';
import SignaturePad from './SignaturePad';
import AddContactSheet from './AddContactSheet';
import { STATUS_STYLE } from './ComplaintsView';
import { PRODUCT_CATALOG } from '../assets/products';
import { REP_OWNER, type Lead } from '../assets/leads';
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_SEVERITIES,
  INTEL_CATEGORIES,
  SAMPLE_BATCHES,
  SAMPLE_LIMITS,
  SLA_HOURS,
  fmtShortDate,
  historyFor,
  isRetailOutlet,
  sampleTotal,
  useFieldCall,
  type CallRecord,
  type IntelCategory,
  type StockLevel,
  type VisitDraft,
} from '../stores/fieldCall';
import type {
  HcpType,
  IconName,
  RepActiveVisit,
  VisitLog,
  VisitLogAttendees,
} from '../types';

interface RepVisitLogViewProps {
  activeVisit: RepActiveVisit | null;
  visitLogs: VisitLog[];
  currentUserId: string;
  currentUserName: string;
  onLogVisit: (log: VisitLog) => void;
  onCompleteVisit: (id: string | number) => void;
  onPlaceOrder: (visit: RepActiveVisit) => void;
  onNavigate: (view: string) => void;
  onAddLead: (lead: Lead) => void;
  leads?: Lead[];
}

type VoicePhase = 'recording' | 'transcribing' | 'structuring';

// What the rep "said" · the scripted transcript the demo plays back.
const VOICE_TRANSCRIPT =
  "saw dr adebayo at the paediatric ward, detailed coflin forte and tuxil-n, he'll take a trial if pricing works, gsk pushing augmentin at fifteen percent trade discount, also met dr ngozi okeke the consultant paediatrician, drop samples next week";

const HCP_TYPES: { v: HcpType; l: string; i: IconName }[] = [
  { v: 'Doctor', l: 'Doctor', i: 'pill' },
  { v: 'Pharmacist', l: 'Pharmacist', i: 'package' },
  { v: 'Nurse', l: 'Nurse', i: 'users' },
  { v: 'Other', l: 'Other', i: 'helpCircle' },
];

const ATTENDEE_KEYS: { key: keyof VisitLogAttendees; label: string; icon: IconName }[] = [
  { key: 'doctors', label: 'Doctors', icon: 'pill' },
  { key: 'pharmacists', label: 'Pharmacists', icon: 'package' },
  { key: 'nurses', label: 'Nurses', icon: 'users' },
  { key: 'others', label: 'Others', icon: 'helpCircle' },
];

// Fixed-cadre counters (the +/- boxes). "Others" is captured separately as
// named groups so reps can specify exactly who else attended.
const COUNTER_KEYS = ATTENDEE_KEYS.filter(k => k.key !== 'others');

const STOCK_LEVELS: { v: StockLevel; l: string; on: string }[] = [
  { v: 'in', l: 'In stock', on: 'bg-leaf-500 text-white border-leaf-500' },
  { v: 'low', l: 'Low', on: 'bg-amber-500 text-white border-amber-500' },
  { v: 'out', l: 'Out', on: 'bg-rose-600 text-white border-rose-600' },
];

const SHELF_CHECKS: { key: 'facings' | 'planogram' | 'priceTag'; label: string; hint: string }[] = [
  { key: 'facings', label: 'Facings to standard', hint: 'At least 3 facings per SKU' },
  { key: 'planogram', label: 'Planogram followed', hint: 'Respiratory bay, eye level' },
  { key: 'priceTag', label: 'Price tag visible', hint: 'Shelf strip or sticker shows the price' },
];

const emptyAttendees = (): VisitLogAttendees => ({ doctors: 1, pharmacists: 0, nurses: 0, others: 0 });

function freshDraft(visit: RepActiveVisit | null): VisitDraft {
  const history = visit ? historyFor(visit.name) : [];
  const last = history[0];
  const retail = visit ? isRetailOutlet(visit.name, visit.role) : false;
  const planned = visit?.plannedProducts ?? [];
  return {
    checkedIn: !!visit?.checkedIn,
    checkInAt: visit?.checkedIn ? Date.now() : null,
    checkInLabel: '',
    location: null,
    manualLocation: false,
    hcpType: last?.hcpType ?? (retail ? 'Pharmacist' : 'Doctor'),
    hcpName: last?.hcpName ?? '',
    institution: visit?.name ?? '',
    specialty: last?.specialty ?? '',
    email: '',
    phone: '',
    products: Array.from(new Set([...planned, ...(last?.products ?? [])])),
    attendees: retail ? { doctors: 0, pharmacists: 1, nurses: 0, others: 0 } : emptyAttendees(),
    otherGroups: [],
    summary: last ? `Followed up on the ${fmtShortDate(last.date)} call: ${last.nextStep} ` : '',
    nextSteps: '',
    competitorBrand: '',
    competitorPromo: '',
    competitorPricing: '',
    intelCategories: [],
    reminderDate: '',
    retailAuditOn: retail,
    retailAudit: { stock: {}, facings: false, planogram: false, priceTag: false, posUp: null },
    samples: [],
    signature: null,
    complaintIds: [],
    complaintDraft: { category: 'Product quality', severity: 'Medium', product: planned[0] ?? PRODUCT_CATALOG[0].name, batch: '', description: '' },
    prefilledFrom: history.length,
    prefillReviewed: false,
    prefillBannerOpen: true,
  };
}

interface CardProps {
  title: string;
  icon: IconName;
  iconClass?: string;
  badge?: ReactNode;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}

function Card({ title, icon, iconClass = 'text-navy-700', badge, open, onToggle, children }: CardProps) {
  return (
    <div className="rounded-2xl bg-white border border-navy-100">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full px-5 py-3.5 flex items-center justify-between gap-2 text-left"
      >
        <span className="flex items-center gap-2 min-w-0">
          <Icon name={icon} size={14} className={`${iconClass} flex-shrink-0`} />
          <span className="stat-label text-navy-400 truncate">{title}</span>
        </span>
        <span className="flex items-center gap-2 flex-shrink-0">
          {badge}
          <Icon name={open ? 'chevronUp' : 'chevronDown'} size={16} className="text-navy-400" />
        </span>
      </button>
      {open && <div className="px-5 pb-5 -mt-1">{children}</div>}
    </div>
  );
}

const pill = (text: string, tone = 'bg-navy-50 text-navy-700') => (
  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tone}`}>{text}</span>
);

export default function RepVisitLogView({
  activeVisit,
  visitLogs,
  currentUserId,
  currentUserName,
  onLogVisit,
  onCompleteVisit,
  onPlaceOrder,
  onNavigate,
  onAddLead,
  leads,
}: RepVisitLogViewProps) {
  const fc = useFieldCall();
  const visitKey = activeVisit ? String(activeVisit.id) : '';
  const [d, setD] = useState<VisitDraft>(() => (visitKey && fc.drafts[visitKey]) || freshDraft(activeVisit));
  const set = (patch: Partial<VisitDraft>) => setD(prev => ({ ...prev, ...patch }));
  const loadedKey = useRef(visitKey);
  const resumed = useRef(!!(visitKey && fc.drafts[visitKey]));

  const [loadingLoc, setLoadingLoc] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hcpSuggestOpen, setHcpSuggestOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [productQuery, setProductQuery] = useState('');
  const [openCards, setOpenCards] = useState<Record<string, boolean>>({ hcp: true, products: true, conversation: true, retail: true });
  const [complaintFlash, setComplaintFlash] = useState('');
  const [posFlash, setPosFlash] = useState(false);

  // Scripted voice dictation
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voicePhase, setVoicePhase] = useState<VoicePhase | null>(null);
  const [recordSecs, setRecordSecs] = useState(0);
  const [voiceFilled, setVoiceFilled] = useState(false);

  // New contact met → pipeline intake
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactAdded, setContactAdded] = useState(false);
  const [contactSheetOpen, setContactSheetOpen] = useState(false);
  const [contactNote, setContactNote] = useState('');

  const toggleCard = (k: string) => setOpenCards(prev => ({ ...prev, [k]: !prev[k] }));

  // Switching to another visit loads its saved draft, or a fresh pre-filled one.
  useEffect(() => {
    if (!activeVisit || loadedKey.current === visitKey) return;
    loadedKey.current = visitKey;
    resumed.current = !!fc.drafts[visitKey];
    setD(fc.drafts[visitKey] ?? freshDraft(activeVisit));
  }, [visitKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Every edit is kept in the store so leaving the screen mid-visit loses nothing.
  useEffect(() => {
    if (activeVisit && !submitting) fc.saveDraft(visitKey, d);
  }, [d]); // eslint-disable-line react-hooks/exhaustive-deps

  const productSuggestions = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    const base = PRODUCT_CATALOG.filter(p => !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    return base.slice(0, 8);
  }, [productQuery]);

  const hcpDirectory = useMemo(() => {
    const seen = new Map<string, { name: string; hcpType: HcpType; institution: string; specialty: string; email?: string; phone?: string; lastSeen: string }>();
    for (const log of visitLogs) {
      const key = log.hcpName.trim().toLowerCase();
      if (!key) continue;
      const prior = seen.get(key);
      if (!prior || new Date(log.timestamp).getTime() > new Date(prior.lastSeen).getTime()) {
        seen.set(key, {
          name: log.hcpName,
          hcpType: log.hcpType,
          institution: log.institution,
          specialty: log.specialty,
          email: log.email,
          phone: log.phone,
          lastSeen: log.timestamp,
        });
      }
    }
    return Array.from(seen.values());
  }, [visitLogs]);

  const hcpSuggestions = useMemo(() => {
    const q = d.hcpName.trim().toLowerCase();
    if (!q) return hcpDirectory.slice(0, 6);
    return hcpDirectory.filter(x => x.name.toLowerCase().includes(q)).slice(0, 6);
  }, [hcpDirectory, d.hcpName]);

  const history = useMemo(() => (activeVisit ? historyFor(activeVisit.name) : []), [activeVisit]);

  useEffect(() => {
    if (voicePhase !== 'recording') return;
    const t = window.setInterval(() => setRecordSecs(s => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [voicePhase]);

  const todayStr = new Date().toDateString();
  const existingDailyStats = useMemo<VisitLogAttendees>(() => {
    return visitLogs
      .filter(v => v.repId === currentUserId && new Date(v.timestamp).toDateString() === todayStr)
      .reduce(
        (acc, v) => ({
          doctors: acc.doctors + v.attendees.doctors,
          pharmacists: acc.pharmacists + v.attendees.pharmacists,
          nurses: acc.nurses + v.attendees.nurses,
          others: acc.others + v.attendees.others,
        }),
        { doctors: 0, pharmacists: 0, nurses: 0, others: 0 },
      );
  }, [visitLogs, currentUserId, todayStr]);

  if (!activeVisit) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        <div className="rounded-2xl bg-white border border-navy-100 p-12 text-center fade-up">
          <div className="w-16 h-16 rounded-2xl bg-navy-50 mx-auto flex items-center justify-center mb-4">
            <Icon name="location" size={28} className="text-navy-400" />
          </div>
          <h3 className="font-display text-xl font-bold text-ink">No active visit</h3>
          <p className="text-sm text-navy-500 mt-2 mb-6">Open your itinerary to start your next visit</p>
          <button
            onClick={() => onNavigate('rep-plan')}
            className="px-5 py-2.5 rounded-xl bg-navy-700 text-white text-sm font-semibold btn-press"
          >
            View Today's Plan
          </button>
        </div>
      </div>
    );
  }

  const isRetailCall = isRetailOutlet(activeVisit.name, activeVisit.role) || d.hcpType === 'Pharmacist';
  const visitComplaints = fc.complaints.filter(c => d.complaintIds.includes(c.id));
  const samplesThisVisit = sampleTotal(d.samples);
  const auditSkus = Array.from(new Set([...d.products, ...PRODUCT_CATALOG.map(p => p.name)]));
  const auditScore = [d.retailAudit.facings, d.retailAudit.planogram, d.retailAudit.priceTag, d.retailAudit.posUp === true].filter(Boolean).length;

  const toggleProduct = (name: string) => {
    set({ products: d.products.includes(name) ? d.products.filter(p => p !== name) : [...d.products, name] });
  };

  const startDictation = () => {
    setVoiceFilled(false);
    setRecordSecs(0);
    setVoicePhase('recording');
    setVoiceOpen(true);
  };

  const cancelDictation = () => {
    setVoiceOpen(false);
    setVoicePhase(null);
  };

  // Scripted: transcribe -> structure -> drop the parsed fields into the form.
  const stopDictation = () => {
    setVoicePhase('transcribing');
    window.setTimeout(() => setVoicePhase('structuring'), 1300);
    window.setTimeout(() => {
      applyVoiceFill();
      setVoiceOpen(false);
      setVoicePhase(null);
      setVoiceFilled(true);
    }, 2600);
  };

  const applyVoiceFill = () => {
    const focus = PRODUCT_CATALOG.filter(p => p.focus).slice(0, 2).map(p => p.name);
    const picked = focus.length ? focus : PRODUCT_CATALOG.slice(0, 2).map(p => p.name);
    setD(prev => ({
      ...prev,
      hcpType: 'Doctor',
      hcpName: 'Dr. T. Adebayo',
      specialty: 'Paediatrics',
      products: Array.from(new Set([...prev.products, ...picked])),
      summary: 'Detailed Coflin Forte and Tuxil-N on the paediatric ward. Dr. Adebayo is open to a trial if pricing works. Receptive overall.',
      nextSteps: 'Drop paediatric samples next week and follow up on pricing.',
      competitorBrand: 'GSK · Augmentin',
      competitorPromo: '15% trade discount',
      competitorPricing: 'Augmentin pushed at ~15% trade discount on the ward.',
      intelCategories: Array.from(new Set<IntelCategory>([...prev.intelCategories, 'Pricing', 'Promotion'])),
      attendees: { ...prev.attendees, doctors: Math.max(prev.attendees.doctors, 1) },
    }));
    // Pre-fill the new-contact card with the extra person mentioned in the note.
    setContactName('Dr. Ngozi Okeke');
    setContactRole('Consultant Paediatrician');
    setContactPhone('');
    setContactAdded(false);
  };

  const clearPrefill = () => {
    set({
      hcpName: '',
      specialty: '',
      products: activeVisit.plannedProducts ?? [],
      summary: '',
      prefilledFrom: 0,
      prefillBannerOpen: false,
    });
  };

  const addContactToPipeline = () => {
    if (!contactName.trim()) return;
    if (leads) { setContactSheetOpen(true); return; }
    const lead: Lead = {
      id: `ld-${Date.now()}`,
      name: contactName.trim(),
      role: contactRole.trim() || 'Contact',
      org: d.institution || activeVisit.name || 'Field contact',
      channel: 'HCP',
      territory: 'Lekki Cluster',
      region: 'South-West',
      repName: REP_OWNER,
      phone: contactPhone.trim() || undefined,
      stage: 'captured',
      completeness: 30,
      consent: false,
      enriched: false,
      metContext: `Met during the ${d.institution || activeVisit.name || 'field'} visit`,
      source: 'Visit-log attendee',
      timeline: [{ date: 'Just now', title: 'Captured in the field', detail: 'Added from visit-log attendees' }],
    };
    onAddLead(lead);
    setContactAdded(true);
    setContactName('');
    setContactRole('');
    setContactPhone('');
  };

  const adjustAttendee = (key: keyof VisitLogAttendees, delta: number) => {
    set({ attendees: { ...d.attendees, [key]: Math.max(0, d.attendees[key] + delta) } });
  };

  const othersThisVisit = d.otherGroups.reduce((s, g) => s + g.count, 0);
  const addOtherGroup = () => set({ otherGroups: [...d.otherGroups, { label: '', count: 1 }] });
  const updateOtherLabel = (idx: number, label: string) => set({ otherGroups: d.otherGroups.map((g, i) => (i === idx ? { ...g, label } : g)) });
  const adjustOtherCount = (idx: number, delta: number) => set({ otherGroups: d.otherGroups.map((g, i) => (i === idx ? { ...g, count: Math.max(0, g.count + delta) } : g)) });
  const removeOtherGroup = (idx: number) => set({ otherGroups: d.otherGroups.filter((_, i) => i !== idx) });

  // Samples · capped by what is left of this month's allocation.
  const leftFor = (sku: string, exceptId?: string) => {
    const a = fc.sampleAllowance(currentUserName, sku);
    const inDraft = d.samples.filter(s => s.sku === sku && s.id !== exceptId).reduce((n, s) => n + s.qty, 0);
    return { ...a, left: Math.max(0, a.left - inDraft) };
  };
  const addSampleLine = () => {
    const sku = d.products.find(p => SAMPLE_LIMITS[p]) ?? PRODUCT_CATALOG[0].name;
    set({ samples: [...d.samples, { id: `sm-${Date.now()}`, sku, batch: SAMPLE_BATCHES[sku]?.[0] ?? '', qty: Math.min(2, leftFor(sku).left), recipient: d.hcpName }] });
    setOpenCards(prev => ({ ...prev, samples: true }));
  };
  const updateSample = (id: string, patch: Partial<VisitDraft['samples'][number]>) => {
    set({
      samples: d.samples.map(s => {
        if (s.id !== id) return s;
        const next = { ...s, ...patch };
        if (patch.sku && patch.sku !== s.sku) next.batch = SAMPLE_BATCHES[patch.sku]?.[0] ?? '';
        next.qty = Math.max(0, Math.min(next.qty, leftFor(next.sku, id).left));
        return next;
      }),
    });
  };
  const removeSample = (id: string) => set({ samples: d.samples.filter(s => s.id !== id) });

  const setStock = (sku: string, level: StockLevel) => set({ retailAudit: { ...d.retailAudit, stock: { ...d.retailAudit.stock, [sku]: level } } });
  const toggleIntel = (c: IntelCategory) => set({ intelCategories: d.intelCategories.includes(c) ? d.intelCategories.filter(x => x !== c) : [...d.intelCategories, c] });

  const submitComplaint = () => {
    const cd = d.complaintDraft;
    if (!cd.description.trim()) return;
    const c = fc.logComplaint({
      repName: currentUserName,
      customer: activeVisit.name,
      hcpName: d.hcpName || activeVisit.contact || '',
      category: cd.category,
      severity: cd.category === 'Adverse event' && (cd.severity === 'Low' || cd.severity === 'Medium') ? 'High' : cd.severity,
      product: cd.product,
      batch: cd.batch.trim(),
      description: cd.description.trim(),
      visitId: visitKey,
    });
    set({
      complaintIds: [...d.complaintIds, c.id],
      complaintDraft: { ...cd, batch: '', description: '' },
    });
    setComplaintFlash(c.category === 'Adverse event'
      ? `${c.id} logged as an adverse event. Your RSM must refer it to Pharmacovigilance within 24h.`
      : `${c.id} logged. Your RSM is notified · ${SLA_HOURS[c.severity]}h SLA.`);
  };

  const handleGetLocation = () => {
    setLoadingLoc(true);
    set({ manualLocation: false });
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          set({ location: { lat: position.coords.latitude, lng: position.coords.longitude } });
          setLoadingLoc(false);
        },
        () => {
          set({ manualLocation: true });
          setLoadingLoc(false);
        },
        { timeout: 10000, enableHighAccuracy: false },
      );
    } else {
      set({ manualLocation: true });
      setLoadingLoc(false);
    }
  };

  const handleCheckIn = () => {
    const now = new Date();
    set({ checkedIn: true, checkInAt: now.getTime(), checkInLabel: now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!d.location && !d.manualLocation) return;
    if (submitting) return;
    setSubmitting(true);

    const intelOn = d.competitorBrand.trim() || d.competitorPromo.trim() || d.competitorPricing.trim() || d.intelCategories.length > 0;
    const issued = d.samples.filter(s => s.qty > 0);
    const log: VisitLog & { fieldCall: CallRecord } = {
      id: `vl-${Date.now()}`,
      repId: currentUserId,
      repName: currentUserName,
      timestamp: new Date().toISOString(),
      activeVisitId: activeVisit.id,
      hcpType: d.hcpType,
      hcpName: d.hcpName,
      institution: d.institution,
      specialty: d.specialty,
      email: d.email || undefined,
      phone: d.phone || undefined,
      location: d.location
        ? { latitude: d.location.lat, longitude: d.location.lng, isManual: false }
        : { latitude: 0, longitude: 0, isManual: true, address: 'Offline Entry' },
      productsDiscussed: d.products,
      attendees: { ...d.attendees, others: othersThisVisit },
      otherAttendees: d.otherGroups.filter(g => g.label.trim() && g.count > 0),
      summary: d.summary,
      nextSteps: d.nextSteps,
      reminderDate: d.reminderDate ? new Date(d.reminderDate).toISOString() : undefined,
      checkOut: d.location
        ? { timestamp: new Date().toISOString(), latitude: d.location.lat, longitude: d.location.lng }
        : { timestamp: new Date().toISOString(), latitude: 0, longitude: 0, isManual: true },
      timeOnSiteMins: d.checkInAt ? Math.max(1, Math.round((Date.now() - d.checkInAt) / 60000)) : 34,
      // ponytail: scripted evidence share; the real engine computes it from sampled pings
      evidencedPct: d.manualLocation ? 0 : 92,
      marketIntel: intelOn
        ? { competitor: d.competitorBrand.trim(), promo: d.competitorPromo.trim(), pricing: d.competitorPricing.trim() }
        : undefined,
      fieldCall: {
        logId: '',
        visitId: visitKey,
        repName: currentUserName,
        timestamp: new Date().toISOString(),
        checkInAt: d.checkInAt ? new Date(d.checkInAt).toISOString() : undefined,
        institution: d.institution,
        hcpName: d.hcpName,
        samples: issued,
        intelCategories: d.intelCategories,
        retailAudit: d.retailAuditOn ? d.retailAudit : undefined,
        signature: d.signature,
        complaintIds: d.complaintIds,
      },
    };
    log.fieldCall.logId = log.id;

    fc.addRecord(log.fieldCall);
    fc.clearDraft(visitKey);
    onLogVisit(log);
    onCompleteVisit(activeVisit.id);
  };

  const prefillPending = d.prefilledFrom > 0 && !d.prefillReviewed;
  const canSubmit = d.checkedIn && (d.location !== null || d.manualLocation) && d.hcpName && d.institution && d.summary && d.nextSteps && d.products.length > 0 && !prefillPending;
  const checkInStatusLine = d.checkedIn
    ? (d.manualLocation
        ? 'Offline · location unverified'
        : d.location
          ? `${d.location.lat.toFixed(5)}, ${d.location.lng.toFixed(5)}`
          : 'Checked in · GPS pending')
    : 'Awaiting check-in';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      <div className="fade-up flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${d.checkedIn ? 'bg-leaf-500' : 'bg-navy-300'}`}>
            <Icon name="checkCircle" size={20} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`text-[10px] font-bold tracking-wider uppercase ${d.checkedIn ? 'text-leaf-700' : 'text-navy-500'}`}>
                {d.checkedIn ? `Checked In · ${d.checkInLabel || 'now'}` : 'Awaiting Check-in'}
              </p>
              {d.checkedIn && <div className="w-1.5 h-1.5 rounded-full bg-leaf-500 pulse-dot" />}
              {d.checkedIn && <span className="text-[9px] font-bold tracking-wider uppercase text-navy-400">Screen awake · GPS sampling</span>}
            </div>
            <h2 className="font-display text-xl font-bold text-ink">{activeVisit.name}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs text-navy-500 font-mono">{checkInStatusLine}</p>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider ${isRetailCall ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-sky-50 text-sky-700 border border-sky-200'}`}>
                {isRetailCall ? 'TRADE / FRONTLINE CALL' : 'INSTITUTIONAL CALL'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={startDictation}
            className="px-4 py-2 rounded-lg bg-navy-700 text-white text-sm font-bold flex items-center gap-1.5 btn-press"
          >
            <Icon name="mic" size={14} /> Dictate Visit
          </button>
          <button
            type="button"
            onClick={() => onPlaceOrder(activeVisit)}
            className="px-4 py-2 rounded-lg bg-leaf-500 text-white text-sm font-bold flex items-center gap-1.5 btn-press"
          >
            <Icon name="cart" size={14} /> Place Order
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 fade-up stagger-1 space-y-4">
          {resumed.current && (
            <div className="rounded-xl bg-sky-50 border border-sky-200 px-4 py-2.5 flex items-center gap-2">
              <Icon name="refresh" size={14} className="text-sky-700 flex-shrink-0" />
              <p className="text-xs text-sky-800 flex-1">Draft restored · everything you entered before leaving this visit is still here.</p>
              <button type="button" onClick={() => { resumed.current = false; set({}); }} className="text-sky-700 hover:text-sky-900" aria-label="Dismiss">
                <Icon name="x" size={14} />
              </button>
            </div>
          )}

          {d.prefilledFrom > 0 && d.prefillBannerOpen && (
            <div className={`rounded-2xl border p-4 ${d.prefillReviewed ? 'bg-leaf-50 border-leaf-200' : 'bg-amber-50 border-amber-200'}`}>
              <div className="flex items-start gap-3">
                <Icon name="refresh" size={18} className={`flex-shrink-0 mt-0.5 ${d.prefillReviewed ? 'text-leaf-700' : 'text-amber-700'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${d.prefillReviewed ? 'text-leaf-800' : 'text-amber-900'}`}>
                    Pre-filled from your last {d.prefilledFrom} visit{d.prefilledFrom > 1 ? 's' : ''} · review before saving
                  </p>
                  <p className={`text-xs mt-0.5 ${d.prefillReviewed ? 'text-leaf-700' : 'text-amber-800'}`}>
                    HCP, products and a summary stub came from history. Nothing is saved until you check out.
                  </p>
                  <div className="mt-3 space-y-1.5">
                    {history.map((h, i) => (
                      <div key={i} className="rounded-lg bg-white/70 border border-white px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-ink truncate">{fmtShortDate(h.date)} · {h.hcpName}</p>
                          <p className="text-[10px] text-navy-500 truncate">{h.products.join(', ')}</p>
                        </div>
                        <p className="text-[11px] text-navy-600 mt-0.5">Next step agreed: {h.nextStep}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <label className="flex items-center gap-2 text-xs font-semibold text-ink cursor-pointer">
                      <input type="checkbox" checked={d.prefillReviewed} onChange={e => set({ prefillReviewed: e.target.checked })} className="accent-leaf-500 w-4 h-4" />
                      I have reviewed the pre-filled details
                    </label>
                    <button type="button" onClick={clearPrefill} className="ml-auto px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-amber-800 text-[11px] font-bold btn-press">
                      Clear pre-fill
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {voiceFilled && (
            <div className="rounded-2xl bg-navy-700 text-white p-4 flex items-start gap-3 relative overflow-hidden">
              <div className="absolute inset-0 ai-shimmer" />
              <div className="relative flex items-start gap-3 w-full">
                <Icon name="sparkles" size={18} className="text-leaf-300 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-bold">Drafted from your voice note</p>
                  <p className="text-xs text-white/80 mt-0.5">HCP, products, summary, next steps and competitor intel were filled in. Review and edit before saving.</p>
                </div>
                <button type="button" onClick={() => setVoiceFilled(false)} className="text-white/60 hover:text-white flex-shrink-0">
                  <Icon name="x" size={16} />
                </button>
              </div>
            </div>
          )}

          {/* GPS panel */}
          <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden">
            <div
              className={`relative ${d.manualLocation ? 'bg-amber-50' : 'map-bg'}`}
              style={{ height: '120px' }}
            >
              <div className="absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}>
                {d.manualLocation ? (
                  <div className="w-14 h-14 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
                    <Icon name="alert" size={24} className="text-white" />
                  </div>
                ) : (
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${d.location ? 'bg-leaf-500 gps-pulse' : 'bg-navy-400'}`}>
                    <Icon name="location" size={24} className="text-white" />
                  </div>
                )}
              </div>
              <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-white shadow-sm">
                <p className={`text-[11px] font-bold ${d.manualLocation ? 'text-amber-700' : d.location ? 'text-leaf-700' : 'text-navy-500'}`}>
                  {d.manualLocation ? 'Offline Mode' : d.location ? 'GPS captured' : 'Within 50m of target'}
                </p>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">Location Verification</p>
                  {d.manualLocation ? (
                    <p className="text-sm text-amber-700 font-semibold mt-1">Manual / offline entry · location unverified</p>
                  ) : d.location ? (
                    <p className="text-sm text-ink font-mono mt-1">{d.location.lat.toFixed(5)}, {d.location.lng.toFixed(5)}</p>
                  ) : (
                    <p className="text-sm text-navy-500 italic mt-1">Not checked in</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!d.checkedIn && (
                    <button
                      type="button"
                      onClick={() => { handleGetLocation(); handleCheckIn(); }}
                      disabled={loadingLoc}
                      className="px-4 py-2 rounded-xl bg-leaf-500 hover:bg-leaf-600 text-white text-sm font-bold flex items-center gap-1.5 btn-press shadow-lg shadow-leaf-500/30"
                    >
                      {loadingLoc ? <Icon name="refresh" size={14} /> : <Icon name="checkCircle" size={14} strokeWidth={2.5} />}
                      {loadingLoc ? 'Acquiring…' : 'Check In (GPS)'}
                    </button>
                  )}
                  {d.checkedIn && !d.manualLocation && (
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={loadingLoc}
                      className="px-3 py-2 rounded-lg border border-navy-200 text-navy-700 text-xs font-semibold flex items-center gap-1.5 btn-press"
                    >
                      <Icon name="refresh" size={12} /> {loadingLoc ? 'Acquiring…' : 'Update GPS'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => { set({ manualLocation: true, location: null }); if (!d.checkedIn) handleCheckIn(); }}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 btn-press ${d.manualLocation ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'border border-navy-200 text-navy-700'}`}
                  >
                    <Icon name="alert" size={12} /> Offline Mode
                  </button>
                </div>
              </div>
              {d.manualLocation && (
                <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  Network unavailable. Your visit will be flagged as unverified for compliance review.
                </p>
              )}
            </div>
          </div>

          {/* HCP details */}
          <Card
            title="HCP Details"
            icon="users"
            open={!!openCards.hcp}
            onToggle={() => toggleCard('hcp')}
            badge={d.hcpName ? pill(d.hcpName) : pill('Required', 'bg-amber-50 text-amber-700')}
          >
            <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase mb-2">HCP Type</p>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {HCP_TYPES.map(t => {
                const active = d.hcpType === t.v;
                return (
                  <button
                    key={t.v}
                    type="button"
                    onClick={() => set({ hcpType: t.v })}
                    className={`p-2.5 rounded-xl border-2 transition-all btn-press flex flex-col items-center gap-1 ${
                      active
                        ? 'bg-navy-700 border-navy-700 text-white'
                        : 'bg-paper border-navy-100 text-navy-700 hover:border-navy-300'
                    }`}
                  >
                    <Icon name={t.i} size={16} />
                    <span className="text-[11px] font-bold">{t.l}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <label className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">HCP Name</label>
                <input
                  type="text"
                  required
                  value={d.hcpName}
                  onChange={e => { set({ hcpName: e.target.value }); setHcpSuggestOpen(true); }}
                  onFocus={() => setHcpSuggestOpen(true)}
                  onBlur={() => setTimeout(() => setHcpSuggestOpen(false), 120)}
                  placeholder={hcpDirectory.length > 0 ? 'Start typing · past HCPs will appear' : 'e.g. Dr. T. Adebayo'}
                  autoComplete="off"
                  className="input-field w-full mt-1 px-3 py-2 rounded-lg bg-paper border border-navy-100 text-sm text-ink"
                />
                {hcpSuggestOpen && hcpSuggestions.length > 0 && (
                  <div className="absolute z-20 left-0 right-0 mt-1 rounded-xl bg-white border border-navy-100 shadow-lg overflow-hidden">
                    <p className="px-3 py-1.5 text-[9px] font-bold text-navy-400 tracking-wider uppercase bg-paper border-b border-navy-100">From your past logs</p>
                    <div className="max-h-56 overflow-y-auto divide-y divide-navy-50">
                      {hcpSuggestions.map(s => (
                        <button
                          key={s.name + s.institution}
                          type="button"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => {
                            set({
                              hcpName: s.name,
                              hcpType: s.hcpType,
                              specialty: d.specialty || s.specialty,
                              email: d.email || s.email || '',
                              phone: d.phone || s.phone || '',
                            });
                            setHcpSuggestOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-paper transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-display font-semibold text-sm text-ink truncate">{s.name}</p>
                            <span className="px-1.5 py-0.5 rounded bg-navy-50 text-navy-700 text-[9px] font-bold flex-shrink-0">{s.hcpType.toUpperCase()}</span>
                          </div>
                          <p className="text-[10px] text-navy-500 truncate">{s.specialty || ' · '}{s.institution ? ` · ${s.institution}` : ''}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">Specialty</label>
                <input
                  type="text"
                  value={d.specialty}
                  onChange={e => set({ specialty: e.target.value })}
                  className="input-field w-full mt-1 px-3 py-2 rounded-lg bg-paper border border-navy-100 text-sm text-ink"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">Institution</label>
                <div
                  title="Locked to this visit's call point"
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-navy-50 border border-navy-100 text-sm text-ink flex items-center justify-between gap-2 cursor-not-allowed"
                >
                  <span className="truncate font-medium">{d.institution || ' · '}</span>
                  <span className="flex items-center gap-1 text-[10px] text-navy-400 flex-shrink-0 uppercase tracking-wider font-bold">
                    <Icon name="lock" size={11} /> Fixed
                  </span>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">Phone</label>
                <input
                  type="tel"
                  value={d.phone}
                  onChange={e => set({ phone: e.target.value })}
                  placeholder="080…"
                  className="input-field w-full mt-1 px-3 py-2 rounded-lg bg-paper border border-navy-100 text-sm text-ink"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">Email</label>
                <input
                  type="email"
                  value={d.email}
                  onChange={e => set({ email: e.target.value })}
                  placeholder="doctor@hospital.com"
                  className="input-field w-full mt-1 px-3 py-2 rounded-lg bg-paper border border-navy-100 text-sm text-ink"
                />
              </div>
            </div>
          </Card>

          {/* Products */}
          <Card
            title="Products Detailed"
            icon="pill"
            open={!!openCards.products}
            onToggle={() => toggleCard('products')}
            badge={pill(`${d.products.length} selected`, d.products.length ? 'bg-navy-50 text-navy-700' : 'bg-amber-50 text-amber-700')}
          >
            <p className="text-[11px] text-navy-500 mb-3">
              {(activeVisit.plannedProducts?.length ?? 0) > 0 || d.prefilledFrom > 0
                ? 'Pre-filled from your plan and past calls. Add or remove from the dropdown.'
                : 'No products were planned for this visit · pick what you actually detailed.'}
            </p>

            <div className="relative">
              <div className="w-full px-3 py-2 rounded-lg bg-paper border border-navy-100 flex items-center gap-2">
                <Icon name="search" size={14} className="text-navy-400 flex-shrink-0" />
                <input
                  type="text"
                  value={productQuery}
                  onChange={e => { setProductQuery(e.target.value); setProductsOpen(true); }}
                  onFocus={() => setProductsOpen(true)}
                  onBlur={() => setTimeout(() => setProductsOpen(false), 120)}
                  placeholder="Search products · type a name or category"
                  autoComplete="off"
                  className="flex-1 min-w-0 bg-transparent text-sm text-ink placeholder-navy-400 focus:outline-none"
                />
                {productQuery && (
                  <button
                    type="button"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => setProductQuery('')}
                    className="text-navy-400 hover:text-navy-700 flex-shrink-0"
                    aria-label="Clear search"
                  >
                    <Icon name="x" size={12} strokeWidth={3} />
                  </button>
                )}
              </div>

              {productsOpen && (
                <div className="absolute z-20 left-0 right-0 mt-1 rounded-xl bg-white border border-navy-100 shadow-lg overflow-hidden">
                  <p className="px-3 py-1.5 text-[9px] font-bold text-navy-400 tracking-wider uppercase bg-paper border-b border-navy-100">
                    {productQuery ? `Matches for "${productQuery}"` : 'Product catalog'}
                  </p>
                  <div className="max-h-72 overflow-y-auto divide-y divide-navy-50">
                    {productSuggestions.length === 0 ? (
                      <p className="px-3 py-4 text-xs text-navy-500 italic">No products match "{productQuery}".</p>
                    ) : (
                      productSuggestions.map(p => {
                        const selected = d.products.includes(p.name);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => { toggleProduct(p.name); setProductQuery(''); }}
                            className={`w-full px-3 py-2.5 flex items-center gap-3 text-left transition-colors ${selected ? 'bg-leaf-50/40' : 'hover:bg-paper'}`}
                          >
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${selected ? (p.focus ? 'bg-leaf-500' : 'bg-navy-700') : 'border-2 border-navy-300'}`}>
                              {selected && <Icon name="check" size={12} className="text-white" strokeWidth={3} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-display font-semibold text-sm text-ink truncate">{p.name}</p>
                              <p className="text-[11px] text-navy-500 truncate">{p.category}</p>
                            </div>
                            {p.focus && <span className="px-1.5 py-0.5 rounded-full bg-leaf-500 text-white text-[9px] font-bold flex-shrink-0">FOCUS</span>}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {d.products.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {d.products.map(name => {
                  const meta = PRODUCT_CATALOG.find(p => p.name === name);
                  return (
                    <span
                      key={name}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${meta?.focus ? 'bg-leaf-50 text-leaf-700 border border-leaf-200' : 'bg-navy-50 text-navy-700 border border-navy-100'}`}
                    >
                      {name}
                      <button
                        type="button"
                        onClick={() => toggleProduct(name)}
                        className="text-current opacity-60 hover:opacity-100"
                        aria-label={`Remove ${name}`}
                      >
                        <Icon name="x" size={10} strokeWidth={3} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Conversation */}
          <Card
            title="Conversation & Next Step"
            icon="edit"
            open={!!openCards.conversation}
            onToggle={() => toggleCard('conversation')}
            badge={d.summary && d.nextSteps ? pill('Done', 'bg-leaf-50 text-leaf-700') : pill('Required', 'bg-amber-50 text-amber-700')}
          >
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase mb-1">Conversation Summary</p>
                <textarea
                  required
                  rows={4}
                  value={d.summary}
                  onChange={e => set({ summary: e.target.value })}
                  placeholder="Key topics, objections, feedback…"
                  className="input-field w-full p-3 rounded-xl bg-paper border border-navy-100 text-sm text-ink resize-none"
                />
              </div>
              <div>
                <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase mb-1">Next Course of Action</p>
                <input
                  type="text"
                  required
                  value={d.nextSteps}
                  onChange={e => set({ nextSteps: e.target.value })}
                  placeholder="e.g. Drop samples next week, send paediatric pack"
                  className="input-field w-full px-3 py-2 rounded-lg bg-paper border border-navy-100 text-sm text-ink"
                />
                {history[0] && (
                  <p className="text-[11px] text-navy-500 mt-1.5">Last agreed: {history[0].nextStep}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Retail audit · trade / frontline calls */}
          {d.retailAuditOn ? (
            <Card
              title={isRetailCall ? 'Retail Audit · Trade / Frontline' : 'Retail Audit · Hospital pharmacy'}
              icon="package"
              iconClass="text-amber-700"
              open={!!openCards.retail}
              onToggle={() => toggleCard('retail')}
              badge={pill(`${auditScore}/4 compliant`, auditScore === 4 ? 'bg-leaf-50 text-leaf-700' : 'bg-amber-50 text-amber-700')}
            >
              <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase mb-2">Stock status per SKU</p>
              <div className="space-y-2 mb-4">
                {auditSkus.map(sku => (
                  <div key={sku} className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-semibold text-ink flex-1 min-w-[140px]">{sku}</p>
                    <div className="flex gap-1" role="group" aria-label={`Stock status for ${sku}`}>
                      {STOCK_LEVELS.map(l => {
                        const on = d.retailAudit.stock[sku] === l.v;
                        return (
                          <button
                            key={l.v}
                            type="button"
                            aria-pressed={on}
                            onClick={() => setStock(sku, l.v)}
                            className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold btn-press ${on ? l.on : 'bg-paper border-navy-100 text-navy-600'}`}
                          >
                            {l.l}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase mb-2">Shelf compliance</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
                {SHELF_CHECKS.map(c => {
                  const on = d.retailAudit[c.key];
                  return (
                    <button
                      key={c.key}
                      type="button"
                      aria-pressed={on}
                      onClick={() => set({ retailAudit: { ...d.retailAudit, [c.key]: !on } })}
                      className={`p-3 rounded-xl border text-left flex items-start gap-2 btn-press ${on ? 'bg-leaf-50 border-leaf-200' : 'bg-paper border-navy-100'}`}
                    >
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${on ? 'bg-leaf-500' : 'border-2 border-navy-300'}`}>
                        {on && <Icon name="check" size={12} className="text-white" strokeWidth={3} />}
                      </span>
                      <span>
                        <span className="block text-xs font-bold text-ink">{c.label}</span>
                        <span className="block text-[10px] text-navy-500">{c.hint}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase mb-2">Display compliance · POS material up?</p>
              <div className="flex items-center gap-2 flex-wrap">
                {[{ v: true, l: 'Yes' }, { v: false, l: 'No' }].map(o => (
                  <button
                    key={o.l}
                    type="button"
                    aria-pressed={d.retailAudit.posUp === o.v}
                    onClick={() => set({ retailAudit: { ...d.retailAudit, posUp: o.v } })}
                    className={`px-4 py-2 rounded-lg border text-xs font-bold btn-press ${d.retailAudit.posUp === o.v ? (o.v ? 'bg-leaf-500 border-leaf-500 text-white' : 'bg-rose-600 border-rose-600 text-white') : 'bg-paper border-navy-100 text-navy-700'}`}
                  >
                    {o.l}
                  </button>
                ))}
                {d.retailAudit.posPhoto ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-leaf-50 border border-leaf-200 text-[11px] font-bold text-leaf-800">
                    <Icon name="camera" size={12} /> {d.retailAudit.posPhoto}
                    <button type="button" onClick={() => set({ retailAudit: { ...d.retailAudit, posPhoto: undefined } })} className="ml-1 text-leaf-700 hover:text-leaf-900" aria-label="Remove photo">
                      <Icon name="x" size={10} strokeWidth={3} />
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => { set({ retailAudit: { ...d.retailAudit, posPhoto: `POS-${Date.now().toString().slice(-6)}.jpg` } }); setPosFlash(true); }}
                    className="px-3 py-2 rounded-lg border border-dashed border-navy-200 text-navy-700 text-xs font-bold flex items-center gap-1.5 btn-press"
                  >
                    <Icon name="camera" size={13} /> Take display photo
                  </button>
                )}
              </div>
              {posFlash && d.retailAudit.posPhoto && <p className="text-[11px] text-leaf-700 mt-2">Photo attached · GPS and time stamped.</p>}
              {!isRetailCall && (
                <button type="button" onClick={() => set({ retailAuditOn: false })} className="mt-4 text-[11px] font-bold text-navy-500 hover:text-navy-700 btn-press">
                  Remove retail audit from this call
                </button>
              )}
            </Card>
          ) : (
            <button
              type="button"
              onClick={() => { set({ retailAuditOn: true }); setOpenCards(prev => ({ ...prev, retail: true })); }}
              className="w-full rounded-2xl bg-white border border-dashed border-navy-200 px-5 py-3.5 flex items-center justify-between gap-2 text-left hover:bg-paper btn-press"
            >
              <span className="flex items-center gap-2">
                <Icon name="package" size={14} className="text-amber-700" />
                <span className="stat-label text-navy-400">Retail Audit</span>
              </span>
              <span className="text-[11px] font-bold text-navy-600 flex items-center gap-1"><Icon name="plus" size={12} /> Add for the hospital pharmacy</span>
            </button>
          )}

          {/* Samples issued */}
          <Card
            title="Samples Issued"
            icon="package"
            open={!!openCards.samples}
            onToggle={() => toggleCard('samples')}
            badge={samplesThisVisit > 0 ? pill(`${samplesThisVisit} units`, 'bg-leaf-50 text-leaf-700') : pill('None')}
          >
            <p className="text-[11px] text-navy-500 mb-3">Record each pack handed over. Quantities are capped by your monthly allocation.</p>
            <div className="space-y-3">
              {d.samples.map(s => {
                const a = leftFor(s.sku, s.id);
                return (
                  <div key={s.id} className="p-3 rounded-xl bg-paper border border-navy-100 space-y-2">
                    <div className="flex items-center gap-2">
                      <select
                        value={s.sku}
                        onChange={e => updateSample(s.id, { sku: e.target.value })}
                        aria-label="Sample SKU"
                        className="input-field flex-1 min-w-0 px-2 py-2 rounded-lg bg-white border border-navy-100 text-sm text-ink"
                      >
                        {Object.keys(SAMPLE_LIMITS).map(k => <option key={k}>{k}</option>)}
                      </select>
                      <button type="button" onClick={() => removeSample(s.id)} className="w-8 h-8 rounded-lg border border-navy-100 text-navy-400 hover:text-rose-600 flex items-center justify-center btn-press" aria-label="Remove sample line">
                        <Icon name="x" size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="text-[9px] font-bold text-navy-400 tracking-wider uppercase">Batch no.</label>
                        <select value={s.batch} onChange={e => updateSample(s.id, { batch: e.target.value })} className="input-field w-full mt-0.5 px-2 py-1.5 rounded-lg bg-white border border-navy-100 text-xs font-mono text-ink">
                          {(SAMPLE_BATCHES[s.sku] ?? []).map(b => <option key={b}>{b}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-navy-400 tracking-wider uppercase">Quantity</label>
                        <div className="flex items-center gap-1 mt-0.5 bg-white rounded-lg p-0.5 border border-navy-100">
                          <button type="button" onClick={() => updateSample(s.id, { qty: s.qty - 1 })} className="w-7 h-7 rounded-md hover:bg-navy-50 text-navy-700 font-bold btn-press" aria-label="One less">−</button>
                          <span className="flex-1 text-center font-mono font-bold text-ink text-sm">{s.qty}</span>
                          <button type="button" onClick={() => updateSample(s.id, { qty: s.qty + 1 })} disabled={a.left - s.qty <= 0} className="w-7 h-7 rounded-md bg-navy-700 text-white font-bold btn-press disabled:opacity-40" aria-label="One more">+</button>
                        </div>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="text-[9px] font-bold text-navy-400 tracking-wider uppercase">Recipient</label>
                        <input value={s.recipient} onChange={e => updateSample(s.id, { recipient: e.target.value })} placeholder="Who received it" className="input-field w-full mt-0.5 px-2 py-1.5 rounded-lg bg-white border border-navy-100 text-xs text-ink" />
                      </div>
                    </div>
                    <p className={`text-[11px] font-semibold ${a.left - s.qty <= 0 ? 'text-rose-700' : a.left - s.qty <= 5 ? 'text-amber-700' : 'text-navy-500'}`}>
                      {a.left - s.qty} of {a.limit} {s.sku.split(' ')[0]} samples left this month
                      {a.left - s.qty <= 0 ? ' · allocation used up' : ''}
                    </p>
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              onClick={addSampleLine}
              className="mt-3 w-full px-3 py-2 rounded-lg border border-dashed border-navy-200 text-navy-600 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-paper btn-press"
            >
              <Icon name="plus" size={13} strokeWidth={2.5} /> Add sample
            </button>
          </Card>

          {/* Market intel · optional competitor signal, routes to PM */}
          <Card
            title="Market Intel"
            icon="flag"
            iconClass="text-violet-700"
            open={!!openCards.intel}
            onToggle={() => toggleCard('intel')}
            badge={d.intelCategories.length ? pill(d.intelCategories.join(' · '), 'bg-violet-50 text-violet-700') : pill('Optional')}
          >
            <p className="text-[11px] text-navy-500 mb-3">Spotted a competitor scheme, promo or price? Tag it and capture it · your PM sees it as a Competitor Signal.</p>
            <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase mb-2">Category</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {INTEL_CATEGORIES.map(c => {
                const on = d.intelCategories.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleIntel(c)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold border btn-press ${on ? 'bg-violet-600 border-violet-600 text-white' : 'bg-paper border-navy-100 text-navy-700'}`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">Competitor Brand Seen</label>
                <input
                  type="text"
                  value={d.competitorBrand}
                  onChange={e => set({ competitorBrand: e.target.value })}
                  placeholder="e.g. GSK · Augmentin"
                  className="input-field w-full mt-1 px-3 py-2 rounded-lg bg-paper border border-navy-100 text-sm text-ink"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">Promotion / Scheme Observed</label>
                <input
                  type="text"
                  value={d.competitorPromo}
                  onChange={e => set({ competitorPromo: e.target.value })}
                  placeholder="e.g. 15% trade discount · BOGOF on cartons"
                  className="input-field w-full mt-1 px-3 py-2 rounded-lg bg-paper border border-navy-100 text-sm text-ink"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">Details</label>
              <textarea
                rows={2}
                value={d.competitorPricing}
                onChange={e => set({ competitorPricing: e.target.value })}
                placeholder="e.g. Augmentin 625mg at ₦950/strip · 8% under our list price."
                className="input-field w-full mt-1 px-3 py-2 rounded-lg bg-paper border border-navy-100 text-sm text-ink resize-none"
              />
            </div>
          </Card>

          {/* Complaints */}
          <Card
            title="Log Complaint"
            icon="alert"
            iconClass="text-rose-600"
            open={!!openCards.complaint}
            onToggle={() => toggleCard('complaint')}
            badge={visitComplaints.length ? pill(`${visitComplaints.length} logged`, 'bg-rose-50 text-rose-700') : undefined}
          >
            {visitComplaints.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {visitComplaints.map(c => (
                  <div key={c.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-paper">
                    <p className="text-[11px] text-ink truncate"><span className="font-mono font-bold">{c.id}</span> · {c.category} · {c.product}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${STATUS_STYLE[c.status]}`}>{c.status}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase mb-1.5">Category</p>
                <div className="flex flex-wrap gap-1.5">
                  {COMPLAINT_CATEGORIES.map(c => (
                    <button
                      key={c}
                      type="button"
                      aria-pressed={d.complaintDraft.category === c}
                      onClick={() => set({ complaintDraft: { ...d.complaintDraft, category: c } })}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold border btn-press ${d.complaintDraft.category === c ? (c === 'Adverse event' ? 'bg-rose-600 border-rose-600 text-white' : 'bg-navy-700 border-navy-700 text-white') : 'bg-paper border-navy-100 text-navy-700'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">Severity</label>
                <select
                  value={d.complaintDraft.severity}
                  onChange={e => set({ complaintDraft: { ...d.complaintDraft, severity: e.target.value as VisitDraft['complaintDraft']['severity'] } })}
                  className="input-field w-full mt-1 px-3 py-2 rounded-lg bg-paper border border-navy-100 text-sm text-ink"
                >
                  {COMPLAINT_SEVERITIES.map(s => <option key={s} value={s}>{s} · {SLA_HOURS[s]}h SLA</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">Product</label>
                <select
                  value={d.complaintDraft.product}
                  onChange={e => set({ complaintDraft: { ...d.complaintDraft, product: e.target.value } })}
                  className="input-field w-full mt-1 px-3 py-2 rounded-lg bg-paper border border-navy-100 text-sm text-ink"
                >
                  {PRODUCT_CATALOG.map(p => <option key={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">Batch no.</label>
                <input
                  value={d.complaintDraft.batch}
                  onChange={e => set({ complaintDraft: { ...d.complaintDraft, batch: e.target.value } })}
                  placeholder="Printed on the pack, e.g. CF24-0822"
                  className="input-field w-full mt-1 px-3 py-2 rounded-lg bg-paper border border-navy-100 text-sm font-mono text-ink"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">What happened</label>
                <textarea
                  rows={3}
                  value={d.complaintDraft.description}
                  onChange={e => set({ complaintDraft: { ...d.complaintDraft, description: e.target.value } })}
                  placeholder="What the customer reported, how many packs, when"
                  className="input-field w-full mt-1 p-3 rounded-xl bg-paper border border-navy-100 text-sm text-ink resize-none"
                />
              </div>
            </div>
            {d.complaintDraft.category === 'Adverse event' && (
              <p className="mt-3 text-[11px] text-rose-800 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                Adverse events go to Pharmacovigilance within 24 hours. Severity is raised to at least High. Do not record the patient's name.
              </p>
            )}
            <button
              type="button"
              onClick={submitComplaint}
              disabled={!d.complaintDraft.description.trim()}
              className="mt-3 w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-bold flex items-center justify-center gap-1.5 btn-press"
            >
              <Icon name="send" size={14} /> Log complaint
            </button>
            {complaintFlash && (
              <p className="mt-2 text-[11px] text-leaf-700 font-semibold flex items-start gap-1">
                <Icon name="checkCircle" size={12} className="mt-0.5 flex-shrink-0" /> {complaintFlash}
              </p>
            )}
          </Card>

          {/* Engagement breakdown */}
          <Card
            title="Engagement Breakdown"
            icon="users"
            open={!!openCards.engagement}
            onToggle={() => toggleCard('engagement')}
            badge={pill(`${d.attendees.doctors + d.attendees.pharmacists + d.attendees.nurses + othersThisVisit} attendees`)}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {COUNTER_KEYS.map(({ key, label, icon }) => {
                const total = existingDailyStats[key] + d.attendees[key];
                return (
                  <div key={key} className="bg-paper rounded-xl border border-navy-100 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">{label}</span>
                      <div className="w-7 h-7 rounded-lg bg-white border border-navy-100 flex items-center justify-center text-navy-700">
                        <Icon name={icon} size={12} />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1.5 mb-3">
                      <span className="font-display text-2xl font-bold text-ink">{total}</span>
                      <span className="text-[10px] text-navy-400 font-medium">total today</span>
                    </div>
                    <div className="pt-3 border-t border-navy-100">
                      <p className="text-[10px] text-navy-400 mb-1.5 font-medium">Add for this visit</p>
                      <div className="flex items-center gap-1.5 bg-white rounded-lg p-1 border border-navy-100">
                        <button
                          type="button"
                          onClick={() => adjustAttendee(key, -1)}
                          className="w-7 h-7 rounded-md hover:bg-navy-50 text-navy-700 font-bold flex items-center justify-center btn-press"
                          aria-label={`Remove one ${label}`}
                        >
                          <Icon name="x" size={12} strokeWidth={3} />
                        </button>
                        <span className="flex-1 text-center font-display font-bold text-ink">{d.attendees[key]}</span>
                        <button
                          type="button"
                          onClick={() => adjustAttendee(key, 1)}
                          className="w-7 h-7 rounded-md bg-navy-700 hover:bg-navy-800 text-white font-bold flex items-center justify-center btn-press"
                          aria-label={`Add one ${label}`}
                        >
                          <Icon name="plus" size={12} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Other attendees · named groups replace the old "Others" counter */}
            <div className="mt-4 pt-4 border-t border-navy-100">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">Other Attendees</p>
                <span className="text-[10px] text-navy-500 font-mono flex-shrink-0">{othersThisVisit} total</span>
              </div>
              <p className="text-[11px] text-navy-500 mb-3">Anyone who isn't a doctor, pharmacist or nurse · name the role and how many.</p>
              {d.otherGroups.length > 0 && (
                <div className="space-y-2 mb-2">
                  {d.otherGroups.map((g, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={g.label}
                        onChange={e => updateOtherLabel(idx, e.target.value)}
                        placeholder="e.g. Lab Scientist, Procurement Officer"
                        className="input-field flex-1 min-w-0 px-3 py-2 rounded-lg bg-paper border border-navy-100 text-sm text-ink"
                      />
                      <div className="flex items-center gap-1.5 bg-white rounded-lg p-1 border border-navy-100 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => adjustOtherCount(idx, -1)}
                          className="w-7 h-7 rounded-md hover:bg-navy-50 text-navy-700 font-bold flex items-center justify-center btn-press"
                          aria-label="Remove one"
                        >
                          <Icon name="x" size={12} strokeWidth={3} />
                        </button>
                        <span className="w-6 text-center font-display font-bold text-ink">{g.count}</span>
                        <button
                          type="button"
                          onClick={() => adjustOtherCount(idx, 1)}
                          className="w-7 h-7 rounded-md bg-navy-700 hover:bg-navy-800 text-white font-bold flex items-center justify-center btn-press"
                          aria-label="Add one"
                        >
                          <Icon name="plus" size={12} strokeWidth={3} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeOtherGroup(idx)}
                        className="w-8 h-8 rounded-lg border border-navy-100 text-navy-400 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center flex-shrink-0 btn-press"
                        aria-label="Remove attendee type"
                      >
                        <Icon name="x" size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={addOtherGroup}
                className="w-full px-3 py-2 rounded-lg border border-dashed border-navy-200 text-navy-600 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-paper btn-press"
              >
                <Icon name="plus" size={13} strokeWidth={2.5} /> Add attendee type
              </button>
            </div>
          </Card>

          {/* New contact met → pipeline intake */}
          <Card
            title="New Contact Met"
            icon="filter"
            open={!!openCards.contact}
            onToggle={() => toggleCard('contact')}
            badge={contactAdded ? pill('Added', 'bg-leaf-50 text-leaf-700') : pill('Feeds your pipeline')}
          >
            <p className="text-[11px] text-navy-500 mb-3">Met someone new on this visit? Capture them here and they enter your pipeline as a fresh lead.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input value={contactName} onChange={e => { setContactName(e.target.value); setContactAdded(false); }} placeholder="Name" className="input-field px-3 py-2 rounded-lg bg-paper border border-navy-100 text-sm text-ink" />
              <input value={contactRole} onChange={e => setContactRole(e.target.value)} placeholder="Role / specialty" className="input-field px-3 py-2 rounded-lg bg-paper border border-navy-100 text-sm text-ink" />
              <input value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="Phone (optional)" className="input-field px-3 py-2 rounded-lg bg-paper border border-navy-100 text-sm text-ink" />
            </div>
            <button
              type="button"
              onClick={addContactToPipeline}
              disabled={!contactName.trim()}
              className="mt-3 w-full py-2.5 rounded-lg bg-navy-700 hover:bg-navy-800 disabled:opacity-50 text-white text-sm font-bold flex items-center justify-center gap-1.5 btn-press"
            >
              <Icon name="plus" size={14} /> Add to Pipeline
            </button>
            {contactAdded && (
              <p className="mt-2 text-[11px] text-leaf-700 font-semibold flex items-center gap-1">
                <Icon name="checkCircle" size={12} /> {contactNote || 'Added to your pipeline as a captured lead.'}
              </p>
            )}
            {contactSheetOpen && leads && (
              <AddContactSheet
                leads={leads}
                capturedBy={REP_OWNER}
                defaultName={contactName}
                defaultRole={contactRole}
                defaultPhone={contactPhone}
                defaultOrg={d.institution || activeVisit.name}
                source="Visit-log attendee"
                onSave={({ lead, mergeInto }) => {
                  if (mergeInto) setContactNote(`Merged into the existing record for ${mergeInto.name}.`);
                  else { onAddLead(lead); setContactNote(lead.assignmentNote ? `Added with consent on record · ${lead.assignmentNote}` : 'Added to your pipeline with consent on record.'); }
                  setContactAdded(true);
                  setContactSheetOpen(false);
                  setContactName(''); setContactRole(''); setContactPhone('');
                }}
                onOpenExisting={m => { setContactNote(`Already in the pipeline as ${m.name}. Nothing new created.`); setContactAdded(true); setContactSheetOpen(false); }}
                onClose={() => setContactSheetOpen(false)}
              />
            )}
          </Card>

          {/* Customer sign-off */}
          <Card
            title="Customer Signature"
            icon="edit"
            open={!!openCards.signature}
            onToggle={() => toggleCard('signature')}
            badge={d.signature ? pill(`Signed · ${d.signature.signer}`, 'bg-leaf-50 text-leaf-700') : pill('Not signed')}
          >
            <p className="text-[11px] text-navy-500 mb-3">Hand the phone to the customer. The signature is saved on this visit and on any order you place during it.</p>
            <SignaturePad
              value={d.signature}
              onChange={sig => set({ signature: sig })}
              defaultSigner={d.hcpName}
            />
          </Card>
        </div>

        <div className="fade-up stagger-2 space-y-4">
          <div className="rounded-2xl bg-white border border-navy-100 p-5">
            <p className="stat-label text-navy-400 mb-3">Today So Far</p>
            <div className="space-y-2">
              {ATTENDEE_KEYS.map(({ key, label, icon }) => {
                const previous = existingDailyStats[key];
                const adding = key === 'others' ? othersThisVisit : d.attendees[key];
                return (
                  <div key={key} className="flex items-center gap-3 p-2 rounded-lg bg-paper">
                    <div className="w-8 h-8 rounded-lg bg-white border border-navy-100 flex items-center justify-center text-navy-700">
                      <Icon name={icon} size={14} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-ink">{label}</p>
                      <p className="text-[10px] text-navy-500">
                        {previous} logged{adding > 0 ? ` · +${adding} this visit` : ''}
                      </p>
                    </div>
                    <span className="font-display font-bold text-ink text-sm">{previous + adding}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className="rounded-2xl p-5 text-white relative overflow-hidden"
            style={{ background: 'linear-gradient(120deg, #0F2147 0%, #142A5A 100%)' }}
          >
            <div className="absolute inset-0 ai-shimmer" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="sparkles" size={14} className="text-leaf-300" />
                <p className="text-[10px] font-bold text-leaf-300 tracking-wider uppercase">Last Interaction</p>
              </div>
              {history[0] ? (
                <>
                  <p className="text-xs text-white/90 leading-relaxed">{history[0].summary}</p>
                  <p className="text-[11px] text-leaf-200 mt-2">{fmtShortDate(history[0].date)} · {history[0].hcpName}</p>
                </>
              ) : (
                <p className="text-xs text-white/90 leading-relaxed">First recorded call at this customer. Capture the decision-maker and what they prescribe today.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-navy-100 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="calendar" size={14} className="text-navy-700" />
              <p className="stat-label text-navy-400">Commitment Reminder</p>
            </div>
            <p className="text-[11px] text-navy-500 mb-2">Auto-remind me to follow up on the next course of action.</p>
            <input
              type="datetime-local"
              value={d.reminderDate}
              onChange={e => set({ reminderDate: e.target.value })}
              className="input-field w-full px-3 py-2 rounded-lg bg-paper border border-navy-100 text-sm text-ink"
            />
          </div>

          <div className="rounded-2xl bg-white border border-navy-100 p-4 space-y-1.5 text-[11px]">
            <p className="stat-label text-navy-400 mb-1">This call</p>
            {[
              ['Samples', samplesThisVisit ? `${samplesThisVisit} units` : 'None'],
              ['Retail audit', d.retailAuditOn ? `${auditScore}/4 compliant` : 'Not done'],
              ['Intel', d.intelCategories.length ? d.intelCategories.join(', ') : 'None'],
              ['Complaints', visitComplaints.length ? visitComplaints.map(c => c.id).join(', ') : 'None'],
              ['Signature', d.signature ? d.signature.signer : 'Not signed'],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between gap-2">
                <span className="text-navy-500">{l}</span>
                <span className="font-semibold text-ink text-right truncate">{v}</span>
              </div>
            ))}
            <p className="text-[10px] text-navy-400 pt-1.5 flex items-center gap-1"><Icon name="lock" size={10} /> Draft kept on this phone until you check out</p>
          </div>

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className={`w-full py-3.5 rounded-xl font-display font-semibold btn-press flex items-center justify-center gap-2 shadow-lg transition-all ${
              canSubmit && !submitting
                ? 'bg-leaf-500 hover:bg-leaf-600 text-white shadow-leaf-500/30'
                : 'bg-navy-100 text-navy-400 cursor-not-allowed shadow-none'
            }`}
          >
            <Icon name="check" size={18} strokeWidth={3} />
            Check Out & Save Visit
          </button>
          {!canSubmit && (
            <p className="text-[11px] text-navy-500 text-center -mt-2">
              {!d.checkedIn
                ? 'Check in to enable submit.'
                : prefillPending
                  ? 'Confirm you reviewed the pre-filled details.'
                  : 'Fill the required fields above to submit.'}
            </p>
          )}
        </div>
      </form>

      {voiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-900/60" />
          <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6 text-center">
            {voicePhase === 'recording' ? (
              <>
                <div className="mx-auto w-20 h-20 rounded-full bg-rose-500 flex items-center justify-center gps-pulse">
                  <Icon name="mic" size={32} className="text-white" />
                </div>
                <p className="mt-4 font-display text-lg font-bold text-ink">Listening…</p>
                <p className="text-sm text-navy-500 mt-1 font-mono">{Math.floor(recordSecs / 60)}:{String(recordSecs % 60).padStart(2, '0')}</p>
                <p className="text-[11px] text-navy-400 mt-3 leading-relaxed">Speak the visit naturally. Mention the HCP, products, what was discussed, any competitor activity and your next step.</p>
                <div className="mt-5 flex gap-2">
                  <button type="button" onClick={cancelDictation} className="flex-1 py-2.5 rounded-lg border border-navy-200 text-navy-700 text-sm font-bold btn-press">Cancel</button>
                  <button type="button" onClick={stopDictation} className="flex-1 py-2.5 rounded-lg bg-navy-700 text-white text-sm font-bold flex items-center justify-center gap-1.5 btn-press"><Icon name="checkCircle" size={15} /> Stop &amp; Fill</button>
                </div>
              </>
            ) : (
              <>
                <div className="mx-auto w-20 h-20 rounded-full bg-navy-700 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 ai-shimmer" />
                  <Icon name="sparkles" size={30} className="text-leaf-300 relative" />
                </div>
                <p className="mt-4 font-display text-lg font-bold text-ink">{voicePhase === 'transcribing' ? 'Transcribing…' : 'Structuring with Fidson vocabulary…'}</p>
                <p className="text-[11px] text-navy-400 mt-2 italic leading-relaxed">"{VOICE_TRANSCRIPT}"</p>
                <div className="mt-4 flex items-center justify-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full pulse-dot ${voicePhase === 'transcribing' ? 'bg-navy-700' : 'bg-leaf-500'}`} />
                  <span className={`w-2 h-2 rounded-full ${voicePhase === 'structuring' ? 'bg-navy-700 pulse-dot' : 'bg-navy-200'}`} />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
