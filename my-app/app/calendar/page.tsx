"use client";

import { OpeningSlot } from '@/types';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import deLocale from '@fullcalendar/core/locales/de';

const FullCalendar = dynamic(() => import('@fullcalendar/react'), { ssr: false });
const devMode = true; // Set to false for production
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
  const apiUrl = devMode ? 'http://localhost:1234/file-api.php' : '/php_spielerei/file-api.php';
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ action: 'add_slot', newSlot: newSlot })
  });
  return await res.json();
}

async function loadCalendar() {
  const apiUrl = devMode ? 'http://localhost:1234/file-api.php' : '/php_spielerei/file-api.php';
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ action: 'read_calendar' })
  });
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
      if (data.success) {
        const receivedSlots = JSON.parse(data.content);
        setSlots(receivedSlots);
      } else {
        console.error("Error loading calendar data:", data.error || 'Fehler beim Laden der Daten.');
      }
    }).catch(error => {
      console.error('Error loading data:', error);
    });
  }, []);
  useEffect(() => { // check if we are logged in
    if (devMode) {
      setLoggedIn(true);
      setRoles(['admin']);
      return;
    }

    const apiUrl = devMode ? 'http://localhost:1234/check_session.php' : '/php_spielerei/check_session.php';
    fetch(apiUrl, { credentials: 'include' })
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
  }, [devMode]);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const apiUrl = devMode ? 'http://localhost:1234/login.php' : '/php_spielerei/login.php';
    try {
      const res = await fetch(apiUrl, {
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
    const apiUrl = devMode ? 'http://localhost:1234/logout.php' : '/php_spielerei/logout.php';
    try {
      const res = await fetch(apiUrl, {
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
  const handleDateSelect = (selectInfo: any) => {
    const { startStr, endStr, allDay } = selectInfo;

    if (!loggedIn || (!roles.includes('admin') && !roles.includes('platzwart'))) return;

    // Extract date
    const date = startStr.split('T')[0];

    // Extract time in HH:mm format, or leave blank for all-day events
    const formatTime = (dateTimeStr: string) => {
      if (!dateTimeStr.includes('T')) return '';
      return dateTimeStr.split('T')[1].substring(0, 5); // "HH:mm"
    };

    setForm({
      ...form,
      date,
      open: allDay ? '' : formatTime(startStr),
      close: allDay ? '' : formatTime(endStr)
    });

    // Scroll to form
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.open || !form.close) return;

    // Call async function
    const result = await addSlot(form);

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
          {loggedIn && (roles.includes('admin') || roles.includes('platzwart')) && (
            <div style={{
              background: "#f0f9ff",
              border: "1px solid #bae6fd",
              borderRadius: "6px",
              padding: "0.75rem 1rem",
              marginBottom: "1rem",
              color: "#0c4a6e",
              fontSize: "0.9rem"
            }}>
              💡 <strong>Tip:</strong> In week view, click and drag to select your desired time slot (minimum 2 hours). To add overlapping entries, click in the empty space next to existing events (clicking on events won't work). You can also click on a date (in month view) to fill in the form manually.
              {devMode && <span style={{ marginLeft: "1rem", color: "#dc2626", fontWeight: "bold" }}>[DEV MODE]</span>}
            </div>
          )}
          <div>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              slotMinTime="08:00:00"   // earliest hour shown (8 AM)
              slotMaxTime="23:30:00"   // latest hour shown (11:30 PM)
              locale={deLocale}
              events={events}
              height="auto"
              selectable={loggedIn && (roles.includes('admin') || roles.includes('platzwart'))}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              select={handleDateSelect}
              selectAllow={(selectInfo) => {
                const startDate = selectInfo.start;
                const endDate = selectInfo.end;
                // 1. Minimum 2 hours
                const diffHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
                return diffHours >= 2 ;
              }}
              eventOverlap={true}
              eventDidMount={(info) => {
                info.el.style.width = '85%';         // make the event narrower
                info.el.style.boxSizing = 'border-box';
              }}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek' //,timeGridDay
              }}
              buttonText={{
                today: 'Heute',
                month: 'Monat',
                week: 'Woche',
                day: 'Tag'
              }}
              validRange={{
                start: new Date().toISOString().split('T')[0]
              }}
              selectConstraint={{
                start: new Date().toISOString().split('T')[0],
                startTime: '08:00:00',
                endTime: '23:30:00',
              }}
              eventContent={(arg) => (
                <div style={{ fontSize: "12px", lineHeight: "1.2" }}>
                  <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}><b>{arg.event.title.split('&')[0]}</b></div>
                  <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                    {arg.event.title.split('&')[1]}
                  </div>
                </div>
              )}
              eventColor="#667eea"
              eventTextColor="#ffffff"
            />
          </div>
          {loggedIn && (roles.includes('admin') || roles.includes('platzwart')) ? (
            <div className="cms-section" style={{ marginTop: "3rem" }}>
              <div className="cms-header">
                <div>
                  <h3 style={{ color: "#667eea", marginBottom: "0.5rem" }}>Add New Opening Slot</h3>
                  <p style={{ color: "#718096", fontSize: "0.9rem", marginBottom: "1rem" }}>
                    Minimum duration: 2 hours. You can extend existing sessions by adding overlapping slots or adjacent slots.
                  </p>
                </div>
                <button onClick={handleLogout} className="btn-logout">
                  Logout
                </button>
              </div>
              <form onSubmit={handleSubmit} className="form-group" style={{ display: "grid", gap: "1.5rem" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="slot-date" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500", color: "#2d3748" }}>
                    Date
                  </label>
                  <input
                    id="slot-date"
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                    min={new Date().toISOString().split("T")[0]}
                    style={{ width: "100%", padding: "0.8rem", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "1rem" }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="slot-open" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500", color: "#2d3748" }}>
                      Opening Time
                    </label>
                    <input
                      id="slot-open"
                      type="time"
                      value={form.open}
                      onChange={(e) => setForm({ ...form, open: e.target.value })}
                      required
                      style={{ width: "100%", padding: "0.8rem", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "1rem" }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="slot-close" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500", color: "#2d3748" }}>
                      Closing Time
                    </label>
                    <input
                      id="slot-close"
                      type="time"
                      value={form.close}
                      onChange={(e) => setForm({ ...form, close: e.target.value })}
                      required
                      style={{ width: "100%", padding: "0.8rem", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "1rem" }}
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: "0.5rem" }}>
                  Add Opening Slot
                </button>
              </form>
            </div>
          ) : (
            <div className="login-form" style={{ marginTop: "3rem", maxWidth: "500px", marginLeft: "auto", marginRight: "auto" }}>
              <h3 style={{ color: "#667eea", marginBottom: "0.5rem", textAlign: "center" }}>Login Required</h3>
              <p style={{ color: "#718096", fontSize: "0.9rem", marginBottom: "2rem", textAlign: "center" }}>
                Please login to add new opening slots
              </p>
              <form onSubmit={handleLogin} style={{ display: "grid", gap: "1.5rem" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="username" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500", color: "#2d3748" }}>
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    required
                    style={{ width: "100%", padding: "0.8rem", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "1rem" }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="password" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500", color: "#2d3748" }}>
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                    style={{ width: "100%", padding: "0.8rem", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "1rem" }}
                  />
                </div>
                {loginError && <div className="error-message" style={{ padding: "0.75rem", background: "#fff5f5", border: "1px solid #fc8181", borderRadius: "6px", color: "#c53030", textAlign: "center" }}>{loginError}</div>}
                <button type="submit" className="btn-primary">
                  Login
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>

  );
}
