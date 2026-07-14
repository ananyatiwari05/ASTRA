import React, { useEffect, useState } from 'react';
import SiteNavbar from '../components/SiteNavbar';
import Footer from '../components/Footer';
import SheetCard from '../components/sheets/SheetCard';
import { motion } from 'framer-motion';
import {
  fetchUserSheetProgressSummary,
  fetchSheets,
  getUserId,
} from '../api/client';

const SHEET_PATHS = {
  A2Z: '/sheets/A2Z',
  TUF: '/sheets/TUF',
  TLE: '/sheets/TLE',
  CP: '/sheets/CP',
  '31': '/sheets/31',
  TLE31: '/sheets/tle31',
};

const SHEET_TITLES = {
  A2Z: 'A2Z DSA Sheet',
  TUF: 'TUF Sheet',
  TLE: 'TLE Eliminator Sheet',
  CP: 'Striver CP Sheet',
  '31': 'Striver 31 Sheet',
  TLE31: 'TLE Eliminators 31 Sheet',
};

export default function Sheets() {
  const [sheets, setSheets] = useState([]);
  const [sheetProgress, setSheetProgress] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSheets();
  }, []);

  const loadSheets = async () => {
    try {
      setIsLoading(true);
      setError('');

      const sheetList = await fetchSheets();
      setSheets(sheetList);

      const userId = getUserId();

      if (userId) {
        const progressData = await fetchUserSheetProgressSummary(userId);
        setSheetProgress(progressData);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load sheets');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0f1c] text-slate-300 font-sans relative overflow-hidden">
      <SiteNavbar />

      {/* Background Orbs */}
      <motion.div
        animate={{ x: [0, 100, -50, 0], y: [0, -50, 50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="fixed top-0 left-0 w-[600px] h-[600px] bg-indigo-700/10 rounded-full blur-[150px] pointer-events-none z-0"
      />
      <motion.div
        animate={{ x: [0, -100, 50, 0], y: [0, 50, -50, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="fixed bottom-0 right-0 w-[700px] h-[700px] bg-purple-700/10 rounded-full blur-[150px] pointer-events-none z-0"
      />

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex-grow max-w-7xl mx-auto w-full p-6 lg:p-8 space-y-8 pt-32 lg:pt-40 relative z-10"
      >
        <motion.div
          variants={itemVariants}
          className="border-b border-slate-800/80 pb-6 mb-8"
        >
          <div className="flex items-center gap-2 mb-2 font-mono text-xs text-indigo-400 tracking-wider">
            <span className="bg-indigo-950/50 border border-indigo-500/30 px-2 py-0.5 rounded-full">MODULES</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">SHEETS</span>
          </div>
          <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white uppercase mt-3">
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
               Sheets
             </span>
          </h1>
          <p className="text-sm text-slate-400 mt-3 max-w-xl leading-relaxed">
            Track your DSA preparation progress across curated problem sheets.
          </p>
        </motion.div>

        {error && (
          <motion.div variants={itemVariants} className="rounded border border-red-800 bg-red-950/40 px-4 py-3 text-red-300">
            {error}
          </motion.div>
        )}

        {isLoading ? (
          <motion.div variants={itemVariants} className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 text-slate-400">
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></span>
              Loading sheets...
            </div>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sheets.map((sheet) => {
                const progress = sheetProgress[sheet.name] || {};
                const path = SHEET_PATHS[sheet.name];
                const title =
                  SHEET_TITLES[sheet.name] || `${sheet.name} Sheet`;

                return (
                  <motion.div key={sheet.name} variants={itemVariants}>
                    <SheetCard
                      title={title}
                      totalProblems={
                        progress.total || sheet.totalProblems || 0
                      }
                      solvedCount={progress.solved || 0}
                      path={path}
                      comingSoon={false}
                    />
                  </motion.div>
                );
              })}
            </div>

            <div className="relative">
              <div className="border-b border-slate-800/80 pb-4 mb-6">
                 <h2 className="text-xl font-bold text-slate-200">Coming Soon</h2>
                 <p className="text-sm text-slate-400 mt-1">Highly requested DSA sheets that are currently in the works.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <motion.div variants={itemVariants}>
                  <SheetCard
                    title="NeetCode 150"
                    comingSoon={true}
                  />
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <SheetCard
                    title="Blind 75"
                    comingSoon={true}
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.main>

      <Footer />
    </div>
  );
}
