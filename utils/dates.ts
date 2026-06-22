// Live week dates anchored to the real clock so the demo never looks stale.
// "This week" rolls weekends forward to the upcoming Mon–Fri (a rep planning on
// Sat/Sun is working on next week), so "Plan next week" is always genuinely ahead.
// ponytail: Mon–Fri working week only; add Sat if field work ever runs weekends.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = [
  { k: 'mon', l: 'Mon', label: 'Monday' },
  { k: 'tue', l: 'Tue', label: 'Tuesday' },
  { k: 'wed', l: 'Wed', label: 'Wednesday' },
  { k: 'thu', l: 'Thu', label: 'Thursday' },
  { k: 'fri', l: 'Fri', label: 'Friday' },
];

function thisMonday(): Date {
  const x = new Date();
  x.setHours(0, 0, 0, 0);
  const day = x.getDay(); // 0 Sun .. 6 Sat
  const diff = day === 0 ? 1 : day === 6 ? 2 : 1 - day; // weekend -> next Mon
  x.setDate(x.getDate() + diff);
  return x;
}

function mondayFor(offset: number): Date {
  const m = thisMonday();
  m.setDate(m.getDate() + offset * 7);
  return m;
}

function isoWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7) + 3); // nearest Thursday
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  firstThursday.setUTCDate(firstThursday.getUTCDate() - ((firstThursday.getUTCDay() + 6) % 7) + 3);
  return 1 + Math.round((date.getTime() - firstThursday.getTime()) / (7 * 86400000));
}

const fmt = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getDate()}`;
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export interface DaySpec { k: string; l: string; label: string; date: string; today?: boolean; }

// offset 0 = this week, 1 = next week, -1 = last week
export function weekDays(offset = 0): DaySpec[] {
  const mon = mondayFor(offset);
  const now = new Date();
  return WEEKDAYS.map((w, i) => {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    return { ...w, date: fmt(d), today: sameDay(d, now) };
  });
}

export const weekTag = (offset = 0) => `W${isoWeek(mondayFor(offset))}`;

// "Week 26 · Jun 22 – 26, 2026"
export function weekLabel(offset = 0): string {
  const mon = mondayFor(offset);
  const fri = new Date(mon);
  fri.setDate(mon.getDate() + 4);
  const right = mon.getMonth() === fri.getMonth() ? `${fri.getDate()}` : fmt(fri);
  return `Week ${isoWeek(mon)} · ${fmt(mon)} – ${right}, ${fri.getFullYear()}`;
}

// "W26 · Jun 22-26"
export function weekRangeShort(offset = 0): string {
  const mon = mondayFor(offset);
  const fri = new Date(mon);
  fri.setDate(mon.getDate() + 4);
  const right = mon.getMonth() === fri.getMonth() ? `${fri.getDate()}` : fmt(fri);
  return `${weekTag(offset)} · ${fmt(mon)}-${right}`;
}

export const weekId = (offset = 0) => `${weekTag(offset)}-FY${String(mondayFor(offset).getFullYear()).slice(2)}`;

// "Wednesday · Jun 24, 2026"
export function todayLong(): string {
  const d = new Date();
  const wd = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()];
  return `${wd} · ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
