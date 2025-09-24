/**
 * useRetry Hook Tests
 * Tests the retry functionality with exponential backoff
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRetry } from '../../src/hooks/useRetry'

describe('useRetry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Successful execution', () => {
    it('executes function successfully on first try', async () => {
      const { result } = renderHook(() => useRetry())
      const mockFn = vi.fn().mockResolvedValue('success')

      const executePromise = act(async () => {
        return result.current.execute(mockFn)
      })

      const response = await executePromise

      expect(response).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(result.current.retrying).toBe(false)
      expect(result.current.retryCount).toBe(0)
      expect(result.current.lastError).toBe(null)
    })
  })

  describe('Retry behavior', () => {
    it('retries failed operations', async () => {
      const { result } = renderHook(() => useRetry({
        maxRetries: 2,
        initialDelay: 10, // Very short delay for testing
        backoffFactor: 1.1
      }))

      const mockFn = vi.fn()
        .mockRejectedValueOnce(new Error('network error'))
        .mockRejectedValueOnce(new Error('network error'))
        .mockResolvedValueOnce('success')

      const response = await act(async () => {
        return result.current.execute(mockFn)
      })

      expect(response).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(3)
      expect(result.current.retrying).toBe(false)
    })

    it('respects maxRetries limit', async () => {
      const { result } = renderHook(() => useRetry({
        maxRetries: 1,
        initialDelay: 10
      }))
      const mockError = new Error('persistent network error')
      const mockFn = vi.fn().mockRejectedValue(mockError)

      let caughtError: Error | null = null

      try {
        await act(async () => {
          await result.current.execute(mockFn)
        })
      } catch (error) {
        caughtError = error as Error
      }

      expect(caughtError).toBe(mockError)
      expect(mockFn).toHaveBeenCalledTimes(2) // Initial + 1 retry
      expect(result.current.retrying).toBe(false)
      expect(result.current.lastError).toBeTruthy()
    })
  })

  describe('Retry conditions', () => {
    it('respects custom retry conditions', async () => {
      const { result } = renderHook(() => useRetry({
        maxRetries: 2,
        initialDelay: 10,
        retryCondition: (error) => error.message.includes('retryable')
      }))

      const nonRetryableError = new Error('validation error')
      const mockFn = vi.fn().mockRejectedValue(nonRetryableError)

      let caughtError: Error | null = null

      try {
        await act(async () => {
          await result.current.execute(mockFn)
        })
      } catch (error) {
        caughtError = error as Error
      }

      expect(caughtError).toBe(nonRetryableError)
      expect(mockFn).toHaveBeenCalledTimes(1) // No retries due to condition
      expect(result.current.retrying).toBe(false)
    })
  })

  describe('Reset functionality', () => {
    it('resets retry state', async () => {
      const { result } = renderHook(() => useRetry({
        maxRetries: 0,
        initialDelay: 10
      }))
      const mockError = new Error('network error')
      const mockFn = vi.fn().mockRejectedValue(mockError)

      try {
        await act(async () => {
          await result.current.execute(mockFn)
        })
      } catch (error) {
        // Expected to fail
      }

      expect(result.current.lastError).toBeTruthy()

      act(() => {
        result.current.reset()
      })

      expect(result.current.retrying).toBe(false)
      expect(result.current.retryCount).toBe(0)
      expect(result.current.lastError).toBe(null)
    })
  })

  describe('Error handling', () => {
    it('preserves original error types', async () => {
      const { result } = renderHook(() => useRetry({ maxRetries: 0, initialDelay: 10 }))
      const customError = new TypeError('Custom error type')
      const mockFn = vi.fn().mockRejectedValue(customError)

      let caughtError: Error | null = null

      try {
        await act(async () => {
          await result.current.execute(mockFn)
        })
      } catch (error) {
        caughtError = error as Error
      }

      expect(caughtError).toBeInstanceOf(TypeError)
      expect(caughtError?.message).toBe('Custom error type')
    })

    it('handles non-Error objects', async () => {
      const { result } = renderHook(() => useRetry({ maxRetries: 0, initialDelay: 10 }))
      const mockFn = vi.fn().mockRejectedValue('string error')

      let caughtError: Error | null = null

      try {
        await act(async () => {
          await result.current.execute(mockFn)
        })
      } catch (error) {
        caughtError = error as Error
      }

      expect(caughtError).toBeInstanceOf(Error)
      expect(caughtError?.message).toBe('Unknown error')
    })
  })
})