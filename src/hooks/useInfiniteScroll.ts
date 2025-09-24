/**
 * useInfiniteScroll Hook
 * Provides infinite scrolling functionality with IntersectionObserver
 */

import { useRef, useEffect, useCallback, useState } from 'react'
import { InfiniteScrollOptions } from '../types'

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

  // Refs
  const triggerRef = useRef<HTMLElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const callbackRef = useRef(callback)

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Load more function for manual triggering
  const loadMore = useCallback(async () => {
    if (isLoading || !hasNextPage) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await callbackRef.current()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, hasNextPage])

  // Intersection observer callback
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0]

      if (entry.isIntersecting && hasNextPage && !isLoading) {
        loadMore()
      }
    },
    [hasNextPage, isLoading, loadMore]
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
  }
}