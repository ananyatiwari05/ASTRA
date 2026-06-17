import React from 'react';
import { FiCheckCircle, FiPlay, FiGrid, FiAward } from 'react-icons/fi';

export default function StatsCards({ solved, remaining, topicsCount, completionRate }) {
  const cards = [
    {
      title: "Solved",
      value: solved,
      icon: <FiCheckCircle className="text-emerald-400 w-5 h-5" />,
      borderColor: "hover:border-emerald-500/30",
      glowColor: "bg-emerald-500/5",
    },
    {
      title: "Remaining",
      value: remaining,
      icon: <FiPlay className="text-cyan-400 w-5 h-5" />,
      borderColor: "hover:border-cyan-500/30",
      glowColor: "bg-cyan-500/5",
    },
    {
      title: "Topics Covered",
      value: topicsCount,
      icon: <FiGrid className="text-purple-400 w-5 h-5" />,
      borderColor: "hover:border-purple-500/30",
      glowColor: "bg-purple-500/5",
    },
    {
      title: "Completion",
      value: `${completionRate}%`,
      icon: <FiAward className="text-amber-400 w-5 h-5" />,
      borderColor: "hover:border-amber-500/30",
      glowColor: "bg-amber-500/5",
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/30 p-5 backdrop-blur-sm transition-all duration-300 ${card.borderColor} group`}
        >
          {/* Subtle Accent Glow on Hover */}
          <div className={`absolute -right-8 -top-8 h-20 w-20 rounded-full ${card.glowColor} blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">{card.title}</span>
            {card.icon}
          </div>
          
          <div className="text-2xl lg:text-3xl font-black text-white tracking-tight font-mono">
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}
