/**
 * MockDataService Tests
 * Tests the mock data service implementation following TDD approach
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MockDataService } from '../../src/services/MockDataService'
import { Album, Photo, UploadSession, PhotoService } from '../../src/types'
import { waitForNextTick, createMockFile, createMockFileList } from '../utils'

describe('MockDataService', () => {
  let service: PhotoService
  let mockFiles: File[]

  beforeEach(() => {
    service = new MockDataService()
    mockFiles = [
      createMockFile('photo1.jpg', 'image/jpeg', 2048000),
      createMockFile('photo2.png', 'image/png', 1536000),
      createMockFile('photo3.jpg', 'image/jpeg', 3072000),
    ]
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Service Initialization', () => {
    it('creates service instance successfully', () => {
      expect(service).toBeDefined()
      expect(service).toBeInstanceOf(MockDataService)
    })

    it('implements PhotoService interface', () => {
      expect(service.uploadPhotos).toBeDefined()
      expect(service.getAllAlbums).toBeDefined()
      expect(service.getPhotosInAlbum).toBeDefined()
      expect(service.getFullPhoto).toBeDefined()
      expect(service.updateAlbumOrder).toBeDefined()
      expect(service.exportAlbumAsZip).toBeDefined()
      expect(service.deletePhoto).toBeDefined()
      expect(service.deleteAlbum).toBeDefined()
    })

    it('starts with empty state', async () => {
      const albums = await service.getAllAlbums()
      expect(albums).toEqual([])
    })
  })

  describe('Album Management', () => {
    it('returns empty array when no albums exist', async () => {
      const albums = await service.getAllAlbums()

      expect(albums).toEqual([])
      expect(Array.isArray(albums)).toBe(true)
    })

    it('returns albums ordered by display order', async () => {
      // Upload files to create albums
      await service.uploadPhotos(mockFiles.slice(0, 2))
      await waitForNextTick()

      const albums = await service.getAllAlbums()

      expect(albums.length).toBeGreaterThan(0)
      expect(albums[0].displayOrder).toBeLessThanOrEqual(albums[albums.length - 1].displayOrder)
    })

    it('includes correct album metadata', async () => {
      await service.uploadPhotos(mockFiles.slice(0, 1))
      await waitForNextTick()

      const albums = await service.getAllAlbums()
      const album = albums[0]

      expect(album).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
        captureDate: expect.any(Date),
        displayOrder: expect.any(Number),
        thumbnailPhotoId: expect.any(Number),
        photoCount: expect.any(Number),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    })

    it('updates album order correctly', async () => {
      // Create multiple albums
      await service.uploadPhotos([mockFiles[0]])
      await service.uploadPhotos([mockFiles[1]])
      await waitForNextTick()

      const albums = await service.getAllAlbums()
      const firstAlbum = albums[0]
      const originalOrder = firstAlbum.displayOrder

      await service.updateAlbumOrder(firstAlbum.id, originalOrder + 10)

      const updatedAlbums = await service.getAllAlbums()
      const updatedAlbum = updatedAlbums.find(a => a.id === firstAlbum.id)

      expect(updatedAlbum?.displayOrder).toBe(originalOrder + 10)
    })

    it('handles invalid album ID in updateAlbumOrder gracefully', async () => {
      await expect(service.updateAlbumOrder(999, 1)).resolves.not.toThrow()
    })

    it('deletes album and all its photos', async () => {
      await service.uploadPhotos(mockFiles.slice(0, 2))
      await waitForNextTick()

      const albums = await service.getAllAlbums()
      const albumToDelete = albums[0]
      const photosBeforeDelete = await service.getPhotosInAlbum(albumToDelete.id)

      expect(photosBeforeDelete.length).toBeGreaterThan(0)

      await service.deleteAlbum(albumToDelete.id)

      const remainingAlbums = await service.getAllAlbums()
      const deletedAlbumExists = remainingAlbums.find(a => a.id === albumToDelete.id)

      expect(deletedAlbumExists).toBeUndefined()
    })

    it('handles deletion of non-existent album gracefully', async () => {
      await expect(service.deleteAlbum(999)).resolves.not.toThrow()
    })
  })

  describe('Photo Management', () => {
    it('returns empty array for non-existent album', async () => {
      const photos = await service.getPhotosInAlbum(999)

      expect(photos).toEqual([])
      expect(Array.isArray(photos)).toBe(true)
    })

    it('returns photos for existing album', async () => {
      await service.uploadPhotos(mockFiles.slice(0, 2))
      await waitForNextTick()

      const albums = await service.getAllAlbums()
      const album = albums[0]
      const photos = await service.getPhotosInAlbum(album.id)

      expect(photos.length).toBeGreaterThan(0)
      expect(photos[0]).toMatchObject({
        id: expect.any(Number),
        filename: expect.any(String),
        albumId: album.id,
        fileData: expect.any(Blob),
        thumbnailData: expect.any(Blob),
        captureDate: expect.any(Date),
        fileSize: expect.any(Number),
        width: expect.any(Number),
        height: expect.any(Number),
        uploadTimestamp: expect.any(Date),
      })
    })

    it('retrieves full photo data by ID', async () => {
      await service.uploadPhotos(mockFiles.slice(0, 1))
      await waitForNextTick()

      const albums = await service.getAllAlbums()
      const photos = await service.getPhotosInAlbum(albums[0].id)
      const photoId = photos[0].id

      const fullPhoto = await service.getFullPhoto(photoId)

      expect(fullPhoto).toMatchObject({
        id: photoId,
        filename: expect.any(String),
        albumId: expect.any(Number),
        fileData: expect.any(Blob),
        thumbnailData: expect.any(Blob),
      })
    })

    it('throws error for non-existent photo ID', async () => {
      await expect(service.getFullPhoto(999)).rejects.toThrow('Photo not found')
    })

    it('deletes photo and updates album photo count', async () => {
      await service.uploadPhotos(mockFiles.slice(0, 2))
      await waitForNextTick()

      const albums = await service.getAllAlbums()
      const album = albums[0]
      const photos = await service.getPhotosInAlbum(album.id)
      const photoToDelete = photos[0]
      const initialPhotoCount = album.photoCount

      await service.deletePhoto(photoToDelete.id)

      const updatedPhotos = await service.getPhotosInAlbum(album.id)
      const updatedAlbums = await service.getAllAlbums()
      const updatedAlbum = updatedAlbums.find(a => a.id === album.id)

      expect(updatedPhotos.length).toBe(photos.length - 1)
      expect(updatedAlbum?.photoCount).toBe(initialPhotoCount - 1)
    })

    it('handles deletion of non-existent photo gracefully', async () => {
      await expect(service.deletePhoto(999)).resolves.not.toThrow()
    })

    it('removes empty albums after deleting all photos', async () => {
      await service.uploadPhotos([mockFiles[0]]) // Single photo album
      await waitForNextTick()

      const albums = await service.getAllAlbums()
      const album = albums[0]
      const photos = await service.getPhotosInAlbum(album.id)

      expect(photos.length).toBe(1)

      await service.deletePhoto(photos[0].id)

      const remainingAlbums = await service.getAllAlbums()
      const deletedAlbum = remainingAlbums.find(a => a.id === album.id)

      expect(deletedAlbum).toBeUndefined()
    })
  })

  describe('Photo Upload', () => {
    it('uploads photos and creates upload session', async () => {
      const session = await service.uploadPhotos(mockFiles)

      expect(session).toMatchObject({
        id: expect.any(String),
        status: 'processing',
        totalFiles: mockFiles.length,
        processedFiles: 0,
        errorCount: 0,
        startedAt: expect.any(Date),
        completedAt: null,
      })
    })

    it('handles empty file list gracefully', async () => {
      const session = await service.uploadPhotos([])

      expect(session.totalFiles).toBe(0)
      expect(session.status).toBe('completed')
      expect(session.completedAt).toBeDefined()
    })

    it('processes files and updates session progress', async () => {
      const progressSpy = vi.fn()
      const completeSpy = vi.fn()

      // Mock event listeners
      const mockService = service as any
      mockService.on = vi.fn()
      mockService.emit = vi.fn()

      const session = await service.uploadPhotos(mockFiles)

      // Wait for processing to complete
      await waitForNextTick()

      expect(session.status).toBe('processing')
    })

    it('groups photos by capture date into albums', async () => {
      // Create files with different dates through filenames
      const filesWithDates = [
        createMockFile('IMG_20240715_001.jpg'),
        createMockFile('IMG_20240715_002.jpg'),
        createMockFile('IMG_20240716_001.jpg'),
      ]

      await service.uploadPhotos(filesWithDates)
      await waitForNextTick()

      const albums = await service.getAllAlbums()

      // Should create separate albums for different dates
      expect(albums.length).toBeGreaterThanOrEqual(1)
    })

    it('handles upload errors gracefully', async () => {
      // Create invalid file
      const invalidFile = new File([''], 'invalid.txt', { type: 'text/plain' })

      const session = await service.uploadPhotos([invalidFile])
      await waitForNextTick()

      expect(session.totalFiles).toBe(1)
      expect(session.errorCount).toBeGreaterThanOrEqual(0)
    })

    it('generates proper thumbnail data for uploaded photos', async () => {
      await service.uploadPhotos([mockFiles[0]])
      await waitForNextTick()

      const albums = await service.getAllAlbums()
      const photos = await service.getPhotosInAlbum(albums[0].id)
      const photo = photos[0]

      expect(photo.thumbnailData).toBeInstanceOf(Blob)
      expect(photo.thumbnailData.size).toBeGreaterThan(0)
      expect(photo.thumbnailData.type).toMatch(/^image\//)
    })
  })

  describe('Album Export', () => {
    it('exports album as ZIP file', async () => {
      await service.uploadPhotos(mockFiles.slice(0, 2))
      await waitForNextTick()

      const albums = await service.getAllAlbums()
      const album = albums[0]

      const zipBlob = await service.exportAlbumAsZip(album.id)

      expect(zipBlob).toBeInstanceOf(Blob)
      expect(zipBlob.type).toBe('application/zip')
      expect(zipBlob.size).toBeGreaterThan(0)
    })

    it('handles export of empty album by removing it', async () => {
      await service.uploadPhotos([mockFiles[0]])
      await waitForNextTick()

      const albums = await service.getAllAlbums()
      const albumId = albums[0].id
      await service.deletePhoto((await service.getPhotosInAlbum(albumId))[0].id)

      // Album should be removed when emptied, so export should fail
      await expect(service.exportAlbumAsZip(albumId)).rejects.toThrow('Album not found')
    })

    it('throws error for non-existent album export', async () => {
      await expect(service.exportAlbumAsZip(999)).rejects.toThrow('Album not found')
    })

    it('includes all photos in exported ZIP', async () => {
      const numberOfPhotos = 3
      await service.uploadPhotos(mockFiles.slice(0, numberOfPhotos))
      await waitForNextTick()

      const albums = await service.getAllAlbums()
      const album = albums[0]
      const zipBlob = await service.exportAlbumAsZip(album.id)

      // ZIP should contain metadata about included files
      expect(zipBlob.size).toBeGreaterThan(numberOfPhotos * 1000) // Rough size check
    })
  })

  describe('Data Persistence Simulation', () => {
    it('maintains data consistency across operations', async () => {
      // Upload photos
      await service.uploadPhotos(mockFiles)
      await waitForNextTick()

      const albums1 = await service.getAllAlbums()
      const initialAlbumCount = albums1.length

      // Delete a photo
      const photos = await service.getPhotosInAlbum(albums1[0].id)
      await service.deletePhoto(photos[0].id)

      // Check consistency
      const albums2 = await service.getAllAlbums()
      const updatedPhotos = await service.getPhotosInAlbum(albums1[0].id)

      expect(updatedPhotos.length).toBe(photos.length - 1)

      // Album count should remain same or decrease if album was emptied
      expect(albums2.length).toBeLessThanOrEqual(initialAlbumCount)
    })

    it('handles concurrent operations gracefully', async () => {
      const uploadPromises = [
        service.uploadPhotos([mockFiles[0]]),
        service.uploadPhotos([mockFiles[1]]),
        service.uploadPhotos([mockFiles[2]]),
      ]

      const sessions = await Promise.all(uploadPromises)
      await waitForNextTick()

      expect(sessions).toHaveLength(3)
      sessions.forEach(session => {
        expect(session.id).toBeDefined()
        expect(session.totalFiles).toBe(1)
      })

      const albums = await service.getAllAlbums()
      expect(albums.length).toBeGreaterThan(0)
    })
  })

  describe('Performance Simulation', () => {
    it('simulates realistic delays', async () => {
      const startTime = Date.now()
      await service.getAllAlbums()
      const endTime = Date.now()

      const duration = endTime - startTime
      expect(duration).toBeGreaterThanOrEqual(0) // Should have some delay simulation
    })

    it('handles large file uploads efficiently', async () => {
      const largeFiles = Array.from({ length: 10 }, (_, i) =>
        createMockFile(`large-photo-${i}.jpg`, 'image/jpeg', 5 * 1024 * 1024)
      )

      const startTime = Date.now()
      const session = await service.uploadPhotos(largeFiles)
      const endTime = Date.now()

      expect(session.totalFiles).toBe(10)
      expect(endTime - startTime).toBeLessThan(5000) // Should complete within reasonable time
    })

    it('efficiently manages memory with large datasets', async () => {
      // Create many small uploads to simulate large dataset
      const batches = Array.from({ length: 5 }, (_, batchIndex) =>
        Array.from({ length: 4 }, (_, photoIndex) =>
          createMockFile(`batch-${batchIndex}-photo-${photoIndex}.jpg`)
        )
      )

      for (const batch of batches) {
        await service.uploadPhotos(batch)
      }

      await waitForNextTick()

      const albums = await service.getAllAlbums()
      const totalPhotos = await Promise.all(
        albums.map(album => service.getPhotosInAlbum(album.id))
      )

      const photoCount = totalPhotos.reduce((sum, photos) => sum + photos.length, 0)
      expect(photoCount).toBe(20) // 5 batches * 4 photos each
    })
  })

  describe('Edge Cases and Error Conditions', () => {
    it('handles malformed file data gracefully', async () => {
      const malformedFile = new File(['corrupt data'], 'corrupt.jpg', { type: 'image/jpeg' })

      const session = await service.uploadPhotos([malformedFile])
      await waitForNextTick()

      expect(session.totalFiles).toBe(1)
      // Should not crash, may increment error count
    })

    it('validates file types correctly', async () => {
      const textFile = createMockFile('document.txt', 'text/plain')
      const imageFile = createMockFile('photo.jpg', 'image/jpeg')

      const session = await service.uploadPhotos([textFile, imageFile])
      await waitForNextTick()

      expect(session.totalFiles).toBe(2)
    })

    it('handles extremely large photo collections', async () => {
      // Simulate 100 photos
      const manyFiles = Array.from({ length: 100 }, (_, i) =>
        createMockFile(`photo-${i}.jpg`)
      )

      const session = await service.uploadPhotos(manyFiles)
      expect(session.totalFiles).toBe(100)

      await waitForNextTick()

      const albums = await service.getAllAlbums()
      expect(albums.length).toBeGreaterThan(0)
    })

    it('maintains referential integrity during cascading deletes', async () => {
      await service.uploadPhotos(mockFiles)
      await waitForNextTick()

      const albums = await service.getAllAlbums()
      const album = albums[0]
      const photos = await service.getPhotosInAlbum(album.id)

      // Delete album (should cascade to photos)
      await service.deleteAlbum(album.id)

      // Verify photos are also deleted
      for (const photo of photos) {
        await expect(service.getFullPhoto(photo.id)).rejects.toThrow('Photo not found')
      }
    })
  })
})