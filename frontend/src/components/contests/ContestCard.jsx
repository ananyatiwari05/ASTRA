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
    <div className="bg-[#111] border border-gray-800 rounded-xl p-4 hover:border-cyan-500/40 transition">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <img
              src={platformIcons[contest.platform]}
              alt={contest.platform}
              className="w-4 h-4"
            />
            <p className="text-[10px] uppercase tracking-wider text-cyan-400">
              {contest.platform}
            </p>
          </div>

          <h2 className="text-base font-bold text-white leading-tight">
            {contest.name}
          </h2>
        </div>

        <span className="px-3 py-1 rounded-full text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          Upcoming
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div>
          <p className="text-[10px] text-gray-500 uppercase mb-1">Starts In</p>
          <CountdownTimer startTime={contest.startTime} />
        </div>

        <div>
          <p className="text-[10px] text-gray-500 uppercase mb-1">Start Time</p>
          <p className="text-white">
            {new Date(contest.startTime).toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-[10px] text-gray-500 uppercase mb-1">Duration</p>
          <p className="text-white">{contest.durationHours}h</p>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={addToGoogleCalendar}
          className="px-3 py-1.5 text-sm rounded-lg border border-cyan-500 text-cyan-400 font-semibold hover:bg-cyan-500/10 transition"
        >
          Add to Calendar
        </button>

        <a
          href={contest.url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 text-sm rounded-lg bg-cyan-500 text-black font-semibold hover:opacity-90 transition"
        >
          View Contest
        </a>
      </div>
    </div>
  );
}
