import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

import { topicStats } from '../../data/analyticsData';

export default function TopicPerformanceChart() {
  return (
    <div className="bg-[#030814] border border-cyan-950 rounded-xl p-5">
      <h2 className="text-xs font-mono tracking-wider uppercase text-cyan-400 mb-4">
        Topic Performance
      </h2>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topicStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="topic" />
            <YAxis />
            <Tooltip />

            <Bar
              dataKey="solved"
              fill="#22d3ee"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}