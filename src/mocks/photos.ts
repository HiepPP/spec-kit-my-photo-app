import { Photo } from '../types'

/**
 * Mock photo data generator for development and testing
 */
export const mockPhotos: Photo[] = [
  {
    id: 1,
    filename: 'IMG_2024_0715_001.jpg',
    albumId: 1,
    fileData: new Blob(['mock-file-data-1'], { type: 'image/jpeg' }),
    thumbnailData: new Blob(['mock-thumbnail-1'], { type: 'image/jpeg' }),
    captureDate: new Date('2024-07-15T08:30:00Z'),
    fileSize: 2458624,
    width: 4032,
    height: 3024,
    uploadTimestamp: new Date('2024-07-15T10:30:00Z'),
  },
  {
    id: 2,
    filename: 'IMG_2024_0715_002.jpg',
    albumId: 1,
    fileData: new Blob(['mock-file-data-2'], { type: 'image/jpeg' }),
    thumbnailData: new Blob(['mock-thumbnail-2'], { type: 'image/jpeg' }),
    captureDate: new Date('2024-07-15T09:15:00Z'),
    fileSize: 3125478,
    width: 4032,
    height: 3024,
    uploadTimestamp: new Date('2024-07-15T10:30:00Z'),
  },
  {
    id: 3,
    filename: 'IMG_2024_0715_003.jpg',
    albumId: 1,
    fileData: new Blob(['mock-file-data-3'], { type: 'image/jpeg' }),
    thumbnailData: new Blob(['mock-thumbnail-3'], { type: 'image/jpeg' }),
    captureDate: new Date('2024-07-15T14:22:00Z'),
    fileSize: 2897541,
    width: 3024,
    height: 4032,
    uploadTimestamp: new Date('2024-07-15T10:30:00Z'),
  }
]

/**
 * Generate thumbnail URLs using placeholder image services
 * @param photoId - Photo ID for unique image generation
 * @param width - Thumbnail width (default: 300)
 * @param height - Thumbnail height (default: 200)
 * @returns URL string for placeholder thumbnail
 */
export const generateThumbnailUrl = (
  photoId: number,
  width: number = 300,
  height: number = 200
): string => {
  // Using picsum.photos for realistic placeholder images
  return `https://picsum.photos/${width}/${height}?random=${photoId}`
}

/**
 * Generate full photo URLs using placeholder image services
 * @param photoId - Photo ID for unique image generation
 * @param width - Photo width (default: 1920)
 * @param height - Photo height (default: 1080)
 * @returns URL string for placeholder full photo
 */
export const generateFullPhotoUrl = (
  photoId: number,
  width: number = 1920,
  height: number = 1080
): string => {
  return `https://picsum.photos/${width}/${height}?random=${photoId}`
}

/**
 * Generate mock photos for a specific album
 * @param albumId - Album ID to generate photos for
 * @param count - Number of photos to generate
 * @param basePhotoId - Starting photo ID (optional)
 * @returns Array of generated mock photos
 */
export const generateMockPhotos = (
  albumId: number,
  count: number,
  basePhotoId?: number
): Photo[] => {
  const startId = basePhotoId ?? (albumId * 1000)
  const photos: Photo[] = []

  // Random photo dimensions for variety
  const dimensions = [
    { width: 4032, height: 3024 }, // Standard smartphone
    { width: 3024, height: 4032 }, // Portrait smartphone
    { width: 5472, height: 3648 }, // DSLR landscape
    { width: 3648, height: 5472 }, // DSLR portrait
    { width: 1920, height: 1080 }, // Standard HD
  ]

  for (let i = 0; i < count; i++) {
    const photoId = startId + i + 1
    const dimension = dimensions[Math.floor(Math.random() * dimensions.length)]

    // Generate random capture date within album's date range
    const baseDate = new Date(2024, 6, 15) // July 15, 2024
    const randomHours = Math.floor(Math.random() * 12)
    const randomMinutes = Math.floor(Math.random() * 60)
    const captureDate = new Date(baseDate)
    captureDate.setHours(8 + randomHours, randomMinutes, 0, 0)

    // Generate realistic file sizes (2-8MB for high-res photos)
    const fileSize = Math.floor(Math.random() * 6000000) + 2000000

    photos.push({
      id: photoId,
      filename: `IMG_2024_${String(baseDate.getMonth() + 1).padStart(2, '0')}${String(baseDate.getDate()).padStart(2, '0')}_${String(i + 1).padStart(3, '0')}.jpg`,
      albumId,
      fileData: new Blob([`mock-file-data-${photoId}`], { type: 'image/jpeg' }),
      thumbnailData: new Blob([`mock-thumbnail-${photoId}`], { type: 'image/jpeg' }),
      captureDate,
      fileSize,
      width: dimension.width,
      height: dimension.height,
      uploadTimestamp: new Date('2024-07-15T10:30:00Z'),
    })
  }

  return photos
}

/**
 * Get paginated photos for infinite scroll testing
 * @param albumId - Album ID to get photos for
 * @param page - Page number (0-based)
 * @param pageSize - Number of photos per page
 * @param totalPhotos - Total photos to generate if needed
 * @returns Object with photos array and pagination info
 */
export const getPaginatedPhotos = (
  albumId: number,
  page: number = 0,
  pageSize: number = 20,
  totalPhotos: number = 100
) => {
  const allPhotos = generateMockPhotos(albumId, totalPhotos)
  const startIndex = page * pageSize
  const endIndex = startIndex + pageSize

  const photos = allPhotos.slice(startIndex, endIndex)
  const hasNextPage = endIndex < allPhotos.length
  const totalPages = Math.ceil(allPhotos.length / pageSize)

  return {
    photos,
    pagination: {
      page,
      pageSize,
      totalPhotos: allPhotos.length,
      totalPages,
      hasNextPage,
      hasPreviousPage: page > 0,
    }
  }
}

/**
 * Simulate API delay for realistic testing
 * @param photos - Photos to return after delay
 * @param delay - Delay in milliseconds (default: 200-600ms)
 * @returns Promise that resolves with photos after delay
 */
export const getMockPhotosWithDelay = async (
  photos: Photo[] = mockPhotos,
  delay?: number
): Promise<Photo[]> => {
  const actualDelay = delay ?? Math.floor(Math.random() * 400) + 200

  return new Promise((resolve) => {
    setTimeout(() => resolve(photos), actualDelay)
  })
}

/**
 * Find photos by album ID
 * @param albumId - Album ID to find photos for
 * @param allPhotos - Optional custom photo list
 * @returns Array of photos for the album
 */
export const findMockPhotosByAlbumId = (
  albumId: number,
  allPhotos: Photo[] = mockPhotos
): Photo[] => {
  return allPhotos.filter(photo => photo.albumId === albumId)
}

/**
 * Find photo by ID
 * @param id - Photo ID to find
 * @param allPhotos - Optional custom photo list
 * @returns Photo if found, undefined otherwise
 */
export const findMockPhotoById = (
  id: number,
  allPhotos: Photo[] = mockPhotos
): Photo | undefined => {
  return allPhotos.find(photo => photo.id === id)
}

/**
 * Create blob URLs for photo display
 * @param photo - Photo object
 * @returns Object with thumbnail and full photo blob URLs
 */
export const createPhotoUrls = (photo: Photo) => {
  return {
    thumbnailUrl: URL.createObjectURL(photo.thumbnailData),
    fullPhotoUrl: URL.createObjectURL(photo.fileData),
  }
}

/**
 * Cleanup blob URLs to prevent memory leaks
 * @param urls - Array of blob URLs to revoke
 */
export const cleanupPhotoUrls = (urls: string[]) => {
  urls.forEach(url => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  })
}

/**
 * Mock photo factory for testing with realistic data
 * @param overrides - Properties to override in the mock photo
 * @param useRealUrls - Whether to use placeholder service URLs
 * @returns Mock photo object
 */
export const createMockPhotoForTesting = (
  overrides: Partial<Photo> = {},
  _useRealUrls: boolean = false
): Photo => {
  const photoId = overrides.id ?? 1
  const mockBlob = new Blob(['test'], { type: 'image/jpeg' })

  const basePhoto: Photo = {
    id: photoId,
    filename: `test-photo-${photoId}.jpg`,
    albumId: 1,
    fileData: mockBlob,
    thumbnailData: mockBlob,
    captureDate: new Date('2024-09-15T12:00:00Z'),
    fileSize: 1024000,
    width: 1920,
    height: 1080,
    uploadTimestamp: new Date('2024-09-15T10:00:00Z'),
  }

  return { ...basePhoto, ...overrides }
}