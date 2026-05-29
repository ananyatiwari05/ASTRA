import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ProfileCard from '../components/ProfileCard';
import RatingCard from '../components/RatingCard';
import RatingGraph from '../components/RatingGraph';
import SubmissionTable from '../components/SubmissionTable';

const DUMMY_USER = {
  handle: 'tourist',
  rating: 3850,
  maxRating: 3850,
};

const DUMMY_SUBMISSIONS = [
  { problem: 'Two Sum', verdict: 'OK' },
  { problem: 'Add Two Numbers', verdict: 'WRONG ANSWER' },
  { problem: 'Longest Substring Without Repeating Characters', verdict: 'OK' },
];

const DUMMY_HISTORY = [
  { contestId: 1, rating: 1500, time: 1717000000 },
  { contestId: 2, rating: 1750, time: 1718000000 },
  { contestId: 3, rating: 2100, time: 1719000000 },
  { contestId: 4, rating: 2600, time: 1720000000 },
  { contestId: 5, rating: 3850, time: 1721000000 },
];

export default function Dashboard() {
  const [handleInput, setHandleInput] = useState('tourist');
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(DUMMY_USER);
  const [submissionsData, setSubmissionsData] = useState(DUMMY_SUBMISSIONS);
  const [ratingHistory, setRatingHistory] = useState(DUMMY_HISTORY);

  const handleImport = (e) => {
    e.preventDefault();
    if (!handleInput.trim()) return;

    setIsLoading(true);

    // Simulate API fetch delay
    setTimeout(() => {
      setUserData({
        handle: handleInput.trim(),
        rating: handleInput.trim().toLowerCase() === 'tourist' ? 3850 : 1620,
        maxRating: handleInput.trim().toLowerCase() === 'tourist' ? 3850 : 1800,
      });
      setSubmissionsData(DUMMY_SUBMISSIONS);
      setRatingHistory(DUMMY_HISTORY);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="flex min-h-screen bg-black text-white font-sans">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Right Content Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar
          handleInput={handleInput}
          onHandleInputChange={setHandleInput}
          onImportSubmit={handleImport}
          isLoading={isLoading}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto bg-gray-950/20">
          
          {/* Top Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileCard user={userData} isLoading={isLoading} />
            <RatingCard user={userData} isLoading={isLoading} />
          </div>

          {/* Rating History Graph Placeholder */}
          <RatingGraph history={ratingHistory} isLoading={isLoading} />

          {/* Recent Submissions Table */}
          <SubmissionTable submissions={submissionsData} isLoading={isLoading} />

        </main>
      </div>
    </div>
  );
}
