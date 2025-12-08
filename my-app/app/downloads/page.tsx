'use client';

import data from '@/data/data.json';
import type { FileItem } from '@/types';

export default function DownloadsPage() {
  const files: FileItem[] = data.files;

  const handleDownload = (filename: string) => {
    alert(`Downloading ${filename}... (In a real application, this would trigger a PDF download)`);
  };

  return (
    <div className="main-content">
      <div className="page-content full-width">
        <h2 style={{ color: '#667eea', marginBottom: '2rem' }}>Download Registration Forms</h2>
        <p style={{ color: '#4a5568', marginBottom: '2rem' }}>
          Download the necessary registration forms to join Rolling Wheels. All forms are in PDF format.
        </p>
        <ul className="downloads-list">
          {files.map((file) => (
            <li key={file.id} className="download-item">
              <div className="download-info">
                <h3>{file.name}</h3>
                <p>{file.description}</p>
                <small style={{ color: '#a0aec0' }}>Uploaded: {file.uploadDate}</small>
              </div>
              <button 
                className="download-button"
                onClick={() => handleDownload(file.filename)}
              >
                Download PDF
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
