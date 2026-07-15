import React from "react";
import CountdownTimer from "./CountdownTimer";

const platformStyles = {
  Codeforces: {
    icon: "https://cdn.simpleicons.org/codeforces/3B82F6",
    textClass: "text-blue-400",
    badgeClass: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    iconContainer: "bg-blue-500/10 border-blue-500/30",
    btnClass: "bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]",
    cardHover: "hover:border-blue-500/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.12)]",
    glowBg: "group-hover:bg-blue-500/5",
  },
  LeetCode: {
    icon: "https://cdn.simpleicons.org/leetcode/FFA116",
    textClass: "text-orange-400",
    badgeClass: "bg-orange-500/10 border-orange-500/20 text-orange-400",
    iconContainer: "bg-orange-500/10 border-orange-500/30",
    btnClass: "bg-orange-600/20 text-orange-300 border border-orange-500/30 hover:bg-orange-600/30 shadow-[0_0_15px_rgba(249,115,22,0.1)] hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]",
    cardHover: "hover:border-orange-500/40 hover:shadow-[0_0_20px_rgba(249,115,22,0.12)]",
    glowBg: "group-hover:bg-orange-500/5",
  },
  CodeChef: {
    icon: "https://cdn.simpleicons.org/codechef/10B981",
    textClass: "text-emerald-400",
    badgeClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    iconContainer: "bg-emerald-500/10 border-emerald-500/30",
    btnClass: "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]",
    cardHover: "hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.12)]",
    glowBg: "group-hover:bg-emerald-500/5",
  },
};

export default function ContestCard({ contest }) {
  const styles = platformStyles[contest.platform] || platformStyles.Codeforces;

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
    <div className={`bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 hover:bg-slate-900/80 transition-all duration-300 shadow-lg relative group overflow-hidden ${styles.cardHover}`}>
      <div className={`absolute inset-0 transition-colors duration-300 pointer-events-none ${styles.glowBg}`} />
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className={`w-5 h-5 rounded flex items-center justify-center border ${styles.iconContainer}`}>
              <img
                src={styles.icon}
                alt={contest.platform}
                className="w-3.5 h-3.5 opacity-90"
              />
            </div>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${styles.textClass}`}>
              {contest.platform}
            </p>
          </div>

          <h2 className="text-lg font-bold text-white leading-tight group-hover:text-indigo-100 transition-colors">
            {contest.name}
          </h2>
        </div>

        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border uppercase ${styles.badgeClass}`}>
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
          className={`px-4 py-2 text-xs rounded-md font-semibold transition-all flex items-center gap-1.5 ${styles.btnClass}`}
        >
          View Contest
        </a>
      </div>
    </div>
  );
}
