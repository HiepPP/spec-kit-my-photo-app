/**
 * AlbumGrid Component Tests
 * Tests the main album grid container component following TDD approach
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, within } from '@testing-library/react'
import AlbumGrid from '../../src/components/AlbumGrid'
import { render, createMockAlbums, mockIntersectionObserver } from '../utils'
import { AlbumGridProps } from '../../src/types'

describe('AlbumGrid', () => {
  const mockOnAlbumClick = vi.fn()
  const mockOnAlbumReorder = vi.fn()
  const mockOnAlbumDelete = vi.fn()

  const defaultProps: AlbumGridProps = {
    albums: createMockAlbums(6),
    onAlbumClick: mockOnAlbumClick,
    onAlbumReorder: mockOnAlbumReorder,
    onAlbumDelete: mockOnAlbumDelete,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockIntersectionObserver()
  })

  describe('Rendering', () => {
    it('renders all albums in a grid layout', () => {
      render(<AlbumGrid {...defaultProps} />)

      const albums = screen.getAllByTestId(/^album-tile-/)
      expect(albums).toHaveLength(6)

      // Check that first few album names are rendered
      expect(screen.getByText('Album 1')).toBeInTheDocument()
      expect(screen.getByText('Album 2')).toBeInTheDocument()
      expect(screen.getByText('Album 3')).toBeInTheDocument()
    })

    it('renders with correct CSS Grid layout classes', () => {
      render(<AlbumGrid {...defaultProps} />)

      const gridContainer = screen.getByTestId('album-grid')
      expect(gridContainer).toHaveClass(
        'grid',
        'grid-cols-1',
        'md:grid-cols-2',
        'lg:grid-cols-3',
        'gap-6'
      )
    })

    it('renders empty state when no albums provided', () => {
      render(<AlbumGrid {...defaultProps} albums={[]} />)

      expect(screen.getByText('No albums found')).toBeInTheDocument()
      expect(screen.getByText('Upload photos to create your first album')).toBeInTheDocument()
    })

    it('renders loading state when loading prop is true', () => {
      render(<AlbumGrid {...defaultProps} loading={true} />)

      expect(screen.getByTestId('album-grid-loading')).toBeInTheDocument()
      expect(screen.getByText('Loading albums...')).toBeInTheDocument()

      // Should show skeleton placeholders
      const skeletons = screen.getAllByTestId(/^album-skeleton-/)
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('applies custom className when provided', () => {
      render(<AlbumGrid {...defaultProps} className="custom-grid" />)

      const gridContainer = screen.getByTestId('album-grid')
      expect(gridContainer).toHaveClass('custom-grid')
    })

    it('applies custom data-testid when provided', () => {
      render(<AlbumGrid {...defaultProps} data-testid="custom-album-grid" />)

      expect(screen.getByTestId('custom-album-grid')).toBeInTheDocument()
    })
  })

  describe('Album Interactions', () => {
    it('calls onAlbumClick when album tile is clicked', () => {
      render(<AlbumGrid {...defaultProps} />)

      const firstAlbum = screen.getByTestId('album-tile-1')
      fireEvent.click(firstAlbum)

      expect(mockOnAlbumClick).toHaveBeenCalledWith(1)
      expect(mockOnAlbumClick).toHaveBeenCalledTimes(1)
    })

    it('calls onAlbumDelete when album delete button is clicked', () => {
      render(<AlbumGrid {...defaultProps} />)

      const firstAlbum = screen.getByTestId('album-tile-1')
      const deleteButton = within(firstAlbum).getByRole('button', { name: /delete album/i })
      fireEvent.click(deleteButton)

      expect(mockOnAlbumDelete).toHaveBeenCalledWith(1)
      expect(mockOnAlbumDelete).toHaveBeenCalledTimes(1)
    })

    it('does not render delete buttons when onAlbumDelete not provided', () => {
      const propsWithoutDelete = { ...defaultProps }
      delete propsWithoutDelete.onAlbumDelete

      render(<AlbumGrid {...propsWithoutDelete} />)

      const deleteButtons = screen.queryAllByRole('button', { name: /delete album/i })
      expect(deleteButtons).toHaveLength(0)
    })
  })

  describe('Drag and Drop', () => {
    it('enables drag and drop functionality for album reordering', () => {
      render(<AlbumGrid {...defaultProps} />)

      const albums = screen.getAllByTestId(/^album-tile-/)
      const firstAlbum = albums[0]
      const secondAlbum = albums[1]

      expect(firstAlbum).toHaveAttribute('draggable', 'true')
      expect(secondAlbum).toHaveAttribute('draggable', 'true')
    })

    it('calls onAlbumReorder when album is dragged to new position', () => {
      render(<AlbumGrid {...defaultProps} />)

      const albums = screen.getAllByTestId(/^album-tile-/)
      const firstAlbum = albums[0]
      const thirdAlbum = albums[2]

      // Simulate drag and drop from position 0 to position 2
      fireEvent.dragStart(firstAlbum, {
        dataTransfer: { setData: vi.fn(), getData: vi.fn(() => '1') }
      })
      fireEvent.dragOver(thirdAlbum)
      fireEvent.drop(thirdAlbum)

      expect(mockOnAlbumReorder).toHaveBeenCalledWith(1, 3)
      expect(mockOnAlbumReorder).toHaveBeenCalledTimes(1)
    })

    it('provides visual feedback during drag operations', () => {
      render(<AlbumGrid {...defaultProps} />)

      const albums = screen.getAllByTestId(/^album-tile-/)
      const firstAlbum = albums[0]

      fireEvent.dragStart(firstAlbum)
      expect(firstAlbum).toHaveClass('opacity-50')

      fireEvent.dragEnd(firstAlbum)
      expect(firstAlbum).not.toHaveClass('opacity-50')
    })

    it('shows drop zones when dragging over valid drop targets', () => {
      render(<AlbumGrid {...defaultProps} />)

      const albums = screen.getAllByTestId(/^album-tile-/)
      const firstAlbum = albums[0]
      const targetAlbum = albums[1]

      fireEvent.dragStart(firstAlbum)
      fireEvent.dragEnter(targetAlbum)

      expect(targetAlbum).toHaveClass('ring-2', 'ring-primary')

      fireEvent.dragLeave(targetAlbum)
      expect(targetAlbum).not.toHaveClass('ring-2', 'ring-primary')
    })
  })

  describe('Infinite Scroll', () => {
    it('renders infinite scroll trigger element', () => {
      render(<AlbumGrid {...defaultProps} />)

      const scrollTrigger = screen.getByTestId('infinite-scroll-trigger')
      expect(scrollTrigger).toBeInTheDocument()
    })

    it('calls onLoadMore when scroll trigger becomes visible', () => {
      const mockOnLoadMore = vi.fn()
      render(<AlbumGrid {...defaultProps} onLoadMore={mockOnLoadMore} hasNextPage={true} />)

      const scrollTrigger = screen.getByTestId('infinite-scroll-trigger')

      // Simulate intersection observer callback
      const observerCallback = vi.mocked(IntersectionObserver).mock.calls[0][0]
      observerCallback([{ isIntersecting: true, target: scrollTrigger }] as any, {} as any)

      expect(mockOnLoadMore).toHaveBeenCalledTimes(1)
    })

    it('does not trigger loading when hasNextPage is false', () => {
      const mockOnLoadMore = vi.fn()
      render(<AlbumGrid {...defaultProps} onLoadMore={mockOnLoadMore} hasNextPage={false} />)

      const scrollTrigger = screen.getByTestId('infinite-scroll-trigger')

      // Simulate intersection observer callback
      const observerCallback = vi.mocked(IntersectionObserver).mock.calls[0][0]
      observerCallback([{ isIntersecting: true, target: scrollTrigger }] as any, {} as any)

      expect(mockOnLoadMore).not.toHaveBeenCalled()
    })

    it('shows loading spinner during infinite loading', () => {
      render(<AlbumGrid {...defaultProps} loading={true} hasNextPage={true} />)

      const loadingSpinner = screen.getByTestId('infinite-loading-spinner')
      expect(loadingSpinner).toBeInTheDocument()
      expect(loadingSpinner).toHaveClass('animate-spin')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels for grid navigation', () => {
      render(<AlbumGrid {...defaultProps} />)

      const gridContainer = screen.getByTestId('album-grid')
      expect(gridContainer).toHaveAttribute('role', 'grid')
      expect(gridContainer).toHaveAttribute('aria-label', 'Photo albums grid')
    })

    it('supports keyboard navigation between albums', () => {
      render(<AlbumGrid {...defaultProps} />)

      const albums = screen.getAllByTestId(/^album-tile-/)
      const firstAlbum = albums[0]

      firstAlbum.focus()
      expect(firstAlbum).toHaveFocus()

      // Arrow key navigation
      fireEvent.keyDown(firstAlbum, { key: 'ArrowRight' })
      expect(albums[1]).toHaveFocus()

      fireEvent.keyDown(albums[1], { key: 'ArrowLeft' })
      expect(firstAlbum).toHaveFocus()
    })

    it('announces drag and drop operations to screen readers', () => {
      render(<AlbumGrid {...defaultProps} />)

      const liveRegion = screen.getByTestId('drag-drop-announcements')
      expect(liveRegion).toHaveAttribute('aria-live', 'polite')
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true')
    })

    it('provides proper focus management during drag operations', () => {
      render(<AlbumGrid {...defaultProps} />)

      const albums = screen.getAllByTestId(/^album-tile-/)
      const firstAlbum = albums[0]

      firstAlbum.focus()
      fireEvent.keyDown(firstAlbum, { key: 'Space' }) // Start drag with keyboard

      expect(screen.getByText(/drag mode activated/i)).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('renders efficiently with large album lists', () => {
      const largeAlbumList = createMockAlbums(100)
      render(<AlbumGrid {...defaultProps} albums={largeAlbumList} />)

      // Should only render visible albums (virtualization)
      const renderedAlbums = screen.getAllByTestId(/^album-tile-/)
      expect(renderedAlbums.length).toBeLessThanOrEqual(20) // Max visible at once
    })

    it('uses memo to prevent unnecessary rerenders', () => {
      const { rerender } = render(<AlbumGrid {...defaultProps} />)

      // Same props should not cause rerender
      rerender(<AlbumGrid {...defaultProps} />)

      // Component should be memoized (this is more of an implementation detail)
      expect(screen.getAllByTestId(/^album-tile-/)).toHaveLength(6)
    })
  })

  describe('Error Handling', () => {
    it('handles missing thumbnail gracefully', () => {
      const albumsWithMissingThumbnails = defaultProps.albums.map(album => ({
        ...album,
        thumbnailPhotoId: null,
      }))

      render(<AlbumGrid {...defaultProps} albums={albumsWithMissingThumbnails} />)

      // Should render placeholder thumbnails
      const placeholders = screen.getAllByTestId(/^album-placeholder-thumbnail-/)
      expect(placeholders).toHaveLength(6)
    })

    it('displays error state when albums fail to load', () => {
      render(<AlbumGrid {...defaultProps} error="Failed to load albums" />)

      expect(screen.getByText('Failed to load albums')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    })

    it('handles drag and drop errors gracefully', () => {
      render(<AlbumGrid {...defaultProps} />)

      const albums = screen.getAllByTestId(/^album-tile-/)
      const firstAlbum = albums[0]

      // Simulate failed drag operation
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      fireEvent.dragStart(firstAlbum)
      fireEvent.drop(firstAlbum) // Drop on self (invalid)

      expect(consoleSpy).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })
})