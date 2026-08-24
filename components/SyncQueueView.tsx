import { useState } from 'react';
import Icon from './Icon';

// AC 2.9: administrators can see a sync-conflict queue, so no field data is ever silently lost.
// ponytail: scripted conflicts; the real queue is fed by the offline sync engine.
interface Conflict {
  id: string;
  artifact: string;
  rep: string;
  detected: string;
  device: string;
  server: string;
  status: 'pending' | 'kept-device' | 'kept-server';
}

const INITIAL: Conflict[] = [
  {
    id: 'c1', artifact: 'Visit log', rep: 'Bayo Salami', detected: 'Today 14:22',
    device: 'Logged offline 11:05, resent after reconnect',
    server: 'Same visit already synced at 11:04',
    status: 'pending',
  },
  {
    id: 'c2', artifact: 'Itinerary', rep: 'Tope Adeola', detected: 'Today 12:48',
    device: 'Thursday stop changed to Ikeja GH on the phone',
    server: 'Same stop changed to Gbagada GH on the web',
    status: 'pending',
  },
  {
    id: 'c3', artifact: 'Order', rep: 'Yetunde Cole', detected: 'Yesterday 17:31',
    device: 'Order for 40 packs captured twice during signal drop',
    server: 'First capture accepted, second held here',
    status: 'pending',
  },
];

export default function SyncQueueView() {
  const [rows, setRows] = useState<Conflict[]>(INITIAL);
  const resolve = (id: string, keep: 'kept-device' | 'kept-server') =>
    setRows(rs => rs.map(r => (r.id === id ? { ...r, status: keep } : r)));
  const pending = rows.filter(r => r.status === 'pending').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1100px] mx-auto">
      <div className="fade-up rounded-2xl bg-white border border-navy-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
              <Icon name="refresh" size={20} />
            </div>
            <div>
              <h3 className="font-display font-bold text-ink">Sync Conflict Queue</h3>
              <p className="text-xs text-navy-500">Offline changes that could not merge automatically wait here for a decision.</p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${pending ? 'bg-amber-100 text-amber-700' : 'bg-leaf-100 text-leaf-700'}`}>
            {pending ? `${pending} pending` : 'All resolved'}
          </span>
        </div>

        <div className="divide-y divide-navy-100">
          {rows.map(r => (
            <div key={r.id} className="px-5 py-4">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="min-w-0">
                  <p className="font-display font-semibold text-sm text-ink">
                    {r.artifact} · {r.rep}
                    <span className="ml-2 font-mono text-[10px] font-bold text-navy-400 uppercase tracking-wider">{r.detected}</span>
                  </p>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-paper border border-navy-100">
                      <p className="font-bold text-[10px] uppercase tracking-wider text-navy-500">Device says</p>
                      <p className="text-navy-700 mt-1">{r.device}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-paper border border-navy-100">
                      <p className="font-bold text-[10px] uppercase tracking-wider text-navy-500">Server says</p>
                      <p className="text-navy-700 mt-1">{r.server}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {r.status === 'pending' ? (
                    <>
                      <button onClick={() => resolve(r.id, 'kept-server')} className="px-3 py-1.5 rounded-lg border border-navy-200 text-xs font-bold text-navy-700 btn-press hover:bg-navy-50">Keep server</button>
                      <button onClick={() => resolve(r.id, 'kept-device')} className="px-3 py-1.5 rounded-lg bg-leaf-500 text-white text-xs font-bold btn-press hover:bg-leaf-600">Keep device</button>
                    </>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-leaf-100 text-leaf-700 text-[11px] font-bold flex items-center gap-1">
                      <Icon name="checkCircle" size={12} /> {r.status === 'kept-device' ? 'Kept device' : 'Kept server'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 border-t border-navy-100 bg-navy-50/40">
          <p className="text-[11px] text-navy-500">No field data is ever silently lost. A conflicting record is held here, untouched, until a person decides which version stands.</p>
        </div>
      </div>
    </div>
  );
}
