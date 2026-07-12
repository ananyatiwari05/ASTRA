import React from 'react';
import { motion } from 'framer-motion';

/**
 * SubmissionTable component
 * @param {Object} props
 * @param {Array} props.submissions - List of submissions, each with a problem and verdict
 * @param {boolean} props.isLoading - Loading state flag
 */
export default function SubmissionTable({ submissions, isLoading }) {
  if (isLoading) {
    return (
      <div className="p-6 border border-slate-800/80 rounded-xl bg-slate-900/40 text-slate-400 flex items-center justify-center min-h-[200px]">
        <div className="flex items-center gap-3">
          <span className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></span>
          Loading Submissions...
        </div>
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="p-6 border border-slate-800/80 rounded-xl bg-slate-900/40 text-slate-400 text-center py-12">
        No recent submissions to show.
      </div>
    );
  }

  return (
    <motion.div 
      whileHover={{ scale: 1.002 }}
      className="border border-slate-800/80 rounded-xl bg-slate-900/40 text-white overflow-hidden shadow-lg backdrop-blur-sm"
    >
      <div className="p-5 border-b border-slate-800/80 bg-slate-950/50">
        <h3 className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
          Recent Submissions
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#070a13] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800/50">
            <tr>
              <th className="p-4 font-semibold">Time</th>
              <th className="p-4 font-semibold">Problem</th>
              <th className="p-4 font-semibold">Verdict</th>
              <th className="p-4 font-semibold">Language</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {submissions.map((sub, idx) => (
              <motion.tr 
                key={idx} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="hover:bg-indigo-900/10 transition-colors group"
              >
                <td className="p-4 text-slate-400 text-xs">
                  {sub?.time || '-'}
                </td>
                <td className="p-4 font-medium text-slate-200 group-hover:text-indigo-300 transition-colors">
                  {sub?.problemName || 'Unknown Problem'}
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase shadow-sm ${
                      sub?.verdict === 'OK' || sub?.verdict === 'Accepted'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : sub?.verdict?.includes('Wrong') ||
                          sub?.verdict?.includes('Runtime') ||
                          sub?.verdict?.includes('Error')
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : sub?.verdict?.includes('Time')
                        ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                        : 'bg-slate-800/50 text-slate-300 border border-slate-700/50'
                    }`}
                  >
                    {sub?.verdict || 'UNKNOWN'}
                  </span>
                </td>
                <td className="p-4 text-slate-400 text-xs font-mono">
                  {sub?.language || '-'}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
