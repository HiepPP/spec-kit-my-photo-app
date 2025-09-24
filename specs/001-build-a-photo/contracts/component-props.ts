/**
 * Component Props Contracts
 * Defines prop interfaces for all React components
 */

import { Photo, Album, UploadSession } from './photo-service';

// Base component props
interface BaseComponentProps {
  className?: string;
  'data-testid'?: string;
}

// Album Grid Component
export interface AlbumGridProps extends BaseComponentProps {
  albums: Album[];
  onAlbumClick: (albumId: number) => void;
  onAlbumReorder: (albumId: number, newOrder: number) => void;
  onAlbumDelete?: (albumId: number) => void;
  loading?: boolean;
}

// Album Tile Component
export interface AlbumTileProps extends BaseComponentProps {
  album: Album;
  thumbnailSrc?: string;
  onClick: () => void;
  onDelete?: () => void;
  isDragging?: boolean;
  dragHandleProps?: any;
}

// Photo Tile View Component
export interface PhotoTileViewProps extends BaseComponentProps {
  photos: Photo[];
  onPhotoClick: (photoId: number) => void;
  onPhotoDelete?: (photoId: number) => void;
  loading?: boolean;
  selectedPhotoId?: number;
}

// Individual Photo Tile Component
export interface PhotoTileProps extends BaseComponentProps {
  photo: Photo;
  thumbnailSrc: string;
  onClick: () => void;
  onDelete?: () => void;
  isSelected?: boolean;
}

// Zoom Modal Component
export interface ZoomModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  photo: Photo | null;
  photos: Photo[];
  currentIndex: number;
  onNext: () => void;
  onPrevious: () => void;
  onDelete?: (photoId: number) => void;
}

// Upload Dropzone Component
export interface UploadDropzoneProps extends BaseComponentProps {
  onFilesSelected: (files: FileList) => void;
  uploadSession?: UploadSession;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
  isUploading?: boolean;
}

// Upload Progress Component
export interface UploadProgressProps extends BaseComponentProps {
  session: UploadSession;
  onCancel?: () => void;
  showDetails?: boolean;
}

// Navigation Component
export interface NavigationProps extends BaseComponentProps {
  currentView: 'albums' | 'photos';
  albumName?: string;
  onBackToAlbums?: () => void;
  onExportAlbum?: () => void;
  canExport?: boolean;
}

// Search Component (future)
export interface SearchProps extends BaseComponentProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  suggestions?: string[];
}

// Accessibility props for complex interactions
export interface AccessibilityProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  role?: string;
  tabIndex?: number;
}

// Drag and Drop props
export interface DraggableProps extends AccessibilityProps {
  draggable: boolean;
  onDragStart: (event: React.DragEvent) => void;
  onDragEnd: (event: React.DragEvent) => void;
}

export interface DroppableProps extends AccessibilityProps {
  onDragOver: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
  onDragEnter: (event: React.DragEvent) => void;
  onDragLeave: (event: React.DragEvent) => void;
}

// Event handler types
export type PhotoEventHandler = (photoId: number) => void;
export type AlbumEventHandler = (albumId: number) => void;
export type FileSelectHandler = (files: FileList) => void;
export type OrderChangeHandler = (itemId: number, newOrder: number) => void;

// Component state types
export interface ViewState {
  currentView: 'albums' | 'photos';
  selectedAlbumId?: number;
  selectedPhotoId?: number;
  isZoomModalOpen: boolean;
}

export interface LoadingState {
  albums: boolean;
  photos: boolean;
  upload: boolean;
  export: boolean;
}

export interface ErrorState {
  message: string;
  type: 'upload' | 'load' | 'delete' | 'export';
  timestamp: Date;
}