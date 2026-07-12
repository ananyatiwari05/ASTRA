import React from 'react';
import { motion } from 'framer-motion';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

export default function RatingGraph({
  history,
  isLoading,
}) {
  if (isLoading) {
    return (
      <div className="p-6 border border-slate-800/80 rounded-xl bg-slate-900/40 text-slate-400 flex items-center justify-center h-96">
        <div className="flex items-center gap-3">
          <span className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></span>
          Loading Graph...
        </div>
      </div>
    );
  }

  const chartData =
  history.map((item) => ({
    contest: item.contestName,
    rating: Number(
      item.ratingAfter
    ),
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0b0f19]/90 border border-slate-700 p-3 rounded-lg shadow-xl backdrop-blur-md">
          <p className="text-slate-300 text-xs mb-1 font-semibold">{label}</p>
          <p className="text-indigo-400 font-bold">
            Rating: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.005 }}
      className="p-6 border border-slate-800/80 rounded-xl bg-slate-900/40 shadow-lg backdrop-blur-sm relative h-96"
    >
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
          Rating History
        </h2>
      </div>

      <ResponsiveContainer
        width="100%"
        height="85%"
      >
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="contest"
            hide
          />

          <YAxis 
            stroke="#475569" 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            tickLine={false} 
            axisLine={false}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '4 4' }} />

          <Line
            type="monotone"
            dataKey="rating"
            stroke="#818cf8"
            strokeWidth={3}
            dot={{ r: 3, fill: '#818cf8', strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#4f46e5', stroke: '#c7d2fe', strokeWidth: 2 }}
          />

        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}