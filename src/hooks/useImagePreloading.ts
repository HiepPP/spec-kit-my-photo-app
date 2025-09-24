/**
 * useImagePreloading Hook
 * Provides intelligent image preloading for album and photo components
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import { useImagePreloader, createIntersectionPreloader } from '../utils/imagePreloader'
import { Album, Photo } from '../types'

export interface ImagePreloadingOptions {
  /** Enable preloading for thumbnails */
  enableThumbnailPreloading?: boolean
  /** Enable preloading for full images */
  enableFullImagePreloading?: boolean
  /** Number of items to preload ahead */
  preloadAhead?: number
  /** Priority for different image types */
  priorities?: {
    thumbnail: 'high' | 'medium' | 'low'
    fullImage: 'high' | 'medium' | 'low'
  }
  /** Viewport margin for intersection observer */
  viewportMargin?: string
  /** Enable smart preloading based on user behavior */
  smartPreloading?: boolean
}

export interface PreloadingState {
  /** Currently preloading images count */
  preloadingCount: number
  /** Successfully preloaded images count */
  preloadedCount: number
  /** Failed preloads count */
  failedCount: number
  /** Whether preloading is active */
  isPreloading: boolean
}

const DEFAULT_OPTIONS: Required<ImagePreloadingOptions> = {
  enableThumbnailPreloading: true,
  enableFullImagePreloading: false,
  preloadAhead: 10,
  priorities: {
    thumbnail: 'high',
    fullImage: 'medium'
  },
  viewportMargin: '100px',
  smartPreloading: true
}

/**
 * Hook for preloading album thumbnail images
 */
export function useAlbumImagePreloading(
  albums: Album[],
  options: ImagePreloadingOptions = {}
) {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options }
  const preloader = useImagePreloader()
  const [state, setState] = useState<PreloadingState>({
    preloadingCount: 0,
    preloadedCount: 0,
    failedCount: 0,
    isPreloading: false
  })

  const preloadAlbumThumbnails = useCallback(async () => {
    if (!mergedOptions.enableThumbnailPreloading || albums.length === 0) {
      return
    }

    setState(prev => ({ ...prev, isPreloading: true, preloadingCount: 0 }))

    // Extract thumbnail URLs from albums
    const thumbnailUrls = albums
      .filter(album => album.thumbnailPhotoId)
      .slice(0, mergedOptions.preloadAhead)
      .map((album, index) => ({
        url: `/api/photos/${album.thumbnailPhotoId}/thumbnail`,
        priority: mergedOptions.priorities.thumbnail,
        importance: Math.max(0, 1 - (index / albums.length)) // Higher importance for earlier items
      }))

    if (thumbnailUrls.length === 0) return

    setState(prev => ({ ...prev, preloadingCount: thumbnailUrls.length }))

    try {
      let results
      if (mergedOptions.smartPreloading) {
        results = await preloader.smartPreload(
          thumbnailUrls.map(item => ({
            url: item.url,
            importance: item.importance,
            userInteraction: false
          }))
        )
      } else {
        results = await preloader.preloadBatch(thumbnailUrls)
      }

      const successful = results.filter(r => r.success).length
      const failed = results.filter(r => !r.success).length

      setState(prev => ({
        ...prev,
        preloadedCount: prev.preloadedCount + successful,
        failedCount: prev.failedCount + failed,
        isPreloading: false,
        preloadingCount: 0
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        isPreloading: false,
        preloadingCount: 0
      }))
    }
  }, [albums, mergedOptions, preloader])

  // Trigger preloading when albums change
  useEffect(() => {
    preloadAlbumThumbnails()
  }, [preloadAlbumThumbnails])

  return {
    preloadState: state,
    preloadStats: preloader.getStats(),
    cacheInfo: preloader.getCacheInfo(),
    manualPreload: preloadAlbumThumbnails,
    clearCache: preloader.clear
  }
}

/**
 * Hook for preloading photo images in a photo grid
 */
export function usePhotoImagePreloading(
  photos: Photo[],
  currentIndex: number = 0,
  options: ImagePreloadingOptions = {}
) {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options }
  const preloader = useImagePreloader()
  const [state, setState] = useState<PreloadingState>({
    preloadingCount: 0,
    preloadedCount: 0,
    failedCount: 0,
    isPreloading: false
  })

  const preloadAroundIndex = useCallback(async (index: number) => {
    if (!photos.length) return

    setState(prev => ({ ...prev, isPreloading: true }))

    const startIndex = Math.max(0, index - Math.floor(mergedOptions.preloadAhead / 2))
    const endIndex = Math.min(photos.length - 1, startIndex + mergedOptions.preloadAhead)

    const photosToPreload = photos.slice(startIndex, endIndex)

    // Preload thumbnails first (high priority)
    if (mergedOptions.enableThumbnailPreloading) {
      const thumbnailUrls = photosToPreload.map((photo, idx) => ({
        url: `/api/photos/${photo.id}/thumbnail`,
        priority: mergedOptions.priorities.thumbnail,
        importance: Math.max(0, 1 - Math.abs(idx - (index - startIndex)) / mergedOptions.preloadAhead)
      }))

      setState(prev => ({ ...prev, preloadingCount: prev.preloadingCount + thumbnailUrls.length }))

      try {
        const thumbnailResults = await preloader.smartPreload(
          thumbnailUrls.map(item => ({
            url: item.url,
            importance: item.importance,
            userInteraction: Math.abs((startIndex + thumbnailUrls.indexOf(item)) - index) <= 1
          }))
        )

        const thumbSuccessful = thumbnailResults.filter(r => r.success).length
        const thumbFailed = thumbnailResults.filter(r => !r.success).length

        setState(prev => ({
          ...prev,
          preloadedCount: prev.preloadedCount + thumbSuccessful,
          failedCount: prev.failedCount + thumbFailed,
          preloadingCount: prev.preloadingCount - thumbnailUrls.length
        }))
      } catch (error) {
        setState(prev => ({ ...prev, preloadingCount: Math.max(0, prev.preloadingCount - thumbnailUrls.length) }))
      }
    }

    // Preload full images if enabled (lower priority)
    if (mergedOptions.enableFullImagePreloading) {
      const fullImageUrls = photosToPreload
        .slice(0, Math.min(3, photosToPreload.length)) // Limit full image preloading
        .map((photo, idx) => ({
          url: `/api/photos/${photo.id}/full`,
          priority: mergedOptions.priorities.fullImage,
          importance: Math.max(0, 1 - Math.abs(idx - (index - startIndex)) / 3)
        }))

      setState(prev => ({ ...prev, preloadingCount: prev.preloadingCount + fullImageUrls.length }))

      try {
        const fullImageResults = await preloader.preloadBatch(fullImageUrls)

        const fullSuccessful = fullImageResults.filter(r => r.success).length
        const fullFailed = fullImageResults.filter(r => !r.success).length

        setState(prev => ({
          ...prev,
          preloadedCount: prev.preloadedCount + fullSuccessful,
          failedCount: prev.failedCount + fullFailed,
          preloadingCount: prev.preloadingCount - fullImageUrls.length
        }))
      } catch (error) {
        setState(prev => ({ ...prev, preloadingCount: Math.max(0, prev.preloadingCount - fullImageUrls.length) }))
      }
    }

    setState(prev => ({ ...prev, isPreloading: false }))
  }, [photos, mergedOptions, preloader])

  // Preload around current index when it changes
  useEffect(() => {
    preloadAroundIndex(currentIndex)
  }, [currentIndex, preloadAroundIndex])

  return {
    preloadState: state,
    preloadStats: preloader.getStats(),
    cacheInfo: preloader.getCacheInfo(),
    preloadAroundIndex,
    clearCache: preloader.clear
  }
}

/**
 * Hook for viewport-based image preloading with Intersection Observer
 */
export function useIntersectionPreloading(
  options: ImagePreloadingOptions & {
    threshold?: number
    onImageLoad?: (url: string) => void
  } = {}
) {
  const { threshold = 0.1, onImageLoad, ...preloadOptions } = options
  const observerRef = useRef<IntersectionObserver | null>(null)
  const preloader = useImagePreloader(preloadOptions)

  useEffect(() => {
    observerRef.current = createIntersectionPreloader({
      threshold,
      rootMargin: options.viewportMargin || '100px',
      ...preloadOptions
    })

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [threshold, options.viewportMargin, preloadOptions])

  const observeElement = useCallback((element: HTMLElement) => {
    if (observerRef.current && element) {
      observerRef.current.observe(element)
    }
  }, [])

  const unobserveElement = useCallback((element: HTMLElement) => {
    if (observerRef.current && element) {
      observerRef.current.unobserve(element)
    }
  }, [])

  return {
    observeElement,
    unobserveElement,
    preloadStats: preloader.getStats(),
    cacheInfo: preloader.getCacheInfo()
  }
}