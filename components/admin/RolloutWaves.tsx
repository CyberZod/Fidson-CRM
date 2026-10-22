import { useState } from 'react';
import { useAdmin } from '../../stores/admin';
import { AdminPage, Badge, Btn, Card, Stat, thCls, tdCls, useNotice, type AdminScreenProps } from './kit';

// AC 11.1: phased rollout, pilot South West first, then region by region across the four channels.
type WaveStatus = 'Live' | 'Training' | 'Scheduled' | 'On hold';
const CHANNELS = ['Institution', 'Trade', 'HCP', 'Consumer'] as const;

interface Wave {
  id: string;
  name: string;
  region: string;
  channels: (typeof CHANNELS)[number][];
  users: number;
  trained: number;
  start: string;
  goLive: string;
  status: WaveStatus;
}

const SEED: Wave[] = [
  { id: 'w0', name: 'Pilot', region: 'South West (Lagos, Ibadan)', channels: ['Institution'], users: 38, trained: 38, start: '08 Sep 2026', goLive: '15 Sep 2026', status: 'Live' },
  { id: 'w1', name: 'Wave 1', region: 'South West', channels: ['Institution', 'Trade', 'HCP', 'Consumer'], users: 96, trained: 71, start: '26 Oct 2026', goLive: '02 Nov 2026', status: 'Training' },
  { id: 'w2', name: 'Wave 2', region: 'North Central (Abuja, Jos, Ilorin)', channels: ['Institution', 'Trade', 'HCP', 'Consumer'], users: 74, trained: 0, start: '16 Nov 2026', goLive: '23 Nov 2026', status: 'Scheduled' },
  { id: 'w3', name: 'Wave 3', region: 'South South and South East', channels: ['Institution', 'Trade', 'HCP', 'Consumer'], users: 118, trained: 0, start: '07 Dec 2026', goLive: '14 Dec 2026', status: 'Scheduled' },
  { id: 'w4', name: 'Wave 4', region: 'North West and North East (Kano, Kaduna)', channels: ['Institution', 'Trade', 'HCP', 'Consumer'], users: 86, trained: 0, start: '11 Jan 2027', goLive: '18 Jan 2027', status: 'Scheduled' },
];

const TONE: Record<WaveStatus, 'leaf' | 'sky' | 'muted' | 'amber'> = { Live: 'leaf', Training: 'sky', Scheduled: 'muted', 'On hold': 'amber' };
const NEXT: Record<WaveStatus, WaveStatus | null> = { Scheduled: 'Training', Training: 'Live', Live: null, 'On hold': 'Scheduled' };

export default function RolloutWaves({ onToast }: AdminScreenProps) {
  const { record } = useAdmin();
  const { notify, banner } = useNotice(onToast);
  const [waves, setWaves] = useState<Wave[]>(SEED);

  const setStatus = (id: string, status: WaveStatus) => {
    const w = waves.find(x => x.id === id);
    if (!w) return;
    setWaves(ws => ws.map(x => (x.id === id ? { ...x, status, trained: status === 'Live' ? x.users : x.trained } : x)));
    record({ area: 'Rollout', what: `${w.name} · ${w.region} status`, before: w.status, after: status });
    notify(status === 'Live' ? `${w.name} is live` : `${w.name} moved to ${status}`, `${w.users} users · ${w.region}`, status === 'On hold' ? 'info' : 'success');
  };

  const live = waves.filter(w => w.status === 'Live');
  const liveUsers = live.reduce((s, w) => s + w.users, 0);
  const total = waves.reduce((s, w) => s + w.users, 0);

  return (
    <AdminPage title="Rollout Waves" icon="map" subtitle="Pilot in the South West, then region by region across all four channels">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Waves" value={waves.length} note={`${live.length} live`} tone="leaf" />
        <Stat label="Users live" value={`${liveUsers}/${total}`} note={`${Math.round((liveUsers / total) * 100)}% of the field force`} />
        <Stat label="Next go-live" value={waves.find(w => w.status !== 'Live')?.goLive ?? 'All live'} note={waves.find(w => w.status !== 'Live')?.name} tone="amber" />
        <Stat label="Channels" value={CHANNELS.length} note={CHANNELS.join(' · ')} />
      </div>

      <Card title="Wave tracker" pad={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead><tr>{['Wave', 'Region', 'Channels', 'Users', 'Trained', 'Training starts', 'Go-live', 'Status', ''].map(h => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-navy-50">
              {waves.map(w => {
                const next = NEXT[w.status];
                const pct = Math.round((w.trained / w.users) * 100);
                return (
                  <tr key={w.id} className="hover:bg-paper">
                    <td className={`${tdCls} font-semibold text-ink`}>{w.name}</td>
                    <td className={tdCls}>{w.region}</td>
                    <td className={tdCls}>
                      <div className="flex flex-wrap gap-1">
                        {CHANNELS.map(c => <span key={c} className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${w.channels.includes(c) ? 'bg-navy-100 text-navy-700' : 'bg-navy-50 text-navy-300 line-through'}`}>{c}</span>)}
                      </div>
                    </td>
                    <td className={`${tdCls} font-mono`}>{w.users}</td>
                    <td className={tdCls}>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-navy-100 overflow-hidden"><div className="h-full bg-leaf-500" style={{ width: `${pct}%` }} /></div>
                        <span className="font-mono">{pct}%</span>
                      </div>
                    </td>
                    <td className={tdCls}>{w.start}</td>
                    <td className={`${tdCls} font-semibold`}>{w.goLive}</td>
                    <td className={tdCls}><Badge tone={TONE[w.status]}>{w.status}</Badge></td>
                    <td className={`${tdCls} text-right whitespace-nowrap`}>
                      <div className="flex justify-end gap-1.5">
                        {w.status !== 'Live' && w.status !== 'On hold' && <Btn kind="ghost" onClick={() => setStatus(w.id, 'On hold')}>Hold</Btn>}
                        {next && <Btn kind={next === 'Live' ? 'primary' : 'secondary'} onClick={() => setStatus(w.id, next)}>{next === 'Live' ? 'Mark go-live' : next === 'Training' ? 'Start training' : 'Resume'}</Btn>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="px-4 py-3 text-[11px] text-navy-500 border-t border-navy-100">A wave goes live only after its go/no-go checklist is met. Users in a wave get access when they are added to the FieldForce-Users group for their region.</p>
      </Card>
      {banner}
    </AdminPage>
  );
}
