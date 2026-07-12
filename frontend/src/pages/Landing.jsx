import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaBolt, FaThLarge, FaCalendarAlt, FaChartBar, FaSyncAlt, FaBullseye,
  FaCheckCircle, FaGithub, FaDiscord, FaTwitter, FaLinkedin, FaArrowRight,
  FaHome, FaChartPie, FaBook, FaListUl, FaUser, FaLock, FaTrophy, FaRocket, FaCode
} from 'react-icons/fa';
import { SiLeetcode, SiCodeforces, SiCodechef } from 'react-icons/si';

/* ---------------------------------------------------------------------
   Small reusable helper: animated count-up number, triggered once when
   it scrolls into view. Works with "10K+", "95%", "24/7" etc. by only
   animating the numeric prefix and keeping the rest as a static suffix.
--------------------------------------------------------------------- */
const Counter = ({ value, duration = 1.4 }) => {
  const [display, setDisplay] = useState(null);
  const started = useRef(false);

  const match = String(value).match(/^([\d.]+)(.*)$/);
  const numeric = match ? parseFloat(match[1]) : null;
  const suffix = match ? match[2] : '';
  const decimals = match && match[1].includes('.') ? match[1].split('.')[1].length : 0;

  const handleEnter = () => {
    if (started.current || numeric === null) return;
    started.current = true;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay((numeric * eased).toFixed(decimals));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (numeric === null) return <span>{value}</span>;

  return (
    <motion.span onViewportEnter={handleEnter} viewport={{ once: true, margin: "-40px" }}>
      {display ?? '0'}{suffix}
    </motion.span>
  );
};

const FEATURES = [
  { icon: FaBolt, title: "Unified Dashboard", desc: "All your stats from multiple platforms in one place", color: "text-blue-400" },
  { icon: FaThLarge, title: "Unified Sheets", desc: "Track progress across Striver A2Z, Blind 75, & more", color: "text-indigo-400" },
  { icon: FaCalendarAlt, title: "Contest Radar", desc: "Never miss a contest with unified calendar", color: "text-blue-300" },
  { icon: FaChartBar, title: "Performance Analytics", desc: "Deep insights into your strengths and weaknesses", color: "text-purple-400" },
  { icon: FaSyncAlt, title: "Intelligent Revision", desc: "AI-powered suggestions to revise weak topics", color: "text-fuchsia-400" },
  { icon: FaBullseye, title: "Progress Tracking", desc: "Monitor streaks, goals and consistency over time", color: "text-pink-400" },
];

const Landing = () => {
  const { scrollYProgress } = useScroll();
  const smoothScroll = useSpring(scrollYProgress, { stiffness: 120, damping: 25, mass: 0.3 });
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const [activeTab, setActiveTab] = useState('dashboard');

  const scrollContainerRef = useRef(null);
  const { scrollYProgress: containerScrollProgress } = useScroll({
    target: scrollContainerRef,
    offset: ["start start", "end end"]
  });
  const scrollSmooth = useSpring(containerScrollProgress, {
    stiffness: 55,
    damping: 22,
    mass: 0.8,
  });

  const [isDesktop, setIsDesktop] = useState(true);
  const [scales, setScales] = useState({ initial: 0.55, zoomed: 1.8 });

  useEffect(() => {
    const handleResize = () => {
      const isLg = window.innerWidth >= 1024;
      setIsDesktop(isLg);
      
      const initial = isLg ? 0.55 : 0.28;
      // Keep zoomed scale fixed at 1 for consistent laptop size
      const zoomed = 1;

      setScales({ initial, zoomed });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const heroTextOpacity = useTransform(scrollSmooth, [0, 0.15], [1, 0]);
  const heroTextX = useTransform(scrollSmooth, [0, 0.15], [0, -80]);
  const heroTextBlur = useTransform(scrollSmooth, [0, 0.15], [0, 8]);
  const heroTextFilter = useTransform(heroTextBlur, (v) => `blur(${v}px)`);

  const laptopX = useTransform(scrollSmooth, [0, 0.18], [isDesktop ? "25vw" : "0vw", "0vw"]);
  const laptopY = useTransform(scrollSmooth, [0, 0.18], [isDesktop ? "0vh" : "12vh", "0vh"]);
  
  const laptopScale = useTransform(
    scrollSmooth,
    [0, 0.18, 0.35, 0.75, 0.90, 1],
    [
      scales.initial,
      0.82,
      1,
      1,
      0.9,
      0.85,
    ]
  );
  const laptopVerticalOffset = useTransform(
    scrollSmooth,
    [0, 0.35, 0.80, 0.95, 1],
    ['10vh', '0vh', '0vh', '4vh', '8vh']
  );

  const tiltX = useSpring(0, { stiffness: 150, damping: 18 });
  const tiltY = useSpring(0, { stiffness: 150, damping: 18 });
  const handleLaptopMouseMove = (e) => {
    const currentProgress = containerScrollProgress.get();
    if (currentProgress > 0.72) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    const factor = currentProgress > 0.2 ? 0.3 : 1.0;
    tiltY.set(px * 10 * factor);
    tiltX.set(py * -10 * factor);
  };
  const handleLaptopMouseLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  const laptopScrollRotateX = useTransform(scrollSmooth, [0, 0.18], [12, 0]);
  const laptopRotateX = useTransform([laptopScrollRotateX, tiltX], ([a, b]) => a + b);

  const laptopScrollRotateY = useTransform(scrollSmooth, [0, 0.18], [-12, 0]);
  const laptopRotateY = useTransform([laptopScrollRotateY, tiltY], ([a, b]) => a + b);

  const lidRotateX = useTransform(
    scrollSmooth,
    [0, 0.18, 0.75, 0.92],
    [-12, 0, 0, 105]
  );

  const codeOpacity = useTransform(scrollSmooth, [0, 0.20, 0.30], [1, 1, 0]);
  const featuresOpacity = useTransform(scrollSmooth, [0.24, 0.32, 0.78, 0.88], [0, 1, 1, 0]);
  const laptopOpacity = useTransform(
    scrollSmooth,
    [0.88, 0.98],
    [1, 0]
  );

  // Decoupled hooks to comply with React's Rules of Hooks (no hook calls inside loops/maps)
  const card0Opacity = useTransform(scrollSmooth, [0.26, 0.36, 0.72, 0.80], [0, 1, 1, 0]);
  const card0Y = useTransform(scrollSmooth, [0.26, 0.36], [15, 0]);

  const card1Opacity = useTransform(scrollSmooth, [0.28, 0.38, 0.72, 0.80], [0, 1, 1, 0]);
  const card1Y = useTransform(scrollSmooth, [0.28, 0.38], [15, 0]);

  const card2Opacity = useTransform(scrollSmooth, [0.30, 0.40, 0.72, 0.80], [0, 1, 1, 0]);
  const card2Y = useTransform(scrollSmooth, [0.30, 0.40], [15, 0]);

  const card3Opacity = useTransform(scrollSmooth, [0.32, 0.42, 0.72, 0.80], [0, 1, 1, 0]);
  const card3Y = useTransform(scrollSmooth, [0.32, 0.42], [15, 0]);

  const card4Opacity = useTransform(scrollSmooth, [0.34, 0.44, 0.72, 0.80], [0, 1, 1, 0]);
  const card4Y = useTransform(scrollSmooth, [0.34, 0.44], [15, 0]);

  const card5Opacity = useTransform(scrollSmooth, [0.36, 0.46, 0.72, 0.80], [0, 1, 1, 0]);
  const card5Y = useTransform(scrollSmooth, [0.36, 0.46], [15, 0]);

  const cardsTransform = [
    { opacity: card0Opacity, y: card0Y },
    { opacity: card1Opacity, y: card1Y },
    { opacity: card2Opacity, y: card2Y },
    { opacity: card3Opacity, y: card3Y },
    { opacity: card4Opacity, y: card4Y },
    { opacity: card5Opacity, y: card5Y },
  ];

  const floatCardsOpacity = useTransform(scrollSmooth, [0, 0.15], [1, 0]);


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
               <div className="w-full bg-slate-800 rounded-full h-2"><motion.div initial={{ width: 0 }} whileInView={{ width: "45%" }} viewport={{ once: true }} transition={{ duration: 1, ease: "easeOut" }} className="bg-indigo-500 h-2 rounded-full"></motion.div></div>
             </div>
             <div className="bg-slate-900 border border-slate-700/50 p-4 rounded-xl">
               <div className="flex justify-between items-center mb-2"><span className="font-semibold text-sm">Blind 75</span><span className="text-xs text-purple-400">80%</span></div>
               <div className="w-full bg-slate-800 rounded-full h-2"><motion.div initial={{ width: 0 }} whileInView={{ width: "80%" }} viewport={{ once: true }} transition={{ duration: 1, ease: "easeOut", delay: 0.15 }} className="bg-purple-500 h-2 rounded-full"></motion.div></div>
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
              <motion.div initial={{ rotate: -8, scale: 0.9, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} className="w-48 h-48 rounded-full border border-slate-700/50 flex items-center justify-center relative bg-slate-900/50">
                 {/* Fake radar chart */}
                 <svg viewBox="0 0 100 100" className="w-full h-full p-4 text-slate-600">
                   <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="none" stroke="currentColor" strokeWidth="1" />
                   <polygon points="50,25 75,40 75,60 50,75 25,60 25,40" fill="none" stroke="currentColor" strokeWidth="1" />
                   <motion.polygon initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }} style={{ transformOrigin: '50px 50px' }} points="50,15 80,45 60,80 40,70 20,40" fill="#a855f7" fillOpacity="0.4" stroke="#a855f7" strokeWidth="2" />
                 </svg>
                 <span className="absolute top-2 text-[10px] text-slate-400">Graphs</span>
                 <span className="absolute bottom-2 text-[10px] text-slate-400">DP</span>
              </motion.div>
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
             <motion.div animate={{ rotate: [0, -15, 15, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }} className="w-12 h-12 bg-fuchsia-500/20 text-fuchsia-400 rounded-full flex items-center justify-center mx-auto mb-3"><FaSyncAlt size={20}/></motion.div>
             <p className="text-sm font-semibold text-white mb-1">3 Problems Due for Revision</p>
             <p className="text-xs text-slate-400 mb-4">Focus on: Sliding Window, Binary Search</p>
             <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-md text-xs font-semibold transition-colors">Start Revision Session</motion.button>
           </div>
        </motion.div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white font-sans selection:bg-indigo-500/30 overflow-hidden relative">

      {/* Scroll progress bar */}
      <motion.div
        style={{ scaleX: smoothScroll }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 origin-left z-[60]"
      />
      
      {/* Moving Background Orbs */}
      <motion.div style={{ y: yBg }} animate={{ x: [0, 100, -50, 0], y: [0, -50, 50, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="fixed top-0 left-0 w-[600px] h-[600px] bg-indigo-700/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <motion.div animate={{ x: [0, -100, 50, 0], y: [0, 50, -50, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="fixed bottom-0 right-0 w-[700px] h-[700px] bg-purple-700/10 rounded-full blur-[150px] pointer-events-none z-0" />

      <motion.div
        style={{
          scale: laptopScale,
          opacity: laptopOpacity,
        }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[950px] h-[950px] rounded-full bg-indigo-600/15 blur-[160px] pointer-events-none -z-0"
      />

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
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white hidden sm:block">Login</Link>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link to="/login" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md text-sm font-medium transition-all shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                Get Started
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </nav>

      {/* Pinned Hero + Laptop Animation Container */}
      <section ref={scrollContainerRef} id="features" className="relative h-[350vh] bg-[#0a0f1c] z-10">
        <div className="sticky top-0 h-screen w-full overflow-visible flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
          
          {/* Main Grid for Text Layout */}
          <div className="w-full max-w-7xl mx-auto px-6 h-full grid lg:grid-cols-2 items-center relative pointer-events-none">
            
            {/* Left Text */}
            <motion.div
              style={{ 
                opacity: heroTextOpacity, 
                x: heroTextX, 
                filter: heroTextFilter 
              }}
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="pointer-events-auto z-30"
            >
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-950/50 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-6">
                <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2" />
                The Complete DSA Companion
              </motion.div>
              <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
                <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }} className="inline-block">All Your Coding</motion.span><br/>
                <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.6 }} className="inline-block">Journey, </motion.span>
                <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }} className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Unified.</motion.span>
              </h1>
              <p className="text-slate-400 text-lg mb-8 max-w-lg leading-relaxed">
                ASTRA brings together problems, contests, analytics, revision and progress tracking from all major platforms into one intelligent ecosystem.
              </p>
              <div className="flex flex-wrap gap-4 items-center mb-10">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Link to="/login" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] inline-block">
                    Get Started for Free
                  </Link>
                </motion.div>
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
            
            {/* Empty right column placeholder for desktop grid spacing */}
            <div className="hidden lg:block h-[400px]"></div>
          </div>

          {/* Absolute 3D Laptop Container */}
          <motion.div 
            style={{ 
              x: laptopX,
              y: laptopVerticalOffset,
              position: 'fixed',
              top: '50%',
              left: '50%',
              scale: laptopScale,
              rotateX: laptopRotateX,
              rotateY: laptopRotateY,
              opacity: laptopOpacity,
              transformStyle: "preserve-3d",
              perspective: 2000,
            }}
            className="-translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] pointer-events-auto flex flex-col items-center justify-center z-40 origin-center select-none"
          >
            {/* Laptop Lid (Screen & Metallic Cover) */}
            <motion.div
              style={{
                rotateX: lidRotateX,
                transformStyle: "preserve-3d",
                transformOrigin: "bottom center",
              }}
              className="relative w-[800px] h-[500px] z-10 origin-bottom"
            >
              {/* FRONT: The Laptop Screen */}
              <div 
                className="absolute inset-0 bg-[#0a0f1c] border-[12px] border-slate-800 rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
                style={{ 
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                <motion.div
                  animate={{ x: ['-120%', '120%'] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
                  className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none z-20"
                />
                {/* Screen Top Bar */}
                <div className="h-7 bg-slate-900/90 w-full flex items-center px-4 justify-between border-b border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono tracking-wider">solver.cpp - ASTRA</span>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                    <span className="text-[8px] text-slate-500 font-mono">ONLINE</span>
                  </div>
                </div>

                {/* Main Screen Content Area */}
                <div className="flex-1 w-full h-full relative overflow-hidden bg-[#070a13]">
                  
                  {/* VIEW 1: Code Editor (Visually highly polished) */}
                  <motion.div
                    style={{ opacity: codeOpacity }}
                    className="absolute inset-0 flex font-mono text-[10px] bg-[#070a13] text-slate-300"
                  >
                    {/* IDE Sidebar */}
                    <div className="w-40 bg-[#04060c] border-r border-slate-900 p-4 flex flex-col gap-3 select-none">
                      <span className="text-[9px] font-bold text-slate-600 tracking-wider">EXPLORER</span>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-indigo-400 bg-indigo-950/30 px-2 py-1 rounded border border-indigo-500/10">
                          <FaCode className="text-xs" />
                          <span className="truncate">solver.cpp</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 px-2 py-0.5">
                          <SiLeetcode className="text-xs" />
                          <span className="truncate text-[9px]">blind75.json</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 px-2 py-0.5">
                          <SiCodeforces className="text-xs" />
                          <span className="truncate text-[9px]">radar.cpp</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 px-2 py-0.5">
                          <SiCodechef className="text-xs" />
                          <span className="truncate text-[9px]">revision.db</span>
                        </div>
                      </div>
                    </div>

                    {/* IDE Editor Pane */}
                    <div className="flex-1 p-5 flex flex-col relative overflow-hidden">
                      {/* Editor Tabs */}
                      <div className="flex gap-2 mb-4 border-b border-slate-900 pb-2 select-none">
                        <span className="text-[9px] text-indigo-400 font-semibold border-b-2 border-indigo-500 pb-1.5 px-1">solver.cpp</span>
                        <span className="text-[9px] text-slate-600 px-1">radar.cpp</span>
                      </div>

                      {/* Code Typing Area */}
                      <div className="flex-1 overflow-hidden relative">
                        <motion.div 
                          animate={{ y: [0, -180] }}
                          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                          className="space-y-1.5 text-slate-400 leading-normal"
                        >
                          <p><span className="text-pink-500">#include</span> <span className="text-green-400">&lt;iostream&gt;</span></p>
                          <p><span className="text-pink-500">#include</span> <span className="text-green-400">&lt;vector&gt;</span></p>
                          <p><span className="text-pink-500">#include</span> <span className="text-green-400">&lt;algorithm&gt;</span></p>
                          <p><span className="text-pink-500">using namespace</span> std;</p>
                          <br/>
                          <p><span className="text-indigo-400">int</span> <span className="text-yellow-200">main</span>() {'{'}</p>
                          <p className="pl-4">ios_base::<span className="text-blue-400">sync_with_stdio</span>(<span className="text-orange-400">false</span>);</p>
                          <p className="pl-4">cin.<span className="text-blue-400">tie</span>(<span className="text-orange-400">NULL</span>);</p>
                          <br/>
                          <p className="pl-4"><span className="text-indigo-400">int</span> n, k;</p>
                          <p className="pl-4">cin <span className="text-pink-500">&gt;&gt;</span> n <span className="text-pink-500">&gt;&gt;</span> k;</p>
                          <p className="pl-4"><span className="text-indigo-400">vector</span>&lt;<span className="text-indigo-400">int</span>&gt; rating(n);</p>
                          <p className="pl-4"><span className="text-pink-500">for</span> (<span className="text-indigo-400">int</span> i = <span className="text-orange-400">0</span>; i &lt; n; i++) cin <span className="text-pink-500">&gt;&gt;</span> rating[i];</p>
                          <br/>
                          <p className="pl-4"><span className="text-slate-500">// Dynamic Programming solver for optimal streaks</span></p>
                          <p className="pl-4"><span className="text-indigo-400">vector</span>&lt;<span className="text-indigo-400">int</span>&gt; dp(n + <span className="text-orange-400">1</span>, <span className="text-orange-400">0</span>);</p>
                          <p className="pl-4"><span className="text-pink-500">for</span> (<span className="text-indigo-400">int</span> i = <span className="text-orange-400">1</span>; i &lt;= n; i++) {'{'}</p>
                          <p className="pl-8">dp[i] = max(dp[i - <span className="text-orange-400">1</span>], dp[max(<span className="text-orange-400">0</span>, i - k)] + rating[i - <span className="text-orange-400">1</span>]);</p>
                          <p className="pl-4">{'}'}</p>
                          <br/>
                          <p className="pl-4">cout <span className="text-pink-500">&lt;&lt;</span> dp[n] <span className="text-pink-500">&lt;&lt;</span> <span className="text-green-400">"\n"</span>;</p>
                          <p className="pl-4"><span className="text-pink-500">return</span> <span className="text-orange-400">0</span>;</p>
                          <p>{'}'}</p>
                          <br/>
                          <p><span className="text-slate-600">/* Running submission constraints... */</span></p>
                          <p><span className="text-emerald-400">✔ ASTRA AI Optimizer: Matrix exponentiation suggested</span></p>
                          <p><span className="text-emerald-400">✔ [Accepted] Time Complexity: O(N)</span></p>
                          <br/>
                          <p><span className="text-pink-500">#include</span> <span className="text-green-400">&lt;queue&gt;</span></p>
                          <p><span className="text-slate-500">// Initializing revision schedule...</span></p>
                        </motion.div>

                        {/* Blinking Cursor */}
                        <motion.div 
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="absolute bottom-4 left-0 w-1.5 h-3.5 bg-indigo-500"
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* VIEW 2: Features Dashboard (Fades in during Zoom) */}
                  <motion.div
                    style={{ opacity: featuresOpacity }}
                    className="absolute inset-0 bg-[#0b0e17] p-8 flex flex-col justify-between"
                  >
                    {/* Header */}
                    <div className="text-center mb-4 select-none">
                      <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 text-[9px] font-medium mb-1.5">
                        Powerful Features
                      </div>
                      <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200 tracking-tight">
                        Everything You Need to Level Up
                      </h2>
                    </div>

                    {/* 3x2 Responsive Features Grid */}
                    <div className="grid grid-cols-3 gap-4 flex-1">
                      {FEATURES.map((f, i) => (
                        <motion.div 
                          key={i}
                          style={{
                            opacity: cardsTransform[i].opacity,
                            y: cardsTransform[i].y,
                          }}
                          className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-indigo-500/40 hover:bg-slate-900/80 transition-all duration-300 shadow-lg group relative overflow-hidden"
                        >
                          {/* Glow background on hover */}
                          <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/2 transition-colors duration-300 pointer-events-none" />
                          <div className="w-9 h-9 rounded-lg bg-slate-800/80 flex items-center justify-center mb-2.5 border border-slate-700/50 group-hover:border-indigo-500/30 group-hover:shadow-[0_0_12px_rgba(79,70,229,0.15)] transition-all">
                            <f.icon className={`text-base ${f.color}`} />
                          </div>
                          <div>
                            <h3 className="font-bold text-[11px] text-white mb-1 group-hover:text-indigo-300 transition-colors">{f.title}</h3>
                            <p className="text-[9px] text-slate-400 leading-normal">{f.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                </div>
              </div>

              {/* BACK: Sleek Metallic Lid Cover with ASTRA Logo */}
              <div 
                className="absolute inset-0 bg-gradient-to-tr from-slate-700 via-slate-800 to-slate-700 border-[12px] border-slate-800 rounded-t-3xl shadow-2xl flex flex-col items-center justify-center"
                style={{ 
                  backfaceVisibility: "hidden", 
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-slate-900/40 rounded-2xl flex items-center justify-center border border-slate-700 shadow-xl">
                    <img src="/logo.png" alt="ASTRA" className="w-10 h-10 opacity-90 object-contain" />
                  </div>
                  <span className="text-white font-bold tracking-wider mt-3 text-sm">ASTRA</span>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse mt-2"></div>
                </div>
              </div>
            </motion.div>

            {/* Laptop Base (Flat Bar) */}
            <motion.div 
              style={{
                scale: useTransform(scrollSmooth, [0, 0.18, 0.72, 0.85], [1, 1, 1, 1]),
                opacity: useTransform(scrollSmooth, [0, 0.08, 0.72, 0.85], [0, 1, 1, 0.5])
              }}
              className="absolute bottom-[-16px] w-[860px] h-4 bg-gradient-to-b from-slate-500 via-slate-600 to-slate-800 rounded-b-3xl border-b-[6px] border-slate-700 shadow-[0_20px_40px_rgba(0,0,0,0.6)] flex justify-center z-20"
            >
              {/* Opener notch */}
              <div className="w-20 h-1.5 bg-slate-800/80 rounded-b-md"></div>
            </motion.div>

            {/* Floating Elements (fade out as scroll starts) */}
            <motion.div style={{ opacity: floatCardsOpacity }} animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute -right-12 top-28 bg-[#0d1326]/90 border border-indigo-500/30 p-3 rounded-lg shadow-xl backdrop-blur-sm z-30">
              <div className="flex items-center gap-2 text-xs font-semibold text-green-400"><FaCheckCircle/> Accepted</div>
            </motion.div>
            <motion.div style={{ opacity: floatCardsOpacity }} animate={{ y: [0, 12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute -left-12 bottom-20 bg-[#0d1326]/90 border border-purple-500/30 p-3 rounded-lg shadow-xl backdrop-blur-sm z-30">
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-400"><FaRocket/> Rank Up!</div>
            </motion.div>
          </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Glimpse Showcase */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-800/50 relative z-10">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-12">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-950/50 border border-blue-500/30 text-blue-300 text-xs font-medium mb-4">
            Platform Capabilities
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">A Glimpse Inside ASTRA</h2>
          <p className="text-slate-400 mt-4 max-w-2xl">Discover how our core features work together to supercharge your competitive programming journey.</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Tabs Navigation — active state slides via layoutId, Framer's shared-layout magic */}
          <div className="lg:w-1/3 flex flex-col gap-3">
            {tabData.map((tab) => (
              <motion.div 
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className="relative p-5 rounded-xl cursor-pointer transition-colors border border-transparent overflow-hidden"
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-highlight"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    className="absolute inset-0 bg-indigo-600/20 border border-indigo-500/50 shadow-[0_0_15px_rgba(79,70,229,0.2)] rounded-xl"
                  />
                )}
                <div className="relative flex items-center gap-3 mb-2">
                  <tab.icon className={`text-xl ${activeTab === tab.id ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <h4 className={`font-semibold ${activeTab === tab.id ? 'text-white' : 'text-slate-300'}`}>{tab.title}</h4>
                </div>
                <p className={`relative text-xs pl-8 ${activeTab === tab.id ? 'text-indigo-200' : 'text-slate-500'}`}>{tab.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Tab Content Area */}
          <div className="lg:w-2/3 bg-[#0d1326]/80 border border-slate-800 rounded-2xl p-8 relative overflow-hidden min-h-[400px] flex items-center shadow-2xl">
             <motion.div
               className="absolute top-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500"
               initial={{ width: "0%" }}
               animate={{ width: "100%" }}
               key={activeTab}
               transition={{ duration: 4, ease: "linear" }}
             />
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
                <motion.div initial={{ rotate: -20, opacity: 0 }} whileInView={{ rotate: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 + 0.15, type: "spring" }}>
                  <stat.icon className={`${stat.color} text-xl`} />
                </motion.div>
                <span className="text-2xl font-bold"><Counter value={stat.val} /></span>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden z-10">
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.08, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none"
        />
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