import { ArrowLeft, Upload, Settings } from 'lucide-react'
import { NavigationProps } from '../../types'

interface ExtendedNavigationProps extends NavigationProps {
  onUploadClick?: () => void
  onSettingsClick?: () => void
}

const Navigation = ({
  currentView,
  albumName,
  onBackToAlbums,
  onExportAlbum,
  onUploadClick,
  onSettingsClick,
  canExport = false,
  className = ''
}: ExtendedNavigationProps) => {
  return (
    <nav className={className} role="navigation" aria-label="Main navigation">
      {currentView === 'photos' && (
        <button
          onClick={onBackToAlbums}
          className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          aria-label="Back to albums"
        >
          <ArrowLeft size={20} />
          <span>Albums</span>
        </button>
      )}

      {currentView === 'photos' && albumName && (
        <span className="text-lg font-medium text-gray-900" aria-label={`Current album: ${albumName}`}>
          {albumName}
        </span>
      )}

      {currentView === 'photos' && canExport && onExportAlbum && (
        <button
          onClick={onExportAlbum}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          aria-label="Export album as ZIP"
        >
          Export ZIP
        </button>
      )}

      <div className="flex items-center space-x-2">
        <button
          onClick={onUploadClick}
          className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          aria-label="Upload photos"
        >
          <Upload size={20} />
          <span className="hidden sm:inline">Upload</span>
        </button>

        <button
          onClick={onSettingsClick}
          className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          aria-label="Settings"
        >
          <Settings size={20} />
          <span className="hidden sm:inline">Settings</span>
        </button>
      </div>
    </nav>
  )
}

export default Navigation