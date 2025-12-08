import React, { useState } from 'react';
import data from '../data/data.json';

function CMSDashboard({ onLogout }) {
  const [openingHours, setOpeningHours] = useState(data.openingHours);
  const [files, setFiles] = useState(data.files);
  const [successMessage, setSuccessMessage] = useState('');

  const handleHoursChange = (day, field, value) => {
    setOpeningHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleSaveHours = () => {
    // In a real application, this would save to a backend or file
    console.log('Saving opening hours:', openingHours);
    setSuccessMessage('Opening hours saved successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleAddFile = () => {
    const newFile = {
      id: files.length + 1,
      name: `New Document ${files.length + 1}`,
      filename: `document-${files.length + 1}.pdf`,
      description: 'New document description',
      uploadDate: new Date().toISOString().split('T')[0]
    };
    setFiles([...files, newFile]);
  };

  const handleDeleteFile = (id) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      setFiles(files.filter(file => file.id !== id));
    }
  };

  const daysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="cms-container">
      <div className="cms-header">
        <h2>Content Management System</h2>
        <button className="btn-logout" onClick={onLogout}>
          Logout
        </button>
      </div>

      <div className="cms-sections">
        {/* Opening Hours Management */}
        <section className="cms-section">
          <h3>Manage Opening Hours</h3>
          <div className="hours-grid">
            {daysOrder.map((day) => {
              const hours = openingHours[day];
              return (
                <div key={day} className="hours-row">
                  <label>{day}</label>
                  <input
                    type="time"
                    value={hours.open}
                    onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                    disabled={hours.closed}
                  />
                  <input
                    type="time"
                    value={hours.close}
                    onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                    disabled={hours.closed}
                  />
                  <label>
                    <input
                      type="checkbox"
                      checked={hours.closed}
                      onChange={(e) => handleHoursChange(day, 'closed', e.target.checked)}
                    />
                    Closed
                  </label>
                </div>
              );
            })}
          </div>
          <button className="btn-save" onClick={handleSaveHours}>
            Save Opening Hours
          </button>
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}
        </section>

        {/* File Management */}
        <section className="cms-section">
          <h3>Manage Files</h3>
          <button 
            className="btn-primary" 
            onClick={handleAddFile}
            style={{ marginBottom: '1rem', width: 'auto' }}
          >
            Add New File
          </button>
          <ul className="downloads-list">
            {files.map((file) => (
              <li key={file.id} className="download-item">
                <div className="download-info">
                  <h3>{file.name}</h3>
                  <p>{file.description}</p>
                  <small style={{ color: '#a0aec0' }}>
                    Uploaded: {file.uploadDate} | File: {file.filename}
                  </small>
                </div>
                <button
                  style={{
                    background: '#e53e3e',
                    color: 'white',
                    border: 'none',
                    padding: '0.8rem 1.5rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                  onClick={() => handleDeleteFile(file.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default CMSDashboard;
