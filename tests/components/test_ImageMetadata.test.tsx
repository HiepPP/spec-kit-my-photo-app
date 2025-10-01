import { render, screen } from '@testing-library/react';
import { ImageMetadata, ImageMetadataCompact } from '../../src/components/ImageMetadata/ImageMetadata';
import { Image, User } from '../../src/types';

describe('ImageMetadata', () => {
  const mockImage: Image = {
    id: 'test-id',
    filename: 'test-image.jpg',
    path: '/images/test-image.jpg',
    url: 'https://example.com/test-image.jpg',
    caption: 'A beautiful sunset',
    uploadedBy: 'user-123',
    uploadedAt: new Date('2024-01-15T10:30:00Z'),
    capturedAt: new Date('2024-01-15T09:15:00Z'),
    fileSize: 2457600,
    width: 1920,
    height: 1080,
    mimeType: 'image/jpeg',
    cameraModel: 'Canon EOS R5',
    location: 'San Francisco, CA',
    tags: ['landscape', 'nature', 'sunset'],
  };

  const mockUser: User = {
    id: 'user-123',
    username: 'photographer',
    displayName: 'John Photographer',
    email: 'john@example.com',
    avatarUrl: 'https://example.com/avatar.jpg',
  };

  it('should display image filename', () => {
    render(<ImageMetadata image={mockImage} />);
    
    expect(screen.getByText('Filename')).toBeInTheDocument();
    expect(screen.getByText('test-image.jpg')).toBeInTheDocument();
  });

  it('should display image caption when provided', () => {
    render(<ImageMetadata image={mockImage} />);
    
    expect(screen.getByText('Caption')).toBeInTheDocument();
    expect(screen.getByText('A beautiful sunset')).toBeInTheDocument();
  });

  it('should not display caption when not provided', () => {
    const imageWithoutCaption = { ...mockImage, caption: undefined };
    render(<ImageMetadata image={imageWithoutCaption} />);
    
    expect(screen.queryByText('Caption')).not.toBeInTheDocument();
  });

  it('should display file size in human readable format', () => {
    render(<ImageMetadata image={mockImage} />);
    
    expect(screen.getByText('File Size')).toBeInTheDocument();
    expect(screen.getByText('2.35 MB')).toBeInTheDocument();
  });

  it('should display file type', () => {
    render(<ImageMetadata image={mockImage} />);
    
    expect(screen.getByText('File Type')).toBeInTheDocument();
    expect(screen.getByText('JPEG')).toBeInTheDocument();
  });

  it('should display image dimensions', () => {
    render(<ImageMetadata image={mockImage} />);
    
    expect(screen.getByText('Dimensions')).toBeInTheDocument();
    expect(screen.getByText('1,920 × 1,080 px')).toBeInTheDocument();
  });

  it('should display upload date', () => {
    render(<ImageMetadata image={mockImage} />);
    
    expect(screen.getByText('Uploaded')).toBeInTheDocument();
    expect(screen.getByText(/January 15, 2024/)).toBeInTheDocument();
  });

  it('should display capture date when available', () => {
    render(<ImageMetadata image={mockImage} />);
    
    expect(screen.getByText('Captured')).toBeInTheDocument();
    expect(screen.getByText(/January 15, 2024/)).toBeInTheDocument();
  });

  it('should not display capture date when not available', () => {
    const imageWithoutCaptureDate = { ...mockImage, capturedAt: undefined };
    render(<ImageMetadata image={imageWithoutCaptureDate} />);
    
    expect(screen.queryByText('Captured')).not.toBeInTheDocument();
  });

  it('should display uploader information when user is provided', () => {
    render(<ImageMetadata image={mockImage} user={mockUser} />);
    
    expect(screen.getByText('Uploaded By')).toBeInTheDocument();
    expect(screen.getByText('John Photographer')).toBeInTheDocument();
  });

  it('should display user avatar when provided', () => {
    render(<ImageMetadata image={mockImage} user={mockUser} />);
    
    const avatar = screen.getByAltText('John Photographer');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('should display username when display name is not available', () => {
    const userWithoutDisplayName = { ...mockUser, displayName: undefined };
    render(<ImageMetadata image={mockImage} user={userWithoutDisplayName} />);
    
    expect(screen.getByText('photographer')).toBeInTheDocument();
  });

  it('should display camera model when available', () => {
    render(<ImageMetadata image={mockImage} />);
    
    expect(screen.getByText('Camera')).toBeInTheDocument();
    expect(screen.getByText('Canon EOS R5')).toBeInTheDocument();
  });

  it('should display location when available', () => {
    render(<ImageMetadata image={mockImage} />);
    
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
  });

  it('should display tags when available', () => {
    render(<ImageMetadata image={mockImage} />);
    
    expect(screen.getByText('Tags')).toBeInTheDocument();
    expect(screen.getByText('landscape')).toBeInTheDocument();
    expect(screen.getByText('nature')).toBeInTheDocument();
    expect(screen.getByText('sunset')).toBeInTheDocument();
  });

  it('should not display tags section when no tags', () => {
    const imageWithoutTags = { ...mockImage, tags: [] };
    render(<ImageMetadata image={imageWithoutTags} />);
    
    expect(screen.queryByText('Tags')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ImageMetadata image={mockImage} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('ImageMetadataCompact', () => {
  const mockImage: Image = {
    id: 'test-id',
    filename: 'test-image.jpg',
    path: '/images/test-image.jpg',
    url: 'https://example.com/test-image.jpg',
    uploadedBy: 'user-123',
    uploadedAt: new Date(),
    fileSize: 2457600,
    width: 1920,
    height: 1080,
    mimeType: 'image/jpeg',
    tags: [],
  };

  it('should display file size in compact format', () => {
    render(<ImageMetadataCompact image={mockImage} />);
    
    expect(screen.getByText('2.3 MB')).toBeInTheDocument();
  });

  it('should display dimensions when available', () => {
    render(<ImageMetadataCompact image={mockImage} />);
    
    expect(screen.getByText('1920×1080')).toBeInTheDocument();
  });

  it('should not display dimensions when not available', () => {
    const imageWithoutDimensions = { ...mockImage, width: undefined, height: undefined };
    render(<ImageMetadataCompact image={imageWithoutDimensions} />);
    
    expect(screen.queryByText(/×/)).not.toBeInTheDocument();
  });

  it('should display capture date when available', () => {
    const imageWithCaptureDate = { 
      ...mockImage, 
      capturedAt: new Date('2024-01-15T10:30:00Z')
    };
    render(<ImageMetadataCompact image={imageWithCaptureDate} />);
    
    expect(screen.getByText(/Captured: January 15, 2024/)).toBeInTheDocument();
  });

  it('should not display capture date when not available', () => {
    render(<ImageMetadataCompact image={mockImage} />);
    
    expect(screen.queryByText(/Captured:/)).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ImageMetadataCompact image={mockImage} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});