/**
 * Lazy-loaded components for code splitting
 * Provides optimized loading of heavy components
 */

import { lazy, ComponentType, Suspense } from 'react'
import { Skeleton } from './ui/skeleton'

// Lazy loading wrapper with custom loading component
function withLazyLoading<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ComponentType,
  displayName?: string
) {
  const LazyComponent = lazy(importFunc)

  const WrappedComponent = (props: P) => {
    const FallbackComponent = fallback || DefaultLoadingComponent

    return (
      <Suspense fallback={<FallbackComponent />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }

  WrappedComponent.displayName = displayName || 'LazyComponent'

  return WrappedComponent
}

// Default loading component
const DefaultLoadingComponent = () => (
  <div className="w-full h-64 flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
  </div>
)

// Loading component for album grids
const AlbumGridLoader = () => (
  <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-max">
    {Array.from({ length: 6 }).map((_, index) => (
      <div
        key={`skeleton-${index}`}
        className="bg-card rounded-lg shadow-sm overflow-hidden border"
        aria-hidden="true"
      >
        <Skeleton className="aspect-square" />
        <div className="p-4 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
    ))}
  </div>
)

// Loading component for photo grids
const PhotoGridLoader = () => (
  <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
    {Array.from({ length: 20 }).map((_, index) => (
      <div key={`photo-skeleton-${index}`} className="aspect-square">
        <Skeleton className="w-full h-full rounded-md" />
      </div>
    ))}
  </div>
)

// Loading component for modals
const ModalLoader = () => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
      <Skeleton className="h-64 w-full mb-4" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
)

// Lazy-loaded components
export const LazyVirtualizedAlbumGrid = withLazyLoading(
  () => import('./AlbumGrid/VirtualizedAlbumGrid'),
  AlbumGridLoader,
  'LazyVirtualizedAlbumGrid'
)

export const LazyZoomModal = withLazyLoading(
  () => import('./ZoomModal'),
  ModalLoader,
  'LazyZoomModal'
)

export const LazyPhotoTileView = withLazyLoading(
  () => import('./PhotoTileView'),
  PhotoGridLoader,
  'LazyPhotoTileView'
)

export const LazyUploadDropzone = withLazyLoading(
  () => import('./UploadDropzone'),
  DefaultLoadingComponent,
  'LazyUploadDropzone'
)

// Higher-order component for lazy loading with error boundaries
export function withErrorBoundary<P extends object>(
  Component: ComponentType<P>
) {
  return class extends React.Component<P, { hasError: boolean }> {
    constructor(props: P) {
      super(props)
      this.state = { hasError: false }
    }

    static getDerivedStateFromError() {
      return { hasError: true }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      console.error('Lazy component loading error:', error, errorInfo)
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className="w-full h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Component Loading Error</h3>
              <p className="text-gray-500 text-sm">Please refresh the page to try again</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        )
      }

      return <Component {...this.props} />
    }
  }
}

// Performance monitoring for lazy components
export function withPerformanceTracking<P extends object>(
  Component: ComponentType<P>,
  componentName: string
) {
  return (props: P) => {
    React.useEffect(() => {
      const startTime = performance.now()

      return () => {
        const endTime = performance.now()
        const loadTime = endTime - startTime

        if (process.env.NODE_ENV === 'development') {
          console.log(`🚀 ${componentName} loaded in ${loadTime.toFixed(2)}ms`)
        }

        // Report to performance monitor if available
        if (window.performance && window.performance.measure) {
          try {
            window.performance.measure(`${componentName}-load`, {
              start: startTime,
              end: endTime
            })
          } catch (error) {
            // Silently ignore performance API errors
          }
        }
      }
    }, [])

    return <Component {...props} />
  }
}

// Combined HOC for lazy loading with error boundary and performance tracking
export function createOptimizedLazyComponent<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  options: {
    fallback?: React.ComponentType
    displayName?: string
    withErrorBoundary?: boolean
    withPerformanceTracking?: boolean
  } = {}
) {
  const {
    fallback = DefaultLoadingComponent,
    displayName = 'OptimizedLazyComponent',
    withErrorBoundary: enableErrorBoundary = true,
    withPerformanceTracking: enablePerformanceTracking = process.env.NODE_ENV === 'development'
  } = options

  let Component = withLazyLoading(importFunc, fallback, displayName)

  if (enableErrorBoundary) {
    Component = withErrorBoundary(Component) as any
  }

  if (enablePerformanceTracking) {
    Component = withPerformanceTracking(Component, displayName) as any
  }

  return Component
}