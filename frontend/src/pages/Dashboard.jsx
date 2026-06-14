import React, { useEffect, useState } from 'react';
import axios from 'axios';

import Sidebar from '../components/Sidebar';
import ProfileCard from '../components/ProfileCard';
import RatingCard from '../components/RatingCard';
import RatingGraph from '../components/RatingGraph';
import SubmissionTable from '../components/SubmissionTable';

export default function Dashboard() {
  const [platform, setPlatform] = useState('codeforces');

  const [isLoading, setIsLoading] = useState(true);

  const [userData, setUserData] = useState(null);

  const [ratingHistory, setRatingHistory] = useState([]);

  const [submissionsData, setSubmissionsData] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);

      const userId = localStorage.getItem('userId');

      if (!userId) {
        alert('Please login again.');
        return;
      }

      const response = await axios.get(
        `http://localhost:3000/dashboard/${userId}`
      );

      const data = response.data;
      console.log("DASHBOARD RESPONSE:", data);

      setUserData(data.user || {});

      setRatingHistory(data.ratings || []);

      setSubmissionsData(data.submissions || []);
    }

    catch (err) {
      console.error(err);

      alert('Failed to load dashboard');
    }

    finally {
      setIsLoading(false);
    }
  };

  const filteredRatings = ratingHistory.filter(
    item => item.platform === platform
  );

  const filteredSubmissions = submissionsData.filter(
    item => item.platform === platform
  );

  return (
    <div className="flex min-h-screen bg-black text-white">

      <Sidebar />

      <div className="flex-1 p-6 space-y-6">

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

      </div>

    </div>
  );
}