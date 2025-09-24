import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { UploadDropzoneProps } from '../../types'

const UploadDropzone = ({
  onFilesSelected,
  acceptedFileTypes = ['.jpg', '.jpeg', '.png', '.webp', '.heic'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  isUploading = false,
  className = '',
  ...props
}: UploadDropzoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      onFilesSelected(files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onFilesSelected(files)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div
      className={`
        border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
        ${isDragOver
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
        }
        ${isUploading ? 'pointer-events-none opacity-50' : ''}
        ${className}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      {...props}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedFileTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Select photos to upload"
      />

      <Upload size={48} className="mx-auto mb-4 text-gray-400" />

      <div className="space-y-2">
        <p className="text-lg font-medium text-gray-900">
          {isUploading ? 'Uploading...' : 'Drop photos here or click to select'}
        </p>
        <p className="text-sm text-gray-500">
          Supports: {acceptedFileTypes.join(', ')} • Max {maxFileSize / (1024 * 1024)}MB per file
        </p>
      </div>
    </div>
  )
}

export default UploadDropzone