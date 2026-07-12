import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function SiteNavbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0a0f1c]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
          <img src="/logo.png" alt="ASTRA Logo" className="w-8 h-8 object-contain" />
          <span className="text-xl font-bold tracking-wide text-white">ASTRA</span>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="hidden lg:flex items-center gap-8 text-sm text-slate-300">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          <Link to="/sheets" className="hover:text-white transition-colors">Sheets</Link>
          <Link to="/analytics" className="hover:text-white transition-colors">Analytics</Link>
          <Link to="/contest-radar" className="hover:text-white transition-colors">Contest Radar</Link>
          <Link to="/revision" className="hover:text-white transition-colors">Revision</Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white hidden sm:block">Login</Link>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link to="/login" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-medium transition-all shadow-[0_0_15px_rgba(79,70,229,0.4)]">
              Get Started
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </nav>
  );
}
