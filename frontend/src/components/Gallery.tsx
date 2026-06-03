import React, { useState } from 'react';

interface GalleryImage {
  id: number;
  post_id: number;
  image_data: string;
  image_mime: string;
  created_at: string;
}

interface GalleryProps {
  images: GalleryImage[];
  onClose: () => void;
}

const getBase64Image = (imageData: string, mimeType: string): string => {
  if (!imageData) return '';
  return `data:${mimeType || 'image/jpeg'};base64,${imageData}`;
};

const Gallery: React.FC<GalleryProps> = ({ images, onClose }) => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const handleImageClick = (image: GalleryImage, index: number) => {
    setSelectedImage(image);
    setCurrentIndex(index);
  };

  const closeFullscreen = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedImage(images[currentIndex + 1]);
    }
  };

  const prevImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedImage(images[currentIndex - 1]);
    }
  };

  return (
    <>
      {/* Модалка галереи */}
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content gallery-modal" onClick={(e) => e.stopPropagation()}>
          <div className="gallery-modal-header">
            <h2 className="gallery-modal-title">Все фото ({images.length})</h2>
            <button 
              className="gallery-modal-close"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
          <div className="gallery-modal-grid">
            {images.map((image, index) => (
              <div 
                key={image.id} 
                className="gallery-modal-item"
                onClick={() => handleImageClick(image, index)}
              >
                <img 
                  src={getBase64Image(image.image_data, image.image_mime)} 
                  alt={`Фото ${index + 1}`}
                  className="gallery-modal-img"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Полноэкранный просмотр фото */}
      {selectedImage && (
        <div className="gallery-fullscreen-modal" onClick={closeFullscreen}>
          <button 
            className="gallery-fullscreen-close"
            onClick={closeFullscreen}
          >
            ✕
          </button>
          
          {images.length > 1 && (
            <>
              {currentIndex > 0 && (
                <button 
                  className="gallery-fullscreen-nav prev"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                >
                  ‹
                </button>
              )}
              {currentIndex < images.length - 1 && (
                <button 
                  className="gallery-fullscreen-nav next"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                >
                  ›
                </button>
              )}
            </>
          )}
          
          <img 
            src={getBase64Image(selectedImage.image_data, selectedImage.image_mime)} 
            alt="Full size"
            className="gallery-fullscreen-img"
            onClick={(e) => e.stopPropagation()}
          />
          
          {images.length > 1 && (
            <div className="gallery-fullscreen-counter">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Gallery;