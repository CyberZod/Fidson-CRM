import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from './Icon';
import { PERSONAS, PERSONA_COLOR_MAP } from '../assets/personas';
import type { Persona, PersonaKey } from '../types';

interface RoleSwitcherProps {
  currentRole: PersonaKey;
  onSwitchRole: (role: PersonaKey) => void;
}

type GroupedRoles = Record<string, Array<Persona & { key: PersonaKey }>>;

export default function RoleSwitcher({ currentRole, onSwitchRole }: RoleSwitcherProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const current = PERSONAS[currentRole];
  const currentColors = PERSONA_COLOR_MAP[current.tagColor];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const groupedRoles = useMemo<GroupedRoles>(() => {
    const groups: GroupedRoles = {};
    (Object.entries(PERSONAS) as [PersonaKey, Persona][]).forEach(([key, p]) => {
      if (!groups[p.category]) groups[p.category] = [];
      groups[p.category].push({ key, ...p });
    });
    return groups;
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-1.5 pr-1.5 sm:pr-2.5 py-1 sm:py-1.5 rounded-lg border-2 ${currentColors.border} bg-white hover:bg-paper transition-colors btn-press group`}
      >
        <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded bg-leaf-500 text-white text-[9px] font-bold tracking-wider uppercase">Demo</span>
        <div className={`w-7 h-7 rounded-md ${currentColors.avBg} flex items-center justify-center text-white text-[10px] font-display font-bold flex-shrink-0`}>
          {current.initials}
        </div>
        <div className="hidden lg:block text-left">
          <p className="font-display font-bold text-xs text-ink leading-tight">{current.name.split(' ')[0]}</p>
          <p className={`text-[9px] font-bold ${currentColors.tagText} leading-tight`}>{current.tag}</p>
        </div>
        <Icon name="chevronDown" size={12} className={`text-navy-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-2 w-[calc(100vw-1.5rem)] sm:w-80 max-w-sm rounded-2xl bg-white border border-navy-100 shadow-2xl overflow-hidden z-50 fade-in"
          style={{ animation: 'fade-up 0.2s ease forwards' }}
        >
          <div className="px-4 py-3 border-b border-navy-100 bg-paper flex items-center gap-2">
            <Icon name="users" size={14} className="text-leaf-700" />
            <div className="flex-1">
              <p className="font-display font-bold text-sm text-ink">Switch Demo Role</p>
              <p className="text-[10px] text-navy-500">See FieldForce through any role's lens</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-navy-400 hover:text-navy-700">
              <Icon name="x" size={14} />
            </button>
          </div>

          <div className="max-h-[480px] overflow-y-auto p-2">
            {Object.entries(groupedRoles).map(([category, roles]) => (
              <div key={category} className="mb-1">
                <p className="px-3 pt-2 pb-1 text-[9px] font-bold text-navy-400 tracking-wider uppercase">{category}</p>
                {roles.map(p => {
                  const c = PERSONA_COLOR_MAP[p.tagColor];
                  const isActive = p.key === currentRole;
                  return (
                    <button
                      key={p.key}
                      onClick={() => { onSwitchRole(p.key); setOpen(false); }}
                      className={`w-full p-2.5 rounded-lg flex items-center gap-2.5 text-left transition-all btn-press ${
                        isActive ? `bg-paper border-2 ${c.border}` : `border-2 border-transparent ${c.hover} hover:bg-paper`
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg ${c.avBg} flex items-center justify-center text-white text-xs font-display font-bold flex-shrink-0`}>
                        {p.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-display font-bold text-sm text-ink truncate">{p.name}</p>
                          <span className={`px-1.5 py-0.5 rounded ${c.tagBg} ${c.tagText} text-[9px] font-bold flex-shrink-0`}>{p.tag}</span>
                          {isActive && <span className="px-1.5 py-0.5 rounded bg-leaf-100 text-leaf-700 text-[9px] font-bold">ACTIVE</span>}
                        </div>
                        <p className="text-[10px] text-navy-500 truncate">{p.desc}</p>
                      </div>
                      {isActive ? (
                        <Icon name="check" size={14} className="text-leaf-600 flex-shrink-0" strokeWidth={3} />
                      ) : (
                        <Icon name="arrowRight" size={12} className={`${c.tagText} flex-shrink-0`} />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="px-4 py-2.5 border-t border-navy-100 bg-paper">
            <p className="text-[10px] text-navy-500 leading-relaxed">
              <span className="font-bold">💡 Pro tip:</span> Order submitted as Rep → Approve as RSM. Submit CM as Rep → Approve as PM. All data flows live between roles.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
