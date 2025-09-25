import { Album, Photo, UploadSession, PhotoService, PaginatedResponse, PaginationInfo } from '../types'

export class MockDataService implements PhotoService {
  private albums: Album[] = []
  private photos: Photo[] = []
  private nextAlbumId: number = 1
  private nextPhotoId: number = 1

  constructor() {
    // Start with empty state to match test expectations
    // Mock data will be generated on demand for demo purposes
  }

  /**
   * Generate mock data for demo/testing purposes
   */
  public generateDemoData(albumCount: number = 50) {
    this.albums = []
    this.photos = []
    this.nextAlbumId = 1
    this.nextPhotoId = 1
    this.generateMockData(albumCount)
  }

  private generateMockData(albumCount: number) {
    const baseDate = new Date('2024-01-01')

    for (let i = 0; i < albumCount; i++) {
      const captureDate = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000) // Daily intervals
      const album: Album = {
        id: this.nextAlbumId++,
        name: this.generateAlbumName(captureDate),
        captureDate,
        displayOrder: i + 1,
        thumbnailPhotoId: null,
        photoCount: Math.floor(Math.random() * 20) + 5, // 5-24 photos per album
        createdAt: captureDate,
        updatedAt: captureDate
      }

      this.albums.push(album)

      // Generate photos for this album
      for (let j = 0; j < album.photoCount; j++) {
        const photo: Photo = {
          id: this.nextPhotoId++,
          filename: `IMG_${String(this.nextPhotoId - 1).padStart(4, '0')}.jpg`,
          albumId: album.id,
          fileData: new Blob(['mock-file-data'], { type: 'image/jpeg' }),
          thumbnailData: new Blob(['mock-thumbnail-data'], { type: 'image/jpeg' }),
          captureDate: new Date(captureDate.getTime() + j * 3600000), // Hour intervals
          fileSize: 2048576 + Math.random() * 1048576, // 2-3MB
          width: 1920 + Math.floor(Math.random() * 1080),
          height: 1080 + Math.floor(Math.random() * 720),
          uploadTimestamp: captureDate
        }
        this.photos.push(photo)

        // Set first photo as thumbnail
        if (j === 0) {
          album.thumbnailPhotoId = photo.id
        }
      }
    }
  }

  private generateAlbumName(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
    return date.toLocaleDateString('en-US', options)
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private simulateRandomError(errorRate: number = 0.05): void {
    // Simulate occasional network errors for testing retry logic
    // Disabled during testing to ensure consistent test results
    if (process.env.NODE_ENV !== 'test' && Math.random() < errorRate) {
      throw new Error('Simulated network error: Connection timeout')
    }
  }

  async uploadPhotos(files: File[]): Promise<UploadSession> {
    await this.delay(500) // Simulate network delay

    const session: UploadSession = {
      id: crypto.randomUUID(),
      status: files.length === 0 ? 'completed' : 'processing',
      totalFiles: files.length,
      processedFiles: files.length === 0 ? 0 : 0,
      errorCount: 0,
      startedAt: new Date(),
      completedAt: files.length === 0 ? new Date() : null
    }

    // Process files if any exist
    if (files.length > 0) {
      // Simulate processing each file
      files.forEach((file) => {
        // Create mock album and photo data
        const captureDate = new Date()

        // Find existing album for this date or create new one
        let album = this.albums.find(a =>
          a.captureDate.toDateString() === captureDate.toDateString()
        )

        if (!album) {
          album = {
            id: this.nextAlbumId++,
            name: this.generateAlbumName(captureDate),
            captureDate,
            displayOrder: this.albums.length + 1,
            thumbnailPhotoId: null,
            photoCount: 0,
            createdAt: captureDate,
            updatedAt: captureDate
          }
          this.albums.push(album)
        }

        // Create photo
        const photo: Photo = {
          id: this.nextPhotoId++,
          filename: file.name,
          albumId: album.id,
          fileData: new Blob(['mock-file-data'], { type: file.type }),
          thumbnailData: new Blob(['mock-thumbnail-data'], { type: file.type }),
          captureDate,
          fileSize: file.size,
          width: 1920 + Math.floor(Math.random() * 1080),
          height: 1080 + Math.floor(Math.random() * 720),
          uploadTimestamp: new Date()
        }

        this.photos.push(photo)
        album.photoCount++

        // Set first photo as thumbnail if not set
        if (!album.thumbnailPhotoId) {
          album.thumbnailPhotoId = photo.id
        }
      })

      // Simulate upload completion
      setTimeout(() => {
        session.status = 'completed'
        session.processedFiles = files.length
        session.completedAt = new Date()
      }, 2000)
    }

    return session
  }

  async getAllAlbums(): Promise<Album[]> {
    await this.delay(300) // Simulate network delay
    return [...this.albums].sort((a, b) => a.displayOrder - b.displayOrder)
  }

  /**
   * Get albums with pagination support for infinite scrolling
   */
  async getAlbumsPaginated(page: number = 1, pageSize: number = 12): Promise<PaginatedResponse<Album>> {
    await this.delay(300) // Simulate network delay

    // Simulate occasional network errors to test retry logic
    this.simulateRandomError(0.02) // 2% error rate

    const sortedAlbums = [...this.albums].sort((a, b) => a.displayOrder - b.displayOrder)
    const totalAlbums = sortedAlbums.length
    const totalPages = Math.ceil(totalAlbums / pageSize)
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const albumsPage = sortedAlbums.slice(startIndex, endIndex)

    const pagination: PaginationInfo = {
      page,
      pageSize,
      totalAlbums,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }

    return {
      data: albumsPage,
      pagination
    }
  }

  async getPhotosInAlbum(albumId: number): Promise<Photo[]> {
    await this.delay(400) // Simulate network delay

    // Simulate occasional network errors to test retry logic
    this.simulateRandomError(0.03) // 3% error rate

    return this.photos.filter(photo => photo.albumId === albumId)
  }

  async getFullPhoto(photoId: number): Promise<Photo> {
    await this.delay(200) // Simulate network delay
    const photo = this.photos.find(p => p.id === photoId)
    if (!photo) {
      throw new Error(`Photo not found`)
    }
    return photo
  }

  async updateAlbumOrder(albumId: number, newOrder: number): Promise<void> {
    await this.delay(200) // Simulate network delay

    const album = this.albums.find(a => a.id === albumId)
    if (!album) {
      return // Handle gracefully as tests expect
    }

    album.displayOrder = newOrder
    album.updatedAt = new Date()
  }

  async exportAlbumAsZip(albumId: number): Promise<Blob> {
    await this.delay(1000) // Simulate zip creation time

    const album = this.albums.find(a => a.id === albumId)
    if (!album) {
      throw new Error(`Album not found`)
    }

    // Get photos for this album and simulate ZIP size based on photo count
    const albumPhotos = this.photos.filter(p => p.albumId === albumId)
    const mockZipData = 'mock-zip-data'.repeat(albumPhotos.length * 100) // Simulate realistic size
    return new Blob([mockZipData], { type: 'application/zip' })
  }

  async deletePhoto(photoId: number): Promise<void> {
    await this.delay(200) // Simulate network delay

    const photoIndex = this.photos.findIndex(p => p.id === photoId)
    if (photoIndex === -1) {
      return // Handle gracefully as tests expect
    }

    const photo = this.photos[photoIndex]
    this.photos.splice(photoIndex, 1)

    // Update album photo count and remove album if empty
    const album = this.albums.find(a => a.id === photo.albumId)
    if (album) {
      album.photoCount = Math.max(0, album.photoCount - 1)
      album.updatedAt = new Date()

      // Remove empty albums
      if (album.photoCount === 0) {
        const albumIndex = this.albums.findIndex(a => a.id === album.id)
        if (albumIndex !== -1) {
          this.albums.splice(albumIndex, 1)
        }
      }
    }
  }

  async deleteAlbum(albumId: number): Promise<void> {
    await this.delay(300) // Simulate network delay

    const albumIndex = this.albums.findIndex(a => a.id === albumId)
    if (albumIndex === -1) {
      return // Handle gracefully as tests expect
    }

    // Remove all photos in the album
    this.photos = this.photos.filter(photo => photo.albumId !== albumId)

    // Remove the album
    this.albums.splice(albumIndex, 1)
  }
}

// Export singleton instance
export const mockDataService = new MockDataService()