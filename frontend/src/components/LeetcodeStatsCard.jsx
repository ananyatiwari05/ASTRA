

export default function LeetcodeStatsCard({ user }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 text-white">
      <h2 className="text-lg font-bold mb-4">
        LeetCode Statistics
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-400">Easy</p>
          <p className="text-2xl font-bold">
            {user?.easySolved || 0}
          </p>
        </div>

        <div>
          <p className="text-gray-400">Medium</p>
          <p className="text-2xl font-bold">
            {user?.mediumSolved || 0}
          </p>
        </div>

        <div>
          <p className="text-gray-400">Hard</p>
          <p className="text-2xl font-bold">
            {user?.hardSolved || 0}
          </p>
        </div>

        <div>
          <p className="text-gray-400">Ranking</p>
          <p className="text-2xl font-bold">
            {user?.ranking || 'N/A'}
          </p>
        </div>

        <div>
          <p className="text-gray-400">Reputation</p>
          <p className="text-2xl font-bold">
            {user?.reputation || 0}
          </p>
        </div>
      </div>
    </div>
  );
}