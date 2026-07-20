import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  fetchUserProfile,
  updateUserHandles,
  updateSheetHandles,
  syncCodeforces,
  syncA2ZSheet,
  syncTLE31Sheet,
  getUserId,
} from '../api/client';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSyncAlt, FaSignOutAlt, FaCog, FaLink, FaDatabase } from 'react-icons/fa';
import { SiCodeforces, SiLeetcode, SiCodechef } from 'react-icons/si';
import SiteNavbar from '../components/SiteNavbar';
import Footer from '../components/Footer';

function formatSyncTime(value) {
  if (!value) return 'Never synced';
  return new Date(value).toLocaleString();
}

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cfHandle: '',
    ccHandle: '',
    lcHandle: '',
    a2zSheetEmail: '',
    a2zSheetUrl: '',
    tleSheetEmail: '',
    tleSheetUrl: '',
    trackingPreference: 'manual',
  });

  const [syncTimes, setSyncTimes] = useState({
    cfLastSyncedAt: null,
    a2zLastSyncedAt: null,
    tleLastSyncedAt: null,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const userId = getUserId();
      const user = await fetchUserProfile(userId);

      setFormData({
        name: user.email?.split('@')[0] || '',
        email: user.email || '',
        cfHandle: user.cfHandle || '',
        ccHandle: user.ccHandle || '',
        lcHandle: user.lcHandle || '',
        a2zSheetEmail: user.a2zSheetEmail || '',
        a2zSheetUrl: user.a2zSheetUrl || '',
        tleSheetEmail: user.tleSheetEmail || '',
        tleSheetUrl: user.tleSheetUrl || '',
        trackingPreference: user.trackingPreference || 'manual',
      });

      setSyncTimes({
        cfLastSyncedAt: user.cfLastSyncedAt,
        a2zLastSyncedAt: user.a2zLastSyncedAt,
        tleLastSyncedAt: user.tleLastSyncedAt,
      });
    } catch (err) {
      console.error(err);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const saveHandles = async () => {
    try {
      const userId = getUserId();
      await updateUserHandles(userId, {
        cfHandle: formData.cfHandle,
        ccHandle: formData.ccHandle,
        lcHandle: formData.lcHandle,
      });
      alert('Handles saved successfully!');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save handles');
    }
  };

  const saveSheetHandles = async () => {
    try {
      const userId = getUserId();
      await updateSheetHandles(userId, {
        a2zSheetEmail: formData.a2zSheetEmail,
        a2zSheetUrl: formData.a2zSheetUrl,
        tleSheetEmail: formData.tleSheetEmail,
        tleSheetUrl: formData.tleSheetUrl,
        trackingPreference: formData.trackingPreference,
      });
      alert('Preferences saved successfully!');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save preferences');
    }
  };

  const runSync = async (type) => {
    try {
      setSyncing(type);
      const userId = getUserId();
      let result;

      if (type === 'cf') {
        result = await syncCodeforces(userId);
        setSyncTimes((prev) => ({ ...prev, cfLastSyncedAt: new Date().toISOString() }));
      } else if (type === 'a2z') {
        result = await syncA2ZSheet(userId);
        setSyncTimes((prev) => ({ ...prev, a2zLastSyncedAt: new Date().toISOString() }));
      } else {
        result = await syncTLE31Sheet(userId);
        setSyncTimes((prev) => ({ ...prev, tleLastSyncedAt: new Date().toISOString() }));
      }
      alert(result.message || 'Sync completed');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Sync failed');
    } finally {
      setSyncing('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white font-sans overflow-x-hidden relative flex flex-col">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full mix-blend-screen animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen animate-blob animation-delay-4000" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <SiteNavbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 pt-32 pb-20 relative z-10">
        
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-1 shadow-[0_0_30px_rgba(99,102,241,0.4)]">
              <div className="w-full h-full bg-[#0a0f1c] rounded-full flex items-center justify-center">
                <FaUserCircle className="text-6xl text-indigo-400" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">{formData.name || 'User'}</h1>
              <p className="text-slate-400 mt-1">{formData.email}</p>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-6 py-2.5 rounded-xl font-medium transition-colors"
          >
            <FaSignOutAlt />
            Logout
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Platform Handles Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50" />
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center"><FaLink size={20} /></div>
              <h2 className="text-xl font-bold text-white">Platform Handles</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-400 flex items-center gap-2 mb-2"><SiCodeforces className="text-slate-300" /> Codeforces</label>
                <input type="text" name="cfHandle" value={formData.cfHandle} onChange={handleChange} className="w-full bg-[#0a0f1c]/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-600" placeholder="e.g. tourist" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-400 flex items-center gap-2 mb-2"><SiCodechef className="text-slate-300" /> CodeChef</label>
                <input type="text" name="ccHandle" value={formData.ccHandle} onChange={handleChange} className="w-full bg-[#0a0f1c]/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-600" placeholder="e.g. genady" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-400 flex items-center gap-2 mb-2"><SiLeetcode className="text-slate-300" /> LeetCode</label>
                <input type="text" name="lcHandle" value={formData.lcHandle} onChange={handleChange} className="w-full bg-[#0a0f1c]/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-600" placeholder="e.g. leetcode_user" />
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={saveHandles} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-colors shadow-[0_0_20px_rgba(79,70,229,0.3)] mt-2">
                Save Handles
              </motion.button>
            </div>
          </motion.div>

          {/* Sync & Tracking Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-8">
            
            <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden hover:border-emerald-500/50 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center"><FaDatabase size={20} /></div>
                <h2 className="text-xl font-bold text-white">Manual Data Sync</h2>
              </div>
              
              <div className="space-y-4">
                <div className="bg-[#0a0f1c]/60 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-white">Codeforces Sync</h3>
                    <p className="text-xs text-slate-400 mt-1">Last: {formatSyncTime(syncTimes.cfLastSyncedAt)}</p>
                  </div>
                  <button onClick={() => runSync('cf')} disabled={syncing === 'cf'} className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 font-medium">
                    <FaSyncAlt className={syncing === 'cf' ? "animate-spin" : ""} /> {syncing === 'cf' ? 'Syncing...' : 'Sync Now'}
                  </button>
                </div>
                
                <div className="bg-[#0a0f1c]/60 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-white">A2Z Sheet Sync</h3>
                    <p className="text-xs text-slate-400 mt-1">Last: {formatSyncTime(syncTimes.a2zLastSyncedAt)}</p>
                  </div>
                  <button onClick={() => runSync('a2z')} disabled={syncing === 'a2z'} className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 font-medium">
                    <FaSyncAlt className={syncing === 'a2z' ? "animate-spin" : ""} /> {syncing === 'a2z' ? 'Syncing...' : 'Sync Now'}
                  </button>
                </div>

                <div className="bg-[#0a0f1c]/60 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-white">TLE Sheet Sync</h3>
                    <p className="text-xs text-slate-400 mt-1">Last: {formatSyncTime(syncTimes.tleLastSyncedAt)}</p>
                  </div>
                  <button onClick={() => runSync('tle')} disabled={syncing === 'tle'} className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 font-medium">
                    <FaSyncAlt className={syncing === 'tle' ? "animate-spin" : ""} /> {syncing === 'tle' ? 'Syncing...' : 'Sync Now'}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden hover:border-purple-500/50 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center"><FaCog size={20} /></div>
                <h2 className="text-xl font-bold text-white">Tracking Preferences</h2>
              </div>
              
              <div className="space-y-3 mb-6">
                <label className="flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all hover:bg-indigo-900/20 border-indigo-500/50 bg-indigo-500/10">
                  <input type="radio" name="trackingPreference" value="manual" checked={formData.trackingPreference === 'manual'} onChange={handleChange} className="mt-1 accent-indigo-500" />
                  <div>
                    <div className="font-semibold text-white">Manual Tracking (Default)</div>
                    <div className="text-sm text-slate-400 mt-1">Track your progress directly inside ASTRA. Fast, instant, and fully integrated.</div>
                  </div>
                </label>

                <label className="flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all border-slate-800 bg-slate-900/40 opacity-60">
                  <input type="radio" name="trackingPreference" value="sheets" checked={formData.trackingPreference === 'sheets'} onChange={handleChange} disabled className="mt-1" />
                  <div>
                    <div className="font-semibold text-white">Google Sheets Import <span className="text-[10px] bg-indigo-600 px-2 py-0.5 rounded-full ml-2">Coming Soon</span></div>
                    <div className="text-sm text-slate-400 mt-1">Automatically sync progress from external Google Sheets. Currently unavailable.</div>
                  </div>
                </label>
              </div>
              
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={saveSheetHandles} className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-medium py-3 rounded-xl transition-colors mt-2">
                Save Preferences
              </motion.button>
            </div>
            
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
