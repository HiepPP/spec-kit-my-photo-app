/**
import * as React from 'react';

/**
 * Bundle Optimization Utilities
 * Runtime performance monitoring and optimization helpers
 */

export interface BundleMetrics {
  /** Total bundle size in bytes */
  totalSize: number
  /** Number of chunks loaded */
  chunksLoaded: number
  /** Load time metrics */
  loadTimes: {
    initial: number
    chunks: Record<string, number>
    average: number
  }
  /** Network information */
  connection?: {
    effectiveType: string
    downlink: number
    saveData: boolean
  }
  /** Memory usage */
  memory?: {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  }
}

export interface OptimizationRecommendations {
  /** Whether to enable lazy loading */
  enableLazyLoading: boolean
  /** Whether to preload critical resources */
  enablePreloading: boolean
  /** Whether to defer non-critical JavaScript */
  deferNonCritical: boolean
  /** Recommended chunk sizes */
  chunkSizeRecommendation: {
    maxSize: number
    reason: string
  }
}

class BundleOptimizer {
  private metrics: BundleMetrics = {
    totalSize: 0,
    chunksLoaded: 0,
    loadTimes: {
      initial: 0,
      chunks: {},
      average: 0
    }
  }

  private observers: {
    performance?: PerformanceObserver
    navigation?: PerformanceObserver
  } = {}

  private startTime = performance.now()

  constructor() {
    this.initializeMonitoring()
    this.collectInitialMetrics()
  }

  /**
   * Initialize performance monitoring
   */
  private initializeMonitoring(): void {
    if ('PerformanceObserver' in window) {
      // Monitor resource loading
      this.observers.performance = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processPerformanceEntry(entry)
        }
      })

      try {
        this.observers.performance.observe({ entryTypes: ['resource', 'navigation'] })
      } catch (error) {
        console.warn('Performance monitoring not fully supported:', error)
      }
    }
  }

  /**
   * Collect initial metrics
   */
  private collectInitialMetrics(): void {
    // Network information
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      this.metrics.connection = {
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        saveData: connection.saveData || false
      }
    }

    // Memory information
    if ('memory' in performance) {
      const memory = (performance as any).memory
      this.metrics.memory = {
        usedJSHeapSize: memory.usedJSHeapSize || 0,
        totalJSHeapSize: memory.totalJSHeapSize || 0,
        jsHeapSizeLimit: memory.jsHeapSizeLimit || 0
      }
    }

    // Initial load time
    if (document.readyState === 'complete') {
      this.metrics.loadTimes.initial = performance.now() - this.startTime
    } else {
      window.addEventListener('load', () => {
        this.metrics.loadTimes.initial = performance.now() - this.startTime
      })
    }
  }

  /**
   * Process performance entries
   */
  private processPerformanceEntry(entry: PerformanceEntry): void {
    if (entry.entryType === 'resource') {
      const resourceEntry = entry as PerformanceResourceTiming

      // Track JavaScript chunks
      if (resourceEntry.name.includes('.js')) {
        const chunkName = this.extractChunkName(resourceEntry.name)
        this.metrics.loadTimes.chunks[chunkName] = resourceEntry.duration
        this.metrics.chunksLoaded++

        // Estimate bundle size (rough approximation)
        if (resourceEntry.transferSize) {
          this.metrics.totalSize += resourceEntry.transferSize
        }
      }
    }

    // Calculate average load time
    const chunkTimes = Object.values(this.metrics.loadTimes.chunks)
    this.metrics.loadTimes.average = chunkTimes.length > 0
      ? chunkTimes.reduce((sum, time) => sum + time, 0) / chunkTimes.length
      : 0
  }

  /**
   * Extract chunk name from URL
   */
  private extractChunkName(url: string): string {
    const parts = url.split('/')
    const filename = parts[parts.length - 1]
    return filename.split('.')[0] || 'unknown'
  }

  /**
   * Get current bundle metrics
   */
  getMetrics(): BundleMetrics {
    // Update memory if available
    if ('memory' in performance) {
      const memory = (performance as any).memory
      this.metrics.memory = {
        usedJSHeapSize: memory.usedJSHeapSize || 0,
        totalJSHeapSize: memory.totalJSHeapSize || 0,
        jsHeapSizeLimit: memory.jsHeapSizeLimit || 0
      }
    }

    return { ...this.metrics }
  }

  /**
   * Generate optimization recommendations
   */
  getRecommendations(): OptimizationRecommendations {
    const metrics = this.getMetrics()

    // Base recommendations on connection and performance
    const isSlowConnection = metrics.connection?.effectiveType === '2g' ||
                           metrics.connection?.effectiveType === 'slow-2g' ||
                           (metrics.connection?.downlink || 0) < 1

    const isHighMemoryUsage = metrics.memory &&
                             (metrics.memory.usedJSHeapSize / metrics.memory.jsHeapSizeLimit) > 0.7

    const isSlowLoading = metrics.loadTimes.average > 1000 // 1 second

    return {
      enableLazyLoading: isSlowConnection || isHighMemoryUsage || metrics.chunksLoaded > 10,
      enablePreloading: !isSlowConnection && !metrics.connection?.saveData,
      deferNonCritical: isSlowConnection || isSlowLoading,
      chunkSizeRecommendation: {
        maxSize: isSlowConnection ? 50000 : 200000, // 50KB or 200KB
        reason: isSlowConnection
          ? 'Slow connection detected - smaller chunks recommended'
          : 'Normal connection - standard chunk sizes acceptable'
      }
    }
  }

  /**
   * Log performance report to console
   */
  logReport(): void {
    const metrics = this.getMetrics()
    const recommendations = this.getRecommendations()

    console.group('📦 Bundle Optimization Report')

    console.log('Bundle Metrics:', {
      'Total Size': `${(metrics.totalSize / 1024).toFixed(2)} KB`,
      'Chunks Loaded': metrics.chunksLoaded,
      'Initial Load Time': `${metrics.loadTimes.initial.toFixed(2)}ms`,
      'Average Chunk Load Time': `${metrics.loadTimes.average.toFixed(2)}ms`
    })

    if (metrics.connection) {
      console.log('Connection:', {
        'Effective Type': metrics.connection.effectiveType,
        'Downlink': `${metrics.connection.downlink} Mbps`,
        'Save Data': metrics.connection.saveData
      })
    }

    if (metrics.memory) {
      console.log('Memory Usage:', {
        'Used Heap': `${(metrics.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        'Total Heap': `${(metrics.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        'Heap Limit': `${(metrics.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
      })
    }

    console.log('Recommendations:', recommendations)
    console.groupEnd()
  }

  /**
   * Check if bundle optimization is working effectively
   */
  evaluateOptimization(): {
    score: number // 0-100
    issues: string[]
    suggestions: string[]
  } {
    const metrics = this.getMetrics()
    const issues: string[] = []
    const suggestions: string[] = []
    let score = 100

    // Check bundle size
    if (metrics.totalSize > 1024 * 1024) { // 1MB
      score -= 20
      issues.push('Bundle size exceeds 1MB')
      suggestions.push('Consider code splitting and lazy loading')
    }

    // Check load times
    if (metrics.loadTimes.initial > 3000) { // 3 seconds
      score -= 30
      issues.push('Initial load time is slow')
      suggestions.push('Optimize critical path and defer non-essential resources')
    }

    // Check chunk count
    if (metrics.chunksLoaded > 20) {
      score -= 15
      issues.push('Too many chunks loaded')
      suggestions.push('Consider combining smaller chunks')
    }

    // Check memory usage
    if (metrics.memory && (metrics.memory.usedJSHeapSize / metrics.memory.jsHeapSizeLimit) > 0.8) {
      score -= 25
      issues.push('High memory usage detected')
      suggestions.push('Implement memory optimization strategies')
    }

    return {
      score: Math.max(0, score),
      issues,
      suggestions
    }
  }

  /**
   * Clean up observers
   */
  dispose(): void {
    Object.values(this.observers).forEach(observer => {
      if (observer) {
        observer.disconnect()
      }
    })
  }
}

// Global bundle optimizer instance
export const bundleOptimizer = new BundleOptimizer()

// React hook for bundle optimization
export function useBundleOptimization() {
  const [metrics, setMetrics] = React.useState<BundleMetrics | null>(null)
  const [recommendations, setRecommendations] = React.useState<OptimizationRecommendations | null>(null)

  React.useEffect(() => {
    // Initial metrics
    setMetrics(bundleOptimizer.getMetrics())
    setRecommendations(bundleOptimizer.getRecommendations())

    // Update metrics periodically
    const interval = typeof setInterval !== 'undefined' ? setInterval(() => {
      setMetrics(bundleOptimizer.getMetrics())
      setRecommendations(bundleOptimizer.getRecommendations())
    }, 5000) : null

    return () => {
      if (interval && typeof clearInterval !== 'undefined') {
        clearInterval(interval)
      }
    }
  }, [])

  const logReport = React.useCallback(() => {
    bundleOptimizer.logReport()
  }, [])

  const evaluateOptimization = React.useCallback(() => {
    return bundleOptimizer.evaluateOptimization()
  }, [])

  return {
    metrics,
    recommendations,
    logReport,
    evaluateOptimization
  }
}

// Utility for dynamic import with error handling
export async function safeDynamicImport<T>(
  importFunction: () => Promise<T>,
  fallback?: T,
  retries: number = 3
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await importFunction()
    } catch (error) {
      lastError = error as Error
      console.warn(`Dynamic import attempt ${attempt} failed:`, error)

      if (attempt < retries) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => {
          if (typeof setTimeout !== 'undefined') {
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          } else {
            resolve(undefined)
          }
        })
      }
    }
  }

  if (fallback !== undefined) {
    console.error('Dynamic import failed after all retries, using fallback:', lastError)
    return fallback
  }

  throw lastError
}

// Development-only bundle analyzer
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Log initial report after 5 seconds
  setTimeout(() => {
    bundleOptimizer.logReport()
  }, 5000)

  // Global access for debugging
  (window as any).__bundleOptimizer = bundleOptimizer
}