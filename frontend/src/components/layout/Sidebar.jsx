import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Database,
  SlidersHorizontal,
  Cpu,
  Zap,
  ShieldCheck,
  Scale,
  History,
  FileText,
  Settings,
  Info,
  FileCode
} from 'lucide-react';

const navLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Datasets', path: '/datasets', icon: Database },
  { name: 'Preprocessing', path: '/preprocessing', icon: SlidersHorizontal },
  { name: 'Models', path: '/models', icon: Cpu },
  { name: 'Robustness Lab', path: '/robustness', icon: Zap },
  { name: 'Defence Lab', path: '/defence', icon: ShieldCheck },
  { name: 'Compare Results', path: '/compare', icon: Scale },
  { name: 'Experiments', path: '/experiments', icon: History },
  { name: 'Reports', path: '/reports', icon: FileText },
  { name: 'API Docs (Swagger)', path: '/docs', icon: FileCode, isExternal: true },
  { name: 'Settings', path: '/settings', icon: Settings },
  { name: 'About Lab', path: '/about', icon: Info },
];

export default function Sidebar() {
  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0B0F17]/95 flex flex-col justify-between p-4 flex-shrink-0">
      <div className="space-y-6">
        <div className="px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-400">
          Navigation
        </div>

        <nav className="space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            if (item.isExternal) {
              return (
                <a
                  key={item.path}
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-medium text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all group"
                >
                  <Icon className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
                  <span>{item.name}</span>
                </a>
              );
            }
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Safety Scope Footer */}
      <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Defensive Offline Mode</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Feature-level evaluation only. No network injection or live payloads.
        </p>
      </div>
    </aside>
  );
}
