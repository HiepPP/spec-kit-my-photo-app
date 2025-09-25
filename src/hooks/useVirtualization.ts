/**
 * useVirtualization Hook
 * Determines when to use virtualization based on performance criteria
 */

import { useState, useEffect, useMemo } from 'react'

export interface VirtualizationConfig {
  /** Minimum items before virtualization is considered */
  itemThreshold: number
  /** Container height threshold for virtualization */
  heightThreshold: number
  /** Enable/disable virtualization globally */
  forceVirtualization?: boolean
  /** Disable virtualization globally */
  disableVirtualization?: boolean
}

export interface VirtualizationResult {
  /** Whether virtualization should be used */
  shouldVirtualize: boolean
  /** Recommended container height for virtualization */
  containerHeight: number
  /** Recommended item dimensions */
  itemDimensions: {
    width: number
    height: number
  }
  /** Performance metrics */
  metrics: {
    itemCount: number
    estimatedUnvirtualizedHeight: number
    memoryImpact: 'low' | 'medium' | 'high'
  }
}

const DEFAULT_CONFIG: VirtualizationConfig = {
  itemThreshold: 50, // Start virtualizing after 50 items
  heightThreshold: 2000, // Virtualize if total height would exceed 2000px
  forceVirtualization: false,
  disableVirtualization: false
}

export function useVirtualization(
  itemCount: number,
  itemHeight: number = 280,
  itemWidth: number = 320,
  config: Partial<VirtualizationConfig> = {}
): VirtualizationResult {
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 600 })

  const mergedConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config])

  // Calculate container dimensions
  useEffect(() => {
    const calculateDimensions = () => {
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // Estimate container width (accounting for padding/margins)
      const containerWidth = Math.min(viewportWidth - 64, 1200) // Max width of 1200px with 32px margins

      // Calculate appropriate container height (max 70% of viewport)
      const maxHeight = Math.floor(viewportHeight * 0.7)
      const recommendedHeight = Math.min(600, maxHeight)

      setContainerDimensions({
        width: containerWidth,
        height: recommendedHeight
      })
    }

    calculateDimensions()
    window.addEventListener('resize', calculateDimensions)

    return () => window.removeEventListener('resize', calculateDimensions)
  }, [])

  // Calculate virtualization decision
  const result = useMemo((): VirtualizationResult => {
    const { itemThreshold, heightThreshold, forceVirtualization, disableVirtualization } = mergedConfig

    // Force override
    if (disableVirtualization) {
      return {
        shouldVirtualize: false,
        containerHeight: containerDimensions.height,
        itemDimensions: { width: itemWidth, height: itemHeight },
        metrics: {
          itemCount,
          estimatedUnvirtualizedHeight: 0,
          memoryImpact: 'low'
        }
      }
    }

    if (forceVirtualization) {
      return {
        shouldVirtualize: true,
        containerHeight: containerDimensions.height,
        itemDimensions: { width: itemWidth, height: itemHeight },
        metrics: {
          itemCount,
          estimatedUnvirtualizedHeight: itemCount * itemHeight,
          memoryImpact: itemCount > 1000 ? 'high' : itemCount > 200 ? 'medium' : 'low'
        }
      }
    }

    // Calculate grid dimensions
    const columnsPerRow = Math.max(1, Math.floor(containerDimensions.width / itemWidth))
    const totalRows = Math.ceil(itemCount / columnsPerRow)
    const estimatedHeight = totalRows * itemHeight

    // Decision criteria
    const exceedsItemThreshold = itemCount >= itemThreshold
    const exceedsHeightThreshold = estimatedHeight >= heightThreshold

    // Memory impact assessment
    let memoryImpact: 'low' | 'medium' | 'high' = 'low'
    if (itemCount > 1000) {
      memoryImpact = 'high'
    } else if (itemCount > 200) {
      memoryImpact = 'medium'
    }

    const shouldVirtualize = exceedsItemThreshold || exceedsHeightThreshold || memoryImpact === 'high'

    return {
      shouldVirtualize,
      containerHeight: containerDimensions.height,
      itemDimensions: { width: itemWidth, height: itemHeight },
      metrics: {
        itemCount,
        estimatedUnvirtualizedHeight: estimatedHeight,
        memoryImpact
      }
    }
  }, [
    itemCount,
    itemHeight,
    itemWidth,
    containerDimensions,
    mergedConfig
  ])

  return result
}

// Hook for automatic virtualization decision with performance logging
export function useSmartVirtualization(
  itemCount: number,
  itemHeight: number = 280,
  itemWidth: number = 320,
  config: Partial<VirtualizationConfig> = {}
) {
  const virtualization = useVirtualization(itemCount, itemHeight, itemWidth, config)

  // Log performance decision in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.group('🎯 Smart Virtualization Decision')
      console.log('Item Count:', itemCount)
      console.log('Should Virtualize:', virtualization.shouldVirtualize)
      console.log('Memory Impact:', virtualization.metrics.memoryImpact)
      console.log('Estimated Height:', virtualization.metrics.estimatedUnvirtualizedHeight, 'px')
      console.log('Reason:',
        virtualization.shouldVirtualize
          ? itemCount >= (config.itemThreshold || 50)
            ? 'Item count threshold exceeded'
            : 'Height threshold exceeded'
          : 'No virtualization needed'
      )
      console.groupEnd()
    }
  }, [virtualization, itemCount, config.itemThreshold])

  return virtualization
}