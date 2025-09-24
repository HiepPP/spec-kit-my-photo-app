import { useEffect, useState } from 'react'
import { ViewState, Album, Photo } from '../types'
import AlbumGrid from '../components/AlbumGrid'
import PhotoTileView from '../components/PhotoTileView'
import ZoomModal from '../components/ZoomModal'
import UploadDropzone from '../components/UploadDropzone'
import { Spinner } from '../components/ui/spinner'
import { mockDataService } from '../services/MockDataService'
import { useInfiniteAlbums } from '../hooks/useInfiniteAlbums'

interface LandingPageProps {
  viewState: ViewState
  onAlbumClick: (albumId: number) => void
  onPhotoClick: (photoId: number) => void
  onCloseZoom: () => void
}

const LandingPage = ({
  viewState,
  onAlbumClick,
  onPhotoClick,
  onCloseZoom
}: LandingPageProps) => {
  const {
    albums,
    loading: albumsLoading,
    error: albumsError,
    hasNextPage,
    triggerRef,
    refresh: refreshAlbums
  } = useInfiniteAlbums(12)

  const [photos, setPhotos] = useState<Photo[]>([])
  const [photosLoading, setPhotosLoading] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  useEffect(() => {
    const loadPhotos = async () => {
      if (!viewState.selectedAlbumId) return

      setPhotosLoading(true)
      try {
        const photosData = await mockDataService.getPhotosInAlbum(viewState.selectedAlbumId)
        setPhotos(photosData)
      } catch (error) {
        console.error('Failed to load photos:', error)
      } finally {
        setPhotosLoading(false)
      }
    }

    if (viewState.currentView === 'photos' && viewState.selectedAlbumId) {
      loadPhotos()
    }
  }, [viewState.currentView, viewState.selectedAlbumId])

  useEffect(() => {
    const loadSelectedPhoto = async () => {
      if (!viewState.selectedPhotoId) return

      try {
        const photoData = await mockDataService.getFullPhoto(viewState.selectedPhotoId)
        setSelectedPhoto(photoData)
      } catch (error) {
        console.error('Failed to load photo:', error)
        setSelectedPhoto(null)
      }
    }

    if (viewState.isZoomModalOpen && viewState.selectedPhotoId) {
      loadSelectedPhoto()
    } else {
      setSelectedPhoto(null)
    }
  }, [viewState.isZoomModalOpen, viewState.selectedPhotoId])

  const handleAlbumReorder = async (albumId: number, newOrder: number) => {
    try {
      await mockDataService.updateAlbumOrder(albumId, newOrder)
      // Refresh albums to reflect the new order
      await refreshAlbums()
    } catch (error) {
      console.error('Failed to reorder album:', error)
    }
  }

  const handleFilesSelected = async (files: FileList) => {
    try {
      await mockDataService.uploadPhotos(Array.from(files))
      // Refresh albums to show any new albums created
      await refreshAlbums()
    } catch (error) {
      console.error('Failed to upload files:', error)
    }
  }

  const getCurrentPhotoIndex = () => {
    if (!selectedPhoto) return 0
    return photos.findIndex(photo => photo.id === selectedPhoto.id)
  }

  const handleNext = () => {
    const currentIndex = getCurrentPhotoIndex()
    const nextIndex = (currentIndex + 1) % photos.length
    onPhotoClick(photos[nextIndex].id)
  }

  const handlePrevious = () => {
    const currentIndex = getCurrentPhotoIndex()
    const prevIndex = currentIndex === 0 ? photos.length - 1 : currentIndex - 1
    onPhotoClick(photos[prevIndex].id)
  }

  return (
    <div className="space-y-8">
      {/* Upload Dropzone - always visible */}
      <UploadDropzone
        onFilesSelected={handleFilesSelected}
        acceptedFileTypes={['.jpg', '.jpeg', '.png', '.webp', '.heic']}
        className="mb-8"
        data-testid="upload-dropzone"
      />

      {/* Main Content Area */}
      {viewState.currentView === 'albums' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-900">Photo Albums</h2>
            <span className="text-gray-500">
              {albums.length} {albums.length === 1 ? 'album' : 'albums'}
            </span>
          </div>

          <AlbumGrid
            albums={albums}
            onAlbumClick={onAlbumClick}
            onAlbumReorder={handleAlbumReorder}
            loading={albumsLoading && albums.length === 0}
            className="responsive-grid"
            data-testid="album-grid"
          />

          {/* Infinite Scroll Trigger */}
          {hasNextPage && (
            <div
              ref={triggerRef}
              className="flex justify-center items-center py-8"
              data-testid="infinite-scroll-trigger"
            >
              {albumsLoading ? (
                <div className="flex items-center space-x-2">
                  <Spinner size="md" />
                  <span className="text-muted-foreground">Loading more albums...</span>
                </div>
              ) : (
                <div className="text-gray-400">Scroll to load more albums</div>
              )}
            </div>
          )}

          {/* Error state */}
          {albumsError && (
            <div className="text-center py-4">
              <p className="text-red-600">Error loading albums: {albumsError}</p>
            </div>
          )}
        </div>
      )}

      {viewState.currentView === 'photos' && viewState.selectedAlbumId && (
        <div className="space-y-6">
          <PhotoTileView
            photos={photos}
            onPhotoClick={onPhotoClick}
            loading={photosLoading}
            selectedPhotoId={viewState.selectedPhotoId}
            className="responsive-grid"
            data-testid="photo-tile-view"
          />
        </div>
      )}

      {/* Zoom Modal */}
      <ZoomModal
        isOpen={viewState.isZoomModalOpen}
        onClose={onCloseZoom}
        photo={selectedPhoto}
        photos={photos}
        currentIndex={getCurrentPhotoIndex()}
        onNext={handleNext}
        onPrevious={handlePrevious}
        data-testid="zoom-modal"
      />
    </div>
  )
}

export default LandingPage