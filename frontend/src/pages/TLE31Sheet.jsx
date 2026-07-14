import React, { useState, useEffect, useMemo } from 'react';
import SiteNavbar from '../components/SiteNavbar';
import Footer from '../components/Footer';
import SheetFilters from '../components/sheets/SheetFilters';
import ProblemTable from '../components/sheets/ProblemTable';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import {
  fetchSheetProblems,
  fetchDashboard,
  fetchProgressTrend,
  fetchUserSubmissions,
  getUserId,
  toggleManualCheck,
} from '../api/client';

const DIFFICULTY_LABELS = {
  1: 'Easy',
  2: 'Medium',
  3: 'Hard',
};

function mapProblem(problem, solvedKeys) {
  const key = `${problem.platform}:${problem.problemId}`;

  return {
    id: problem.id,
    title: problem.title,
    topic: problem.topic || problem.tags?.[0] || 'General',
    ratingBucket: problem.ratingBucket || problem.topic || 'Unrated',
    difficulty:
      DIFFICULTY_LABELS[problem.difficulty] ||
      (problem.difficulty ? problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1).toLowerCase() : 'Medium'),
    platform: problem.platform,
    solved: problem.solved || solvedKeys.has(key),
    url: problem.sourceUrl || problem.url,
  };
}

export default function TLE31Sheet() {
  const [problems, setProblems] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  useEffect(() => {
    loadSheetData();
  }, []);

  const loadSheetData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const userId = getUserId();
      const sheetProblems = await fetchSheetProblems('TLE31', userId);

      let solvedKeys = new Set();

      if (userId) {
        const dashboard = await fetchDashboard(userId);
        const submissions =
          dashboard.submissions ||
          dashboard.recentSubmissions ||
          [];

        solvedKeys = new Set(
          submissions
            .filter(
              (item) =>
                item.verdict === 'OK' ||
                item.verdict === 'Accepted',
            )
            .map(
              (item) =>
                `${item.platform}:${item.problemId || item.problemName}`,
            ),
        );

        const dbSubmissions = await fetchUserSubmissions(userId);

        for (const submission of dbSubmissions) {
          if (
            submission.verdict === 'OK' ||
            submission.verdict === 'Accepted'
          ) {
            solvedKeys.add(
              `${submission.platform}:${submission.problemId}`,
            );
          }
        }

        const trend = await fetchProgressTrend(userId, 30);
        setCurrentStreak(trend.currentStreak || 0);

        setRecentActivities(
          submissions.slice(0, 5).map((item, index) => ({
            id: index,
            title: item.problemName,
            timestamp: item.time || 'Recent',
          })),
        );
      }

      setProblems(
        sheetProblems.map((problem) =>
          mapProblem(problem, solvedKeys),
        ),
      );
    } catch (err) {
      console.error(err);
      setError('Failed to load TLE31 sheet');
    } finally {
      setIsLoading(false);
    }
  };

  const uniqueTopics = useMemo(
    () =>
      Array.from(new Set(problems.map((p) => p.topic))).sort(),
    [problems],
  );

  const uniqueRatingBuckets = useMemo(
    () =>
      Array.from(new Set(problems.map((p) => p.ratingBucket || p.topic))).sort((a, b) => Number(a) - Number(b)),
    [problems],
  );

  const totalProblems = problems.length;
  const solvedCount = problems.filter((p) => p.solved).length;
  const remainingCount = totalProblems - solvedCount;
  const completionRate =
    totalProblems > 0
      ? Math.round((solvedCount / totalProblems) * 100)
      : 0;

  const easyTotal = problems.filter(p => p.difficulty === 'Easy').length;
  const easySolved = problems.filter(p => p.difficulty === 'Easy' && p.solved).length;
  const mediumTotal = problems.filter(p => p.difficulty === 'Medium').length;
  const mediumSolved = problems.filter(p => p.difficulty === 'Medium' && p.solved).length;
  const hardTotal = problems.filter(p => p.difficulty === 'Hard').length;
  const hardSolved = problems.filter(p => p.difficulty === 'Hard' && p.solved).length;

  const toggleSolved = async (id) => {
    const problem = problems.find(p => p.id === id);
    if (!problem) return;
    const newStatus = !problem.solved;

    setProblems((prevProblems) =>
      prevProblems.map((p) =>
        p.id === id
          ? { ...p, solved: newStatus }
          : p,
      ),
    );

    try {
      await toggleManualCheck(getUserId(), id, newStatus);
    } catch (err) {
      console.error(err);
      setProblems((prevProblems) =>
        prevProblems.map((p) =>
          p.id === id ? { ...p, solved: !newStatus } : p,
        ),
      );
      alert('Failed to update progress manually.');
    }
  };

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch = problem.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesTopic =
      selectedTopic === 'All' || problem.topic === selectedTopic;
    const matchesDifficulty =
      selectedDifficulty === 'All' ||
      problem.difficulty === selectedDifficulty;
    const matchesStatus =
      selectedStatus === 'All' ||
      (selectedStatus === 'Solved' && problem.solved) ||
      (selectedStatus === 'Unsolved' && !problem.solved);

    return (
      matchesSearch &&
      matchesTopic &&
      matchesDifficulty &&
      matchesStatus
    );
  });

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0a0f1c] text-white relative overflow-hidden">
        <SiteNavbar />
        {/* Background Orbs */}
        <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-indigo-700/10 rounded-full blur-[150px] pointer-events-none z-0" />
        <div className="fixed bottom-0 right-0 w-[700px] h-[700px] bg-purple-700/10 rounded-full blur-[150px] pointer-events-none z-0" />
        <div className="flex-1 flex-grow p-8 text-slate-400 pt-32 lg:pt-40 max-w-7xl mx-auto w-full relative z-10">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 text-slate-400">
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></span>
              Loading sheet...
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0f1c] text-slate-300 font-sans relative overflow-hidden">
      <SiteNavbar />
      
      {/* Background Orbs */}
      <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-indigo-700/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-0 w-[700px] h-[700px] bg-purple-700/10 rounded-full blur-[150px] pointer-events-none z-0" />

      <main className="flex-1 flex-grow max-w-7xl mx-auto w-full px-6 lg:px-8 space-y-6 pt-24 pb-12 relative z-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between border-b border-slate-800/80 pb-6 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono text-xs text-indigo-400 tracking-wider">
              <Link to="/sheets" className="bg-indigo-950/50 border border-indigo-500/30 px-2 py-0.5 rounded-full hover:bg-indigo-900/50 transition-colors">
                SHEETS
              </Link>
              <span className="text-slate-600">/</span>
              <span className="text-slate-400">TLE31</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white mt-3">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
                TLE Eliminators Sheet
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Master DSA from Basics to Advanced structures step by step.
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded border border-red-800 bg-red-950/40 px-4 py-3 text-red-300">
            {error}
          </div>
        )}

        {/* Overall Progress Horizontal Card */}
        <div className="w-full bg-[#0d1326]/60 border border-indigo-500/20 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between shadow-lg backdrop-blur-sm gap-4">
          <div className="flex items-center gap-5">
            {/* Circular Progress */}
            <div className="relative w-[60px] h-[60px] flex items-center justify-center rounded-full bg-slate-900 border border-slate-800 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
               <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                 <circle cx="30" cy="30" r="26" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-slate-800" />
                 <circle cx="30" cy="30" r="26" stroke="currentColor" strokeWidth="3" fill="transparent" strokeDasharray="163.36" strokeDashoffset={163.36 - (163.36 * completionRate) / 100} className="text-indigo-500 transition-all duration-1000" strokeLinecap="round" />
               </svg>
               <span className="text-xs font-bold text-white relative z-10">{completionRate}%</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Overall Progress</h3>
              <p className="text-xs text-slate-400 mt-1"><span className="text-white font-bold text-sm">{solvedCount}</span> / {totalProblems}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-xs font-medium bg-slate-900/50 py-2 px-4 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              <span className="text-slate-300">Easy</span>
              <span className="text-white font-bold">{easySolved}<span className="text-slate-500 font-normal">/{easyTotal}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]"></span>
              <span className="text-slate-300">Medium</span>
              <span className="text-white font-bold">{mediumSolved}<span className="text-slate-500 font-normal">/{mediumTotal}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
              <span className="text-slate-300">Hard</span>
              <span className="text-white font-bold">{hardSolved}<span className="text-slate-500 font-normal">/{hardTotal}</span></span>
            </div>
          </div>
        </div>

          <SheetFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedDifficulty={selectedDifficulty}
            setSelectedDifficulty={setSelectedDifficulty}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            topics={[]}
          />

          <div className="space-y-4">
            {uniqueRatingBuckets.map((bucket) => {
              const bucketProblems = filteredProblems.filter(
                (p) => p.ratingBucket === bucket
              );
              
              if (bucketProblems.length === 0) return null;

              const bucketSolved = bucketProblems.filter(p => p.solved).length;
              const bucketTotal = bucketProblems.length;

              return (
                <details
                  key={bucket}
                  className="group border border-transparent bg-transparent rounded-lg overflow-hidden"
                >
                  <summary className="flex items-center justify-between p-4 bg-[#0d1326] cursor-pointer select-none hover:bg-slate-900/80 transition-colors border border-slate-800/60 rounded-lg group-open:rounded-b-none group-open:border-b-transparent">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 group-open:rotate-90 transition-transform duration-200 text-xs">
                        ▶
                      </span>
                      <h2 className="text-[15px] font-medium text-slate-200">{bucket} Rating</h2>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-1 bg-slate-800 rounded-full overflow-hidden hidden sm:block shadow-inner">
                        <div
                          className="h-full bg-indigo-500 transition-all duration-500"
                          style={{ width: `${(bucketSolved / bucketTotal) * 100}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        {bucketSolved} / {bucketTotal}
                      </span>
                    </div>
                  </summary>
                  <div className="p-2 space-y-2 border border-t-0 border-slate-800/60 bg-slate-900/20 rounded-b-lg backdrop-blur-sm">
                    <div className="bg-slate-900/40 rounded-lg p-3 mx-1 my-1 border border-slate-800/60 shadow-sm">
                      <ProblemTable
                        problems={bucketProblems}
                        onToggleSolved={toggleSolved}
                      />
                    </div>
                  </div>
                </details>
              );
            })}
            {filteredProblems.length === 0 && (
              <div className="text-center py-10 text-slate-500 border border-slate-800 rounded-xl bg-slate-900/20">
                No problems match your filters.
              </div>
            )}
          </div>
      </main>

      <Footer />
    </div>
  );
}
