import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

import { topicStats } from '../../data/analyticsData';

export default function TopicRadarChart() {
  return (
    <div className="bg-[#030814] border border-cyan-950 rounded-xl p-5">
      <h2 className="text-xs font-mono tracking-wider uppercase text-cyan-400 mb-4">
        Topic Strength Radar
      </h2>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={topicStats}>
            <PolarGrid />
            <PolarAngleAxis dataKey="topic" />
            <PolarRadiusAxis />

            <Radar
              name="Score"
              dataKey="score"
              stroke="#00D4FF"
              fill="#00D4FF"
              fillOpacity={0.15}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
