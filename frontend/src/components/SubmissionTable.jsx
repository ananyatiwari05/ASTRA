import React from 'react';

/**
 * SubmissionTable component
 * @param {Object} props
 * @param {Array} props.submissions - List of submissions, each with a problem and verdict
 * @param {boolean} props.isLoading - Loading state flag
 */
export default function SubmissionTable({ submissions, isLoading }) {
  if (isLoading) {
    return (
      <div className="p-4 border border-gray-700 rounded bg-gray-900 text-gray-400">
        Loading submissions...
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="p-4 border border-gray-700 rounded bg-gray-900 text-gray-400">
        No recent submissions to show.
      </div>
    );
  }

  return (
    <div className="border border-gray-700 rounded bg-gray-900 text-white overflow-hidden">
      <div className="p-3 border-b border-gray-700 bg-gray-850">
        <h3 className="font-bold text-lg">Recent Submissions</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
            <tr>
              <th className="p-3">Time</th>
              <th className="p-3">Problem</th>
              <th className="p-3">Verdict</th>
              <th className="p-3">Language</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {submissions.map((sub, idx) => (
              <tr key={idx} className="hover:bg-gray-800/50">
                <td className="p-3 text-gray-400">
                  {sub?.time || '-'}
                </td>
                <td className="p-3 font-medium">
                  {sub?.problemName || 'Unknown Problem'}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      sub?.verdict === 'OK' || sub?.verdict === 'Accepted'
                        ? 'bg-green-900/30 text-green-400 border border-green-800'
                        : sub?.verdict?.includes('Wrong') ||
                          sub?.verdict?.includes('Runtime') ||
                          sub?.verdict?.includes('Error')
                        ? 'bg-red-900/30 text-red-400 border border-red-800'
                        : sub?.verdict?.includes('Time')
                        ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800'
                        : 'bg-gray-800 text-gray-300 border border-gray-700'
                    }`}
                  >
                    {sub?.verdict || 'UNKNOWN'}
                  </span>
                </td>
                <td className="p-3 text-gray-400">
                  {sub?.language || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
