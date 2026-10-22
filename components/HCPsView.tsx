import { useMemo, useState } from 'react';
import Icon from './Icon';
import Customer360 from './Customer360';
import AddContactSheet, { type AddContactResult } from './AddContactSheet';
import { ACCOUNTS, RSM_SCOPE, canView, type ViewerScope } from '../assets/customers';
import { SEED_LEADS, type Lead } from '../assets/leads';

interface HCPsViewProps {
  searchQuery: string;
  viewer?: ViewerScope;
  leads?: Lead[];
}

interface HCP {
  accountId: string;
  t: string;
  loc: string;
  tier: string;
  last: string;
  value: string;
}

const ROWS: HCP[] = [
  { accountId: 'acc-lakeshore', t: 'Hospital · Institutional', loc: 'Lekki', tier: 'A+', last: '10:04 AM', value: '₦18.4M' },
  { accountId: 'acc-reddington', t: 'Hospital · Private', loc: 'Victoria Island', tier: 'A', last: 'Yesterday', value: '₦24.1M' },
  { accountId: 'acc-stnicholas', t: 'Hospital · Private', loc: 'Lagos Island', tier: 'A', last: '4 days ago', value: '₦9.8M' },
  { accountId: 'acc-healthplus', t: 'Pharmacy · Chain', loc: 'Surulere', tier: 'B+', last: 'Yesterday', value: '₦6.3M' },
  { accountId: 'acc-medplus', t: 'Pharmacy · Chain', loc: 'Yaba', tier: 'B', last: '12 days ago', value: '₦9.7M' },
  { accountId: 'acc-lagoon', t: 'Hospital · Private', loc: 'Ikoyi', tier: 'A', last: 'Today', value: '₦11.1M' },
  { accountId: 'acc-evercare', t: 'Hospital · Private', loc: 'Lekki', tier: 'A', last: '6 days ago', value: '₦14.6M' },
  { accountId: 'acc-eha', t: 'Clinic · Specialist', loc: 'Lekki', tier: 'B+', last: '1 week ago', value: '₦2.8M' },
  { accountId: 'acc-uch', t: 'Hospital · Teaching', loc: 'Ibadan', tier: 'A+', last: '3 days ago', value: '₦21.3M' },
  { accountId: 'acc-akth', t: 'Hospital · Teaching', loc: 'Kano', tier: 'A', last: '5 days ago', value: '₦16.9M' },
];

const shortRep = (n?: string) => (n ? `${n.split(' ')[0]} ${n.split(' ')[1]?.[0] ?? ''}.` : '·');

export default function HCPsView({ searchQuery, viewer = RSM_SCOPE, leads = SEED_LEADS }: HCPsViewProps) {
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const rows = useMemo(() => ROWS.map(r => ({ ...r, account: ACCOUNTS.find(a => a.id === r.accountId)! })), []);

  const filteredHcps = useMemo(() => {
    let result = rows;
    if (tierFilter !== 'all') result = result.filter(h => h.tier.startsWith(tierFilter));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(h => h.account.name.toLowerCase().includes(q) || h.loc.toLowerCase().includes(q) || (h.account.rep ?? '').toLowerCase().includes(q));
    }
    return result;
  }, [rows, tierFilter, searchQuery]);

  const opened = openId ? ACCOUNTS.find(a => a.id === openId) ?? null : null;

  const onSaved = ({ lead, mergeInto }: AddContactResult) => {
    setAdding(false);
    setBanner(mergeInto
      ? `${lead.name} merged into ${mergeInto.name} · consent ${lead.consentRecord?.receiptId} attached`
      : `${lead.name} added · ${lead.assignmentNote} · consent ${lead.consentRecord?.receiptId}`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { l: 'Total HCPs', v: '342', d: '+14 this month' },
          { l: 'Hospitals', v: '87', d: '68% institutional' },
          { l: 'Pharmacies', v: '198', d: 'Trade channel' },
          { l: 'Top Tier (A+)', v: '24', d: 'High volume' },
        ].map((k, i) => (
          <div key={i} className={`fade-up stagger-${i + 1} p-5 rounded-2xl bg-white border border-navy-100`}>
            <p className="stat-label text-navy-400">{k.l}</p>
            <p className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">{k.v}</p>
            <p className="text-[11px] text-navy-500 mt-1">{k.d}</p>
          </div>
        ))}
      </div>

      {banner && (
        <div role="status" className="flex items-start gap-2 p-3 rounded-xl bg-leaf-50 border border-leaf-200 text-xs text-leaf-800 fade-up">
          <Icon name="checkCircle" size={14} className="flex-shrink-0 mt-0.5" />
          <span className="flex-1">{banner}</span>
          <button type="button" onClick={() => setBanner(null)} aria-label="Dismiss" className="text-leaf-700"><Icon name="x" size={14} /></button>
        </div>
      )}

      <div className="fade-up stagger-2 rounded-2xl bg-white border border-navy-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-display font-bold text-ink">HCP Database</h3>
            <p className="text-xs text-navy-500 mt-0.5">{filteredHcps.length} of {rows.length} accounts · your scope: South-West, all channels</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-paper rounded-lg p-1">
              {[{ k: 'all', l: 'All' }, { k: 'A', l: 'A Tier' }, { k: 'B', l: 'B Tier' }].map(t => (
                <button
                  key={t.k}
                  onClick={() => setTierFilter(t.k)}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                    tierFilter === t.k ? 'bg-white text-navy-700 shadow-sm' : 'text-navy-500'
                  }`}
                >{t.l}</button>
              ))}
            </div>
            <button onClick={() => setAdding(true)} className="px-3 py-1.5 rounded-lg bg-navy-700 text-white text-xs font-bold flex items-center gap-1.5 btn-press">
              <Icon name="plus" size={12} /> Add HCP
            </button>
          </div>
        </div>

        <div className="divide-y divide-navy-50">
          {filteredHcps.length === 0 ? (
            <div className="py-12 text-center text-sm text-navy-500">No HCPs match these filters</div>
          ) : filteredHcps.map(h => {
            const allowed = canView(viewer, h.account);
            return (
              <button
                key={h.accountId}
                type="button"
                onClick={() => setOpenId(h.accountId)}
                className={`w-full text-left px-5 py-3 transition-colors flex items-center gap-3 sm:gap-4 focus:outline-none focus:bg-paper ${allowed ? 'hover:bg-paper' : 'bg-paper/60'}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${allowed ? 'bg-navy-50' : 'bg-rose-50'}`}>
                  <Icon name={!allowed ? 'lock' : h.t.includes('Hospital') ? 'flask' : h.t.includes('Pharmacy') ? 'pill' : 'users'} size={18} className={allowed ? 'text-navy-700' : 'text-rose-600'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-display font-semibold text-sm truncate ${allowed ? 'text-ink' : 'text-navy-500'}`}>{h.account.name}</p>
                  <p className="text-[11px] text-navy-500 truncate">{h.t} · {h.loc}</p>
                  {!allowed && <p className="text-[10px] font-bold text-rose-700 mt-0.5">Outside your territory · no access</p>}
                </div>
                <div className="hidden sm:block">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold font-mono ${
                    h.tier.startsWith('A') ? 'bg-leaf-100 text-leaf-700' : 'bg-navy-100 text-navy-700'
                  }`}>{h.tier}</span>
                </div>
                <div className="hidden md:block text-right w-20">
                  <p className="font-mono text-sm font-bold text-ink">{allowed ? h.value : '•••'}</p>
                  <p className="text-[10px] text-navy-400">LTV</p>
                </div>
                <div className="hidden lg:block text-right w-24">
                  <p className="text-xs text-navy-700 font-medium">{shortRep(h.account.rep)}</p>
                  <p className="text-[10px] text-navy-400">{h.last}</p>
                </div>
                <Icon name="chevronRight" size={16} className="text-navy-400" />
              </button>
            );
          })}
        </div>
      </div>

      {opened && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setOpenId(null)}>
          <div className="absolute inset-0 bg-navy-900/40" />
          <div className="relative w-full max-w-2xl h-full bg-paper shadow-2xl slide-in-right overflow-y-auto p-4 sm:p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <p className="stat-label text-navy-400">Customer 360</p>
              <button type="button" onClick={() => setOpenId(null)} aria-label="Close" className="text-navy-400 hover:text-navy-700"><Icon name="x" size={18} /></button>
            </div>
            <Customer360 key={opened.id} account={opened} viewer={viewer} onClose={() => setOpenId(null)} />
          </div>
        </div>
      )}

      {adding && (
        <AddContactSheet
          leads={leads}
          capturedBy={viewer.name}
          source="RSM · Add HCP"
          onSave={onSaved}
          onOpenExisting={m => { setAdding(false); if (m.kind === 'account') setOpenId(m.id); else setBanner(`${m.name} is already an open lead of ${m.owner} · see Team Pipeline`); }}
          onClose={() => setAdding(false)}
        />
      )}
    </div>
  );
}
