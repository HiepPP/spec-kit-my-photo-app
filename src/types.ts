export interface ViewState {
  currentView: 'albums' | 'photos';
  isZoomModalOpen: boolean;
  selectedAlbumId?: number;
  selectedPhotoId?: number;
}

export interface Photo {
  id: number;
  url?: string;
  albumId?: number;
  // Add more photo properties as needed
  date?: Date;
  name?: string;
  size?: number;
  width?: number;
  height?: number;
}

export interface Album {
  id: number;
  name: string;
  date: Date;
  thumbnailPhotoId?: number;
  photoCount: number;
  order: number;
  // Add more album properties as needed
}

export interface AlbumGridProps {
  albums: Album[];
  onAlbumClick: (albumId: number) => void;
  onAlbumReorder?: (albumId: number, newOrder: number) => void;
  onAlbumDelete?: (albumId: number) => void;
  loading?: boolean;
  className?: string;
}

export interface LandingPageProps {
  viewState: ViewState;
  onAlbumClick: (albumId: number) => void;
  onPhotoClick: (photoId: number) => void;
  onCloseZoom: () => void;
}

export interface LayoutProps {
  children: React.ReactNode;
  viewState: ViewState;
  onBackToAlbums: () => void;
}