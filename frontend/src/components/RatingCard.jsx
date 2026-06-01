import React from 'react';

/**
 * RatingCard component representing user rating stats
 * @param {Object} props
 * @param {Object} props.user - User information containing rating and maxRating
 * @param {boolean} props.isLoading - Loading state flag
 */
export default function RatingCard({ user, isLoading }) {
  if (isLoading) {
    return (
      <div className="p-4 border border-gray-700 rounded bg-gray-900 text-gray-400">
        Loading rating stats...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 border border-gray-700 rounded bg-gray-900 text-gray-400">
        No stats loaded.
      </div>
    );
  }

  const getRankInfo = (rating) => {
    if (rating >= 3000) return { title: 'Legendary Grandmaster', color: 'text-red-500 bg-red-950/20 border-red-900/50' };
    if (rating >= 2400) return { title: 'Grandmaster', color: 'text-red-400 bg-red-950/10 border-red-900/30' };
    if (rating >= 2100) return { title: 'Master', color: 'text-orange-400 bg-orange-950/10 border-orange-900/30' };
    if (rating >= 1900) return { title: 'Candidate Master', color: 'text-purple-400 bg-purple-950/10 border-purple-900/30' };
    if (rating >= 1600) return { title: 'Expert', color: 'text-blue-400 bg-blue-950/10 border-blue-900/30' };
    if (rating >= 1400) return { title: 'Specialist', color: 'text-cyan-400 bg-cyan-950/10 border-cyan-900/30' };
    if (rating >= 1200) return { title: 'Pupil', color: 'text-green-400 bg-green-950/10 border-green-900/30' };
    return { title: 'Newbie', color: 'text-gray-400 bg-gray-950/10 border-gray-900/30' };
  };

  const currentRating = Number(user?.rating || 0);
  const maxRating = Number(user?.maxRating || user?.maxrating || 0);

  const rankInfo = getRankInfo(currentRating);

  return (
    <div className="p-4 border border-gray-700 rounded bg-gray-900 text-white">
      <h3 className="font-bold text-lg mb-4 text-gray-200">Rating Stats</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 border border-gray-800 rounded bg-gray-950">
          <span className="text-xs text-gray-500 block mb-1">Current Rating</span>
          <span className="text-2xl font-black text-cyan-400">{currentRating || 'N/A'}</span>
        </div>
        <div className="p-3 border border-gray-800 rounded bg-gray-950">
          <span className="text-xs text-gray-500 block mb-1">Max Rating</span>
          <span className="text-2xl font-black text-gray-300">{maxRating || 'N/A'}</span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-gray-400 font-medium">Rank Designation:</span>
        <span className={`px-2.5 py-1 rounded text-xs font-bold border ${rankInfo.color}`}>
          {rankInfo.title}
        </span>
      </div>
    </div>
  );
}
