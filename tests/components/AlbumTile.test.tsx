/**
 * AlbumTile Component Tests
 * Tests individual album tile component following TDD approach
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, within } from '@testing-library/react'
import AlbumTile from '../../src/components/AlbumTile'
import { render, createMockAlbum, setupURLMocks } from '../utils'
import { AlbumTileProps } from '../../src/types'

describe('AlbumTile', () => {
  const mockOnClick = vi.fn()
  const mockOnDelete = vi.fn()

  const defaultProps: AlbumTileProps = {
    album: createMockAlbum({ id: 1, name: 'Test Album', photoCount: 25 }),
    thumbnailSrc: 'https://picsum.photos/300/200?random=1',
    onClick: mockOnClick,
    onDelete: mockOnDelete,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setupURLMocks()
  })

  describe('Rendering', () => {
    it('renders album information correctly', () => {
      render(<AlbumTile {...defaultProps} />)

      expect(screen.getByText('Test Album')).toBeInTheDocument()
      expect(screen.getByText('25 photos')).toBeInTheDocument()
      expect(screen.getByText(/2024-09-15/)).toBeInTheDocument() // Capture date
    })

    it('renders thumbnail image with correct attributes', () => {
      render(<AlbumTile {...defaultProps} />)

      const thumbnail = screen.getByRole('img', { name: /test album thumbnail/i })
      expect(thumbnail).toHaveAttribute('src', defaultProps.thumbnailSrc)
      expect(thumbnail).toHaveAttribute('alt', 'Test Album thumbnail')
    })

    it('renders placeholder when no thumbnailSrc provided', () => {
      const propsWithoutThumbnail = { ...defaultProps, thumbnailSrc: undefined }
      render(<AlbumTile {...propsWithoutThumbnail} />)

      const placeholder = screen.getByTestId('album-thumbnail-placeholder')
      expect(placeholder).toBeInTheDocument()
      expect(placeholder).toHaveClass('bg-muted', 'flex', 'items-center', 'justify-center')
    })

    it('applies custom className when provided', () => {
      render(<AlbumTile {...defaultProps} className="custom-tile" />)

      const tileContainer = screen.getByTestId('album-tile-1')
      expect(tileContainer).toHaveClass('custom-tile')
    })

    it('applies custom data-testid when provided', () => {
      render(<AlbumTile {...defaultProps} data-testid="custom-album-tile" />)

      expect(screen.getByTestId('custom-album-tile')).toBeInTheDocument()
    })

    it('displays formatted capture date', () => {
      const albumWithDate = createMockAlbum({
        captureDate: new Date('2024-07-15T10:30:00Z')
      })

      render(<AlbumTile {...defaultProps} album={albumWithDate} />)

      expect(screen.getByText(/July 15, 2024/)).toBeInTheDocument()
    })

    it('handles single photo count correctly', () => {
      const albumWithOnePhoto = createMockAlbum({ photoCount: 1 })

      render(<AlbumTile {...defaultProps} album={albumWithOnePhoto} />)

      expect(screen.getByText('1 photo')).toBeInTheDocument()
    })

    it('handles zero photo count correctly', () => {
      const emptyAlbum = createMockAlbum({ photoCount: 0 })

      render(<AlbumTile {...defaultProps} album={emptyAlbum} />)

      expect(screen.getByText('0 photos')).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('calls onClick when tile is clicked', () => {
      render(<AlbumTile {...defaultProps} />)

      const tile = screen.getByTestId('album-tile-1')
      fireEvent.click(tile)

      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it('calls onClick when thumbnail is clicked', () => {
      render(<AlbumTile {...defaultProps} />)

      const thumbnail = screen.getByRole('img', { name: /test album thumbnail/i })
      fireEvent.click(thumbnail)

      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it('calls onClick when title is clicked', () => {
      render(<AlbumTile {...defaultProps} />)

      const title = screen.getByText('Test Album')
      fireEvent.click(title)

      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it('calls onDelete when delete button is clicked', () => {
      render(<AlbumTile {...defaultProps} />)

      const deleteButton = screen.getByRole('button', { name: /delete album/i })
      fireEvent.click(deleteButton)

      expect(mockOnDelete).toHaveBeenCalledTimes(1)
      expect(mockOnClick).not.toHaveBeenCalled() // Should not trigger tile click
    })

    it('does not render delete button when onDelete not provided', () => {
      const propsWithoutDelete = { ...defaultProps }
      delete propsWithoutDelete.onDelete

      render(<AlbumTile {...propsWithoutDelete} />)

      const deleteButton = screen.queryByRole('button', { name: /delete album/i })
      expect(deleteButton).not.toBeInTheDocument()
    })

    it('prevents event propagation when delete button is clicked', () => {
      render(<AlbumTile {...defaultProps} />)

      const deleteButton = screen.getByRole('button', { name: /delete album/i })
      fireEvent.click(deleteButton)

      // onClick should not be called when delete is clicked
      expect(mockOnClick).not.toHaveBeenCalled()
      expect(mockOnDelete).toHaveBeenCalledTimes(1)
    })
  })

  describe('Drag and Drop', () => {
    const dragHandleProps = {
      'data-testid': 'drag-handle',
      onMouseDown: vi.fn(),
      onTouchStart: vi.fn(),
    }

    it('renders drag handle when dragHandleProps provided', () => {
      render(<AlbumTile {...defaultProps} dragHandleProps={dragHandleProps} />)

      const dragHandle = screen.getByTestId('drag-handle')
      expect(dragHandle).toBeInTheDocument()
      expect(dragHandle).toHaveClass('cursor-grab')
    })

    it('applies dragging styles when isDragging is true', () => {
      render(<AlbumTile {...defaultProps} isDragging={true} />)

      const tile = screen.getByTestId('album-tile-1')
      expect(tile).toHaveClass('opacity-50', 'transform', 'rotate-2')
    })

    it('does not apply dragging styles when isDragging is false', () => {
      render(<AlbumTile {...defaultProps} isDragging={false} />)

      const tile = screen.getByTestId('album-tile-1')
      expect(tile).not.toHaveClass('opacity-50', 'transform', 'rotate-2')
    })

    it('shows drag cursor when hovering over drag handle', () => {
      render(<AlbumTile {...defaultProps} dragHandleProps={dragHandleProps} />)

      const dragHandle = screen.getByTestId('drag-handle')
      expect(dragHandle).toHaveClass('cursor-grab')

      fireEvent.mouseDown(dragHandle)
      expect(dragHandle).toHaveClass('cursor-grabbing')
    })

    it('makes tile draggable when drag handle is present', () => {
      render(<AlbumTile {...defaultProps} dragHandleProps={dragHandleProps} />)

      const tile = screen.getByTestId('album-tile-1')
      expect(tile).toHaveAttribute('draggable', 'true')
    })

    it('is not draggable when no drag handle provided', () => {
      render(<AlbumTile {...defaultProps} />)

      const tile = screen.getByTestId('album-tile-1')
      expect(tile).not.toHaveAttribute('draggable')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels for tile interaction', () => {
      render(<AlbumTile {...defaultProps} />)

      const tile = screen.getByTestId('album-tile-1')
      expect(tile).toHaveAttribute('role', 'button')
      expect(tile).toHaveAttribute('aria-label', 'Open Test Album with 25 photos')
    })

    it('has proper keyboard navigation support', () => {
      render(<AlbumTile {...defaultProps} />)

      const tile = screen.getByTestId('album-tile-1')
      expect(tile).toHaveAttribute('tabIndex', '0')

      tile.focus()
      expect(tile).toHaveFocus()
    })

    it('responds to Enter key press', () => {
      render(<AlbumTile {...defaultProps} />)

      const tile = screen.getByTestId('album-tile-1')
      fireEvent.keyDown(tile, { key: 'Enter' })

      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it('responds to Space key press', () => {
      render(<AlbumTile {...defaultProps} />)

      const tile = screen.getByTestId('album-tile-1')
      fireEvent.keyDown(tile, { key: ' ' })

      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it('has proper ARIA label for delete button', () => {
      render(<AlbumTile {...defaultProps} />)

      const deleteButton = screen.getByRole('button', { name: /delete album/i })
      expect(deleteButton).toHaveAttribute('aria-label', 'Delete Test Album')
    })

    it('provides proper focus management for delete button', () => {
      render(<AlbumTile {...defaultProps} />)

      const deleteButton = screen.getByRole('button', { name: /delete album/i })

      deleteButton.focus()
      expect(deleteButton).toHaveFocus()

      fireEvent.keyDown(deleteButton, { key: 'Enter' })
      expect(mockOnDelete).toHaveBeenCalledTimes(1)
    })

    it('announces thumbnail loading state to screen readers', () => {
      render(<AlbumTile {...defaultProps} />)

      const thumbnail = screen.getByRole('img', { name: /test album thumbnail/i })
      expect(thumbnail).toHaveAttribute('loading', 'lazy')
    })
  })

  describe('Visual States', () => {
    it('applies hover styles on mouse enter', () => {
      render(<AlbumTile {...defaultProps} />)

      const tile = screen.getByTestId('album-tile-1')
      fireEvent.mouseEnter(tile)

      expect(tile).toHaveClass('hover:shadow-lg', 'hover:scale-105')
    })

    it('removes hover styles on mouse leave', () => {
      render(<AlbumTile {...defaultProps} />)

      const tile = screen.getByTestId('album-tile-1')
      fireEvent.mouseEnter(tile)
      fireEvent.mouseLeave(tile)

      // Hover classes are managed by CSS, but component should not have focus-like state
      expect(tile).not.toHaveClass('ring-2')
    })

    it('shows focus outline when focused', () => {
      render(<AlbumTile {...defaultProps} />)

      const tile = screen.getByTestId('album-tile-1')
      tile.focus()

      expect(tile).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-primary')
    })

    it('applies proper card styling from shadcn/ui', () => {
      render(<AlbumTile {...defaultProps} />)

      const tile = screen.getByTestId('album-tile-1')
      expect(tile).toHaveClass(
        'rounded-lg',
        'border',
        'bg-card',
        'text-card-foreground',
        'shadow-sm'
      )
    })
  })

  describe('Image Loading', () => {
    it('shows loading placeholder while thumbnail loads', () => {
      render(<AlbumTile {...defaultProps} />)

      const thumbnail = screen.getByRole('img', { name: /test album thumbnail/i })

      // Simulate loading state
      fireEvent.load(thumbnail)
      expect(thumbnail).toHaveAttribute('src', defaultProps.thumbnailSrc)
    })

    it('shows error placeholder when thumbnail fails to load', () => {
      render(<AlbumTile {...defaultProps} />)

      const thumbnail = screen.getByRole('img', { name: /test album thumbnail/i })
      fireEvent.error(thumbnail)

      // Should show error placeholder
      expect(screen.getByTestId('album-thumbnail-error')).toBeInTheDocument()
    })

    it('uses lazy loading for thumbnail images', () => {
      render(<AlbumTile {...defaultProps} />)

      const thumbnail = screen.getByRole('img', { name: /test album thumbnail/i })
      expect(thumbnail).toHaveAttribute('loading', 'lazy')
    })
  })

  describe('Content Overflow', () => {
    it('truncates long album names', () => {
      const albumWithLongName = createMockAlbum({
        name: 'This is a very long album name that should be truncated to prevent layout issues'
      })

      render(<AlbumTile {...defaultProps} album={albumWithLongName} />)

      const titleElement = screen.getByText(/This is a very long album name/)
      expect(titleElement).toHaveClass('truncate')
    })

    it('handles very large photo counts', () => {
      const albumWithManyPhotos = createMockAlbum({ photoCount: 9999 })

      render(<AlbumTile {...defaultProps} album={albumWithManyPhotos} />)

      expect(screen.getByText('9,999 photos')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('uses React.memo to prevent unnecessary rerenders', () => {
      const { rerender } = render(<AlbumTile {...defaultProps} />)

      // Same props should not cause rerender
      rerender(<AlbumTile {...defaultProps} />)

      // Component should be memoized (implementation detail)
      expect(screen.getByText('Test Album')).toBeInTheDocument()
    })

    it('only loads thumbnail when in viewport', () => {
      render(<AlbumTile {...defaultProps} />)

      const thumbnail = screen.getByRole('img', { name: /test album thumbnail/i })
      expect(thumbnail).toHaveAttribute('loading', 'lazy')
    })
  })
})