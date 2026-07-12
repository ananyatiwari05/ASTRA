import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Sidebar component
 */
export default function Sidebar() {
  const navItems = [
    { name: 'DASHBOARD', path: '/dashboard' },
    { name: 'ANALYTICS', path: '/analytics' },
    { name: 'REVISION', path: '/revision' },
    { name: 'CONTEST RADAR', path: '/contest-radar' },
    { name: 'SHEETS', path: '/sheets' },
    { name: 'PROFILE', path: '/profile' },
  ];

  return (
    <aside className="w-64 bg-[#0a0f1c]/90 backdrop-blur-xl border-r border-slate-800/80 flex flex-col min-h-screen text-white relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
      {/* Brand / Logo */}
      <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
        <NavLink
          to="/"
          className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 hover:from-indigo-300 hover:to-purple-300 transition"
        >
          ASTRA
        </NavLink>
        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950/50 text-indigo-400 border border-indigo-500/30 font-mono tracking-wider">v1.0</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                isActive
                  ? 'bg-indigo-600/10 text-indigo-300 border border-indigo-500/20 shadow-[0_0_15px_rgba(79,70,229,0.1)]'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white border border-transparent'
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
