/**
 * VirtualizedAlbumGrid Component
 * High-performance album grid using react-window for large datasets
 */

import { useCallback, useRef, useMemo, useEffect, useState } from 'react'
import { Grid } from 'react-window'
import { AlbumGridProps } from '../../types'
import AlbumTile from '../AlbumTile'
import { Skeleton } from '../ui/skeleton'
import { cn } from '../../lib/utils'
import { measureRenderTime } from '../../utils/performanceMonitor'

interface VirtualizedAlbumGridProps extends AlbumGridProps {
  itemHeight?: number
  itemWidth?: number
  containerHeight?: number
  overscanRowCount?: number
}

interface GridItemData {
  albums: AlbumGridProps['albums']
  columnCount: number
  onAlbumClick: AlbumGridProps['onAlbumClick']
  onAlbumReorder: AlbumGridProps['onAlbumReorder']
  onAlbumDelete: AlbumGridProps['onAlbumDelete']
  itemWidth: number
  itemHeight: number
}

// Grid cell renderer component
const GridCell = ({
  columnIndex,
  rowIndex,
  style,
  data
}: {
  columnIndex: number
  rowIndex: number
  style: React.CSSProperties
  data: GridItemData
}) => {
  const { albums, columnCount, onAlbumClick, onAlbumDelete, itemWidth, itemHeight } = data
  const index = rowIndex * columnCount + columnIndex

  // Return empty cell if no album at this index
  if (index >= albums.length) {
    return <div style={style} />
  }

  const album = albums[index]

  return (
    <div
      style={{
        ...style,
        padding: '12px', // Gap between items
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          width: itemWidth - 24, // Account for padding
          height: itemHeight - 24
        }}
      >
        <AlbumTile
          album={album}
          thumbnailSrc={album.thumbnailPhotoId ? `/api/photos/${album.thumbnailPhotoId}/thumbnail` : undefined}
          onClick={() => onAlbumClick(album.id)}
          onDelete={onAlbumDelete ? () => onAlbumDelete(album.id) : undefined}
          data-testid={`album-tile-${album.id}`}
          className="w-full h-full"
        />
      </div>
    </div>
  )
}

const VirtualizedAlbumGrid = ({
  albums,
  onAlbumClick,
  onAlbumReorder,
  onAlbumDelete,
  loading = false,
  className = '',
  itemHeight = 280,
  itemWidth = 320,
  containerHeight = 600,
  overscanRowCount = 3,
  ...props
}: VirtualizedAlbumGridProps) => {
  const gridRef = useRef<Grid>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: containerHeight })

  // Calculate grid dimensions based on container size
  const { columnCount, rowCount } = useMemo(() => {
    const availableWidth = containerSize.width || 960 // Default width
    const cols = Math.max(1, Math.floor(availableWidth / itemWidth))
    const rows = Math.ceil(albums.length / cols)

    return {
      columnCount: cols,
      rowCount: rows
    }
  }, [containerSize.width, itemWidth, albums.length])

  // Create data object for grid cells
  const itemData: GridItemData = useMemo(() => ({
    albums,
    columnCount,
    onAlbumClick,
    onAlbumReorder,
    onAlbumDelete,
    itemWidth,
    itemHeight
  }), [albums, columnCount, onAlbumClick, onAlbumReorder, onAlbumDelete, itemWidth, itemHeight])

  // Handle container resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setContainerSize({ width: rect.width, height: containerHeight })
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [containerHeight])

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!gridRef.current) return

    const totalItems = albums.length
    const currentFocus = document.activeElement
    const focusedTile = currentFocus?.closest('[data-testid^="album-tile-"]')

    if (!focusedTile) return

    const testId = focusedTile.getAttribute('data-testid')
    const albumId = testId?.replace('album-tile-', '')
    const currentIndex = albums.findIndex(album => album.id.toString() === albumId)

    if (currentIndex === -1) return

    let nextIndex = currentIndex

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault()
        nextIndex = Math.min(currentIndex + 1, totalItems - 1)
        break
      case 'ArrowLeft':
        e.preventDefault()
        nextIndex = Math.max(currentIndex - 1, 0)
        break
      case 'ArrowDown':
        e.preventDefault()
        nextIndex = Math.min(currentIndex + columnCount, totalItems - 1)
        break
      case 'ArrowUp':
        e.preventDefault()
        nextIndex = Math.max(currentIndex - columnCount, 0)
        break
      case 'Home':
        e.preventDefault()
        nextIndex = 0
        break
      case 'End':
        e.preventDefault()
        nextIndex = totalItems - 1
        break
      default:
        return
    }

    if (nextIndex !== currentIndex) {
      // Scroll to the new item
      const newRow = Math.floor(nextIndex / columnCount)
      const newCol = nextIndex % columnCount

      gridRef.current?.scrollToItem({
        rowIndex: newRow,
        columnIndex: newCol,
        align: 'smart'
      })

      // Focus the new item after a short delay to allow scrolling
      setTimeout(() => {
        const newTile = document.querySelector(`[data-testid="album-tile-${albums[nextIndex].id}"]`) as HTMLElement
        if (newTile && newTile.focus) {
          newTile.focus()
        }
      }, 100)
    }
  }, [albums, columnCount])

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
      ref={containerRef}
      className={cn("relative", className)}
      role="grid"
      aria-label={`Virtualized photo albums grid containing ${albums.length} albums`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      {...props}
    >
      {containerSize.width > 0 && (
        <Grid
          ref={gridRef}
          columnCount={columnCount}
          columnWidth={itemWidth}
          height={containerSize.height}
          rowCount={rowCount}
          rowHeight={itemHeight}
          width={containerSize.width}
          itemData={itemData}
          overscanRowCount={overscanRowCount}
          style={{
            outline: 'none' // Remove focus outline from grid container
          }}
        >
          {(props: { columnIndex: number; rowIndex: number; style: React.CSSProperties; data: GridItemData }) =>
            measureRenderTime(() => (
              <GridCell
                columnIndex={props.columnIndex}
                rowIndex={props.rowIndex}
                style={props.style}
                data={props.data}
              />
            ))
          }
        </Grid>
      )}

      {/* Performance indicator for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          Virtualized: {albums.length} items, {columnCount}×{rowCount} grid
        </div>
      )}
    </div>
  )
}

export default VirtualizedAlbumGrid