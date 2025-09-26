import { renderHook, act } from '@testing-library/react';
import { useImageDetail, useImageDetailById, useImageFile } from '../../src/hooks/useImageDetail';
import { Image } from '../../src/types/image';

// Mock the image service
vi.mock('../../src/services/imageService', () => ({
  getImage: vi.fn(),
  getImageFile: vi.fn(),
}));

describe('useImageDetail', () => {
  const mockImage: Image = {
    id: 'test-id',
    filename: 'test.jpg',
    path: '/images/test.jpg',
    url: 'https://example.com/test.jpg',
    uploadedBy: 'user-123',
    uploadedAt: new Date(),
    fileSize: 1024,
    mimeType: 'image/jpeg',
    tags: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useImageDetail());

    expect(result.current.state).toEqual({
      isOpen: false,
      selectedImage: null,
      isLoading: false,
      error: null,
    });
  });

  it('should open detail with image object', () => {
    const { result } = renderHook(() => useImageDetail());

    act(() => {
      result.current.openDetail(mockImage);
    });

    expect(result.current.state.isOpen).toBe(true);
    expect(result.current.state.selectedImage).toEqual(mockImage);
    expect(result.current.state.isLoading).toBe(false);
  });

  it('should open detail with image ID and set loading', () => {
    const { result } = renderHook(() => useImageDetail());

    act(() => {
      result.current.openDetail('test-id');
    });

    expect(result.current.state.isOpen).toBe(true);
    expect(result.current.state.selectedImage).toBeNull();
    expect(result.current.state.isLoading).toBe(true);
  });

  it('should close detail and reset state', () => {
    const { result } = renderHook(() => useImageDetail());

    // First open with an image
    act(() => {
      result.current.openDetail(mockImage);
    });

    // Then close
    act(() => {
      result.current.closeDetail();
    });

    expect(result.current.state.isOpen).toBe(false);
    expect(result.current.state.selectedImage).toBeNull();
    expect(result.current.state.isLoading).toBe(false);
    expect(result.current.state.error).toBeNull();
  });

  it('should set image data', () => {
    const { result } = renderHook(() => useImageDetail());

    act(() => {
      result.current.setImage(mockImage);
    });

    expect(result.current.state.selectedImage).toEqual(mockImage);
    expect(result.current.state.isLoading).toBe(false);
    expect(result.current.state.error).toBeNull();
  });

  it('should set loading state', () => {
    const { result } = renderHook(() => useImageDetail());

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.state.isLoading).toBe(true);
  });

  it('should set error state', () => {
    const { result } = renderHook(() => useImageDetail());

    act(() => {
      result.current.setError('Test error');
    });

    expect(result.current.state.error).toBe('Test error');
    expect(result.current.state.isLoading).toBe(false);
  });

  it('should accept initial state', () => {
    const initialState = {
      isOpen: true,
      selectedImage: mockImage,
      isLoading: true,
      error: 'Initial error',
    };

    const { result } = renderHook(() => useImageDetail(initialState));

    expect(result.current.state).toEqual(initialState);
  });
});

describe('useImageDetailById', () => {
  const { getImage } = require('../../src/services/imageService');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch image by ID successfully', async () => {
    const mockImage = {
      id: 'test-id',
      filename: 'test.jpg',
    };
    
    getImage.mockResolvedValue(mockImage);
    
    const { result } = renderHook(() => useImageDetailById());
    
    await act(async () => {
      const image = await result.current.getImageById('test-id');
      expect(image).toEqual(mockImage);
    });
    
    expect(getImage).toHaveBeenCalledWith('test-id');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle error when fetching image', async () => {
    const error = new Error('Image not found');
    getImage.mockRejectedValue(error);
    
    const { result } = renderHook(() => useImageDetailById());
    
    await act(async () => {
      const image = await result.current.getImageById('invalid-id');
      expect(image).toBeNull();
    });
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Image not found');
  });

  it('should set loading state during fetch', async () => {
    // Create a promise that we can resolve manually
    let resolvePromise: any;
    const mockPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    getImage.mockReturnValue(mockPromise);
    
    const { result } = renderHook(() => useImageDetailById());
    
    // Start the fetch
    const fetchPromise = act(() => result.current.getImageById('test-id'));
    
    // Should be loading immediately
    expect(result.current.isLoading).toBe(true);
    
    // Resolve the promise
    await act(async () => {
      resolvePromise({ id: 'test-id' });
      await fetchPromise;
    });
    
    // Should no longer be loading
    expect(result.current.isLoading).toBe(false);
  });
});

describe('useImageFile', () => {
  const { getImageFile } = require('../../src/services/imageService');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch image file URL successfully', async () => {
    const mockUrl = 'blob:test-url';
    getImageFile.mockResolvedValue(mockUrl);
    
    const { result } = renderHook(() => useImageFile());
    
    await act(async () => {
      const url = await result.current.getImageFile('test-id');
      expect(url).toBe(mockUrl);
    });
    
    expect(getImageFile).toHaveBeenCalledWith('test-id');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle error when fetching image file', async () => {
    const error = new Error('File not found');
    getImageFile.mockRejectedValue(error);
    
    const { result } = renderHook(() => useImageFile());
    
    await act(async () => {
      const url = await result.current.getImageFile('invalid-id');
      expect(url).toBeNull();
    });
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('File not found');
  });
});