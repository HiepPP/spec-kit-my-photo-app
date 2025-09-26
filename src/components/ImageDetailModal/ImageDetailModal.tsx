import React, { useEffect, useRef } from 'react';
import { Image, User } from '../../types';
import { ImageMetadata } from '../ImageMetadata/ImageMetadata';
import { useImageDetail, useImageDetailById, useImageFile } from '../../hooks/useImageDetail';
import { useFocusTrap, useAriaAnnouncement } from '../../hooks/useFocusTrap';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { X, Download, RotateCcw } from 'lucide-react';

interface ImageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  image?: Image | null;
  imageId?: string | null;
  user?: User | null;
  className?: string;
}

export function ImageDetailModal({ 
  isOpen, 
  onClose, 
  image: initialImage, 
  imageId,
  user,
  className = '' 
}: ImageDetailModalProps) {
  const { state, setImage, setLoading, setError } = useImageDetail();
  const { getImageById, isLoading: isLoadingImage } = useImageDetailById();
  const { getImageFile, isLoading: isLoadingFile, error: fileError } = useImageFile();
  
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [imageLoadError, setImageLoadError] = useState(false);
  const modalRef = useFocusTrap(isOpen);
  const { announce, AnnouncementRegion } = useAriaAnnouncement();

  useEffect(() => {
    // Announce when modal opens/closes\n    if (isOpen) {\n      announce('Image detail view opened');\n    }\n\n    const loadImageData = async () => {
      if (!isOpen) return;

      // If we have an image prop, use it directly
      if (initialImage) {
        setImage(initialImage);
        setImageUrl(initialImage.url);
        setImageLoadError(false);
        return;
      }

      // If we have an imageId, fetch the image data
      if (imageId) {
        setLoading(true);
        try {
          const imageData = await getImageById(imageId);
          if (imageData) {
            setImage(imageData);
            
            // Fetch the actual image file
            const fileUrl = await getImageFile(imageId);
            setImageLoadError(false);
            if (fileUrl) {
              setImageUrl(fileUrl);
            } else {
              // Fallback to the URL from image data
              setImageUrl(imageData.url);
            }
          } else {
            setError('Image not found');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load image');
        }
        setLoading(false);
      }
    };

    loadImageData();
  }, [isOpen, initialImage, imageId, getImageById, getImageFile, setImage, setLoading, setError, announce]);

  useEffect(() => {
    // Cleanup image URL when modal closes or component unmounts
    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node) && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleDownload = () => {
    if (imageUrl && state.selectedImage) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = state.selectedImage.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
    announce(`Image rotated ${(rotation + 90) % 360} degrees`);
  };

  const isLoading = state.isLoading || isLoadingImage;
  const isFileLoading = isLoadingFile && !imageLoadError;
  const error = state.error || fileError;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        ref={modalRef}
        className={`max-w-7xl w-full max-h-[90vh] p-0 ${className}`}
        aria-modal="true"
        role="dialog"
        aria-labelledby="modal-title"
      >
        <DialogHeader className="p-6 pb-0">
          <DialogTitle 
            id="modal-title" 
            className="sr-only"
          >
            Image Detail View
          </DialogTitle>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {state.selectedImage?.filename || 'Image Details'}
            </h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleRotate}
                aria-label="Rotate image"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleDownload}
                disabled={!state.selectedImage || !imageUrl}
                aria-label="Download image"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={onClose}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex flex-col lg:flex-row h-[calc(90vh-120px)]">
          {/* Image Display */}
          <div className="flex-1 flex items-center justify-center bg-black p-2 sm:p-4 overflow-hidden order-1 lg:order-none">
            {isLoading ? (
              <div className="text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                <p>Loading image...</p>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center p-4">
                <p className="mb-2">Error loading image</p>
                <p className="text-sm">{error}</p>
              </div>
            ) : imageUrl && state.selectedImage ? (
              <div className="relative max-w-full max-h-full">
                {imageLoadError ? (
                  <div className="flex flex-col items-center justify-center h-full text-white p-8">
                    <div className="text-6xl mb-4">🖼️</div>
                    <p className="text-xl mb-2">Failed to load image</p>
                    <p className="text-sm text-gray-300 mb-4">
                      The image could not be displayed
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setImageLoadError(false);
                        // Try to reload by resetting the URL
                        const tempUrl = imageUrl;
                        setImageUrl(null);
                        setTimeout(() => setImageUrl(tempUrl), 100);
                      }}
                    >
                      Retry
                    </Button>
                  </div>
                ) : (
                  <>
                    <img
                      src={imageUrl}
                      alt={state.selectedImage.caption || state.selectedImage.filename}
                      className="max-w-full max-h-full object-contain transition-opacity duration-300"
                      style={{ transform: `rotate(${rotation}deg)` }}
                      draggable={false}
                      onLoad={() => setImageLoadError(false)}
                      onError={() => {
                        setImageLoadError(true);
                        announce('Failed to load image');
                      }}
                    />
                    <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-sm">
                      {state.selectedImage.width && state.selectedImage.height && (
                        <span>{state.selectedImage.width} × {state.selectedImage.height} px</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-gray-500">No image selected</div>
            )}
          </div>
          
          {/* Metadata Panel */}
          <div className="lg:w-96 w-full max-w-full border-t lg:border-t-0 lg:border-l overflow-y-auto order-2 lg:order-none max-h-[50vh] lg:max-h-none">
            {state.selectedImage ? (
              <div className="p-4">
                <ImageMetadata 
                  image={state.selectedImage} 
                  user={user} 
                  className="border-0 shadow-none"
                />
                
                {state.selectedImage.caption && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold text-sm mb-2">Caption</h3>
                    <p className="text-sm">{state.selectedImage.caption}</p>
                  </div>
                )}
              </div>
            ) : isLoading ? (
              <div className="p-4">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No image data available
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>

  <AnnouncementRegion />
  );
}

// Export a default version for easier importing
export default ImageDetailModal;