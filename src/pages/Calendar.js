import React from 'react';
import data from '../data/data.json';

function Calendar() {
  const { openingHours } = data;

  const daysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

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

export default Calendar;
