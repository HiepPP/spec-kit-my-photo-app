import { PhotoTileViewProps } from '../../types'

const PhotoTileView = ({
  photos,
  onPhotoClick,
  loading = false,
  selectedPhotoId,
  className = '',
  ...props
}: PhotoTileViewProps) => {
  if (loading) {
    return (
      <div className={`responsive-grid photo-grid ${className}`} {...props}>
        {/* Loading skeleton */}
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={`skeleton-${index}`} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="aspect-square skeleton" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`responsive-grid photo-grid ${className}`} {...props}>
      {photos.map((photo) => (
        <div
          key={photo.id}
          onClick={() => onPhotoClick(photo.id)}
          className={`bg-white rounded-lg shadow-md overflow-hidden grid-item-interactive cursor-pointer ${
            selectedPhotoId === photo.id ? 'ring-2 ring-blue-500' : ''
          }`}
          tabIndex={0}
          role="button"
          aria-label={`View photo ${photo.filename}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onPhotoClick(photo.id)
            }
          }}
        >
          <div className="aspect-square bg-gray-100">
            {/* Placeholder for photo thumbnail */}
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs p-2 text-center">
              {photo.filename}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default PhotoTileView