/**
 * useRetry Hook
 * Provides retry functionality for async operations with exponential backoff
 */

import { useState, useCallback } from 'react'

export interface RetryOptions {
  maxRetries?: number
  initialDelay?: number
  maxDelay?: number
  backoffFactor?: number
  retryCondition?: (error: Error) => boolean
}

export interface UseRetryReturn<T> {
  execute: (fn: () => Promise<T>) => Promise<T>
  retrying: boolean
  retryCount: number
  lastError: Error | null
  reset: () => void
}

const defaultRetryCondition = (error: Error): boolean => {
  // Retry on network errors and 5xx server errors
  return error.message.includes('network') ||
         error.message.includes('timeout') ||
         error.message.includes('fetch')
}

export function useRetry<T>(options: RetryOptions = {}): UseRetryReturn<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    retryCondition = defaultRetryCondition
  } = options

  const [retrying, setRetrying] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [lastError, setLastError] = useState<Error | null>(null)

  const delay = (ms: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms))

  const calculateDelay = (attempt: number): number => {
    const delayMs = Math.min(
      initialDelay * Math.pow(backoffFactor, attempt),
      maxDelay
    )
    // Add jitter to prevent thundering herd
    return delayMs + (Math.random() * 0.1 * delayMs)
  }

  const execute = useCallback(async (fn: () => Promise<T>): Promise<T> => {
    let attempt = 0
    setRetrying(false)
    setRetryCount(0)

    while (attempt <= maxRetries) {
      try {
        if (attempt > 0) {
          setRetrying(true)
          setRetryCount(attempt)
          const delayMs = calculateDelay(attempt - 1)
          await delay(delayMs)
        }

        const result = await fn()

        // Only reset error on success
        setRetrying(false)
        setRetryCount(0)
        setLastError(null)

        return result
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error')
        setLastError(err)

        if (attempt >= maxRetries || !retryCondition(err)) {
          setRetrying(false)
          throw err
        }

        attempt++
      }
    }

    // This should never be reached, but TypeScript needs it
    throw lastError
  }, [maxRetries, initialDelay, maxDelay, backoffFactor, retryCondition, lastError])

  const reset = useCallback(() => {
    setRetrying(false)
    setRetryCount(0)
    setLastError(null)
  }, [])

  return {
    execute,
    retrying,
    retryCount,
    lastError,
    reset
  }
}