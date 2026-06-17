import React from 'react';
import { motion } from 'framer-motion';

export default function ProgressCard({ solved, total }) {
  const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/40 p-6 backdrop-blur-md">
      {/* Decorative Glow */}
      <div className="absolute -left-12 -top-12 h-32 w-32 rounded-full bg-cyan-500/5 blur-2xl" />

      <h3 className="text-sm font-semibold tracking-wider text-gray-400 uppercase mb-4">Overall Progress</h3>
      
      <div className="flex items-end justify-between mb-2">
        <span className="text-3xl font-black text-white tracking-tight">
          {solved} <span className="text-lg text-gray-500 font-normal">/ {total} Solved</span>
        </span>
        <span className="text-2xl font-mono font-bold text-cyan-400">{percentage}%</span>
      </div>

      <div className="w-full h-3 bg-gray-950 rounded-full overflow-hidden border border-gray-800/50">
        <motion.div
          key={percentage}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.3)]"
        />
      </div>

      {/* Mini block visualization */}
      <div className="flex justify-between items-center mt-4 text-[10px] text-gray-500 font-mono tracking-widest">
        <span>ASTRA_SYSTEM_OK</span>
        <span>LEVEL_COMPLETE_{percentage}%</span>
      </div>
    </div>
  );
}
