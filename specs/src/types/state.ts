import { Image } from './image';
import { User } from './user';

export interface ImageDetailState {
  isOpen: boolean;
  selectedImage: Image | null;
  isLoading: boolean;
  error: string | null;
}

export interface GalleryState {
  images: Image[];
  filters: GalleryFilters;
  selectedImageId: string | null;
  isDetailOpen: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface GalleryFilters {
  searchQuery?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  uploadedBy?: string;
}

export interface UploadState {
  isUploading: boolean;
  progress: number;
  files: File[];
  uploadedImages: Image[];
  error: string | null;
}

export interface AppState {
  gallery: GalleryState;
  imageDetail: ImageDetailState;
  upload: UploadState;
  auth: AuthState;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export interface ToastState {
  messages: ToastMessage[];
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}