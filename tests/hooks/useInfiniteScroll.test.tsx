/**
 * useInfiniteScroll Hook Tests
 * Tests the infinite scroll hook functionality following TDD approach
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useInfiniteScroll } from '../../src/hooks/useInfiniteScroll'
import { mockIntersectionObserver, setupURLMocks } from '../utils'
import { InfiniteScrollOptions } from '../../src/types'

describe('useInfiniteScroll', () => {
  let mockObserverInstance: {
    observe: ReturnType<typeof vi.fn>
    disconnect: ReturnType<typeof vi.fn>
    unobserve: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    setupURLMocks()
    mockObserverInstance = mockIntersectionObserver()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Functionality', () => {
    it('returns correct initial state', () => {
      const mockCallback = vi.fn()
      const { result } = renderHook(() =>
        useInfiniteScroll(mockCallback, { enabled: true })
      )

      expect(result.current.isLoading).toBe(false)
      expect(result.current.hasNextPage).toBe(true)
      expect(result.current.error).toBe(null)
      expect(result.current.triggerRef).toBeDefined()
    })

    it('provides a trigger ref for DOM element attachment', () => {
      const mockCallback = vi.fn()
      const { result } = renderHook(() => useInfiniteScroll(mockCallback))

      expect(result.current.triggerRef).toBeDefined()
      expect(result.current.triggerRef.current).toBe(null)
    })

    it('creates IntersectionObserver when hook mounts', () => {
      const mockCallback = vi.fn()
      renderHook(() => useInfiniteScroll(mockCallback))

      expect(IntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          rootMargin: '50px',
          threshold: 0.1,
        })
      )
    })

    it('observes trigger element when ref is attached', () => {
      const mockCallback = vi.fn()
      const { result } = renderHook(() => useInfiniteScroll(mockCallback))

      // Simulate ref attachment
      const mockTriggerElement = document.createElement('div')
      act(() => {
        result.current.triggerRef.current = mockTriggerElement
      })

      expect(mockObserverInstance.observe).toHaveBeenCalledWith(
        mockTriggerElement
      )
    })

    it('disconnects observer on unmount', () => {
      const mockCallback = vi.fn()
      const { unmount } = renderHook(() => useInfiniteScroll(mockCallback))

      unmount()

      expect(mockObserverInstance.disconnect).toHaveBeenCalled()
    })
  })

  describe('Configuration Options', () => {
    it('accepts custom threshold option', () => {
      const mockCallback = vi.fn()
      const options: InfiniteScrollOptions = {
        threshold: 0.5,
        enabled: true,
      }

      renderHook(() => useInfiniteScroll(mockCallback, options))

      expect(IntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          threshold: 0.5,
        })
      )
    })

    it('accepts custom rootMargin option', () => {
      const mockCallback = vi.fn()
      const options: InfiniteScrollOptions = {
        rootMargin: '100px',
        enabled: true,
      }

      renderHook(() => useInfiniteScroll(mockCallback, options))

      expect(IntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          rootMargin: '100px',
        })
      )
    })

    it('respects enabled option when false', () => {
      const mockCallback = vi.fn()
      const { result } = renderHook(() =>
        useInfiniteScroll(mockCallback, { enabled: false })
      )

      const mockTriggerElement = document.createElement('div')
      act(() => {
        result.current.triggerRef.current = mockTriggerElement
      })

      // Should not observe when disabled
      expect(mockObserverInstance.observe).not.toHaveBeenCalled()
    })

    it('starts observing when enabled changes from false to true', () => {
      const mockCallback = vi.fn()
      let enabled = false

      const { result, rerender } = renderHook(() =>
        useInfiniteScroll(mockCallback, { enabled })
      )

      const mockTriggerElement = document.createElement('div')
      act(() => {
        result.current.triggerRef.current = mockTriggerElement
      })

      // Initially not observing
      expect(mockObserverInstance.observe).not.toHaveBeenCalled()

      // Enable and rerender
      enabled = true
      rerender()

      expect(mockObserverInstance.observe).toHaveBeenCalledWith(
        mockTriggerElement
      )
    })
  })

  describe('Intersection Handling', () => {
    it('calls callback when trigger element intersects', async () => {
      const mockCallback = vi.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() => useInfiniteScroll(mockCallback))

      const mockTriggerElement = document.createElement('div')
      act(() => {
        result.current.triggerRef.current = mockTriggerElement
      })

      // Get the intersection callback
      const intersectionCallback =
        vi.mocked(IntersectionObserver).mock.calls[0][0]

      // Simulate intersection
      act(() => {
        intersectionCallback(
          [
            {
              isIntersecting: true,
              target: mockTriggerElement,
            },
          ] as IntersectionObserverEntry[],
          mockObserverInstance as any
        )
      })

      expect(mockCallback).toHaveBeenCalledTimes(1)
    })

    it('does not call callback when element is not intersecting', () => {
      const mockCallback = vi.fn()
      const { result } = renderHook(() => useInfiniteScroll(mockCallback))

      const mockTriggerElement = document.createElement('div')
      act(() => {
        result.current.triggerRef.current = mockTriggerElement
      })

      const intersectionCallback =
        vi.mocked(IntersectionObserver).mock.calls[0][0]

      act(() => {
        intersectionCallback(
          [
            {
              isIntersecting: false,
              target: mockTriggerElement,
            },
          ] as IntersectionObserverEntry[],
          mockObserverInstance as any
        )
      })

      expect(mockCallback).not.toHaveBeenCalled()
    })

    it('does not call callback when hasNextPage is false', () => {
      const mockCallback = vi.fn()
      const { result } = renderHook(() => useInfiniteScroll(mockCallback))

      // Set hasNextPage to false
      act(() => {
        result.current.setHasNextPage(false)
      })

      const mockTriggerElement = document.createElement('div')
      act(() => {
        result.current.triggerRef.current = mockTriggerElement
      })

      const intersectionCallback =
        vi.mocked(IntersectionObserver).mock.calls[0][0]

      act(() => {
        intersectionCallback(
          [
            {
              isIntersecting: true,
              target: mockTriggerElement,
            },
          ] as IntersectionObserverEntry[],
          mockObserverInstance as any
        )
      })

      expect(mockCallback).not.toHaveBeenCalled()
    })

    it('does not call callback when already loading', async () => {
      const mockCallback = vi
        .fn()
        .mockImplementationOnce(
          () => new Promise(resolve => setTimeout(resolve, 100))
        )

      const { result } = renderHook(() => useInfiniteScroll(mockCallback))

      const mockTriggerElement = document.createElement('div')
      act(() => {
        result.current.triggerRef.current = mockTriggerElement
      })

      const intersectionCallback =
        vi.mocked(IntersectionObserver).mock.calls[0][0]

      // First intersection - should trigger
      act(() => {
        intersectionCallback(
          [
            {
              isIntersecting: true,
              target: mockTriggerElement,
            },
          ] as IntersectionObserverEntry[],
          mockObserverInstance as any
        )
      })

      expect(result.current.isLoading).toBe(true)

      // Second intersection while loading - should not trigger
      act(() => {
        intersectionCallback(
          [
            {
              isIntersecting: true,
              target: mockTriggerElement,
            },
          ] as IntersectionObserverEntry[],
          mockObserverInstance as any
        )
      })

      expect(mockCallback).toHaveBeenCalledTimes(1)
    })
  })

  describe('Loading State Management', () => {
    it('sets loading state during async callback execution', async () => {
      const mockCallback = vi
        .fn()
        .mockImplementation(
          () => new Promise(resolve => setTimeout(resolve, 50))
        )

      const { result } = renderHook(() => useInfiniteScroll(mockCallback))

      const mockTriggerElement = document.createElement('div')
      act(() => {
        result.current.triggerRef.current = mockTriggerElement
      })

      const intersectionCallback =
        vi.mocked(IntersectionObserver).mock.calls[0][0]

      act(() => {
        intersectionCallback(
          [
            {
              isIntersecting: true,
              target: mockTriggerElement,
            },
          ] as IntersectionObserverEntry[],
          mockObserverInstance as any
        )
      })

      expect(result.current.isLoading).toBe(true)

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false)
        },
        { timeout: 100 }
      )
    })

    it('provides manual loading control', () => {
      const mockCallback = vi.fn()
      const { result } = renderHook(() => useInfiniteScroll(mockCallback))

      act(() => {
        result.current.setIsLoading(true)
      })

      expect(result.current.isLoading).toBe(true)

      act(() => {
        result.current.setIsLoading(false)
      })

      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('handles callback errors gracefully', async () => {
      const mockCallback = vi.fn().mockRejectedValue(new Error('Load failed'))
      const { result } = renderHook(() => useInfiniteScroll(mockCallback))

      const mockTriggerElement = document.createElement('div')
      act(() => {
        result.current.triggerRef.current = mockTriggerElement
      })

      const intersectionCallback =
        vi.mocked(IntersectionObserver).mock.calls[0][0]

      act(() => {
        intersectionCallback(
          [
            {
              isIntersecting: true,
              target: mockTriggerElement,
            },
          ] as IntersectionObserverEntry[],
          mockObserverInstance as any
        )
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Load failed')
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('clears error on successful callback', async () => {
      const mockCallback = vi
        .fn()
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useInfiniteScroll(mockCallback))

      const mockTriggerElement = document.createElement('div')
      act(() => {
        result.current.triggerRef.current = mockTriggerElement
      })

      const intersectionCallback =
        vi.mocked(IntersectionObserver).mock.calls[0][0]

      // First call - should fail
      act(() => {
        intersectionCallback(
          [
            {
              isIntersecting: true,
              target: mockTriggerElement,
            },
          ] as IntersectionObserverEntry[],
          mockObserverInstance as any
        )
      })

      await waitFor(() => {
        expect(result.current.error).toBe('First error')
      })

      // Second call - should succeed and clear error
      act(() => {
        intersectionCallback(
          [
            {
              isIntersecting: true,
              target: mockTriggerElement,
            },
          ] as IntersectionObserverEntry[],
          mockObserverInstance as any
        )
      })

      await waitFor(() => {
        expect(result.current.error).toBe(null)
      })
    })

    it('provides manual error control', () => {
      const mockCallback = vi.fn()
      const { result } = renderHook(() => useInfiniteScroll(mockCallback))

      act(() => {
        result.current.setError('Manual error')
      })

      expect(result.current.error).toBe('Manual error')

      act(() => {
        result.current.setError(null)
      })

      expect(result.current.error).toBe(null)
    })
  })

  describe('HasNextPage Management', () => {
    it('provides manual hasNextPage control', () => {
      const mockCallback = vi.fn()
      const { result } = renderHook(() => useInfiniteScroll(mockCallback))

      expect(result.current.hasNextPage).toBe(true)

      act(() => {
        result.current.setHasNextPage(false)
      })

      expect(result.current.hasNextPage).toBe(false)
    })

    it('stops triggering when hasNextPage is false', () => {
      const mockCallback = vi.fn()
      const { result } = renderHook(() => useInfiniteScroll(mockCallback))

      act(() => {
        result.current.setHasNextPage(false)
      })

      const mockTriggerElement = document.createElement('div')
      act(() => {
        result.current.triggerRef.current = mockTriggerElement
      })

      const intersectionCallback =
        vi.mocked(IntersectionObserver).mock.calls[0][0]

      act(() => {
        intersectionCallback(
          [
            {
              isIntersecting: true,
              target: mockTriggerElement,
            },
          ] as IntersectionObserverEntry[],
          mockObserverInstance as any
        )
      })

      expect(mockCallback).not.toHaveBeenCalled()
    })
  })

  describe('Manual Trigger', () => {
    it('provides loadMore function for manual triggering', async () => {
      const mockCallback = vi.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() => useInfiniteScroll(mockCallback))

      await act(async () => {
        await result.current.loadMore()
      })

      expect(mockCallback).toHaveBeenCalledTimes(1)
    })

    it('prevents manual trigger when loading', async () => {
      const mockCallback = vi
        .fn()
        .mockImplementation(
          () => new Promise(resolve => setTimeout(resolve, 50))
        )

      const { result } = renderHook(() => useInfiniteScroll(mockCallback))

      // Start loading
      const loadPromise = act(async () => {
        await result.current.loadMore()
      })

      // Try to trigger again while loading
      await act(async () => {
        await result.current.loadMore()
      })

      await loadPromise

      expect(mockCallback).toHaveBeenCalledTimes(1)
    })

    it('prevents manual trigger when hasNextPage is false', async () => {
      const mockCallback = vi.fn()
      const { result } = renderHook(() => useInfiniteScroll(mockCallback))

      act(() => {
        result.current.setHasNextPage(false)
      })

      await act(async () => {
        await result.current.loadMore()
      })

      expect(mockCallback).not.toHaveBeenCalled()
    })
  })

  describe('Cleanup and Memory Management', () => {
    it('unobserves element when ref changes', () => {
      const mockCallback = vi.fn()
      const { result } = renderHook(() => useInfiniteScroll(mockCallback))

      const firstElement = document.createElement('div')
      const secondElement = document.createElement('div')

      // Attach first element
      act(() => {
        result.current.triggerRef.current = firstElement
      })

      expect(mockObserverInstance.observe).toHaveBeenCalledWith(firstElement)

      // Change to second element
      act(() => {
        result.current.triggerRef.current = secondElement
      })

      expect(mockObserverInstance.unobserve).toHaveBeenCalledWith(firstElement)
      expect(mockObserverInstance.observe).toHaveBeenCalledWith(secondElement)
    })

    it('cleans up observer when ref is cleared', () => {
      const mockCallback = vi.fn()
      const { result } = renderHook(() => useInfiniteScroll(mockCallback))

      const element = document.createElement('div')

      act(() => {
        result.current.triggerRef.current = element
      })

      act(() => {
        result.current.triggerRef.current = null
      })

      expect(mockObserverInstance.unobserve).toHaveBeenCalledWith(element)
    })

    it('handles multiple rapid ref changes gracefully', () => {
      const mockCallback = vi.fn()
      const { result } = renderHook(() => useInfiniteScroll(mockCallback))

      const elements = Array.from({ length: 5 }, () =>
        document.createElement('div')
      )

      elements.forEach(element => {
        act(() => {
          result.current.triggerRef.current = element
        })
      })

      // Should observe the last element
      expect(mockObserverInstance.observe).toHaveBeenCalledWith(elements[4])
      // Should unobserve previous elements
      expect(mockObserverInstance.unobserve).toHaveBeenCalledTimes(4)
    })
  })

  describe('Integration Scenarios', () => {
    it('works with paginated data loading pattern', async () => {
      let currentPage = 0
      const mockCallback = vi.fn().mockImplementation(async () => {
        currentPage++
        return { page: currentPage, hasMore: currentPage < 3 }
      })

      const { result } = renderHook(() => useInfiniteScroll(mockCallback))

      const mockTriggerElement = document.createElement('div')
      act(() => {
        result.current.triggerRef.current = mockTriggerElement
      })

      const intersectionCallback =
        vi.mocked(IntersectionObserver).mock.calls[0][0]

      // Load first page
      act(() => {
        intersectionCallback(
          [
            {
              isIntersecting: true,
              target: mockTriggerElement,
            },
          ] as IntersectionObserverEntry[],
          mockObserverInstance as any
        )
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockCallback).toHaveBeenCalledTimes(1)

      // Load second page
      act(() => {
        intersectionCallback(
          [
            {
              isIntersecting: true,
              target: mockTriggerElement,
            },
          ] as IntersectionObserverEntry[],
          mockObserverInstance as any
        )
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockCallback).toHaveBeenCalledTimes(2)

      // Simulate no more pages
      act(() => {
        result.current.setHasNextPage(false)
      })

      // Should not load more
      act(() => {
        intersectionCallback(
          [
            {
              isIntersecting: true,
              target: mockTriggerElement,
            },
          ] as IntersectionObserverEntry[],
          mockObserverInstance as any
        )
      })

      expect(mockCallback).toHaveBeenCalledTimes(2)
    })
  })
})
