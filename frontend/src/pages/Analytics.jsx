import React, { useState, useEffect } from 'react';
import { getUserId, fetchUserAnalytics, fetchDetailedWeaknesses as fetchAnalyticsWeaknesses, fetchContestAnalysis } from '../api/client';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

import SiteNavbar from '../components/SiteNavbar';
import Footer from '../components/Footer';

const DIFFICULTY_COLORS = ['#10b981', '#f59e0b', '#f43f5e', '#64748b'];

function getWeaknessColor(rate) {
  if (rate < 40) return 'bg-red-500';
  if (rate < 70) return 'bg-orange-500';
  return 'bg-emerald-500';
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [weaknesses, setWeaknesses] = useState([]);
  const [contestData, setContestData] = useState(null);
  const [selectedWeakness, setSelectedWeakness] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      setError('');

      const userId = getUserId();

      if (!userId) {
        setError('Please login again.');
        return;
      }

      const [analyticsData, weaknessData, contestStats] = await Promise.all([
        fetchUserAnalytics(userId),
        fetchAnalyticsWeaknesses(userId),
        fetchContestAnalysis(userId)
      ]);

      setAnalytics(analyticsData);
      setWeaknesses(weaknessData || []);
      setContestData(contestStats);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 'Failed to load analytics',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const topicStats = analytics?.topicBreakdown ?? [];
  const progressTrend = analytics?.progressTrend?.daily ?? [];
  const streakInfo = {
    currentStreak: analytics?.progressTrend?.currentStreak ?? 0,
    longestStreak: analytics?.progressTrend?.longestStreak ?? 0,
  };

  const chartTopicStats = topicStats.slice(0, 10).map((item) => ({
    topic: item.topic,
    attempts: item.attempted ?? 0,
    solves: item.solved ?? 0,
    failures: item.failed ?? 0,
  }));

  const trendChartData = progressTrend.map((item) => ({
    date: item.date?.slice(5) || item.date,
    totalSubmissions:
      item.totalSubmissions ?? item.submissionCount ?? 0,
    accepted: item.accepted ?? item.acceptedCount ?? 0,
  }));

  const difficultyData = analytics?.difficultyDistribution
    ? [
        { name: 'Easy', value: analytics.difficultyDistribution.easy },
        {
          name: 'Medium',
          value: analytics.difficultyDistribution.medium,
        },
        { name: 'Hard', value: analytics.difficultyDistribution.hard },
        {
          name: 'Unknown',
          value: analytics.difficultyDistribution.unknown,
        },
      ].filter((item) => item.value > 0)
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0f1c] text-white selection:bg-indigo-500/30 overflow-hidden relative">
      <SiteNavbar />

      {/* Moving Background Orbs */}
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
                <span className="text-slate-400">ANALYTICS</span>
              </div>
              <h1 className="text-3xl lg:text-5xl font-black tracking-tight mt-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
                  Analytics
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-3 max-w-xl leading-relaxed">
                Unified stats from Codeforces, sheets, and contests.
              </p>
            </div>

            <button
              onClick={loadAnalytics}
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
              onClick={loadAnalytics}
              className="text-sm underline hover:text-red-200"
            >
              Retry
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 text-slate-400 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></span>
              Loading analytics...
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm p-6 flex items-center justify-between shadow-lg">
                <div>
                  <h2 className="text-sm font-mono text-indigo-400 uppercase tracking-wider">Overall DSA Health</h2>
                  <p className="text-4xl font-black mt-2 text-white">{analytics?.overallScore ?? 0}<span className="text-lg text-slate-500 font-medium">/100</span></p>
                </div>
                <div className={`px-4 py-2 rounded-full border text-sm font-bold uppercase tracking-widest shadow-sm ${
                  analytics?.healthLabel === 'Advanced' ? 'bg-indigo-900/30 text-indigo-400 border-indigo-700/50 shadow-[0_0_15px_rgba(79,70,229,0.2)]' :
                  analytics?.healthLabel === 'Intermediate' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-700/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' :
                  'bg-orange-900/30 text-orange-400 border-orange-700/50 shadow-[0_0_15px_rgba(249,115,22,0.2)]'
                }`}>
                  {analytics?.healthLabel || 'Beginner'}
                </div>
              </div>
            </div>

            {analytics?.patterns?.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3 text-slate-200">Detected Patterns</h2>
                <div className="flex flex-wrap gap-3">
                  {analytics.patterns.map((pattern, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/80 text-slate-200 text-sm font-medium shadow-sm">
                      {pattern}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {analytics?.strengths?.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3 text-emerald-400">Your Strengths</h2>
                <div className="flex flex-wrap gap-3">
                  {analytics.strengths.map((str, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-lg bg-emerald-900/20 border border-emerald-800/50 text-emerald-300 text-sm font-medium shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                      {str}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm p-4 hover:bg-slate-800/40 transition-colors">
                <p className="text-xs font-mono text-slate-400 uppercase">
                  Total Solved
                </p>
                <p className="text-2xl font-bold mt-1 text-white">
                  {analytics?.totalSolved ?? 0}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm p-4 hover:bg-slate-800/40 transition-colors">
                <p className="text-xs font-mono text-slate-400 uppercase">
                  Total Contests
                </p>
                <p className="text-2xl font-bold mt-1 text-white">
                  {analytics?.totalContests ?? 0}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm p-4 hover:bg-slate-800/40 transition-colors">
                <p className="text-xs font-mono text-slate-400 uppercase">
                  Success %
                </p>
                <p className="text-2xl font-bold mt-1 text-emerald-400">
                  {analytics?.overallSuccessRate ?? 0}%
                </p>
              </div>
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm p-4 hover:bg-slate-800/40 transition-colors">
                <p className="text-xs font-mono text-slate-400 uppercase">
                  Strongest Topic
                </p>
                <p className="text-lg font-bold mt-1 capitalize text-emerald-300 truncate">
                  {analytics?.strongestTopic?.topic?.replace(/_/g, ' ') ||
                    'N/A'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm p-4 hover:bg-slate-800/40 transition-colors">
                <p className="text-xs font-mono text-slate-400 uppercase">
                  Weakest Topic
                </p>
                <p className="text-lg font-bold mt-1 capitalize text-red-300 truncate">
                  {analytics?.weakestTopic?.topic?.replace(/_/g, ' ') ||
                    'N/A'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono text-slate-400 uppercase">
                    Current Streak
                  </p>
                  <p className="text-2xl font-bold mt-1 text-white">
                    {streakInfo.currentStreak} days
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                  🔥
                </div>
              </div>
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono text-slate-400 uppercase">
                    Longest Streak
                  </p>
                  <p className="text-2xl font-bold mt-1 text-white">
                    {streakInfo.longestStreak} days
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                  ⭐
                </div>
              </div>
            </div>

            <section className="rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm p-6">
              <h2 className="text-xl font-bold mb-4 text-slate-100">Weakness Heatmap</h2>
              {weaknesses.length === 0 ? (
                <p className="text-slate-400">
                  No weakness data yet. Connect handles and sync your data.
                </p>
              ) : (
                <div className="space-y-3">
                  {weaknesses.slice(0, 12).map((item) => (
                    <div key={item.topic} className="space-y-1 group relative">
                      <div className="flex justify-between text-sm items-center">
                        <span className="capitalize font-medium text-slate-200">
                          {item.topic.replace(/_/g, ' ')}
                        </span>
                        <div className="flex items-center gap-4">
                          <span className="text-slate-400 text-xs font-mono">
                            score {item.weaknessScore ?? 0} ·{' '}
                            {item.successRate ?? 0}%
                          </span>
                          <button 
                            onClick={() => setSelectedWeakness(item)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-indigo-400 text-slate-500"
                            title="View detailed analysis"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                          </button>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800/80 overflow-hidden">
                        <div
                          className={`h-full shadow-[0_0_10px_currentColor] ${getWeaknessColor(item.successRate ?? 0)}`}
                          style={{
                            width: `${Math.max(item.weaknessScore ?? item.successRate ?? 4, 4)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <section className="rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm p-6 h-[400px]">
                <h2 className="text-xl font-bold mb-4 text-slate-100">Topic Stats</h2>
                {chartTopicStats.length === 0 ? (
                  <p className="text-slate-400">No topic stats available.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={chartTopicStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey="topic"
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="attempts" fill="#3b82f6" name="Attempts" />
                      <Bar dataKey="solves" fill="#10b981" name="Solves" />
                      <Bar dataKey="failures" fill="#ef4444" name="Failures" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </section>

              <section className="rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm p-6 h-[400px]">
                <h2 className="text-xl font-bold mb-4 text-slate-100">
                  Difficulty Distribution
                </h2>
                {difficultyData.length === 0 ? (
                  <p className="text-slate-400">
                    No solved problems yet.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height="85%">
                    <PieChart>
                      <Pie
                        data={difficultyData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                        label
                        stroke="#0f172a"
                        strokeWidth={2}
                      >
                        {difficultyData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={
                              DIFFICULTY_COLORS[
                                index % DIFFICULTY_COLORS.length
                              ]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </section>
            </div>

            <section className="rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm p-6 h-[400px]">
              <h2 className="text-xl font-bold mb-4 text-slate-100">
                Progress Trend (Last 30 Days)
              </h2>
              {trendChartData.length === 0 ? (
                <p className="text-slate-400">No submission activity yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height="85%">
                  <LineChart data={trendChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                    />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="totalSubmissions"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
                      name="Submissions"
                    />
                    <Line
                      type="monotone"
                      dataKey="accepted"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: '#10b981', strokeWidth: 2 }}
                      name="Accepted"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </section>

            {/* Contest Insights & Comparison */}
            {contestData?.comparison && (
              <section className="rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm p-6">
                <h2 className="text-xl font-bold mb-4 text-white">Contest Comparison (Last 2)</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <div className="bg-[#0a0f1c]/60 rounded-xl p-5 border border-slate-800/80 shadow-inner">
                    <p className="text-slate-400 text-sm font-mono mb-2">MOST IMPROVED AREA</p>
                    <p className="text-lg font-bold text-emerald-400">{contestData.comparison.mostImprovedArea}</p>
                  </div>
                  <div className="bg-[#0a0f1c]/60 rounded-xl p-5 border border-slate-800/80 shadow-inner">
                    <p className="text-slate-400 text-sm font-mono mb-2">NEEDS ATTENTION</p>
                    <p className="text-lg font-bold text-red-400">{contestData.comparison.needsImmediateAttention}</p>
                  </div>
                  <div className="bg-[#0a0f1c]/60 rounded-xl p-5 border border-slate-800/80 shadow-inner">
                    <p className="text-slate-400 text-sm font-mono mb-2">ACCURACY DIFF</p>
                    <p className={`text-lg font-bold ${contestData.comparison.accuracyDifference > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {contestData.comparison.accuracyDifference > 0 ? '+' : ''}{contestData.comparison.accuracyDifference}%
                    </p>
                  </div>
                </div>

                {contestData.comparison.topicComparison?.length > 0 && (
                  <div className="overflow-x-auto rounded-xl border border-slate-800/80">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-800/50 text-slate-300 font-mono text-xs">
                        <tr>
                          <th className="p-4">TOPIC</th>
                          <th className="p-4 text-center">LAST ATTEMPTS</th>
                          <th className="p-4 text-center">PREV ATTEMPTS</th>
                          <th className="p-4 text-center">LAST ACCURACY</th>
                          <th className="p-4 text-center">PREV ACCURACY</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50 bg-[#0a0f1c]/40">
                        {contestData.comparison.topicComparison.map((tc, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                            <td className="p-4 font-medium capitalize">{tc.topic.replace(/_/g, ' ')}</td>
                            <td className="p-4 text-center font-mono">{tc.lastAttempted}</td>
                            <td className="p-4 text-center font-mono text-slate-500">{tc.prevAttempted}</td>
                            <td className="p-4 text-center font-mono">{tc.lastAccuracy}%</td>
                            <td className="p-4 text-center font-mono text-slate-500">{tc.prevAccuracy}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {/* Learning Timeline */}
            {analytics?.learningTimeline?.length > 0 && (
              <section className="rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm p-6">
                <h2 className="text-xl font-bold mb-6 text-slate-100">Learning Timeline (Last 90 Days)</h2>
                <div className="relative border-l-2 border-slate-700 ml-4 space-y-8">
                  {analytics.learningTimeline.map((item, idx) => (
                    <div key={idx} className="pl-8 relative group">
                      <div className="absolute w-4 h-4 bg-indigo-500 rounded-full -left-[9px] top-1.5 ring-4 ring-[#0a0f1c] group-hover:scale-125 transition-transform shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                      <p className="text-xs text-slate-500 font-mono mb-1">{new Date(item.date).toLocaleDateString()}</p>
                      <p className="text-white font-medium text-lg">
                        <span className="text-indigo-400 font-bold">{item.action}</span> in <span className="capitalize">{item.topic.replace(/_/g, ' ')}</span>
                      </p>
                      <p className="text-sm text-slate-400 mt-2 bg-slate-800/30 p-3 rounded-lg border border-slate-800/50 inline-block">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {analytics?.recommendations?.length > 0 && (
              <section className="rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm p-6">
                <h2 className="text-xl font-bold mb-4 text-indigo-400">Smart Recommendations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analytics.recommendations.map((rec, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-800/60 bg-[#0a0f1c]/60 p-5 hover:bg-slate-800/40 hover:border-indigo-500/30 transition-all shadow-lg group">
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${rec.priority === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.2)]'}`}>
                          {rec.priority} PRIORITY
                        </span>
                        <span className="text-xs text-slate-400 font-mono bg-slate-800/80 px-2 py-1 rounded-md border border-slate-700">{rec.estimatedTime}</span>
                      </div>
                      <p className="text-sm text-slate-200 mt-3 mb-5 leading-relaxed font-medium group-hover:text-white transition-colors">
                        {rec.reason}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2.5 py-1 rounded bg-indigo-900/30 text-indigo-300 border border-indigo-800/50">{rec.topic.replace(/_/g, ' ')}</span>
                        <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">{rec.difficulty}</span>
                        <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">{rec.source}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </motion.div>
      <Footer />

      {/* Weakness Details Modal */}
      <AnimatePresence>
        {selectedWeakness && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0f1c]/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(79,70,229,0.15)]"
            >
              <div className="p-6 border-b border-slate-800/80 flex justify-between items-start bg-slate-900/80 backdrop-blur-xl z-10 sticky top-0">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                      {selectedWeakness.topic.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs px-2.5 py-1 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 font-bold shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                      Score: {selectedWeakness.weaknessScore}
                    </span>
                  </h2>
                  <p className="text-slate-400 mt-3 text-sm max-w-2xl bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50">
                    {selectedWeakness.reasons?.map((r, i) => (
                      <span key={i} className="inline-block mr-4 font-medium">⚠️ {r}</span>
                    ))}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedWeakness(null)}
                  className="p-2.5 hover:bg-slate-800 rounded-xl transition-all hover:text-white text-slate-400 border border-transparent hover:border-slate-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-8 bg-[#0a0f1c]/50">
                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700/50 shadow-inner">
                    <p className="text-xs text-slate-500 font-mono mb-1 uppercase tracking-wider">SUCCESS RATE</p>
                    <p className="text-2xl font-black text-emerald-400">{Math.round(selectedWeakness.successRate)}%</p>
                  </div>
                  <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700/50 shadow-inner">
                    <p className="text-xs text-slate-500 font-mono mb-1 uppercase tracking-wider">CONTEST FAILS</p>
                    <p className="text-2xl font-black text-red-400">{selectedWeakness.contestFailures || 0}</p>
                  </div>
                  <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700/50 shadow-inner">
                    <p className="text-xs text-slate-500 font-mono mb-1 uppercase tracking-wider">PRACTICE FAILS</p>
                    <p className="text-2xl font-black text-orange-400">{selectedWeakness.practiceFailures || 0}</p>
                  </div>
                  <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700/50 shadow-inner">
                    <p className="text-xs text-slate-500 font-mono mb-1 uppercase tracking-wider">RECENT TREND</p>
                    <p className="text-2xl font-black capitalize text-indigo-400">{selectedWeakness.trend || 'Flat'}</p>
                  </div>
                </div>

                {/* Contest Failures */}
                {selectedWeakness.failedContestProblems?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                      </span>
                      Actual Contest Failures
                    </h3>
                    <div className="space-y-3">
                      {selectedWeakness.failedContestProblems.map((problem, idx) => (
                        <div key={idx} className="bg-red-950/20 border border-red-900/30 p-5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-red-950/30 transition-colors">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-mono px-2 py-0.5 bg-red-900/40 text-red-300 rounded border border-red-800/50">Contest {problem.contestId}</span>
                              <span className="text-xs font-bold px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">{problem.rating || '?'}</span>
                            </div>
                            <p className="font-semibold text-white text-lg">{problem.title}</p>
                            <p className="text-sm text-red-300/80 mt-1">
                              <span className="font-semibold">Verdict:</span> {problem.verdict}
                            </p>
                          </div>
                          <div className="w-full md:w-auto md:text-right max-w-sm">
                            <span className="inline-block text-[10px] uppercase tracking-wider text-red-400 font-bold mb-1.5 px-2 py-0.5 bg-red-500/10 rounded">Auto-Diagnosis</span>
                            <p className="text-sm text-red-200 bg-red-900/40 px-3 py-2.5 rounded-lg border border-red-800/50 shadow-inner">{problem.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Questions */}
                {selectedWeakness.suggestedProblems?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                      </span>
                      Recommended Practice
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedWeakness.suggestedProblems.map((problem, idx) => (
                        <a key={idx} href={problem.url} target="_blank" rel="noopener noreferrer" className="bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 hover:border-indigo-500/50 p-4 rounded-xl transition-all group block shadow-sm hover:shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                          <p className="font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors mb-3">{problem.title}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono px-2 py-1 bg-[#0a0f1c] text-slate-400 rounded uppercase border border-slate-800">{problem.platform}</span>
                            <span className="text-[10px] font-bold px-2 py-1 bg-indigo-900/30 text-indigo-400 border border-indigo-800/50 rounded uppercase">{problem.difficulty || '?'}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
