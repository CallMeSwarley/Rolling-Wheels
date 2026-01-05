'use client';

import data from '@/data/data.json';
import type { FileItem } from '@/types';
import SideMenu from '../components/SideMenu';

export default function DownloadsPage() {
  const files: FileItem[] = data.files;

  const handleDownload = (filename: string) => {
    const link = document.createElement('a');
    link.href = `/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="main-content">
      <div className="with-sidebar">
        <SideMenu />
        <main className="page-content">
          <h2 style={{ color: '#dc2626', marginBottom: '2rem' }}>Anmeldeformulare herunterladen</h2>
          <p style={{ color: '#4a5568', marginBottom: '2rem' }}>
            Laden Sie die erforderlichen Anmeldeformulare herunter, um den Rolling Wheels beizutreten oder beim Workshop mitzumachen. Alle Formulare sind im PDF-Format.
          </p>
          <ul className="downloads-list">
            {files.map((file) => (
              <li key={file.id} className="download-item">
                <div className="download-info">
                  <h3>{file.name}</h3>
                  <p>{file.description}</p>
                  <small style={{ color: '#a0aec0' }}>Hochgeladen: {file.uploadDate}</small>
                </div>
                <button 
                  className="download-button"
                  onClick={() => handleDownload(file.filename)}
                >
                  PDF herunterladen
                </button>
              </li>
            ))}
          </ul>
        </main>
      </div>
    </div>
  );
}
