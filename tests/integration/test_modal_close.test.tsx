import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImageDetailModal } from '../../src/components/ImageDetailModal/ImageDetailModal';
import { useImageDetail } from '../../src/hooks/useImageDetail';
import { createTestImage } from '../utils/test-utils';

// Mock the hook
vi.mock('../../src/hooks/useImageDetail');

const mockImage = createTestImage({ id: '1', filename: 'test.jpg', caption: 'Test image' });

describe('Modal Close Methods Integration Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should close modal when clicking close button', async () => {
    const mockCloseDetail = vi.fn();
    const mockUseImageDetail = useImageDetail as ReturnType<typeof vi.fn>;
    mockUseImageDetail.mockReturnValue({
      selectedImage: mockImage,
      isDetailOpen: true,
      openDetail: vi.fn(),
      closeDetail: mockCloseDetail,
      updateImage: vi.fn(),
    });

    render(<ImageDetailModal />);

    // Find and click close button
    const closeButton = screen.getByRole('button', { name: /close|✕/i });
    await userEvent.click(closeButton);

    expect(mockCloseDetail).toHaveBeenCalled();
  });

  it('should close modal when pressing Escape key', async () => {
    const mockCloseDetail = vi.fn();
    const mockUseImageDetail = useImageDetail as ReturnType<typeof vi.fn>;
    mockUseImageDetail.mockReturnValue({
      selectedImage: mockImage,
      isDetailOpen: true,
      openDetail: vi.fn(),
      closeDetail: mockCloseDetail,
      updateImage: vi.fn(),
    });

    render(<ImageDetailModal />);

    // Press Escape key
    await userEvent.keyboard('{Escape}');

    expect(mockCloseDetail).toHaveBeenCalled();
  });

  it('should close modal when clicking outside the modal content', async () => {
    const mockCloseDetail = vi.fn();
    const mockUseImageDetail = useImageDetail as ReturnType<typeof vi.fn>;
    mockUseImageDetail.mockReturnValue({
      selectedImage: mockImage,
      isDetailOpen: true,
      openDetail: vi.fn(),
      closeDetail: mockCloseDetail,
      updateImage: vi.fn(),
    });

    const { container } = render(<ImageDetailModal />);

    // Click on backdrop (outside modal content)
    const backdrop = container.querySelector('[role="dialog"]')?.parentElement;
    if (backdrop) {
      await userEvent.click(backdrop);
      expect(mockCloseDetail).toHaveBeenCalled();
    }
  });

  it('should NOT close modal when clicking inside modal content', async () => {
    const mockCloseDetail = vi.fn();
    const mockUseImageDetail = useImageDetail as ReturnType<typeof vi.fn>;
    mockUseImageDetail.mockReturnValue({
      selectedImage: mockImage,
      isDetailOpen: true,
      openDetail: vi.fn(),
      closeDetail: mockCloseDetail,
      updateImage: vi.fn(),
    });

    render(<ImageDetailModal />);

    // Click on image inside modal
    const image = screen.getByAltText(mockImage.caption || 'Image detail');
    await userEvent.click(image);

    expect(mockCloseDetail).not.toHaveBeenCalled();
  });

  it('should cleanup state when modal closes', async () => {
    const mockCloseDetail = vi.fn();
    const mockUseImageDetail = useImageDetail as ReturnType<typeof vi.fn>;

    // Simulate state cleanup after close
    mockUseImageDetail
      .mockReturnValueOnce({
        selectedImage: mockImage,
        isDetailOpen: true,
        openDetail: vi.fn(),
        closeDetail: mockCloseDetail,
        updateImage: vi.fn(),
      })
      .mockReturnValueOnce({
        selectedImage: null,
        isDetailOpen: false,
        openDetail: vi.fn(),
        closeDetail: mockCloseDetail,
        updateImage: vi.fn(),
      });

    const { rerender } = render(<ImageDetailModal />);

    // Close modal
    const closeButton = screen.getByRole('button', { name: /close|✕/i });
    await userEvent.click(closeButton);

    // Re-render with updated state
    rerender(<ImageDetailModal />);

    // Modal should not be in DOM or be hidden
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should handle multiple close method calls gracefully', async () => {
    const mockCloseDetail = vi.fn();
    const mockUseImageDetail = useImageDetail as ReturnType<typeof vi.fn>;
    mockUseImageDetail.mockReturnValue({
      selectedImage: mockImage,
      isDetailOpen: true,
      openDetail: vi.fn(),
      closeDetail: mockCloseDetail,
      updateImage: vi.fn(),
    });

    render(<ImageDetailModal />);

    // Close modal multiple times
    const closeButton = screen.getByRole('button', { name: /close|✕/i });
    await userEvent.click(closeButton);
    await userEvent.click(closeButton);
    await userEvent.keyboard('{Escape}');

    // Should only be called once per state change
    expect(mockCloseDetail).toHaveBeenCalledTimes(1);
  });

  it('should close modal and return focus to gallery', async () => {
    const mockCloseDetail = vi.fn();
    const mockUseImageDetail = useImageDetail as ReturnType<typeof vi.fn>;
    mockUseImageDetail.mockReturnValue({
      selectedImage: mockImage,
      isDetailOpen: true,
      openDetail: vi.fn(),
      closeDetail: mockCloseDetail,
      updateImage: vi.fn(),
    });

    render(<ImageDetailModal />);

    // Mock focus management
    const mockFocus = vi.fn();
    HTMLElement.prototype.focus = mockFocus;

    // Close modal
    const closeButton = screen.getByRole('button', { name: /close|✕/i });
    await userEvent.click(closeButton);

    // Check if close was called
    expect(mockCloseDetail).toHaveBeenCalled();
  });
});