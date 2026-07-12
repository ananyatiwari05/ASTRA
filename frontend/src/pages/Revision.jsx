import React, { useEffect, useState } from 'react';
import { FiExternalLink } from 'react-icons/fi';

import Sidebar from '../components/Sidebar';
import {
  fetchRevisionQueue,
  fetchDetailedWeaknesses,
  getUserId,
} from '../api/client';

const DIFFICULTY_LABELS = {
  0: 'Unknown',
  1: 'Easy',
  2: 'Medium',
  3: 'Hard',
};

export default function Revision() {
  const [activeTab, setActiveTab] = useState('recommendations');
  const [recommendations, setRecommendations] = useState([]);
  const [weakTopics, setWeakTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRevisionData();
  }, []);

  const loadRevisionData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const userId = getUserId();

      if (!userId) {
        setError('Please login again.');
        return;
      }

      const [recs, topics] = await Promise.all([
        fetchRevisionQueue(userId, 20),
        fetchDetailedWeaknesses(userId),
      ]);

      setRecommendations(recs || []);
      setWeakTopics(topics || []);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 'Failed to load revision data',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />

      <div className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto">
        <div className="border-b border-gray-900 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 font-mono text-xs text-cyan-400 tracking-wider">
                <span>MODULES</span>
                <span>/</span>
                <span className="text-gray-500">REVISION</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-black tracking-tight uppercase">
                Revision
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Revisit solved problems and drill weak topics.
              </p>
            </div>

            <button
              onClick={loadRevisionData}
              disabled={isLoading}
              className="px-4 py-2 rounded bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 text-sm"
            >
              {isLoading ? 'Loading...' : 'Retry'}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded border border-red-800 bg-red-950/40 px-4 py-3 text-red-300 flex items-center justify-between gap-4">
            <span>{error}</span>
            <button
              onClick={loadRevisionData}
              className="text-sm underline hover:text-red-200"
            >
              Retry
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-4 py-2 rounded text-sm ${
              activeTab === 'recommendations'
                ? 'bg-cyan-600'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            Recommendations
          </button>
          <button
            onClick={() => setActiveTab('weak-topics')}
            className={`px-4 py-2 rounded text-sm ${
              activeTab === 'weak-topics'
                ? 'bg-cyan-600'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            Weak Topics
          </button>
        </div>

        {isLoading ? (
          <p className="text-gray-400">Loading revision queue...</p>
        ) : activeTab === 'recommendations' ? (
          recommendations.length === 0 ? (
            <p className="text-gray-400">
              No revision recommendations yet. Solve problems and sync first.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {recommendations.map((item) => (
                <div
                  key={`${item.platform}-${item.problemId}`}
                  className="rounded-xl border border-gray-800 bg-gray-900/40 p-5 space-y-3"
                >
                  <div>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 uppercase font-mono">
                      {item.platform} · {item.problemId}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 rounded bg-gray-800 text-gray-300 font-medium">
                      {DIFFICULTY_LABELS[item.difficulty] || item.difficulty || 'Medium'}
                    </span>
                    <span className={`px-2 py-1 rounded border font-bold ${
                      item.priority === 'High' ? 'bg-red-950/40 text-red-300 border-red-900/30' :
                      item.priority === 'Medium' ? 'bg-orange-950/40 text-orange-300 border-orange-900/30' :
                      'bg-indigo-950/40 text-indigo-300 border-indigo-900/30'
                    }`}>
                      {(item.priority || 'Low').toUpperCase()} PRIORITY
                    </span>
                    <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {item.reason}
                    </span>
                    <span className="px-2 py-1 rounded bg-teal-950/40 text-teal-300 border border-teal-900/30 font-medium">
                      Est. Time: {item.estimatedRevisionTime}m
                    </span>
                    <span className="px-2 py-1 rounded bg-fuchsia-950/40 text-fuchsia-300 border border-fuchsia-900/30 font-medium">
                      Confidence: {item.confidence}%
                    </span>
                    <span className="px-2 py-1 rounded bg-yellow-950/40 text-yellow-300 border border-yellow-900/30 font-bold">
                      Deadline: {item.suggestedDeadline}
                    </span>
                  </div>
                  {item.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded bg-gray-950 border border-gray-800 text-gray-400"
                        >
                          {tag.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  )}

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded bg-cyan-700 hover:bg-cyan-600 text-sm font-semibold transition-colors mt-2"
                  >
                    Revise Problem
                    <FiExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          )
        ) : weakTopics.length === 0 ? (
          <p className="text-gray-400">
            No weak topics detected yet. Keep practicing and sync submissions.
          </p>
        ) : (
          <div className="space-y-6">
            {weakTopics.map((topic) => (
              <div
                key={topic.topic}
                className="rounded-xl border border-gray-800 bg-gray-900/40 p-5 shadow-lg relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/5 transition-colors duration-300 pointer-events-none" />
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 relative z-10">
                  <h3 className="text-xl font-bold capitalize text-white">
                    {topic.topic.replace(/_/g, ' ')}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm px-3 py-1 rounded bg-red-500/20 text-red-400 font-bold border border-red-500/30">
                      {Math.round(topic.weaknessScore)}% Weakness
                    </span>
                    <span className="text-sm px-3 py-1 rounded bg-green-500/20 text-green-400 font-semibold border border-green-500/30">
                      {topic.successRate}% Success
                    </span>
                  </div>
                </div>

                <div className="space-y-2 relative z-10 mt-6">
                  <h4 className="text-sm font-semibold text-slate-400 mb-3 tracking-wide uppercase">Suggested Practice</h4>
                  {topic.suggestedProblems?.length ? (
                    topic.suggestedProblems.map((problem) => (
                      <div
                        key={`${problem.platform}-${problem.problemId}`}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-800 bg-black/40 px-4 py-3 hover:bg-slate-800/50 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-slate-200">{problem.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            <span className="uppercase font-semibold text-slate-400">{problem.platform}</span> ·{' '}
                            {DIFFICULTY_LABELS[problem.difficulty] || problem.difficulty || 'Medium'}
                          </p>
                        </div>
                        <a
                          href={problem.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-cyan-400 hover:text-cyan-300 font-medium hover:underline inline-flex items-center gap-1.5"
                        >
                          Solve Now
                          <FiExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                      No suggested problems for this topic. All known problems are already solved!
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
