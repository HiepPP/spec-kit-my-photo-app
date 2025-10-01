import { Image, ImageUpdateData } from '../types/image';

// Mock database - in a real app this would connect to SQLite
const mockImages: Image[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    filename: 'sample-image.jpg',
    path: '/images/sample-image.jpg',
    url: 'https://picsum.photos/800/600?random=1',
    caption: 'A beautiful landscape',
    uploadedBy: 'user-123',
    uploadedAt: new Date('2024-01-15T10:30:00Z'),
    capturedAt: new Date('2024-01-15T09:15:00Z'),
    fileSize: 2457600,
    width: 1920,
    height: 1080,
    mimeType: 'image/jpeg',
    cameraModel: 'Canon EOS R5',
    location: 'San Francisco, CA',
    tags: ['landscape', 'nature', 'outdoor'],
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    filename: 'portrait.jpg',
    path: '/images/portrait.jpg',
    url: 'https://picsum.photos/600/800?random=2',
    caption: 'Portrait session',
    uploadedBy: 'user-123',
    uploadedAt: new Date('2024-01-16T14:45:00Z'),
    capturedAt: new Date('2024-01-16T14:30:00Z'),
    fileSize: 3145728,
    width: 2400,
    height: 3600,
    mimeType: 'image/jpeg',
    cameraModel: 'Sony A7R IV',
    tags: ['portrait', 'people'],
  },
];

// Mock user database
const mockUsers = [
  {
    id: 'user-123',
    username: 'photographer',
    displayName: 'John Photographer',
    email: 'john@example.com',
    avatarUrl: 'https://picsum.photos/100/100?random=1',
  },
];

export class ImageService {
  /**
   * Get an image by ID
   */
  static async getImage(id: string): Promise<Image | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const image = mockImages.find(img => img.id === id);
    return image || null;
  }

  /**
   * Get image file as blob URL
   */
  static async getImageFile(id: string): Promise<string | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const image = mockImages.find(img => img.id === id);
    if (!image) {
      return null;
    }
    
    // In a real app, this would fetch the actual file
    // For mock purposes, we'll return the existing URL
    return image.url;
  }

  /**
   * Update image metadata
   */
  static async updateImage(id: string, updates: ImageUpdateData): Promise<Image | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const imageIndex = mockImages.findIndex(img => img.id === id);
    if (imageIndex === -1) {
      return null;
    }
    
    // Update the image
    mockImages[imageIndex] = {
      ...mockImages[imageIndex],
      ...updates,
    };
    
    return mockImages[imageIndex];
  }

  /**
   * Get all images with optional filtering
   */
  static async getAllImages(options?: {
    limit?: number;
    offset?: number;
    sortBy?: 'uploadedAt' | 'capturedAt' | 'filename';
    sortOrder?: 'asc' | 'desc';
    tags?: string[];
    uploadedBy?: string;
  }): Promise<{ images: Image[]; total: number }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 50));
    
    let filteredImages = [...mockImages];
    
    // Apply filters
    if (options?.tags && options.tags.length > 0) {
      filteredImages = filteredImages.filter(img => 
        options.tags!.some(tag => img.tags.includes(tag))
      );
    }
    
    if (options?.uploadedBy) {
      filteredImages = filteredImages.filter(img => img.uploadedBy === options.uploadedBy);
    }
    
    // Apply sorting
    if (options?.sortBy) {
      filteredImages.sort((a, b) => {
        const aValue = a[options.sortBy!];
        const bValue = b[options.sortBy!];
        
        if (aValue < bValue) return options.sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return options.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    const total = filteredImages.length;
    
    // Apply pagination
    if (options?.limit) {
      const start = options.offset || 0;
      filteredImages = filteredImages.slice(start, start + options.limit);
    }
    
    return {
      images: filteredImages,
      total,
    };
  }

  /**
   * Upload a new image
   */
  static async uploadImage(file: File, metadata?: {
    caption?: string;
    tags?: string[];
  }): Promise<Image> {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate mock EXIF data
    const mockExifData = {
      width: Math.floor(Math.random() * 2000) + 1000,
      height: Math.floor(Math.random() * 2000) + 1000,
      cameraModel: ['Canon EOS R5', 'Sony A7R IV', 'Nikon Z9'][Math.floor(Math.random() * 3)],
      capturedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    };
    
    const newImage: Image = {
      id: crypto.randomUUID(),
      filename: file.name,
      path: `/images/${file.name}`,
      url: URL.createObjectURL(file),
      caption: metadata?.caption,
      uploadedBy: 'user-123', // In real app, get from auth context
      uploadedAt: new Date(),
      capturedAt: mockExifData.capturedAt,
      fileSize: file.size,
      width: mockExifData.width,
      height: mockExifData.height,
      mimeType: file.type,
      cameraModel: mockExifData.cameraModel,
      tags: metadata?.tags || [],
    };
    
    mockImages.push(newImage);
    return newImage;
  }

  /**
   * Delete an image
   */
  static async deleteImage(id: string): Promise<boolean> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const index = mockImages.findIndex(img => img.id === id);
    if (index === -1) {
      return false;
    }
    
    mockImages.splice(index, 1);
    return true;
  }

  /**
   * Get user by ID
   */
  static async getUser(id: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return mockUsers.find(user => user.id === id) || null;
  }

  /**
   * Search images by query
   */
  static async searchImages(query: string): Promise<Image[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const lowercaseQuery = query.toLowerCase();
    return mockImages.filter(img => 
      img.filename.toLowerCase().includes(lowercaseQuery) ||
      img.caption?.toLowerCase().includes(lowercaseQuery) ||
      img.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }
}

// Export utility functions for convenience
export const getImage = ImageService.getImage.bind(ImageService);
export const getImageFile = ImageService.getImageFile.bind(ImageService);
export const updateImage = ImageService.updateImage.bind(ImageService);
export const getAllImages = ImageService.getAllImages.bind(ImageService);
export const uploadImage = ImageService.uploadImage.bind(ImageService);
export const deleteImage = ImageService.deleteImage.bind(ImageService);
export const searchImages = ImageService.searchImages.bind(ImageService);