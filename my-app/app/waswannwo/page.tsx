"use client";

import { useState, useEffect } from "react";
import SideMenu from '../components/SideMenu';

export default function WasWannWo() {
  const [content, setContent] = useState<string>('<p>Lade Daten...</p>');

  // Read the eintritt.XML file
  async function loadEintritt() {
    // const res = await fetch('http://localhost:1234/file-api.php', {
      const res = await fetch('/php_spielerei/file-api.php', { // for production
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'read_eintritt' })
    });
    console.log('Response from file-api.php:', res);
    return await res.json();
  }

  // Decode HTML entities
  function decodeHtmlEntities(html: string): string {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = html;
    return textarea.value;
  }

  // Load on mount
  useEffect(() => {
    loadEintritt().then(data => {
      console.log('Received data:', data);
      if (data.success) {
        const xmlContent = data.content;

        // Parse XML to extract CDATA content
        const contentMatch = xmlContent.match(/<content><!\[CDATA\[(.*?)\]\]><\/content>/s);

        if (contentMatch && contentMatch[1]) {
          // Decode HTML entities
          const decodedContent = decodeHtmlEntities(contentMatch[1]);
          setContent(decodedContent);
        } else {
          setContent('<p>Kein Inhalt in XML gefunden.</p>');
        }
      } else {
        setContent("<p>" + (data.error || 'Fehler beim Laden der Daten.') + "</p>");
      }
    }).catch(error => {
      console.error('Error loading data:', error);
      setContent('<p>Fehler beim Laden der Daten.</p>');
    });
  }, []);

  return (
    <div className="main-content">
      <div className="with-sidebar">
        <SideMenu />
        <main className="page-content">
          <a
            href="https://rolling-wheels.net/admin/pages.php"
            className="edit-button"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              marginBottom: '20px',
              background: 'linear-gradient(135deg, #dc2626 0%, #1f2937 100%)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '5px',
              fontWeight: '600',
              transition: 'all 0.3s',
            }}
          >
            ✏️ Edit Content
          </a>
          <div className="xml-content-container max-w-full px-4 md:px-8">
            <div
              className="xml-content"
              dangerouslySetInnerHTML={{ __html: content }}
              style={{
                lineHeight: '1.8',
                color: '#4a5568'
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
