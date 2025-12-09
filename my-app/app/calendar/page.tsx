"use client";

import data from '@/data/data.json';
import { OpeningSlot } from '@/types';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

const FullCalendar = dynamic(() => import('@fullcalendar/react'), { ssr: false });

const mergeAdjacentOrOverlappingSlots = (slots: OpeningSlot[]) => {
  // Sort slots by date and start time
  const sorted = [...slots].sort((a, b) => {
    if (a.date === b.date) return a.open.localeCompare(b.open);
    return a.date.localeCompare(b.date);
  });

  const events: { start: string; end: string; title: string }[] = [];
  let currentGroup: OpeningSlot[] = [];

  sorted.forEach(slot => {
    if (currentGroup.length === 0) {
      currentGroup.push(slot);
      return;
    }

    const lastSlot = currentGroup[currentGroup.length - 1];
    const lastEnd = lastSlot.close;
    const lastEndTime = new Date(`${lastSlot.date}T${lastEnd}`).getTime();
    const slotStartTime = new Date(`${slot.date}T${slot.open}`).getTime();
    const slotEndTime = new Date(`${slot.date}T${slot.close}`).getTime();

    // If same day and overlapping or adjacent
    if (lastSlot.date === slot.date && slotStartTime <= lastEndTime) {
      // Merge by extending the end if needed
      lastSlot.close = slotEndTime > lastEndTime ? slot.close : lastEnd;
      currentGroup.push(slot);
    } else {
      // Finalize previous group
      const first = currentGroup[0];
      const last = currentGroup[currentGroup.length - 1];
      const platzwarts = currentGroup.map(s => s.platzwart).join(", ");
      events.push({
        title: `${first.open} - ${last.close} &(${platzwarts})`, // TODO to each platzwart add their end hour: maxi->10:00, teste->13:00
        start: `${first.date}T${first.open}`,
        end: `${last.date}T${last.close}`
      });

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
  // const res = await fetch('http://localhost:1234/file-api.php', {
  const res = await fetch('/php_spielerei/file-api.php', { // for production
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ action: 'add_slot', newSlot: newSlot })
  });
  console.log('Response from file-api.php (add_slot):', res);
  return await res.json();
}

async function loadCalendar() {
  // const res = await fetch('http://localhost:1234/file-api.php', {
  const res = await fetch('/php_spielerei/file-api.php', { // for production
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
  const [loggedIn, setLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [roles, setRoles] = useState<string[]>([]);

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
  useEffect(() => { // check if we are logged in
    fetch('/php_spielerei/check_session.php', { credentials: 'include' })
      .then(res => {
        if (res.status === 200) return res.json();
        throw new Error("Not logged in");
      })
      .then(data => {
        setLoggedIn(true);
        setRoles(data.roles || []);
      })
      .catch(() => {
        setLoggedIn(false);
      });
  }, []);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      const res = await fetch("/php_spielerei/login.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });

      if (!res.ok) {
        const data = await res.json();
        setLoginError(data.error || "Login failed");
        return;
      }

      const data = await res.json();
      setLoggedIn(true);
      setRoles(data.roles || []);
    } catch (err) {
      setLoginError("Network or server error");
    }
  };
  const handleLogout = async () => {
    try {
      const res = await fetch("/php_spielerei/logout.php", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setLoggedIn(false);
        setRoles([]);
        setShowLogin(true); // optionally show login form after logout
      }
    } catch (err) {
      console.error("Logout failed", err);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.open || !form.close) return;

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
    alert("Slot added successfully!");
  };

  const events = mergeAdjacentOrOverlappingSlots(slots || []);

  return (
    <div className="main-content">
      <div className="page-content full-width">
        <div className="calendar">
          <h2>Opening Hours</h2>
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
          <h3>Add New Slot (min. 120 minutes)</h3>
          <p>To extend a session you can add a new slot immediately after the last one. (Overlapping is also possible for extending less than 120 minutes)</p>
          {loggedIn && (roles.includes('admin') || roles.includes('platzwart')) ? (
            <div>
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
                {/* <input
              type="text"
              placeholder="Platzwart" // TODO this will be added serverside trough authenticated session later
              value={form.platzwart}
              onChange={(e) => setForm({ ...form, platzwart: e.target.value })}
              required
              pattern="[A-Za-z\s]+"
              maxLength={30}
            /> */}
                <button type="submit">Add Slot</button>
              </form>
              <button onClick={handleLogout} style={{ marginBottom: "20px" }}>
                Logout
              </button>
            </div>
          ) : (
            <div style={{ marginTop: "20px" }}>
              <h3>Login to add a slot</h3>
              <form onSubmit={handleLogin}>
                <input
                  type="text"
                  placeholder="Username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
                <button type="submit">Login</button>
              </form>
              {loginError && <p style={{ color: "red" }}>{loginError}</p>}
            </div>
          )}
        </div>
      </div>
    </div>

  );
}
