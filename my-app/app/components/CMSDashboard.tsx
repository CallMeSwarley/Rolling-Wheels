'use client';

import { useState } from 'react';
import data from '@/data/data.json';
import type { FileItem } from '@/types';

interface CMSDashboardProps {
  onLogout: () => void;
}

export default function CMSDashboard({ onLogout }: CMSDashboardProps) {
  const [files, setFiles] = useState<FileItem[]>(data.files);
  const [successMessage, setSuccessMessage] = useState('');

  const handleAddFile = () => {
    const newFile: FileItem = {
      id: files.length + 1,
      name: `New Document ${files.length + 1}`,
      filename: `document-${files.length + 1}.pdf`,
      description: 'New document description',
      uploadDate: new Date().toISOString().split('T')[0]
    };
    setFiles([...files, newFile]);
  };

  const handleDeleteFile = (id: number) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      setFiles(files.filter(file => file.id !== id));
    }
  };


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
