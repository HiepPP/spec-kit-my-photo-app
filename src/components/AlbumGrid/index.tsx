import { useCallback, useRef } from 'react'
import { AlbumGridProps } from '../../types'
import AlbumTile from '../AlbumTile'
import VirtualizedAlbumGrid from './VirtualizedAlbumGrid'
import { Skeleton } from '../ui/skeleton'
import { cn } from '../../lib/utils'
import { useSmartVirtualization } from '../../hooks/useVirtualization'
import { useAlbumImagePreloading } from '../../hooks/useImagePreloading'

const AlbumGrid = ({
  albums,
  onAlbumClick,
  onAlbumReorder,
  onAlbumDelete,
  loading = false,
  className = '',
  ...props
}: AlbumGridProps) => {
  const gridRef = useRef<HTMLDivElement>(null)

  // Smart virtualization decision based on album count and performance
  const virtualization = useSmartVirtualization(albums.length, 280, 320, {
    itemThreshold: 50,
    heightThreshold: 2000
  })

  // Image preloading for smooth user experience
  const { preloadState, preloadStats } = useAlbumImagePreloading(albums, {
    enableThumbnailPreloading: true,
    preloadAhead: virtualization.shouldVirtualize ? 20 : 10,
    priorities: {
      thumbnail: 'high',
      fullImage: 'low'
    },
    smartPreloading: true
  })

  // Use virtualized grid for large datasets
  if (virtualization.shouldVirtualize && !loading) {
    return (
      <VirtualizedAlbumGrid
        albums={albums}
        onAlbumClick={onAlbumClick}
        onAlbumReorder={onAlbumReorder}
        onAlbumDelete={onAlbumDelete}
        loading={loading}
        className={className}
        containerHeight={virtualization.containerHeight}
        itemWidth={virtualization.itemDimensions.width}
        itemHeight={virtualization.itemDimensions.height}
        {...props}
      />
    )
  }

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!gridRef.current) return

    const tiles = Array.from(gridRef.current.querySelectorAll('[role="button"]')) as HTMLElement[]
    const currentIndex = tiles.findIndex(tile => tile === document.activeElement)

    let nextIndex = currentIndex
    const cols = getGridColumns()

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault()
        nextIndex = Math.min(currentIndex + 1, tiles.length - 1)
        break
      case 'ArrowLeft':
        e.preventDefault()
        nextIndex = Math.max(currentIndex - 1, 0)
        break
      case 'ArrowDown':
        e.preventDefault()
        nextIndex = Math.min(currentIndex + cols, tiles.length - 1)
        break
      case 'ArrowUp':
        e.preventDefault()
        nextIndex = Math.max(currentIndex - cols, 0)
        break
      case 'Home':
        e.preventDefault()
        nextIndex = 0
        break
      case 'End':
        e.preventDefault()
        nextIndex = tiles.length - 1
        break
      default:
        return
    }

    if (nextIndex !== currentIndex && tiles[nextIndex]) {
      tiles[nextIndex].focus()
    }
  }, [])

  // Helper function to determine grid columns based on screen size
  const getGridColumns = useCallback(() => {
    if (!gridRef.current) return 3

    const styles = window.getComputedStyle(gridRef.current)
    const cols = styles.gridTemplateColumns.split(' ').length
    return cols
  }, [])
  if (loading) {
    return (
      <div
        className={cn(
          "grid gap-6",
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
          "auto-rows-max",
          className
        )}
        role="region"
        aria-label="Loading albums"
        aria-live="polite"
        {...props}
      >
        {/* Loading skeleton */}
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="bg-card rounded-lg shadow-sm overflow-hidden border"
            aria-hidden="true"
          >
            <Skeleton className="aspect-square" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
        <div className="sr-only">Loading your photo albums...</div>
      </div>
    )
  }

  if (albums.length === 0) {
    return (
      <div
        className="text-center py-12"
        role="region"
        aria-label="Empty albums state"
      >
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No albums found</h3>
        <p className="text-gray-500">Upload photos to get started</p>
      </div>
    )
  }

  return (
    <div
      ref={gridRef}
      className={cn(
        "grid gap-6",
        "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        "auto-rows-max",
        className
      )}
      role="grid"
      aria-label={`Photo albums grid containing ${albums.length} albums`}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {albums.map((album, index) => (
        <AlbumTile
          key={album.id}
          album={album}
          thumbnailSrc={album.thumbnailPhotoId ? `/api/photos/${album.thumbnailPhotoId}/thumbnail` : undefined}
          onClick={() => onAlbumClick(album.id)}
          onDelete={onAlbumDelete ? () => onAlbumDelete(album.id) : undefined}
          data-testid={`album-tile-${album.id}`}
          aria-setsize={albums.length}
          aria-posinset={index + 1}
        />
      ))}

      {/* Performance indicator for development */}
      {process.env.NODE_ENV === 'development' && preloadState.isPreloading && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full" />
            <span>Preloading images... ({preloadState.preloadingCount})</span>
          </div>
        </div>
      )}

      {/* Preload stats for development */}
      {process.env.NODE_ENV === 'development' && preloadStats.total > 0 && (
        <div className="fixed bottom-16 right-4 bg-green-500 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
          <div>Preloaded: {preloadStats.successful}/{preloadStats.total}</div>
          <div>Cache hit rate: {(preloadStats.cacheHitRate * 100).toFixed(1)}%</div>
        </div>
      )}
    </div>
  )
}

export default AlbumGrid