import WeaknessCard from './WeaknessCard';
import { weaknesses } from '../../data/analyticsData';

export default function WeaknessAnalysis() {
  return (
    <div className="bg-[#030814] border border-cyan-950 rounded-xl p-5">
      <h2 className="text-xs font-mono tracking-wider uppercase text-cyan-400 mb-4">
        Weak Topics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {weaknesses.map((item) => (
          <WeaknessCard
            key={item.topic}
            topic={item.topic}
            mastery={item.mastery}
          />
        ))}
      </div>
    </div>
  );
}
