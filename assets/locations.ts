// Known Lagos call points with real coordinates, so route optimization works on
// actual geography. Reps pick from this list (datalist) when planning visits.
// ponytail: static list · fine for the demo/pilot territory. Wire a geocoding
// API only when reps start visiting locations outside this set.

export interface CallPoint {
  name: string;
  area: string;
  lat: number;
  lng: number;
}

export const CALL_POINTS: CallPoint[] = [
  { name: 'Reddington Hospital VI', area: 'Victoria Island', lat: 6.4281, lng: 3.4216 },
  { name: 'St Nicholas Hospital', area: 'Lagos Island', lat: 6.4490, lng: 3.3998 },
  { name: 'Lagoon Hospital Apapa', area: 'Apapa', lat: 6.4489, lng: 3.3611 },
  { name: 'First City Hospital', area: 'Ikoyi', lat: 6.4400, lng: 3.4200 },
  { name: 'Lagos Island General Hospital', area: 'Lagos Island', lat: 6.4530, lng: 3.3920 },
  { name: 'Eko Hospital Ikeja', area: 'Ikeja', lat: 6.5833, lng: 3.3580 },
  { name: 'Gbagada General Hospital', area: 'Gbagada', lat: 6.5500, lng: 3.3870 },
  { name: 'LUTH Idi-Araba', area: 'Surulere', lat: 6.5180, lng: 3.3560 },
  { name: 'Lakeshore Specialist Hospital', area: 'Lekki Phase 1', lat: 6.4453, lng: 3.4699 },
  { name: 'MedPlus Lekki Phase 1', area: 'Lekki Phase 1', lat: 6.4413, lng: 3.4730 },
  { name: 'Vedic Lifecare Lekki', area: 'Lekki', lat: 6.4490, lng: 3.4760 },
  { name: 'Reddington Lekki', area: 'Lekki', lat: 6.4500, lng: 3.5300 },
];

const byName = new Map(CALL_POINTS.map(p => [p.name.toLowerCase().trim(), p]));

// Resolve a location label to coordinates. Falls back to a deterministic pseudo
// point for free-typed names not in the list, so optimization never crashes.
// ponytail: hash fallback keeps unknown names usable; real pilots stay on the list.
export function coordOf(name: string): { lat: number; lng: number } {
  const hit = byName.get(name.toLowerCase().trim());
  if (hit) return { lat: hit.lat, lng: hit.lng };
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return { lat: 6.44 + (h % 200) / 1000, lng: 3.36 + ((h >> 8) % 200) / 1000 };
}

// Great-circle distance in km.
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const la1 = a.lat * Math.PI / 180, la2 = b.lat * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
