export default function StatCard({ title, value, icon }) {
  return (
    <div className="bg-[#030814] border border-cyan-950 rounded-xl p-6 hover:border-cyan-900 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-mono tracking-wider uppercase text-cyan-400">
          {title}
        </h3>

        {icon && <span className="text-lg">{icon}</span>}
      </div>

      <p className="text-4xl font-black text-white tracking-tight">
        {value}
      </p>
    </div>
  );
}