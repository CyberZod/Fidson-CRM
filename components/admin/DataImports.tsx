import { useState } from 'react';
import { useAdmin } from '../../stores/admin';
import { AdminPage, Badge, Btn, Card, Modal, Stat, downloadCsv, thCls, tdCls, useNotice, type AdminScreenProps } from './kit';

// AC 9.4: data migration runs with reconciliation against the source counts.
type RunStatus = 'Reconciled' | 'Errors' | 'Running' | 'Queued';

interface ImportError { row: number; field: string; issue: string }
interface ImportRun {
  id: string;
  dataset: 'People' | 'Territories' | 'Customers' | 'Products' | 'National master data';
  source: string;
  sourceCount: number;
  loaded: number;
  errors: ImportError[];
  status: RunStatus;
  lastRun: string;
  by: string;
}

const SEED: ImportRun[] = [
  { id: 'imp-people', dataset: 'People', source: 'Entra ID group FieldForce-Users + HR sheet', sourceCount: 412, loaded: 412, errors: [], status: 'Reconciled', lastRun: 'Today 07:10', by: 'Ngozi Ibe' },
  { id: 'imp-terr', dataset: 'Territories', source: 'Sales Ops territory map (Excel)', sourceCount: 186, loaded: 183, errors: [
    { row: 44, field: 'parent_region', issue: 'Region "Kwara North" not found' },
    { row: 97, field: 'territory_code', issue: 'Duplicate code LAG-MLD-03' },
    { row: 151, field: 'parent_region', issue: 'Region blank' },
  ], status: 'Errors', lastRun: 'Yesterday 16:42', by: 'Kola Adeyemi' },
  { id: 'imp-cust', dataset: 'Customers', source: 'SOA customer master export', sourceCount: 2418, loaded: 2418, errors: [], status: 'Reconciled', lastRun: 'Yesterday 17:05', by: 'Kola Adeyemi' },
  { id: 'imp-prod', dataset: 'Products', source: 'SOA item master', sourceCount: 94, loaded: 91, errors: [
    { row: 12, field: 'pack_size', issue: 'Pack size "100 ml" not in allowed units' },
    { row: 58, field: 'price', issue: 'Price missing for Tuxil-N Syrup 60ml' },
    { row: 77, field: 'sku', issue: 'SKU FID-AST-010 already exists' },
  ], status: 'Errors', lastRun: '2 days ago', by: 'Ngozi Ibe' },
  { id: 'imp-master', dataset: 'National master data', source: 'PCN premises register + NHIA facility list', sourceCount: 38902, loaded: 38902, errors: [], status: 'Reconciled', lastRun: '20 days ago', by: 'Kola Adeyemi' },
];

const STATUS_TONE: Record<RunStatus, 'leaf' | 'rose' | 'sky' | 'muted'> = { Reconciled: 'leaf', Errors: 'rose', Running: 'sky', Queued: 'muted' };

export default function DataImports({ onToast }: AdminScreenProps) {
  const { record } = useAdmin();
  const { notify, banner } = useNotice(onToast);
  const [runs, setRuns] = useState<ImportRun[]>(SEED);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = runs.find(r => r.id === openId) ?? null;

  const rerun = (id: string) => {
    const run = runs.find(r => r.id === id);
    if (!run) return;
    setRuns(rs => rs.map(r => (r.id === id ? { ...r, status: 'Running' } : r)));
    notify(`${run.dataset} import started`, `${run.sourceCount.toLocaleString()} source rows`, 'info');
    setTimeout(() => {
      setRuns(rs => rs.map(r => (r.id === id ? { ...r, status: 'Reconciled', loaded: r.sourceCount, errors: [], lastRun: 'Just now', by: 'Ngozi Ibe' } : r)));
      record({ area: 'Imports', what: `${run.dataset} import re-run`, before: `${run.errors.length} errors · ${run.loaded.toLocaleString()} rows`, after: `0 errors · ${run.sourceCount.toLocaleString()} rows` });
      notify(`${run.dataset} reconciled`, `${run.sourceCount.toLocaleString()} of ${run.sourceCount.toLocaleString()} rows match the source`);
    }, 1600);
  };

  const exportErrors = (r: ImportRun) => {
    downloadCsv(`${r.dataset.toLowerCase().replace(/\s+/g, '-')}-errors.csv`, [['Row', 'Field', 'Issue'], ...r.errors.map(e => [e.row, e.field, e.issue])]);
    notify('Error file downloaded', `${r.errors.length} rows to fix at source`);
  };

  const totalSource = runs.reduce((s, r) => s + r.sourceCount, 0);
  const totalLoaded = runs.reduce((s, r) => s + r.loaded, 0);
  const totalErrors = runs.reduce((s, r) => s + r.errors.length, 0);

  return (
    <AdminPage title="Data Imports" icon="download" subtitle="Migration runs from the source systems, reconciled row for row before go-live">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Datasets" value={runs.length} note="People to national master data" />
        <Stat label="Source rows" value={totalSource.toLocaleString()} />
        <Stat label="Loaded rows" value={totalLoaded.toLocaleString()} note={totalLoaded === totalSource ? 'Matches source' : `${(totalSource - totalLoaded).toLocaleString()} short of source`} tone={totalLoaded === totalSource ? 'leaf' : 'amber'} />
        <Stat label="Open errors" value={totalErrors} note={totalErrors ? 'Fix at source, then re-run' : 'None'} tone={totalErrors ? 'rose' : 'leaf'} />
      </div>

      <Card title="Import runs" pad={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead>
              <tr>
                {['Dataset', 'Source', 'Source rows', 'Loaded', 'Errors', 'Reconciliation', 'Status', 'Last run', ''].map(h => <th key={h} className={thCls}>{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {runs.map(r => {
                const diff = r.sourceCount - r.loaded;
                return (
                  <tr key={r.id} className="hover:bg-paper">
                    <td className={`${tdCls} font-semibold text-ink`}>{r.dataset}</td>
                    <td className={tdCls}>{r.source}</td>
                    <td className={`${tdCls} font-mono`}>{r.sourceCount.toLocaleString()}</td>
                    <td className={`${tdCls} font-mono`}>{r.loaded.toLocaleString()}</td>
                    <td className={tdCls}>
                      {r.errors.length ? <button onClick={() => setOpenId(r.id)} className="text-rose-700 font-bold underline">{r.errors.length} errors</button> : <span className="text-navy-400">0</span>}
                    </td>
                    <td className={tdCls}>{diff === 0 ? <Badge tone="leaf">Matches source</Badge> : <Badge tone="amber">{diff} rows short</Badge>}</td>
                    <td className={tdCls}><Badge tone={STATUS_TONE[r.status]}>{r.status === 'Running' && <span className="w-1.5 h-1.5 rounded-full bg-sky-500 pulse-dot" />}{r.status}</Badge></td>
                    <td className={tdCls}>{r.lastRun}<br /><span className="text-navy-400">{r.by}</span></td>
                    <td className={`${tdCls} text-right`}>
                      <Btn icon="refresh" onClick={() => rerun(r.id)} disabled={r.status === 'Running'}>Re-run</Btn>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="px-4 py-3 text-[11px] text-navy-500 border-t border-navy-100">Each run is idempotent: a re-run updates matching rows by source key and never creates duplicates. Rows that fail validation are held back and listed for correction.</p>
      </Card>

      <Modal open={!!open} title={open ? `${open.dataset} · validation errors` : ''} onClose={() => setOpenId(null)} size="lg"
        footer={open && <>
          <Btn icon="download" onClick={() => exportErrors(open)}>Download error file</Btn>
          <Btn kind="primary" icon="refresh" onClick={() => { rerun(open.id); setOpenId(null); }}>Re-run after fix</Btn>
        </>}>
        {open && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>{['Row', 'Field', 'Issue'].map(h => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-navy-50">
                {open.errors.map(e => (
                  <tr key={e.row}><td className={`${tdCls} font-mono`}>{e.row}</td><td className={`${tdCls} font-mono`}>{e.field}</td><td className={tdCls}>{e.issue}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
      {banner}
    </AdminPage>
  );
}
