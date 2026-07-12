import React from 'react';
import { motion } from 'framer-motion';

export default function ContestStats({ contests = [] }) {
  const upcomingCount = contests.length;

  const platforms = new Set(
    contests.map((contest) => contest.platform)
  ).size;

  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(now.getDate() + 7);

  const thisWeekCount = contests.filter((contest) => {
    const start = new Date(contest.startTime);

    return start >= now && start <= nextWeek;
  }).length;

  const stats = [
    {
      title: 'UPCOMING CONTESTS',
      value: upcomingCount,
      color: 'text-indigo-400'
    },
    {
      title: 'PLATFORMS',
      value: platforms,
      color: 'text-purple-400'
    },
    {
      title: 'THIS WEEK',
      value: thisWeekCount,
      color: 'text-fuchsia-400'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.title}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 hover:border-indigo-500/40 hover:bg-slate-900/80 transition-colors shadow-lg relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-colors duration-300 pointer-events-none" />
          <p className="text-slate-400 text-xs font-semibold tracking-wider mb-2">
            {stat.title}
          </p>

          <h2 className={`text-4xl font-black ${stat.color}`}>
            {stat.value}
          </h2>
        </motion.div>
      ))}
    </div>
  );
}