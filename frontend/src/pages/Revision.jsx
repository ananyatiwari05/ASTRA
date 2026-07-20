import React, { useEffect, useState } from 'react';
import { FiExternalLink } from 'react-icons/fi';
import { motion } from 'framer-motion';

import SiteNavbar from '../components/SiteNavbar';
import Footer from '../components/Footer';
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
    <div className="min-h-screen flex flex-col bg-[#0a0f1c] text-white selection:bg-indigo-500/30 overflow-hidden relative">
      <SiteNavbar />

      {/* Moving Background Orbs to match landing page */}
      <motion.div animate={{ x: [0, 100, -50, 0], y: [0, -50, 50, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="fixed top-0 left-0 w-[600px] h-[600px] bg-indigo-700/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <motion.div animate={{ x: [0, -100, 50, 0], y: [0, 50, -50, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="fixed bottom-0 right-0 w-[700px] h-[700px] bg-purple-700/10 rounded-full blur-[150px] pointer-events-none z-0" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto pt-24 pb-12 px-6 lg:px-12 relative z-10 w-full flex-1 space-y-8"
      >
        <div className="border-b border-slate-800/80 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 font-mono text-xs text-indigo-400 tracking-wider">
                <span className="bg-indigo-950/50 border border-indigo-500/30 px-2 py-0.5 rounded-full">MODULES</span>
                <span className="text-slate-600">/</span>
                <span className="text-slate-400">REVISION</span>
              </div>
              <h1 className="text-3xl lg:text-5xl font-black tracking-tight mt-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
                  Revision
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-3 max-w-xl leading-relaxed">
                Revisit solved problems and drill weak topics.
              </p>
            </div>

            <button
              onClick={loadRevisionData}
              disabled={isLoading}
              className="px-6 py-2.5 rounded-lg border border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-400 transition-all text-sm font-medium shadow-[0_0_15px_rgba(79,70,229,0.1)] disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Retry'}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-800/80 bg-red-950/40 px-4 py-3 text-red-300 flex items-center justify-between gap-4 backdrop-blur-sm">
            <span>{error}</span>
            <button
              onClick={loadRevisionData}
              className="text-sm underline hover:text-red-200"
            >
              Retry
            </button>
          </div>
        )}

        <div className="flex gap-2 border-b border-slate-800/80 pb-2">
          <button
            onClick={() => setActiveTab('daily-plan')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'daily-plan'
                ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.2)]'
                : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Revision Plan
          </button>
          <button
            onClick={() => setActiveTab('upsolve-queue')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'upsolve-queue'
                ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.2)]'
                : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Contest Upsolving
          </button>
          <button
            onClick={() => setActiveTab('weak-topics')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'weak-topics'
                ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.2)]'
                : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Weak Topics Drill
          </button>
        </div>

        {isLoading ? (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 text-slate-400 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></span>
              Loading your data...
            </div>
          </div>
        ) : activeTab === 'daily-plan' ? (
          recommendations.length === 0 ? (
            <p className="text-slate-400">
              No revision recommendations yet. Solve problems and sync first.
            </p>
          ) : (
            <div className="space-y-8">
              {['Today', 'Within 3 days', 'Next week'].map(deadline => {
                const group = recommendations.filter(r => r.suggestedDeadline === deadline);
                if (group.length === 0) return null;
                return (
                  <div key={deadline} className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-slate-100">
                      <span className={`w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] ${deadline === 'Today' ? 'bg-red-500 text-red-500' : deadline === 'Within 3 days' ? 'bg-orange-500 text-orange-500' : 'bg-indigo-500 text-indigo-500'}`}></span>
                      Due {deadline} <span className="text-sm font-normal text-slate-500">({group.length} tasks)</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {group.map((item) => (
                        <div
                          key={`${item.platform}-${item.problemId}`}
                          className="rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm p-5 flex flex-col justify-between hover:border-slate-700/80 transition-colors"
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
                                <span className="text-[10px] text-slate-400 uppercase font-mono bg-[#0a0f1c] px-1.5 py-0.5 rounded border border-slate-800">
                                  {item.platform}
                                </span>
                              </div>
                              <h3 className="font-bold text-lg text-white leading-tight mt-2">{item.title}</h3>
                            </div>

                            <p className="text-sm text-indigo-200 bg-indigo-950/30 p-2 rounded border border-indigo-900/40 leading-snug">
                              <span className="font-bold text-indigo-400 mr-1">Why:</span>
                              {item.reason}
                            </p>

                            <div className="flex flex-wrap gap-2 text-xs">
                              <span className="px-2 py-1 rounded bg-slate-800/50 text-slate-300 font-medium capitalize border border-slate-700/50">
                                {item.topic.replace(/_/g, ' ')}
                              </span>
                              <span className="px-2 py-1 rounded bg-slate-800/50 text-slate-300 font-medium border border-slate-700/50">
                                {DIFFICULTY_LABELS[item.difficulty] || item.difficulty || 'Medium'}
                              </span>
                              <span className="px-2 py-1 rounded bg-slate-900 text-slate-400 border border-slate-700/80 font-medium flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                {item.estimatedRevisionTime}m
                              </span>
                            </div>
                          </div>

                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-full gap-2 px-3 py-2 rounded-lg border border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-400 transition-all text-sm font-medium shadow-[0_0_15px_rgba(79,70,229,0.1)] mt-auto"
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
            <p className="text-slate-400">
              No upsolving tasks. Participate in contests to populate this queue.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upsolveQueue.map((item) => (
                <div key={item.problemId} className="rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm p-5 flex justify-between items-center group hover:border-slate-700/80 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        item.reason.includes('Easiest') ? 'bg-red-950/60 text-red-400 border border-red-900/50' :
                        item.reason.includes('Almost') ? 'bg-orange-950/60 text-orange-400 border border-orange-900/50' :
                        'bg-purple-950/60 text-purple-400 border border-purple-900/50'
                       }`}>
                         {item.type}
                       </span>
                       <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800/80 text-slate-300 rounded border border-slate-700/80">
                         {item.difficulty || '?'}
                       </span>
                    </div>
                    <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors">{item.title}</h3>
                    <p className="text-sm text-slate-400 mt-2 line-clamp-1">{item.reason}</p>
                  </div>
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-slate-800/80 rounded-full hover:bg-indigo-600 hover:text-white transition-colors text-slate-400"
                  >
                    <FiExternalLink className="w-5 h-5" />
                  </a>
                </div>
              ))}
            </div>
          )
        ) : weakTopics.length === 0 ? (
          <p className="text-slate-400">
            No weak topics detected yet. Keep practicing and sync submissions.
          </p>
        ) : (
          <div className="space-y-6">
            {weakTopics.map((topic) => (
              <div
                key={topic.topic}
                className="rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm p-5 shadow-lg relative overflow-hidden group hover:border-slate-700/80 transition-colors"
              >
                <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/5 transition-colors duration-300 pointer-events-none" />
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 relative z-10">
                  <h3 className="text-xl font-bold capitalize text-white">
                    {topic.topic.replace(/_/g, ' ')}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm px-3 py-1 rounded-lg bg-red-500/10 text-red-400 font-bold border border-red-500/20">
                      {Math.round(topic.weaknessScore)}% Weakness
                    </span>
                    <span className="text-sm px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
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
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800/60 bg-[#0a0f1c]/60 px-4 py-3 hover:bg-slate-800/40 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-slate-200">{problem.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            <span className="uppercase font-semibold text-slate-400">{problem.platform}</span> ·{' '}
                            {DIFFICULTY_LABELS[problem.difficulty] || problem.difficulty || 'Medium'}
                          </p>
                        </div>
                        <a
                          href={problem.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-400 hover:text-indigo-300 font-medium hover:underline inline-flex items-center gap-1.5"
                        >
                          Solve Now
                          <FiExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 italic bg-slate-900/50 p-4 rounded-lg border border-slate-800/80">
                      No suggested problems for this topic. All known problems are already solved!
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <Footer />
    </div>
  );
}
