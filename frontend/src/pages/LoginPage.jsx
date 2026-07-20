import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { API_BASE_URL } from '../api/client';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ShieldCheck } from 'lucide-react';

const AnimatedLaptop = ({ focusedField, isLogin }) => {
  return (
    <div className="relative w-56 md:w-72 h-40 md:h-52 mx-auto perspective-1000 z-10">
      {/* Laptop Screen */}
      <motion.div 
        className="w-full h-36 md:h-48 bg-gray-950 border-[6px] md:border-[8px] border-gray-800 rounded-t-xl relative overflow-hidden flex items-center justify-center shadow-2xl"
        animate={{ 
          rotateX: focusedField === 'password' ? -5 : 0,
          boxShadow: focusedField !== 'idle' ? "0 20px 25px -5px rgba(59, 130, 246, 0.3)" : "0 20px 25px -5px rgba(0, 0, 0, 0.5)"
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{ transformOrigin: "bottom" }}
      >
         {/* Screen glow effect based on focus */}
         <motion.div 
            className="absolute inset-0 bg-blue-500/10 pointer-events-none"
            animate={{ opacity: focusedField !== 'idle' ? 1 : 0 }}
         />
         
         <AnimatePresence mode="wait">
            {focusedField === 'idle' && (
                <motion.div key="idle" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col items-center">
                  <img src="/logo.png" alt="ASTRA Logo" className="w-16 h-auto md:w-20 mb-2 md:mb-3 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                  <span className="text-blue-500 font-bold text-xl md:text-2xl lo">
                    {isLogin ? 'ASTRA' : 'JOIN ASTRA'}
                  </span>
                </motion.div>
            )}
            {focusedField === 'email' && (
                <motion.div key="email" initial={{y: 20, opacity:0}} animate={{y:0, opacity:1}} exit={{y:-20, opacity:0}}>
                  <Mail className="w-16 h-16 md:w-20 md:h-20 text-blue-400" />
                </motion.div>
            )}
            {focusedField === 'password' && (
                <motion.div key="password" initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.8, opacity:0}}>
                  <Lock className="w-16 h-16 md:w-20 md:h-20 text-red-400" />
                </motion.div>
            )}
            {focusedField === 'confirmPassword' && (
                <motion.div key="confirmPassword" initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.8, opacity:0}}>
                  <div className="relative">
                    <Lock className="w-16 h-16 md:w-20 md:h-20 text-orange-400" />
                    <motion.div className="absolute -bottom-2 -right-2 md:-bottom-3 md:-right-3 text-green-400 bg-gray-900 rounded-full" initial={{scale:0}} animate={{scale:1}} transition={{delay:0.2}}>
                      <ShieldCheck size={28} />
                    </motion.div>
                  </div>
                </motion.div>
            )}
            {focusedField === 'google' && (
                <motion.div key="google" initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.8, opacity:0}}>
                  <FcGoogle size={64} />
                </motion.div>
            )}
            {focusedField === 'github' && (
                <motion.div key="github" initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.8, opacity:0}}>
                  <FaGithub size={64} color="white" />
                </motion.div>
            )}
            {focusedField === 'name' && (
                <motion.div key="name" initial={{y: 20, opacity:0}} animate={{y:0, opacity:1}} exit={{y:-20, opacity:0}}>
                  <User className="w-16 h-16 md:w-20 md:h-20 text-green-400" />
                </motion.div>
            )}
         </AnimatePresence>
      </motion.div>
      {/* Laptop Base */}
      <div className="w-[120%] -ml-[10%] h-4 bg-gradient-to-b from-gray-700 to-gray-800 rounded-b-xl rounded-t-sm shadow-[0_15px_30px_-5px_rgba(0,0,0,0.8)] relative z-20 flex justify-center border-t border-gray-600">
        <div className="w-12 h-1 bg-gray-500 rounded-b-md mt-[1px]"></div>
      </div>
    </div>
  )
}

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('idle');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/profile');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/auth/login', {
        email,
        password,
      });

      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('userId', res.data.user.id);
      navigate('/profile');
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/register', {
        email,
        password,
      });
      localStorage.setItem('userId', res.data.user.id);
      localStorage.setItem('token', res.data.access_token);
      navigate('/profile');
    } catch (err) {
      alert(err?.res?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const handleGithubLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/github`;
  };

  return (
    <div className="h-screen w-full relative overflow-hidden bg-gray-950 flex flex-col md:flex-row items-center justify-center px-4 md:px-12 lg:px-24 gap-6 md:gap-12 lg:gap-24 font-sans text-gray-100">
      
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-900/20 blur-[120px]"
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[100px]"
          animate={{ x: [0, -40, 0], y: [0, -50, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Left side: Animated Graphic */}
      <div className="hidden md:flex flex-col items-center justify-center relative z-10 w-full max-w-sm">
         <h1 className="text-4xl lg:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-300 mb-6 text-center leading-tight">
            Elevate Your <br/> DSA Journey
         </h1>
         <p className="text-gray-400 text-center mb-12 max-w-xs leading-relaxed">
            Experience a new standard of performance and collaboration with ASTRA.
         </p>
         <AnimatedLaptop focusedField={focusedField} isLogin={isLogin} />
      </div>

      {/* Mobile Laptop (Optional, hides to save space or scales down) */}
      <div className="md:hidden mt-4 relative z-10 scale-75 transform origin-bottom">
         <AnimatedLaptop focusedField={focusedField} isLogin={isLogin} />
      </div>

      {/* Right side: Form */}
      <motion.div 
        className="w-full max-w-[400px] relative z-10 shrink-0"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] p-6 md:p-8 relative overflow-hidden">
          
          <div className="text-center mb-6 relative z-10">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-400 mt-1.5 text-xs md:text-sm font-medium">
              {isLogin
                ? 'Log in to continue your ASTRA journey'
                : 'Join ASTRA and track your progress'}
            </p>
          </div>

          <form className="space-y-4 relative z-10" onSubmit={isLogin ? handleLogin : handleSignup}>
            
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField('idle')}
                  className="w-full px-4 py-3 bg-gray-950/50 border border-gray-700/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder-gray-600"
                />
              </motion.div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-gray-950/50 border border-gray-700/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder-gray-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('idle')}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex justify-between">
                <span>Password</span>
                {isLogin && (
                  <button type="button" className="text-blue-400 hover:text-blue-300 capitalize tracking-normal font-medium">
                    Forgot?
                  </button>
                )}
              </label>
              <input
                type="password"
                required
                placeholder={isLogin ? "Enter your password" : "Create a password"}
                className="w-full px-4 py-3 bg-gray-950/50 border border-gray-700/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder-gray-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('idle')}
              />
            </div>

            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Confirm password"
                  className="w-full px-4 py-3 bg-gray-950/50 border border-gray-700/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder-gray-600"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField('idle')}
                />
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="flex items-center my-6 relative z-10">
            <div className="flex-1 border-t border-gray-700/50"></div>
            <span className="px-4 text-gray-500 text-[10px] font-bold tracking-widest uppercase">Or</span>
            <div className="flex-1 border-t border-gray-700/50"></div>
          </div>

          <div className="space-y-2.5 relative z-10 flex flex-col md:flex-row md:space-y-0 md:gap-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              onMouseEnter={() => setFocusedField('google')}
              onMouseLeave={() => setFocusedField('idle')}
              className="flex-1 py-3 bg-gray-900/50 hover:bg-gray-800 text-gray-200 rounded-xl text-sm font-medium border border-gray-700/50 hover:border-gray-600 transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              <div className="bg-white p-0.5 rounded-full group-hover:scale-110 transition-transform">
                 <FcGoogle size={16} />
              </div>
              Google
            </button>
            <button
              type="button"
              onClick={handleGithubLogin}
              onMouseEnter={() => setFocusedField('github')}
              onMouseLeave={() => setFocusedField('idle')}
              className="flex-1 py-3 bg-gray-900/50 hover:bg-gray-800 text-gray-200 rounded-xl text-sm font-medium border border-gray-700/50 hover:border-gray-600 transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              <div className="group-hover:scale-110 transition-transform">
                <FaGithub size={18} />
              </div>
              GitHub
            </button>
          </div>

          <div className="text-center mt-6 relative z-10">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setFocusedField('idle');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-gray-400 text-xs md:text-sm hover:text-white transition-colors"
            >
              {isLogin ? (
                <>Don't have an account? <span className="text-blue-400 font-semibold ml-1">Sign Up</span></>
              ) : (
                <>Already have an account? <span className="text-blue-400 font-semibold ml-1">Log In</span></>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginPage;