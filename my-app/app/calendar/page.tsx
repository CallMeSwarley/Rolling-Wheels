"use client";

import data from '@/data/data.json';
import { OpeningSlot } from '@/types';
import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

const FullCalendar = dynamic(() => import('@fullcalendar/react'), { ssr: false });
const mergeAdjacentSlots = (slots: OpeningSlot[]) => {
  // First, sort slots by date and open time
  const sorted = [...slots].sort((a, b) => {
    if (a.date === b.date) return a.open.localeCompare(b.open);
    return a.date.localeCompare(b.date);
  });

  const events: { start: string; end: string; title: string }[] = [];

  let currentGroup: OpeningSlot[] = [];

  sorted.forEach(slot => {
    if (
      currentGroup.length > 0 &&
      currentGroup[currentGroup.length - 1].date === slot.date &&
      currentGroup[currentGroup.length - 1].close === slot.open
    ) {
      // Adjacent, add to current group
      currentGroup.push(slot);
    } else {
      // Not adjacent or different day → finalize previous group
      if (currentGroup.length > 0) {
        const first = currentGroup[0];
        const last = currentGroup[currentGroup.length - 1];
        const platzwarts = currentGroup.map(s => s.platzwart).join(", ");
        events.push({
          title: `${first.open} - ${last.close}&(${platzwarts})`,
          start: `${first.date}T${first.open}`,
          end: `${last.date}T${last.close}`
        });
      }
      // Start new group
      currentGroup = [slot];
    }
  });

  // Finalize last group
  if (currentGroup.length > 0) {
    const first = currentGroup[0];
    const last = currentGroup[currentGroup.length - 1];
    const platzwarts = currentGroup.map(s => s.platzwart).join(", ");
    events.push({
      title: `${first.open} - ${last.close} &(${platzwarts})`,
      start: `${first.date}T${first.open}`,
      end: `${last.date}T${last.close}`
    });
  }

  return events;
};

export default function CalendarPage() {
  const openingHours: OpeningSlot[] = data.openingHours;
  const calendarRef = useRef(null);

  // const events = data.openingHours.map((slot) => ({
  //   title: `${slot.open} - ${slot.close}&(${slot.platzwart})`,
  //   start: `${slot.date}T${slot.open}`,
  //   end: `${slot.date}T${slot.close}`
  // }));
  const events = mergeAdjacentSlots(openingHours);

  return (
    <div className="main-content">
      <div className="page-content full-width">
        <div className="calendar">
          <h2>Opening Hours</h2>
          {/* <div className="calendar-grid">
            {openingHours.map((slot) => {
              return (
                <div className={`calendar-day`}>
                  <div className="day-name">{slot.date}</div>
                  <div className={`day-hours`}>
                    {`${slot.open} - ${slot.close}`}
                  </div>
                </div>
              );
            })}
          </div> */}
          <div>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin]}
              initialView="dayGridMonth"
              events={events}
              height="auto"
              eventContent={(arg) => (
                <div style={{ fontSize: "12px", lineHeight: "1.2" }}>
                  <div><b>{arg.event.title.split('&')[0]}</b></div>
                  <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                    {arg.event.title.split('&')[1]}
                  </div>
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
