# Research: Photo Organizer App UI Components

## Decision Summary

This research resolves the three NEEDS CLARIFICATION items from the spec and establishes the UI component architecture for the React-based photo organizer.

## EXIF Date Handling Strategy

**Decision**: Default to "Unknown Date" album for photos without EXIF metadata

**Rationale**:

- Creates predictable user experience - all photos are organized
- Allows users to manually reorganize if needed
- Avoids complex date prompting flows that interrupt upload UX
- Maintains constitutional principle of offline functionality

**Alternatives considered**:

- Upload date fallback: Rejected - would scatter photos across many date-based albums
- User prompt: Rejected - creates poor UX for batch uploads

## Supported Image Formats

**Decision**: Support JPEG, PNG, WebP, HEIC (via browser support)

**Rationale**:

- JPEG/PNG: Universal browser support for common formats
- WebP: Modern format with good compression and browser support
- HEIC: iOS default format, supported by modern browsers
- RAW files excluded: No native browser support, large file sizes

**Alternatives considered**:

- RAW support: Rejected - requires external libraries, violates minimal dependencies principle
- GIF support: Rejected - not a photography format, adds complexity

## Error Recovery Scenarios

**Decision**: Comprehensive error handling with local storage recovery

**Rationale**:

- Browser refresh: Auto-save to localStorage with recovery prompt
- Storage full: Graceful degradation with user notification
- Upload failures: Retry mechanism with progress preservation
- Data corruption: Backup/restore functionality using ZIP export

**Alternatives considered**:

- No error recovery: Rejected - violates data loss prevention requirement
- Cloud backup: Rejected - violates constitutional no-cloud principle

## React Component Architecture Research

### Drag-and-Drop Library Selection

**Decision**: @dnd-kit/core for drag-and-drop functionality

**Rationale**:

- Modern, accessible drag-and-drop with keyboard support
- TypeScript native support
- Meets WCAG 2.1 AA accessibility requirements
- Lightweight with tree-shaking support

**Alternatives considered**:

- react-beautiful-dnd: Rejected - accessibility concerns, maintenance status
- Native HTML5 drag-and-drop: Rejected - poor accessibility, browser inconsistencies

### shadcn/ui Component Selection

**Decision**: Use shadcn/ui components as foundation with custom extensions

**Components to use**:

- Button, Card, Dialog (for ZoomModal)
- Progress (for upload progress)
- Skeleton (for loading states)
- Toast (for notifications)

**Components to build custom**:

- AlbumGrid (custom layout with drag-drop)
- AlbumTile (custom with thumbnail + metadata)
- PhotoTileView (custom grid with virtualization)
- UploadDropzone (custom file handling)

**Rationale**: Balances constitutional preference for shadcn/ui with need for specialized photo UI components

### File Upload Strategy

**Decision**: HTML5 File API with progressive enhancement

**Rationale**:

- Native browser support for file selection and reading
- EXIF data extraction via exif-js library
- Drag-and-drop file handling with visual feedback
- Batch processing with progress indication

**Implementation approach**:

- FileReader API for image processing
- Canvas API for thumbnail generation
- Web Workers for EXIF extraction (non-blocking)

## SQLite Integration Research

**Decision**: sql.js with IndexedDB persistence

**Rationale**:

- Pure JavaScript SQLite implementation
- No external dependencies (constitutional compliance)
- IndexedDB provides persistent browser storage
- Supports full SQL functionality for complex queries

**Schema design**:

```sql
CREATE TABLE albums (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  capture_date DATE NOT NULL,
  display_order INTEGER NOT NULL,
  thumbnail_photo_id INTEGER
);

CREATE TABLE photos (
  id INTEGER PRIMARY KEY,
  filename TEXT NOT NULL,
  album_id INTEGER REFERENCES albums(id),
  file_data BLOB NOT NULL,
  capture_date DATETIME,
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  upload_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Performance Considerations

**Virtualization Strategy**: React-window for large photo grids
**Image Optimization**: Canvas-based thumbnail generation at multiple sizes
**Loading Strategy**: Progressive loading with skeleton states
**Memory Management**: Lazy loading of full-size images in zoom view

## Accessibility Implementation

**Keyboard Navigation**: Tab order through albums and photos
**Screen Reader Support**: ARIA labels for all interactive elements
**Focus Management**: Focus trapping in modal views
**Alternative Text**: Auto-generated descriptions for photos
**High Contrast**: Tailwind CSS utilities for contrast compliance

## Testing Strategy

**Component Testing**: React Testing Library for all UI components
**Integration Testing**: MSW (Mock Service Worker) for file operations
**Accessibility Testing**: @testing-library/jest-dom for ARIA assertions
**Visual Testing**: Storybook for component documentation and testing
**E2E Testing**: Playwright for full user workflows
