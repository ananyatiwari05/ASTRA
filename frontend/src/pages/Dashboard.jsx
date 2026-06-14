import React, { useState } from 'react';
import axios from 'axios';

import Sidebar from '../components/Sidebar';
<<<<<<< HEAD
=======
import Navbar from '../components/Navbar';

>>>>>>> f00b600 (fix parameters passing from backend to frontend)
import ProfileCard from '../components/ProfileCard';
import RatingCard from '../components/RatingCard';
import RatingGraph from '../components/RatingGraph';
import SubmissionTable from '../components/SubmissionTable';

export default function Dashboard() {
<<<<<<< HEAD
  const [isLoading, setIsLoading] = useState(true);
=======
  const [platform, setPlatform] = useState('codeforces');
  const [handleInput, setHandleInput] = useState('');

  const [isLoading, setIsLoading] = useState(false);
>>>>>>> f00b600 (fix parameters passing from backend to frontend)

  const [userData, setUserData] = useState(null);
  const [ratingHistory, setRatingHistory] = useState([]);
  const [submissionsData, setSubmissionsData] = useState([]);

  const clearData = () => {
    setUserData(null);
    setSubmissionsData([]);
    setRatingHistory([]);
  };

  const handleImport = async (e) => {
    e.preventDefault();

    if (!handleInput.trim()) return;

<<<<<<< HEAD
    const endpointMap = {
      codeforces: 'cf',
      leetcode: 'lc',
      codechef: 'cc',
    };
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
=======
>>>>>>> f00b600 (fix parameters passing from backend to frontend)
    try {
      setIsLoading(true);
      clearData();

<<<<<<< HEAD
      const userId =
        localStorage.getItem('userId');

      const response =
        await axios.get(
          `http://localhost:3000/dashboard/${userId}`
        );
=======
      const endpointMap = {
        codeforces: 'cf',
        leetcode: 'lc',
        codechef: 'cc',
      };

      const res = await axios.get(
        `http://localhost:3000/${endpointMap[platform]}/${handleInput.trim()}`
      );

      const data = res.data;
>>>>>>> f00b600 (fix parameters passing from backend to frontend)

      console.log(data);

<<<<<<< HEAD
      setUserData(data.user);
      setSubmissionsData(data.submissions || []);
      setRatingHistory(data.ratings || []);
    } catch (error) {
      console.error(error);
      setUserData(null);
      setSubmissionsData([]);
      setRatingHistory([]);
      alert('User not found');
      console.log('Dashboard Data:', data);

      setUserData({
        ...(data.user || {}),
        ...(data.profile || {}),
      });

      setRatingHistory(
        data.ratingHistory || []
      );

      setSubmissionsData(
        data.submissions || []
      );

    } catch (err) {
      console.error(err);
    } finally {
=======
      if (platform === 'codeforces') {
        setUserData(data.user || null);

        setSubmissionsData(
          data.submissions || []
        );

        setRatingHistory(
          data.ratingHistory ||
          data.ratings ||
          []
        );
      }

      else if (platform === 'leetcode') {
        setUserData(
          data.user ||
          data.profile ||
          data
        );

        setSubmissionsData(
          data.submissions || []
        );

        setRatingHistory([]);
      }

      else if (platform === 'codechef') {
        setUserData(
          data.user ||
          data.profile ||
          data
        );

        setSubmissionsData(
          data.submissions || []
        );

        setRatingHistory(
          data.ratingHistory ||
          data.ratings ||
          []
        );
      }
    }

    catch (err) {
      console.error(err);

      clearData();

      alert('Failed to fetch user data');
    }

    finally {
>>>>>>> f00b600 (fix parameters passing from backend to frontend)
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
<<<<<<< HEAD
      <Sidebar />

      <div className="flex-1 p-6 space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <ProfileCard
            user={userData}
            isLoading={isLoading}
          />

          <RatingCard
            user={userData}
            isLoading={isLoading}
          />

        </div>

        <RatingGraph
          history={ratingHistory}
          isLoading={isLoading}
        />

        <SubmissionTable
          submissions={submissionsData}
          isLoading={isLoading}
        />
=======

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Navbar
          platform={platform}
          handleInput={handleInput}
          onHandleInputChange={setHandleInput}
          onImportSubmit={handleImport}
          isLoading={isLoading}
        />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">

          <div className="flex gap-3">

            <button
              onClick={() => {
                setPlatform('codeforces');
                clearData();
              }}
              className={`px-4 py-2 rounded ${platform === 'codeforces'
                  ? 'bg-cyan-600'
                  : 'bg-gray-800'
                }`}
            >
              Codeforces
            </button>
>>>>>>> f00b600 (fix parameters passing from backend to frontend)

            <button
              onClick={() => {
                setPlatform('leetcode');
                clearData();
              }}
              className={`px-4 py-2 rounded ${platform === 'leetcode'
                  ? 'bg-cyan-600'
                  : 'bg-gray-800'
                }`}
            >
              LeetCode
            </button>

            <button
              onClick={() => {
                setPlatform('codechef');
                clearData();
              }}
              className={`px-4 py-2 rounded ${platform === 'codechef'
                  ? 'bg-cyan-600'
                  : 'bg-gray-800'
                }`}
            >
              CodeChef
            </button>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <ProfileCard
              user={userData}
              platform={platform}
              isLoading={isLoading}
            />

            {platform === 'leetcode' ? (
              <LeetcodeStatsCard
                user={userData}
              />
            ) : (
              <RatingCard
                user={userData}
                isLoading={isLoading}
              />
            )}

          </div>

          {platform !== 'leetcode' && (
            <RatingGraph
              history={ratingHistory}
              isLoading={isLoading}
            />
          )}

          <SubmissionTable
            submissions={submissionsData}
            isLoading={isLoading}
          />

        </main>

      </div>

    </div>
  );
}