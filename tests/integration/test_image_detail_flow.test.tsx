import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImageGallery } from '../../src/components/ImageGallery/ImageGallery';
import { ImageDetailModal } from '../../src/components/ImageDetailModal/ImageDetailModal';
import { useImageDetail } from '../../src/hooks/useImageDetail';
import { createTestImage } from '../utils/test-utils';

// Mock the hooks
vi.mock('../../src/hooks/useImageDetail');
vi.mock('../../src/hooks/useGallery');

const mockImages = [
  createTestImage({ id: '1', filename: 'image1.jpg', caption: 'First image' }),
  createTestImage({ id: '2', filename: 'image2.jpg', caption: 'Second image' }),
  createTestImage({ id: '3', filename: 'image3.jpg', caption: 'Third image' }),
];

describe('Image Detail Flow Integration Test', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock gallery hook
    const mockUseGallery = vi.fn().mockReturnValue({
      images: mockImages,
      loading: false,
      error: null,
    });
    require('../../src/hooks/useGallery').useGallery = mockUseGallery;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should open detail modal when clicking on an image', async () => {
    const mockOpenDetail = vi.fn();
    const mockUseImageDetail = useImageDetail as ReturnType<typeof vi.fn>;
    mockUseImageDetail.mockReturnValue({
      selectedImage: null,
      isDetailOpen: false,
      openDetail: mockOpenDetail,
      closeDetail: vi.fn(),
      updateImage: vi.fn(),
    });

    render(<ImageGallery />);

    // Click on first image
    const firstImage = screen.getByAltText(mockImages[0].caption || 'Image');
    await userEvent.click(firstImage);

    expect(mockOpenDetail).toHaveBeenCalledWith(mockImages[0].id);
  });

  it('should display correct image details in modal', async () => {
    const mockCloseDetail = vi.fn();
    const selectedImage = mockImages[0];

    const mockUseImageDetail = useImageDetail as ReturnType<typeof vi.fn>;
    mockUseImageDetail.mockReturnValue({
      selectedImage,
      isDetailOpen: true,
      openDetail: vi.fn(),
      closeDetail: mockCloseDetail,
      updateImage: vi.fn(),
    });

    render(<ImageDetailModal />);

    // Verify image is displayed
    const image = screen.getByAltText(selectedImage.caption || 'Image detail');
    expect(image).toBeInTheDocument();

    // Verify metadata is displayed
    expect(screen.getByText(selectedImage.filename)).toBeInTheDocument();
    expect(screen.getByText(/Uploaded by:/)).toBeInTheDocument();
    expect(screen.getByText(/Uploaded at:/)).toBeInTheDocument();
  });

  it('should fetch full image data when opening detail view', async () => {
    const mockOpenDetail = vi.fn();
    const mockFetchImageDetails = vi.fn().mockResolvedValue(mockImages[0]);

    const mockUseImageDetail = useImageDetail as ReturnType<typeof vi.fn>;
    mockUseImageDetail.mockReturnValue({
      selectedImage: null,
      isDetailOpen: false,
      openDetail: mockOpenDetail,
      closeDetail: vi.fn(),
      updateImage: vi.fn(),
      fetchImageDetails: mockFetchImageDetails,
    });

    render(<ImageGallery />);

    // Click on image
    const firstImage = screen.getByAltText(mockImages[0].caption || 'Image');
    await userEvent.click(firstImage);

    // Verify fetch was called
    await waitFor(() => {
      expect(mockFetchImageDetails).toHaveBeenCalledWith(mockImages[0].id);
    });
  });

  it('should show loading state while fetching image details', async () => {
    const mockUseImageDetail = useImageDetail as ReturnType<typeof vi.fn>;
    mockUseImageDetail.mockReturnValue({
      selectedImage: null,
      isDetailOpen: true,
      loading: true,
      openDetail: vi.fn(),
      closeDetail: vi.fn(),
      updateImage: vi.fn(),
    });

    render(<ImageDetailModal />);

    expect(screen.getByText(/Loading image details.../)).toBeInTheDocument();
  });

  it('should show error state when image fetch fails', async () => {
    const mockUseImageDetail = useImageDetail as ReturnType<typeof vi.fn>;
    mockUseImageDetail.mockReturnValue({
      selectedImage: null,
      isDetailOpen: true,
      error: 'Failed to load image',
      openDetail: vi.fn(),
      closeDetail: vi.fn(),
      updateImage: vi.fn(),
    });

    render(<ImageDetailModal />);

    expect(screen.getByText(/Failed to load image/)).toBeInTheDocument();
  });

  it('should maintain gallery state when modal opens', async () => {
    const mockOpenDetail = vi.fn();
    const mockUseGallery = require('../../src/hooks/useGallery').useGallery;
    mockUseGallery.mockReturnValue({
      images: mockImages,
      loading: false,
      error: null,
    });

    const mockUseImageDetail = useImageDetail as ReturnType<typeof vi.fn>;
    mockUseImageDetail.mockReturnValue({
      selectedImage: null,
      isDetailOpen: false,
      openDetail: mockOpenDetail,
      closeDetail: vi.fn(),
      updateImage: vi.fn(),
    });

    const { container } = render(<ImageGallery />);

    // Gallery should show all images
    const images = container.querySelectorAll('img');
    expect(images).toHaveLength(mockImages.length);

    // Click on first image
    const firstImage = screen.getByAltText(mockImages[0].caption || 'Image');
    await userEvent.click(firstImage);

    // Gallery should still be visible in background
    expect(container.querySelector('.gallery-container')).toBeInTheDocument();
  });
});