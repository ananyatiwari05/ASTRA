import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUserCircle } from 'react-icons/fa';

export default function SiteNavbar() {
  const isAuthenticated = !!localStorage.getItem('token');
  const location = useLocation();

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-50 bg-[#0a0f1c]/70 backdrop-blur-md border border-slate-700/50 rounded-full px-6 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="ASTRA Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold tracking-wide text-white">ASTRA</span>
          </Link>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link to="/" className={`transition-colors ${location.pathname === '/' ? 'text-white' : 'hover:text-white'}`}>Home</Link>
          <Link to="/dashboard" className={`transition-colors ${location.pathname === '/dashboard' ? 'text-white' : 'hover:text-white'}`}>Dashboard</Link>
          <Link to="/sheets" className={`transition-colors ${location.pathname.startsWith('/sheets') ? 'text-white' : 'hover:text-white'}`}>Sheets</Link>
          <Link to="/analytics" className={`transition-colors ${location.pathname === '/analytics' ? 'text-white' : 'hover:text-white'}`}>Analytics</Link>
          <Link to="/contest-radar" className={`transition-colors ${location.pathname === '/contest-radar' ? 'text-white' : 'hover:text-white'}`}>Contest Radar</Link>
          <Link to="/revision" className={`transition-colors ${location.pathname === '/revision' ? 'text-white' : 'hover:text-white'}`}>Revision</Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link to="/profile" className="flex items-center gap-2 px-5 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 rounded-full text-sm font-medium transition-all text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]">
              <FaUserCircle size={18} className="text-indigo-400" />
              <span>Profile</span>
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white hidden sm:block">Login</Link>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link to="/login" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-sm font-medium transition-all shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                  Get Started
                </Link>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </nav>
  );
}
