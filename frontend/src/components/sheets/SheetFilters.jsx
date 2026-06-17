import React from 'react';
import { FiSearch, FiSliders, FiXCircle } from 'react-icons/fi';

export default function SheetFilters({
  searchTerm,
  setSearchTerm,
  selectedTopic,
  setSelectedTopic,
  selectedDifficulty,
  setSelectedDifficulty,
  selectedStatus,
  setSelectedStatus,
  topics = []
}) {
  const difficulties = ["All", "Easy", "Medium", "Hard"];
  const statuses = ["All", "Solved", "Unsolved"];

  const hasActiveFilters = searchTerm !== "" || selectedTopic !== "All" || selectedDifficulty !== "All" || selectedStatus !== "All";

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedTopic("All");
    setSelectedDifficulty("All");
    setSelectedStatus("All");
  };

  return (
    <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border border-gray-800 rounded-xl p-4 md:p-5 shadow-xl space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search problems by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-gray-400 hover:text-white bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition"
          >
            <FiXCircle className="w-3.5 h-3.5" />
            Clear Filters
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-1">
        {/* Topic Filter Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium font-mono uppercase">Topic:</span>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
          >
            <option value="All">All Topics</option>
            {topics.map((topic) => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
        </div>

        {/* Difficulty Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium font-mono uppercase">Difficulty:</span>
          <div className="flex bg-gray-950 p-1 border border-gray-800 rounded-lg">
            {difficulties.map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1 rounded-md text-[11px] font-semibold transition ${
                  selectedDifficulty === diff
                    ? diff === 'Easy' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                      : diff === 'Medium' ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                      : diff === 'Hard' ? 'bg-red-950/60 text-red-400 border border-red-800/40'
                      : 'bg-gray-800 text-cyan-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Status Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium font-mono uppercase">Status:</span>
          <div className="flex bg-gray-950 p-1 border border-gray-800 rounded-lg">
            {statuses.map((stat) => (
              <button
                key={stat}
                onClick={() => setSelectedStatus(stat)}
                className={`px-3 py-1 rounded-md text-[11px] font-semibold transition ${
                  selectedStatus === stat
                    ? 'bg-gray-800 text-cyan-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {stat}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
