import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchUpcomingContests } from '../api/client';
import ContestStats from '../components/contests/ContestStats';
import ContestFilters from '../components/contests/ContestFilters';
import ContestCard from '../components/contests/ContestCard';
import ContestCalendar from '../components/contests/ContestCalendar';
import SiteNavbar from '../components/SiteNavbar';
import Footer from '../components/Footer';

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

  // Animation variants
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
    <div className="min-h-screen flex flex-col bg-[#0a0f1c] text-white selection:bg-indigo-500/30 overflow-hidden relative">
      <SiteNavbar />

      {/* Moving Background Orbs to match landing page */}
      <motion.div animate={{ x: [0, 100, -50, 0], y: [0, -50, 50, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="fixed top-0 left-0 w-[600px] h-[600px] bg-indigo-700/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <motion.div animate={{ x: [0, -100, 50, 0], y: [0, 50, -50, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="fixed bottom-0 right-0 w-[700px] h-[700px] bg-purple-700/10 rounded-full blur-[150px] pointer-events-none z-0" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto pt-24 pb-12 px-6 lg:px-12 relative z-10 w-full flex-1"
      >
        <motion.div variants={itemVariants} className="border-b border-slate-800/80 pb-6 mb-8">
          <div className="flex items-center gap-2 mb-2 font-mono text-xs text-indigo-400 tracking-wider">
            <span className="bg-indigo-950/50 border border-indigo-500/30 px-2 py-0.5 rounded-full">MODULES</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">CONTEST RADAR</span>
          </div>

          <h1 className="text-3xl lg:text-5xl font-black tracking-tight mt-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
              Contest Radar
            </span>
          </h1>

          <p className="text-sm text-slate-400 mt-3 max-w-xl leading-relaxed">
            Track upcoming coding contests across competitive programming platforms. Never miss a competition with our unified global calendar.
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <ContestStats contests={contests} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <ContestFilters
            selectedPlatform={selectedPlatform}
            setSelectedPlatform={setSelectedPlatform}
          />
        </motion.div>

        <motion.div variants={containerVariants} className="space-y-4">
          {loading ? (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 text-slate-400">
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></span>
                Loading contests...
              </div>
            </div>
          ) : filteredContests.length > 0 ? (
            displayedContests.map((contest) => (
              <motion.div key={contest.id} variants={itemVariants}>
                <ContestCard contest={contest} />
              </motion.div>
            ))
          ) : (
            <motion.div variants={itemVariants} className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 text-slate-400 text-center py-12">
              <p>No upcoming contests found for this platform.</p>
            </motion.div>
          )}
        </motion.div>

        {filteredContests.length > 3 && (
          <motion.div variants={itemVariants} className="flex justify-center mt-6">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-6 py-2.5 rounded-lg border border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-400 transition-all text-sm font-medium shadow-[0_0_15px_rgba(79,70,229,0.1)]"
            >
              {showAll ? 'Show Less' : `Show More (${filteredContests.length - 3} more)`}
            </button>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="mt-8">
          <ContestCalendar contests={filteredContests} />
        </motion.div>
      </motion.div>

      <Footer />
    </div>
  );
}
