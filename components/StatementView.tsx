import { useState } from 'react';
import Icon from './Icon';
import { useNotice, clockNow } from './useNotice';
import type { ToastInput } from '../types';

interface StatementViewProps {
  customer?: string;
  onToast?: (t: ToastInput) => void;
  showCustomerPicker?: boolean;
}

type LineType = 'Invoice' | 'Payment' | 'Credit note';

interface StatementLine {
  date: string;
  type: LineType;
  doc: string;
  ref: string;
  debit: number;
  credit: number;
}

interface Mismatch {
  doc: string;
  field: string;
  fieldforce: string;
  bc: string;
  cause: string;
}

interface Account {
  customer: string;
  bcNo: string;
  terms: string;
  creditLimit: number;
  opening: number;
  lines: StatementLine[];
  ageing: [number, number, number, number, number];
  mismatch?: Mismatch;
}

const ACCOUNTS: Account[] = [
  {
    customer: 'Lakeshore Specialist Hospital', bcNo: 'C-10482', terms: 'Net 30', creditLimit: 5_000_000, opening: 1_240_000,
    lines: [
      { date: 'May 02', type: 'Payment', doc: 'PMT-55120', ref: 'GTBank transfer', debit: 0, credit: 900_000 },
      { date: 'May 06', type: 'Invoice', doc: 'INV-0409', ref: 'Coflin Forte 600mg × 60', debit: 512_000, credit: 0 },
      { date: 'May 09', type: 'Credit note', doc: 'CN-0071', ref: 'Damaged cartons (2)', debit: 0, credit: 34_000 },
      { date: 'May 12', type: 'Invoice', doc: 'INV-0417', ref: 'Astrazon 10mg × 40', debit: 386_000, credit: 0 },
      { date: 'May 15', type: 'Payment', doc: 'PMT-55188', ref: 'Zenith cheque 004812', debit: 0, credit: 400_000 },
      { date: 'May 18', type: 'Invoice', doc: 'INV-0428', ref: 'Coflin Forte 600mg × 50', debit: 438_000, credit: 0 },
    ],
    ageing: [824_000, 418_000, 0, 0, 0],
    mismatch: { doc: 'PMT-55188', field: 'Amount', fieldforce: '₦400,000', bc: '₦440,000', cause: 'Cheque value keyed short on the field receipt' },
  },
  {
    customer: 'St. Nicholas Hospital', bcNo: 'C-10233', terms: 'Net 30', creditLimit: 3_000_000, opening: 610_000,
    lines: [
      { date: 'May 03', type: 'Invoice', doc: 'INV-0412', ref: 'Tuxil-N Syrup 100ml × 80', debit: 224_000, credit: 0 },
      { date: 'May 10', type: 'Payment', doc: 'PMT-55141', ref: 'Access transfer', debit: 0, credit: 610_000 },
      { date: 'May 14', type: 'Invoice', doc: 'INV-0424', ref: 'Coflin Forte 600mg × 35', debit: 298_000, credit: 0 },
    ],
    ageing: [522_000, 0, 0, 0, 0],
  },
  {
    customer: 'Lagoon Hospital V.I.', bcNo: 'C-10077', terms: 'Net 45', creditLimit: 8_000_000, opening: 2_150_000,
    lines: [
      { date: 'Apr 28', type: 'Invoice', doc: 'INV-0398', ref: 'Coflin Forte 600mg × 120', debit: 1_020_000, credit: 0 },
      { date: 'May 05', type: 'Payment', doc: 'PMT-55126', ref: 'First Bank transfer', debit: 0, credit: 1_500_000 },
      { date: 'May 11', type: 'Invoice', doc: 'INV-0423', ref: 'Astrazon 10mg × 90', debit: 890_000, credit: 0 },
      { date: 'May 16', type: 'Credit note', doc: 'CN-0074', ref: 'Rebate · Q1 volume', debit: 0, credit: 120_000 },
    ],
    ageing: [770_000, 890_000, 420_000, 360_000, 0],
  },
];

const AGE_LABELS = ['Current', '1 to 30 days', '31 to 60', '61 to 90', 'Over 90'];
const naira = (n: number) => `₦${n.toLocaleString()}`;

export default function StatementView({ customer, onToast, showCustomerPicker = true }: StatementViewProps) {
  const { notify, node } = useNotice(onToast);
  const [selected, setSelected] = useState(ACCOUNTS.find(a => a.customer === customer)?.customer ?? ACCOUNTS[0].customer);
  const [resolved, setResolved] = useState<Record<string, string>>({});
  const [syncing, setSyncing] = useState(false);
  const [showRecon, setShowRecon] = useState(false);
  const acc = ACCOUNTS.find(a => a.customer === selected)!;

  const fixed = !!resolved[acc.customer];
  const lines = acc.lines.map(l => (fixed && acc.mismatch?.doc === l.doc ? { ...l, credit: 440_000 } : l));
  let running = acc.opening;
  const rows = lines.map(l => { running += l.debit - l.credit; return { ...l, balance: running }; });
  const closing = running;
  const invoiced = lines.reduce((s, l) => s + (l.type === 'Invoice' ? l.debit : 0), 0);
  const paid = lines.reduce((s, l) => s + (l.type === 'Payment' ? l.credit : 0), 0);
  const credits = lines.reduce((s, l) => s + (l.type === 'Credit note' ? l.credit : 0), 0);
  const ageing = fixed && acc.mismatch ? [acc.ageing[0] - 40_000, ...acc.ageing.slice(1)] : acc.ageing;
  const hasMismatch = !!acc.mismatch && !fixed;
  const syncedAt = resolved[acc.customer] ?? '14:02';

  const retry = () => {
    setSyncing(true);
    window.setTimeout(() => {
      setSyncing(false);
      setResolved(r => ({ ...r, [acc.customer]: clockNow() }));
      notify({ type: 'success', title: 'Reconciled with Business Central', msg: `${acc.customer} · PMT-55188 corrected to ₦440,000 · balances match` });
    }, 1400);
  };

  return (
    <div className="space-y-4">
      {showCustomerPicker && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {ACCOUNTS.map(a => (
            <button
              key={a.customer}
              onClick={() => { setSelected(a.customer); setShowRecon(false); }}
              className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold whitespace-nowrap ${selected === a.customer ? 'bg-navy-700 text-white border-navy-700' : 'bg-white text-navy-700 border-navy-200'}`}
            >{a.customer}</button>
          ))}
        </div>
      )}

      <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-navy-100 flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">Statement of account · 1 to 18 May</p>
            <h3 className="font-display font-bold text-ink">{acc.customer}</h3>
            <p className="text-[11px] text-navy-500 mt-0.5">BC customer {acc.bcNo} · {acc.terms} · credit limit {naira(acc.creditLimit)}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => notify({ type: 'success', title: 'Statement downloaded', msg: `${acc.customer} · PDF saved to Downloads` })} className="px-2.5 py-1.5 rounded-lg border border-navy-200 text-[11px] font-bold text-navy-700 hover:bg-paper btn-press flex items-center gap-1"><Icon name="download" size={12} /> PDF</button>
            <button onClick={() => notify({ type: 'success', title: 'Statement emailed', msg: `Sent to accounts payable at ${acc.customer} from Outlook` })} className="px-2.5 py-1.5 rounded-lg border border-navy-200 text-[11px] font-bold text-navy-700 hover:bg-paper btn-press flex items-center gap-1"><Icon name="mail" size={12} /> Email</button>
          </div>
        </div>

        <div className={`px-4 sm:px-5 py-2.5 flex items-center gap-2 flex-wrap text-[11px] font-bold border-b ${hasMismatch ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-leaf-50 text-leaf-700 border-leaf-100'}`}>
          <Icon name={syncing ? 'refresh' : hasMismatch ? 'alert' : 'checkCircle'} size={13} className={syncing ? 'animate-spin' : ''} />
          <span>Last synced with Business Central {syncedAt} · {hasMismatch ? '1 mismatch' : 'reconciled'}</span>
          {hasMismatch && (
            <>
              <button onClick={() => setShowRecon(!showRecon)} className="underline">{showRecon ? 'Hide detail' : 'See detail'}</button>
              <button onClick={retry} disabled={syncing} className="ml-auto px-2.5 py-1 rounded-md bg-amber-500 text-white btn-press disabled:opacity-60">{syncing ? 'Syncing' : 'Retry sync'}</button>
            </>
          )}
        </div>

        {hasMismatch && showRecon && acc.mismatch && (
          <div className="px-4 sm:px-5 py-3 border-b border-navy-100 bg-paper overflow-x-auto">
            <table className="w-full text-xs min-w-[460px]">
              <thead>
                <tr className="text-navy-500 text-left"><th className="py-1 pr-3">Document</th><th className="py-1 pr-3">Field</th><th className="py-1 pr-3 text-right">FieldForce</th><th className="py-1 pr-3 text-right">Business Central</th><th className="py-1">Likely cause</th></tr>
              </thead>
              <tbody>
                <tr className="text-ink">
                  <td className="py-1.5 pr-3 font-mono font-bold">{acc.mismatch.doc}</td>
                  <td className="py-1.5 pr-3">{acc.mismatch.field}</td>
                  <td className="py-1.5 pr-3 text-right font-mono">{acc.mismatch.fieldforce}</td>
                  <td className="py-1.5 pr-3 text-right font-mono">{acc.mismatch.bc}</td>
                  <td className="py-1.5 text-navy-600">{acc.mismatch.cause}</td>
                </tr>
              </tbody>
            </table>
            <p className="text-[10px] text-navy-500 mt-2">Business Central is the system of record. Retry sync takes its value and updates the field copy.</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-navy-100">
          {[
            { l: 'Opening balance', v: acc.opening },
            { l: 'Invoices', v: invoiced },
            { l: 'Payments', v: -paid },
            { l: 'Credit notes', v: -credits },
            { l: 'Closing balance', v: closing, strong: true },
          ].map(k => (
            <div key={k.l} className={`p-3 bg-white ${k.strong ? 'col-span-2 md:col-span-1' : ''}`}>
              <p className="stat-label text-navy-400">{k.l}</p>
              <p className={`font-mono font-bold mt-0.5 ${k.strong ? 'text-lg text-ink' : 'text-sm text-navy-700'}`}>{k.v < 0 ? `−${naira(-k.v)}` : naira(k.v)}</p>
            </div>
          ))}
        </div>

        <table className="w-full hidden md:table text-xs">
          <thead>
            <tr className="bg-paper border-y border-navy-100 text-navy-500">
              <th className="px-4 py-2 text-left font-bold">Date</th>
              <th className="px-4 py-2 text-left font-bold">Type</th>
              <th className="px-4 py-2 text-left font-bold">Document</th>
              <th className="px-4 py-2 text-left font-bold">Reference</th>
              <th className="px-4 py-2 text-right font-bold">Debit</th>
              <th className="px-4 py-2 text-right font-bold">Credit</th>
              <th className="px-4 py-2 text-right font-bold">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-50">
            <tr className="text-navy-500"><td className="px-4 py-1.5">May 01</td><td className="px-4 py-1.5" colSpan={5}>Opening balance</td><td className="px-4 py-1.5 text-right font-mono">{naira(acc.opening)}</td></tr>
            {rows.map(r => (
              <tr key={r.doc} className={`hover:bg-paper ${hasMismatch && acc.mismatch?.doc === r.doc ? 'bg-amber-50/60' : ''}`}>
                <td className="px-4 py-1.5 text-navy-600">{r.date}</td>
                <td className="px-4 py-1.5">{r.type}</td>
                <td className="px-4 py-1.5 font-mono font-bold text-navy-700">{r.doc}</td>
                <td className="px-4 py-1.5 text-navy-600">{r.ref}</td>
                <td className="px-4 py-1.5 text-right font-mono">{r.debit ? naira(r.debit) : ''}</td>
                <td className="px-4 py-1.5 text-right font-mono">{r.credit ? naira(r.credit) : ''}</td>
                <td className="px-4 py-1.5 text-right font-mono font-bold text-ink">{naira(r.balance)}</td>
              </tr>
            ))}
            <tr className="bg-paper font-bold"><td className="px-4 py-2" colSpan={6}>Closing balance</td><td className="px-4 py-2 text-right font-mono text-ink">{naira(closing)}</td></tr>
          </tbody>
        </table>

        <div className="md:hidden divide-y divide-navy-50">
          {rows.map(r => (
            <div key={r.doc} className={`px-4 py-2.5 flex items-center justify-between gap-3 ${hasMismatch && acc.mismatch?.doc === r.doc ? 'bg-amber-50/60' : ''}`}>
              <div className="min-w-0">
                <p className="text-xs font-bold text-ink">{r.type} <span className="font-mono text-navy-500 font-normal">{r.doc}</span></p>
                <p className="text-[11px] text-navy-500 truncate">{r.date} · {r.ref}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`font-mono text-sm font-bold ${r.debit ? 'text-ink' : 'text-leaf-700'}`}>{r.debit ? naira(r.debit) : `−${naira(r.credit)}`}</p>
                <p className="text-[10px] text-navy-400 font-mono">bal {naira(r.balance)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-navy-100 p-4 sm:p-5">
        <p className="text-[10px] font-bold text-navy-700 tracking-wider uppercase mb-3">Ageing</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {ageing.map((v, i) => (
            <div key={AGE_LABELS[i]} className={`p-2.5 rounded-xl border ${v && i >= 2 ? 'bg-rose-50 border-rose-100' : v && i === 1 ? 'bg-amber-50 border-amber-100' : 'bg-paper border-navy-100'}`}>
              <p className="text-[10px] text-navy-500">{AGE_LABELS[i]}</p>
              <p className={`font-mono text-sm font-bold mt-0.5 ${v && i >= 2 ? 'text-rose-700' : 'text-ink'}`}>{naira(v)}</p>
            </div>
          ))}
        </div>
      </div>
      {node}
    </div>
  );
}
