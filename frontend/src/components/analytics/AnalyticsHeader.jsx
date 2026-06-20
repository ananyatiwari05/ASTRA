export default function AnalyticsHeader() {
  return (
    <div className="border-b border-gray-900 pb-6">
      <div className="flex items-center gap-2 mb-2 font-mono text-xs text-cyan-400 tracking-wider">
        <span>MODULES</span>
        <span>/</span>
        <span className="text-gray-500">ANALYTICS</span>
      </div>

      <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white uppercase">
        Analytics
      </h1>

      <p className="text-sm text-gray-400 mt-1">
        Track your coding growth and identify areas that need improvement.
      </p>
    </div>
  );
}