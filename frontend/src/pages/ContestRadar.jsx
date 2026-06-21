import React, { useEffect, useMemo, useState } from 'react';
import { fetchUpcomingContests } from '../api/client';

import Sidebar from '../components/Sidebar';
import ContestStats from '../components/contests/ContestStats';
import ContestFilters from '../components/contests/ContestFilters';
import ContestCard from '../components/contests/ContestCard';
import ContestCalendar from '../components/contests/ContestCalendar';

export default function ContestRadar() {
  const [contests, setContests] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const data = await fetchUpcomingContests();
        setContests(data);
      } catch (err) {
        console.error('Failed to fetch contests', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, []);

  const filteredContests = useMemo(() => {
    if (selectedPlatform === 'All') {
      return contests;
    }

    return contests.filter(
      (contest) => contest.platform === selectedPlatform
    );
  }, [contests, selectedPlatform]);

  const displayedContests = showAll
    ? filteredContests
    : filteredContests.slice(0, 3);

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />

      <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="border-b border-gray-900 pb-6 mb-8">
          <div className="flex items-center gap-2 mb-2 font-mono text-xs text-cyan-400 tracking-wider">
            <span>MODULES</span>
            <span>/</span>
            <span className="text-gray-500">CONTEST RADAR</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-black tracking-tight uppercase">
            Contest Radar
          </h1>

          <p className="text-sm text-gray-400 mt-2">
            Track upcoming coding contests across competitive programming platforms.
          </p>
        </div>

        <ContestStats contests={contests} />

        <ContestFilters
          selectedPlatform={selectedPlatform}
          setSelectedPlatform={setSelectedPlatform}
        />

        <div className="space-y-4">
          {loading ? (
            <div className="bg-[#111] border border-gray-800 rounded-xl p-6 text-gray-400">
              Loading contests...
            </div>
          ) : filteredContests.length > 0 ? (
            displayedContests.map((contest) => (
              <ContestCard
                key={contest.id}
                contest={contest}
              />
            ))
          ) : (
            <div className="bg-[#111] border border-gray-800 rounded-xl p-6 text-gray-400">
              No contests found.
            </div>
          )}
        </div>

        {filteredContests.length > 3 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-5 py-2 rounded-lg border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 transition"
            >
              {showAll ? 'Show Less' : `Show More (${filteredContests.length - 3} more)`}
            </button>
          </div>
        )}

        <ContestCalendar contests={filteredContests} />
      </div>
    </div>
  );
}
