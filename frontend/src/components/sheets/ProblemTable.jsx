import React from 'react';
import { FiExternalLink, FiCheck } from 'react-icons/fi';

export default function ProblemTable({ problems, onToggleSolved }) {
  const getDifficultyStyles = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "text-emerald-400 bg-emerald-950/30 border border-emerald-800/30";
      case "Medium":
        return "text-amber-400 bg-amber-950/30 border border-amber-800/30";
      case "Hard":
        return "text-rose-400 bg-rose-950/30 border border-rose-800/30";
      default:
        return "text-gray-400 bg-gray-900 border border-gray-800";
    }
  };

  const getPlatformStyles = (platform) => {
    switch (platform.toLowerCase()) {
      case "leetcode":
        return "text-orange-400 bg-orange-950/30 border border-orange-900/30";
      case "gfg":
      case "geeksforgeeks":
        return "text-green-400 bg-green-950/30 border border-green-900/30";
      case "codeforces":
        return "text-blue-400 bg-blue-950/30 border border-blue-900/30";
      default:
        return "text-gray-400 bg-gray-900 border border-gray-800";
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900/10 backdrop-blur-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-800 bg-gray-950/60 text-xs font-semibold uppercase tracking-wider text-gray-500 font-mono">
            <th className="py-4 px-4 w-12 text-center">✓</th>
            <th className="py-4 px-4">Problem</th>
            <th className="py-4 px-4 hidden md:table-cell">Topic</th>
            <th className="py-4 px-4">Difficulty</th>
            <th className="py-4 px-4 hidden sm:table-cell">Platform</th>
            <th className="py-4 px-4 text-center w-20">Link</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50">
          {problems.length === 0 ? (
            <tr>
              <td colSpan="6" className="py-8 text-center text-sm text-gray-500">
                No problems found matching filters.
              </td>
            </tr>
          ) : (
            problems.map((problem) => (
              <tr
                key={problem.id}
                className={`transition-colors duration-150 hover:bg-gray-900/35 group ${
                  problem.solved ? 'bg-emerald-950/5 hover:bg-emerald-950/10' : ''
                }`}
              >
                {/* Checkbox Column */}
                <td className="py-3.5 px-4 text-center">
                  <button
                    onClick={() => onToggleSolved(problem.id)}
                    className={`mx-auto w-5 h-5 rounded flex items-center justify-center border transition-all ${
                      problem.solved
                        ? 'bg-emerald-500 border-emerald-400 text-black'
                        : 'border-gray-700 hover:border-cyan-500 bg-gray-950 text-transparent'
                    }`}
                  >
                    <FiCheck className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </td>

                {/* Problem Title */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-col">
                    <span
                      onClick={() => onToggleSolved(problem.id)}
                      className={`text-sm font-semibold cursor-pointer select-none transition-colors ${
                        problem.solved
                          ? 'text-gray-400 line-through decoration-gray-600'
                          : 'text-gray-100 hover:text-cyan-400'
                      }`}
                    >
                      {problem.title}
                    </span>
                    {/* Small topic & platform info visible only on mobile */}
                    <span className="text-[10px] text-gray-500 md:hidden mt-0.5 flex gap-2">
                      <span>{problem.topic}</span>
                      <span className="sm:hidden font-semibold text-gray-600">·</span>
                      <span className="sm:hidden">{problem.platform}</span>
                    </span>
                  </div>
                </td>

                {/* Topic (Hidden on Mobile) */}
                <td className="py-3.5 px-4 hidden md:table-cell">
                  <span className="text-xs font-medium text-gray-400 bg-gray-950 px-2 py-0.5 rounded border border-gray-800/40">
                    {problem.topic}
                  </span>
                </td>

                {/* Difficulty */}
                <td className="py-3.5 px-4">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${getDifficultyStyles(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                </td>

                {/* Platform (Hidden on Mobile) */}
                <td className="py-3.5 px-4 hidden sm:table-cell">
                  <span className={`text-xs px-2.5 py-0.5 rounded font-mono ${getPlatformStyles(problem.platform)}`}>
                    {problem.platform}
                  </span>
                </td>

                {/* Link */}
                <td className="py-3.5 px-4 text-center">
                  <a
                    href={problem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex p-1.5 rounded-md hover:bg-gray-800 text-gray-400 hover:text-cyan-400 transition"
                  >
                    <FiExternalLink className="w-4 h-4" />
                  </a>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
