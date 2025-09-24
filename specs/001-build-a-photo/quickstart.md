# Quickstart: Photo Organizer App

## Setup and First Run

### 1. Initial Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### 2. Development Commands
```bash
# Run tests with coverage
npm test

# Run tests in watch mode
npm test:watch

# Run linting
npm run lint

# Run type checking
npm run type-check

# Build for production
npm run build
```

## User Journey Testing

### Primary Flow: Upload and Organize Photos

1. **Empty State**
   - Open app in browser
   - Verify empty grid shows with upload instructions
   - Confirm accessibility: Screen reader announces "No albums found. Upload photos to get started"

2. **Upload Photos**
   - Drag 5-10 photos with different dates into upload dropzone
   - Verify upload progress bar appears
   - Confirm photos are processed and grouped by capture date
   - Check that albums appear in grid layout

3. **Browse Albums**
   - Click on an album tile
   - Verify photo tile view opens
   - Confirm navigation breadcrumb shows album name
   - Test keyboard navigation through photos

4. **View Photo in Zoom Mode**
   - Click on a photo tile
   - Verify zoom modal opens with full-size image
   - Test navigation controls (next/previous/close)
   - Confirm keyboard navigation works (arrow keys, escape)

5. **Reorder Albums**
   - Return to main album grid
   - Drag an album tile to new position
   - Verify visual feedback during drag
   - Confirm new order persists after page refresh

6. **Export Album**
   - Select an album
   - Click export button
   - Verify ZIP file downloads with all photos
   - Confirm file names match original uploads

### Accessibility Testing Checklist

- [ ] Tab navigation works through all interactive elements
- [ ] Screen reader announces all content appropriately
- [ ] High contrast mode displays clearly
- [ ] Keyboard shortcuts work (arrow keys in zoom, escape to close)
- [ ] Focus indicators are visible
- [ ] Alt text is provided for all images
- [ ] ARIA labels describe interactive elements

### Error Scenario Testing

1. **Upload Errors**
   - Try uploading unsupported file type
   - Upload corrupted image file
   - Upload when storage is nearly full
   - Verify error messages are helpful and actionable

2. **Browser Recovery**
   - Upload photos, then refresh page mid-upload
   - Verify recovery prompt appears
   - Confirm data integrity after recovery

3. **Offline Usage**
   - Disconnect network after loading app
   - Verify all functionality continues to work
   - Confirm data persists locally

## Component Development Workflow

### 1. Start with Tests
```bash
# Create component test file
touch src/components/AlbumGrid/AlbumGrid.test.tsx

# Write failing test first
npm test -- --watch AlbumGrid
```

### 2. Build Component
```bash
# Create component directory
mkdir src/components/AlbumGrid

# Create files
touch src/components/AlbumGrid/index.ts
touch src/components/AlbumGrid/AlbumGrid.tsx
touch src/components/AlbumGrid/AlbumGrid.stories.tsx
```

### 3. Integration Testing
```bash
# Run full test suite
npm test

# Check coverage
npm run test:coverage
```

## Database Development

### 1. Schema Changes
```bash
# Create migration
npm run db:migrate

# Seed test data
npm run db:seed

# Reset database
npm run db:reset
```

### 2. Query Testing
```bash
# Start database console
npm run db:console

# Run query tests
npm run test:db
```

## Performance Testing

### 1. Load Testing
- Upload 100+ photos
- Verify smooth scrolling in grids
- Check memory usage in DevTools
- Confirm 60fps during animations

### 2. Bundle Analysis
```bash
# Analyze bundle size
npm run build:analyze

# Check lighthouse scores
npm run lighthouse
```

## Troubleshooting

### Common Issues

1. **Photos not appearing**
   - Check browser console for EXIF parsing errors
   - Verify IndexedDB is available and not full
   - Confirm supported file formats

2. **Drag and drop not working**
   - Ensure @dnd-kit/core is installed
   - Check accessibility settings allow drag operations
   - Verify touch events for mobile

3. **Export failing**
   - Check available disk space
   - Verify ZIP library is loaded
   - Confirm photos exist in database

### Debug Mode
```bash
# Enable debug logging
VITE_DEBUG=true npm run dev

# View database contents
npm run db:inspect
```

## Production Deployment

### 1. Build and Test
```bash
# Full production build
npm run build

# Test production build locally
npm run preview

# Run production test suite
npm run test:prod
```

### 2. Performance Validation
- [ ] Lighthouse score > 90 for all metrics
- [ ] Bundle size < 500KB gzipped
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s

### 3. Accessibility Validation
- [ ] WAVE browser extension shows 0 errors
- [ ] axe-core automated tests pass
- [ ] Manual keyboard navigation test passed
- [ ] Screen reader compatibility verified