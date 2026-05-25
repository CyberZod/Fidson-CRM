// Fidson product catalog used by the visit-planning and detailing flows.
// Marks which SKUs are currently designated Products of Focus.

export interface FidsonProduct {
  id: string;
  name: string;
  category: string;
  focus: boolean;
}

export const PRODUCT_CATALOG: FidsonProduct[] = [
  { id: 'coflin', name: 'Coflin Forte 600mg', category: 'Mucolytic · RX', focus: true },
  { id: 'astrazon', name: 'Astrazon 10mg', category: 'Antihistamine', focus: false },
  { id: 'tuxil', name: 'Tuxil-N Syrup 100ml', category: 'Cough · OTC', focus: false },
];
