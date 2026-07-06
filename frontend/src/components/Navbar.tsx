import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldAlert, Video, LayoutDashboard, FileText, Settings, Bell } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const Navbar: React.FC = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Live Cameras', path: '/cameras', icon: Video },
    { name: 'Incidents', path: '/incidents', icon: ShieldAlert },
    { name: 'Reports', path: '/reports', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-white/10 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
          <ShieldAlert className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            GuardianAI
          </h1>
          <p className="text-xs text-slate-400 font-mono tracking-widest uppercase">Intelligent Surveillance</p>
        </div>
      </div>

      <nav className="hidden md:flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-white/5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-medium text-sm",
                isActive 
                  ? "bg-blue-600/20 text-blue-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-blue-500/30" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
              )
            }
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/10">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
        </button>
        <button className="p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/10">
          <Settings className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 rounded-full border-2 border-slate-700 overflow-hidden ml-2 cursor-pointer">
          <img src="https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff" alt="User Avatar" className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
