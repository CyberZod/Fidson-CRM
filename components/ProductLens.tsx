import { useState } from 'react';
import Icon from './Icon';
import { PRODUCT_CATALOG, type FidsonProduct } from '../assets/products';

interface ProductLensProps {
  scope?: string;
  accent?: 'leaf' | 'violet' | 'navy' | 'emerald' | 'teal';
}

export interface ProductFacets {
  revenue: string;
  adoption: string;
  sales: string;
  topRep: string;
  mentions: number;
  samples: number;
}

const FACETS: Record<string, ProductFacets> = {
  coflin: { revenue: '₦8.2M', adoption: '63%', sales: '47 / 80 cartons', topRep: 'Adaeze Okafor', mentions: 124, samples: 38 },
  astrazon: { revenue: '₦5.1M', adoption: '41%', sales: '32 / 70 cartons', topRep: 'Tope Adeola', mentions: 86, samples: 21 },
  tuxil: { revenue: '₦3.4M', adoption: '28%', sales: '18 / 60 cartons', topRep: 'Chinedu Eze', mentions: 52, samples: 14 },
};

export default function ProductLens({ scope = 'Lagos Region · Q2 FY26', accent = 'leaf' }: ProductLensProps) {
  const [selected, setSelected] = useState<FidsonProduct | null>(null);
  const accentClasses = {
    leaf: { active: 'bg-leaf-600 text-white border-leaf-600', focusPill: 'bg-leaf-100 text-leaf-700', headerIcon: 'text-leaf-700', headerBg: 'bg-leaf-50' },
    violet: { active: 'bg-violet-600 text-white border-violet-600', focusPill: 'bg-violet-100 text-violet-700', headerIcon: 'text-violet-700', headerBg: 'bg-violet-50' },
    navy: { active: 'bg-navy-700 text-white border-navy-700', focusPill: 'bg-navy-100 text-navy-700', headerIcon: 'text-navy-700', headerBg: 'bg-navy-50' },
    emerald: { active: 'bg-emerald-600 text-white border-emerald-600', focusPill: 'bg-emerald-100 text-emerald-700', headerIcon: 'text-emerald-700', headerBg: 'bg-emerald-50' },
    teal: { active: 'bg-teal-600 text-white border-teal-600', focusPill: 'bg-teal-100 text-teal-700', headerIcon: 'text-teal-700', headerBg: 'bg-teal-50' },
  }[accent];

  const facets = selected ? FACETS[selected.id] : null;

  return (
    <div className="rounded-2xl bg-white border border-navy-100 p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accentClasses.headerBg}`}>
            <Icon name="filter" size={14} className={accentClasses.headerIcon} />
          </div>
          <div>
            <p className="font-display font-bold text-ink text-sm">Product Lens</p>
            <p className="text-[10px] text-navy-500">{scope}</p>
          </div>
        </div>
        {selected && (
          <button onClick={() => setSelected(null)} className="text-[10px] font-bold text-navy-500 hover:text-navy-700">Clear</button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setSelected(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
            selected === null ? accentClasses.active : 'bg-paper text-navy-700 border-navy-200 hover:border-navy-400'
          }`}
        >
          All products
        </button>
        {PRODUCT_CATALOG.map(p => {
          const isActive = selected?.id === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition-colors ${
                isActive ? accentClasses.active : 'bg-paper text-navy-700 border-navy-200 hover:border-navy-400'
              }`}
            >
              {p.name}
              {p.focus && (
                <span className={`px-1 py-0 rounded text-[8px] font-bold ${isActive ? 'bg-white/20 text-white' : accentClasses.focusPill}`}>FOCUS</span>
              )}
            </button>
          );
        })}
      </div>

      {facets && selected && (
        <div className="pt-3 border-t border-navy-100 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { l: 'Revenue', v: facets.revenue },
            { l: 'Adoption', v: facets.adoption },
            { l: 'Sales', v: facets.sales },
            { l: 'Top Rep', v: facets.topRep },
            { l: 'Mentions', v: facets.mentions.toString() },
            { l: 'Samples', v: facets.samples.toString() },
          ].map(f => (
            <div key={f.l} className="p-2.5 rounded-lg bg-paper border border-navy-100">
              <p className="stat-label text-navy-400">{f.l}</p>
              <p className="font-display font-bold text-ink text-sm mt-0.5">{f.v}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
