import React, { useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function ContestCalendar({ contests = [] }) {
  const events = useMemo(() => {
    return contests.map((contest) => ({
      id: contest.id,
      title: contest.name,
      date: contest.startTime,
      url: contest.url,
    }));
  }, [contests]);

  const handleEventClick = (info) => {
    info.jsEvent.preventDefault();

    if (info.event.url) {
      window.open(info.event.url, '_blank');
    }
  };

  return (
    <div className="bg-[#111] border border-gray-800 rounded-xl p-6 mt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          Contest Calendar
        </h2>

        <span className="text-xs text-cyan-400 uppercase tracking-wider">
          Monthly View
        </span>
      </div>

      <div className="bg-black rounded-xl p-4">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height="auto"
          events={events}
          eventClick={handleEventClick}
        />
      </div>
    </div>
  );
}
