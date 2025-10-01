import { ZoomModalProps } from '../../types'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

const ZoomModal = ({
  isOpen,
  onClose,
  photo,
  photos,
  currentIndex,
  onNext,
  onPrevious,
  ...props
}: ZoomModalProps) => {
  if (!isOpen || !photo) {
    return null
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      onClick={onClose}
      {...props}
    >
      <div className="relative max-w-7xl max-h-full p-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          aria-label="Close zoom view"
        >
          <X size={32} />
        </button>

        {/* Navigation buttons */}
        {photos.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onPrevious()
              }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
              aria-label="Previous photo"
            >
              <ChevronLeft size={48} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onNext()
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
              aria-label="Next photo"
            >
              <ChevronRight size={48} />
            </button>
          </>
        )}

        {/* Image placeholder */}
        <div
          className="max-w-full max-h-full bg-gray-200 flex items-center justify-center rounded"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-gray-500 p-8">
            {photo.filename}
            <br />
            <small>Full image would display here</small>
          </div>
        </div>

        {/* Photo info */}
        <div className="absolute bottom-4 left-4 text-white">
          <p className="font-semibold">{photo.filename}</p>
          <p className="text-sm opacity-80">
            {currentIndex + 1} of {photos.length}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ZoomModal