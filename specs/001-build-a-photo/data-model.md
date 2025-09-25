# Data Model: Photo Organizer App

## Entity Definitions

### Album Entity

- **id**: INTEGER PRIMARY KEY - Unique identifier
- **name**: TEXT NOT NULL - Display name (typically formatted date)
- **capture_date**: DATE NOT NULL - Date for grouping photos
- **display_order**: INTEGER NOT NULL - User-defined order for drag-and-drop
- **thumbnail_photo_id**: INTEGER - Reference to representative photo
- **photo_count**: INTEGER - Cached count for UI display
- **created_at**: DATETIME DEFAULT CURRENT_TIMESTAMP
- **updated_at**: DATETIME DEFAULT CURRENT_TIMESTAMP

**Validation Rules**:

- `name` cannot be empty
- `capture_date` must be valid date
- `display_order` must be unique within user's albums
- `thumbnail_photo_id` must reference existing photo

**State Transitions**:

- Created: When first photo with new date is uploaded
- Updated: When photos are added/removed or user drags to reorder
- Deleted: When last photo in album is deleted

### Photo Entity

- **id**: INTEGER PRIMARY KEY - Unique identifier
- **filename**: TEXT NOT NULL - Original filename from upload
- **album_id**: INTEGER NOT NULL - Foreign key to albums table
- **file_data**: BLOB NOT NULL - Binary image data
- **thumbnail_data**: BLOB NOT NULL - Generated thumbnail (256x256)
- **capture_date**: DATETIME - Extracted from EXIF or NULL
- **file_size**: INTEGER NOT NULL - Size in bytes
- **width**: INTEGER - Image width in pixels
- **height**: INTEGER - Image height in pixels
- **upload_timestamp**: DATETIME DEFAULT CURRENT_TIMESTAMP

**Validation Rules**:

- `filename` cannot be empty
- `album_id` must reference existing album
- `file_data` must be valid image format
- `file_size` must be > 0
- `width` and `height` must be > 0

**State Transitions**:

- Created: When uploaded and processed
- Updated: If moved between albums (rare, likely requires new spec)
- Deleted: When user removes photo

### Upload Session Entity (Temporary)

- **id**: TEXT PRIMARY KEY - UUID for session tracking
- **status**: TEXT NOT NULL - 'processing', 'completed', 'failed'
- **total_files**: INTEGER NOT NULL - Number of files in upload
- **processed_files**: INTEGER DEFAULT 0 - Number completed
- **error_count**: INTEGER DEFAULT 0 - Number failed
- **started_at**: DATETIME DEFAULT CURRENT_TIMESTAMP
- **completed_at**: DATETIME - When session finished

**Validation Rules**:

- `status` must be one of allowed values
- `processed_files` + `error_count` <= `total_files`
- `completed_at` only set when status is 'completed' or 'failed'

**State Transitions**:

- Created: When user starts file upload
- Processing: As files are individually processed
- Completed: When all files processed successfully
- Failed: If critical error occurs

## Relationships

### Album → Photos (One-to-Many)

- Each album contains multiple photos
- Photos cannot exist without an album
- When album is deleted, all photos are deleted (CASCADE)

### Album → Thumbnail Photo (One-to-One Optional)

- Album may have a representative thumbnail photo
- Thumbnail photo must be from the same album
- If thumbnail photo is deleted, thumbnail_photo_id set to NULL

### Upload Session → Photos (One-to-Many Temporary)

- During upload, photos are associated with session
- After completion, session can be deleted
- Used for progress tracking and error recovery

## Indexes for Performance

```sql
CREATE INDEX idx_albums_capture_date ON albums(capture_date);
CREATE INDEX idx_albums_display_order ON albums(display_order);
CREATE INDEX idx_photos_album_id ON photos(album_id);
CREATE INDEX idx_photos_upload_timestamp ON photos(upload_timestamp);
```

## Data Integrity Constraints

```sql
-- Ensure display_order is unique
CREATE UNIQUE INDEX idx_albums_unique_order ON albums(display_order);

-- Foreign key constraints
PRAGMA foreign_keys = ON;

-- Check constraints
ALTER TABLE albums ADD CONSTRAINT chk_album_name_not_empty
  CHECK (length(trim(name)) > 0);

ALTER TABLE photos ADD CONSTRAINT chk_photo_filename_not_empty
  CHECK (length(trim(filename)) > 0);

ALTER TABLE photos ADD CONSTRAINT chk_photo_dimensions_positive
  CHECK (width > 0 AND height > 0);
```

## Component Data Requirements

### AlbumGrid Component

- Needs: All albums with thumbnail_photo_id, photo_count, name, display_order
- Updates: display_order when drag-and-drop occurs
- Query: `SELECT * FROM albums ORDER BY display_order`

### AlbumTile Component

- Needs: Album data + thumbnail image blob
- Join: `albums LEFT JOIN photos ON albums.thumbnail_photo_id = photos.id`

### PhotoTileView Component

- Needs: All photos for specific album with thumbnail_data
- Query: `SELECT * FROM photos WHERE album_id = ? ORDER BY upload_timestamp`

### ZoomModal Component

- Needs: Full photo data (file_data) + navigation info
- Query: `SELECT * FROM photos WHERE album_id = ? ORDER BY upload_timestamp`

### UploadDropzone Component

- Creates: New photos and potentially new albums
- Updates: Upload session progress

## Storage Considerations

**SQLite Database Size**: Estimated 10-50MB for 1000 photos with thumbnails
**Browser Storage**: Uses IndexedDB for persistence (typically 50MB+ available)
**Memory Usage**: Load thumbnails in batches, full images on-demand
**Backup Strategy**: ZIP export includes database + photos for complete backup
