import { insights } from '../../data/analyticsData';

export default function InsightsPanel() {
  return (
    <div className="bg-[#030814] border border-cyan-950 rounded-xl p-5">
      <h2 className="text-xs font-mono tracking-wider uppercase text-cyan-400 mb-4">
        Performance Insights
      </h2>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 rounded-lg bg-[#050B18] border border-cyan-950"
          >
            <span className="text-green-400">✓</span>
            <p className="text-sm text-gray-300">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}