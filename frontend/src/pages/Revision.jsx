import React, { useEffect, useState } from 'react';
import { FiExternalLink } from 'react-icons/fi';

import Sidebar from '../components/Sidebar';
import {
  fetchRevisionQueue,
  fetchDetailedWeaknesses,
  fetchUpsolvingQueue,
  getUserId,
} from '../api/client';

const DIFFICULTY_LABELS = {
  0: 'Unknown',
  1: 'Easy',
  2: 'Medium',
  3: 'Hard',
};

export default function Revision() {
  const [activeTab, setActiveTab] = useState('daily-plan');
  const [recommendations, setRecommendations] = useState([]);
  const [weakTopics, setWeakTopics] = useState([]);
  const [upsolveQueue, setUpsolveQueue] = useState([]);
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

      const [recs, topics, upsolves] = await Promise.all([
        fetchRevisionQueue(userId, 20),
        fetchDetailedWeaknesses(userId),
        fetchUpsolvingQueue(userId),
      ]);

      setRecommendations(recs || []);
      setWeakTopics(topics || []);
      setUpsolveQueue(upsolves || []);
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

        <div className="flex gap-2 border-b border-gray-800 pb-2">
          <button
            onClick={() => setActiveTab('daily-plan')}
            className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
              activeTab === 'daily-plan'
                ? 'bg-cyan-600 text-white'
                : 'bg-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Revision Plan
          </button>
          <button
            onClick={() => setActiveTab('upsolve-queue')}
            className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
              activeTab === 'upsolve-queue'
                ? 'bg-cyan-600 text-white'
                : 'bg-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Contest Upsolving
          </button>
          <button
            onClick={() => setActiveTab('weak-topics')}
            className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
              activeTab === 'weak-topics'
                ? 'bg-cyan-600 text-white'
                : 'bg-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Weak Topics Drill
          </button>
        </div>

        {isLoading ? (
          <p className="text-gray-400">Loading your data...</p>
        ) : activeTab === 'daily-plan' ? (
          recommendations.length === 0 ? (
            <p className="text-gray-400">
              No revision recommendations yet. Solve problems and sync first.
            </p>
          ) : (
            <div className="space-y-8">
              {['Today', 'Within 3 days', 'Next week'].map(deadline => {
                const group = recommendations.filter(r => r.suggestedDeadline === deadline);
                if (group.length === 0) return null;
                return (
                  <div key={deadline} className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${deadline === 'Today' ? 'bg-red-500' : deadline === 'Within 3 days' ? 'bg-orange-500' : 'bg-cyan-500'}`}></span>
                      Due {deadline} <span className="text-sm font-normal text-gray-500">({group.length} tasks)</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {group.map((item) => (
                        <div
                          key={`${item.platform}-${item.problemId}`}
                          className="rounded-xl border border-gray-800 bg-gray-900/40 p-5 flex flex-col justify-between"
                        >
                          <div className="space-y-3 mb-4">
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                  item.priority === 'High' ? 'bg-red-950/60 text-red-400 border border-red-900/50' :
                                  item.priority === 'Medium' ? 'bg-orange-950/60 text-orange-400 border border-orange-900/50' :
                                  'bg-indigo-950/60 text-indigo-400 border border-indigo-900/50'
                                }`}>
                                  {item.priority} PRIORITY
                                </span>
                                <span className="text-[10px] text-gray-500 uppercase font-mono bg-black px-1.5 py-0.5 rounded border border-gray-800">
                                  {item.platform}
                                </span>
                              </div>
                              <h3 className="font-bold text-lg text-white leading-tight mt-2">{item.title}</h3>
                            </div>

                            <p className="text-sm text-cyan-200 bg-cyan-950/30 p-2 rounded border border-cyan-900/40 leading-snug">
                              <span className="font-bold text-cyan-500 mr-1">Why:</span>
                              {item.reason}
                            </p>

                            <div className="flex flex-wrap gap-2 text-xs">
                              <span className="px-2 py-1 rounded bg-gray-800 text-gray-300 font-medium capitalize">
                                {item.topic.replace(/_/g, ' ')}
                              </span>
                              <span className="px-2 py-1 rounded bg-gray-800 text-gray-300 font-medium">
                                {DIFFICULTY_LABELS[item.difficulty] || item.difficulty || 'Medium'}
                              </span>
                              <span className="px-2 py-1 rounded bg-slate-900 text-slate-400 border border-slate-700 font-medium flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                {item.estimatedRevisionTime}m
                              </span>
                            </div>
                          </div>

                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-full gap-2 px-3 py-2 rounded bg-cyan-700 hover:bg-cyan-600 text-sm font-semibold transition-colors mt-auto"
                          >
                            Solve Problem
                            <FiExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : activeTab === 'upsolve-queue' ? (
          upsolveQueue.length === 0 ? (
            <p className="text-gray-400">
              No upsolving tasks. Participate in contests to populate this queue.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upsolveQueue.map((item) => (
                <div key={item.problemId} className="rounded-xl border border-gray-800 bg-gray-900/40 p-5 flex justify-between items-center group hover:border-gray-600 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        item.reason.includes('Easiest') ? 'bg-red-950/60 text-red-400 border border-red-900/50' :
                        item.reason.includes('Almost') ? 'bg-orange-950/60 text-orange-400 border border-orange-900/50' :
                        'bg-purple-950/60 text-purple-400 border border-purple-900/50'
                       }`}>
                         {item.type}
                       </span>
                       <span className="text-[10px] font-mono px-2 py-0.5 bg-gray-800 text-gray-300 rounded border border-gray-700">
                         {item.difficulty || '?'}
                       </span>
                    </div>
                    <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors">{item.title}</h3>
                    <p className="text-sm text-gray-400 mt-2 line-clamp-1">{item.reason}</p>
                  </div>
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-gray-800 rounded-full hover:bg-cyan-700 hover:text-white transition-colors text-gray-400"
                  >
                    <FiExternalLink className="w-5 h-5" />
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
