import { useEffect, useState } from 'react'
import { ViewState, Photo } from '../types'
import AlbumGrid from '../components/AlbumGrid'
import PhotoTileView from '../components/PhotoTileView'
import ZoomModal from '../components/ZoomModal'
import UploadDropzone from '../components/UploadDropzone'
import { Spinner } from '../components/ui/spinner'
import { mockDataService } from '../services/MockDataService'
import { useInfiniteAlbums } from '../hooks/useInfiniteAlbums'
import { useRetry } from '../hooks/useRetry'

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
    refresh: refreshAlbums,
    retrying,
    retryCount,
    retry
  } = useInfiniteAlbums(12)

  const [photos, setPhotos] = useState<Photo[]>([])
  const [photosLoading, setPhotosLoading] = useState(false)
  const [photosError, setPhotosError] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  // Retry logic for photo loading
  const { execute: executePhotoLoad, retrying: photosRetrying, retryCount: photosRetryCount } = useRetry<Photo[]>({
    maxRetries: 3,
    initialDelay: 500,
    backoffFactor: 1.5,
  })

  useEffect(() => {
    const loadPhotos = async () => {
      if (!viewState.selectedAlbumId) return

      setPhotosLoading(true)
      setPhotosError(null)

      try {
        const photosData = await executePhotoLoad(() =>
          mockDataService.getPhotosInAlbum(viewState.selectedAlbumId!)
        )
        setPhotos(photosData)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load photos'
        setPhotosError(errorMessage)
        console.error('Failed to load photos:', error)
      } finally {
        setPhotosLoading(false)
      }
    }

    if (viewState.currentView === 'photos' && viewState.selectedAlbumId) {
      loadPhotos()
    }
  }, [viewState.currentView, viewState.selectedAlbumId, executePhotoLoad])

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
              ref={triggerRef as React.RefObject<HTMLDivElement>}
              className="flex justify-center items-center py-8"
              data-testid="infinite-scroll-trigger"
              role="status"
              aria-live="polite"
              aria-label={albumsLoading ? "Loading more albums" : "Scroll to load more albums"}
            >
              {albumsLoading ? (
                <div className="flex items-center space-x-2">
                  <Spinner size="md" />
                  <span className="text-muted-foreground">Loading more albums...</span>
                  <div className="sr-only">
                    Loading page {Math.ceil(albums.length / 12) + 1} of albums
                  </div>
                </div>
              ) : (
                <button
                  onClick={async () => {
                    try {
                      // Focus on the newly loaded content after loading
                      const currentCount = albums.length
                      await refreshAlbums()
                      // After new content loads, focus on first new album
                      setTimeout(() => {
                        const newAlbums = document.querySelectorAll('[data-testid^="album-tile-"]')
                        const firstNewAlbum = newAlbums[currentCount] as HTMLElement
                        if (firstNewAlbum) {
                          firstNewAlbum.focus()
                        }
                      }, 100)
                    } catch (error) {
                      console.error('Failed to load more albums:', error)
                    }
                  }}
                  className="text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                  aria-describedby="load-more-description"
                >
                  Load more albums
                </button>
              )}
              <div id="load-more-description" className="sr-only">
                Use this button to manually load more albums, or scroll down to automatically load them
              </div>
            </div>
          )}

          {/* Error and retry state */}
          {albumsError && (
            <div className="text-center py-4 space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-800 font-medium">Failed to load albums</p>
                </div>
                <p className="text-red-600 text-sm mb-3">{albumsError}</p>
                {retryCount > 0 && (
                  <p className="text-red-500 text-xs mb-3">
                    Retry attempt {retryCount} of 3
                  </p>
                )}
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={retry}
                    disabled={retrying}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {retrying ? (
                      <>
                        <Spinner size="sm" />
                        <span>Retrying...</span>
                      </>
                    ) : (
                      <span>Try Again</span>
                    )}
                  </button>
                  <button
                    onClick={refreshAlbums}
                    disabled={retrying || albumsLoading}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {viewState.currentView === 'photos' && viewState.selectedAlbumId && (
        <div className="space-y-6">
          {/* Photo error and retry state */}
          {photosError && (
            <div className="text-center py-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-800 font-medium">Failed to load photos</p>
                </div>
                <p className="text-red-600 text-sm mb-3">{photosError}</p>
                {photosRetryCount > 0 && (
                  <p className="text-red-500 text-xs mb-3">
                    Retry attempt {photosRetryCount} of 3
                  </p>
                )}
                <div className="flex justify-center">
                  <button
                    onClick={() => window.location.reload()}
                    disabled={photosRetrying}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {photosRetrying ? (
                      <>
                        <Spinner size="sm" />
                        <span>Retrying...</span>
                      </>
                    ) : (
                      <span>Try Again</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          <PhotoTileView
            photos={photos}
            onPhotoClick={onPhotoClick}
            loading={photosLoading || photosRetrying}
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