import React, { useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { motion } from 'framer-motion';

export default function ContestCalendar({ contests = [] }) {
  const events = useMemo(() => {
    return contests.map((contest) => ({
      id: contest.id,
      title: contest.name,
      date: contest.startTime,
      url: contest.url,
      backgroundColor: '#4f46e5', // indigo-600
      borderColor: '#4f46e5',
      textColor: '#ffffff'
    }));
  }, [contests]);

  const handleEventClick = (info) => {
    info.jsEvent.preventDefault();

    if (info.event.url) {
      window.open(info.event.url, '_blank');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 relative overflow-hidden group shadow-lg"
    >
      <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/2 transition-colors duration-500 pointer-events-none" />
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          Contest Calendar
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
        </h2>

        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-full">
          Monthly View
        </span>
      </div>

      <div className="bg-[#070a13] rounded-xl p-4 border border-slate-800/50 shadow-inner relative z-10 custom-calendar">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height="auto"
          events={events}
          eventClick={handleEventClick}
        />
        {/* We add some generic styles globally in index.css if needed, but styling via class wrapping works well for basic dark themes */}
      </div>
    </motion.div>
  );
}
