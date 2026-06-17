import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiActivity } from 'react-icons/fi';

export default function RecentActivity({ activities = [] }) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/30 p-5 backdrop-blur-sm space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <FiActivity className="text-cyan-400 w-4 h-4" />
        <h3 className="text-xs font-semibold tracking-wider text-gray-500 uppercase font-mono">Recent Activity</h3>
      </div>

      <div className="space-y-2.5">
        <AnimatePresence initial={false}>
          {activities.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-gray-500 italic py-2"
            >
              No recent activity. Start solving!
            </motion.p>
          ) : (
            activities.slice(0, 5).map((activity, index) => (
              <motion.div
                key={`${activity.id}-${index}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-950/40 border border-gray-800/40 hover:border-gray-800 transition"
              >
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-950/60 border border-emerald-800/30 text-emerald-400 mt-0.5 shrink-0">
                  <FiCheck className="w-3 h-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-200 truncate hover:text-cyan-400 cursor-pointer">
                    {activity.title}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5 font-mono">
                    {activity.timestamp || "Solved just now"}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
