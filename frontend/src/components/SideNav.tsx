import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Crosshair, Camera, Clock, Bot, Wrench, Brain, Network, FileText,
} from 'lucide-react';

interface NavItem {
  path: string;
  icon: React.FC<{ className?: string }>;
  label: string;
  color: string;
}

const navItems: NavItem[] = [
  { path: '/command', icon: Crosshair, label: 'Command', color: '#00D4FF' },
  { path: '/cameras', icon: Camera, label: 'Cameras', color: '#00FFA3' },
  { path: '/incidents', icon: Clock, label: 'Incidents', color: '#FFB800' },
  { path: '/agents', icon: Bot, label: 'Agents', color: '#7B61FF' },
  { path: '/tools', icon: Wrench, label: 'Tools', color: '#5B8DEF' },
  { path: '/memory', icon: Brain, label: 'Memory', color: '#FF3B5C' },
  { path: '/network', icon: Network, label: 'Network', color: '#00D4FF' },
  { path: '/reports', icon: FileText, label: 'Reports', color: '#00FFA3' },
];

const SideNav: React.FC = () => {
  return (
    <nav className="fixed left-0 top-12 bottom-8 z-40 w-16 flex flex-col items-center py-4 gap-1 bg-[#040712]/60 backdrop-blur-xl border-r border-white/[0.04]">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
              isActive
                ? 'bg-white/[0.08] border border-white/[0.1]'
                : 'hover:bg-white/[0.04] border border-transparent'
            }`
          }
          aria-label={item.label}
        >
          {({ isActive }) => (
            <>
              <item.icon
                className={`w-[18px] h-[18px] transition-colors duration-300 ${
                  isActive ? 'text-[#F0F4F8]' : 'text-[#475569] group-hover:text-[#94A3B8]'
                }`}
              />
              {/* Active glow indicator */}
              {isActive && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-r-full"
                  style={{ backgroundColor: item.color, boxShadow: `0 0 12px ${item.color}60` }}
                />
              )}
              {/* Tooltip */}
              <div className="absolute left-14 px-2.5 py-1 bg-[#161D33] border border-white/[0.08] rounded-lg text-[11px] font-medium text-[#F0F4F8] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-xl">
                {item.label}
              </div>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default SideNav;
