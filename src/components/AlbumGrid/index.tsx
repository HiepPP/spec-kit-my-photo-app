import { AlbumGridProps } from '../../types'

const AlbumGrid = ({
  albums,
  onAlbumClick,
  onAlbumReorder,
  loading = false,
  className = '',
  ...props
}: AlbumGridProps) => {
  if (loading) {
    return (
      <div className={`responsive-grid ${className}`} {...props}>
        {/* Loading skeleton */}
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={`skeleton-${index}`} className="bg-white rounded-lg shadow-md p-4">
            <div className="aspect-square skeleton rounded-lg mb-3" />
            <div className="skeleton h-5 w-3/4 mb-2 rounded" />
            <div className="skeleton h-4 w-1/2 rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`responsive-grid ${className}`} {...props}>
      {albums.map((album) => (
        <div
          key={album.id}
          onClick={() => onAlbumClick(album.id)}
          className="bg-white rounded-lg shadow-md p-4 grid-item-interactive cursor-pointer"
          tabIndex={0}
          role="button"
          aria-label={`View album ${album.name} with ${album.photoCount} photos`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onAlbumClick(album.id)
            }
          }}
        >
          <div className="aspect-square bg-gray-100 rounded-lg mb-3">
            {/* Placeholder for album thumbnail */}
          </div>
          <h3 className="font-semibold text-gray-900">{album.name}</h3>
          <p className="text-sm text-gray-500">{album.photoCount} photos</p>
        </div>
      ))}
    </div>
  )
}

export default AlbumGrid