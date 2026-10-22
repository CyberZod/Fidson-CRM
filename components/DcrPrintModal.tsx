import { useEffect, useRef } from 'react';
import Icon from './Icon';
import type { DcrRow } from '../stores/fieldCall';

interface DcrPrintModalProps {
  repName: string;
  territory: string;
  date: string;
  submittedAt?: string;
  managerName: string;
  rows: DcrRow[];
  ordersCount: number;
  onClose: () => void;
}

// Print isolates the sheet: everything else on the page is hidden.
const PRINT_CSS = `
@media print {
  body * { visibility: hidden !important; }
  .dcr-sheet, .dcr-sheet * { visibility: visible !important; }
  .dcr-sheet { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; border: 0 !important; max-height: none !important; overflow: visible !important; }
  .dcr-no-print { display: none !important; }
  @page { size: A4 landscape; margin: 12mm; }
}`;

export default function DcrPrintModal({ repName, territory, date, submittedAt, managerName, rows, ordersCount, onClose }: DcrPrintModalProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCloseRef.current(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const samples = rows.reduce((n, r) => n + r.samples, 0);
  const signatures = rows.filter(r => r.signed).length;
  const complaints = rows.reduce((n, r) => n + r.complaints.length, 0);
  const intel = rows.filter(r => r.intel).length;

  const cell = 'border border-navy-200 px-2 py-1.5 align-top';

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-6" role="dialog" aria-modal="true" aria-label="Daily Call Report print preview">
      <style>{PRINT_CSS}</style>
      <div className="absolute inset-0 bg-navy-900/60 dcr-no-print" onClick={onClose} />
      <div className="relative w-full max-w-[1100px] max-h-[94vh] flex flex-col">
        <div className="dcr-no-print flex items-center justify-between gap-2 bg-navy-900 text-white rounded-t-2xl px-4 py-2.5">
          <p className="text-xs font-bold tracking-wider uppercase">Print preview · Fidson DCR form</p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => window.print()} className="px-3 py-1.5 rounded-lg bg-leaf-500 text-white text-xs font-bold flex items-center gap-1.5 btn-press">
              <Icon name="download" size={12} /> Print or save PDF
            </button>
            <button ref={closeRef} type="button" onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center btn-press" aria-label="Close preview">
              <Icon name="x" size={14} />
            </button>
          </div>
        </div>

        <div className="dcr-sheet bg-white rounded-b-2xl shadow-2xl overflow-auto p-5 sm:p-8 text-ink">
          <div className="flex items-start justify-between gap-4 border-b-2 border-navy-800 pb-3">
            <div>
              <p className="font-display text-2xl font-bold text-navy-800 tracking-tight">FIDSON HEALTHCARE PLC</p>
              <p className="text-[11px] text-navy-600">268 Ikorodu Road, Obanikoro, Lagos · Sales &amp; Marketing</p>
            </div>
            <div className="text-right">
              <p className="font-display text-lg font-bold">DAILY CALL REPORT</p>
              <p className="text-[10px] font-mono text-navy-500">Form SM-DCR-01 · Rev 3</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 mt-3 text-[12px]">
            <div><span className="text-navy-500">Representative: </span><span className="font-bold">{repName}</span></div>
            <div><span className="text-navy-500">Date: </span><span className="font-bold">{date}</span></div>
            <div><span className="text-navy-500">Territory: </span><span className="font-bold">{territory}</span></div>
            <div><span className="text-navy-500">Submitted: </span><span className="font-bold">{submittedAt ?? 'Not yet submitted'}</span></div>
          </div>

          <table className="w-full mt-4 border-collapse text-[11px]">
            <thead>
              <tr className="bg-navy-50 text-left">
                <th className={cell}>#</th>
                <th className={cell}>Time</th>
                <th className={cell}>HCP / Customer</th>
                <th className={cell}>Products detailed</th>
                <th className={cell}>Samples (qty · batch)</th>
                <th className={cell}>Market intel</th>
                <th className={cell}>Complaints</th>
                <th className={cell}>Orders</th>
                <th className={cell}>Signed</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td className={cell} colSpan={9}>No calls recorded for this day.</td></tr>
              )}
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className={cell}>{i + 1}</td>
                  <td className={`${cell} font-mono whitespace-nowrap`}>{r.checkIn ? `${r.checkIn} to ${r.time}` : r.time}</td>
                  <td className={cell}><span className="font-bold">{r.hcp}</span><br />{r.institution}</td>
                  <td className={cell}>{r.products.join(', ') || '·'}</td>
                  <td className={cell}>{r.samples > 0 ? r.sampleDetail : '·'}</td>
                  <td className={cell}>{r.intel || '·'}</td>
                  <td className={cell}>{r.complaints.join(', ') || '·'}</td>
                  <td className={cell}>{r.orders.join(', ') || '·'}</td>
                  <td className={cell}>{r.signed ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mt-4 text-[11px]">
            {[
              ['Calls', rows.length],
              ['Samples issued', samples],
              ['Orders', ordersCount],
              ['Intel reports', intel],
              ['Complaints', complaints],
              ['Customer signatures', signatures],
            ].map(([l, v]) => (
              <div key={l} className="border border-navy-200 px-2 py-1.5">
                <p className="text-navy-500">{l}</p>
                <p className="font-display text-base font-bold">{v}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-10 text-[11px]">
            <div>
              <div className="border-b border-navy-800 h-8" />
              <p className="mt-1">Representative: {repName} · Signature and date</p>
            </div>
            <div>
              <div className="border-b border-navy-800 h-8" />
              <p className="mt-1">Manager sign-off: {managerName} (RSM) · Signature and date</p>
            </div>
          </div>
          <p className="mt-6 text-[9px] text-navy-400">Generated by Fidson FieldForce from GPS-verified visit logs. Samples are reconciled against the monthly allocation.</p>
        </div>
      </div>
    </div>
  );
}
