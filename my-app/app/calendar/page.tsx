"use client";

import { Appointment, AppointmentType, MonthConfig } from '@/types';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import deLocale from '@fullcalendar/core/locales/de';

const FullCalendar = dynamic(() => import('@fullcalendar/react'), { ssr: false });
const devMode = process.env.NODE_ENV !== 'production';

const APPOINTMENT_COLORS: Record<AppointmentType, string> = {
  session: '#e66767',
  event: '#4f8ef7',
  workshop: '#52c41a',
  other: '#faad14',
};

const APPOINTMENT_LABELS: Record<AppointmentType, string> = {
  session: 'Session',
  event: 'Event',
  workshop: 'Workshop',
  other: 'Sonstiges',
};

type MergedSession = { date: string; start: string; end: string; responsibles: { name: string; end: string }[] };

function mapAppointmentsToEvents(appointments: Appointment[], mergeOverlappingSessions = false) {
  const today = new Date().toISOString().split('T')[0];
  const indexed = appointments
    .map((appt, index) => ({ appt, index }))
    .filter(({ appt }) => appt.date >= today);

  if (!mergeOverlappingSessions) {
    return indexed.map(({ appt, index }) => ({
      id: String(index),
      title: `${appt.start} - ${appt.end} (${appt.responsible})`,
      start: `${appt.date}T${appt.start}`,
      end: `${appt.date}T${appt.end}`,
      backgroundColor: APPOINTMENT_COLORS[appt.type] ?? '#888888',
      borderColor: APPOINTMENT_COLORS[appt.type] ?? '#888888',
      textColor: '#ffffff',
      extendedProps: { appointment: appt, index },
    }));
  }

  // Split sessions and non-sessions
  const sessions = indexed.filter(({ appt }) => appt.type === 'session');
  const others = indexed.filter(({ appt }) => appt.type !== 'session');

  // Sort sessions by date + start time
  const sorted = [...sessions].sort((a, b) =>
    `${a.appt.date}T${a.appt.start}`.localeCompare(`${b.appt.date}T${b.appt.start}`)
  );

  // Merge overlapping/adjacent sessions on the same date
  const mergedGroups: MergedSession[] = [];
  for (const { appt } of sorted) {
    const last = mergedGroups[mergedGroups.length - 1];
    if (last && last.date === appt.date && appt.start <= last.end) {
      if (appt.end > last.end) last.end = appt.end;
      last.responsibles.push({ name: appt.responsible, end: appt.end });
    } else {
      mergedGroups.push({ date: appt.date, start: appt.start, end: appt.end, responsibles: [{ name: appt.responsible, end: appt.end }] });
    }
  }

  return [
    ...mergedGroups.map((m, i) => ({
      id: `merged-session-${i}`,
      title: m.responsibles.map(r => `${r.name} → ${r.end}`).join(', '),
      start: `${m.date}T${m.start}`,
      end: `${m.date}T${m.end}`,
      backgroundColor: APPOINTMENT_COLORS['session'],
      borderColor: APPOINTMENT_COLORS['session'],
      textColor: '#ffffff',
      extendedProps: { mergedSession: m, appointment: null as Appointment | null, index: -1 },
    })),
    ...others.map(({ appt, index }) => ({
      id: String(index),
      title: `${appt.start} - ${appt.end} (${appt.responsible})`,
      start: `${appt.date}T${appt.start}`,
      end: `${appt.date}T${appt.end}`,
      backgroundColor: APPOINTMENT_COLORS[appt.type] ?? '#888888',
      borderColor: APPOINTMENT_COLORS[appt.type] ?? '#888888',
      textColor: '#ffffff',
      extendedProps: { appointment: appt, index },
    })),
  ];
}

const apiBase = (path: string) =>
  devMode ? `http://localhost:1234/${path}` : `/php_spielerei/${path}`;

async function apiFetch(path: string, body: object) {
  const res = await fetch(apiBase(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  return res.json();
}

async function loadCalendar() {
  return apiFetch('file-api.php', { action: 'read_calendar' });
}

async function loadMonths() {
  return apiFetch('file-api.php', { action: 'read_months' });
}

async function addAppointment(appointment: Omit<Appointment, 'responsible' | 'month'>) {
  return apiFetch('file-api.php', { action: 'add_appointment', appointment });
}

async function deleteAppointment(index: number) {
  return apiFetch('file-api.php', { action: 'delete_appointment', index });
}

async function editAppointment(index: number, appointment: Omit<Appointment, 'responsible' | 'month'>) {
  return apiFetch('file-api.php', { action: 'edit_appointment', index, appointment });
}

async function updateMonthConfig(month: Partial<MonthConfig> & { month: number }) {
  return apiFetch('file-api.php', { action: 'update_month', month });
}

type EditModal = { appointment: Appointment; index: number } | null;

const emptyForm = { date: '', start: '', end: '', type: 'session' as AppointmentType, name: '' };

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [months, setMonths] = useState<MonthConfig[]>([]);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [smallScreen, setSmallScreen] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState(emptyForm);
  const [editModal, setEditModal] = useState<EditModal>(null);

  // Month-config admin form
  const [selMonth, setSelMonth] = useState<number>(1);
  const [monthForm, setMonthForm] = useState({ min_gap_mins: 120, corehours_start: '09:00', corehours_end: '17:00' });
  const [monthFormMsg, setMonthFormMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const isAdmin = roles.includes('admin');
  const isDev = roles.includes('dev');
  const isPlatzwart = roles.includes('platzwart');
  const canWrite = isAdmin || isPlatzwart || isDev;
  const canChooseType = isAdmin || isDev;

  // Sync monthForm when selected month changes
  useEffect(() => {
    const cfg = months.find(m => m.month === selMonth);
    if (cfg) setMonthForm({ min_gap_mins: cfg.min_gap_mins, corehours_start: cfg.corehours_start, corehours_end: cfg.corehours_end });
  }, [selMonth, months]);

  useEffect(() => {
    const check = () => setSmallScreen(window.innerWidth < 600);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Load calendar data
  useEffect(() => {
    loadCalendar().then(data => {
      if (data.success) setAppointments(JSON.parse(data.content));
      else console.error('Error loading calendar:', data.error);
    }).catch(console.error);

    loadMonths().then(data => {
      if (data.success) setMonths(data.months);
    }).catch(console.error);
  }, []);

  // Check session
  useEffect(() => {
    fetch(apiBase('check_session.php'), { credentials: 'include' })
      .then(res => { if (res.status === 200) return res.json(); throw new Error('Not logged in'); })
      .then(data => { setRoles(data.roles || []); })
      .catch(() => setRoles([]));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch(apiBase('login.php'), {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!res.ok) { setLoginError(data.error || 'Login fehlgeschlagen'); return; }
      setRoles(data.roles || []);
    } catch { setLoginError('Netzwerk- oder Serverfehler'); }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch(apiBase('logout.php'), { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (data.success) { setRoles([]); }
    } catch (err) { console.error('Logout failed', err); }
  };

  // Calendar drag-select  pre-fill form
  const handleDateSelect = (selectInfo: any) => {
    if (!canWrite) return;
    const { startStr, endStr, allDay } = selectInfo;
    const date = startStr.split('T')[0];
    const fmt = (s: string) => s.includes('T') ? s.split('T')[1].substring(0, 5) : '';
    setForm(f => ({ ...f, date, start: allDay ? '' : fmt(startStr), end: allDay ? '' : fmt(endStr) }));
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.start || !form.end) return;
    try {
      const apptPayload: Omit<Appointment, 'responsible' | 'month'> = { date: form.date, start: form.start, end: form.end, type: form.type };
      if (form.name.trim()) apptPayload.name = form.name.trim();
      const result = await addAppointment(apptPayload);
      if (result.appointments) setAppointments(result.appointments);
      if (!result.success) { alert('Fehler: ' + (result.error || 'Unbekannter Fehler')); return; }
      setForm(emptyForm);
      alert('Termin erfolgreich hinzugefügt!');
    } catch (err) { console.error(err); alert('Unerwarteter Fehler'); }
  };

  // Admin: click event to edit
  const handleEventClick = (clickInfo: any) => {
    if (!isAdmin) return;
    const { appointment, index } = clickInfo.event.extendedProps;
    setEditModal({ appointment: { ...appointment }, index });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal) return;
    try {
      const { date, start, end, type, name } = editModal.appointment;
      const payload: Omit<Appointment, 'responsible' | 'month'> = { date, start, end, type };
      if (name?.trim()) payload.name = name.trim();
      const result = await editAppointment(editModal.index, payload);
      if (result.appointments) setAppointments(result.appointments);
      if (!result.success) { alert('Fehler: ' + (result.error || 'Unbekannter Fehler')); return; }
      setEditModal(null);
      alert('Termin aktualisiert!');
    } catch (err) { console.error(err); alert('Unerwarteter Fehler'); }
  };

  const handleDelete = async () => {
    if (!editModal) return;
    if (!confirm('Termin wirklich löschen?')) return;
    try {
      const result = await deleteAppointment(editModal.index);
      if (result.appointments) setAppointments(result.appointments);
      if (!result.success) { alert('Fehler: ' + (result.error || 'Unbekannter Fehler')); return; }
      setEditModal(null);
    } catch (err) { console.error(err); alert('Unerwarteter Fehler'); }
  };

  const handleUpdateMonth = async (e: React.FormEvent) => {
    e.preventDefault();
    setMonthFormMsg(null);
    try {
      const result = await updateMonthConfig({ month: selMonth, ...monthForm });
      if (!result.success) { setMonthFormMsg({ ok: false, text: result.error || 'Fehler' }); return; }
      setMonths(result.months);
      setMonthFormMsg({ ok: true, text: 'Konfiguration gespeichert!' });
    } catch { setMonthFormMsg({ ok: false, text: 'Netzwerkfehler' }); }
  };

  const selMonthCfg = months.find(m => m.month === selMonth);
  const currentYear = new Date().getFullYear();
  const selMonthHasSessions = appointments.some(
    a => a.type === 'session' && a.month === selMonth && new Date(a.date).getFullYear() === currentYear
  );

  const activeCfg = form.type === 'session'
    ? months.find(m => m.month === (form.date ? new Date(form.date).getMonth() + 1 : 0))
    : null;

  const calendarEvents = mapAppointmentsToEvents(appointments, !isAdmin && !isDev);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.8rem',
    border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '1rem',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#2d3748',
  };

  return (
    <div className="main-content">
      <div className="page-content full-width">
        <div className="calendar">

          {/* Tip banner */}
          {canWrite && (
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '6px', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#0c4a6e', fontSize: '0.9rem' }}>
              <strong>Tipp:</strong> In der Wochenansicht klicken und ziehen um einen Zeitslot auszuwählen. Du kannst auch das Formular manuell ausfüllen.
              {devMode && <span style={{ marginLeft: '1rem', color: '#e66767', fontWeight: 'bold' }}>[DEV MODE]</span>}
              {isAdmin && <span style={{ marginLeft: '1rem', color: '#6b21a8', fontWeight: 'bold' }}>[ADMIN  Klick auf Termin zum Bearbeiten]</span>}
            </div>
          )}

          {/* Legend */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {(Object.entries(APPOINTMENT_LABELS) as [AppointmentType, string][]).map(([type, label]) => (
              <span key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: APPOINTMENT_COLORS[type], display: 'inline-block' }} />
                {label}
              </span>
            ))}
          </div>

          {/* Calendar */}
          <div style={{ margin: smallScreen ? '0 -1rem' : '0', padding: smallScreen ? '0 0.5rem' : '0' }}>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
              initialView={smallScreen ? 'listMonth' : 'timeGridWeek'}
              slotMinTime="08:00:00"
              slotMaxTime="23:30:00"
              allDaySlot={false}
              nowIndicator={true}
              locale={deLocale}
              events={calendarEvents}
              height="auto"
              selectable={canWrite}
              selectMirror={true}
              selectLongPressDelay={500}
              longPressDelay={500}
              eventLongPressDelay={500}
              dayMaxEvents={true}
              weekends={true}
              select={handleDateSelect}
              selectAllow={(info) => {
                const diff = (info.end.getTime() - info.start.getTime()) / (1000 * 60 * 60);
                return diff >= 24 || diff >= 2;
              }}
              eventDisplay="block"
              eventOverlap={true}
              headerToolbar={
                smallScreen
                  ? { left: 'prev next', center: 'title', right: 'dayGridMonth timeGridWeek listMonth' }
                  : { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,listMonth' }
              }
              eventDidMount={(info) => {
                info.el.style.width = '85%';
                info.el.style.boxSizing = 'border-box';
                info.el.style.cursor = isAdmin ? 'pointer' : 'default';
              }}
              buttonText={{ today: 'Heute', month: 'Monat', week: 'Woche', day: 'Tag', list: 'Liste' }}
              validRange={{ start: new Date().toISOString().split('T')[0] }}
              selectConstraint={{ start: new Date().toISOString().split('T')[0], startTime: '08:00:00', endTime: '23:30:00' }}
              eventContent={(arg) => {
                const appt: Appointment | null = arg.event.extendedProps.appointment;
                const mergedSession: MergedSession | undefined = arg.event.extendedProps.mergedSession;
                if (!appt && !mergedSession) {
                  // Mirror event shown during drag-select – render a simple placeholder
                  return (
                    <div style={{ fontSize: '11px', lineHeight: '1.3', padding: '1px 2px' }}>
                      <b>Neuer Termin</b>
                    </div>
                  );
                }
                if (mergedSession) {
                  return (
                    <div style={{ fontSize: '11px', lineHeight: '1.3', padding: '1px 2px' }}>
                      <b>{mergedSession.start} – {mergedSession.end}</b>
                      {mergedSession.responsibles.map((r, i) => (
                        <div key={i} style={{ whiteSpace: 'normal', wordBreak: 'break-word', opacity: 0.9 }}>
                          {r.name} → {r.end}
                        </div>
                      ))}
                    </div>
                  );
                }
                return (
                  <div style={{ fontSize: '11px', lineHeight: '1.3', padding: '1px 2px' }}>
                    <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                      <b>{appt!.name ? appt!.name : `${appt!.start} - ${appt!.end}`}</b>
                    </div>
                    <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', opacity: 0.9 }}>
                      {appt!.name && <span>{appt!.start} - {appt!.end} · </span>}({appt!.responsible})
                    </div>
                  </div>
                );
              }}
              eventClick={isAdmin ? handleEventClick : undefined}
            />
          </div>

          {/* ---- Add-appointment form (logged in with write role) ---- */}
          {canWrite ? (
            <div ref={formRef} className="cms-section" style={{ marginTop: '3rem' }}>
              <div className="cms-header">
                <div>
                  <h3 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>Neuen Termin eintragen</h3>
                  <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    Sessions: Mindestdauer 2 Stunden. Kernzeiten und Abstände gelten je nach Monatskonfiguration.
                  </p>
                </div>
                <button onClick={handleLogout} className="btn-logout">Logout</button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                {/* Date */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={labelStyle}>Datum</label>
                  <input type="date" value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    required min={new Date().toISOString().split('T')[0]} style={inputStyle} />
                </div>

                {/* Start / End */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={labelStyle}>Beginn</label>
                    <input type="time" value={form.start}
                      onChange={e => setForm(f => ({ ...f, start: e.target.value }))}
                      required style={inputStyle} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={labelStyle}>Ende</label>
                    <input type="time" value={form.end}
                      onChange={e => setForm(f => ({ ...f, end: e.target.value }))}
                      required style={inputStyle} />
                  </div>
                </div>

                {/* Type – admin/dev only; platzwart locked to session */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={labelStyle}>Typ</label>
                  {canChooseType ? (
                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as AppointmentType }))}
                      style={{ ...inputStyle, background: '#fff', cursor: 'pointer' }}>
                      {(Object.entries(APPOINTMENT_LABELS) as [AppointmentType, string][]).map(([val, lbl]) => (
                        <option key={val} value={val}>{lbl}</option>
                      ))}
                    </select>
                  ) : (
                    <input type="text" value={APPOINTMENT_LABELS['session']} disabled
                      style={{ ...inputStyle, background: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' }} />
                  )}
                </div>

                {/* Name – required only for event and other */}
                {(form.type === 'event' || form.type === 'other') && (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={labelStyle}>Name / Titel</label>
                    <input type="text" value={form.name}
                      placeholder={`Name des ${APPOINTMENT_LABELS[form.type]}s`}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      required style={inputStyle} />
                  </div>
                )}

                {/* Session hint: core hours & gap */}
                {form.type === 'session' && form.date && activeCfg && (
                  <div style={{ background: '#fefce8', border: '1px solid #fde047', borderRadius: '6px', padding: '0.75rem', fontSize: '0.85rem', color: '#713f12' }}>
                    <strong>Monat {activeCfg.month_name}:</strong>&nbsp;
                    Kernzeiten {activeCfg.corehours_start} bis {activeCfg.corehours_end} |&nbsp;
                    Min. Abstand (wenn nicht angrenzend/überlappend): {activeCfg.min_gap_mins === 0 ? 'kein Abstand erlaubt (angrenzend)' : `${activeCfg.min_gap_mins} Minuten`}
                  </div>
                )}

                <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
                  Termin hinzufügen
                </button>
              </form>

              {/* ---- Month config editor (admin only) ---- */}
              {isAdmin && (
                <div style={{ marginTop: '3rem', padding: '1.5rem', background: '#f5f3ff', border: '1px solid #c4b5fd', borderRadius: '8px' }}>
                  <h4 style={{ color: '#6b21a8', marginBottom: '1rem' }}> Monatskonfiguration (Admin)</h4>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={labelStyle}>Monat auswählen</label>
                    <select value={selMonth} onChange={e => { setSelMonth(Number(e.target.value)); setMonthFormMsg(null); }}
                      style={{ ...inputStyle, background: '#fff' }}>
                      {months.filter(m => m.month !== 0).map(m => (
                        <option key={m.month} value={m.month}>{m.month_name}</option>
                      ))}
                    </select>
                  </div>

                  {selMonthHasSessions && (
                    <div style={{ padding: '0.6rem 0.8rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', color: '#991b1b', fontSize: '0.85rem', marginBottom: '1rem' }}>
                      Es gibt bereits Sessions in diesem Monat  die Konfiguration kann nicht mehr geändert werden.
                    </div>
                  )}

                  <form onSubmit={handleUpdateMonth} style={{ display: 'grid', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: smallScreen ? '1fr' : '1fr 1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={labelStyle}>Kernzeit Beginn</label>
                        <input type="time" value={monthForm.corehours_start}
                          onChange={e => setMonthForm(f => ({ ...f, corehours_start: e.target.value }))}
                          disabled={selMonthHasSessions} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Kernzeit Ende</label>
                        <input type="time" value={monthForm.corehours_end}
                          onChange={e => setMonthForm(f => ({ ...f, corehours_end: e.target.value }))}
                          disabled={selMonthHasSessions} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Min. Slot Abstand (minuten)</label>
                        <input type="number" min={0} value={monthForm.min_gap_mins}
                          onChange={e => setMonthForm(f => ({ ...f, min_gap_mins: Number(e.target.value) }))}
                          disabled={selMonthHasSessions} style={inputStyle} />
                      </div>
                    </div>
                    <button type="submit" className="btn-primary" disabled={selMonthHasSessions}
                      style={{ opacity: selMonthHasSessions ? 0.5 : 1 }}>
                      Konfiguration speichern
                    </button>
                    {monthFormMsg && (
                      <div style={{
                        padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem',
                        background: monthFormMsg.ok ? '#f0fdf4' : '#fef2f2',
                        border: `1px solid ${monthFormMsg.ok ? '#86efac' : '#fca5a5'}`,
                        color: monthFormMsg.ok ? '#166534' : '#991b1b'
                      }}>
                        {monthFormMsg.text}
                      </div>
                    )}
                  </form>
                </div>
              )}
            </div>
          ) : (
            /* ---- Login section ---- */
            <div className="login-form" style={{ marginTop: '3rem', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
              <details style={{ cursor: 'pointer' }}>
                <summary style={{
                  fontWeight: '600', color: '#2d3748', fontSize: '1rem', marginBottom: '1rem',
                  cursor: 'pointer', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#f8f9fa'
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fee2e2')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#f8f9fa')}>
                  Admin/Platzwart Login
                </summary>
                <form onSubmit={handleLogin} style={{ display: 'grid', gap: '1.5rem', marginTop: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={labelStyle}>Benutzername</label>
                    <input id="username" type="text" placeholder="Benutzername eingeben"
                      value={loginForm.username} onChange={e => setLoginForm(f => ({ ...f, username: e.target.value }))}
                      required style={inputStyle} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={labelStyle}>Passwort</label>
                    <input id="password" type="password" placeholder="Passwort eingeben"
                      value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                      required style={inputStyle} />
                  </div>
                  {loginError && (
                    <div style={{ padding: '0.75rem', background: '#fff5f5', border: '1px solid #fc8181', borderRadius: '6px', color: '#c53030', textAlign: 'center' }}>
                      {loginError}
                    </div>
                  )}
                  <button type="submit" className="btn-primary">Login</button>
                </form>
              </details>
            </div>
          )}

          {/* ---- Edit modal (admin only) ---- */}
          {editModal && (
            <div onClick={() => setEditModal(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div onClick={e => e.stopPropagation()}
                style={{ background: '#fff', borderRadius: '10px', padding: '2rem', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                <h3 style={{ marginBottom: '1.25rem', color: '#1e293b' }}>Termin bearbeiten</h3>
                <form onSubmit={handleEditSubmit} style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Datum</label>
                    <input type="date" value={editModal.appointment.date}
                      onChange={e => setEditModal(m => m && ({ ...m, appointment: { ...m.appointment, date: e.target.value } }))}
                      required style={inputStyle} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Beginn</label>
                      <input type="time" value={editModal.appointment.start}
                        onChange={e => setEditModal(m => m && ({ ...m, appointment: { ...m.appointment, start: e.target.value } }))}
                        required style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Ende</label>
                      <input type="time" value={editModal.appointment.end}
                        onChange={e => setEditModal(m => m && ({ ...m, appointment: { ...m.appointment, end: e.target.value } }))}
                        required style={inputStyle} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Typ</label>
                    <input type="text" value={APPOINTMENT_LABELS[editModal.appointment.type] ?? editModal.appointment.type}
                      disabled style={{ ...inputStyle, background: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' }} />
                  </div>
                  {(editModal.appointment.type === 'event' || editModal.appointment.type === 'other') && (
                    <div>
                      <label style={labelStyle}>Name / Titel</label>
                      <input type="text" value={editModal.appointment.name ?? ''}
                        onChange={e => setEditModal(m => m && ({ ...m, appointment: { ...m.appointment, name: e.target.value } }))}
                        required style={inputStyle} />
                    </div>
                  )}
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Eingetragen von: <strong>{editModal.appointment.responsible}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>Speichern</button>
                    <button type="button" onClick={handleDelete}
                      style={{ flex: 1, padding: '0.8rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                      Löschen
                    </button>
                    <button type="button" onClick={() => setEditModal(null)}
                      style={{ flex: 1, padding: '0.8rem', background: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                      Abbrechen
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
