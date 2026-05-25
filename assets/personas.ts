import type { Persona, PersonaKey, ColorKey, ColorPalette, NigeriaRegion } from '../types';

export const PERSONAS: Record<PersonaKey, Persona> = {
  manager: { email: 'tunde.bakare@fidson.com', name: 'Tunde Bakare', role: 'RSM · South-West Region', roleType: 'manager', initials: 'TB', tag: 'RSM', tagColor: 'navy', desc: 'Regional Sales Manager · 12 reps · Lagos & Ibadan', category: 'Field Operations' },
  rep: { email: 'adaeze.okafor@fidson.com', name: 'Adaeze Okafor', role: 'Medical Rep · Lagos · Institution', roleType: 'rep', initials: 'AO', tag: 'REP', tagColor: 'leaf', desc: 'Medical Rep · Institution channel', category: 'Field Operations' },
  asm: { email: 'funmi.adeola@fidson.com', name: 'Funmi Adeola', role: 'ASM · Lekki/V.I. Cluster', roleType: 'asm', initials: 'FA', tag: 'ASM', tagColor: 'sky', desc: 'Area Sales Manager · 4 reps', category: 'Field Operations' },
  fsm: { email: 'ifeanyi.obi@fidson.com', name: 'Ifeanyi Obi', role: 'FSM · Trade South-West', roleType: 'fsm', initials: 'IO', tag: 'FSM', tagColor: 'amber', desc: 'Field Sales Manager · Trade channel', category: 'Field Operations' },
  pm: { email: 'femi.akande@fidson.com', name: 'Dr. Femi Akande', role: 'PM · Respiratory Portfolio', roleType: 'pm', initials: 'FA2', tag: 'PM', tagColor: 'violet', desc: 'Product Manager · Coflin & Tuxil-N', category: 'Product & Marketing' },
  mm: { email: 'tola.adekunle@fidson.com', name: 'Tola Adekunle', role: 'MM · Institution · Nationwide', roleType: 'mm', initials: 'TA', tag: 'MM', tagColor: 'fuchsia', desc: 'Marketing Manager · Cross-product · National', category: 'Product & Marketing' },
  dm: { email: 'kemi.adeyemi@fidson.com', name: 'Kemi Adeyemi', role: 'DM · South Division', roleType: 'dm', initials: 'KA', tag: 'DM', tagColor: 'rose', desc: 'Division Manager · SW, SE, SS · 3 regions', category: 'Leadership' },
  nsm: { email: 'bayo.ogunlana@fidson.com', name: 'Bayo Ogunlana', role: 'NSM · National Sales Manager', roleType: 'nsm', initials: 'BO', tag: 'NSM', tagColor: 'indigo', desc: 'National · 2 divisions · 6 regions · 142 reps', category: 'Leadership' },
};

export const PERSONA_COLOR_MAP: Record<ColorKey, ColorPalette> = {
  leaf: { avBg: 'bg-leaf-500', tagBg: 'bg-leaf-100', tagText: 'text-leaf-700', ring: 'ring-leaf-200', border: 'border-leaf-200', hover: 'hover:border-leaf-500' },
  sky: { avBg: 'bg-sky-500', tagBg: 'bg-sky-100', tagText: 'text-sky-700', ring: 'ring-sky-200', border: 'border-sky-200', hover: 'hover:border-sky-500' },
  navy: { avBg: 'bg-navy-700', tagBg: 'bg-navy-100', tagText: 'text-navy-700', ring: 'ring-navy-200', border: 'border-navy-200', hover: 'hover:border-navy-700' },
  amber: { avBg: 'bg-amber-500', tagBg: 'bg-amber-100', tagText: 'text-amber-700', ring: 'ring-amber-200', border: 'border-amber-200', hover: 'hover:border-amber-500' },
  violet: { avBg: 'bg-violet-500', tagBg: 'bg-violet-100', tagText: 'text-violet-700', ring: 'ring-violet-200', border: 'border-violet-200', hover: 'hover:border-violet-500' },
  rose: { avBg: 'bg-rose-500', tagBg: 'bg-rose-100', tagText: 'text-rose-700', ring: 'ring-rose-200', border: 'border-rose-200', hover: 'hover:border-rose-500' },
  indigo: { avBg: 'bg-indigo-600', tagBg: 'bg-indigo-100', tagText: 'text-indigo-700', ring: 'ring-indigo-200', border: 'border-indigo-200', hover: 'hover:border-indigo-600' },
  fuchsia: { avBg: 'bg-fuchsia-500', tagBg: 'bg-fuchsia-100', tagText: 'text-fuchsia-700', ring: 'ring-fuchsia-200', border: 'border-fuchsia-200', hover: 'hover:border-fuchsia-500' },
};

export const NIGERIA_REGIONS: NigeriaRegion[] = [
  { code: 'NW', name: 'North-West', cities: 'Kano, Kaduna, Sokoto', hq: 'Kano', div: 'north' },
  { code: 'NE', name: 'North-East', cities: 'Maiduguri, Yola, Bauchi', hq: 'Bauchi', div: 'north' },
  { code: 'NC', name: 'North-Central', cities: 'Abuja, Jos, Ilorin', hq: 'Abuja', div: 'north' },
  { code: 'SW', name: 'South-West', cities: 'Lagos, Ibadan, Abeokuta', hq: 'Lagos', div: 'south' },
  { code: 'SE', name: 'South-East', cities: 'Onitsha, Enugu, Aba', hq: 'Enugu', div: 'south' },
  { code: 'SS', name: 'South-South', cities: 'Port Harcourt, Benin, Calabar', hq: 'Port Harcourt', div: 'south' },
];
