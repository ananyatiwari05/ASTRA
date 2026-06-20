import Sidebar from '../components/Sidebar';
import AnalyticsHeader from '../components/analytics/AnalyticsHeader';
import StatsOverview from '../components/analytics/StatsOverview';
import ProgressChart from '../components/analytics/ProgressChart';
import TopicPerformanceChart from "../components/analytics/TopicPerformanceChart";
import WeaknessAnalysis from '../components/analytics/WeaknessAnalysis';
import TopicRadarChart from '../components/analytics/TopicRadarChart';
import ActivityHeatmap from '../components/analytics/ActivityHeatmap';
import InsightsPanel from '../components/analytics/InsightsPanel';

export default function Analytics() {
  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar />

      <main className="flex-1 px-8 py-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <AnalyticsHeader />
          <StatsOverview />
          <ProgressChart />
          <TopicPerformanceChart />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <WeaknessAnalysis />
            <TopicRadarChart />
          </div>

          <ActivityHeatmap />
          <InsightsPanel />
        </div>
      </main>
    </div>
  );
}