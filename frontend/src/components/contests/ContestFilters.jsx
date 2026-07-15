import React from 'react';
import { motion } from 'framer-motion';

const activeStyles = {
  All: 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.25)]',
  Codeforces: 'bg-blue-600/20 text-blue-300 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.25)]',
  LeetCode: 'bg-orange-600/20 text-orange-300 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.25)]',
  CodeChef: 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
};

export default function ContestFilters({
  selectedPlatform,
  setSelectedPlatform,
}) {
  const filters = [
    'All',
    'Codeforces',
    'LeetCode',
    'CodeChef',
  ];

  return (
    <div className="flex flex-wrap gap-3 mb-6 p-1">
      {filters.map((filter) => {
        const isActive = selectedPlatform === filter;
        return (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            key={filter}
            onClick={() => setSelectedPlatform(filter)}
            className={`px-5 py-2 rounded-lg border text-sm font-semibold transition-all duration-300 relative overflow-hidden ${
              isActive
                ? activeStyles[filter]
                : 'bg-slate-900/50 text-slate-400 border-slate-800/80 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            {filter}
          </motion.button>
        );
      })}
    </div>
  );
}
