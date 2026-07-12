import React from "react";
import CountdownTimer from "./CountdownTimer";

const platformIcons = {
  Codeforces: "https://cdn.simpleicons.org/codeforces",
  LeetCode: "https://cdn.simpleicons.org/leetcode",
  CodeChef: "https://cdn.simpleicons.org/codechef",
};

export default function ContestCard({ contest }) {
  const addToGoogleCalendar = () => {
    const start = new Date(contest.startTime);

    const end = new Date(
      start.getTime() + contest.durationHours * 60 * 60 * 1000,
    );

    const formatDate = (date) =>
      date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const calendarUrl =
      `https://calendar.google.com/calendar/render?action=TEMPLATE` +
      `&text=${encodeURIComponent(contest.name)}` +
      `&dates=${formatDate(start)}/${formatDate(end)}` +
      `&details=${encodeURIComponent(
        `${contest.platform} Programming Contest`,
      )}`;

    window.open(calendarUrl, "_blank");
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 hover:border-indigo-500/40 hover:bg-slate-900/80 transition-all duration-300 shadow-lg relative group overflow-hidden">
      <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-colors duration-300 pointer-events-none" />
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 bg-slate-800/80 rounded flex items-center justify-center border border-slate-700/50">
              <img
                src={platformIcons[contest.platform]}
                alt={contest.platform}
                className="w-3.5 h-3.5 opacity-90"
              />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
              {contest.platform}
            </p>
          </div>

          <h2 className="text-lg font-bold text-white leading-tight group-hover:text-indigo-100 transition-colors">
            {contest.name}
          </h2>
        </div>

        <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase">
          Upcoming
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 relative z-10 bg-slate-900/50 rounded-lg p-3 border border-slate-800/50">
        <div>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">Starts In</p>
          <div className="text-sm font-mono text-purple-300">
            <CountdownTimer startTime={contest.startTime} />
          </div>
        </div>

        <div>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">Start Time</p>
          <p className="text-sm font-medium text-slate-200">
            {new Date(contest.startTime).toLocaleString([], {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>

        <div>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">Duration</p>
          <p className="text-sm font-medium text-slate-200">{contest.durationHours}h</p>
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-3 relative z-10">
        <button
          onClick={addToGoogleCalendar}
          className="px-4 py-2 text-xs rounded-md border border-slate-700/50 text-slate-300 font-semibold hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-all"
        >
          Add to Calendar
        </button>

        <a
          href={contest.url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 text-xs rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-all shadow-[0_0_10px_rgba(79,70,229,0.3)] hover:shadow-[0_0_15px_rgba(79,70,229,0.5)] flex items-center gap-1.5"
        >
          View Contest
        </a>
      </div>
    </div>
  );
}
