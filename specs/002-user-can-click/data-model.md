# Data Model: Image Detail View

**Feature**: Image Detail View (002-user-can-click)
**Date**: 2025-09-26

## Core Entities

### Image

Represents a single photo with all associated metadata.

**Fields**:
- `id`: string (UUID) - Unique identifier
- `filename`: string - Original filename
- `path`: string - File path in local storage
- `url`: string - Display URL (blob or data URL)
- `caption`: string? - Optional user-added caption
- `uploadedBy`: string - User ID who uploaded
- `uploadedAt`: DateTime - Upload timestamp
- `capturedAt`: DateTime? - Original capture date from EXIF
- `fileSize`: number - Size in bytes
- `width`: number? - Image width in pixels
- `height`: number? - Image height in pixels
- `mimeType`: string - e.g., "image/jpeg"
- `cameraModel`: string? - From EXIF data
- `location`: string? - GPS coordinates from EXIF
- `tags`: string[] - User-defined tags

**Validation Rules**:
- `id`: Required, valid UUID
- `filename`: Required, max 255 chars
- `path`: Required, must exist
- `uploadedBy`: Required, valid user ID
- `uploadedAt`: Required, past date
- `fileSize`: Required, positive integer
- `mimeType`: Required, valid image type

### User

Represents the user who uploaded images.

**Fields**:
- `id`: string (UUID) - Unique identifier
- `username`: string - Unique username
- `displayName`: string? - Display name
- `email`: string - Email address
- `avatarUrl`: string? - Profile picture URL

**Validation Rules**:
- `id`: Required, valid UUID
- `username`: Required, 3-30 chars, alphanumeric + underscore
- `email`: Required, valid email format

## State Models

### ImageDetailState

State for the image detail modal.

```typescript
interface ImageDetailState {
  isOpen: boolean;
  selectedImage: Image | null;
  isLoading: boolean;
  error: string | null;
}
```

### GalleryState

Extended gallery state to support detail view.

```typescript
interface GalleryState {
  images: Image[];
  filters: GalleryFilters;
  selectedImageId: string | null;
  isDetailOpen: boolean;
}
```

## Data Flow

1. **User clicks image** → Gallery updates `selectedImageId` and `isDetailOpen`
2. **Modal opens** → Fetches full image data if not cached
3. **User closes modal** → Updates `isDetailOpen` to false
4. **Navigation persists** → Gallery state remains unchanged

## Relationships

- **Image → User**: Many-to-one (many images per user)
- **Image → Tags**: Many-to-many (via junction table)

## Schema Evolution

This feature extends the existing image schema without breaking changes:
- Adds optional EXIF fields (cameraModel, location)
- Maintains backward compatibility with existing images

## Performance Considerations

- Lazy load image details only when needed
- Cache image metadata to avoid repeated EXIF reading
- Consider pagination for very large galleries