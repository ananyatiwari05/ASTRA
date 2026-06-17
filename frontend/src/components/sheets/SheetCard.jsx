import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiLock } from 'react-icons/fi';

export default function SheetCard({ title, totalProblems, solvedCount = 0, comingSoon = false, path }) {
  const percentage = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

  if (comingSoon) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-gray-800/80 bg-gray-950/40 p-6 backdrop-blur-md transition-all duration-300">
        {/* Decorative Blurred Gradient */}
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gray-800/20 blur-xl" />
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">Coming Soon</span>
          <FiLock className="text-gray-600 w-4 h-4" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-400 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">Explore curated DSA patterns and expand your problem solving skills.</p>
        
        <div className="flex items-center justify-between text-xs text-gray-600 font-mono">
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
      className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/40 hover:bg-gray-900/60 p-6 backdrop-blur-md hover:border-cyan-500/30 transition-colors group"
    >
      {/* Decorative Glow */}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">Active Sheet</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950/50 text-cyan-400 border border-cyan-800/30 font-mono">
          {totalProblems} Problems
        </span>
      </div>

      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">{title}</h3>
      <p className="text-sm text-gray-400 mb-6">Master DSA systematically from basic arrays to advanced graphs and dynamic programming.</p>

      {/* Progress Bar */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-gray-400">{solvedCount} of {totalProblems} Solved</span>
          <span className="text-cyan-400 font-bold">{percentage}%</span>
        </div>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
          />
        </div>
      </div>

      <Link
        to={path}
        className="flex items-center justify-between text-sm font-semibold text-cyan-400 group-hover:text-cyan-300 pt-2 border-t border-gray-800/60 group-hover:border-cyan-800/30 transition-colors"
      >
        <span>Open Sheet</span>
        <FiArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
      </Link>
    </motion.div>
  );
}
