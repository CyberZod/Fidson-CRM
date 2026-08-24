import Icon from './Icon';

interface TeamMember {
  n: string;
  initials: string;
  role: string;
  territory: string;
  you?: boolean;
}

// The same team ASMTeamView shows from the manager's side, seen from below (AC 1.2).
const MANAGER = { n: 'Funmi Adeola', initials: 'FA', role: 'Area Sales Manager', scope: 'Lekki / V.I. Cluster' };

const MEMBERS: TeamMember[] = [
  { n: 'Adaeze Okafor', initials: 'AO', role: 'Medical Rep · Institution', territory: 'V.I. East', you: true },
  { n: 'Tope Adeola', initials: 'TA', role: 'Medical Rep · Institution', territory: 'Lekki Phase 1' },
  { n: 'Bayo Salami', initials: 'BS', role: 'Medical Rep · Institution', territory: 'Lekki Phase 2' },
  { n: 'Yetunde Cole', initials: 'YC', role: 'Medical Rep · Institution', territory: 'V.I. West' },
];

export default function RepTeamView() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[900px] mx-auto">
      <div className="fade-up rounded-2xl bg-white border border-navy-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-navy-100 flex items-center justify-between">
          <h3 className="font-display font-bold text-ink text-sm">Lekki / V.I. Cluster</h3>
          <span className="text-[10px] font-bold text-navy-500 tracking-wider uppercase">Institution Channel</span>
        </div>

        <div className="px-4 py-3 border-b border-navy-100 bg-navy-50/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-navy-700 text-white flex items-center justify-center font-display font-bold text-sm">
            {MANAGER.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-semibold text-ink text-sm">{MANAGER.n}</p>
            <p className="text-xs text-navy-500">{MANAGER.role} · {MANAGER.scope}</p>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-navy-100 text-navy-700 tracking-wider uppercase">Manager</span>
        </div>

        <div className="p-2">
          {MEMBERS.map((m) => (
            <div key={m.n} className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-navy-50/60">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-sm ${m.you ? 'bg-leaf-500 text-white' : 'bg-navy-100 text-navy-700'}`}>
                {m.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-ink text-sm">
                  {m.n}
                  {m.you && <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-leaf-100 text-leaf-700 tracking-wider uppercase">You</span>}
                </p>
                <p className="text-xs text-navy-500">{m.role}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-navy-600">
                <Icon name="location" size={14} />
                <span className="font-medium">{m.territory}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 py-2.5 border-t border-navy-100 bg-navy-50/40">
          <p className="text-[11px] text-navy-500">You see your own team only. Membership, roles and territories are managed by Fidson.</p>
        </div>
      </div>
    </div>
  );
}
