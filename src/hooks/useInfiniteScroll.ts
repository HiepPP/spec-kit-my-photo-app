/**
 * useInfiniteScroll Hook
 * Provides infinite scrolling functionality with IntersectionObserver
 * Includes performance monitoring for scroll metrics
 */

import { useRef, useEffect, useCallback, useState } from 'react'
import { InfiniteScrollOptions } from '../types'
import { usePerformanceMonitor, measureAsyncTime } from '../utils/performanceMonitor'

export interface UseInfiniteScrollReturn {
  /** Reference to attach to the trigger element */
  triggerRef: React.RefObject<HTMLElement>
  /** Loading state indicator */
  isLoading: boolean
  /** Whether there are more items to load */
  hasNextPage: boolean
  /** Current error message, if any */
  error: string | null
  /** Manual loading trigger */
  loadMore: () => Promise<void>
  /** Manual loading state control */
  setIsLoading: (loading: boolean) => void
  /** Manual hasNextPage control */
  setHasNextPage: (hasNext: boolean) => void
  /** Manual error control */
  setError: (error: string | null) => void
  /** Focus management for new content */
  focusNewContent: (selector?: string) => void
  /** Performance metrics */
  performanceMetrics: () => any
  /** Start performance monitoring */
  startPerformanceMonitoring: () => void
  /** Stop performance monitoring */
  stopPerformanceMonitoring: () => void
}

export function useInfiniteScroll(
  callback: () => Promise<void>,
  options: InfiniteScrollOptions = {}
): UseInfiniteScrollReturn {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    enabled = true
  } = options

  // State management
  const [isLoading, setIsLoading] = useState(false)
  const [hasNextPage, setHasNextPage] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Performance monitoring
  const performanceMonitor = usePerformanceMonitor({
    enableFPSMonitoring: true,
    enableMemoryMonitoring: true,
    enableRenderTimeMonitoring: true,
    sampleSize: 50,
    reportingInterval: 10000, // Report every 10 seconds
    onReport: (metrics) => {
      console.group('📊 Infinite Scroll Performance')
      console.log('Scroll Performance:', {
        avgFPS: metrics.scrollFPS.length > 0 ? (metrics.scrollFPS.reduce((a, b) => a + b, 0) / metrics.scrollFPS.length).toFixed(2) : 'N/A',
        avgLoadTime: metrics.loadTime.length > 0 ? (metrics.loadTime.reduce((a, b) => a + b, 0) / metrics.loadTime.length).toFixed(2) + 'ms' : 'N/A',
        avgIntersectionTime: metrics.intersectionTime.length > 0 ? (metrics.intersectionTime.reduce((a, b) => a + b, 0) / metrics.intersectionTime.length).toFixed(2) + 'ms' : 'N/A'
      })
      console.groupEnd()
    }
  })

  // Refs
  const triggerRef = useRef<HTMLElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const callbackRef = useRef(callback)
  const itemCountRef = useRef(0)

  // Focus management function
  const focusNewContent = useCallback((selector: string = '[role="button"]') => {
    // Wait for DOM update
    setTimeout(() => {
      const items = document.querySelectorAll(selector)
      const firstNewItem = items[itemCountRef.current] as HTMLElement
      if (firstNewItem && firstNewItem.focus) {
        firstNewItem.focus()

        // Scroll into view if needed
        firstNewItem.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        })
      }
    }, 100)
  }, [])

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Load more function for manual triggering with performance tracking
  const loadMore = useCallback(async () => {
    if (isLoading || !hasNextPage) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await measureAsyncTime(callbackRef.current)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, hasNextPage, performanceMonitor])

  // Intersection observer callback with performance tracking
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const intersectionStartTime = performance.now()
      const entry = entries[0]

      if (entry.isIntersecting && hasNextPage && !isLoading) {
        performanceMonitor.recordIntersectionTime(intersectionStartTime)
        loadMore()
      }
    },
    [hasNextPage, isLoading, loadMore, performanceMonitor]
  )

  // Initialize IntersectionObserver
  useEffect(() => {
    if (!enabled) {
      return
    }

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
    })

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [enabled, threshold, rootMargin, handleIntersection])

  // Handle trigger ref changes
  useEffect(() => {
    const observer = observerRef.current
    const element = triggerRef.current

    if (!observer || !element || !enabled) {
      return
    }

    observer.observe(element)

    return () => {
      if (observer && element) {
        observer.unobserve(element)
      }
    }
  }, [triggerRef.current, enabled])

  return {
    triggerRef,
    isLoading,
    hasNextPage,
    error,
    loadMore,
    setIsLoading,
    setHasNextPage,
    setError,
    focusNewContent,
    performanceMetrics: performanceMonitor.getMetrics,
    startPerformanceMonitoring: performanceMonitor.start,
    stopPerformanceMonitoring: performanceMonitor.stop,
  }
}