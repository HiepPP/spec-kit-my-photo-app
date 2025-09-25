/**
 * useInfiniteAlbums Hook
 * Manages infinite scrolling for albums with pagination and retry logic
 */

import { useState, useCallback, useEffect } from 'react'
import { Album, PaginatedResponse } from '../types'
import { mockDataService } from '../services/MockDataService'
import { useInfiniteScroll } from './useInfiniteScroll'
import { useRetry } from './useRetry'

export interface UseInfiniteAlbumsReturn {
  albums: Album[]
  loading: boolean
  error: string | null
  hasNextPage: boolean
  triggerRef: React.RefObject<HTMLElement>
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  retrying: boolean
  retryCount: number
  retry: () => Promise<void>
}

export function useInfiniteAlbums(pageSize: number = 12): UseInfiniteAlbumsReturn {
  const [albums, setAlbums] = useState<Album[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasNextPage, setHasNextPage] = useState(true)
  const [lastFailedPage, setLastFailedPage] = useState<number | null>(null)

  // Configure retry with album-specific settings
  const { execute: executeWithRetry, retrying, retryCount, reset: resetRetry } = useRetry<PaginatedResponse<Album>>({
    maxRetries: 3,
    initialDelay: 1000,
    backoffFactor: 1.5,
    retryCondition: (error) => {
      // Retry on network-like errors but not on validation errors
      return !error.message.includes('not found') && !error.message.includes('invalid')
    }
  })

  const loadAlbumsPage = useCallback(async (page: number, reset: boolean = false) => {
    try {
      setLoading(true)
      setError(null)
      setLastFailedPage(null)
      resetRetry()

      const response = await executeWithRetry(() =>
        mockDataService.getAlbumsPaginated(page, pageSize)
      )

      if (reset) {
        setAlbums(response.data)
      } else {
        setAlbums(prev => [...prev, ...response.data])
      }

      setHasNextPage(response.pagination.hasNextPage)
      setCurrentPage(page)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load albums'
      setError(errorMessage)
      setLastFailedPage(page)
    } finally {
      setLoading(false)
    }
  }, [pageSize, executeWithRetry, resetRetry])

  const loadMore = useCallback(async () => {
    if (!hasNextPage || loading) return
    await loadAlbumsPage(currentPage + 1, false)
  }, [currentPage, hasNextPage, loading, loadAlbumsPage])

  const refresh = useCallback(async () => {
    setCurrentPage(1)
    setAlbums([])
    setHasNextPage(true)
    await loadAlbumsPage(1, true)
  }, [loadAlbumsPage])

  const retry = useCallback(async () => {
    if (lastFailedPage) {
      await loadAlbumsPage(lastFailedPage, lastFailedPage === 1)
    }
  }, [lastFailedPage, loadAlbumsPage])

  const { triggerRef } = useInfiniteScroll(loadMore, {
    enabled: hasNextPage && !loading,
    threshold: 0.1,
    rootMargin: '100px',
  })

  // Load initial page on mount and generate demo data if empty
  useEffect(() => {
    const initializeData = async () => {
      // Generate demo data if no albums exist
      const initialAlbums = await mockDataService.getAllAlbums()
      if (initialAlbums.length === 0) {
        mockDataService.generateDemoData(50)
      }
      await loadAlbumsPage(1, true)
    }

    initializeData()
  }, [loadAlbumsPage])

  return {
    albums,
    loading,
    error,
    hasNextPage,
    triggerRef,
    loadMore,
    refresh,
    retrying,
    retryCount,
    retry,
  }
}