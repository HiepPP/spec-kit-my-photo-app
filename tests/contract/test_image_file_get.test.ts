import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { http } from 'msw';
import { setupServer } from 'msw/node';
import { getImageFile } from '../../src/services/imageService';
import { createTestImage } from '../utils/test-utils';

const mockImage = createTestImage();
const mockImageData = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]); // PNG header

const server = setupServer(
  http.get('/api/images/:id/file', (req, res, ctx) => {
    const { id } = req.params;
    const url = new URL(req.url);
    const size = url.searchParams.get('size') || 'medium';

    if (id === mockImage.id) {
      return res(
        ctx.set('Content-Type', 'image/png'),
        ctx.set('Content-Length', mockImageData.length.toString()),
        ctx.body(mockImageData)
      );
    }
    return res(ctx.status(404));
  })
);

describe('GET /api/images/{id}/file Contract Test', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('should return 200 and image file for valid ID', async () => {
    const response = await fetch(`/api/images/${mockImage.id}/file`);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/png');
    expect(response.headers.get('Content-Length')).toBe(mockImageData.length.toString());

    const arrayBuffer = await response.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    expect(data).toEqual(mockImageData);
  });

  it('should return 404 for non-existent image ID', async () => {
    const response = await fetch('/api/images/550e8400-e29b-41d4-a716-446655440001/file');

    expect(response.status).toBe(404);
  });

  it('should support size parameter with default to medium', async () => {
    const response = await fetch(`/api/images/${mockImage.id}/file`);
    const responseThumb = await fetch(`/api/images/${mockImage.id}/file?size=thumb`);
    const responseLarge = await fetch(`/api/images/${mockImage.id}/file?size=large`);

    expect(response.status).toBe(200);
    expect(responseThumb.status).toBe(200);
    expect(responseLarge.status).toBe(200);
  });

  it('should validate size parameter values', async () => {
    const responseInvalid = await fetch(`/api/images/${mockImage.id}/file?size=invalid`);
    expect(responseInvalid.status).toBe(400);
  });

  it('should return correct MIME type based on image', async () => {
    const response = await getImageFile(mockImage.id);
    expect(response.type).toBe('image/png');
  });
});