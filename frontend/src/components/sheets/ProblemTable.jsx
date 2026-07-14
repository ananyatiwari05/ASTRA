import React from 'react';
import { FiExternalLink, FiCheck } from 'react-icons/fi';

export default function ProblemTable({ problems, onToggleSolved, readOnly = false }) {
  const getDifficultyStyles = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "text-emerald-400 bg-emerald-950/30 border border-emerald-800/30";
      case "Medium":
        return "text-amber-400 bg-amber-950/30 border border-amber-800/30";
      case "Hard":
        return "text-rose-400 bg-rose-950/30 border border-rose-800/30";
      default:
        return "text-slate-400 bg-slate-900 border border-slate-800";
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
        return "text-slate-400 bg-slate-900 border border-slate-800";
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800/60 bg-slate-900/20 backdrop-blur-sm shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800/60 bg-[#0d1326] text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
            <th className="py-4 px-4 w-12 text-center">✓</th>
            <th className="py-4 px-4">Problem</th>
            <th className="py-4 px-4 hidden md:table-cell">Topic</th>
            <th className="py-4 px-4">Difficulty</th>
            <th className="py-4 px-4 hidden sm:table-cell">Platform</th>
            <th className="py-4 px-4 text-center w-20">Link</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/40">
          {problems.length === 0 ? (
            <tr>
              <td colSpan="6" className="py-8 text-center text-sm text-slate-500">
                No problems found matching filters.
              </td>
            </tr>
          ) : (
            problems.map((problem) => (
              <tr
                key={problem.id}
                className={`transition-colors duration-150 hover:bg-slate-800/40 group ${
                  problem.solved ? 'bg-emerald-950/10 hover:bg-emerald-950/20' : ''
                }`}
              >
                {/* Checkbox Column */}
                <td className="py-3.5 px-4 text-center">
                  {readOnly ? (
                    <div
                      className={`mx-auto w-5 h-5 rounded flex items-center justify-center border ${
                        problem.solved
                          ? 'bg-emerald-500 border-emerald-400 text-black'
                          : 'border-slate-700 bg-[#0d1326] text-transparent'
                      }`}
                    >
                      <FiCheck className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <button
                      onClick={() => onToggleSolved?.(problem.id)}
                      className={`mx-auto w-5 h-5 rounded flex items-center justify-center border transition-all ${
                        problem.solved
                          ? 'bg-emerald-500 border-emerald-400 text-black'
                          : 'border-slate-700 hover:border-indigo-500 bg-[#0d1326] text-transparent'
                      }`}
                    >
                      <FiCheck className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  )}
                </td>

                {/* Problem Title */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-col">
                    <span
                      className={`text-sm font-semibold select-none transition-colors ${
                        problem.solved
                          ? 'text-slate-500 line-through decoration-slate-600'
                          : 'text-slate-200'
                      } ${readOnly ? '' : 'cursor-pointer hover:text-indigo-400'}`}
                      onClick={
                        readOnly
                          ? undefined
                          : () => onToggleSolved?.(problem.id)
                      }
                    >
                      {problem.title}
                    </span>
                    {/* Small topic & platform info visible only on mobile */}
                    <span className="text-[10px] text-slate-500 md:hidden mt-0.5 flex gap-2">
                      <span>{problem.topic}</span>
                      <span className="sm:hidden font-semibold text-slate-600">·</span>
                      <span className="sm:hidden">{problem.platform}</span>
                    </span>
                  </div>
                </td>

                {/* Topic (Hidden on Mobile) */}
                <td className="py-3.5 px-4 hidden md:table-cell">
                  <span className="text-xs font-medium text-slate-400 bg-[#0d1326] px-2 py-0.5 rounded border border-slate-800/40">
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
                    className="inline-flex p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition"
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
