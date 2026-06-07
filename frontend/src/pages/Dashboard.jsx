import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ProfileCard from '../components/ProfileCard';
import RatingCard from '../components/RatingCard';
import RatingGraph from '../components/RatingGraph';
import SubmissionTable from '../components/SubmissionTable';
import LeetcodeStatsCard from '../components/LeetcodeStatsCard';

export default function Dashboard() {
  const [handleInput, setHandleInput] = useState('tourist');
  const [platform, setPlatform] = useState('codeforces');
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [submissionsData, setSubmissionsData] = useState([]);
  const [ratingHistory, setRatingHistory] = useState([]);

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

    try {
      setIsLoading(true);

      const response = await axios.get(
        `http://localhost:3000/${endpointMap[platform]}/${handleInput.trim()}`
      );

      console.log(response.data);

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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white font-sans">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Right Content Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar
          platform={platform}
          handleInput={handleInput}
          onHandleInputChange={setHandleInput}
          onImportSubmit={handleImport}
          isLoading={isLoading}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto bg-gray-950/20">
          <div className="flex gap-3">
            <button
              onClick={() => setPlatform('codeforces')}
              className={`px-4 py-2 rounded ${
                platform === 'codeforces' ? 'bg-cyan-600' : 'bg-gray-800'
              }`}
            >
              Codeforces
            </button>

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
