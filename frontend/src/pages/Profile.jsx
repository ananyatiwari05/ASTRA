import React, {
  useEffect,
  useState,
} from 'react';

import {
  fetchUserProfile,
  updateUserHandles,
  updateSheetHandles,
  syncCodeforces,
  syncA2ZSheet,
  syncTLESheet,
  getUserId,
} from '../api/client';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

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
    a2zEmail: '',
    tleEmail: '',
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
        a2zEmail: user.a2zEmail || '',
        tleEmail: user.TLEliminatorEmail || '',
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

      alert('Handles saved');
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message || 'Failed to save handles',
      );
    }
  };

  const saveSheetHandles = async () => {
    try {
      const userId = getUserId();

      await updateSheetHandles(userId, {
        a2zEmail: formData.a2zEmail,
        dailyEliminatorEmail: formData.tleEmail,
      });

      alert('Sheet emails saved');
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          'Failed to save sheet emails',
      );
    }
  };

  const runSync = async (type) => {
    try {
      setSyncing(type);
      const userId = getUserId();
      let result;

      if (type === 'cf') {
        result = await syncCodeforces(userId);
        setSyncTimes((prev) => ({
          ...prev,
          cfLastSyncedAt: new Date().toISOString(),
        }));
      } else if (type === 'a2z') {
        result = await syncA2ZSheet(userId);
        setSyncTimes((prev) => ({
          ...prev,
          a2zLastSyncedAt: new Date().toISOString(),
        }));
      } else {
        result = await syncTLESheet(userId);
        setSyncTimes((prev) => ({
          ...prev,
          tleLastSyncedAt: new Date().toISOString(),
        }));
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
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="text-white p-10">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="p-6 space-y-6">
          <div className="bg-gray-900 rounded-xl p-6">
            <h1 className="text-3xl font-bold">{formData.name}</h1>
            <p className="text-gray-400 mt-2">{formData.email}</p>
            <button
              onClick={handleLogout}
              className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold">Platform Handles</h2>

            <div>
              <label>Codeforces</label>
              <input
                type="text"
                name="cfHandle"
                value={formData.cfHandle}
                onChange={handleChange}
                className="w-full mt-2 p-3 rounded bg-gray-800"
              />
            </div>

            <div>
              <label>CodeChef</label>
              <input
                type="text"
                name="ccHandle"
                value={formData.ccHandle}
                onChange={handleChange}
                className="w-full mt-2 p-3 rounded bg-gray-800"
              />
            </div>

            <div>
              <label>LeetCode</label>
              <input
                type="text"
                name="lcHandle"
                value={formData.lcHandle}
                onChange={handleChange}
                className="w-full mt-2 p-3 rounded bg-gray-800"
              />
            </div>

            <button
              onClick={saveHandles}
              className="w-full bg-cyan-600 py-3 rounded-lg"
            >
              Save Handles
            </button>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-800">
              <p className="text-sm text-gray-400">
                Last synced: {formatSyncTime(syncTimes.cfLastSyncedAt)}
              </p>
              <button
                onClick={() => runSync('cf')}
                disabled={syncing === 'cf'}
                className="px-4 py-2 rounded bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50"
              >
                {syncing === 'cf' ? 'Syncing...' : 'Sync Codeforces'}
              </button>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold">Sheet Accounts</h2>

            <div>
              <label>A2Z Sheet Email</label>
              <input
                type="email"
                name="a2zEmail"
                value={formData.a2zEmail}
                onChange={handleChange}
                className="w-full mt-2 p-3 rounded bg-gray-800"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label>TLE Eliminator Email</label>
              <input
                type="email"
                name="tleEmail"
                value={formData.tleEmail}
                onChange={handleChange}
                className="w-full mt-2 p-3 rounded bg-gray-800"
                placeholder="your.email@example.com"
              />
            </div>

            <button
              onClick={saveSheetHandles}
              className="w-full bg-cyan-600 py-3 rounded-lg"
            >
              Save Sheet Emails
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-800">
              <div className="space-y-2">
                <p className="text-sm text-gray-400">
                  A2Z last synced:{' '}
                  {formatSyncTime(syncTimes.a2zLastSyncedAt)}
                </p>
                <button
                  onClick={() => runSync('a2z')}
                  disabled={syncing === 'a2z'}
                  className="w-full px-4 py-2 rounded bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50"
                >
                  {syncing === 'a2z' ? 'Syncing...' : 'Sync A2Z'}
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-400">
                  TLE last synced:{' '}
                  {formatSyncTime(syncTimes.tleLastSyncedAt)}
                </p>
                <button
                  onClick={() => runSync('tle')}
                  disabled={syncing === 'tle'}
                  className="w-full px-4 py-2 rounded bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50"
                >
                  {syncing === 'tle' ? 'Syncing...' : 'Sync TLE Eliminator'}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
