import React, { useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaBolt, FaThLarge, FaCalendarAlt, FaChartBar, FaSyncAlt, FaBullseye,
  FaCheckCircle, FaGithub, FaDiscord, FaTwitter, FaLinkedin, FaArrowRight,
  FaHome, FaChartPie, FaBook, FaListUl, FaUser, FaLock, FaTrophy, FaRocket, FaCode
} from 'react-icons/fa';
import { SiLeetcode, SiCodeforces, SiCodechef } from 'react-icons/si';

const Landing = () => {
  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabData = [
    { 
      id: 'dashboard', 
      title: 'Unified Dashboard', 
      icon: FaHome, 
      desc: 'View all your stats, streaks, and ratings from multiple platforms in one seamless interface.',
      content: (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full">
           <h3 className="text-2xl font-bold mb-4 text-white">Your Coding Command Center</h3>
           <p className="text-slate-400 text-sm mb-8">Get a bird's eye view of your entire competitive programming journey. Track your global rating, total problems solved, and daily streaks across LeetCode, Codeforces, and CodeChef instantly.</p>
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-700/50 p-4 rounded-xl flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center"><FaChartBar size={20}/></div>
                <div><p className="text-[10px] text-slate-400">Total Solved</p><p className="text-xl font-bold">1,248</p></div>
              </div>
              <div className="bg-slate-900 border border-slate-700/50 p-4 rounded-xl flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center"><FaBolt size={20}/></div>
                <div><p className="text-[10px] text-slate-400">Current Streak</p><p className="text-xl font-bold">45 Days</p></div>
              </div>
           </div>
        </motion.div>
      )
    },
    { 
      id: 'sheets', 
      title: 'DSA Sheets', 
      icon: FaBook, 
      desc: 'Track your progress across popular curated problem lists like Striver A2Z and Blind 75.',
      content: (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full">
           <h3 className="text-2xl font-bold mb-4 text-white">Master DSA with Structured Sheets</h3>
           <p className="text-slate-400 text-sm mb-8">Stop getting lost in endless problem sets. We natively integrate popular tracking sheets so you can mark problems as solved, flag them for revision, and watch your completion bar fill up.</p>
           <div className="space-y-4">
             <div className="bg-slate-900 border border-slate-700/50 p-4 rounded-xl">
               <div className="flex justify-between items-center mb-2"><span className="font-semibold text-sm">Striver's A2Z DSA Sheet</span><span className="text-xs text-indigo-400">45%</span></div>
               <div className="w-full bg-slate-800 rounded-full h-2"><div className="bg-indigo-500 h-2 rounded-full w-[45%]"></div></div>
             </div>
             <div className="bg-slate-900 border border-slate-700/50 p-4 rounded-xl">
               <div className="flex justify-between items-center mb-2"><span className="font-semibold text-sm">Blind 75</span><span className="text-xs text-purple-400">80%</span></div>
               <div className="w-full bg-slate-800 rounded-full h-2"><div className="bg-purple-500 h-2 rounded-full w-[80%]"></div></div>
             </div>
           </div>
        </motion.div>
      )
    },
    { 
      id: 'radar', 
      title: 'Contest Radar', 
      icon: FaCalendarAlt, 
      desc: 'Never miss a competition with our unified global contest calendar.',
      content: (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full">
           <h3 className="text-2xl font-bold mb-4 text-white">Your Ultimate Contest Calendar</h3>
           <p className="text-slate-400 text-sm mb-8">Keep track of every upcoming contest from Codeforces, LeetCode, CodeChef, and AtCoder. Set reminders, view starting times in your local timezone, and jump straight to the registration page.</p>
           <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-900 border border-slate-700/50 p-3 rounded-lg">
                <div className="flex items-center gap-3"><SiCodeforces className="text-red-500 text-xl"/><span className="text-sm font-semibold">Codeforces Round 953</span></div>
                <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">In 2h 45m</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900 border border-slate-700/50 p-3 rounded-lg">
                <div className="flex items-center gap-3"><SiLeetcode className="text-yellow-500 text-xl"/><span className="text-sm font-semibold">Weekly Contest 398</span></div>
                <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">Sun, 8:00 AM</span>
              </div>
           </div>
        </motion.div>
      )
    },
    { 
      id: 'analytics', 
      title: 'Deep Analytics', 
      icon: FaChartPie, 
      desc: 'Identify your weak topics with advanced radar charts and performance metrics.',
      content: (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full flex gap-8 items-center">
           <div className="w-1/2">
             <h3 className="text-2xl font-bold mb-4 text-white">Know Your Weaknesses</h3>
             <p className="text-slate-400 text-sm mb-6">Our system analyzes your submission history to generate visual radar charts. Instantly see if you need to practice Dynamic Programming, Graphs, or Trees, and track your improvement over time.</p>
             <ul className="text-xs text-slate-500 space-y-2">
               <li className="flex items-center gap-2"><FaCheckCircle className="text-indigo-400"/> Topic-wise accuracy tracking</li>
               <li className="flex items-center gap-2"><FaCheckCircle className="text-indigo-400"/> Difficulty level breakdown</li>
             </ul>
           </div>
           <div className="w-1/2 flex justify-center">
              <div className="w-48 h-48 rounded-full border border-slate-700/50 flex items-center justify-center relative bg-slate-900/50">
                 {/* Fake radar chart */}
                 <svg viewBox="0 0 100 100" className="w-full h-full p-4 text-slate-600">
                   <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="none" stroke="currentColor" strokeWidth="1" />
                   <polygon points="50,25 75,40 75,60 50,75 25,60 25,40" fill="none" stroke="currentColor" strokeWidth="1" />
                   <polygon points="50,15 80,45 60,80 40,70 20,40" fill="#a855f7" fillOpacity="0.4" stroke="#a855f7" strokeWidth="2" />
                 </svg>
                 <span className="absolute top-2 text-[10px] text-slate-400">Graphs</span>
                 <span className="absolute bottom-2 text-[10px] text-slate-400">DP</span>
              </div>
           </div>
        </motion.div>
      )
    },
    { 
      id: 'revision', 
      title: 'Intelligent Revision', 
      icon: FaSyncAlt, 
      desc: 'AI-powered suggestions to revise topics before you forget them.',
      content: (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full">
           <h3 className="text-2xl font-bold mb-4 text-white">Never Forget A Concept</h3>
           <p className="text-slate-400 text-sm mb-8">Utilize spaced repetition for competitive programming. ASTRA automatically flags problems you struggled with and reminds you to solve them again when you are statistically most likely to forget the approach.</p>
           <div className="bg-slate-900 border border-slate-700/50 p-5 rounded-xl text-center">
             <div className="w-12 h-12 bg-fuchsia-500/20 text-fuchsia-400 rounded-full flex items-center justify-center mx-auto mb-3"><FaSyncAlt size={20}/></div>
             <p className="text-sm font-semibold text-white mb-1">3 Problems Due for Revision</p>
             <p className="text-xs text-slate-400 mb-4">Focus on: Sliding Window, Binary Search</p>
             <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-md text-xs font-semibold transition-colors">Start Revision Session</button>
           </div>
        </motion.div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white font-sans selection:bg-indigo-500/30 overflow-hidden relative">
      
      {/* Moving Background Orbs */}
      <motion.div animate={{ x: [0, 100, -50, 0], y: [0, -50, 50, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="fixed top-0 left-0 w-[600px] h-[600px] bg-indigo-700/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <motion.div animate={{ x: [0, -100, 50, 0], y: [0, 50, -50, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="fixed bottom-0 right-0 w-[700px] h-[700px] bg-purple-700/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0f1c]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
            <img src="/logo.png" alt="ASTRA Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold tracking-wide">ASTRA</span>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="hidden lg:flex items-center gap-8 text-sm text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link to="/sheets" className="hover:text-white transition-colors">Sheets</Link>
            <Link to="/analytics" className="hover:text-white transition-colors">Analytics</Link>
            <Link to="/contest-radar" className="hover:text-white transition-colors">Contest Radar</Link>
            <Link to="/revision" className="hover:text-white transition-colors">Revision</Link>
            <a href="#" className="hover:text-white transition-colors">Roadmap</a>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white hidden sm:block">Login</Link>
            <Link to="/login" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md text-sm font-medium transition-all shadow-[0_0_15px_rgba(79,70,229,0.4)]">
              Get Started
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Text */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-950/50 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-6">
              The Complete CP Companion
            </motion.div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
              All Your Coding<br/>Journey, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Unified.</span>
            </h1>
            <p className="text-slate-400 text-lg mb-8 max-w-lg leading-relaxed">
              ASTRA brings together problems, contests, analytics, revision and progress tracking from all major platforms into one intelligent ecosystem.
            </p>
            <div className="flex flex-wrap gap-4 items-center mb-10">
              <Link to="/login" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                Get Started for Free
              </Link>
              <a href="#features" className="px-6 py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg font-medium transition-all flex items-center gap-2 group">
                Explore Features <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
            
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex -space-x-3">
                <img src="https://i.pravatar.cc/100?img=1" alt="User" className="w-8 h-8 rounded-full border-2 border-[#0a0f1c]" />
                <img src="https://i.pravatar.cc/100?img=2" alt="User" className="w-8 h-8 rounded-full border-2 border-[#0a0f1c]" />
                <img src="https://i.pravatar.cc/100?img=3" alt="User" className="w-8 h-8 rounded-full border-2 border-[#0a0f1c]" />
                <img src="https://i.pravatar.cc/100?img=4" alt="User" className="w-8 h-8 rounded-full border-2 border-[#0a0f1c]" />
              </div>
              <p>Trusted by thousands of coders <span className="text-white font-medium">+2.5K</span></p>
            </motion.div>
          </motion.div>

          {/* Right Laptop Animation */}
          <motion.div 
            style={{ 
              perspective: 1200,
              y: useTransform(scrollYProgress, [0, 1], [0, -150]) 
            }}
            className="relative w-full h-[400px] flex items-center justify-center transform-gpu mt-12 lg:mt-0"
          >
            {/* Laptop Screen */}
            <motion.div 
              style={{
                rotateX: useTransform(scrollYProgress, [0, 0.2], [45, 0]),
                rotateY: useTransform(scrollYProgress, [0, 0.2], [-15, 0]),
                scale: useTransform(scrollYProgress, [0, 0.2], [0.85, 1])
              }}
              className="relative w-full max-w-lg h-[300px] bg-[#0a0f1c] border-[6px] border-slate-700/90 rounded-t-2xl shadow-2xl flex flex-col overflow-hidden z-10 origin-bottom"
            >
              {/* Fake Mac Window Controls */}
              <div className="h-6 bg-slate-800/80 w-full flex items-center px-3 gap-1.5 border-b border-slate-700">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                <span className="mx-auto text-[10px] text-slate-400 font-mono">solver.cpp - ASTRA</span>
              </div>
              
              {/* Code Content */}
              <div className="flex-1 p-5 font-mono text-xs overflow-hidden relative bg-[#0a0f1c]">
                <motion.div 
                   animate={{ y: [0, -150] }}
                   transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                   className="space-y-2 text-slate-300"
                >
                  <p><span className="text-pink-500">#include</span> <span className="text-green-400">&lt;iostream&gt;</span></p>
                  <p><span className="text-pink-500">#include</span> <span className="text-green-400">&lt;vector&gt;</span></p>
                  <p><span className="text-pink-500">using namespace</span> std;</p>
                  <br/>
                  <p><span className="text-indigo-400">int</span> <span className="text-yellow-200">main</span>() {'{'}</p>
                  <p className="pl-4"><span className="text-indigo-400">int</span> n;</p>
                  <p className="pl-4">cin <span className="text-pink-500">&gt;&gt;</span> n;</p>
                  <p className="pl-4"><span className="text-indigo-400">vector</span>&lt;<span className="text-indigo-400">int</span>&gt; dp(n + <span className="text-orange-400">1</span>, <span className="text-orange-400">0</span>);</p>
                  <p className="pl-4"><span className="text-pink-500">for</span> (<span className="text-indigo-400">int</span> i = <span className="text-orange-400">1</span>; i &lt;= n; i++) {'{'}</p>
                  <p className="pl-8">dp[i] = dp[i - <span className="text-orange-400">1</span>] + <span className="text-orange-400">1</span>;</p>
                  <p className="pl-8"><span className="text-slate-500">// AI Suggestion: Optimize with matrix exponentiation</span></p>
                  <p className="pl-4">{'}'}</p>
                  <p className="pl-4">cout <span className="text-pink-500">&lt;&lt;</span> dp[n] <span className="text-pink-500">&lt;&lt;</span> endl;</p>
                  <p className="pl-4"><span className="text-pink-500">return</span> <span className="text-orange-400">0</span>;</p>
                  <p>{'}'}</p>
                  <br/>
                  <p><span className="text-slate-500">/* Processing optimizations... */</span></p>
                  <p><span className="text-green-400">✔ All test cases passed! (0.015s)</span></p>
                  <br/>
                  <p><span className="text-pink-500">#include</span> <span className="text-green-400">&lt;algorithm&gt;</span></p>
                  <p><span className="text-slate-500">// Next problem...</span></p>
                </motion.div>
                
                {/* Typing Cursor Overlay */}
                <motion.div 
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="absolute bottom-6 left-5 w-2 h-4 bg-white"
                />
              </div>
            </motion.div>
            
            {/* Laptop Base */}
            <motion.div 
              style={{
                scale: useTransform(scrollYProgress, [0, 0.2], [0.85, 1]),
                opacity: useTransform(scrollYProgress, [0, 0.1], [0, 1])
              }}
              className="absolute bottom-[40px] w-[120%] max-w-[550px] h-6 bg-slate-400 rounded-b-3xl border-b-[8px] border-slate-600 shadow-[0_30px_60px_rgba(0,0,0,0.6)] flex justify-center z-20"
            >
              <div className="w-24 h-1.5 bg-slate-300 mt-1 rounded-full"></div>
            </motion.div>
            
            {/* Floating Elements around laptop */}
            <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute -right-4 top-20 bg-[#0d1326]/90 border border-indigo-500/30 p-3 rounded-lg shadow-xl backdrop-blur-sm z-30">
              <div className="flex items-center gap-2 text-xs font-semibold text-green-400"><FaCheckCircle/> Accepted</div>
            </motion.div>
            <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute left-0 bottom-24 bg-[#0d1326]/90 border border-purple-500/30 p-3 rounded-lg shadow-xl backdrop-blur-sm z-30">
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-400"><FaRocket/> Rank Up!</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-800/50 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-950/50 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-4">
            Powerful Features
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Everything You Need to Level Up</h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
          {[
            { icon: FaBolt, title: "Unified Dashboard", desc: "All your stats from multiple platforms in one place", color: "text-blue-400" },
            { icon: FaThLarge, title: "Unified Sheets", desc: "Track progress across Striver A2Z, Blind 75, & more", color: "text-indigo-400" },
            { icon: FaCalendarAlt, title: "Contest Radar", desc: "Never miss a contest with unified calendar", color: "text-blue-300" },
            { icon: FaChartBar, title: "Performance Analytics", desc: "Deep insights into your strengths and weaknesses", color: "text-purple-400" },
            { icon: FaSyncAlt, title: "Intelligent Revision", desc: "AI-powered suggestions to revise weak topics", color: "text-fuchsia-400" },
            { icon: FaBullseye, title: "Progress Tracking", desc: "Monitor streaks, goals and consistency over time", color: "text-pink-400" },
          ].map((f, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -10 }}
              className="flex flex-col items-center cursor-pointer"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 shadow-lg transition-colors hover:border-indigo-500/50">
                <f.icon className={`text-2xl ${f.color}`} />
              </div>
              <h3 className="font-semibold text-sm mb-2">{f.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-[150px]">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Feature Glimpse Showcase (Replaced All-in-One Section) */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-800/50 relative z-10">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-12">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-950/50 border border-blue-500/30 text-blue-300 text-xs font-medium mb-4">
            Platform Capabilities
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">A Glimpse Inside ASTRA</h2>
          <p className="text-slate-400 mt-4 max-w-2xl">Discover how our core features work together to supercharge your competitive programming journey.</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Tabs Navigation */}
          <div className="lg:w-1/3 flex flex-col gap-3">
            {tabData.map((tab) => (
              <motion.div 
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`p-5 rounded-xl cursor-pointer transition-all border ${activeTab === tab.id ? 'bg-indigo-600/20 border-indigo-500/50 shadow-[0_0_15px_rgba(79,70,229,0.2)]' : 'bg-[#0d1326]/50 border-slate-800 hover:bg-slate-800/60'}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <tab.icon className={`text-xl ${activeTab === tab.id ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <h4 className={`font-semibold ${activeTab === tab.id ? 'text-white' : 'text-slate-300'}`}>{tab.title}</h4>
                </div>
                <p className={`text-xs pl-8 ${activeTab === tab.id ? 'text-indigo-200' : 'text-slate-500'}`}>{tab.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Tab Content Area */}
          <div className="lg:w-2/3 bg-[#0d1326]/80 border border-slate-800 rounded-2xl p-8 relative overflow-hidden min-h-[400px] flex items-center shadow-2xl">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
             <AnimatePresence mode="wait">
               {tabData.find(t => t.id === activeTab)?.content}
             </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-slate-800/50 bg-[#0d1326]/30 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
          {[
            { icon: FaUser, val: "10K+", label: "Active Users", color: "text-indigo-400" },
            { icon: FaBook, val: "500K+", label: "Problems Solved", color: "text-purple-400" },
            { icon: FaTrophy, val: "50K+", label: "Contests Tracked", color: "text-blue-400" },
            { icon: FaChartPie, val: "95%", label: "User Satisfaction", color: "text-pink-400" },
            { icon: FaRocket, val: "24/7", label: "Always Improving", color: "text-indigo-400" }
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1, type: "spring" }} className={i === 4 ? "col-span-2 md:col-span-1" : ""}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <stat.icon className={`${stat.color} text-xl`} />
                <span className="text-2xl font-bold">{stat.val}</span>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between relative z-10 bg-slate-900/50 p-8 md:p-12 rounded-3xl border border-slate-800">
          <div className="mb-8 md:mb-0 relative">
             <motion.div animate={{ y: [-10, 10, -10], rotate: [0, -5, 5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="text-6xl mb-6 inline-block">🚀</motion.div>
            <h2 className="text-3xl font-bold mb-4">Ready to Supercharge Your Coding Journey?</h2>
            <p className="text-slate-400">Join thousands of coders who are already leveling up with ASTRA.</p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/login" className="whitespace-nowrap px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] flex items-center gap-2">
              Get Started Now <FaArrowRight />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0f1c] border-t border-slate-800/50 pt-16 pb-8 px-6 text-sm relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
             <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="ASTRA Logo" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold tracking-wide">ASTRA</span>
            </div>
            <p className="text-slate-500 max-w-xs leading-relaxed">The Complete Competitive Programming Companion</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-slate-300">Platform</h4>
            <ul className="space-y-2 text-slate-500">
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link to="/sheets" className="hover:text-white transition-colors">Sheets</Link></li>
              <li><Link to="/contest-radar" className="hover:text-white transition-colors">Contest Radar</Link></li>
              <li><Link to="/analytics" className="hover:text-white transition-colors">Analytics</Link></li>
              <li><Link to="/revision" className="hover:text-white transition-colors">Revision</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-slate-300">Resources</h4>
            <ul className="space-y-2 text-slate-500">
              <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-slate-300">Company</h4>
            <ul className="space-y-2 text-slate-500">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-800 text-slate-500">
          <p>© 2025 ASTRA. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <motion.a whileHover={{ y: -3, color: '#fff' }} href="#" className="transition-colors"><FaGithub size={18} /></motion.a>
            <motion.a whileHover={{ y: -3, color: '#fff' }} href="#" className="transition-colors"><FaDiscord size={18} /></motion.a>
            <motion.a whileHover={{ y: -3, color: '#fff' }} href="#" className="transition-colors"><FaTwitter size={18} /></motion.a>
            <motion.a whileHover={{ y: -3, color: '#fff' }} href="#" className="transition-colors"><FaLinkedin size={18} /></motion.a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;