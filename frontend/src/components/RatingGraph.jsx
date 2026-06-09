import React from 'react';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function RatingGraph({
  history,
  isLoading,
}) {
  if (isLoading) {
    return <div>Loading graph...</div>;
  }

  const chartData =
  history.map((item) => ({
    contest: item.contestName,
    rating: Number(
      item.ratingAfter
    ),
  }));

  console.log(history);
console.log(chartData);

  return (
    <div className="p-6 border border-gray-700 rounded bg-gray-900 h-96">

      <h2 className="text-2xl font-bold mb-4">
        Rating History
      </h2>

      <ResponsiveContainer
        width="100%"
        height="85%"
      >
        <LineChart data={chartData}>

          <XAxis
            dataKey="contest"
            hide
          />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="rating"
            stroke="#06b6d4"
            dot={false}
          />

        </LineChart>
      </ResponsiveContainer>

    </div>
  );
}