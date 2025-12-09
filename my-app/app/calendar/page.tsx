"use client";

import data from '@/data/data.json';
import { OpeningSlot } from '@/types';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
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

async function addSlot(newSlot: OpeningSlot) {
  const res = await fetch('http://localhost:1234/file-api.php', {
    // const res = await fetch('/php_spielerei/file-api.php', { // for production
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ action: 'add_slot', newSlot: newSlot })
  });
  console.log('Response from file-api.php (add_slot):', res);
  return await res.json();
}

async function loadCalendar() {
  const res = await fetch('http://localhost:1234/file-api.php', {
    // const res = await fetch('/php_spielerei/file-api.php', { // for production
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ action: 'read_calendar' })
  });
  console.log('Response from file-api.php:', res);
  return await res.json();
}




export default function CalendarPage() {
  // const openingHours: OpeningSlot[] = data.openingHours;
  const [slots, setSlots] = useState<OpeningSlot[]>();

  const calendarRef = useRef(null);
  // Form state
  const [form, setForm] = useState<OpeningSlot>({
    date: "",
    open: "",
    close: "",
    platzwart: "",
  });
  // Load on mount
  useEffect(() => {
    loadCalendar().then(data => {
      console.log('Received data:', data);
      if (data.success) {
        const receivedSlots = JSON.parse(data.content);
        console.log('Parsed slots:', receivedSlots);
        setSlots(receivedSlots);
      } else {
        console.error("Error loading calendar data:", data.error || 'Fehler beim Laden der Daten.');
      }
    }).catch(error => {
      console.error('Error loading data:', error);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.open || !form.close || !form.platzwart) return;

    // Call async function
    const result = await addSlot(form);
    console.log("Result:", result);

    if (!result.success) {
      alert("Error adding slot: " + (result.error || 'Unbekannter Fehler'));
      return;
    }
    setSlots(result.slots);

    // Reset form
    setForm({ date: "", open: "", close: "", platzwart: "" });
  };
  // const events = data.openingHours.map((slot) => ({
  //   title: `${slot.open} - ${slot.close}&(${slot.platzwart})`,
  //   start: `${slot.date}T${slot.open}`,
  //   end: `${slot.date}T${slot.close}`
  // }));
  const events = mergeAdjacentSlots(slots || []);

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
                  <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}><b>{arg.event.title.split('&')[0]}</b></div>
                  <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                    {arg.event.title.split('&')[1]}
                  </div>
                </div>
              )}
            />
          </div>
          <h3>Add New Slot</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
              min={new Date().toISOString().split("T")[0]} // today or later
            />
            <input
              type="time"
              value={form.open}
              onChange={(e) => setForm({ ...form, open: e.target.value })}
              required
            />
            <input
              type="time"
              value={form.close}
              onChange={(e) => setForm({ ...form, close: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Platzwart"
              value={form.platzwart}
              onChange={(e) => setForm({ ...form, platzwart: e.target.value })}
              required
              pattern="[A-Za-z\s]+"
              maxLength={30}
            />
            <button type="submit">Add Slot</button>
          </form>
        </div>
      </div>
    </div>

  );
}
