import React from 'react';

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
    <div className="flex flex-wrap gap-3 mb-6">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => setSelectedPlatform(filter)}
          className={`px-4 py-2 rounded-lg border transition ${
            selectedPlatform === filter
              ? 'bg-cyan-500 text-black border-cyan-500'
              : 'bg-[#111] text-gray-300 border-gray-800 hover:border-cyan-500/40'
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
