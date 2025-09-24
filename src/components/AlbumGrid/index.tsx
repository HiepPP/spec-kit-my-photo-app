import { AlbumGridProps } from '../../types'
import AlbumTile from '../AlbumTile'
import { cn } from '../../lib/utils'

const AlbumGrid = ({
  albums,
  onAlbumClick,
  onAlbumReorder,
  onAlbumDelete,
  loading = false,
  className = '',
  ...props
}: AlbumGridProps) => {
  if (loading) {
    return (
      <div
        className={cn(
          "grid gap-6",
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
          "auto-rows-max",
          className
        )}
        {...props}
      >
        {/* Loading skeleton */}
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="aspect-square bg-gray-200 animate-pulse" />
            <div className="p-4 space-y-2">
              <div className="h-5 bg-gray-200 animate-pulse rounded w-3/4" />
              <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
              <div className="h-3 bg-gray-200 animate-pulse rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (albums.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
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
      className={cn(
        "grid gap-6",
        "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        "auto-rows-max",
        className
      )}
      {...props}
    >
      {albums.map((album) => (
        <AlbumTile
          key={album.id}
          album={album}
          thumbnailSrc={album.thumbnailPhotoId ? `/api/photos/${album.thumbnailPhotoId}/thumbnail` : undefined}
          onClick={() => onAlbumClick(album.id)}
          onDelete={onAlbumDelete ? () => onAlbumDelete(album.id) : undefined}
          data-testid={`album-tile-${album.id}`}
        />
      ))}
    </div>
  )
}

export default AlbumGrid