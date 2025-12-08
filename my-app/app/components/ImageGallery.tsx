import Image from 'next/image';
import data from '@/data/data.json';
import type { GalleryImage } from '@/types';

export default function ImageGallery() {
  const images: GalleryImage[] = data.galleryImages;

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
