import React, { useState, useEffect } from 'react';
import axios from 'axios';

import Sidebar from '../components/Sidebar';
import ProfileCard from '../components/ProfileCard';
import RatingCard from '../components/RatingCard';
import RatingGraph from '../components/RatingGraph';
import SubmissionTable from '../components/SubmissionTable';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);

  const [userData, setUserData] = useState(null);
  const [ratingHistory, setRatingHistory] = useState([]);
  const [submissionsData, setSubmissionsData] = useState([]);

  useEffect(() => {
    setUserData(null);
    setSubmissionsData([]);
    setRatingHistory([]);
    setHandleInput('');
  }, [platform]);

  const handleImport = async (e) => {
    e.preventDefault();

    if (!handleInput.trim()) return;

    const endpointMap = {
      codeforces: 'cf',
      leetcode: 'lc',
      codechef: 'cc',
    };
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);

      const userId =
        localStorage.getItem('userId');

      const response =
        await axios.get(
          `http://localhost:3000/dashboard/${userId}`
        );

      const data = response.data;

      setUserData(data.user);
      setSubmissionsData(data.submissions || []);
      setRatingHistory(data.ratings || []);
    } catch (error) {
      console.error(error);
      setUserData(null);
      setSubmissionsData([]);
      setRatingHistory([]);
      alert('User not found');
      console.log('Dashboard Data:', data);

      setUserData({
        ...(data.user || {}),
        ...(data.profile || {}),
      });

      setRatingHistory(
        data.ratingHistory || []
      );

      setSubmissionsData(
        data.submissions || []
      );

    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />

      <div className="flex-1 p-6 space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <ProfileCard
            user={userData}
            isLoading={isLoading}
          />

          <RatingCard
            user={userData}
            isLoading={isLoading}
          />

        </div>

        <RatingGraph
          history={ratingHistory}
          isLoading={isLoading}
        />

        <SubmissionTable
          submissions={submissionsData}
          isLoading={isLoading}
        />

            <button
              onClick={() => setPlatform('leetcode')}
              className={`px-4 py-2 rounded ${
                platform === 'leetcode' ? 'bg-cyan-600' : 'bg-gray-800'
              }`}
            >
              LeetCode
            </button>

            <button
              onClick={() => setPlatform('codechef')}
              className={`px-4 py-2 rounded ${
                platform === 'codechef' ? 'bg-cyan-600' : 'bg-gray-800'
              }`}
            >
              CodeChef
            </button>
          </div>
          
          {/* Top Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userData && (
              <ProfileCard
                user={userData}
                platform={platform}
                isLoading={isLoading}
              />
            )}

            {platform === 'leetcode' ? (
              <LeetcodeStatsCard user={userData} />
            ) : (
              userData && (
                <RatingCard user={userData} isLoading={isLoading} />
              )
            )}
          </div>

          {/* Rating History Graph Placeholder */}
          {platform !== 'leetcode' && (
            <RatingGraph history={ratingHistory} isLoading={isLoading} />
          )}

          {/* Recent Submissions Table */}
          <SubmissionTable
            submissions={submissionsData}
            isLoading={isLoading}
            platform={platform}
          />

        </main>
      </div>
    </div>
  );
}