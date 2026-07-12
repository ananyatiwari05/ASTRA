import React from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaStar, FaChartLine, FaCheckCircle, FaFire } from 'react-icons/fa';

export default function RatingCard({
  user,
  platform = 'codeforces',
  isLoading,
}) {
  if (isLoading) {
    return (
      <div className="p-6 border border-slate-800/80 rounded-xl bg-slate-900/40 text-slate-400 flex items-center justify-center min-h-[120px]">
        <div className="flex items-center gap-3">
          <span className="w-5 h-5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></span>
          Loading Stats...
        </div>
      </div>
    );
  }

  const currentUser =
    platform === 'codechef'
      ? user?.codechef
      : platform === 'leetcode'
      ? user?.leetcode
      : user?.codeforces;

  if (platform === 'leetcode') {
    return (
      <motion.div 
        whileHover={{ scale: 1.01 }}
        className="p-6 border border-slate-800/80 rounded-xl bg-slate-900/40 shadow-lg backdrop-blur-sm relative overflow-hidden group h-full flex flex-col justify-between"
      >
        <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/5 transition-colors duration-300 pointer-events-none" />
        
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <FaChartLine className="text-xl" />
          </div>
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
            LeetCode Stats
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-[#0b0f19] border border-slate-800/50 p-3 rounded-xl">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><FaCheckCircle className="text-emerald-400"/> Easy</p>
            <p className="text-xl font-bold text-emerald-400">{currentUser?.easySolved ?? '0'}</p>
          </div>
          <div className="bg-[#0b0f19] border border-slate-800/50 p-3 rounded-xl">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><FaFire className="text-yellow-400"/> Medium</p>
            <p className="text-xl font-bold text-yellow-400">{currentUser?.mediumSolved ?? '0'}</p>
          </div>
          <div className="bg-[#0b0f19] border border-slate-800/50 p-3 rounded-xl">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><FaStar className="text-red-400"/> Hard</p>
            <p className="text-xl font-bold text-red-400">{currentUser?.hardSolved ?? '0'}</p>
          </div>
        </div>

        <div className="flex justify-between items-center bg-[#0b0f19] border border-slate-800/50 p-3 rounded-xl">
          <div>
             <span className="text-xs text-slate-400 block mb-1">Rating</span>
             <span className="text-lg font-bold text-white">{currentUser?.rating ? Math.round(currentUser.rating) : 'N/A'}</span>
          </div>
          <div className="text-right">
             <span className="text-xs text-slate-400 block mb-1">Global Rank</span>
             <span className="text-lg font-bold text-purple-400">#{currentUser?.ranking || 'N/A'}</span>
          </div>
        </div>
      </motion.div>
    );
  }

  const currentRating = platform === 'codechef' ? (currentUser?.rating || currentUser?.currentRating || currentUser?.ccRating || currentUser?.cfCurrentRating) : currentUser?.cfCurrentRating;
  const maxRating = platform === 'codechef' ? (currentUser?.maxRating || currentUser?.ccMaxRating || currentUser?.cfMaxRating) : currentUser?.cfMaxRating;
  const rank = platform === 'codechef' ? (currentUser?.rank || currentUser?.ccRank || currentUser?.cfRank) : currentUser?.cfRank;

  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      className="p-6 border border-slate-800/80 rounded-xl bg-slate-900/40 shadow-lg backdrop-blur-sm relative overflow-hidden group h-full flex flex-col justify-between"
    >
      <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-colors duration-300 pointer-events-none" />
      
      <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <FaTrophy className="text-xl" />
          </div>
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
            Rating Stats
          </h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#0b0f19] border border-slate-800/50 p-4 rounded-xl flex flex-col justify-center">
          <p className="text-xs text-slate-400 tracking-wider uppercase mb-1">
            Current Rating
          </p>
          <p className="text-3xl text-indigo-400 font-bold">
            {currentRating ?? 'N/A'}
          </p>
        </div>

        <div className="bg-[#0b0f19] border border-slate-800/50 p-4 rounded-xl flex flex-col justify-center">
          <p className="text-xs text-slate-400 tracking-wider uppercase mb-1">
            Max Rating
          </p>
          <p className="text-3xl font-bold text-white">
            {maxRating ?? 'N/A'}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center bg-[#0b0f19] border border-slate-800/50 p-3 rounded-xl">
        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mr-3">
          <FaStar size={14} />
        </div>
        <div>
          <span className="text-xs text-slate-400 block">
            Rank
          </span>
          <span className="text-sm text-emerald-400 font-bold capitalize">
            {rank || 'Unrated'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}