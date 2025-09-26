import { useState, useCallback } from 'react';
import { Image } from '../types/image';
import { ImageDetailState } from '../types/state';

interface UseImageDetailReturn {
  state: ImageDetailState;
  openDetail: (image: Image | string) => void;
  closeDetail: () => void;
  setImage: (image: Image) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export function useImageDetail(initialState?: Partial<ImageDetailState>): UseImageDetailReturn {
  const [state, setState] = useState<ImageDetailState>({
    isOpen: false,
    selectedImage: null,
    isLoading: false,
    error: null,
    ...initialState,
  });

  const openDetail = useCallback((image: Image | string) => {
    setState(prev => ({
      ...prev,
      isOpen: true,
      isLoading: typeof image === 'string',
      selectedImage: typeof image === 'string' ? null : image,
      error: null,
    }));
  }, []);

  const closeDetail = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false,
      selectedImage: null,
      isLoading: false,
      error: null,
    }));
  }, []);

  const setImage = useCallback((image: Image) => {
    setState(prev => ({
      ...prev,
      selectedImage: image,
      isLoading: false,
      error: null,
    }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading: loading,
    }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({
      ...prev,
      error,
      isLoading: false,
    }));
  }, []);

  return {
    state,
    openDetail,
    closeDetail,
    setImage,
    setLoading,
    setError,
  };
}

interface UseImageDetailByIdReturn {
  getImageById: (id: string) => Promise<Image | null>;
  isLoading: boolean;
  error: string | null;
}

export function useImageDetailById(): UseImageDetailByIdReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getImageById = useCallback(async (id: string): Promise<Image | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/images/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      const image = await response.json();
      return image;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getImageById,
    isLoading,
    error,
  };
}

interface UseImageFileReturn {
  getImageFile: (id: string) => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
}

export function useImageFile(): UseImageFileReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getImageFile = useCallback(async (id: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/images/${id}/file`);
      if (!response.ok) {
        throw new Error(`Failed to fetch image file: ${response.statusText}`);
      }
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getImageFile,
    isLoading,
    error,
  };
}