'use client';

import { useState } from 'react';
import ImageCarousel from '../components/ImageCarousel';
import data from '@/data/data.json';
import { Event } from '@/types';
import SideMenu from '../components/SideMenu';


export default function EventsPage() {
  const events: Event[] = data.events || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="main-content">
      <div className="with-sidebar">
        <SideMenu />
        <main className="page-content">
          <div className="container">
            <h2 style={{ color: '#dc2626', marginBottom: '2rem' }}>Unsere Events</h2>
            <div className="events-grid">
              {events.length === 0 ? (
                <p>Aktuell sind keine Events verfügbar.</p>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="event-card">
                    <div className="event-header">
                      <h2>{event.title}</h2>
                      <p className="event-date">{formatDate(event.date)}</p>
                    </div>

                    <div className="event-summary">
                      <p>{event.summary}</p>
                    </div>

                    <div className="event-images">
                      {event.folder ? (
                        // Auto-load images from folder
                        <ImageCarousel
                          folder={event.folder}
                          images={event.images || []}
                          autoPlay={true}
                        />
                      ) : event.images && event.images.length === 1 ? (
                        // Display single image without carousel controls
                        <div className="single-image-container">
                          <img
                            src={event.images[0]}
                            alt={event.title}
                            className="single-image"
                          />
                        </div>
                      ) : event.images && event.images.length > 1 ? (
                        // Use carousel for multiple images
                        <ImageCarousel
                          folder=""
                          images={event.images}
                          autoPlay={false}
                        />
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <style jsx>{`
          .container {
            max-width: 1200px;
            margin: 0 auto;
            width: 100%;
            overflow-x: hidden;
          }

          .intro-text {
            text-align: center;
            color: #666;
            font-size: 1.1rem;
            margin-bottom: 50px;
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
          }

          .events-grid {
            display: flex;
            flex-direction: column;
            gap: 40px;
          }

          .event-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            transition: transform 0.3s, box-shadow 0.3s;
          }

          .event-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          }

          .event-header {
            padding: 30px 30px 20px;
            border-bottom: 2px solid #f0f0f0;
          }

          .event-header h2 {
            font-size: 2rem;
            color: #333;
            margin-bottom: 10px;
            overflow-wrap: break-word;
            word-wrap: break-word;
          }

          .event-date {
            color: #888;
            font-size: 1rem;
            font-weight: 500;
          }

          .event-summary {
            padding: 20px 30px;
          }

          .event-summary p {
            color: #555;
            line-height: 1.6;
            font-size: 1.1rem;
            overflow-wrap: break-word;
            word-wrap: break-word;
          }

          .event-images {
            padding: 0 30px 30px;
          }

          .single-image-container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .single-image {
            width: 100%;
            height: auto;
            display: block;
            object-fit: cover;
          }

          @media (max-width: 768px) {
            .container {
              padding: 0;
            }

            .event-card {
              border-radius: 8px;
              margin: 0;
            }

            .event-header {
              padding: 15px 15px 12px;
            }

            .event-header h2 {
              font-size: 1.3rem;
            }

            .event-summary {
              padding: 12px 15px;
            }

            .event-summary p {
              font-size: 0.95rem;
            }

            .event-images {
              padding: 0 15px 15px;
            }
          }

          @media (max-width: 480px) {
            .event-header {
              padding: 12px 12px 10px;
            }

            .event-header h2 {
              font-size: 1.2rem;
            }

            .event-summary {
              padding: 10px 12px;
            }

            .event-images {
              padding: 0 12px 12px;
            }
          }
        `}</style>
        </main>
      </div>
    </div>
  );
}
