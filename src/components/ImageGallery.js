import React from 'react';
import data from '../data/data.json';

function ImageGallery() {
  const images = data.galleryImages;

  return (
    <div className="image-gallery">
      {images.map((image) => (
        <div key={image.id} className="gallery-item">
          <img src={image.url} alt={image.alt} />
          <div className="gallery-item-caption">
            {image.caption}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ImageGallery;
