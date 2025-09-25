/**
 * Image Preloader Utilities
 * Provides intelligent image preloading for smooth user experience
 */

export interface PreloadOptions {
  /** Priority levels for preloading */
  priority?: 'high' | 'medium' | 'low'
  /** Maximum concurrent preloads */
  maxConcurrent?: number
  /** Timeout for preload attempts */
  timeout?: number
  /** Enable/disable preloading based on connection */
  respectDataSaver?: boolean
  /** Enable/disable based on memory constraints */
  respectMemoryConstraints?: boolean
}

export interface PreloadResult {
  /** Whether the image was successfully preloaded */
  success: boolean
  /** Error message if preload failed */
  error?: string
  /** Preload duration in milliseconds */
  duration: number
  /** Size of preloaded image */
  size?: { width: number; height: number }
}

export interface PreloadStats {
  /** Total images preloaded */
  total: number
  /** Successful preloads */
  successful: number
  /** Failed preloads */
  failed: number
  /** Total preload time */
  totalTime: number
  /** Average preload time */
  averageTime: number
  /** Cache hit rate */
  cacheHitRate: number
}

class ImagePreloader {
  private cache = new Map<string, HTMLImageElement>()
  private loadingPromises = new Map<string, Promise<PreloadResult>>()
  private stats: PreloadStats = {
    total: 0,
    successful: 0,
    failed: 0,
    totalTime: 0,
    averageTime: 0,
    cacheHitRate: 0
  }

  private readonly defaultOptions: Required<PreloadOptions> = {
    priority: 'medium',
    maxConcurrent: 6,
    timeout: 10000,
    respectDataSaver: true,
    respectMemoryConstraints: true
  }

  /**
   * Preload a single image
   */
  async preload(url: string, options: PreloadOptions = {}): Promise<PreloadResult> {
    const mergedOptions = { ...this.defaultOptions, ...options }

    // Check if already cached
    if (this.cache.has(url)) {
      this.updateStats({ success: true, duration: 0, fromCache: true })
      return {
        success: true,
        duration: 0,
        size: {
          width: this.cache.get(url)!.naturalWidth,
          height: this.cache.get(url)!.naturalHeight
        }
      }
    }

    // Check if already loading
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!
    }

    // Check constraints before loading
    if (!this.shouldPreload(mergedOptions)) {
      return {
        success: false,
        error: 'Preloading skipped due to constraints',
        duration: 0
      }
    }

    const loadPromise = this.loadImage(url, mergedOptions)
    this.loadingPromises.set(url, loadPromise)

    try {
      const result = await loadPromise
      if (result.success) {
        // Cache successful loads
        const img = new Image()
        img.src = url
        this.cache.set(url, img)
      }
      return result
    } finally {
      this.loadingPromises.delete(url)
    }
  }

  /**
   * Preload multiple images with priority queue
   */
  async preloadBatch(
    urls: Array<{ url: string; priority?: PreloadOptions['priority'] }>,
    options: PreloadOptions = {}
  ): Promise<PreloadResult[]> {
    const mergedOptions = { ...this.defaultOptions, ...options }

    // Sort by priority
    const sortedUrls = urls.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority || 'medium'] - priorityOrder[a.priority || 'medium']
    })

    // Process in chunks respecting concurrency limits
    const results: PreloadResult[] = []
    for (let i = 0; i < sortedUrls.length; i += mergedOptions.maxConcurrent) {
      const chunk = sortedUrls.slice(i, i + mergedOptions.maxConcurrent)
      const chunkResults = await Promise.all(
        chunk.map(item => this.preload(item.url, { ...mergedOptions, priority: item.priority }))
      )
      results.push(...chunkResults)
    }

    return results
  }

  /**
   * Preload images in viewport and adjacent areas
   */
  async preloadInViewport(
    imageUrls: string[],
    viewportBuffer: number = 1,
    options: PreloadOptions = {}
  ): Promise<void> {
    // This would integrate with IntersectionObserver in a real implementation
    // For now, we'll preload based on priority
    const prioritizedUrls = imageUrls.map((url, index) => ({
      url,
      priority: index < 10 ? 'high' : index < 50 ? 'medium' : 'low' as const
    }))

    await this.preloadBatch(prioritizedUrls, options)
  }

  /**
   * Smart preloading based on user behavior patterns
   */
  async smartPreload(
    images: Array<{ url: string; importance: number; userInteraction?: boolean }>,
    options: PreloadOptions = {}
  ): Promise<PreloadResult[]> {
    // Sort by importance and user interaction signals
    const smartSorted = images
      .sort((a, b) => {
        // User interaction signals get highest priority
        if (a.userInteraction && !b.userInteraction) return -1
        if (!a.userInteraction && b.userInteraction) return 1

        // Then sort by importance score
        return b.importance - a.importance
      })
      .map(item => ({
        url: item.url,
        priority: item.userInteraction ? 'high' :
                 item.importance > 0.7 ? 'high' :
                 item.importance > 0.3 ? 'medium' : 'low' as const
      }))

    return this.preloadBatch(smartSorted, options)
  }

  /**
   * Clear cache and stats
   */
  clear(): void {
    this.cache.clear()
    this.loadingPromises.clear()
    this.stats = {
      total: 0,
      successful: 0,
      failed: 0,
      totalTime: 0,
      averageTime: 0,
      cacheHitRate: 0
    }
  }

  /**
   * Get current preloading statistics
   */
  getStats(): PreloadStats {
    return { ...this.stats }
  }

  /**
   * Get cache size and memory usage estimate
   */
  getCacheInfo(): { size: number; memoryEstimateMB: number } {
    const size = this.cache.size
    // Rough estimate: average image ~100KB
    const memoryEstimateMB = (size * 100) / 1024
    return { size, memoryEstimateMB }
  }

  /**
   * Load a single image with timeout and error handling
   */
  private loadImage(url: string, options: Required<PreloadOptions>): Promise<PreloadResult> {
    return new Promise((resolve) => {
      const startTime = performance.now()
      const img = new Image()

      // Set up timeout
      const timeout = setTimeout(() => {
        this.updateStats({ success: false, duration: performance.now() - startTime })
        resolve({
          success: false,
          error: 'Timeout',
          duration: performance.now() - startTime
        })
      }, options.timeout)

      // Success handler
      img.onload = () => {
        clearTimeout(timeout)
        const duration = performance.now() - startTime
        this.updateStats({ success: true, duration })
        resolve({
          success: true,
          duration,
          size: {
            width: img.naturalWidth,
            height: img.naturalHeight
          }
        })
      }

      // Error handler
      img.onerror = () => {
        clearTimeout(timeout)
        const duration = performance.now() - startTime
        this.updateStats({ success: false, duration })
        resolve({
          success: false,
          error: 'Load error',
          duration
        })
      }

      // Start loading
      img.src = url
    })
  }

  /**
   * Check if preloading should proceed based on constraints
   */
  private shouldPreload(options: Required<PreloadOptions>): boolean {
    // Check data saver mode
    if (options.respectDataSaver && 'connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection && connection.saveData) {
        return false
      }
    }

    // Check memory constraints
    if (options.respectMemoryConstraints) {
      const cacheInfo = this.getCacheInfo()
      // Don't preload if cache is using more than 50MB
      if (cacheInfo.memoryEstimateMB > 50) {
        return false
      }

      // Check device memory if available
      if ('deviceMemory' in navigator) {
        const deviceMemory = (navigator as any).deviceMemory
        // Don't preload on devices with less than 2GB RAM
        if (deviceMemory && deviceMemory < 2) {
          return false
        }
      }
    }

    return true
  }

  /**
   * Update internal statistics
   */
  private updateStats(result: { success: boolean; duration: number; fromCache?: boolean }): void {
    this.stats.total++

    if (result.success) {
      this.stats.successful++
    } else {
      this.stats.failed++
    }

    this.stats.totalTime += result.duration
    this.stats.averageTime = this.stats.totalTime / this.stats.total

    if (result.fromCache) {
      this.stats.cacheHitRate = (this.stats.cacheHitRate * (this.stats.total - 1) + 1) / this.stats.total
    } else {
      this.stats.cacheHitRate = (this.stats.cacheHitRate * (this.stats.total - 1)) / this.stats.total
    }
  }
}

// Global preloader instance
export const imagePreloader = new ImagePreloader()

// React hook for component-level image preloading
export function useImagePreloader(options: PreloadOptions = {}) {
  return {
    preload: (url: string) => imagePreloader.preload(url, options),
    preloadBatch: (urls: Array<{ url: string; priority?: PreloadOptions['priority'] }>) =>
      imagePreloader.preloadBatch(urls, options),
    preloadInViewport: (urls: string[], buffer?: number) =>
      imagePreloader.preloadInViewport(urls, buffer, options),
    smartPreload: (images: Array<{ url: string; importance: number; userInteraction?: boolean }>) =>
      imagePreloader.smartPreload(images, options),
    getStats: () => imagePreloader.getStats(),
    getCacheInfo: () => imagePreloader.getCacheInfo(),
    clear: () => imagePreloader.clear()
  }
}

// Utility for automatic viewport-based preloading
export function createIntersectionPreloader(
  options: PreloadOptions & { rootMargin?: string; threshold?: number } = {}
) {
  const { rootMargin = '100px', threshold = 0.1, ...preloadOptions } = options

  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const imgElement = entry.target as HTMLImageElement
          const src = imgElement.dataset.src || imgElement.src

          if (src) {
            imagePreloader.preload(src, preloadOptions).then((result) => {
              if (result.success) {
                imgElement.src = src
                imgElement.classList.remove('preloading')
                imgElement.classList.add('loaded')
              }
            })
          }
        }
      })
    },
    { rootMargin, threshold }
  )
}