'use client';

import { useState, useEffect } from 'react';

interface ImageCarouselProps {
  folder: string;
  images?: string[];
  autoPlay?: boolean;
  interval?: number;
}

export default function ImageCarousel({ 
  folder, 
  images = [],
  autoPlay = false,
  interval = 3000 
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [imageList, setImageList] = useState<string[]>(images);
  const [loading, setLoading] = useState(false);

  // Auto-fetch images from manifest if images array is empty but folder is provided
  useEffect(() => {
    if (images.length === 0 && folder) {
      setLoading(true);
      // Fetch from the generated image manifest
      fetch('/image-manifest.json')
        .then(res => res.json())
        .then(manifest => {
          const folderName = folder.replace('/events/', '').replace(/^\//g, '');
          const folderImages = manifest[folderName] || [];
          setImageList(folderImages);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error loading image manifest:', error);
          setLoading(false);
        });
    } else {
      setImageList(images);
    }
  }, [images, folder]);

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && imageList.length > 0) {
      const timer = setInterval(() => {
        nextSlide();
      }, interval);
      return () => clearInterval(timer);
    }
  }, [currentIndex, autoPlay, interval, imageList.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % imageList.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Handle touch events for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      // Swiped left
      nextSlide();
    }
    if (touchStart - touchEnd < -75) {
      // Swiped right
      prevSlide();
    }
  };

  // Handle mouse drag for swipe
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    const dragEnd = e.clientX;
    if (dragStart - dragEnd > 75) {
      nextSlide();
    }
    if (dragStart - dragEnd < -75) {
      prevSlide();
    }
  };

  if (loading) {
    return (
      <div className="carousel-empty">
        <p>Lade Bilder...</p>
      </div>
    );
  }

  if (imageList.length === 0) {
    return (
      <div className="carousel-empty">
        <p>No images to display</p>
      </div>
    );
  }

  return (
    <div className="carousel-container">
      <div 
        className="carousel-wrapper"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsDragging(false)}
      >
        {/* Previous Button */}
        <button 
          className="carousel-button carousel-button-prev"
          onClick={prevSlide}
          aria-label="Previous image"
        >
          &#10094;
        </button>

        {/* Image Display */}
        <div className="carousel-image-container">
          <img
            src={imageList[currentIndex].startsWith('/') ? imageList[currentIndex] : `${folder}/${imageList[currentIndex]}`}
            alt={`Image ${currentIndex + 1}`}
            className="carousel-image"
          />
        </div>

        {/* Next Button */}
        <button 
          className="carousel-button carousel-button-next"
          onClick={nextSlide}
          aria-label="Next image"
        >
          &#10095;
        </button>

        {/* Image Counter */}
        <div className="carousel-counter">
          {currentIndex + 1} / {imageList.length}
        </div>
      </div>

      {/* Dots Navigation */}
      <div className="carousel-dots">
        {imageList.map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>

      <style jsx>{`
        .carousel-container {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
        }

        .carousel-wrapper {
          position: relative;
          width: 100%;
          height: 500px;
          overflow: hidden;
          user-select: none;
          cursor: grab;
        }

        .carousel-wrapper:active {
          cursor: grabbing;
        }

        .carousel-image-container {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f0f0f0;
        }

        .carousel-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          transition: opacity 0.3s ease-in-out;
        }

        .carousel-button {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          font-size: 24px;
          padding: 16px;
          cursor: pointer;
          z-index: 10;
          transition: background-color 0.3s;
        }

        .carousel-button:hover {
          background-color: rgba(0, 0, 0, 0.8);
        }

        .carousel-button-prev {
          left: 10px;
        }

        .carousel-button-next {
          right: 10px;
        }

        .carousel-counter {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
        }

        .carousel-dots {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 20px;
        }

        .carousel-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: none;
          background-color: #ccc;
          cursor: pointer;
          transition: background-color 0.3s;
          padding: 0;
        }

        .carousel-dot.active {
          background-color: #333;
        }

        .carousel-dot:hover {
          background-color: #666;
        }

        .carousel-empty {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        @media (max-width: 768px) {
          .carousel-wrapper {
            height: 300px;
          }

          .carousel-button {
            font-size: 18px;
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
}
