import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ViewState } from './types'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
// import { useBundleOptimization } from './utils/bundleOptimization'
import './App.css'

function App() {
  const [viewState, setViewState] = useState<ViewState>({
    currentView: 'albums',
    isZoomModalOpen: false
  })

  // Bundle optimization monitoring (temporarily disabled)
  // const { metrics, recommendations, evaluateOptimization } = useBundleOptimization()

  // Log bundle optimization evaluation in development (temporarily disabled)
  // useEffect(() => {
  //   if (process.env.NODE_ENV === 'development') {
  //     // Wait for initial load to complete
  //     const timer = setTimeout(() => {
  //       const evaluation = evaluateOptimization()
  //       if (evaluation.score < 80) {
  //         console.group('⚠️ Bundle Optimization Warnings')
  //         console.log(`Optimization Score: ${evaluation.score}/100`)
  //         if (evaluation.issues.length > 0) {
  //           console.log('Issues:', evaluation.issues)
  //         }
  //         if (evaluation.suggestions.length > 0) {
  //           console.log('Suggestions:', evaluation.suggestions)
  //         }
  //         console.groupEnd()
  //       }
  //     }, 3000)

  //     return () => clearTimeout(timer)
  //   }
  // }, [evaluateOptimization])

  const handleAlbumClick = (albumId: number) => {
    setViewState(prev => ({
      ...prev,
      currentView: 'photos',
      selectedAlbumId: albumId
    }))
  }

  const handleBackToAlbums = () => {
    setViewState(prev => ({
      ...prev,
      currentView: 'albums',
      selectedAlbumId: undefined,
      selectedPhotoId: undefined
    }))
  }

  const handlePhotoClick = (photoId: number) => {
    setViewState(prev => ({
      ...prev,
      selectedPhotoId: photoId,
      isZoomModalOpen: true
    }))
  }

  const handleCloseZoom = () => {
    setViewState(prev => ({
      ...prev,
      isZoomModalOpen: false,
      selectedPhotoId: undefined
    }))
  }

  return (
    <Router>
      <Layout viewState={viewState} onBackToAlbums={handleBackToAlbums}>
        <Routes>
          <Route
            path="/"
            element={
              <LandingPage
                viewState={viewState}
                onAlbumClick={handleAlbumClick}
                onPhotoClick={handlePhotoClick}
                onCloseZoom={handleCloseZoom}
              />
            }
          />
          <Route
            path="/albums/:albumId"
            element={
              <LandingPage
                viewState={viewState}
                onAlbumClick={handleAlbumClick}
                onPhotoClick={handlePhotoClick}
                onCloseZoom={handleCloseZoom}
              />
            }
          />
        </Routes>

        {/* Bundle optimization indicator for development (temporarily disabled) */}
        {/* {process.env.NODE_ENV === 'development' && metrics && (
          <div className="fixed top-4 left-4 bg-black/80 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
            <div className="font-semibold mb-1">Bundle Stats</div>
            <div>Size: {(metrics.totalSize / 1024).toFixed(1)}KB</div>
            <div>Chunks: {metrics.chunksLoaded}</div>
            <div>Load: {metrics.loadTimes.initial.toFixed(0)}ms</div>
            {recommendations?.enableLazyLoading && (
              <div className="text-yellow-300 mt-1">⚡ Lazy loading recommended</div>
            )}
          </div>
        )} */}
      </Layout>
    </Router>
  )
}

export default App