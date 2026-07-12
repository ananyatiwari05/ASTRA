import React from 'react';
import { motion } from 'framer-motion';

export default function ProfileCard({
  user,
  platform = 'codeforces',
  isLoading,
})  {
  if (isLoading) {
    return (
      <div className="p-6 border border-slate-800/80 rounded-xl bg-slate-900/40 text-slate-400 flex items-center justify-center min-h-[120px]">
        <div className="flex items-center gap-3">
          <span className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></span>
          Loading Profile...
        </div>
      </div>
    );
  }

  const currentUser =
  platform === 'codechef'
    ? user?.codechef
    : platform === 'leetcode'
    ? user?.leetcode
    : user?.codeforces;

const handle =
  currentUser?.cfHandle ||
  currentUser?.ccHandle ||
  currentUser?.lcHandle ||
  user?.email ||
  'Unknown User';

  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      className="p-6 border border-slate-800/80 rounded-xl bg-slate-900/40 text-white flex items-center gap-6 shadow-lg backdrop-blur-sm relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-colors duration-300 pointer-events-none" />

      <div className="w-16 h-16 rounded-2xl border border-indigo-500/50 bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-xl shadow-[0_0_15px_rgba(79,70,229,0.2)]">
        {handle.substring(0, 2).toUpperCase()}
      </div>

      <div>
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
          {handle}
        </h2>

        <p className="text-slate-400 text-sm mt-1">
          {platform.charAt(0).toUpperCase() + platform.slice(1)} Profile
        </p>

        <div className="flex items-center gap-2 mt-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <p className="text-emerald-400 text-xs font-semibold tracking-wide uppercase">
            Active Sync
          </p>
        </div>
      </div>
    </motion.div>
  );
}