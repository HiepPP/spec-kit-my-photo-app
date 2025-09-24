/**
 * Core data interfaces for the Photo Organizer App
 * Based on contracts from specs/001-build-a-photo/contracts/
 */

// ============================================================================
// Core Data Types
// ============================================================================

export interface Photo {
  id: number
  filename: string
  albumId: number
  fileData: Blob
  thumbnailData: Blob
  captureDate: Date | null
  fileSize: number
  width: number
  height: number
  uploadTimestamp: Date
}

export interface Album {
  id: number
  name: string
  captureDate: Date
  displayOrder: number
  thumbnailPhotoId: number | null
  photoCount: number
  createdAt: Date
  updatedAt: Date
}

export interface UploadSession {
  id: string
  status: 'processing' | 'completed' | 'failed'
  totalFiles: number
  processedFiles: number
  errorCount: number
  startedAt: Date
  completedAt: Date | null
}

// ============================================================================
// Service Interfaces
// ============================================================================

export interface PhotoService {
  uploadPhotos(files: File[]): Promise<UploadSession>
  getAllAlbums(): Promise<Album[]>
  getPhotosInAlbum(albumId: number): Promise<Photo[]>
  getFullPhoto(photoId: number): Promise<Photo>
  updateAlbumOrder(albumId: number, newOrder: number): Promise<void>
  exportAlbumAsZip(albumId: number): Promise<Blob>
  deletePhoto(photoId: number): Promise<void>
  deleteAlbum(albumId: number): Promise<void>
}

export interface PhotoServiceEvents {
  uploadProgress: {
    sessionId: string
    processedFiles: number
    totalFiles: number
    currentFile?: string
  }
  uploadComplete: {
    sessionId: string
    newAlbums: Album[]
    totalPhotos: number
  }
  uploadError: {
    sessionId: string
    filename: string
    error: string
  }
  albumOrderChanged: {
    albumId: number
    oldOrder: number
    newOrder: number
  }
}

// ============================================================================
// Component Props
// ============================================================================

interface BaseComponentProps {
  className?: string
  'data-testid'?: string
}

export interface AlbumGridProps extends BaseComponentProps {
  albums: Album[]
  onAlbumClick: (albumId: number) => void
  onAlbumReorder: (albumId: number, newOrder: number) => void
  onAlbumDelete?: (albumId: number) => void
  loading?: boolean
}

export interface AlbumTileProps extends BaseComponentProps {
  album: Album
  thumbnailSrc?: string
  onClick: () => void
  onDelete?: () => void
  isDragging?: boolean
  dragHandleProps?: any
}

export interface PhotoTileViewProps extends BaseComponentProps {
  photos: Photo[]
  onPhotoClick: (photoId: number) => void
  onPhotoDelete?: (photoId: number) => void
  loading?: boolean
  selectedPhotoId?: number
}

export interface PhotoTileProps extends BaseComponentProps {
  photo: Photo
  thumbnailSrc: string
  onClick: () => void
  onDelete?: () => void
  isSelected?: boolean
}

export interface ZoomModalProps extends BaseComponentProps {
  isOpen: boolean
  onClose: () => void
  photo: Photo | null
  photos: Photo[]
  currentIndex: number
  onNext: () => void
  onPrevious: () => void
  onDelete?: (photoId: number) => void
}

export interface UploadDropzoneProps extends BaseComponentProps {
  onFilesSelected: (files: FileList) => void
  uploadSession?: UploadSession
  acceptedFileTypes?: string[]
  maxFileSize?: number
  isUploading?: boolean
}

export interface UploadProgressProps extends BaseComponentProps {
  session: UploadSession
  onCancel?: () => void
  showDetails?: boolean
}

export interface NavigationProps extends BaseComponentProps {
  currentView: 'albums' | 'photos'
  albumName?: string
  onBackToAlbums?: () => void
  onExportAlbum?: () => void
  canExport?: boolean
}

export interface SearchProps extends BaseComponentProps {
  onSearch: (query: string) => void
  placeholder?: string
  suggestions?: string[]
}

// ============================================================================
// Accessibility and Interaction Types
// ============================================================================

export interface AccessibilityProps {
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  role?: string
  tabIndex?: number
}

export interface DraggableProps extends AccessibilityProps {
  draggable: boolean
  onDragStart: (event: React.DragEvent) => void
  onDragEnd: (event: React.DragEvent) => void
}

export interface DroppableProps extends AccessibilityProps {
  onDragOver: (event: React.DragEvent) => void
  onDrop: (event: React.DragEvent) => void
  onDragEnter: (event: React.DragEvent) => void
  onDragLeave: (event: React.DragEvent) => void
}

// ============================================================================
// Event Handler Types
// ============================================================================

export type PhotoEventHandler = (photoId: number) => void
export type AlbumEventHandler = (albumId: number) => void
export type FileSelectHandler = (files: FileList) => void
export type OrderChangeHandler = (itemId: number, newOrder: number) => void

// ============================================================================
// Application State Types
// ============================================================================

export interface ViewState {
  currentView: 'albums' | 'photos'
  selectedAlbumId?: number
  selectedPhotoId?: number
  isZoomModalOpen: boolean
}

export interface LoadingState {
  albums: boolean
  photos: boolean
  upload: boolean
  export: boolean
}

export interface ErrorState {
  message: string
  type: 'upload' | 'load' | 'delete' | 'export'
  timestamp: Date
}

// ============================================================================
// Pagination and Infinite Scroll Types
// ============================================================================

export interface PaginationInfo {
  page: number
  pageSize: number
  totalAlbums: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationInfo
}

export interface InfiniteScrollOptions {
  threshold?: number
  rootMargin?: string
  enabled?: boolean
}

// ============================================================================
// Mock Data Types
// ============================================================================

export interface MockDataOptions {
  albumCount?: number
  photosPerAlbum?: number
  withDelay?: boolean
  delayRange?: [number, number]
}

// ============================================================================
// Utility Types
// ============================================================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// Helper type for component ref forwarding
export type ComponentWithRef<T, P = {}> = React.ForwardRefExoticComponent<
  P & React.RefAttributes<T>
>

// Helper type for async component states
export type AsyncState<T> = {
  data: T | null
  loading: boolean
  error: string | null
}