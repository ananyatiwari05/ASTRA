import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import ProgressCard from '../components/sheets/ProgressCard';
import StatsCards from '../components/sheets/StatsCards';
import SheetFilters from '../components/sheets/SheetFilters';
import TopicProgress from '../components/sheets/TopicProgress';
import ProblemTable from '../components/sheets/ProblemTable';
import RecentActivity from '../components/sheets/RecentActivity';
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
    difficulty:
      DIFFICULTY_LABELS[problem.difficulty] ||
      String(problem.difficulty || 'Medium'),
    platform: problem.platform,
    solved: problem.solved || solvedKeys.has(key),
    url: problem.url,
    subTopic: problem.subTopic || 'General',
  };
}

export default function A2ZSheet() {
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
      const sheetProblems = await fetchSheetProblems('A2Z', userId);

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
      setError('Failed to load A2Z sheet');
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
                <span className="text-gray-500">A2Z</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                A2Z DSA Sheet
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Master DSA from Basics to Advanced structures step by step.
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded border border-red-800 bg-red-950/40 px-4 py-3 text-red-300">
              {error}
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

          <div className="space-y-4">
            {uniqueTopics
              .filter((topic) => selectedTopic === 'All' || topic === selectedTopic)
              .map((topic) => {
                const topicProblems = filteredProblems.filter(
                  (p) => p.topic === topic
                );
                
                if (topicProblems.length === 0) return null;

                const topicSolved = topicProblems.filter(p => p.solved).length;
                const topicTotal = topicProblems.length;

                const uniqueSubTopics = Array.from(new Set(topicProblems.map(p => p.subTopic)));

                return (
                  <details
                    key={topic}
                    open
                    className="group border border-gray-800 bg-gray-900/50 rounded-xl overflow-hidden"
                  >
                    <summary className="flex items-center justify-between p-4 bg-gray-950/80 cursor-pointer select-none hover:bg-gray-900/80 transition-colors">
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold text-white">{topic}</h2>
                        <span className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded-md font-mono">
                          {topicSolved} / {topicTotal}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="h-full bg-cyan-500 transition-all duration-500"
                            style={{ width: `${(topicSolved / topicTotal) * 100}%` }}
                          />
                        </div>
                        <span className="text-gray-500 group-open:rotate-180 transition-transform duration-200">
                          ▼
                        </span>
                      </div>
                    </summary>
                    <div className="p-1 border-t border-gray-800/50 space-y-2">
                      {uniqueSubTopics.map(subTopic => {
                        const subTopicProblems = topicProblems.filter(p => p.subTopic === subTopic);
                        return (
                          <div key={subTopic} className="bg-gray-900/40 rounded-lg p-2 mx-2 my-2 border border-gray-800/50">
                            <h3 className="text-sm font-semibold text-gray-300 mb-2 ml-2 uppercase tracking-wide">{subTopic}</h3>
                            <ProblemTable
                              problems={subTopicProblems}
                              onToggleSolved={toggleSolved}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </details>
                );
              })}
            {filteredProblems.length === 0 && (
              <div className="text-center py-10 text-gray-500 border border-gray-800 rounded-xl bg-gray-900/20">
                No problems match your filters.
              </div>
            )}
          </div>
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
