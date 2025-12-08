import data from '@/data/data.json';
import type { WeekSchedule } from '@/types';

export default function CalendarPage() {
  const openingHours: WeekSchedule = data.openingHours;
  const daysOrder: (keyof WeekSchedule)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="main-content">
      <div className="page-content full-width">
        <div className="calendar">
          <h2>Opening Hours</h2>
          <div className="calendar-grid">
            {daysOrder.map((day) => {
              const hours = openingHours[day];
              return (
                <div key={day} className={`calendar-day ${hours.closed ? 'closed' : ''}`}>
                  <div className="day-name">{day}</div>
                  <div className={`day-hours ${hours.closed ? 'closed-text' : ''}`}>
                    {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
