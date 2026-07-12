import React from 'react';
import { motion } from 'framer-motion';

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
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                : 'bg-slate-900/50 text-slate-300 border-slate-700/50 hover:border-indigo-500/50 hover:text-indigo-200'
            }`}
          >
            {filter}
          </motion.button>
        );
      })}
    </div>
  );
}
