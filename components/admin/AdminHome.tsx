import Icon from '../Icon';
import type { IconName } from '../../types';
import { useAdmin, formatAuditTime } from '../../stores/admin';
import { AdminPage, Badge, Card, Stat, type Tone } from './kit';

export interface AdminSection {
  key: string;
  label: string;
  icon: IconName;
  group: string;
  desc: string;
}

export const ADMIN_SECTIONS: AdminSection[] = [
  { key: 'admin-people', label: 'People & Roles', icon: 'users', group: 'Directory', desc: 'Add people, change roles and reporting lines, deactivate' },
  { key: 'admin-territories', label: 'Territories', icon: 'map', group: 'Directory', desc: 'Division, region, area and territory tree · assign reps' },
  { key: 'admin-customers', label: 'Customers', icon: 'location', group: 'Directory', desc: 'Add customers and institutions with territory and channel' },
  { key: 'admin-duplicates', label: 'Duplicate Merge', icon: 'layers', group: 'Directory', desc: 'Review suspected duplicate contacts and merge' },
  { key: 'admin-catalogue', label: 'Product Catalogue', icon: 'pill', group: 'Configuration', desc: 'SKUs, pack sizes, prices, detailing status' },
  { key: 'admin-permissions', label: 'Permissions', icon: 'lock', group: 'Configuration', desc: 'Role by module access: hidden, view, edit, approve' },
  { key: 'admin-forms', label: 'Form Builder', icon: 'edit', group: 'Configuration', desc: 'Fields on visit log, retail audit and complaint forms' },
  { key: 'admin-workflows', label: 'Approval Workflows', icon: 'send', group: 'Configuration', desc: 'Approval chains, thresholds, escalation, delegation' },
  { key: 'admin-rules', label: 'Rules Studio', icon: 'bell', group: 'Intelligence', desc: 'Alert rules in plain language, dry run, publish' },
  { key: 'admin-models', label: 'Model Catalogue', icon: 'sparkles', group: 'Intelligence', desc: 'Model per use case and month-to-date spend vs cap' },
  { key: 'admin-sync', label: 'Sync Conflicts', icon: 'refresh', group: 'Operations', desc: 'Offline changes waiting for a decision' },
  { key: 'admin-imports', label: 'Data Imports', icon: 'download', group: 'Operations', desc: 'Import runs, errors and reconciliation vs source' },
  { key: 'admin-audit', label: 'Audit Log', icon: 'fingerprint', group: 'Operations', desc: 'Every config change: who, what, before and after' },
  { key: 'admin-golive', label: 'Go-Live Readiness', icon: 'checkCircle', group: 'Rollout', desc: 'UAT, load, DR drill, runbook, go/no-go' },
  { key: 'admin-rollout', label: 'Rollout Waves', icon: 'flag', group: 'Rollout', desc: 'Pilot and regional waves across four channels' },
  { key: 'admin-feedback', label: 'Pilot Feedback', icon: 'barChart', group: 'Rollout', desc: 'Feedback rounds, themes and sign-off' },
  { key: 'admin-docs', label: 'Docs Portal', icon: 'file', group: 'Rollout', desc: 'Runbooks, architecture, admin guides, user manuals' },
  { key: 'admin-learn', label: 'Training', icon: 'target', group: 'Rollout', desc: 'Role curricula, tutorials and quizzes' },
];

const ATTENTION: { key: string; text: string; tone: Tone }[] = [
  { key: 'admin-duplicates', text: '3 suspected duplicate contacts to review', tone: 'amber' },
  { key: 'admin-sync', text: '3 sync conflicts pending', tone: 'amber' },
  { key: 'admin-models', text: 'Assistant spend at 97% of monthly cap', tone: 'rose' },
  { key: 'admin-golive', text: 'Wave 1 go/no-go before go-live on 02 Nov', tone: 'sky' },
];

export default function AdminHome({ onNavigate }: { onNavigate: (viewKey: string) => void }) {
  const { people, audit } = useAdmin();
  const active = people.filter(p => p.active).length;
  const groups = Array.from(new Set(ADMIN_SECTIONS.map(s => s.group)));

  return (
    <AdminPage title="Platform Admin" subtitle="Ngozi Ibe · Fidson IT · changes here apply without a release and are written to the audit log" icon="settings">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Active users" value={active} note={`${people.length - active} deactivated`} tone="leaf" />
        <Stat label="Config changes · 7 days" value={audit.filter(a => Date.now() - new Date(a.at).getTime() < 7 * 864e5).length} note="all in the audit log" />
        <Stat label="Rollout" value="Wave 1" note="Pilot SW live · Wave 1 in training" tone="leaf" />
        <Stat label="Critical issues open" value={0} note="go-live gate clear" tone="leaf" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {groups.map(g => (
            <div key={g}>
              <p className="stat-label text-navy-400 mb-2">{g}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                {ADMIN_SECTIONS.filter(s => s.group === g).map(s => (
                  <button key={s.key} onClick={() => onNavigate(s.key)}
                    className="text-left p-3 rounded-xl bg-white border border-navy-100 hover:border-navy-300 hover:bg-paper btn-press focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-navy-50 text-navy-600 flex items-center justify-center flex-shrink-0">
                      <Icon name={s.icon} size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-display font-semibold text-sm text-ink">{s.label}</p>
                      <p className="text-[11px] text-navy-500 leading-snug mt-0.5">{s.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <Card title="Needs attention" pad={false}>
            <div className="divide-y divide-navy-100">
              {ATTENTION.map(a => (
                <button key={a.key + a.text} onClick={() => onNavigate(a.key)}
                  className="w-full text-left px-4 py-3 flex items-center justify-between gap-2 hover:bg-paper focus:outline-none focus-visible:bg-paper">
                  <span className="text-xs text-navy-700">{a.text}</span>
                  <Badge tone={a.tone}>Open</Badge>
                </button>
              ))}
            </div>
          </Card>
          <Card title="Recent changes" actions={<button onClick={() => onNavigate('admin-audit')} className="text-[11px] font-bold text-leaf-700 hover:underline">Audit log</button>} pad={false}>
            <div className="divide-y divide-navy-100">
              {audit.slice(0, 6).map(a => (
                <div key={a.id} className="px-4 py-2.5">
                  <p className="text-xs font-semibold text-ink">{a.what}</p>
                  <p className="text-[10px] text-navy-500 mt-0.5">{a.who} · {a.area} · {formatAuditTime(a.at)}</p>
                </div>
              ))}
            </div>
          </Card>
          <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-[11px] text-sky-800">
            Access follows the FieldForce-Users Entra ID group. Removing a person there revokes access on their next request.
          </div>
        </div>
      </div>
    </AdminPage>
  );
}
