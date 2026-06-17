import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ProgressCard from '../components/sheets/ProgressCard';
import StatsCards from '../components/sheets/StatsCards';
import SheetFilters from '../components/sheets/SheetFilters';
import TopicProgress from '../components/sheets/TopicProgress';
import ProblemTable from '../components/sheets/ProblemTable';
import RecentActivity from '../components/sheets/RecentActivity';
import { a2zProblems } from '../data/a2zMock';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function A2ZSheet() {
  // Initialize state from localStorage or mock data
  const [problems, setProblems] = useState(() => {
    try {
      const storedSolvedIds = localStorage.getItem('astra_a2z_solved_ids');
      if (storedSolvedIds) {
        const solvedIds = JSON.parse(storedSolvedIds);
        return a2zProblems.map(p => ({
          ...p,
          solved: solvedIds.includes(p.id)
        }));
      }
    } catch (err) {
      console.error("Failed to parse solved IDs from localStorage", err);
    }
    return a2zProblems;
  });

  const [recentActivities, setRecentActivities] = useState(() => {
    try {
      const storedRecent = localStorage.getItem('astra_a2z_recent');
      return storedRecent ? JSON.parse(storedRecent) : [];
    } catch (err) {
      return [];
    }
  });

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Sync solved progress to localStorage whenever problems state changes
  useEffect(() => {
    const solvedIds = problems.filter(p => p.solved).map(p => p.id);
    localStorage.setItem('astra_a2z_solved_ids', JSON.stringify(solvedIds));
  }, [problems]);

  // Extract all unique topics for filters
  const uniqueTopics = Array.from(new Set(a2zProblems.map(p => p.topic))).sort();

  // Statistics calculations
  const totalProblems = problems.length;
  const solvedCount = problems.filter(p => p.solved).length;
  const remainingCount = totalProblems - solvedCount;
  const completionRate = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

  // Toggle solved handler
  const toggleSolved = (id) => {
    setProblems(prevProblems =>
      prevProblems.map(p => {
        if (p.id === id) {
          const updatedSolved = !p.solved;

          // Update recent activity feed
          if (updatedSolved) {
            const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const newActivity = {
              id: p.id,
              title: p.title,
              timestamp: `Completed at ${timeString}`
            };
            const updatedRecent = [newActivity, ...recentActivities.filter(a => a.id !== id)].slice(0, 5);
            setRecentActivities(updatedRecent);
            localStorage.setItem('astra_a2z_recent', JSON.stringify(updatedRecent));
          } else {
            const updatedRecent = recentActivities.filter(a => a.id !== id);
            setRecentActivities(updatedRecent);
            localStorage.setItem('astra_a2z_recent', JSON.stringify(updatedRecent));
          }

          return { ...p, solved: updatedSolved };
        }
        return p;
      })
    );
  };

  // Filter logic
  const filteredProblems = problems.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = selectedTopic === "All" || p.topic === selectedTopic;
    const matchesDifficulty = selectedDifficulty === "All" || p.difficulty === selectedDifficulty;
    const matchesStatus =
      selectedStatus === "All" ||
      (selectedStatus === "Solved" && p.solved) ||
      (selectedStatus === "Unsolved" && !p.solved);

    return matchesSearch && matchesTopic && matchesDifficulty && matchesStatus;
  });

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col xl:flex-row overflow-y-auto">
        
        {/* Workspace Column (Left / Middle) */}
        <div className="flex-1 p-6 lg:p-8 space-y-6">
          
          {/* Header */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between border-b border-gray-900 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-2 font-mono text-xs tracking-wider">
                <Link to="/sheets" className="text-cyan-400 hover:underline flex items-center gap-1">
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

          {/* Progress & Stats Cards */}
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

          {/* Sticky Filters & Search */}
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

          {/* Problem Table */}
          <ProblemTable
            problems={filteredProblems}
            onToggleSolved={toggleSolved}
          />

        </div>

        {/* Sidebar Widgets Column (Right) */}
        <div className="w-full xl:w-80 border-t xl:border-t-0 xl:border-l border-gray-900 p-6 space-y-6 bg-gray-950/20 backdrop-blur-sm shrink-0">
          
          {/* Streak Card */}
          <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/40 to-orange-950/10 p-5 backdrop-blur-sm group">
            <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-orange-500/10 blur-xl group-hover:scale-110 transition-transform" />
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-orange-950/40 border border-orange-800/30 text-orange-400">
                <FaFire className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-semibold font-mono tracking-wider text-gray-500 uppercase">Current Streak</span>
                <p className="text-xl font-bold text-white mt-0.5">12 Days</p>
              </div>
            </div>
          </div>

          {/* Topic Progress Breakdown */}
          <TopicProgress
            problems={problems}
            selectedTopic={selectedTopic}
            setSelectedTopic={setSelectedTopic}
          />

          {/* Recent Activity Feed */}
          <RecentActivity activities={recentActivities} />

        </div>

      </div>
    </div>
  );
}
