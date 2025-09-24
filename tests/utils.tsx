/**
 * Test utilities and custom render functions
 * Provides enhanced testing helpers for React Testing Library
 */

import React, { ReactElement } from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { vi } from 'vitest'
import { Album, Photo, UploadSession } from '../src/types'

// ============================================================================
// Test Providers and Wrappers
// ============================================================================

interface TestProvidersProps {
  children: React.ReactNode
}

/**
 * Wrapper component that provides all necessary context providers for testing
 */
const TestProviders: React.FC<TestProvidersProps> = ({ children }) => {
  return (
    <div data-testid="test-wrapper">
      {children}
    </div>
  )
}

// ============================================================================
// Custom Render Function
// ============================================================================

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  wrapper?: React.ComponentType<any>
}

/**
 * Custom render function that includes all providers
 * Use this instead of RTL's render for consistent test setup
 */
export const renderWithProviders = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult => {
  const { wrapper: CustomWrapper = TestProviders, ...renderOptions } = options

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <CustomWrapper>{children}</CustomWrapper>
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { renderWithProviders as render }

// ============================================================================
// Mock Data Factories
// ============================================================================

/**
 * Create a mock Album with customizable properties
 */
export const createMockAlbum = (overrides: Partial<Album> = {}): Album => ({
  id: 1,
  name: 'Test Album',
  captureDate: new Date('2024-09-15'),
  displayOrder: 1,
  thumbnailPhotoId: 1,
  photoCount: 10,
  createdAt: new Date('2024-09-15T10:00:00Z'),
  updatedAt: new Date('2024-09-15T10:00:00Z'),
  ...overrides,
})

/**
 * Create multiple mock Albums
 */
export const createMockAlbums = (count: number): Album[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockAlbum({
      id: index + 1,
      name: `Album ${index + 1}`,
      displayOrder: index + 1,
      thumbnailPhotoId: (index * 10) + 1,
    })
  )
}

/**
 * Create a mock Photo with customizable properties
 */
export const createMockPhoto = (overrides: Partial<Photo> = {}): Photo => {
  const mockBlob = new Blob(['test'], { type: 'image/jpeg' })

  return {
    id: 1,
    filename: 'test-photo.jpg',
    albumId: 1,
    fileData: mockBlob,
    thumbnailData: mockBlob,
    captureDate: new Date('2024-09-15'),
    fileSize: 1024000,
    width: 1920,
    height: 1080,
    uploadTimestamp: new Date('2024-09-15T10:00:00Z'),
    ...overrides,
  }
}

/**
 * Create multiple mock Photos
 */
export const createMockPhotos = (count: number, albumId: number = 1): Photo[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockPhoto({
      id: index + 1,
      filename: `photo-${index + 1}.jpg`,
      albumId,
    })
  )
}

/**
 * Create a mock UploadSession
 */
export const createMockUploadSession = (
  overrides: Partial<UploadSession> = {}
): UploadSession => ({
  id: 'session-123',
  status: 'processing',
  totalFiles: 10,
  processedFiles: 5,
  errorCount: 0,
  startedAt: new Date('2024-09-15T10:00:00Z'),
  completedAt: null,
  ...overrides,
})

// ============================================================================
// Mock URL Object URLs (for Blob handling)
// ============================================================================

/**
 * Mock URL.createObjectURL for testing file handling
 */
export const mockCreateObjectURL = (): string => {
  return 'blob:mock-url-12345'
}

/**
 * Setup URL mocks for tests involving file handling
 */
export const setupURLMocks = () => {
  Object.defineProperty(global, 'URL', {
    value: {
      createObjectURL: vi.fn().mockImplementation(mockCreateObjectURL),
      revokeObjectURL: vi.fn(),
    },
    writable: true,
  })
}

// ============================================================================
// DOM Mocks and Utilities
// ============================================================================

/**
 * Mock IntersectionObserver for infinite scroll tests
 */
export const mockIntersectionObserver = () => {
  const observe = vi.fn()
  const disconnect = vi.fn()
  const unobserve = vi.fn()

  // Mock constructor
  const IntersectionObserverMock = vi.fn().mockImplementation((callback) => ({
    observe,
    disconnect,
    unobserve,
    callback,
  }))

  Object.defineProperty(global, 'IntersectionObserver', {
    value: IntersectionObserverMock,
    writable: true,
  })

  return { observe, disconnect, unobserve, IntersectionObserverMock }
}

/**
 * Mock ResizeObserver for responsive components
 */
export const mockResizeObserver = () => {
  const observe = vi.fn()
  const disconnect = vi.fn()
  const unobserve = vi.fn()

  const ResizeObserverMock = vi.fn().mockImplementation(() => ({
    observe,
    disconnect,
    unobserve,
  }))

  Object.defineProperty(global, 'ResizeObserver', {
    value: ResizeObserverMock,
    writable: true,
  })

  return { observe, disconnect, unobserve, ResizeObserverMock }
}

/**
 * Mock getBoundingClientRect for layout tests
 */
export const mockGetBoundingClientRect = (overrides: Partial<DOMRect> = {}) => {
  const mockRect: DOMRect = {
    bottom: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
    width: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
    ...overrides,
  }

  Element.prototype.getBoundingClientRect = vi.fn(() => mockRect)

  return mockRect
}

// ============================================================================
// Drag and Drop Test Utilities
// ============================================================================

/**
 * Create a mock DragEvent for testing drag and drop
 */
export const createMockDragEvent = (
  type: string,
  dataTransfer?: Partial<DataTransfer>
): DragEvent => {
  const event = new Event(type) as DragEvent

  Object.defineProperty(event, 'dataTransfer', {
    value: {
      dropEffect: 'none',
      effectAllowed: 'all',
      files: [],
      items: [],
      types: [],
      clearData: vi.fn(),
      getData: vi.fn(),
      setData: vi.fn(),
      setDragImage: vi.fn(),
      ...dataTransfer,
    },
    writable: true,
  })

  return event
}

/**
 * Simulate drag and drop interaction
 */
export const simulateDragAndDrop = (
  source: HTMLElement,
  target: HTMLElement,
  dataTransfer: Partial<DataTransfer> = {}
) => {
  const dragStartEvent = createMockDragEvent('dragstart', dataTransfer)
  const dropEvent = createMockDragEvent('drop', dataTransfer)

  source.dispatchEvent(dragStartEvent)
  target.dispatchEvent(dropEvent)

  return { dragStartEvent, dropEvent }
}

// ============================================================================
// File Upload Test Utilities
// ============================================================================

/**
 * Create a mock File for testing file uploads
 */
export const createMockFile = (
  name: string = 'test.jpg',
  type: string = 'image/jpeg',
  size: number = 1024000
): File => {
  const file = new File(['test content'], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

/**
 * Create FileList for testing multiple file uploads
 */
export const createMockFileList = (files: File[]): FileList => {
  const fileList = files as any
  fileList.item = (index: number) => fileList[index] || null
  Object.defineProperty(fileList, 'length', { value: files.length })
  return fileList as FileList
}

// ============================================================================
// Async Testing Utilities
// ============================================================================

/**
 * Wait for next tick (useful for async state updates)
 */
export const waitForNextTick = () =>
  new Promise((resolve) => setTimeout(resolve, 0))

/**
 * Wait for multiple ticks (useful for animation frames)
 */
export const waitForTicks = (count: number = 1) =>
  new Promise((resolve) => {
    let remaining = count
    const tick = () => {
      remaining--
      if (remaining <= 0) {
        resolve(undefined)
      } else {
        setTimeout(tick, 0)
      }
    }
    setTimeout(tick, 0)
  })

// ============================================================================
// Accessibility Testing Helpers
// ============================================================================

/**
 * Check if element has proper ARIA attributes
 */
export const hasAriaLabel = (element: HTMLElement): boolean => {
  return !!(
    element.getAttribute('aria-label') ||
    element.getAttribute('aria-labelledby')
  )
}

/**
 * Check if element is keyboard accessible
 */
export const isKeyboardAccessible = (element: HTMLElement): boolean => {
  const tabIndex = element.getAttribute('tabindex')
  return (
    element.tagName === 'BUTTON' ||
    element.tagName === 'A' ||
    element.tagName === 'INPUT' ||
    (tabIndex !== null && parseInt(tabIndex) >= 0)
  )
}

// ============================================================================
// Performance Testing Utilities
// ============================================================================

/**
 * Measure performance of a function
 */
export const measurePerformance = async <T>(
  fn: () => T | Promise<T>
): Promise<{ result: T; duration: number }> => {
  const start = performance.now()
  const result = await fn()
  const end = performance.now()
  const duration = end - start

  return { result, duration }
}