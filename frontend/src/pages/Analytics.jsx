import React, { useState, useEffect } from 'react';
import { getUserId, fetchUserAnalytics, fetchDetailedWeaknesses as fetchAnalyticsWeaknesses } from '../api/client';
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

      const [analyticsData, weaknessData] = await Promise.all([
        fetchUserAnalytics(userId),
        fetchAnalyticsWeaknesses(userId),
      ]);

      setAnalytics(analyticsData);
      setWeaknesses(weaknessData || []);
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
                    <div key={item.topic} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">
                          {item.topic.replace(/_/g, ' ')}
                        </span>
                        <span className="text-gray-400">
                          score {item.weaknessScore ?? 0} ·{' '}
                          {item.successRate ?? 0}%
                        </span>
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

            <section className="rounded-xl border border-gray-800 bg-gray-900/20 p-6">
              <h2 className="text-xl font-bold mb-4">Contest Performance</h2>
              {contestPerformance.length === 0 ? (
                <p className="text-gray-400">
                  No contest failure patterns yet. Sync Codeforces contests first.
                </p>
              ) : (
                <div className="space-y-3">
                  {contestPerformance.slice(0, 10).map((item) => (
                    <div
                      key={item.topic}
                      className="flex items-center justify-between rounded-lg border border-gray-800 bg-black/30 px-4 py-3"
                    >
                      <span className="capitalize">
                        {item.topic.replace(/_/g, ' ')}
                      </span>
                      <span className="text-rose-300 text-sm">
                        {item.failures} contest failures
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
