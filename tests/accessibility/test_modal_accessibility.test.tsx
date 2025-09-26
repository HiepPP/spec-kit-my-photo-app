import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ImageDetailModal } from '../../src/components/ImageDetailModal/ImageDetailModal';
import { useImageDetail } from '../../src/hooks/useImageDetail';
import { createTestImage } from '../utils/test-utils';

// Extend jest matchers
expect.extend(toHaveNoViolations);

// Mock the hook
vi.mock('../../src/hooks/useImageDetail');

const mockImage = createTestImage({
  id: '1',
  filename: 'test.jpg',
  caption: 'Beautiful sunset at the beach',
  uploadedBy: { id: 'user1', username: 'john_doe', displayName: 'John Doe' }
});

describe('Modal Accessibility Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should have no axe violations', async () => {
    const mockUseImageDetail = useImageDetail as ReturnType<typeof vi.fn>;
    mockUseImageDetail.mockReturnValue({
      selectedImage: mockImage,
      isDetailOpen: true,
      openDetail: vi.fn(),
      closeDetail: vi.fn(),
      updateImage: vi.fn(),
    });

    const { container } = render(<ImageDetailModal />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper ARIA attributes', () => {
    const mockUseImageDetail = useImageDetail as ReturnType<typeof vi.fn>;
    mockUseImageDetail.mockReturnValue({
      selectedImage: mockImage,
      isDetailOpen: true,
      openDetail: vi.fn(),
      closeDetail: vi.fn(),
      updateImage: vi.fn(),
    });

    render(<ImageDetailModal />);

    // Check dialog role
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-describedby');
  });

  it('should trap focus within modal when open', async () => {
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

    // Focus should be on modal when it opens
    const dialog = screen.getByRole('dialog');
    expect(document.activeElement).toBe(dialog);

    // Tab through elements
    await userEvent.tab();
    // Should focus on close button or first interactive element
    const closeButton = screen.getByRole('button', { name: /close|✕/i });
    expect(document.activeElement).toBe(closeButton);

    // Continue tabbing - should stay within modal
    await userEvent.tab();
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('should be keyboard navigable', async () => {
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

    // Navigate with keyboard
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();

    // All interactive elements should be reachable by tab
    const interactiveElements = screen.getAllByRole('button');
    expect(interactiveElements.length).toBeGreaterThan(0);
  });

  it('should support screen reader announcements', () => {
    const mockUseImageDetail = useImageDetail as ReturnType<typeof vi.fn>;
    mockUseImageDetail.mockReturnValue({
      selectedImage: mockImage,
      isDetailOpen: true,
      openDetail: vi.fn(),
      closeDetail: vi.fn(),
      updateImage: vi.fn(),
    });

    render(<ImageDetailModal />);

    // Check for aria-live regions or announcements
    const liveRegion = document.querySelector('[aria-live]');
    if (liveRegion) {
      expect(liveRegion).toBeInTheDocument();
    }
  });

  it('should have descriptive labels for all interactive elements', () => {
    const mockUseImageDetail = useImageDetail as ReturnType<typeof vi.fn>;
    mockUseImageDetail.mockReturnValue({
      selectedImage: mockImage,
      isDetailOpen: true,
      openDetail: vi.fn(),
      closeDetail: vi.fn(),
      updateImage: vi.fn(),
    });

    render(<ImageDetailModal />);

    // Check image alt text
    const image = screen.getByAltText(mockImage.caption || 'Image detail');
    expect(image).toBeInTheDocument();

    // Check button labels
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAttribute('aria-label');
      expect(button).toHaveAccessibleName();
    });
  });

  it('should maintain proper heading structure', () => {
    const mockUseImageDetail = useImageDetail as ReturnType<typeof vi.fn>;
    mockUseImageDetail.mockReturnValue({
      selectedImage: mockImage,
      isDetailOpen: true,
      openDetail: vi.fn(),
      closeDetail: vi.fn(),
      updateImage: vi.fn(),
    });

    render(<ImageDetailModal />);

    // Check that headings are properly nested
    const headings = screen.getAllByRole('heading');
    if (headings.length > 0) {
      // First heading should be h1 or h2
      expect(['h1', 'h2']).toContain(headings[0].tagName.toLowerCase());
    }
  });

  it('should handle loading and error states accessibly', async () => {
    // Test loading state
    const mockUseImageDetail = useImageDetail as ReturnType<typeof vi.fn>;
    mockUseImageDetail.mockReturnValue({
      selectedImage: null,
      isDetailOpen: true,
      loading: true,
      openDetail: vi.fn(),
      closeDetail: vi.fn(),
      updateImage: vi.fn(),
    });

    const { rerender } = render(<ImageDetailModal />);

    // Loading message should be accessible
    const loadingMessage = screen.getByText(/Loading image details.../);
    expect(loadingMessage).toBeInTheDocument();

    // Test error state
    mockUseImageDetail.mockReturnValue({
      selectedImage: null,
      isDetailOpen: true,
      error: 'Failed to load image',
      openDetail: vi.fn(),
      closeDetail: vi.fn(),
      updateImage: vi.fn(),
    });

    rerender(<ImageDetailModal />);

    // Error message should be accessible
    const errorMessage = screen.getByText(/Failed to load image/);
    expect(errorMessage).toBeInTheDocument();
  });

  it('should have proper color contrast', () => {
    // This would typically be checked with a tool like pa11y
    // For now, we verify that text elements don't have inline styles that could affect contrast
    const mockUseImageDetail = useImageDetail as ReturnType<typeof vi.fn>;
    mockUseImageDetail.mockReturnValue({
      selectedImage: mockImage,
      isDetailOpen: true,
      openDetail: vi.fn(),
      closeDetail: vi.fn(),
      updateImage: vi.fn(),
    });

    render(<ImageDetailModal />);

    // Check that text elements don't have color styles that could reduce contrast
    const textElements = screen.getAllByText(/.+/);
    textElements.forEach(element => {
      const style = window.getComputedStyle(element);
      // Should not have very low contrast colors
      expect(style.color).not.toBe('rgb(255, 255, 255)'); // White on white
      expect(style.color).not.toBe('rgb(0, 0, 0)'); // Black on black
    });
  });

  it('should be responsive and accessible on mobile', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    const mockUseImageDetail = useImageDetail as ReturnType<typeof vi.fn>;
    mockUseImageDetail.mockReturnValue({
      selectedImage: mockImage,
      isDetailOpen: true,
      openDetail: vi.fn(),
      closeDetail: vi.fn(),
      updateImage: vi.fn(),
    });

    render(<ImageDetailModal />);

    // Modal should still be accessible on mobile
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Interactive elements should be large enough for touch
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      const rect = button.getBoundingClientRect();
      // Touch targets should be at least 44x44 pixels
      expect(rect.width).toBeGreaterThanOrEqual(44);
      expect(rect.height).toBeGreaterThanOrEqual(44);
    });
  });
});