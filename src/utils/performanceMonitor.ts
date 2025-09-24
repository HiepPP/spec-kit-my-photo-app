/**
 * Performance monitoring utilities for infinite scroll and UI interactions
 * Tracks metrics like scroll performance, render times, and memory usage
 */

export interface PerformanceMetrics {
  scrollFPS: number[]
  renderTime: number[]
  memoryUsage: number[]
  loadTime: number[]
  intersectionTime: number[]
  timestamp: number
}

export interface ScrollPerformanceOptions {
  enableFPSMonitoring?: boolean
  enableMemoryMonitoring?: boolean
  enableRenderTimeMonitoring?: boolean
  sampleSize?: number
  reportingInterval?: number
  onReport?: (metrics: PerformanceMetrics) => void
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    scrollFPS: [],
    renderTime: [],
    memoryUsage: [],
    loadTime: [],
    intersectionTime: [],
    timestamp: Date.now()
  }

  private options: Required<ScrollPerformanceOptions> = {
    enableFPSMonitoring: true,
    enableMemoryMonitoring: true,
    enableRenderTimeMonitoring: true,
    sampleSize: 100,
    reportingInterval: 5000,
    onReport: () => {}
  }

  private isMonitoring = false
  private animationFrameId: number | null = null
  private reportingIntervalId: NodeJS.Timeout | null = null
  private lastFrameTime = 0
  private frameCount = 0
  private fpsStartTime = 0

  constructor(options: ScrollPerformanceOptions = {}) {
    this.options = { ...this.options, ...options }
  }

  /**
   * Start performance monitoring
   */
  start(): void {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.fpsStartTime = performance.now()
    this.lastFrameTime = performance.now()

    if (this.options.enableFPSMonitoring) {
      this.startFPSMonitoring()
    }

    if (this.options.reportingInterval > 0) {
      this.reportingIntervalId = setInterval(() => {
        this.generateReport()
      }, this.options.reportingInterval)
    }
  }

  /**
   * Stop performance monitoring
   */
  stop(): void {
    this.isMonitoring = false

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }

    if (this.reportingIntervalId) {
      clearInterval(this.reportingIntervalId)
      this.reportingIntervalId = null
    }
  }

  /**
   * Record render time for a specific operation
   */
  recordRenderTime(startTime: number): void {
    if (!this.options.enableRenderTimeMonitoring) return

    const renderTime = performance.now() - startTime
    this.addMetric('renderTime', renderTime)
  }

  /**
   * Record load time for data fetching
   */
  recordLoadTime(startTime: number): void {
    const loadTime = performance.now() - startTime
    this.addMetric('loadTime', loadTime)
  }

  /**
   * Record intersection observer timing
   */
  recordIntersectionTime(startTime: number): void {
    const intersectionTime = performance.now() - startTime
    this.addMetric('intersectionTime', intersectionTime)
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics = {
      scrollFPS: [],
      renderTime: [],
      memoryUsage: [],
      loadTime: [],
      intersectionTime: [],
      timestamp: Date.now()
    }
  }

  /**
   * Generate and report performance summary
   */
  private generateReport(): void {
    const report = this.calculateSummary()
    this.options.onReport(this.metrics)

    // Log to console if no custom reporter
    if (this.options.onReport === (() => {})) {
      console.group('🚀 Infinite Scroll Performance Report')
      console.log('Average FPS:', report.avgFPS.toFixed(2))
      console.log('Min FPS:', report.minFPS.toFixed(2))
      console.log('Average Render Time:', report.avgRenderTime.toFixed(2), 'ms')
      console.log('Average Load Time:', report.avgLoadTime.toFixed(2), 'ms')
      console.log('Memory Usage:', report.memoryUsageMB.toFixed(2), 'MB')
      console.groupEnd()
    }
  }

  /**
   * Calculate performance summary statistics
   */
  private calculateSummary() {
    return {
      avgFPS: this.average(this.metrics.scrollFPS),
      minFPS: Math.min(...this.metrics.scrollFPS),
      maxFPS: Math.max(...this.metrics.scrollFPS),
      avgRenderTime: this.average(this.metrics.renderTime),
      avgLoadTime: this.average(this.metrics.loadTime),
      avgIntersectionTime: this.average(this.metrics.intersectionTime),
      memoryUsageMB: this.getMemoryUsageMB()
    }
  }

  /**
   * Start FPS monitoring using requestAnimationFrame
   */
  private startFPSMonitoring(): void {
    const measureFrame = () => {
      if (!this.isMonitoring) return

      const currentTime = performance.now()
      const deltaTime = currentTime - this.lastFrameTime

      if (deltaTime > 0) {
        const fps = 1000 / deltaTime
        this.addMetric('scrollFPS', fps)
      }

      this.lastFrameTime = currentTime
      this.frameCount++

      // Record memory usage periodically
      if (this.options.enableMemoryMonitoring && this.frameCount % 60 === 0) {
        this.recordMemoryUsage()
      }

      this.animationFrameId = requestAnimationFrame(measureFrame)
    }

    this.animationFrameId = requestAnimationFrame(measureFrame)
  }

  /**
   * Record current memory usage if available
   */
  private recordMemoryUsage(): void {
    // @ts-ignore - performance.memory is not in all TypeScript definitions
    if ('memory' in performance && performance.memory) {
      // @ts-ignore
      const memoryMB = performance.memory.usedJSHeapSize / 1024 / 1024
      this.addMetric('memoryUsage', memoryMB)
    }
  }

  /**
   * Get current memory usage in MB
   */
  private getMemoryUsageMB(): number {
    // @ts-ignore - performance.memory is not in all TypeScript definitions
    if ('memory' in performance && performance.memory) {
      // @ts-ignore
      return performance.memory.usedJSHeapSize / 1024 / 1024
    }
    return 0
  }

  /**
   * Add a metric value and maintain sample size limit
   */
  private addMetric(type: keyof Omit<PerformanceMetrics, 'timestamp'>, value: number): void {
    const metrics = this.metrics[type]
    metrics.push(value)

    // Keep only the latest samples
    if (metrics.length > this.options.sampleSize) {
      metrics.shift()
    }
  }

  /**
   * Calculate average of an array of numbers
   */
  private average(values: number[]): number {
    if (values.length === 0) return 0
    return values.reduce((sum, value) => sum + value, 0) / values.length
  }
}

// Create a singleton instance for global use
export const performanceMonitor = new PerformanceMonitor()

// Hook for React components
export function usePerformanceMonitor(options: ScrollPerformanceOptions = {}) {
  const monitor = new PerformanceMonitor(options)

  return {
    start: () => monitor.start(),
    stop: () => monitor.stop(),
    recordRenderTime: (startTime: number) => monitor.recordRenderTime(startTime),
    recordLoadTime: (startTime: number) => monitor.recordLoadTime(startTime),
    recordIntersectionTime: (startTime: number) => monitor.recordIntersectionTime(startTime),
    getMetrics: () => monitor.getMetrics(),
    reset: () => monitor.reset()
  }
}

// Utility for measuring render time
export function measureRenderTime<T>(fn: () => T, monitor?: PerformanceMonitor): T {
  const startTime = performance.now()
  const result = fn()

  if (monitor) {
    monitor.recordRenderTime(startTime)
  } else {
    performanceMonitor.recordRenderTime(startTime)
  }

  return result
}

// Utility for measuring async operations
export async function measureAsyncTime<T>(
  fn: () => Promise<T>,
  monitor?: PerformanceMonitor
): Promise<T> {
  const startTime = performance.now()
  const result = await fn()

  if (monitor) {
    monitor.recordLoadTime(startTime)
  } else {
    performanceMonitor.recordLoadTime(startTime)
  }

  return result
}