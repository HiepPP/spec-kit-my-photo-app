import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import { ViewState } from './types'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import './App.css'

function App() {
  const [viewState, setViewState] = useState<ViewState>({
    currentView: 'albums',
    isZoomModalOpen: false
  })

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
      </Layout>
    </Router>
  )
}

export default App