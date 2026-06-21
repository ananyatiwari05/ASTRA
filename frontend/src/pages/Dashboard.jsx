import React, { useEffect, useState } from 'react';

import Sidebar from '../components/Sidebar';
import ProfileCard from '../components/ProfileCard';
import RatingCard from '../components/RatingCard';
import RatingGraph from '../components/RatingGraph';
import SubmissionTable from '../components/SubmissionTable';
import {
  fetchDashboard,
  getUserId,
  syncCodeforces,
} from '../api/client';

function formatSubmissionTime(value) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString();
}

export default function Dashboard() {
  const [platform, setPlatform] = useState('codeforces');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [ratingHistory, setRatingHistory] = useState([]);
  const [submissionsData, setSubmissionsData] = useState([]);
  const [weaknesses, setWeaknesses] = useState([]);
  const [revisionRecommendations, setRevisionRecommendations] =
    useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const userId = getUserId();

      if (!userId) {
        setError('Please login again.');
        return;
      }

      const data = await fetchDashboard(userId);

      setUserData(data.user || {});
      setRatingHistory(data.ratings || data.ratingHistory || []);
      setSubmissionsData(
        (data.submissions || data.recentSubmissions || []).map(
          (submission) => ({
            ...submission,
            time: formatSubmissionTime(submission.time),
          }),
        ),
      );
      setWeaknesses(data.weaknesses || []);
      setRevisionRecommendations(
        data.revisionRecommendations || [],
      );
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    const userId = getUserId();

    if (!userId) {
      setError('Please login again.');
      return;
    }

    try {
      setIsSyncing(true);
      setError('');
      await syncCodeforces(userId);
      await fetchDashboardData();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          'Failed to sync Codeforces data',
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredRatings = ratingHistory.filter(
    (item) => item.platform === platform,
  );

  const filteredSubmissions = submissionsData.filter(
    (item) => item.platform === platform,
  );

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />

      <div className="flex-1 p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-3">
            <button
              onClick={() => setPlatform('codeforces')}
              className={`px-4 py-2 rounded ${
                platform === 'codeforces'
                  ? 'bg-cyan-600'
                  : 'bg-gray-800'
              }`}
            >
              Codeforces
            </button>

            <button
              onClick={() => setPlatform('leetcode')}
              className={`px-4 py-2 rounded ${
                platform === 'leetcode'
                  ? 'bg-cyan-600'
                  : 'bg-gray-800'
              }`}
            >
              LeetCode
            </button>

            <button
              onClick={() => setPlatform('codechef')}
              className={`px-4 py-2 rounded ${
                platform === 'codechef'
                  ? 'bg-cyan-600'
                  : 'bg-gray-800'
              }`}
            >
              CodeChef
            </button>
          </div>

          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="px-4 py-2 rounded bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50"
          >
            {isSyncing ? 'Syncing...' : 'Sync Codeforces'}
          </button>
        </div>

        {error && (
          <div className="rounded border border-red-800 bg-red-950/40 px-4 py-3 text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfileCard
            user={userData}
            platform={platform}
            isLoading={isLoading}
          />

          <RatingCard
            user={userData}
            platform={platform}
            isLoading={isLoading}
          />
        </div>

        <RatingGraph
          history={filteredRatings}
          isLoading={isLoading}
        />

        <SubmissionTable
          submissions={filteredSubmissions}
          isLoading={isLoading}
        />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="border border-gray-700 rounded bg-gray-900 p-4">
            <h3 className="text-lg font-bold mb-3">Weak Topics</h3>
            {isLoading ? (
              <p className="text-gray-400">Loading...</p>
            ) : weaknesses.length === 0 ? (
              <p className="text-gray-400">
                No weakness data yet. Sync submissions first.
              </p>
            ) : (
              <div className="space-y-2">
                {weaknesses.slice(0, 5).map((item) => (
                  <div
                    key={item.topic}
                    className="flex justify-between text-sm border-b border-gray-800 pb-2"
                  >
                    <span>{item.topic}</span>
                    <span className="text-gray-400">
                      {item.successRate}% · {item.unsolvedCount} unsolved
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border border-gray-700 rounded bg-gray-900 p-4">
            <h3 className="text-lg font-bold mb-3">
              Revision Recommendations
            </h3>
            {isLoading ? (
              <p className="text-gray-400">Loading...</p>
            ) : revisionRecommendations.length === 0 ? (
              <p className="text-gray-400">
                No revision recommendations yet.
              </p>
            ) : (
              <div className="space-y-2">
                {revisionRecommendations.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm border-b border-gray-800 pb-2"
                  >
                    <span>{item.title}</span>
                    <span className="text-gray-400">
                      {item.daysSinceLastAttempt}d ago
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
