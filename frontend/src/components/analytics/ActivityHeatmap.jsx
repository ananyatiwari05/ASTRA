

import { heatmapData } from '../../data/analyticsData';

export default function ActivityHeatmap() {
  return (
    <div className="bg-[#030814] border border-cyan-950 rounded-xl p-5">
      <h2 className="text-xs font-mono tracking-wider uppercase text-cyan-400 mb-4">
        Activity Heatmap
      </h2>

      <div className="overflow-x-auto">
        <div className="flex flex-col gap-1 min-w-max">
          {heatmapData.map((week, rowIndex) => (
            <div key={rowIndex} className="flex gap-1">
              {[...week, 0, 0, 0, 0].map((value, colIndex) => {
                const isToday = rowIndex === 1 && colIndex === week.length - 1;

                return (
                  <div
                    key={colIndex}
                    className={`h-4 w-4 rounded-sm ${
                      value === 0
                        ? 'bg-zinc-800'
                        : value === 1
                        ? 'bg-cyan-950'
                        : value === 2
                        ? 'bg-cyan-700'
                        : value === 3
                        ? 'bg-cyan-500'
                        : 'bg-cyan-300'
                    } ${isToday ? 'ring-2 ring-cyan-400' : ''}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}