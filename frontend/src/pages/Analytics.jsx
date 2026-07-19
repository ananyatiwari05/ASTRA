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
import Sidebar from '../components/Sidebar';

const DIFFICULTY_COLORS = ['#10b981', '#f59e0b', '#f43f5e', '#6b7280'];

function getWeaknessColor(rate) {
  if (rate < 40) return 'bg-red-500';
  if (rate < 70) return 'bg-yellow-500';
  return 'bg-green-500';
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

  const contestPerformance = analytics?.contestPerformance ?? [];

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
                <span className="text-gray-500">ANALYTICS</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-black tracking-tight uppercase">
                Analytics
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Unified stats from Codeforces, sheets, and contests.
              </p>
            </div>

            <button
              onClick={loadAnalytics}
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
              onClick={loadAnalytics}
              className="text-sm underline hover:text-red-200"
            >
              Retry
            </button>
          </div>
        )}

        {isLoading ? (
          <p className="text-gray-400">Loading analytics...</p>
        ) : (
          <>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 rounded-xl border border-gray-800 bg-gray-900/40 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-mono text-cyan-400 uppercase tracking-wider">Overall DSA Health</h2>
                  <p className="text-4xl font-black mt-2">{analytics?.overallScore ?? 0}<span className="text-lg text-gray-500 font-medium">/100</span></p>
                </div>
                <div className={`px-4 py-2 rounded-full border text-sm font-bold uppercase tracking-widest ${
                  analytics?.healthLabel === 'Advanced' ? 'bg-indigo-900/30 text-indigo-400 border-indigo-700' :
                  analytics?.healthLabel === 'Intermediate' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-700' :
                  'bg-orange-900/30 text-orange-400 border-orange-700'
                }`}>
                  {analytics?.healthLabel || 'Beginner'}
                </div>
              </div>
            </div>

            {analytics?.patterns?.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3">Detected Patterns</h2>
                <div className="flex flex-wrap gap-3">
                  {analytics.patterns.map((pattern, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-lg bg-gray-800/80 border border-gray-700 text-gray-200 text-sm font-medium shadow-sm">
                      {pattern}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {analytics?.strengths?.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3 text-green-400">Your Strengths</h2>
                <div className="flex flex-wrap gap-3">
                  {analytics.strengths.map((str, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-lg bg-green-900/20 border border-green-800/50 text-green-300 text-sm font-medium shadow-sm">
                      {str}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
              <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
                <p className="text-xs font-mono text-gray-500 uppercase">
                  Total Solved
                </p>
                <p className="text-2xl font-bold mt-1">
                  {analytics?.totalSolved ?? 0}
                </p>
              </div>
              <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
                <p className="text-xs font-mono text-gray-500 uppercase">
                  Total Contests
                </p>
                <p className="text-2xl font-bold mt-1">
                  {analytics?.totalContests ?? 0}
                </p>
              </div>
              <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
                <p className="text-xs font-mono text-gray-500 uppercase">
                  Success %
                </p>
                <p className="text-2xl font-bold mt-1">
                  {analytics?.overallSuccessRate ?? 0}%
                </p>
              </div>
              <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
                <p className="text-xs font-mono text-gray-500 uppercase">
                  Strongest Topic
                </p>
                <p className="text-lg font-bold mt-1 capitalize">
                  {analytics?.strongestTopic?.topic?.replace(/_/g, ' ') ||
                    'N/A'}
                </p>
              </div>
              <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
                <p className="text-xs font-mono text-gray-500 uppercase">
                  Weakest Topic
                </p>
                <p className="text-lg font-bold mt-1 capitalize">
                  {analytics?.weakestTopic?.topic?.replace(/_/g, ' ') ||
                    'N/A'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
                <p className="text-xs font-mono text-gray-500 uppercase">
                  Current Streak
                </p>
                <p className="text-2xl font-bold mt-1">
                  {streakInfo.currentStreak} days
                </p>
              </div>
              <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
                <p className="text-xs font-mono text-gray-500 uppercase">
                  Longest Streak
                </p>
                <p className="text-2xl font-bold mt-1">
                  {streakInfo.longestStreak} days
                </p>
              </div>
            </div>

            <section className="rounded-xl border border-gray-800 bg-gray-900/20 p-6">
              <h2 className="text-xl font-bold mb-4">Weakness Heatmap</h2>
              {weaknesses.length === 0 ? (
                <p className="text-gray-400">
                  No weakness data yet. Connect handles and sync your data.
                </p>
              ) : (
                <div className="space-y-3">
                  {weaknesses.slice(0, 12).map((item) => (
                    <div key={item.topic} className="space-y-1 group relative">
                      <div className="flex justify-between text-sm items-center">
                        <span className="capitalize font-medium text-gray-200">
                          {item.topic.replace(/_/g, ' ')}
                        </span>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-400 text-xs font-mono">
                            score {item.weaknessScore ?? 0} ·{' '}
                            {item.successRate ?? 0}%
                          </span>
                          <button 
                            onClick={() => setSelectedWeakness(item)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-cyan-400 text-gray-500"
                            title="View detailed analysis"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                          </button>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                        <div
                          className={`h-full ${getWeaknessColor(item.successRate ?? 0)}`}
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
              <section className="rounded-xl border border-gray-800 bg-gray-900/20 p-6 h-[400px]">
                <h2 className="text-xl font-bold mb-4">Topic Stats</h2>
                {chartTopicStats.length === 0 ? (
                  <p className="text-gray-400">No topic stats available.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={chartTopicStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="topic"
                        tick={{ fill: '#9ca3af', fontSize: 11 }}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#111827',
                          border: '1px solid #374151',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="attempts" fill="#06b6d4" name="Attempts" />
                      <Bar dataKey="solves" fill="#10b981" name="Solves" />
                      <Bar dataKey="failures" fill="#f43f5e" name="Failures" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </section>

              <section className="rounded-xl border border-gray-800 bg-gray-900/20 p-6 h-[400px]">
                <h2 className="text-xl font-bold mb-4">
                  Difficulty Distribution
                </h2>
                {difficultyData.length === 0 ? (
                  <p className="text-gray-400">
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
                          backgroundColor: '#111827',
                          border: '1px solid #374151',
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </section>
            </div>

            <section className="rounded-xl border border-gray-800 bg-gray-900/20 p-6 h-[400px]">
              <h2 className="text-xl font-bold mb-4">
                Progress Trend (Last 30 Days)
              </h2>
              {trendChartData.length === 0 ? (
                <p className="text-gray-400">No submission activity yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height="85%">
                  <LineChart data={trendChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#9ca3af', fontSize: 11 }}
                    />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        border: '1px solid #374151',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="totalSubmissions"
                      stroke="#06b6d4"
                      dot={false}
                      name="Submissions"
                    />
                    <Line
                      type="monotone"
                      dataKey="accepted"
                      stroke="#10b981"
                      dot={false}
                      name="Accepted"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </section>

            {/* Contest Insights & Comparison */}
            {contestData?.comparison && (
              <section className="rounded-xl border border-gray-800 bg-gray-900/20 p-6">
                <h2 className="text-xl font-bold mb-4 text-white">Contest Comparison (Last 2)</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <div className="bg-black/40 rounded-lg p-5 border border-gray-800">
                    <p className="text-gray-400 text-sm font-mono mb-2">MOST IMPROVED AREA</p>
                    <p className="text-lg font-bold text-green-400">{contestData.comparison.mostImprovedArea}</p>
                  </div>
                  <div className="bg-black/40 rounded-lg p-5 border border-gray-800">
                    <p className="text-gray-400 text-sm font-mono mb-2">NEEDS ATTENTION</p>
                    <p className="text-lg font-bold text-red-400">{contestData.comparison.needsImmediateAttention}</p>
                  </div>
                  <div className="bg-black/40 rounded-lg p-5 border border-gray-800">
                    <p className="text-gray-400 text-sm font-mono mb-2">ACCURACY DIFF</p>
                    <p className={`text-lg font-bold ${contestData.comparison.accuracyDifference > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {contestData.comparison.accuracyDifference > 0 ? '+' : ''}{contestData.comparison.accuracyDifference}%
                    </p>
                  </div>
                </div>

                {contestData.comparison.topicComparison?.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-800/50 text-gray-400 font-mono text-xs">
                        <tr>
                          <th className="p-3 rounded-tl-lg">TOPIC</th>
                          <th className="p-3 text-center">LAST ATTEMPTS</th>
                          <th className="p-3 text-center">PREV ATTEMPTS</th>
                          <th className="p-3 text-center">LAST ACCURACY</th>
                          <th className="p-3 text-center rounded-tr-lg">PREV ACCURACY</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {contestData.comparison.topicComparison.map((tc, idx) => (
                          <tr key={idx} className="hover:bg-gray-800/30">
                            <td className="p-3 font-medium capitalize">{tc.topic.replace(/_/g, ' ')}</td>
                            <td className="p-3 text-center font-mono">{tc.lastAttempted}</td>
                            <td className="p-3 text-center font-mono text-gray-500">{tc.prevAttempted}</td>
                            <td className="p-3 text-center font-mono">{tc.lastAccuracy}%</td>
                            <td className="p-3 text-center font-mono text-gray-500">{tc.prevAccuracy}%</td>
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
              <section className="rounded-xl border border-gray-800 bg-gray-900/20 p-6">
                <h2 className="text-xl font-bold mb-4">Learning Timeline (Last 90 Days)</h2>
                <div className="relative border-l-2 border-gray-800 ml-3 space-y-6">
                  {analytics.learningTimeline.map((item, idx) => (
                    <div key={idx} className="pl-6 relative">
                      <div className="absolute w-3 h-3 bg-cyan-500 rounded-full -left-[7px] top-1.5 ring-4 ring-black"></div>
                      <p className="text-xs text-gray-500 font-mono mb-1">{new Date(item.date).toLocaleDateString()}</p>
                      <p className="text-white font-medium">
                        <span className="text-cyan-400 font-bold">{item.action}</span> in <span className="capitalize">{item.topic.replace(/_/g, ' ')}</span>
                      </p>
                      <p className="text-sm text-gray-400 truncate max-w-md mt-1">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {analytics?.recommendations?.length > 0 && (
              <section className="rounded-xl border border-gray-800 bg-gray-900/40 p-6">
                <h2 className="text-xl font-bold mb-4 text-cyan-400">Smart Recommendations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analytics.recommendations.map((rec, idx) => (
                    <div key={idx} className="rounded-lg border border-gray-800 bg-black/40 p-5 hover:bg-gray-800/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${rec.priority === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                          {rec.priority} PRIORITY
                        </span>
                        <span className="text-xs text-gray-400 font-mono">{rec.estimatedTime}</span>
                      </div>
                      <p className="text-sm text-gray-200 mt-3 mb-4 leading-relaxed font-medium">
                        {rec.reason}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 rounded bg-gray-800 text-gray-300">{rec.topic.replace(/_/g, ' ')}</span>
                        <span className="px-2 py-1 rounded bg-gray-800 text-gray-300">{rec.difficulty}</span>
                        <span className="px-2 py-1 rounded bg-gray-800 text-gray-300">{rec.source}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* Weakness Details Modal */}
      {selectedWeakness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-800 flex justify-between items-start bg-black/40">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                  {selectedWeakness.topic.replace(/_/g, ' ')}
                  <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded border border-red-500/30 font-bold">
                    Score: {selectedWeakness.weaknessScore}
                  </span>
                </h2>
                <p className="text-gray-400 mt-2 text-sm max-w-2xl">
                  {selectedWeakness.reasons?.map((r, i) => (
                    <span key={i} className="inline-block mr-3">⚠️ {r}</span>
                  ))}
                </p>
              </div>
              <button 
                onClick={() => setSelectedWeakness(null)}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-8">
              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-black/50 p-4 rounded-lg border border-gray-800">
                  <p className="text-xs text-gray-500 font-mono mb-1">SUCCESS RATE</p>
                  <p className="text-xl font-bold">{Math.round(selectedWeakness.successRate)}%</p>
                </div>
                <div className="bg-black/50 p-4 rounded-lg border border-gray-800">
                  <p className="text-xs text-gray-500 font-mono mb-1">CONTEST FAILS</p>
                  <p className="text-xl font-bold text-red-400">{selectedWeakness.contestFailures || 0}</p>
                </div>
                <div className="bg-black/50 p-4 rounded-lg border border-gray-800">
                  <p className="text-xs text-gray-500 font-mono mb-1">PRACTICE FAILS</p>
                  <p className="text-xl font-bold text-orange-400">{selectedWeakness.practiceFailures || 0}</p>
                </div>
                <div className="bg-black/50 p-4 rounded-lg border border-gray-800">
                  <p className="text-xs text-gray-500 font-mono mb-1">RECENT TREND</p>
                  <p className="text-xl font-bold capitalize text-cyan-400">{selectedWeakness.trend || 'Flat'}</p>
                </div>
              </div>

              {/* Contest Failures */}
              {selectedWeakness.failedContestProblems?.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    Actual Contest Failures
                  </h3>
                  <div className="space-y-3">
                    {selectedWeakness.failedContestProblems.map((problem, idx) => (
                      <div key={idx} className="bg-red-950/20 border border-red-900/30 p-4 rounded-lg flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono px-2 py-0.5 bg-red-900/40 text-red-300 rounded">Contest {problem.contestId}</span>
                            <span className="text-xs font-bold px-2 py-0.5 bg-gray-800 text-gray-300 rounded">{problem.rating || '?'}</span>
                          </div>
                          <p className="font-semibold text-white mb-2">{problem.title}</p>
                          <p className="text-sm text-red-200">
                            <span className="font-bold">Verdict:</span> {problem.verdict}
                          </p>
                        </div>
                        <div className="text-right max-w-xs">
                          <span className="inline-block text-xs uppercase tracking-wider text-red-400 font-bold mb-1">Auto-Diagnosis</span>
                          <p className="text-sm text-red-100 bg-red-900/40 px-3 py-2 rounded border border-red-800/50">{problem.reason}</p>
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
                    <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    Recommended Practice
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedWeakness.suggestedProblems.map((problem, idx) => (
                      <a key={idx} href={problem.url} target="_blank" rel="noopener noreferrer" className="bg-gray-800/50 hover:bg-gray-800 border border-gray-700 p-4 rounded-lg transition-colors group block">
                        <p className="font-semibold text-cyan-50 group-hover:text-cyan-300 transition-colors mb-2">{problem.title}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono px-2 py-0.5 bg-black text-gray-400 rounded uppercase">{problem.platform}</span>
                          <span className="text-xs font-bold px-2 py-0.5 bg-cyan-900/40 text-cyan-400 border border-cyan-800/50 rounded">{problem.difficulty || '?'}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
