import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { http } from 'msw';
import { setupServer } from 'msw/node';
import { updateImage } from '../../src/services/imageService';
import { createTestImage } from '../utils/test-utils';

const mockImage = createTestImage();

const server = setupServer(
  http.put('/api/images/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const body = await req.json();

    if (id === mockImage.id) {
      const updatedImage = {
        ...mockImage,
        caption: body.caption || mockImage.caption,
        tags: body.tags || mockImage.tags
      };
      return res(ctx.json(updatedImage));
    }
    return res(ctx.status(404), ctx.json({ error: 'Image not found' }));
  })
);

describe('PUT /api/images/{id} Contract Test', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('should update image caption successfully', async () => {
    const updateData = {
      caption: 'Updated beautiful sunset photo'
    };

    const response = await fetch(`/api/images/${mockImage.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.caption).toBe(updateData.caption);
    expect(data.id).toBe(mockImage.id);
  });

  it('should update image tags successfully', async () => {
    const updateData = {
      tags: ['nature', 'landscape', 'sunset']
    };

    const response = await fetch(`/api/images/${mockImage.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.tags).toEqual(updateData.tags);
  });

  it('should update both caption and tags together', async () => {
    const updateData = {
      caption: 'Beach vacation',
      tags: ['vacation', 'beach', 'family']
    };

    const response = await updateImage(mockImage.id, updateData);

    expect(response).toBeDefined();
    expect(response.caption).toBe(updateData.caption);
    expect(response.tags).toEqual(updateData.tags);
  });

  it('should return 404 for non-existent image ID', async () => {
    const updateData = { caption: 'New caption' };
    const response = await fetch('/api/images/550e8400-e29b-41d4-a716-446655440001', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    expect(response.status).toBe(404);
  });

  it('should validate caption length', async () => {
    const updateData = {
      caption: 'a'.repeat(501) // Exceeds 500 char limit
    };

    const response = await fetch(`/api/images/${mockImage.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    expect(response.status).toBe(400);
  });

  it('should validate tag length', async () => {
    const updateData = {
      tags: ['a'.repeat(51)] // Exceeds 50 char limit
    };

    const response = await fetch(`/api/images/${mockImage.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    expect(response.status).toBe(400);
  });

  it('should reject invalid JSON', async () => {
    const response = await fetch(`/api/images/${mockImage.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: 'invalid json',
    });

    expect(response.status).toBe(400);
  });
});