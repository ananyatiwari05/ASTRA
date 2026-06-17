import React from 'react';
import { motion } from 'framer-motion';

export default function TopicProgress({ problems, selectedTopic, setSelectedTopic }) {
  // Extract all unique topics
  const topics = Array.from(new Set(problems.map(p => p.topic))).sort();

  // Calculate stats for each topic
  const topicStats = topics.map(topic => {
    const topicProblems = problems.filter(p => p.topic === topic);
    const total = topicProblems.length;
    const solved = topicProblems.filter(p => p.solved).length;
    const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;
    return { topic, total, solved, percentage };
  });

  const handleTopicClick = (topic) => {
    if (selectedTopic === topic) {
      setSelectedTopic("All"); // Toggle off
    } else {
      setSelectedTopic(topic);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/30 p-5 backdrop-blur-sm space-y-4">
      <h3 className="text-xs font-semibold tracking-wider text-gray-500 uppercase font-mono">Topic Breakdown</h3>
      
      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
        {topicStats.map(({ topic, total, solved, percentage }) => {
          const isActive = selectedTopic === topic;
          return (
            <div
              key={topic}
              onClick={() => handleTopicClick(topic)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                isActive
                  ? 'border-cyan-500/40 bg-cyan-950/20 shadow-[0_0_12px_rgba(6,182,212,0.05)]'
                  : 'border-gray-800/60 bg-gray-950/40 hover:border-gray-700/80 hover:bg-gray-950/80'
              }`}
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className={`text-xs font-bold transition-colors ${isActive ? 'text-cyan-400' : 'text-gray-300'}`}>
                  {topic}
                </span>
                <span className="text-[11px] font-mono text-gray-400">
                  {solved} / {total}
                </span>
              </div>
              
              <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.4 }}
                  className={`h-full rounded-full ${
                    isActive ? 'bg-cyan-400' : 'bg-gray-700'
                  }`}
                />
              </div>
              
              <div className="flex justify-end mt-1">
                <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-cyan-500' : 'text-gray-500'}`}>
                  {percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
