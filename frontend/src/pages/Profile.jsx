import React, {
  useEffect,
  useState,
} from 'react';

import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cfHandle: '',
    ccHandle: '',
    lcHandle: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
  try {
    const userId = localStorage.getItem('userId');

    const response = await axios.get(
      `http://localhost:3000/users/${userId}`
    );

    const user = response.data;

    setFormData({
      name: user.name || '',
      email: user.email || '',
      cfHandle: user.cfHandle || '',
      ccHandle: user.ccHandle || '',
      lcHandle: user.lcHandle || '',
    });

  } catch (err) {
    console.error(err);

    navigate('/login');
  }

  finally {
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
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      console.log('USER ID =', userId);
      console.log('TOKEN =', localStorage.getItem('token'));
      await axios.patch(
        `http://localhost:3000/users/${userId}/handles`,
        {
          cfHandle: formData.cfHandle,
          ccHandle: formData.ccHandle,
          lcHandle: formData.lcHandle,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert('Handles Saved');
    } catch (err) {
      console.error(err.response?.data);
      console.error(err);

      alert(
        err.response?.data?.message ||
        'Failed to save handles'
      );
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

        <main className="p-6">

          <div className="bg-gray-900 rounded-xl p-6 mb-6">
            <h1 className="text-3xl font-bold">
              {formData.name}
            </h1>

            <p className="text-gray-400 mt-2">
              {formData.email}
            </p>
            <button
              onClick={handleLogout}
              className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 space-y-4">

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

          </div>
        </main>
      </div>
    </div>
  );
}