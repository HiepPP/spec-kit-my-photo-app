import React from 'react';
import { Image } from '../../types/image';
import { useImageDetail } from '../../hooks/useImageDetail';
import { Card, CardContent } from '../../components/ui/card';
import { ImageMetadataCompact } from '../ImageMetadata/ImageMetadata';

interface ImageGalleryProps {
  images: Image[];
  loading?: boolean;
  error?: string | null;
  className?: string;
  onImageClick?: (image: Image) => void;
}

export function ImageGallery({ 
  images, 
  loading = false, 
  error = null,
  className = '',
  onImageClick
}: ImageGalleryProps) {
  const { openDetail } = useImageDetail();

  const handleImageClick = (image: Image) => {
    if (onImageClick) {
      onImageClick(image);
    } else {
      // Default behavior: open detail view with image ID
      openDetail(image.id);
    }
  };

  if (loading) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="aspect-square">
            <CardContent className="p-0 h-full">
              <div className="animate-pulse bg-gray-200 w-full h-full rounded-lg"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <p className="text-red-500 mb-2">Error loading images</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <p className="text-muted-foreground">No images found</p>
      </div>
    );
  }

  return (
    <div className={`gallery-container ${className}`}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <Card 
            key={image.id} 
            className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-200"
            onClick={() => handleImageClick(image)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleImageClick(image);
              }
            }}
            aria-label={`View ${image.caption || image.filename}`}
          >
            <CardContent className="p-0 relative h-48">
              {/* Image Thumbnail */}
              <img
                src={image.url}
                alt={image.caption || image.filename}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div className="text-white text-center p-4">
                  <p className="font-medium truncate">
                    {image.caption || image.filename}
                  </p>
                  <ImageMetadataCompact image={image} className="text-white/80 mt-2" />
                </div>
              </div>
              
              {/* Image Badge */}
              {image.tags.length > 0 && (
                <div className="absolute top-2 right-2">
                  <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {image.tags.length} {image.tags.length === 1 ? 'tag' : 'tags'}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Export a memoized version for performance
export const MemoizedImageGallery = React.memo(ImageGallery);

// Gallery with additional features
interface EnhancedGalleryProps extends ImageGalleryProps {
  selectable?: boolean;
  selectedImages?: Set<string>;
  onSelectionChange?: (selectedIds: Set<string>) => void;
}

export function EnhancedGallery({
  images,
  selectable = false,
  selectedImages = new Set(),
  onSelectionChange,
  ...props
}: EnhancedGalleryProps) {
  const handleImageClick = (image: Image) => {
    if (selectable) {
      const newSelected = new Set(selectedImages);
      if (newSelected.has(image.id)) {
        newSelected.delete(image.id);
      } else {
        newSelected.add(image.id);
      }
      onSelectionChange?.(newSelected);
    } else {
      props.onImageClick?.(image);
    }
  };

  return (
    <ImageGallery
      {...props}
      images={images}
      onImageClick={handleImageClick}
    />
  );
}