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
    <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col min-h-screen text-white">
      {/* Brand / Logo */}
      <div className="p-6 border-b border-gray-800 flex items-center justify-between">
        <span className="text-2xl font-black tracking-wider text-cyan-400">ASTRA</span>
        <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-400 font-mono">v1.0</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-2.5 rounded font-medium text-sm transition ${
                isActive
                  ? 'bg-gray-900 text-cyan-400 border border-gray-800'
                  : 'text-gray-400 hover:bg-gray-900/50 hover:text-white'
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
