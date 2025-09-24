import { Album } from '../types'

/**
 * Mock album data generator for development and testing
 */
export const mockAlbums: Album[] = [
  {
    id: 1,
    name: 'Summer Vacation 2024',
    captureDate: new Date('2024-07-15'),
    displayOrder: 1,
    thumbnailPhotoId: 1,
    photoCount: 25,
    createdAt: new Date('2024-07-15T10:30:00Z'),
    updatedAt: new Date('2024-07-15T10:30:00Z'),
  },
  {
    id: 2,
    name: 'Spring Wedding',
    captureDate: new Date('2024-05-20'),
    displayOrder: 2,
    thumbnailPhotoId: 26,
    photoCount: 142,
    createdAt: new Date('2024-05-20T14:00:00Z'),
    updatedAt: new Date('2024-05-20T14:00:00Z'),
  },
  {
    id: 3,
    name: 'Mountain Hiking Trip',
    captureDate: new Date('2024-09-10'),
    displayOrder: 3,
    thumbnailPhotoId: 168,
    photoCount: 67,
    createdAt: new Date('2024-09-10T08:15:00Z'),
    updatedAt: new Date('2024-09-10T08:15:00Z'),
  },
  {
    id: 4,
    name: 'Family Reunion',
    captureDate: new Date('2024-08-05'),
    displayOrder: 4,
    thumbnailPhotoId: 235,
    photoCount: 89,
    createdAt: new Date('2024-08-05T16:45:00Z'),
    updatedAt: new Date('2024-08-05T16:45:00Z'),
  },
  {
    id: 5,
    name: 'City Architecture',
    captureDate: new Date('2024-06-12'),
    displayOrder: 5,
    thumbnailPhotoId: 324,
    photoCount: 34,
    createdAt: new Date('2024-06-12T11:20:00Z'),
    updatedAt: new Date('2024-06-12T11:20:00Z'),
  },
  {
    id: 6,
    name: 'Beach Sunset',
    captureDate: new Date('2024-07-28'),
    displayOrder: 6,
    thumbnailPhotoId: 358,
    photoCount: 18,
    createdAt: new Date('2024-07-28T19:30:00Z'),
    updatedAt: new Date('2024-07-28T19:30:00Z'),
  },
]

/**
 * Generate additional mock albums for testing large lists
 * @param count - Number of additional albums to generate
 * @returns Array of generated mock albums
 */
export const generateMockAlbums = (count: number): Album[] => {
  const baseAlbums = [...mockAlbums]
  const generatedAlbums: Album[] = []

  for (let i = 0; i < count; i++) {
    const albumId = baseAlbums.length + generatedAlbums.length + 1
    const photoStartId = albumId * 100
    const photoCount = Math.floor(Math.random() * 100) + 5 // 5-104 photos

    // Generate random date within last 2 years
    const randomDate = new Date()
    randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 730))

    const albumNames = [
      'Nature Walk', 'Food Photography', 'Portrait Session', 'Travel Adventure',
      'Street Photography', 'Landscape Views', 'Concert Night', 'Art Gallery Visit',
      'Sports Event', 'Birthday Party', 'Holiday Celebration', 'Pets & Animals',
      'Sunrise Session', 'Urban Exploration', 'Museum Trip', 'Garden Flowers',
      'Winter Wonderland', 'Autumn Colors', 'Spring Blooms', 'Coffee Shop Vibes'
    ]

    const randomName = albumNames[Math.floor(Math.random() * albumNames.length)]

    generatedAlbums.push({
      id: albumId,
      name: `${randomName} ${albumId}`,
      captureDate: randomDate,
      displayOrder: albumId,
      thumbnailPhotoId: photoStartId + 1,
      photoCount,
      createdAt: randomDate,
      updatedAt: randomDate,
    })
  }

  return [...baseAlbums, ...generatedAlbums]
}

/**
 * Get paginated albums for infinite scroll testing
 * @param page - Page number (0-based)
 * @param pageSize - Number of albums per page
 * @param totalAlbums - Total albums to generate if needed
 * @returns Object with albums array and pagination info
 */
export const getPaginatedAlbums = (
  page: number = 0,
  pageSize: number = 12,
  totalAlbums: number = 100
) => {
  const allAlbums = generateMockAlbums(Math.max(0, totalAlbums - mockAlbums.length))
  const startIndex = page * pageSize
  const endIndex = startIndex + pageSize

  const albums = allAlbums.slice(startIndex, endIndex)
  const hasNextPage = endIndex < allAlbums.length
  const totalPages = Math.ceil(allAlbums.length / pageSize)

  return {
    albums,
    pagination: {
      page,
      pageSize,
      totalAlbums: allAlbums.length,
      totalPages,
      hasNextPage,
      hasPreviousPage: page > 0,
    }
  }
}

/**
 * Simulate API delay for realistic testing
 * @param albums - Albums to return after delay
 * @param delay - Delay in milliseconds (default: 300-800ms)
 * @returns Promise that resolves with albums after delay
 */
export const getMockAlbumsWithDelay = async (
  albums: Album[] = mockAlbums,
  delay?: number
): Promise<Album[]> => {
  const actualDelay = delay ?? Math.floor(Math.random() * 500) + 300

  return new Promise((resolve) => {
    setTimeout(() => resolve(albums), actualDelay)
  })
}

/**
 * Find album by ID
 * @param id - Album ID to find
 * @param allAlbums - Optional custom album list
 * @returns Album if found, undefined otherwise
 */
export const findMockAlbumById = (
  id: number,
  allAlbums: Album[] = mockAlbums
): Album | undefined => {
  return allAlbums.find(album => album.id === id)
}