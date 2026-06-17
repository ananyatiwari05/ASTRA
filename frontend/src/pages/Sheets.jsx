import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import SheetCard from '../components/sheets/SheetCard';
import { a2zProblems } from '../data/a2zMock';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function Sheets() {
  const [a2zSolvedCount, setA2zSolvedCount] = useState(0);
  const [totalA2zProblems, setTotalA2zProblems] = useState(a2zProblems.length);

  useEffect(() => {
    const loadProgress = async () => {
      // 1. Try to fetch real progress from backend if logged in
      const userId = localStorage.getItem('userId');
      if (userId) {
        try {
          const res = await axios.get(`http://localhost:3000/dashboard/${userId}`);
          const lcData = res.data.user?.leetcode;
          if (lcData) {
            const solved = (lcData.easySolved || 0) + (lcData.mediumSolved || 0) + (lcData.hardSolved || 0);
            setA2zSolvedCount(solved);
            setTotalA2zProblems(455); // Real A2Z has 455 problems
            return;
          }
        } catch (err) {
          console.warn("Could not fetch real LeetCode stats on sheets landing", err);
        }
      }

      // 2. Fallback to localStorage progress
      try {
        const storedSolvedIds = localStorage.getItem('astra_a2z_solved_ids');
        if (storedSolvedIds) {
          const solvedIds = JSON.parse(storedSolvedIds);
          // Count how many of our mock problems are solved
          const solvedCount = a2zProblems.filter(p => solvedIds.includes(p.id)).length;
          setA2zSolvedCount(solvedCount);
        } else {
          // Fallback to default solved state in mock data
          const solvedCount = a2zProblems.filter(p => p.solved).length;
          setA2zSolvedCount(solvedCount);
        }
      } catch (err) {
        console.error("Error loading progress in sheets landing page", err);
      }
    };

    loadProgress();
  }, []);

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto">
        
        {/* Header */}
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

        {/* Sheets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <SheetCard
            title="A2Z DSA Sheet"
            totalProblems={totalA2zProblems}
            solvedCount={a2zSolvedCount}
            path="/sheets/a2z"
          />

          <SheetCard
            title="Blind 75"
            comingSoon={true}
          />

          <SheetCard
            title="Striver CP Sheet"
            comingSoon={true}
          />

          <SheetCard
            title="Striver 31 Sheet"
            comingSoon={true}
          />
        </div>
      </div>
    </div>
  );
}
