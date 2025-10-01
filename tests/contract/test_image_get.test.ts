import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { http } from 'msw';
import { setupServer } from 'msw/node';
import { createTestImage } from '../utils/test-utils';
import { getImage } from '../../src/services/imageService';

const mockImage = createTestImage();

const server = setupServer(
  http.get('/api/images/:id', (req, res, ctx) => {
    const { id } = req.params;
    if (id === mockImage.id) {
      return res(ctx.json(mockImage));
    }
    return res(ctx.status(404), ctx.json({ error: 'Image not found' }));
  })
);

describe('GET /api/images/{id} Contract Test', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('should return 200 and image details for valid ID', async () => {
    const response = await fetch(`/api/images/${mockImage.id}`);

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data).toEqual(mockImage);
    expect(data.id).toBe(mockImage.id);
    expect(data.filename).toBe(mockImage.filename);
    expect(data.uploadedBy).toBeDefined();
  });

  it('should return 404 for non-existent image ID', async () => {
    const response = await fetch('/api/images/550e8400-e29b-41d4-a716-446655440001');

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Image not found');
  });

  it('should return image with all required fields', async () => {
    const image = await getImage(mockImage.id);

    expect(image).toHaveProperty('id');
    expect(image).toHaveProperty('filename');
    expect(image).toHaveProperty('path');
    expect(image).toHaveProperty('uploadedBy');
    expect(image).toHaveProperty('uploadedAt');
    expect(image).toHaveProperty('fileSize');
    expect(image).toHaveProperty('mimeType');
  });

  it('should include optional fields when present', async () => {
    const image = await getImage(mockImage.id);

    expect(image).toHaveProperty('caption');
    expect(image).toHaveProperty('capturedAt');
    expect(image).toHaveProperty('width');
    expect(image).toHaveProperty('height');
    expect(image).toHaveProperty('tags');
  });
});