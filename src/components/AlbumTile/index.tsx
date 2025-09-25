import { useState, useCallback } from 'react'
import { Card, CardContent } from '../ui/card'
import { AlbumTileProps } from '../../types'
import { cn } from '../../lib/utils'

const AlbumTile = ({
  album,
  thumbnailSrc,
  onClick,
  onDelete,
  isDragging = false,
  dragHandleProps,
  className,
  'data-testid': testId,
  ...props
}: AlbumTileProps) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
  }, [])

  const handleImageError = useCallback(() => {
    setImageError(true)
    setImageLoaded(true)
  }, [])

  const handleClick = useCallback(() => {
    if (!isDragging) {
      onClick()
    }
  }, [onClick, isDragging])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }, [handleClick])

  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all duration-200 hover:shadow-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2",
        isDragging && "opacity-50 transform rotate-3 scale-105 shadow-lg",
        className
      )}
      onClick={handleClick}
      tabIndex={0}
      role="button"
      aria-label={`View album ${album.name} with ${album.photoCount} photos`}
      onKeyDown={handleKeyDown}
      data-testid={testId}
      {...dragHandleProps}
      {...props}
    >
      <CardContent className="p-4">
        {/* Thumbnail container with aspect ratio */}
        <div className="aspect-square relative mb-3 overflow-hidden rounded-lg bg-gray-100">
          {thumbnailSrc && !imageError ? (
            <>
              {/* Loading skeleton */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
              )}

              {/* Lazy loaded thumbnail image */}
              <img
                src={thumbnailSrc}
                alt={`${album.name} thumbnail`}
                className={cn(
                  "w-full h-full object-cover transition-opacity duration-300",
                  imageLoaded ? "opacity-100" : "opacity-0"
                )}
                loading="lazy"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </>
          ) : (
            /* Fallback when no thumbnail or error */
            <div
              className="bg-muted flex items-center justify-center w-full h-full text-gray-400"
              data-testid={imageError ? "album-thumbnail-error" : "album-thumbnail-placeholder"}
            >
              <svg
                className="w-12 h-12"
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
          )}
        </div>

        {/* Album metadata */}
        <div className="space-y-1">
          <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {album.name}
          </h3>
          <p className="text-sm text-gray-500">
            {album.photoCount.toLocaleString()} {album.photoCount === 1 ? 'photo' : 'photos'}
          </p>
          <p className="text-xs text-gray-400">
            {album.captureDate.toLocaleDateString('en-CA')}
          </p>
        </div>

        {/* Optional delete button */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
            aria-label={`Delete album ${album.name}`}
            tabIndex={-1}
          >
            ×
          </button>
        )}
      </CardContent>
    </Card>
  )
}

export default AlbumTile