import Icon from './Icon';

type ActivityCategory = 'approval' | 'field' | 'coaching' | 'admin' | 'meeting' | 'system';

interface ActivityEntry {
  t: string;
  n: string;
  d: string;
  cat: ActivityCategory;
  who: string;
}

const CAT_COLORS: Record<ActivityCategory, string> = {
  approval: 'bg-leaf-50 border-leaf-200 text-leaf-700',
  field: 'bg-sky-50 border-sky-200 text-sky-700',
  coaching: 'bg-violet-50 border-violet-200 text-violet-700',
  admin: 'bg-navy-50 border-navy-200 text-navy-700',
  meeting: 'bg-amber-50 border-amber-200 text-amber-700',
  system: 'bg-paper border-navy-100 text-navy-500',
};

export default function ASMActivityLogView() {
  const activities: ActivityEntry[] = [
    { t: '10:30', n: 'Reviewed Adaeze\'s Lakeshore visit', d: 'Approved 18% discount request', cat: 'approval', who: 'Funmi → Adaeze' },
    { t: '09:55', n: 'Field accompaniment with Bayo', d: 'Joined visit to MedPlus Lekki · 45 min', cat: 'field', who: 'Funmi + Bayo' },
    { t: '09:40', n: '1:1 with Bayo Salami', d: 'Lekki Phase 2 strategy review · Coaching note logged', cat: 'coaching', who: 'Funmi + Bayo' },
    { t: '09:00', n: 'Pushed itinerary changes', d: 'Re-assigned 2 visits from Yetunde to Tope', cat: 'admin', who: 'Funmi' },
    { t: '08:30', n: 'Daily team huddle', d: '4 reps · 8 min · Coflin Q2 focus discussed', cat: 'meeting', who: 'Funmi + 4 reps' },
    { t: '08:15', n: 'Reviewed yesterday\'s DCRs', d: '4 reports · All accepted · Auto-pushed to BM', cat: 'admin', who: 'Funmi' },
    { t: '08:00', n: 'Day started · GPS active', d: 'Lekki office', cat: 'system', who: 'Funmi' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto">
      <div className="rounded-2xl bg-white border border-navy-100 overflow-hidden fade-up">
        <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-display font-bold text-ink">Manager Activity Log</h3>
            <p className="text-xs text-navy-500 mt-0.5">Your daily activities · Auto-captured · Visible to BM Cestra</p>
          </div>
          <span className="px-2 py-1 rounded-full bg-sky-50 text-sky-700 text-[10px] font-bold flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-500 pulse-dot" />RECORDING
          </span>
        </div>

        <div className="p-5">
          <div className="mb-4 p-3 rounded-xl bg-paper border border-navy-100">
            <p className="text-[10px] font-bold text-navy-400 tracking-wider uppercase mb-1">Today's Summary</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { l: '1:1s Conducted', v: '2' },
                { l: 'Field Visits', v: '1' },
                { l: 'Approvals Given', v: '4' },
                { l: 'Time on Platform', v: '4h 20m' },
              ].map(s => (
                <div key={s.l}>
                  <p className="stat-label text-navy-400">{s.l}</p>
                  <p className="font-display text-xl font-bold text-ink mt-0.5">{s.v}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="stat-label text-navy-400 mb-3">Timeline · Wednesday 13 May</p>
          <div className="space-y-1">
            {activities.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-2 hover:bg-paper rounded-lg">
                <div className="font-mono text-[11px] text-navy-500 font-bold w-12 flex-shrink-0 pt-1">{a.t}</div>
                <div className="w-2 h-2 rounded-full bg-sky-500 mt-2 flex-shrink-0 relative">
                  {i < activities.length - 1 && <div className="absolute top-2 left-1/2 -translate-x-1/2 w-px h-8 bg-navy-200" />}
                </div>
                <div className="flex-1 min-w-0 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display font-semibold text-sm text-ink">{a.n}</p>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${CAT_COLORS[a.cat]}`}>{a.cat.toUpperCase()}</span>
                  </div>
                  <p className="text-[11px] text-navy-500 mt-0.5">{a.d}</p>
                  <p className="text-[10px] text-navy-400 mt-0.5 font-mono">{a.who}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
