import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import SiteNavbar from '../components/SiteNavbar';
import Footer from '../components/Footer';
import ProfileCard from '../components/ProfileCard';
import RatingCard from '../components/RatingCard';
import RatingGraph from '../components/RatingGraph';
import SubmissionTable from '../components/SubmissionTable';
import {
  fetchDashboard,
  getUserId,
  syncCodeforces,
} from '../api/client';
import { FaSyncAlt, FaChartPie, FaLightbulb, FaBook } from 'react-icons/fa';
import { SiCodeforces, SiLeetcode, SiCodechef } from 'react-icons/si';

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
  const [revisionRecommendations, setRevisionRecommendations] = useState([]);
  const [sheetProgressSummary, setSheetProgressSummary] = useState(null);

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
      setSheetProgressSummary(data.sheetProgressSummary || null);
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

  const platforms = [
    { id: 'codeforces', name: 'Codeforces', icon: SiCodeforces },
    { id: 'leetcode', name: 'LeetCode', icon: SiLeetcode },
    { id: 'codechef', name: 'CodeChef', icon: SiCodechef }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0f1c] text-white selection:bg-indigo-500/30 overflow-hidden relative">
      <SiteNavbar />

      {/* Moving Background Orbs */}
      <motion.div animate={{ x: [0, 100, -50, 0], y: [0, -50, 50, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="fixed top-0 left-0 w-[600px] h-[600px] bg-indigo-700/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <motion.div animate={{ x: [0, -100, 50, 0], y: [0, 50, -50, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="fixed bottom-0 right-0 w-[700px] h-[700px] bg-purple-700/10 rounded-full blur-[150px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto pt-24 pb-12 px-6 lg:px-12 relative z-10 w-full flex-1 space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono text-xs text-indigo-400 tracking-wider">
              <span className="bg-indigo-950/50 border border-indigo-500/30 px-2 py-0.5 rounded-full">MODULES</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-400">DASHBOARD</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight mt-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
                Command Center
              </span>
            </h1>
          </div>
          
          <div className="flex gap-3 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800">
            {platforms.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all relative ${
                  platform === p.id
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {platform === p.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-indigo-600/20 border border-indigo-500/50 shadow-[0_0_15px_rgba(79,70,229,0.2)] rounded-lg"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <p.icon className={platform === p.id ? 'text-indigo-400' : ''} />
                  {p.name}
                </span>
              </button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-all font-medium text-sm shadow-[0_0_15px_rgba(79,70,229,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaSyncAlt className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? 'Syncing...' : 'Sync Codeforces'}
          </motion.button>
        </motion.div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          key={platform}
          variants={containerVariants} 
          initial="hidden" 
          animate="visible"
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={itemVariants} className="h-full">
              <ProfileCard
                user={userData}
                platform={platform}
                isLoading={isLoading}
              />
            </motion.div>

            <motion.div variants={itemVariants} className="h-full">
              <RatingCard
                user={userData}
                platform={platform}
                isLoading={isLoading}
              />
            </motion.div>
          </div>

          {platform === 'codeforces' && (
            <>
              <motion.div variants={itemVariants}>
                <RatingGraph
                  history={filteredRatings}
                  isLoading={isLoading}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <SubmissionTable
                  submissions={filteredSubmissions}
                  isLoading={isLoading}
                />
              </motion.div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <motion.div variants={itemVariants} className="border border-slate-800/80 rounded-xl bg-slate-900/40 p-6 shadow-lg backdrop-blur-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/5 transition-colors duration-300 pointer-events-none" />
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
                      <FaChartPie />
                    </div>
                    <h3 className="text-lg font-bold text-white">Weak Topics</h3>
                  </div>
                  
                  {isLoading ? (
                    <p className="text-slate-500 text-sm">Loading analysis...</p>
                  ) : weaknesses.length === 0 ? (
                    <p className="text-slate-500 text-sm">
                      No weakness data yet. Sync submissions first.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {weaknesses.slice(0, 5).map((item) => (
                        <div
                          key={item.topic}
                          className="flex justify-between items-center text-sm border-b border-slate-800/50 pb-2"
                        >
                          <span className="font-medium text-slate-300">{item.topic}</span>
                          <span className="text-slate-400 text-xs bg-slate-800 px-2 py-1 rounded">
                            <span className="text-red-400 font-semibold">{item.successRate}%</span> · {item.unsolvedCount} unsolved
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>

                <motion.div variants={itemVariants} className="border border-slate-800/80 rounded-xl bg-slate-900/40 p-6 shadow-lg backdrop-blur-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-fuchsia-500/0 group-hover:bg-fuchsia-500/5 transition-colors duration-300 pointer-events-none" />
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-400">
                      <FaLightbulb />
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      Revision Recommendations
                    </h3>
                  </div>
                  
                  {isLoading ? (
                    <p className="text-slate-500 text-sm">Loading recommendations...</p>
                  ) : revisionRecommendations.length === 0 ? (
                    <p className="text-slate-500 text-sm">
                      No revision recommendations yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {revisionRecommendations.slice(0, 5).map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center text-sm border-b border-slate-800/50 pb-2"
                        >
                          <span className="font-medium text-indigo-300 truncate max-w-[70%]">{item.title}</span>
                          <span className="text-slate-400 text-xs bg-slate-800 px-2 py-1 rounded whitespace-nowrap">
                            {item.daysSinceLastAttempt}d ago
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            </>
          )}

          {sheetProgressSummary && (
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="border border-slate-800/80 rounded-xl bg-slate-900/40 p-6 shadow-lg backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-colors duration-300 pointer-events-none" />
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <FaBook />
                    </div>
                    <h3 className="text-lg font-bold">A2Z Sheet</h3>
                  </div>
                  <span className="text-indigo-400 font-semibold bg-indigo-950/30 px-2 py-1 rounded text-sm">{sheetProgressSummary.a2z.progress}%</span>
                </div>
                <div className="w-full bg-slate-800/80 rounded-full h-1.5 mb-3 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${sheetProgressSummary.a2z.progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="bg-indigo-500 h-full rounded-full" 
                  />
                </div>
                <p className="text-slate-400 text-xs font-medium tracking-wide uppercase">{sheetProgressSummary.a2z.solved} / {sheetProgressSummary.a2z.total} Solved</p>
              </div>

              <div className="border border-slate-800/80 rounded-xl bg-slate-900/40 p-6 shadow-lg backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/5 transition-colors duration-300 pointer-events-none" />
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                      <FaBook />
                    </div>
                    <h3 className="text-lg font-bold">TLE31 Sheet</h3>
                  </div>
                  <span className="text-purple-400 font-semibold bg-purple-950/30 px-2 py-1 rounded text-sm">{sheetProgressSummary.tle31.progress}%</span>
                </div>
                <div className="w-full bg-slate-800/80 rounded-full h-1.5 mb-3 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${sheetProgressSummary.tle31.progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="bg-purple-500 h-full rounded-full" 
                  />
                </div>
                <p className="text-slate-400 text-xs font-medium tracking-wide uppercase">{sheetProgressSummary.tle31.solved} / {sheetProgressSummary.tle31.total} Solved</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
