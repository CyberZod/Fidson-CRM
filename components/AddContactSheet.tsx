import { useMemo, useState } from 'react';
import Icon from './Icon';
import ConsentCapture from './ConsentCapture';
import DuplicatePrompt from './DuplicatePrompt';
import {
  REP_OWNER, TERRITORIES, assignLead, checkDuplicate, matchAccountByOrg,
  type ConsentRecord, type DuplicateMatch, type Lead, type LeadChannel,
} from '../assets/leads';

export interface AddContactResult {
  lead: Lead;
  mergeInto?: DuplicateMatch;
}

interface AddContactSheetProps {
  leads: Lead[];
  capturedBy?: string;
  defaultName?: string;
  defaultRole?: string;
  defaultOrg?: string;
  defaultPhone?: string;
  source?: string;
  onSave: (result: AddContactResult) => void;
  onOpenExisting: (match: DuplicateMatch) => void;
  onClose: () => void;
}

type Step = 'details' | 'consent';

const LAGOS_TERRITORIES = ['Lekki Cluster', 'V.I. Cluster', 'Mainland Cluster', 'Surulere', 'Lagos Trade', 'Ikeja Cluster', 'Ibadan Metro'];

// New contact on the spot: details, duplicate check on save, territory auto-assignment, NDPC consent.
export default function AddContactSheet({
  leads, capturedBy = REP_OWNER, defaultName = '', defaultRole = '', defaultOrg = '', defaultPhone = '',
  source = 'Pipeline · Add contact', onSave, onOpenExisting, onClose,
}: AddContactSheetProps) {
  const [step, setStep] = useState<Step>('details');
  const [name, setName] = useState(defaultName);
  const [role, setRole] = useState(defaultRole);
  const [org, setOrg] = useState(defaultOrg);
  const [phone, setPhone] = useState(defaultPhone);
  const [channel, setChannel] = useState<LeadChannel>('HCP');
  const [territoryPick, setTerritoryPick] = useState<string | null>(null);
  const [keepMine, setKeepMine] = useState(false);
  const [matches, setMatches] = useState<DuplicateMatch[] | null>(null);
  const [mergeInto, setMergeInto] = useState<DuplicateMatch | undefined>();
  const [keptBoth, setKeptBoth] = useState(false);

  const linkedAccount = useMemo(() => matchAccountByOrg(org), [org]);
  const territory = territoryPick ?? linkedAccount?.territory ?? 'Lekki Cluster';
  const assignment = useMemo(() => assignLead(territory, leads, capturedBy), [territory, leads, capturedBy]);
  const owner = keepMine ? capturedBy : assignment.repName;

  const canSave = name.trim().length > 1 && org.trim().length > 1;

  const save = () => {
    if (!canSave) return;
    const found = checkDuplicate({ name, phone, org }, leads);
    if (found.length && !keptBoth) { setMatches(found); return; }
    setStep('consent');
  };

  const finish = (record: ConsentRecord) => {
    const info = TERRITORIES[territory];
    const lead: Lead = {
      id: `ld-${Date.now()}`,
      name: name.trim(),
      role: role.trim() || 'Contact',
      org: org.trim(),
      channel,
      territory,
      region: info?.region ?? 'South-West',
      repName: owner,
      phone: phone.trim() || undefined,
      stage: 'captured',
      completeness: phone.trim() ? 45 : 35,
      consent: true,
      consentDate: 'Just now',
      consentRecord: record,
      enriched: false,
      dedupeNote: keptBoth && matches?.[0] ? `Kept alongside ${matches[0].name} (${matches[0].score}% match)` : undefined,
      assignmentNote: keepMine ? `Kept by ${capturedBy} · override of auto-assignment` : assignment.note,
      metContext: linkedAccount ? `Met at ${linkedAccount.name}` : `Met at ${org.trim()}`,
      source,
      lastTouchedDays: 0,
      timeline: [
        { date: 'Just now', title: 'Consent recorded', detail: `${record.types.length} consent type(s) · ${record.lawfulBasis} · receipt ${record.receiptId}` },
        { date: 'Just now', title: 'Captured in the field', detail: `${source} · ${keepMine ? 'kept by capturing rep' : assignment.note}` },
      ],
    };
    onSave({ lead, mergeInto });
  };

  const field = 'w-full min-h-[44px] px-3 rounded-xl bg-white border border-navy-200 text-sm text-ink focus:outline-none focus:border-navy-400';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-navy-900/40" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add contact"
        className="relative w-full sm:max-w-md max-h-[92vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl fade-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-white px-5 pt-4 pb-3 border-b border-navy-100 flex items-center justify-between">
          <div>
            <p className="stat-label text-navy-400">Step {step === 'details' ? 1 : 2} of 2</p>
            <h3 className="font-display text-lg font-bold text-ink">{step === 'details' ? 'New contact' : 'Record consent'}</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="w-10 h-10 rounded-xl flex items-center justify-center text-navy-400 hover:text-navy-700"><Icon name="x" size={18} /></button>
        </div>

        <div className="p-5 space-y-3">
          {step === 'details' ? (
            <>
              <label className="block">
                <span className="stat-label text-navy-400">Full name</span>
                <input className={`${field} mt-1`} value={name} onChange={e => { setName(e.target.value); setMatches(null); setKeptBoth(false); setMergeInto(undefined); }} placeholder="Dr. Ngozi Okeke" autoFocus />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="stat-label text-navy-400">Role</span>
                  <input className={`${field} mt-1`} value={role} onChange={e => setRole(e.target.value)} placeholder="Paediatrician" />
                </label>
                <label className="block">
                  <span className="stat-label text-navy-400">Phone</span>
                  <input className={`${field} mt-1`} inputMode="tel" value={phone} onChange={e => { setPhone(e.target.value); setMatches(null); setKeptBoth(false); }} placeholder="+234 803 ..." />
                </label>
              </div>
              <label className="block">
                <span className="stat-label text-navy-400">Institution</span>
                <input className={`${field} mt-1`} value={org} onChange={e => { setOrg(e.target.value); setMatches(null); setKeptBoth(false); }} placeholder="Lagoon Hospital" />
                {linkedAccount && <span className="block text-[11px] text-leaf-700 mt-1">Linked to account: {linkedAccount.name} · {linkedAccount.territory}</span>}
              </label>
              <div>
                <span className="stat-label text-navy-400">Channel</span>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(['HCP', 'Institution', 'Trade'] as LeadChannel[]).map(c => (
                    <button key={c} type="button" aria-pressed={channel === c} onClick={() => setChannel(c)}
                      className={`min-h-[44px] rounded-xl text-xs font-bold btn-press ${channel === c ? 'bg-navy-800 text-white' : 'bg-white border border-navy-200 text-navy-600'}`}>{c}</button>
                  ))}
                </div>
              </div>
              <label className="block">
                <span className="stat-label text-navy-400">Territory</span>
                <select className={`${field} mt-1`} value={territory} onChange={e => setTerritoryPick(e.target.value)}>
                  {LAGOS_TERRITORIES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>

              <div className="rounded-xl bg-sky-50 border border-sky-100 p-3">
                <div className="flex items-start gap-2">
                  <Icon name="users" size={14} className="text-sky-700 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-navy-800">{keepMine ? `Kept by you · ${capturedBy}` : assignment.note}</p>
                    <p className="text-[10px] text-navy-500 mt-0.5">Open load: {assignment.loads.map(l => `${l.rep} ${l.load}`).join(' · ')}</p>
                  </div>
                </div>
                {assignment.repName !== capturedBy && assignment.loads.some(l => l.rep === capturedBy) && (
                  <button type="button" onClick={() => setKeepMine(k => !k)} className="mt-2 text-[11px] font-bold text-sky-700 hover:text-sky-900">
                    {keepMine ? 'Use auto-assignment' : 'Keep it myself'}
                  </button>
                )}
              </div>

              {matches && !keptBoth && (
                <DuplicatePrompt
                  matches={matches}
                  onMerge={m => { setMergeInto(m); setKeptBoth(true); setStep('consent'); }}
                  onKeepBoth={() => { setKeptBoth(true); setStep('consent'); }}
                  onOpen={m => onOpenExisting(m)}
                />
              )}

              {!(matches && !keptBoth) && (
                <button type="button" onClick={save} disabled={!canSave}
                  className="w-full min-h-[48px] rounded-xl bg-navy-800 hover:bg-navy-900 text-white text-sm font-bold flex items-center justify-center gap-1.5 btn-press disabled:opacity-50">
                  <Icon name="check" size={16} /> Save and capture consent
                </button>
              )}
            </>
          ) : (
            <>
              {mergeInto && (
                <p className="text-[11px] text-violet-700 bg-violet-50 rounded-lg px-3 py-2">Merging into {mergeInto.name} · consent will attach to the existing record</p>
              )}
              <ConsentCapture
                contactName={name.trim()}
                capturedBy={capturedBy}
                onCapture={finish}
                onCancel={() => setStep('details')}
                submitLabel={mergeInto ? 'Merge and finish' : `Add to pipeline · ${owner}`}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
