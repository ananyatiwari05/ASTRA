import React from 'react';

export default function ProfileCard({
  user,
  platform = 'codeforces',
  isLoading,
})  {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  const currentUser =
  platform === 'codechef'
    ? user?.codechef
    : platform === 'leetcode'
    ? user?.leetcode
    : user?.codeforces;

const handle =
  currentUser?.cfHandle ||
  currentUser?.ccHandle ||
  currentUser?.lcHandle ||
  user?.email ||
  'Unknown User';

  return (
    <div className="p-6 border border-gray-700 rounded bg-gray-900 text-white flex items-center gap-5">

      <div className="w-14 h-14 rounded-full border border-cyan-700 flex items-center justify-center text-cyan-400 font-bold">
        {handle.substring(0, 2).toUpperCase()}
      </div>

      <div>
        <h2 className="text-2xl font-bold">
          {handle}
        </h2>

        <p className="text-gray-400">
          Competitive Programming Profile
        </p>

        <p className="text-green-400 text-sm mt-1">
          Active Sync
        </p>
      </div>

    </div>
  );
}