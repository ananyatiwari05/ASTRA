import StatCard from './StatCard';
import { stats } from '../../data/analyticsData';

export default function StatsOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard title="Total Solved" value={stats.solved} />
      <StatCard title="Accuracy" value={`${stats.accuracy}%`} />
      <StatCard title="Weak Topics" value={stats.weakTopics} />
      <StatCard title="Current Streak" value={`${stats.streak} Days`} />
    </div>
  );
}
