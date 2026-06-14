import React from 'react';

export default function RatingCard({
  user,
  platform = 'codeforces',
  isLoading,
}) {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  const currentUser =
    platform === 'codechef'
      ? user?.codechef
      : platform === 'leetcode'
      ? user?.leetcode
      : user?.codeforces;

  const currentRating =
    currentUser?.cfCurrentRating;

  const maxRating =
    currentUser?.cfMaxRating;

  return (
    <div className="p-6 border border-gray-700 rounded bg-gray-900">

      <h2 className="text-xl font-bold mb-5">
        Rating Stats
      </h2>

      <div className="grid grid-cols-2 gap-4">

        <div className="bg-black p-4 rounded">
          <p className="text-gray-400">
            Current Rating
          </p>

          <p className="text-3xl text-cyan-400 font-bold">
            {platform === 'leetcode'
              ? currentUser?.easySolved ?? 'N/A'
              : currentRating ?? 'N/A'}
          </p>
        </div>

        <div className="bg-black p-4 rounded">
          <p className="text-gray-400">
            {platform === 'leetcode' ? 'Medium Solved' : 'Max Rating'}
          </p>

          <p className="text-3xl font-bold">
            {platform === 'leetcode'
              ? currentUser?.mediumSolved ?? 'N/A'
              : maxRating ?? 'N/A'}
          </p>
        </div>

      </div>

      <div className="mt-5">
        <span className="text-gray-400">
          Rank:
        </span>

        <span className="ml-3 text-green-400 font-semibold">
          {platform === 'leetcode'
            ? currentUser?.ranking || 'N/A'
            : currentUser?.cfRank || 'Unrated'}
        </span>
      </div>

    </div>
  );
}