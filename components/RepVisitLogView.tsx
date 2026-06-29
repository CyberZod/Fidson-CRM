import { useEffect, useMemo, useState } from 'react';
import Icon from './Icon';
import { PRODUCT_CATALOG } from '../assets/products';
import { REP_OWNER, type Lead } from '../assets/leads';
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
}

type VoicePhase = 'recording' | 'transcribing' | 'structuring';

// What the rep "said" — the scripted transcript the demo plays back.
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

interface OtherGroup {
  label: string;
  count: number;
}

const emptyAttendees = (): VisitLogAttendees => ({
  doctors: 1,
  pharmacists: 0,
  nurses: 0,
  others: 0,
});

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
}: RepVisitLogViewProps) {
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInLabel, setCheckInLabel] = useState<string>('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [manualLocation, setManualLocation] = useState(false);
  const [loadingLoc, setLoadingLoc] = useState(false);

  const [hcpType, setHcpType] = useState<HcpType>('Doctor');
  const [hcpName, setHcpName] = useState('');
  const [institution, setInstitution] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const plannedProducts = useMemo(() => activeVisit?.plannedProducts ?? [], [activeVisit]);
  const [products, setProducts] = useState<string[]>(plannedProducts);
  const [attendees, setAttendees] = useState<VisitLogAttendees>(emptyAttendees);
  const [otherGroups, setOtherGroups] = useState<OtherGroup[]>([]);
  const [summary, setSummary] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [competitorBrand, setCompetitorBrand] = useState('');
  const [competitorPromo, setCompetitorPromo] = useState('');
  const [competitorPricing, setCompetitorPricing] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hcpSuggestOpen, setHcpSuggestOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [productQuery, setProductQuery] = useState('');

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
    const q = hcpName.trim().toLowerCase();
    if (!q) return hcpDirectory.slice(0, 6);
    return hcpDirectory.filter(d => d.name.toLowerCase().includes(q)).slice(0, 6);
  }, [hcpDirectory, hcpName]);

  useEffect(() => {
    if (!activeVisit) return;
    setHcpName('');
    setInstitution(activeVisit.name || '');
    setSpecialty('');
    setProducts(activeVisit.plannedProducts ?? []);
    setEmail('');
    setPhone('');
    setSummary('');
    setNextSteps('');
    setCompetitorBrand('');
    setCompetitorPromo('');
    setCompetitorPricing('');
    setReminderDate('');
    setAttendees(emptyAttendees());
    setOtherGroups([]);
    setHcpType('Doctor');
    setCheckedIn(!!activeVisit.checkedIn);
    setLocation(null);
    setManualLocation(false);
    setHcpSuggestOpen(false);
  }, [activeVisit]);

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

  const toggleProduct = (name: string) => {
    setProducts(prev => (prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]));
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
    setHcpType('Doctor');
    setHcpName('Dr. T. Adebayo');
    setSpecialty('Paediatrics');
    const focus = PRODUCT_CATALOG.filter(p => p.focus).slice(0, 2).map(p => p.name);
    const picked = focus.length ? focus : PRODUCT_CATALOG.slice(0, 2).map(p => p.name);
    setProducts(prev => Array.from(new Set([...prev, ...picked])));
    setSummary('Detailed Coflin Forte and Tuxil-N on the paediatric ward. Dr. Adebayo is open to a trial if pricing works. Receptive overall.');
    setNextSteps('Drop paediatric samples next week and follow up on pricing.');
    setCompetitorBrand('GSK · Augmentin');
    setCompetitorPromo('15% trade discount');
    setCompetitorPricing('Augmentin pushed at ~15% trade discount on the ward.');
    setAttendees(prev => ({ ...prev, doctors: Math.max(prev.doctors, 1) }));
    // Pre-fill the new-contact card with the extra person mentioned in the note.
    setContactName('Dr. Ngozi Okeke');
    setContactRole('Consultant Paediatrician');
    setContactPhone('');
    setContactAdded(false);
  };

  const addContactToPipeline = () => {
    if (!contactName.trim()) return;
    const lead: Lead = {
      id: `ld-${Date.now()}`,
      name: contactName.trim(),
      role: contactRole.trim() || 'Contact',
      org: institution || activeVisit?.name || 'Field contact',
      channel: 'HCP',
      territory: 'Lekki Cluster',
      region: 'South-West',
      repName: REP_OWNER,
      phone: contactPhone.trim() || undefined,
      stage: 'captured',
      completeness: 30,
      consent: false,
      enriched: false,
      metContext: `Met during the ${institution || activeVisit?.name || 'field'} visit`,
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
    setAttendees(prev => ({ ...prev, [key]: Math.max(0, prev[key] + delta) }));
  };

  const othersThisVisit = otherGroups.reduce((s, g) => s + g.count, 0);
  const addOtherGroup = () => setOtherGroups(prev => [...prev, { label: '', count: 1 }]);
  const updateOtherLabel = (idx: number, label: string) => setOtherGroups(prev => prev.map((g, i) => (i === idx ? { ...g, label } : g)));
  const adjustOtherCount = (idx: number, delta: number) => setOtherGroups(prev => prev.map((g, i) => (i === idx ? { ...g, count: Math.max(0, g.count + delta) } : g)));
  const removeOtherGroup = (idx: number) => setOtherGroups(prev => prev.filter((_, i) => i !== idx));

  const handleGetLocation = () => {
    setLoadingLoc(true);
    setManualLocation(false);
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setLoadingLoc(false);
        },
        () => {
          setManualLocation(true);
          setLoadingLoc(false);
        },
        { timeout: 10000, enableHighAccuracy: false },
      );
    } else {
      setManualLocation(true);
      setLoadingLoc(false);
    }
  };

  const handleCheckIn = () => {
    setCheckedIn(true);
    const now = new Date();
    setCheckInLabel(now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location && !manualLocation) return;
    if (submitting) return;
    setSubmitting(true);

    const log: VisitLog = {
      id: `vl-${Date.now()}`,
      repId: currentUserId,
      repName: currentUserName,
      timestamp: new Date().toISOString(),
      activeVisitId: activeVisit.id,
      hcpType,
      hcpName,
      institution,
      specialty,
      email: email || undefined,
      phone: phone || undefined,
      location: location
        ? { latitude: location.lat, longitude: location.lng, isManual: false }
        : { latitude: 0, longitude: 0, isManual: true, address: 'Offline Entry' },
      productsDiscussed: products,
      attendees: { ...attendees, others: othersThisVisit },
      otherAttendees: otherGroups.filter(g => g.label.trim() && g.count > 0),
      summary,
      nextSteps,
      reminderDate: reminderDate ? new Date(reminderDate).toISOString() : undefined,
      marketIntel: (competitorBrand.trim() || competitorPromo.trim() || competitorPricing.trim())
        ? { competitor: competitorBrand.trim(), promo: competitorPromo.trim(), pricing: competitorPricing.trim() }
        : undefined,
    };

    onLogVisit(log);
    onCompleteVisit(activeVisit.id);
  };

  const canSubmit = checkedIn && (location !== null || manualLocation) && hcpName && institution && summary && nextSteps && products.length > 0;
  const checkInStatusLine = checkedIn
    ? (manualLocation
        ? 'Offline · location unverified'
        : location
          ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
          : 'Checked in · GPS pending')
    : 'Awaiting check-in';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      <div className="fade-up flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${checkedIn ? 'bg-leaf-500' : 'bg-navy-300'}`}>
            <Icon name="checkCircle" size={20} strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className={`text-[10px] font-bold tracking-wider uppercase ${checkedIn ? 'text-leaf-700' : 'text-navy-500'}`}>
                {checkedIn ? `Checked In · ${checkInLabel || 'now'}` : 'Awaiting Check-in'}
              </p>
              {checkedIn && <div className="w-1.5 h-1.5 rounded-full bg-leaf-500 pulse-dot" />}
            </div>
            <h2 className="font-display text-xl font-bold text-ink">{activeVisit.name}</h2>
            <p className="text-xs text-navy-500 font-mono">{checkInStatusLine}</p>
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
              className={`relative ${manualLocation ? '' : 'map-bg'} ${manualLocation ? 'bg-amber-50' : ''}`}
              style={{ height: '140px' }}
            >
              <div className="absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}>
                {manualLocation ? (
                  <div className="w-14 h-14 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
                    <Icon name="alert" size={24} className="text-white" />
                  </div>
                ) : (
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${location ? 'bg-leaf-500 gps-pulse' : 'bg-navy-400'}`}>
                    <Icon name="location" size={24} className="text-white" />
                  </div>
                )}
              </div>
              <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-white shadow-sm">
                <p className={`text-[11px] font-bold ${manualLocation ? 'text-amber-700' : location ? 'text-leaf-700' : 'text-navy-500'}`}>
                  {manualLocation ? 'Offline Mode' : location ? 'GPS captured' : 'Within 50m of target'}
                </p>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">Location Verification</p>
                  {manualLocation ? (
                    <p className="text-sm text-amber-700 font-semibold mt-1">Manual / offline entry — location unverified</p>
                  ) : location ? (
                    <p className="text-sm text-ink font-mono mt-1">{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</p>
                  ) : (
                    <p className="text-sm text-navy-500 italic mt-1">Not checked in</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!checkedIn && (
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
                  {checkedIn && !manualLocation && (
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
                    onClick={() => { setManualLocation(true); setLocation(null); if (!checkedIn) handleCheckIn(); }}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 btn-press ${manualLocation ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'border border-navy-200 text-navy-700'}`}
                  >
                    <Icon name="alert" size={12} /> Offline Mode
                  </button>
                </div>
              </div>
              {manualLocation && (
                <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  Network unavailable. Your visit will be flagged as unverified for compliance review.
                </p>
              )}
            </div>
          </div>

          {/* HCP details */}
          <div className="rounded-2xl bg-white border border-navy-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="stat-label text-navy-400">HCP Details</p>
              <span className="text-[10px] text-navy-500 font-mono">Pre-filled from plan</span>
            </div>

            <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase mb-2">HCP Type</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {HCP_TYPES.map(t => {
                const active = hcpType === t.v;
                return (
                  <button
                    key={t.v}
                    type="button"
                    onClick={() => setHcpType(t.v)}
                    className={`p-3 rounded-xl border-2 transition-all btn-press flex flex-col items-center gap-1 ${
                      active
                        ? 'bg-navy-700 border-navy-700 text-white'
                        : 'bg-paper border-navy-100 text-navy-700 hover:border-navy-300'
                    }`}
                  >
                    <Icon name={t.i} size={16} />
                    <span className="text-xs font-bold">{t.l}</span>
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
                  value={hcpName}
                  onChange={e => { setHcpName(e.target.value); setHcpSuggestOpen(true); }}
                  onFocus={() => setHcpSuggestOpen(true)}
                  onBlur={() => setTimeout(() => setHcpSuggestOpen(false), 120)}
                  placeholder={hcpDirectory.length > 0 ? 'Start typing — past HCPs will appear' : 'e.g. Dr. T. Adebayo'}
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
                            setHcpName(s.name);
                            setHcpType(s.hcpType);
                            if (!specialty) setSpecialty(s.specialty);
                            if (!email && s.email) setEmail(s.email);
                            if (!phone && s.phone) setPhone(s.phone);
                            setHcpSuggestOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-paper transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-display font-semibold text-sm text-ink truncate">{s.name}</p>
                            <span className="px-1.5 py-0.5 rounded bg-navy-50 text-navy-700 text-[9px] font-bold flex-shrink-0">{s.hcpType.toUpperCase()}</span>
                          </div>
                          <p className="text-[10px] text-navy-500 truncate">{s.specialty || '—'}{s.institution ? ` · ${s.institution}` : ''}</p>
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
                  value={specialty}
                  onChange={e => setSpecialty(e.target.value)}
                  className="input-field w-full mt-1 px-3 py-2 rounded-lg bg-paper border border-navy-100 text-sm text-ink"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">Institution</label>
                <div
                  title="Locked to this visit's call point"
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-navy-50 border border-navy-100 text-sm text-ink flex items-center justify-between gap-2 cursor-not-allowed"
                >
                  <span className="truncate font-medium">{institution || '—'}</span>
                  <span className="flex items-center gap-1 text-[10px] text-navy-400 flex-shrink-0 uppercase tracking-wider font-bold">
                    <Icon name="lock" size={11} /> Fixed
                  </span>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="080…"
                  className="input-field w-full mt-1 px-3 py-2 rounded-lg bg-paper border border-navy-100 text-sm text-ink"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="doctor@hospital.com"
                  className="input-field w-full mt-1 px-3 py-2 rounded-lg bg-paper border border-navy-100 text-sm text-ink"
                />
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="rounded-2xl bg-white border border-navy-100 p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="stat-label text-navy-400">Products Detailed</p>
              <span className="text-[10px] text-navy-500 font-mono">{products.length} selected</span>
            </div>
            <p className="text-[11px] text-navy-500 mb-3">
              {plannedProducts.length > 0
                ? 'Pre-filled from your visit plan. Add or remove from the dropdown.'
                : 'No products were planned for this visit — pick what you actually detailed.'}
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
                  placeholder="Search products — type a name or category"
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
                        const selected = products.includes(p.name);
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

            {products.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {products.map(name => {
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
          </div>

          {/* Conversation */}
          <div className="rounded-2xl bg-white border border-navy-100 p-5 space-y-4">
            <div>
              <p className="stat-label text-navy-400 mb-2">Conversation Summary</p>
              <textarea
                required
                rows={5}
                value={summary}
                onChange={e => setSummary(e.target.value)}
                placeholder="Key topics, objections, feedback…"
                className="input-field w-full p-3 rounded-xl bg-paper border border-navy-100 text-sm text-ink resize-none"
              />
            </div>
            <div>
              <p className="stat-label text-navy-400 mb-2">Next Course of Action</p>
              <input
                type="text"
                required
                value={nextSteps}
                onChange={e => setNextSteps(e.target.value)}
                placeholder="e.g. Drop samples next week, send paediatric pack"
                className="input-field w-full px-3 py-2 rounded-lg bg-paper border border-navy-100 text-sm text-ink"
              />
            </div>
          </div>

          {/* Market intel — optional competitor signal, routes to PM */}
          <div className="rounded-2xl bg-white border border-navy-100 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="flag" size={14} className="text-violet-700" />
                <p className="stat-label text-navy-400">Market Intel</p>
              </div>
              <span className="text-[10px] text-navy-500 font-mono">Optional · routes to PM</span>
            </div>
            <p className="text-[11px] text-navy-500 -mt-1">Spotted a competitor scheme, promo or price? Capture it — your PM sees it as a Competitor Signal.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">Competitor Brand Seen</label>
                <input
                  type="text"
                  value={competitorBrand}
                  onChange={e => setCompetitorBrand(e.target.value)}
                  placeholder="e.g. GSK · Augmentin"
                  className="input-field w-full mt-1 px-3 py-2 rounded-lg bg-paper border border-navy-100 text-sm text-ink"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">Promotion / Scheme Observed</label>
                <input
                  type="text"
                  value={competitorPromo}
                  onChange={e => setCompetitorPromo(e.target.value)}
                  placeholder="e.g. 15% trade discount · BOGOF on cartons"
                  className="input-field w-full mt-1 px-3 py-2 rounded-lg bg-paper border border-navy-100 text-sm text-ink"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">Pricing Intel</label>
              <textarea
                rows={2}
                value={competitorPricing}
                onChange={e => setCompetitorPricing(e.target.value)}
                placeholder="e.g. Augmentin 625mg at ₦950/strip — 8% under our list price."
                className="input-field w-full mt-1 px-3 py-2 rounded-lg bg-paper border border-navy-100 text-sm text-ink resize-none"
              />
            </div>
          </div>

          {/* Engagement breakdown */}
          <div className="rounded-2xl bg-white border border-navy-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="stat-label text-navy-400">Engagement Breakdown</p>
              <span className="text-[10px] text-navy-500 font-mono">{todayStr}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {COUNTER_KEYS.map(({ key, label, icon }) => {
                const total = existingDailyStats[key] + attendees[key];
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
                        <span className="flex-1 text-center font-display font-bold text-ink">{attendees[key]}</span>
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

            {/* Other attendees — named groups replace the old "Others" counter */}
            <div className="mt-4 pt-4 border-t border-navy-100">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">Other Attendees</p>
                <span className="text-[10px] text-navy-500 font-mono flex-shrink-0">{othersThisVisit} total</span>
              </div>
              <p className="text-[11px] text-navy-500 mb-3">Anyone who isn't a doctor, pharmacist or nurse — name the role and how many.</p>
              {otherGroups.length > 0 && (
                <div className="space-y-2 mb-2">
                  {otherGroups.map((g, idx) => (
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
          </div>

          {/* New contact met → pipeline intake */}
          <div className="rounded-2xl bg-white border border-navy-100 p-5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Icon name="filter" size={14} className="text-navy-700" />
                <p className="stat-label text-navy-400">New Contact Met</p>
              </div>
              <span className="text-[10px] text-navy-500 font-mono">Feeds your pipeline</span>
            </div>
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
                <Icon name="checkCircle" size={12} /> Added to your pipeline as a captured lead.
              </p>
            )}
          </div>
        </div>

        <div className="fade-up stagger-2 space-y-4">
          <div className="rounded-2xl bg-white border border-navy-100 p-5">
            <p className="stat-label text-navy-400 mb-3">Today So Far</p>
            <div className="space-y-2">
              {ATTENDEE_KEYS.map(({ key, label, icon }) => {
                const previous = existingDailyStats[key];
                const adding = key === 'others' ? othersThisVisit : attendees[key];
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
                <p className="text-[10px] font-bold text-leaf-300 tracking-wider uppercase">AI · Last Interaction</p>
              </div>
              <p className="text-xs text-white/90 leading-relaxed">
                Requested clinical data on Coflin for paediatric dosing. Brought up Astrazon during the last detail. Worth bringing the paediatric pack today.
              </p>
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
              value={reminderDate}
              onChange={e => setReminderDate(e.target.value)}
              className="input-field w-full px-3 py-2 rounded-lg bg-paper border border-navy-100 text-sm text-ink"
            />
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
            Save Visit & Complete
          </button>
          {!canSubmit && (
            <p className="text-[11px] text-navy-500 text-center -mt-2">
              {!checkedIn ? 'Check in to enable submit.' : 'Fill the required fields above to submit.'}
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
