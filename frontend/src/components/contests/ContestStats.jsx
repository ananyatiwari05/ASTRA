

import React from 'react';

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
    },
    {
      title: 'PLATFORMS',
      value: platforms,
    },
    {
      title: 'THIS WEEK',
      value: thisWeekCount,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="bg-[#111] border border-gray-800 rounded-xl p-5"
        >
          <p className="text-gray-400 text-sm mb-2">
            {stat.title}
          </p>

          <h2 className="text-3xl font-bold text-white">
            {stat.value}
          </h2>
        </div>
      ))}
    </div>
  );
}