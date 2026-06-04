import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function Profile() {
  const [formData, setFormData] = useState({
    name: 'Ananya Tiwari',
    email: 'ananya@gmail.com',
    cfHandle: '',
    ccHandle: '',
    lcHandle: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      // TODO:
      // PATCH /users/me/handles

      console.log(formData);

      alert('Profile updated');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 p-6 bg-gray-950/20">
          <div className="max-w-3xl mx-auto">

            {/* Header */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-cyan-600 flex items-center justify-center text-3xl font-bold">
                  {formData.name[0]}
                </div>

                <div>
                  <h1 className="text-2xl font-bold">
                    {formData.name}
                  </h1>

                  <p className="text-gray-400">
                    {formData.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-6">
                Coding Profiles
              </h2>

              <div className="space-y-5">

                <div>
                  <label className="block mb-2 text-gray-300">
                    Codeforces Handle
                  </label>

                  <input
                    type="text"
                    name="cfHandle"
                    value={formData.cfHandle}
                    onChange={handleChange}
                    placeholder="tourist"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-gray-300">
                    CodeChef Handle
                  </label>

                  <input
                    type="text"
                    name="ccHandle"
                    value={formData.ccHandle}
                    onChange={handleChange}
                    placeholder="username"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-gray-300">
                    LeetCode Handle
                  </label>

                  <input
                    type="text"
                    name="lcHandle"
                    value={formData.lcHandle}
                    onChange={handleChange}
                    placeholder="username"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <button
                  onClick={handleSave}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 transition py-3 rounded-lg font-semibold"
                >
                  Save Handles
                </button>

              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}