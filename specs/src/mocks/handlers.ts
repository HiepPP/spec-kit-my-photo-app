import { http } from 'msw';
import { ImageService } from '../../src/services/imageService';

// Mock image data for testing
const mockImages = [
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
];

export const handlers = [
  // GET /api/images/{id}
  http.get('/api/images/:id', async (req, res, ctx) => {
    const { id } = req.params;

    try {
      const image = await ImageService.getImage(id as string);

      if (!image) {
        return res(
          ctx.status(404),
          ctx.json({ error: 'Image not found' })
        );
      }

      return res(
        ctx.status(200),
        ctx.json(image)
      );
    } catch (error) {
      return res(
        ctx.status(500),
        ctx.json({ error: 'Internal server error' })
      );
    }
  }),

  // GET /api/images/{id}/file
  http.get('/api/images/:id/file', async (req, res, ctx) => {
    const { id } = req.params;

    try {
      const fileUrl = await ImageService.getImageFile(id as string);

      if (!fileUrl) {
        return res(
          ctx.status(404),
          ctx.json({ error: 'Image file not found' })
        );
      }

      // In a real implementation, this would serve the actual file
      // For mock purposes, we'll return a redirect to the URL
      return res(
        ctx.status(200),
        ctx.json({ url: fileUrl })
      );
    } catch (error) {
      return res(
        ctx.status(500),
        ctx.json({ error: 'Internal server error' })
      );
    }
  }),

  // PUT /api/images/{id}
  http.put('/api/images/:id', async (req, res, ctx) => {
    const { id } = req.params;

    try {
      const updates = await req.json();
      const image = await ImageService.updateImage(id as string, updates);

      if (!image) {
        return res(
          ctx.status(404),
          ctx.json({ error: 'Image not found' })
        );
      }

      return res(
        ctx.status(200),
        ctx.json(image)
      );
    } catch (error) {
      return res(
        ctx.status(500),
        ctx.json({ error: 'Internal server error' })
      );
    }
  }),

  // GET /api/images (for gallery)
  http.get('/api/images', async (req, res, ctx) => {
    try {
      const url = new URL(req.url);
      const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined;
      const offset = url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : undefined;
      const sortBy = url.searchParams.get('sortBy') as any;
      const sortOrder = url.searchParams.get('sortOrder') as any;
      const tags = url.searchParams.get('tags')?.split(',') || undefined;
      const uploadedBy = url.searchParams.get('uploadedBy') || undefined;

      const result = await ImageService.getAllImages({
        limit,
        offset,
        sortBy,
        sortOrder,
        tags,
        uploadedBy,
      });

      return res(
        ctx.status(200),
        ctx.json(result)
      );
    } catch (error) {
      return res(
        ctx.status(500),
        ctx.json({ error: 'Internal server error' })
      );
    }
  }),

  // POST /api/images/upload
  http.post('/api/images/upload', async (req, res, ctx) => {
    try {
      // This would handle multipart/form-data in a real implementation
      const formData = await req.formData();
      const file = formData.get('file') as File;
      const caption = formData.get('caption') as string;
      const tags = formData.get('tags') as string;

      if (!file) {
        return res(
          ctx.status(400),
          ctx.json({ error: 'No file provided' })
        );
      }

      const image = await ImageService.uploadImage(file, {
        caption: caption || undefined,
        tags: tags ? tags.split(',') : undefined,
      });

      return res(
        ctx.status(201),
        ctx.json(image)
      );
    } catch (error) {
      return res(
        ctx.status(500),
        ctx.json({ error: 'Internal server error' })
      );
    }
  }),

  // DELETE /api/images/{id}
  http.delete('/api/images/:id', async (req, res, ctx) => {
    const { id } = req.params;

    try {
      const success = await ImageService.deleteImage(id as string);

      if (!success) {
        return res(
          ctx.status(404),
          ctx.json({ error: 'Image not found' })
        );
      }

      return res(
        ctx.status(204)
      );
    } catch (error) {
      return res(
        ctx.status(500),
        ctx.json({ error: 'Internal server error' })
      );
    }
  }),
];