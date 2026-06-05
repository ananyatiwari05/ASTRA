import React from 'react';

/**
 * Navbar component for the top of the dashboard content area
 * @param {Object} props
 * @param {string} props.platform - Selected platform (codeforces, leetcode, codechef)
 * @param {string} props.handleInput - Current value of the handle input field
 * @param {function} props.onHandleInputChange - Change handler for handle input
 * @param {function} props.onImportSubmit - Submit/import handler
 * @param {boolean} props.isLoading - Flag indicating if import API simulation is loading
 */
export default function Navbar({
  platform = '',
  handleInput = '',
  onHandleInputChange = () => {},
  onImportSubmit = (e) => e.preventDefault(),
  isLoading = false,
})  {
  return (
    <header className="bg-gray-950 border-b border-gray-800 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-white">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-xs text-gray-500">
          Real-time {platform?.toUpperCase()} stats & insights
        </p>
      </div>

      {/* Handle input search bar */}
      <form onSubmit={onImportSubmit} className="flex gap-2 items-center">
        <div className="relative">
          <input
            id="navbar-handle-input"
            type="text"
            value={handleInput}
            onChange={(e) => onHandleInputChange(e.target.value)}
            placeholder={`Enter ${platform} username`}
            className="w-48 sm:w-64 px-3 py-1.5 text-sm border border-gray-800 rounded bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !handleInput.trim()}
          className="px-4 py-1.5 text-sm bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-850 disabled:text-gray-500 text-white font-semibold rounded transition whitespace-nowrap"
        >
          {isLoading ? 'Importing...' : 'Import'}
        </button>
      </form>
    </header>
  );
}
