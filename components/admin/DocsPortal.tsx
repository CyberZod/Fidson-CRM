import { useState } from 'react';
import Icon from '../Icon';
import { useAdmin } from '../../stores/admin';
import { AdminPage, Badge, Btn, Card, downloadText, useNotice, type AdminScreenProps } from './kit';

// AC 11.5 handover documentation, AC 11.3 user manuals.
type Kind = 'Runbook' | 'Architecture' | 'Admin guide' | 'User manual';
type Handover = 'Signed off' | 'In review' | 'Draft';

interface Section { h: string; p: string[] }
interface Doc {
  id: string;
  kind: Kind;
  title: string;
  summary: string;
  owner: string;
  updated: string;
  version: string;
  handover: Handover;
  sections: Section[];
}

const SEED: Doc[] = [
  {
    id: 'd-cold', kind: 'Runbook', title: 'Cold start and full recovery', summary: 'Bring the platform up from nothing in a new Azure region.',
    owner: 'Kola Adeyemi (Tales Support)', updated: '15 Oct 2026', version: '1.3', handover: 'Signed off',
    sections: [
      { h: 'When to use this runbook', p: ['Use it when the primary region is unavailable for more than 30 minutes, or when the database cannot be recovered in place. The target recovery time is 4 hours and the target data loss is no more than 15 minutes.'] },
      { h: 'Before you start', p: ['You need Owner rights on the FieldForce subscription, access to the jump host, and the release tag of the last good deployment. Tell the support desk lead so they can post a holding message to users.'] },
      { h: 'Steps', p: ['Deploy the infrastructure from the release tag. Restore the latest point-in-time backup into the new database server. Apply migrations and confirm the schema version.', 'Rotate the API secrets, restart the API, then point DNS at the new front door. Sign in as a test rep, log a visit, and approve it as an RSM before declaring recovery.'] },
      { h: 'After recovery', p: ['Record the recovery time in Go-live Readiness and raise a post-incident review within two working days.'] },
    ],
  },
  {
    id: 'd-sync', kind: 'Runbook', title: 'Sync conflicts and stuck devices', summary: 'What to do when a rep reports data that did not reach the server.',
    owner: 'Kola Adeyemi (Tales Support)', updated: '09 Oct 2026', version: '1.1', handover: 'In review',
    sections: [
      { h: 'Check the sync queue first', p: ['Most reports are records held in the sync-conflict queue. Open it from the admin console, find the rep, and decide which version stands. Nothing in the queue is ever deleted without a decision.'] },
      { h: 'If the device shows pending items', p: ['Ask the rep to open the app on Wi-Fi and keep it in the foreground for two minutes. If items stay pending, collect the device log from Settings and attach it to the ticket.'] },
    ],
  },
  {
    id: 'd-arch', kind: 'Architecture', title: 'System architecture overview', summary: 'Components, data flow, and where each piece runs.',
    owner: 'Tales Consulting', updated: '02 Oct 2026', version: '2.0', handover: 'Signed off',
    sections: [
      { h: 'Components', p: ['The rep app is an installable web app that works offline and syncs through the API. Managers use the same web app on desktop. The API runs on Azure App Service and stores data in Azure Database for PostgreSQL. Files and photos go to Blob Storage.'] },
      { h: 'Identity', p: ['Sign-in uses Microsoft Entra ID only. Access follows the FieldForce-Users security group, so removing a person from the group revokes access on their next request.'] },
      { h: 'Integrations', p: ['Orders are posted to SOA for invoicing. Customer and product masters are read from SOA nightly. Email goes through Microsoft 365.'] },
    ],
  },
  {
    id: 'd-admin', kind: 'Admin guide', title: 'Platform admin guide', summary: 'People, territories, catalogue, permissions, forms and workflows.',
    owner: 'Ngozi Ibe', updated: '18 Oct 2026', version: '1.0', handover: 'Signed off',
    sections: [
      { h: 'Adding a person', p: ['Add the person to the FieldForce-Users group in Entra ID, then add them in People and Roles with their role, territory and manager. They can sign in straight away.'] },
      { h: 'Changing approval rules', p: ['Edit the chain in the Workflow Builder and publish. The new version applies to requests raised after publishing. Requests already in flight finish on the old version.'] },
      { h: 'Audit', p: ['Every change in the admin console is written to the audit log with who, what, before and after values, time and device. Export it as CSV for quarterly review.'] },
    ],
  },
  {
    id: 'd-rep', kind: 'User manual', title: 'Medical rep manual', summary: 'Plan your week, check in, log visits and place orders from the phone.',
    owner: 'Fidson Sales Training', updated: '20 Oct 2026', version: '1.2', handover: 'Signed off',
    sections: [
      { h: 'Install the app', p: ['Open fieldforce.fidson.com on your phone, sign in with your Fidson Microsoft account, then choose Add to Home Screen.'] },
      { h: 'Plan your week', p: ['Build next week\'s itinerary by Friday and submit it to your manager. Once approved, check-in opens for each planned stop.'] },
      { h: 'Working without signal', p: ['Log visits as normal. They save on the phone and send when you are back online. The banner at the top shows how many are waiting.'] },
    ],
  },
  {
    id: 'd-mgr', kind: 'User manual', title: 'Manager manual', summary: 'Approve itineraries and discounts, coach your team, read reports.',
    owner: 'Fidson Sales Training', updated: '20 Oct 2026', version: '1.0', handover: 'In review',
    sections: [
      { h: 'Approvals', p: ['Pending itineraries, discounts and clinical meeting requests appear on your dashboard. Requests you do not act on escalate after the timeout set by the admin.'] },
      { h: 'Team view', p: ['Open your team to see each rep\'s visits this week, coverage gaps, and open commitments to customers.'] },
    ],
  },
  {
    id: 'd-support', kind: 'Admin guide', title: 'Support desk guide', summary: 'Triage, escalation contacts and service levels.',
    owner: 'Kola Adeyemi (Tales Support)', updated: '12 Oct 2026', version: '0.9', handover: 'Draft',
    sections: [
      { h: 'Service levels', p: ['Priority 1 issues are acknowledged within 30 minutes during working hours. Priority 2 within 4 hours. Everything else within one working day.'] },
    ],
  },
];

const KIND_ICON: Record<Kind, 'refresh' | 'layers' | 'settings' | 'file'> = { Runbook: 'refresh', Architecture: 'layers', 'Admin guide': 'settings', 'User manual': 'file' };
const HTONE: Record<Handover, 'leaf' | 'amber' | 'muted'> = { 'Signed off': 'leaf', 'In review': 'amber', Draft: 'muted' };

export default function DocsPortal({ onToast }: AdminScreenProps) {
  const { record } = useAdmin();
  const { notify, banner } = useNotice(onToast);
  const [docs, setDocs] = useState<Doc[]>(SEED);
  const [kind, setKind] = useState<'All' | Kind>('All');
  const [openId, setOpenId] = useState<string | null>(null);
  const open = docs.find(d => d.id === openId);

  const setHandover = (id: string, handover: Handover) => {
    const d = docs.find(x => x.id === id);
    if (!d) return;
    setDocs(ds => ds.map(x => (x.id === id ? { ...x, handover } : x)));
    record({ area: 'Docs', what: `${d.title} handover`, before: d.handover, after: handover });
    notify(handover === 'Signed off' ? 'Handover signed off' : `Moved to ${handover}`, d.title);
  };

  const download = (d: Doc) => {
    downloadText(`${d.title.toLowerCase().replace(/\s+/g, '-')}-v${d.version}.txt`,
      `${d.title}\nVersion ${d.version} · ${d.updated} · ${d.owner}\n\n${d.sections.map(s => `${s.h}\n\n${s.p.join('\n\n')}`).join('\n\n')}\n`);
    notify('Downloaded', `${d.title} v${d.version}`);
  };

  if (open) {
    return (
      <AdminPage title={open.title} icon={KIND_ICON[open.kind]} wide={false} subtitle={`${open.kind} · v${open.version} · updated ${open.updated} · ${open.owner}`}
        actions={<>
          <Btn icon="chevronLeft" onClick={() => setOpenId(null)}>All documents</Btn>
          <Btn icon="download" onClick={() => download(open)}>Download</Btn>
        </>}>
        <Card>
          <article className="max-w-prose space-y-5">
            {open.sections.map(s => (
              <section key={s.h}>
                <h3 className="font-display font-bold text-ink text-base">{s.h}</h3>
                {s.p.map((p, i) => <p key={i} className="text-sm text-navy-700 leading-relaxed mt-2">{p}</p>)}
              </section>
            ))}
          </article>
        </Card>
        <Card title="Handover" actions={<Badge tone={HTONE[open.handover]}>{open.handover}</Badge>}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-navy-600">Fidson IT signs off each document once it has been read and tested against the live system.</p>
            <div className="flex gap-2">
              {open.handover === 'Draft' && <Btn onClick={() => setHandover(open.id, 'In review')}>Send for review</Btn>}
              {open.handover !== 'Signed off'
                ? <Btn kind="primary" icon="check" onClick={() => setHandover(open.id, 'Signed off')}>Sign off handover</Btn>
                : <Btn kind="ghost" onClick={() => setHandover(open.id, 'In review')}>Reopen for review</Btn>}
            </div>
          </div>
        </Card>
        {banner}
      </AdminPage>
    );
  }

  const shown = kind === 'All' ? docs : docs.filter(d => d.kind === kind);
  const signed = docs.filter(d => d.handover === 'Signed off').length;

  return (
    <AdminPage title="Documentation" icon="file" subtitle={`Runbooks, architecture, admin guides and user manuals · ${signed} of ${docs.length} handed over`}>
      <div className="flex items-center gap-2 flex-wrap">
        {(['All', 'Runbook', 'Architecture', 'Admin guide', 'User manual'] as const).map(k => (
          <button key={k} onClick={() => setKind(k)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold btn-press ${kind === k ? 'bg-navy-800 text-white' : 'bg-white border border-navy-200 text-navy-600 hover:bg-paper'}`}>
            {k}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {shown.map(d => (
          <button key={d.id} onClick={() => setOpenId(d.id)}
            className="fade-up text-left p-4 rounded-2xl bg-white border border-navy-100 hover:border-navy-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400">
            <div className="flex items-start justify-between gap-2">
              <div className="w-9 h-9 rounded-lg bg-navy-50 text-navy-600 flex items-center justify-center"><Icon name={KIND_ICON[d.kind]} size={16} /></div>
              <Badge tone={HTONE[d.handover]}>{d.handover}</Badge>
            </div>
            <p className="font-display font-semibold text-sm text-ink mt-3">{d.title}</p>
            <p className="text-xs text-navy-500 mt-1">{d.summary}</p>
            <p className="text-[10px] text-navy-400 mt-3 font-mono uppercase tracking-wider">{d.kind} · v{d.version} · {d.updated}</p>
          </button>
        ))}
      </div>
      {banner}
    </AdminPage>
  );
}
