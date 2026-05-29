import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

/**
 * RatingGraph component
 * @param {Object} props
 * @param {Array} props.history - List of rating changes (e.g. { contestId, rating, time })
 * @param {boolean} props.isLoading - Loading state flag
 */
export default function RatingGraph({ history, isLoading }) {
  if (isLoading) {
    return (
      <div className="p-4 border border-gray-700 rounded bg-gray-900 text-gray-400 h-80 flex items-center justify-center">
        Loading rating graph...
      </div>
    );
  }

  // Format date labels from Unix timestamps (in seconds)
  const chartData = history ? history.map((item) => ({
    ...item,
    name: `Contest ${item.contestId}`,
    date: new Date(item.time * 1000).toLocaleDateString(undefined, {
      month: 'short',
      year: '2-digit'
    }),
  })) : [];

  return (
    <div className="p-4 border border-gray-700 rounded bg-gray-900 text-white h-80 flex flex-col">
      <div className="mb-4">
        <h3 className="text-xl font-bold">Rating History</h3>
        <p className="text-xs text-gray-400">Codeforces rating progress</p>
      </div>

      <div className="flex-1 w-full min-h-0 bg-gray-950/40 p-2 rounded border border-gray-805">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis 
                dataKey="date" 
                stroke="#666" 
                fontSize={10} 
                tickLine={false}
              />
              <YAxis 
                stroke="#666" 
                fontSize={10} 
                tickLine={false}
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111',
                  borderColor: '#444',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '12px'
                }}
                labelClassName="font-bold text-cyan-400"
              />
              <Line
                type="monotone"
                dataKey="rating"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ fill: '#06b6d4', r: 3 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-gray-500">
            No rating history data available
          </div>
        )}
      </div>
    </div>
  );
}
