

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

import { progressTrend } from '../../data/analyticsData';

export default function ProgressChart() {
  return (
    <div className="bg-[#030814] border border-cyan-950 rounded-xl p-6">
      <h2 className="text-xs font-mono tracking-wider uppercase text-cyan-400 mb-4">
        Progress Trend
      </h2>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={progressTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />

            <Line
              type="monotone"
              dataKey="solved"
              stroke="#22d3ee"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}