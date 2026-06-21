import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import SheetCard from '../components/sheets/SheetCard';
import { motion } from 'framer-motion';
import {
  fetchSheetProgress,
  fetchSheets,
  getUserId,
} from '../api/client';

const SHEET_PATHS = {
  A2Z: '/sheets/A2Z',
  TUF: '/sheets/TUF',
  TLE: '/sheets/TLE',
  CP: '/sheets/CP',
  '31': '/sheets/31',
};

const SHEET_TITLES = {
  A2Z: 'A2Z DSA Sheet',
  TUF: 'TUF Sheet',
  TLE: 'TLE Eliminator Sheet',
  CP: 'Striver CP Sheet',
  '31': 'Striver 31 Sheet',
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
        const progressData = await fetchSheetProgress(userId);
        const progressMap = {};

        for (const sheet of progressData) {
          progressMap[sheet.sheetName] = {
            total: sheet.totalProblems,
            solved: sheet.solvedProblems,
          };
        }

        setSheetProgress(progressMap);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load sheets');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />

      <div className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-gray-900 pb-6"
        >
          <div className="flex items-center gap-2 mb-2 font-mono text-xs text-cyan-400 tracking-wider">
            <span>MODULES</span>
            <span>/</span>
            <span className="text-gray-500">SHEETS</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white uppercase">
            Sheets
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Track your DSA preparation progress across curated problem sheets.
          </p>
        </motion.div>

        {error && (
          <div className="rounded border border-red-800 bg-red-950/40 px-4 py-3 text-red-300">
            {error}
          </div>
        )}

        {isLoading ? (
          <p className="text-gray-400">Loading sheets...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sheets.map((sheet) => {
              const progress = sheetProgress[sheet.name] || {};
              const path = SHEET_PATHS[sheet.name];
              const title =
                SHEET_TITLES[sheet.name] || `${sheet.name} Sheet`;

              return (
                <SheetCard
                  key={sheet.name}
                  title={title}
                  totalProblems={
                    progress.total || sheet.totalProblems || 0
                  }
                  solvedCount={progress.solved || 0}
                  path={path}
                  comingSoon={false}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
