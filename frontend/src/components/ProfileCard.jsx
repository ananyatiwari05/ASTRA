import React from 'react';

/**
 * ProfileCard component
 * @param {Object} props
 * @param {Object} props.user - User information containing handle
 * @param {boolean} props.isLoading - Loading state flag
 * @param {string} props.platform - Selected platform
 */
export default function ProfileCard({ user, platform, isLoading }) {
  if (isLoading) {
    return (
      <div className="p-4 border border-gray-700 rounded bg-gray-900 text-gray-400">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 border border-gray-700 rounded bg-gray-900 text-gray-400">
        No profile loaded. Use Navbar to search.
      </div>
    );
  }

  return (
    <div className="p-4 border border-gray-700 rounded bg-gray-900 text-white flex items-center space-x-4">
      {/* Avatar placeholder */}
      <div className="w-12 h-12 rounded-full bg-cyan-900/30 border border-cyan-800 flex items-center justify-center font-bold text-lg text-cyan-400 font-mono">
        {(user?.handle || user?.username || 'NA').substring(0, 2).toUpperCase()}
      </div>
      <div>
        <h3 className="font-bold text-lg leading-tight">
          {user?.handle || user?.username || 'Unknown User'}
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          {platform?.toUpperCase()} Platform
        </p>
        <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] bg-green-950/40 text-green-400 border border-green-900/50 font-medium">
          Active Sync
        </span>
      </div>
    </div>
  );
}
