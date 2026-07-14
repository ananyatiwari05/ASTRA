import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiLock } from 'react-icons/fi';

export default function SheetCard({ title, totalProblems, solvedCount = 0, comingSoon = false, path }) {
  const percentage = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

  if (comingSoon) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0d1326] p-6 backdrop-blur-md transition-all duration-300">
        {/* Decorative Blurred Gradient */}
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-slate-800/20 blur-xl" />
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Coming Soon</span>
          <FiLock className="text-slate-600 w-4 h-4" />
        </div>
        
        <h3 className="text-xl font-bold text-slate-400 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 mb-6">Explore curated DSA patterns and expand your problem solving skills.</p>
        
        <div className="flex items-center justify-between text-xs text-slate-600 font-mono">
          <span>-- Problems</span>
          <span>--% Solved</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/60 p-6 backdrop-blur-md hover:border-indigo-500/30 transition-colors group"
    >
      {/* Decorative Glow */}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-indigo-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold tracking-wider text-indigo-400 uppercase">Active Sheet</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950/50 text-indigo-400 border border-indigo-800/30 font-mono">
          {totalProblems} Problems
        </span>
      </div>

      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">{title}</h3>
      <p className="text-sm text-slate-400 mb-6">Master DSA systematically from basic arrays to advanced graphs and dynamic programming.</p>

      {/* Progress Bar */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-slate-400">{solvedCount} of {totalProblems} Solved</span>
          <span className="text-indigo-400 font-bold">{percentage}%</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
          />
        </div>
      </div>

      <Link
        to={path}
        className="flex items-center justify-between text-sm font-semibold text-indigo-400 group-hover:text-indigo-300 pt-2 border-t border-slate-800/60 group-hover:border-indigo-800/30 transition-colors"
      >
        <span>Open Sheet</span>
        <FiArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
      </Link>
    </motion.div>
  );
}
