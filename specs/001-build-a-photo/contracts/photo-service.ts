/**
 * Photo Service Contract
 * Defines interfaces for photo management operations
 */

export interface Photo {
  id: number;
  filename: string;
  albumId: number;
  fileData: Blob;
  thumbnailData: Blob;
  captureDate: Date | null;
  fileSize: number;
  width: number;
  height: number;
  uploadTimestamp: Date;
}

export interface Album {
  id: number;
  name: string;
  captureDate: Date;
  displayOrder: number;
  thumbnailPhotoId: number | null;
  photoCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadSession {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  totalFiles: number;
  processedFiles: number;
  errorCount: number;
  startedAt: Date;
  completedAt: Date | null;
}

export interface PhotoService {
  /**
   * Upload multiple photos and group into albums by date
   * @param files - File objects to upload
   * @returns Upload session for tracking progress
   */
  uploadPhotos(files: File[]): Promise<UploadSession>;

  /**
   * Get all albums ordered by display order
   * @returns Array of albums with basic metadata
   */
  getAllAlbums(): Promise<Album[]>;

  /**
   * Get all photos for a specific album
   * @param albumId - Album identifier
   * @returns Array of photos with thumbnail data
   */
  getPhotosInAlbum(albumId: number): Promise<Photo[]>;

  /**
   * Get full photo data for zoom view
   * @param photoId - Photo identifier
   * @returns Photo with full-size image data
   */
  getFullPhoto(photoId: number): Promise<Photo>;

  /**
   * Update album display order after drag-and-drop
   * @param albumId - Album to move
   * @param newOrder - New display order position
   */
  updateAlbumOrder(albumId: number, newOrder: number): Promise<void>;

  /**
   * Export album as ZIP file
   * @param albumId - Album to export
   * @returns Blob containing ZIP file
   */
  exportAlbumAsZip(albumId: number): Promise<Blob>;

  /**
   * Delete photo and update album
   * @param photoId - Photo to delete
   */
  deletePhoto(photoId: number): Promise<void>;

  /**
   * Delete album and all contained photos
   * @param albumId - Album to delete
   */
  deleteAlbum(albumId: number): Promise<void>;
}

export interface PhotoServiceEvents {
  /**
   * Emitted during photo upload progress
   */
  uploadProgress: {
    sessionId: string;
    processedFiles: number;
    totalFiles: number;
    currentFile?: string;
  };

  /**
   * Emitted when upload session completes
   */
  uploadComplete: {
    sessionId: string;
    newAlbums: Album[];
    totalPhotos: number;
  };

  /**
   * Emitted when upload encounters errors
   */
  uploadError: {
    sessionId: string;
    filename: string;
    error: string;
  };

  /**
   * Emitted when album order changes
   */
  albumOrderChanged: {
    albumId: number;
    oldOrder: number;
    newOrder: number;
  };
}