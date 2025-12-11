"use client";

import { OpeningSlot } from '@/types';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import deLocale from '@fullcalendar/core/locales/de';

const FullCalendar = dynamic(() => import('@fullcalendar/react'), { ssr: false });
const devMode = process.env.NODE_ENV !== 'production';//true; // Set to false for production
console.log("Dev mode:", devMode);
const mergeAdjacentOrOverlappingSlots = (slots: OpeningSlot[]) => {
  // Sort slots by date and start time
  const sorted = [...slots].sort((a, b) => {
    if (a.date === b.date) return a.open.localeCompare(b.open);
    return a.date.localeCompare(b.date);
  });

  const events: { start: string; end: string; title: string }[] = [];
  let currentGroup: OpeningSlot[] = [];
  let groupEndTime = 0;

  sorted.forEach(slot => {
    if (currentGroup.length === 0) {
      currentGroup.push(slot);
      groupEndTime = new Date(`${slot.date}T${slot.close}`).getTime();
      return;
    }

    const lastSlot = currentGroup[currentGroup.length - 1];
    const slotStartTime = new Date(`${slot.date}T${slot.open}`).getTime();
    const slotEndTime = new Date(`${slot.date}T${slot.close}`).getTime();

    // If same day and overlapping or adjacent
    if (lastSlot.date === slot.date && slotStartTime <= groupEndTime) {
      // Add to group and extend end time if needed
      currentGroup.push(slot);
      groupEndTime = Math.max(groupEndTime, slotEndTime);
    } else {
      // Finalize previous group
      const first = currentGroup[0];
      const groupEnd = new Date(groupEndTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false });
      const platzwartDetails = currentGroup.map(s => `${s.platzwart}→${s.close}`).join(", ");
      events.push({
        title: `${first.open} - ${groupEnd} &(${platzwartDetails})`,
        start: `${first.date}T${first.open}`,
        end: `${first.date}T${groupEnd}`
      });

      // Start new group
      currentGroup = [slot];
      groupEndTime = new Date(`${slot.date}T${slot.close}`).getTime();
    }
  });

  // Finalize last group
  if (currentGroup.length > 0) {
    const first = currentGroup[0];
    const groupEnd = new Date(groupEndTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false });
    const platzwartDetails = currentGroup.map(s => `${s.platzwart}→${s.close}`).join(", ");
    events.push({
      title: `${first.open} - ${groupEnd} &(${platzwartDetails})`,
      start: `${first.date}T${first.open}`,
      end: `${first.date}T${groupEnd}`
    });
  }

  return events;
};
async function testConcurrentSlots() {
  console.log("\n🧪 ===== STARTING CONCURRENT SLOT TESTS =====\n");

  // Test 1: Valid concurrent slots (should both succeed)
  console.log("📋 TEST 1: Valid concurrent slots");
  const validSlot1: OpeningSlot = {
    date: "2025-12-20",
    open: "10:00",
    close: "12:00",
    platzwart: "",
  };
  const validSlot2: OpeningSlot = {
    date: "2025-12-20",
    open: "12:00",
    close: "14:00",
    platzwart: "",
  };
  const results1 = await Promise.all([addSlot(validSlot1), addSlot(validSlot2)]);
  console.log("✅ Slot 10:00-12:00:", results1[0].success ? "SUCCESS" : `FAILED: ${results1[0].error}`);
  console.log("✅ Slot 12:00-14:00:", results1[1].success ? "SUCCESS" : `FAILED: ${results1[1].error}`);

  // Test 2: Overlapping slots (one should succeed, one should fail)
  console.log("\n📋 TEST 2: Overlapping slots (containment check)");
  const overlapSlot1: OpeningSlot = {
    date: "2025-12-21",
    open: "10:00",
    close: "14:00",
    platzwart: "",
  };
  const overlapSlot2: OpeningSlot = {
    date: "2025-12-21",
    open: "11:00",
    close: "13:00",
    platzwart: "",
  };
  const results2 = await Promise.all([addSlot(overlapSlot1), addSlot(overlapSlot2)]);
  console.log("🔄 Slot 10:00-14:00:", results2[0].success ? "SUCCESS" : `FAILED: ${results2[0].error}`);
  console.log("🔄 Slot 11:00-13:00:", results2[1].success ? "SUCCESS" : `FAILED: ${results2[1].error}`);

  // Test 3: Invalid time format (should be rejected)
  console.log("\n📋 TEST 3: Invalid time format");
  const invalidTime: OpeningSlot = {
    date: "2025-12-22",
    open: "25:00",
    close: "26:00",
    platzwart: "",
  };
  const results3 = await addSlot(invalidTime);
  console.log("❌ Invalid time 25:00-26:00:", results3.success ? "SUCCESS (unexpected!)" : `REJECTED: ${results3.error}`);

  // Test 4: Slot too short (< 2 hours)
  console.log("\n📋 TEST 4: Slot duration too short");
  const shortSlot: OpeningSlot = {
    date: "2025-12-23",
    open: "10:00",
    close: "11:00",
    platzwart: "",
  };
  const results4 = await addSlot(shortSlot);
  console.log("❌ Short slot 10:00-11:00 (1 hour):", results4.success ? "SUCCESS (unexpected!)" : `REJECTED: ${results4.error}`);

  // Test 5: Invalid date format
  console.log("\n📋 TEST 5: Invalid date format");
  const invalidDate: OpeningSlot = {
    date: "2025-13-45",
    open: "10:00",
    close: "12:00",
    platzwart: "",
  };
  const results5 = await addSlot(invalidDate);
  console.log("❌ Invalid date 2025-13-45:", results5.success ? "SUCCESS (unexpected!)" : `REJECTED: ${results5.error}`);

  // Test 6: Opening time after closing time
  console.log("\n📋 TEST 6: Opening time after closing time");
  const reversedTime: OpeningSlot = {
    date: "2025-12-24",
    open: "15:00",
    close: "10:00",
    platzwart: "",
  };
  const results6 = await addSlot(reversedTime);
  console.log("❌ Reversed times 15:00-10:00:", results6.success ? "SUCCESS (unexpected!)" : `REJECTED: ${results6.error}`);

  // Test 7: Gap check - slot with gap after existing slot
  console.log("\n📋 TEST 7: Gap check - slot after existing with gap");
  const gapBase: OpeningSlot = {
    date: "2025-12-25",
    open: "10:00",
    close: "12:00",
    platzwart: "",
  };
  const gapSlot: OpeningSlot = {
    date: "2025-12-25",
    open: "14:00",
    close: "16:00",
    platzwart: "",
  };
  const results7Base = await addSlot(gapBase);
  console.log("🔄 Base slot 10:00-12:00:", results7Base.success ? "SUCCESS" : `FAILED: ${results7Base.error}`);
  const results7Gap = await addSlot(gapSlot);
  console.log("❌ Gap slot 14:00-16:00:", results7Gap.success ? "SUCCESS (unexpected!)" : `REJECTED: ${results7Gap.error}`);

  // Test 8: Gap check - slot before existing with gap
  console.log("\n📋 TEST 8: Gap check - slot before existing with gap");
  const gapBase2: OpeningSlot = {
    date: "2025-12-26",
    open: "14:00",
    close: "16:00",
    platzwart: "",
  };
  const gapSlotBefore: OpeningSlot = {
    date: "2025-12-26",
    open: "10:00",
    close: "12:00",
    platzwart: "",
  };
  const results8Base = await addSlot(gapBase2);
  console.log("🔄 Base slot 14:00-16:00:", results8Base.success ? "SUCCESS" : `FAILED: ${results8Base.error}`);
  const results8Gap = await addSlot(gapSlotBefore);
  console.log("❌ Gap slot before 10:00-12:00:", results8Gap.success ? "SUCCESS (unexpected!)" : `REJECTED: ${results8Gap.error}`);

  // Test 9: Valid extension (adjacent/overlapping allowed)
  console.log("\n📋 TEST 9: Valid slot extension (adjacent)");
  const extendBase: OpeningSlot = {
    date: "2025-12-27",
    open: "10:00",
    close: "12:00",
    platzwart: "",
  };
  const extendSlot: OpeningSlot = {
    date: "2025-12-27",
    open: "12:00",
    close: "14:00",
    platzwart: "",
  };
  const results9Base = await addSlot(extendBase);
  console.log("✅ Base slot 10:00-12:00:", results9Base.success ? "SUCCESS" : `FAILED: ${results9Base.error}`);
  const results9Extend = await addSlot(extendSlot);
  console.log("✅ Adjacent slot 12:00-14:00:", results9Extend.success ? "SUCCESS" : `FAILED: ${results9Extend.error}`);

  // Test 10: Merged range enclosure check
  console.log("\n📋 TEST 10: Merged range enclosure (slot enclosed by multiple overlapping slots)");
  const mergeSlot1: OpeningSlot = {
    date: "2025-12-28",
    open: "10:00",
    close: "13:00",
    platzwart: "",
  };
  const mergeSlot2: OpeningSlot = {
    date: "2025-12-28",
    open: "12:00",
    close: "15:00",
    platzwart: "",
  };
  const enclosedSlot: OpeningSlot = {
    date: "2025-12-28",
    open: "11:00",
    close: "14:00",
    platzwart: "",
  };
  const results10a = await addSlot(mergeSlot1);
  console.log("🔄 Slot 1: 10:00-13:00:", results10a.success ? "SUCCESS" : `FAILED: ${results10a.error}`);
  const results10b = await addSlot(mergeSlot2);
  console.log("🔄 Slot 2: 12:00-15:00:", results10b.success ? "SUCCESS" : `FAILED: ${results10b.error}`);
  const results10c = await addSlot(enclosedSlot);
  console.log("❌ Enclosed slot 11:00-14:00:", results10c.success ? "SUCCESS (unexpected!)" : `REJECTED: ${results10c.error}`);

  console.log("\n✅ ===== ALL TESTS COMPLETED =====\n");
}


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
  const [smallScreen, setSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setSmallScreen(window.innerWidth < 600);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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
      }
    } catch (err) {
      console.error("Logout failed", err);
    }
  };
  const handleDateSelect = (selectInfo: any) => {
    const { startStr, endStr, allDay } = selectInfo;

    if (!loggedIn || (!roles.includes('admin') && !roles.includes('platzwart') && !roles.includes('dev'))) return;

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

    try {
      const result = await addSlot(form);

      // Always update slots if they exist
      if (result.slots) {
        setSlots(result.slots);
      }

      if (!result.success) {
        alert("Error adding slot: " + (result.error || "Unbekannter Fehler"));
        return;
      }

      // Success
      setForm({ date: "", open: "", close: "", platzwart: "" });
      alert("Slot added successfully!");
    } catch (err) {
      console.error(err);
      alert("Unexpected error while adding slot");
    }
  };

  const events = mergeAdjacentOrOverlappingSlots(slots || []);
  return (
    <div className="main-content">
      <div className="page-content full-width">
        <div className="calendar">
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
              💡 <strong>Tip:</strong> In week view, click and drag to select your desired time slot (minimum 2 hours). To add overlapping entries, click in the empty space next to existing events (clicking on events won't work). You can also fill in the form manually.
              {devMode && <span style={{ marginLeft: "1rem", color: "#e66767", fontWeight: "bold" }}>[DEV MODE]</span>}
            </div>
          )}
          <div style={{
            margin: smallScreen ? '0 -1rem' : '0',
            padding: smallScreen ? '0 0.5rem' : '0'
          }}>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
              initialView={smallScreen ? "listMonth" : "dayGridMonth"}
              slotMinTime="08:00:00"   // earliest hour shown (8 AM)
              slotMaxTime="23:30:00"   // latest hour shown (11:30 PM)
              allDaySlot={false}
              nowIndicator={true}
              locale={deLocale}
              events={events}
              height="auto"
              selectable={loggedIn && (roles.includes('admin') || roles.includes('platzwart'))}
              selectMirror={true}
              selectLongPressDelay={500}
              // selectMinDistance={5}
              // unselectAuto={true}
              // unselectCancel=".fc-event"
              longPressDelay={500}
              eventLongPressDelay={500}
              dayMaxEvents={true}
              weekends={true}
              select={handleDateSelect}
              selectAllow={(selectInfo) => {
                const startDate = selectInfo.start;
                const endDate = selectInfo.end;
                const diffHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);

                // Allow all-day selections (24 hours or more - for month/day views)
                if (diffHours >= 24) return true;

                // For time-based selections (week view), require minimum 2 hours
                return diffHours >= 2;
              }}
              eventOverlap={true}
              headerToolbar={
                smallScreen
                  ? { left: 'prev next', center: 'title', right: 'dayGridMonth timeGridWeek listMonth' }
                  : { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,listMonth' }
              }
              eventDidMount={(info) => {
                info.el.style.width = '85%';         // make the event narrower
                info.el.style.boxSizing = 'border-box';
              }}
              buttonText={{
                today: 'Heute',
                month: 'Monat',
                week: 'Woche',
                day: 'Tag',
                list: 'Liste'
              }}
              validRange={{
                start: new Date().toISOString().split('T')[0]
              }}
              selectConstraint={{ // This blocks selection of full day entires in month view
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
              eventColor="#e66767"
              eventTextColor="#ffffff"
            />
          </div>
          {loggedIn && (roles.includes('admin') || roles.includes('platzwart')) ? (
            <div className="cms-section" style={{ marginTop: "3rem" }}>
              <div className="cms-header">
                <div>
                  <h3 style={{ color: "#dc2626", marginBottom: "0.5rem" }}>Add New Opening Slot</h3>
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
              <details style={{ cursor: "pointer" }}>
                <summary
                  style={{
                    fontWeight: "600",
                    color: "#2d3748",
                    fontSize: "1rem",
                    marginBottom: "1rem",
                    cursor: "pointer",
                    padding: "1rem",
                    transition: "background 0.2s",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    background: "#f8f9fa",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fee2e2")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#f8f9fa")}
                >
                  🔒 Admin/Platzwart Login Required to Add Slots
                </summary>
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
              </details>
            </div>
          )}
        </div>
      </div>
    </div>

  );
}
