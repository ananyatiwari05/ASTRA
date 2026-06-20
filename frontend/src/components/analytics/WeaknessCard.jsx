export default function WeaknessCard({ topic, mastery }) {
  return (
    <div className="bg-[#050B18] border border-cyan-950 rounded-xl p-4 hover:border-cyan-900 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-mono tracking-wider uppercase text-cyan-400">{topic}</h3>
        <span className="text-red-400 font-bold">{mastery}%</span>
      </div>

      <div className="w-full bg-[#0B1324] rounded-full h-2 overflow-hidden">
        <div
          className="bg-red-500 h-full transition-all duration-500"
          style={{ width: `${mastery}%` }}
        />
      </div>

      <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider">
        Mastery Score • {mastery}%
      </p>
    </div>
  );
}
