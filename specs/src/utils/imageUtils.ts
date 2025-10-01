import { Image } from '../types/image';

/**
 * Generate a display URL for an image
 */
export function getImageUrl(image: Image): string {
  // If we have a blob URL, use it directly
  if (image.url.startsWith('blob:')) {
    return image.url;
  }
  
  // If we have a data URL, use it directly
  if (image.url.startsWith('data:')) {
    return image.url;
  }
  
  // For remote URLs, ensure they're absolute
  if (image.url.startsWith('http')) {
    return image.url;
  }
  
  // For relative paths, construct API URL
  if (image.url.startsWith('/')) {
    // In development, we might need to add the base URL
    if (process.env.NODE_ENV === 'development') {
      return `http://localhost:5173${image.url}`;
    }
    return image.url;
  }
  
  // Fallback to API endpoint
  return `/api/images/${image.id}/file`;
}

/**
 * Generate a thumbnail URL for an image
 */
export function getThumbnailUrl(image: Image, size: 'small' | 'medium' | 'large' = 'medium'): string {
  const sizeMap = {
    small: '150x150',
    medium: '300x300',
    large: '600x600',
  };
  
  // If we have a blob URL, we can't generate thumbnails on the fly
  // In a real app, this would be handled by the server
  if (image.url.startsWith('blob:') || image.url.startsWith('data:')) {
    return image.url;
  }
  
  return `/api/images/${image.id}/thumbnail?size=${sizeMap[size]}`;
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format image dimensions
 */
export function formatDimensions(width?: number, height?: number): string {
  if (!width || !height) return 'Unknown';
  return `${width.toLocaleString()} × ${height.toLocaleString()} px`;
}

/**
 * Format date in a user-friendly way
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Check if the date is valid
  if (isNaN(d.getTime())) {
    return 'Invalid date';
  }
  
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
}

/**
 * Get image orientation
 */
export function getImageOrientation(width?: number, height?: number): 'landscape' | 'portrait' | 'square' {
  if (!width || !height) return 'landscape';
  
  if (width > height) return 'landscape';
  if (height > width) return 'portrait';
  return 'square';
}

/**
 * Calculate aspect ratio
 */
export function getAspectRatio(width?: number, height?: number): number {
  if (!width || !height || height === 0) return 1;
  return width / height;
}

/**
 * Generate a safe filename for download
 */
export function getSafeFilename(image: Image): string {
  // Remove special characters and spaces
  const safeName = image.filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  // Ensure it has the correct extension
  const extension = image.mimeType.split('/')[1]?.toLowerCase() || 'jpg';
  if (!safeName.endsWith(`.${extension}`)) {
    return `${safeName}.${extension}`;
  }
  
  return safeName;
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Check if an image is loaded
 */
export function isImageLoaded(img: HTMLImageElement): boolean {
  return img.complete && img.naturalHeight !== 0;
}

/**
 * Preload an image
 */
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}