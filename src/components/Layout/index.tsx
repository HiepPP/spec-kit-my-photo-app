import { ReactNode } from 'react'
import { ViewState } from '../../types'
import Navigation from './Navigation'

interface LayoutProps {
  children: ReactNode
  viewState: ViewState
  onBackToAlbums: () => void
}

const Layout = ({ children, viewState, onBackToAlbums }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                My Photo App
              </h1>
            </div>
            <Navigation
              currentView={viewState.currentView}
              onBackToAlbums={onBackToAlbums}
              className="flex items-center space-x-4"
            />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

export default Layout