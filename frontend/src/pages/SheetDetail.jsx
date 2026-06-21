import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';

import Sidebar from '../components/Sidebar';
import ProgressCard from '../components/sheets/ProgressCard';
import StatsCards from '../components/sheets/StatsCards';
import SheetFilters from '../components/sheets/SheetFilters';
import TopicProgress from '../components/sheets/TopicProgress';
import ProblemTable from '../components/sheets/ProblemTable';
import RecentActivity from '../components/sheets/RecentActivity';
import {
  fetchProgressTrend,
  fetchSheetProblems,
  fetchSheetProgress,
  fetchUserSubmissions,
  getUserId,
} from '../api/client';

const SHEET_META = {
  A2Z: {
    title: 'A2Z DSA Sheet',
    description:
      'Master DSA from basics to advanced structures step by step.',
  },
  TUF: {
    title: 'TUF Sheet',
    description: 'Take U Forward curated DSA problem set.',
  },
  TLE: {
    title: 'TLE Eliminator Sheet',
    description: 'Daily TLE Eliminator progress synced from Google Sheets.',
  },
  CP: {
    title: 'Striver CP Sheet',
    description: 'Competitive programming problems for contest prep.',
  },
  '31': {
    title: 'Striver 31 Sheet',
    description: 'Blind 75 / 31 essential interview problems.',
  },
};

const DIFFICULTY_LABELS = {
  0: 'Unknown',
  1: 'Easy',
  2: 'Medium',
  3: 'Hard',
};

function mapProblem(problem) {
  return {
    id: `${problem.platform}-${problem.problemId}`,
    title: problem.title,
    topic: problem.tags?.[0] || 'General',
    tags: problem.tags || [],
    difficulty:
      DIFFICULTY_LABELS[problem.difficulty] ||
      String(problem.difficulty || 'Medium'),
    platform: problem.platform,
    solved: Boolean(problem.solved),
    url: problem.url,
    verdict: problem.verdict,
    lastSolvedAt: problem.lastSolvedAt,
    source: problem.source || null,
  };
}

export default function SheetDetail() {
  const { sheetName = 'A2Z' } = useParams();
  const normalizedSheetName = sheetName.toUpperCase();
  const meta = SHEET_META[normalizedSheetName] || {
    title: `${normalizedSheetName} Sheet`,
    description: 'Curated problem sheet progress.',
  };

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
  }, [normalizedSheetName]);

  const loadSheetData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const userId = getUserId();
      let sheetProblems = [];

      if (userId) {
        const progressData = await fetchSheetProgress(userId);
        const sheetProgress = progressData.find(
          (sheet) =>
            sheet.sheetName.toUpperCase() === normalizedSheetName,
        );

        sheetProblems = sheetProgress?.problems || [];

        const trend = await fetchProgressTrend(userId, 30);
        setCurrentStreak(trend.currentStreak || 0);

        const submissions = await fetchUserSubmissions(userId);
        setRecentActivities(
          submissions.slice(0, 5).map((item, index) => ({
            id: index,
            title: item.problemName,
            timestamp: item.submittedAt
              ? new Date(item.submittedAt).toLocaleString()
              : 'Recent',
          })),
        );
      }

      if (!sheetProblems.length) {
        const catalogProblems = await fetchSheetProblems(
          normalizedSheetName,
        );

        sheetProblems = catalogProblems.map((problem) => ({
          ...problem,
          solved: false,
          verdict: null,
          lastSolvedAt: null,
        }));
      }

      setProblems(sheetProblems.map(mapProblem));
    } catch (err) {
      console.error(err);
      setError('Failed to load sheet data');
    } finally {
      setIsLoading(false);
    }
  };

  const uniqueTopics = useMemo(
    () =>
      Array.from(new Set(problems.map((p) => p.topic))).sort(),
    [problems],
  );

  const totalProblems = problems.length;
  const solvedCount = problems.filter((p) => p.solved).length;
  const remainingCount = totalProblems - solvedCount;
  const completionRate =
    totalProblems > 0
      ? Math.round((solvedCount / totalProblems) * 100)
      : 0;

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch =
      problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );
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
      <div className="flex min-h-screen bg-black text-white">
        <Sidebar />
        <div className="flex-1 p-8 text-gray-400">Loading sheet...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col xl:flex-row overflow-y-auto">
        <div className="flex-1 p-6 lg:p-8 space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between border-b border-gray-900 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-2 font-mono text-xs tracking-wider">
                <Link
                  to="/sheets"
                  className="text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <FiArrowLeft /> SHEETS
                </Link>
                <span className="text-gray-500">/</span>
                <span className="text-gray-500">{normalizedSheetName}</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                {meta.title}
              </h1>
              <p className="text-sm text-gray-400 mt-1">{meta.description}</p>
            </div>

            <button
              onClick={loadSheetData}
              className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 text-sm"
            >
              Refresh
            </button>
          </div>

          {error && (
            <div className="rounded border border-red-800 bg-red-950/40 px-4 py-3 text-red-300 flex items-center justify-between gap-4">
              <span>{error}</span>
              <button
                onClick={loadSheetData}
                className="text-sm underline hover:text-red-200"
              >
                Retry
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <ProgressCard solved={solvedCount} total={totalProblems} />
            </div>
            <div className="md:col-span-2">
              <StatsCards
                solved={solvedCount}
                remaining={remainingCount}
                topicsCount={uniqueTopics.length}
                completionRate={completionRate}
              />
            </div>
          </div>

          <SheetFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedTopic={selectedTopic}
            setSelectedTopic={setSelectedTopic}
            selectedDifficulty={selectedDifficulty}
            setSelectedDifficulty={setSelectedDifficulty}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            topics={uniqueTopics}
          />

          <ProblemTable problems={filteredProblems} readOnly />
        </div>

        <div className="w-full xl:w-80 border-t xl:border-t-0 xl:border-l border-gray-900 p-6 space-y-6 bg-gray-950/20 backdrop-blur-sm shrink-0">
          <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/40 to-orange-950/10 p-5 backdrop-blur-sm group">
            <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-orange-500/10 blur-xl group-hover:scale-110 transition-transform" />
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-orange-950/40 border border-orange-800/30 text-orange-400">
                <FaFire className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-semibold font-mono tracking-wider text-gray-500 uppercase">
                  Current Streak
                </span>
                <p className="text-xl font-bold text-white mt-0.5">
                  {currentStreak} Days
                </p>
              </div>
            </div>
          </div>

          <TopicProgress
            problems={problems}
            selectedTopic={selectedTopic}
            setSelectedTopic={setSelectedTopic}
          />

          <RecentActivity activities={recentActivities} />
        </div>
      </div>
    </div>
  );
}
