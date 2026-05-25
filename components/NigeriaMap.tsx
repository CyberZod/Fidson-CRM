import { NIGERIA_REGIONS } from '../assets/personas';
import type { NigeriaRegion, RegionData, DivisionKey } from '../types';

interface NigeriaMapProps {
  regions?: RegionData[];
  onRegionClick?: (region: NigeriaRegion) => void;
  division?: DivisionKey | 'all';
  height?: number;
}

const regionPaths: Record<NigeriaRegion['code'], string> = {
  NW: 'M 50 60 L 240 50 L 270 130 L 220 180 L 80 180 L 40 130 Z',
  NE: 'M 240 50 L 480 60 L 500 180 L 380 210 L 270 130 Z',
  NC: 'M 80 180 L 220 180 L 270 130 L 380 210 L 410 290 L 200 310 L 80 280 Z',
  SW: 'M 80 280 L 200 310 L 220 380 L 90 410 L 50 350 Z',
  SE: 'M 280 320 L 410 290 L 430 360 L 320 390 Z',
  SS: 'M 220 380 L 320 390 L 430 360 L 460 410 L 240 440 Z',
};

const regionCenters: Record<NigeriaRegion['code'], [number, number]> = {
  NW: [140, 115],
  NE: [380, 130],
  NC: [240, 245],
  SW: [130, 350],
  SE: [365, 345],
  SS: [340, 405],
};

export default function NigeriaMap({ regions, onRegionClick, division = 'all', height = 320 }: NigeriaMapProps) {
  return (
    <svg viewBox="0 0 540 460" style={{ width: '100%', maxHeight: height }} preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="mapGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {(division === 'south' || division === 'all') && (
        <path d="M 30 270 L 220 270 L 470 270 L 480 460 L 30 460 Z" fill="rgba(244, 63, 94, 0.04)" />
      )}
      {(division === 'north' || division === 'all') && (
        <path d="M 30 40 L 510 40 L 510 270 L 30 270 Z" fill="rgba(99, 102, 241, 0.04)" />
      )}

      {NIGERIA_REGIONS.map(r => {
        const data = regions?.find(x => x.code === r.code);
        const intensity = data?.intensity ?? 0.3;
        const isInScope = division === 'all' || r.div === division;
        const color = r.div === 'south' ? '244, 63, 94' : '99, 102, 241';
        const [cx, cy] = regionCenters[r.code];

        return (
          <g key={r.code} onClick={() => onRegionClick && onRegionClick(r)} style={{ cursor: onRegionClick ? 'pointer' : 'default' }}>
            <path
              d={regionPaths[r.code]}
              fill={isInScope ? `rgba(${color}, ${0.3 + intensity * 0.5})` : 'rgba(220, 227, 242, 0.4)'}
              stroke={isInScope ? `rgba(${color}, 0.9)` : 'rgba(143, 165, 209, 0.5)'}
              strokeWidth="2"
              className="transition-all"
            />
            <g transform={`translate(${cx}, ${cy})`}>
              <rect
                x="-22"
                y="-12"
                width="44"
                height="22"
                rx="4"
                fill="white"
                stroke={isInScope ? `rgba(${color}, 0.4)` : 'rgba(220, 227, 242, 0.6)'}
                strokeWidth="1"
              />
              <text textAnchor="middle" y="3" fontSize="10" fontWeight="700" fill={isInScope ? `rgba(${color}, 1)` : '#8FA5D1'} fontFamily="Sora, sans-serif">
                {r.code}
              </text>
            </g>
            {data && (
              <g transform={`translate(${cx}, ${cy + 22})`}>
                <text textAnchor="middle" fontSize="9" fontWeight="700" fill="#0A1830" fontFamily="JetBrains Mono, monospace">
                  {data.label ?? `${(data.intensity ?? 0) * 100}%`}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
