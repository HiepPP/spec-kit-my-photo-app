import { Album, Photo, UploadSession, PhotoService } from '../types'

class MockDataService implements PhotoService {
  private albums: Album[] = [
    {
      id: 1,
      name: 'Vacation 2024',
      captureDate: new Date('2024-06-15'),
      displayOrder: 1,
      thumbnailPhotoId: 1,
      photoCount: 12,
      createdAt: new Date('2024-06-15'),
      updatedAt: new Date('2024-06-15')
    },
    {
      id: 2,
      name: 'Birthday Party',
      captureDate: new Date('2024-05-20'),
      displayOrder: 2,
      thumbnailPhotoId: 13,
      photoCount: 8,
      createdAt: new Date('2024-05-20'),
      updatedAt: new Date('2024-05-20')
    },
    {
      id: 3,
      name: 'Nature Walks',
      captureDate: new Date('2024-04-10'),
      displayOrder: 3,
      thumbnailPhotoId: 21,
      photoCount: 15,
      createdAt: new Date('2024-04-10'),
      updatedAt: new Date('2024-04-10')
    }
  ]

  private photos: Photo[] = []

  constructor() {
    this.generateMockPhotos()
  }

  private generateMockPhotos() {
    // Generate mock photos for each album
    this.albums.forEach(album => {
      for (let i = 0; i < album.photoCount; i++) {
        const photoId = this.photos.length + 1
        this.photos.push({
          id: photoId,
          filename: `IMG_${String(photoId).padStart(4, '0')}.jpg`,
          albumId: album.id,
          fileData: new Blob(['mock-file-data'], { type: 'image/jpeg' }),
          thumbnailData: new Blob(['mock-thumbnail-data'], { type: 'image/jpeg' }),
          captureDate: new Date(album.captureDate.getTime() + i * 3600000), // Hour intervals
          fileSize: 2048576 + Math.random() * 1048576, // 2-3MB
          width: 1920 + Math.floor(Math.random() * 1080),
          height: 1080 + Math.floor(Math.random() * 720),
          uploadTimestamp: new Date()
        })
      }
    })
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async uploadPhotos(files: File[]): Promise<UploadSession> {
    await this.delay(500) // Simulate network delay

    const session: UploadSession = {
      id: crypto.randomUUID(),
      status: 'processing',
      totalFiles: files.length,
      processedFiles: 0,
      errorCount: 0,
      startedAt: new Date(),
      completedAt: null
    }

    // Simulate upload completion
    setTimeout(() => {
      session.status = 'completed'
      session.processedFiles = files.length
      session.completedAt = new Date()
    }, 2000)

    return session
  }

  async getAllAlbums(): Promise<Album[]> {
    await this.delay(300) // Simulate network delay
    return [...this.albums].sort((a, b) => a.displayOrder - b.displayOrder)
  }

  async getPhotosInAlbum(albumId: number): Promise<Photo[]> {
    await this.delay(400) // Simulate network delay
    return this.photos.filter(photo => photo.albumId === albumId)
  }

  async getFullPhoto(photoId: number): Promise<Photo> {
    await this.delay(200) // Simulate network delay
    const photo = this.photos.find(p => p.id === photoId)
    if (!photo) {
      throw new Error(`Photo with id ${photoId} not found`)
    }
    return photo
  }

  async updateAlbumOrder(albumId: number, newOrder: number): Promise<void> {
    await this.delay(200) // Simulate network delay

    const album = this.albums.find(a => a.id === albumId)
    if (!album) {
      throw new Error(`Album with id ${albumId} not found`)
    }

    album.displayOrder = newOrder
    album.updatedAt = new Date()
  }

  async exportAlbumAsZip(albumId: number): Promise<Blob> {
    await this.delay(1000) // Simulate zip creation time

    const album = this.albums.find(a => a.id === albumId)
    if (!album) {
      throw new Error(`Album with id ${albumId} not found`)
    }

    // Return mock zip blob
    return new Blob(['mock-zip-data'], { type: 'application/zip' })
  }

  async deletePhoto(photoId: number): Promise<void> {
    await this.delay(200) // Simulate network delay

    const photoIndex = this.photos.findIndex(p => p.id === photoId)
    if (photoIndex === -1) {
      throw new Error(`Photo with id ${photoId} not found`)
    }

    const photo = this.photos[photoIndex]
    this.photos.splice(photoIndex, 1)

    // Update album photo count
    const album = this.albums.find(a => a.id === photo.albumId)
    if (album) {
      album.photoCount = Math.max(0, album.photoCount - 1)
      album.updatedAt = new Date()
    }
  }

  async deleteAlbum(albumId: number): Promise<void> {
    await this.delay(300) // Simulate network delay

    const albumIndex = this.albums.findIndex(a => a.id === albumId)
    if (albumIndex === -1) {
      throw new Error(`Album with id ${albumId} not found`)
    }

    // Remove all photos in the album
    this.photos = this.photos.filter(photo => photo.albumId !== albumId)

    // Remove the album
    this.albums.splice(albumIndex, 1)
  }
}

// Export singleton instance
export const mockDataService = new MockDataService()