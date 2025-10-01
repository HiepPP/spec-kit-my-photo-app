import React from 'react';
import { Image, User } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

interface ImageMetadataProps {
  image: Image;
  user?: User | null;
  className?: string;
}

export function ImageMetadata({ image, user, className = '' }: ImageMetadataProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDimensions = (width?: number, height?: number): string => {
    if (!width || !height) return 'Unknown';
    return `${width.toLocaleString()} × ${height.toLocaleString()} px`;
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg">Image Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground mb-1">Filename</h3>
          <p className="text-sm font-mono break-all">{image.filename}</p>
        </div>

        {image.caption && (
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-1">Caption</h3>
            <p className="text-sm">{image.caption}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-1">File Size</h3>
            <p className="text-sm">{formatFileSize(image.fileSize)}</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-1">File Type</h3>
            <p className="text-sm">{image.mimeType.split('/')[1]?.toUpperCase() || image.mimeType}</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-sm text-muted-foreground mb-1">Dimensions</h3>
          <p className="text-sm">{formatDimensions(image.width, image.height)}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-1">Uploaded</h3>
            <p className="text-sm">{formatDate(image.uploadedAt)}</p>
          </div>
          
          {image.capturedAt && (
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">Captured</h3>
              <p className="text-sm">{formatDate(image.capturedAt)}</p>
            </div>
          )}
        </div>

        {user && (
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-1">Uploaded By</h3>
            <div className="flex items-center gap-2">
              {user.avatarUrl && (
                <img 
                  src={user.avatarUrl} 
                  alt={user.displayName || user.username}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <p className="text-sm">
                {user.displayName || user.username}
              </p>
            </div>
          </div>
        )}

        {image.cameraModel && (
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-1">Camera</h3>
            <p className="text-sm">{image.cameraModel}</p>
          </div>
        )}

        {image.location && (
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-1">Location</h3>
            <p className="text-sm">{image.location}</p>
          </div>
        )}

        {image.tags.length > 0 && (
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">Tags</h3>
            <div className="flex flex-wrap gap-1">
              {image.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ImageMetadataCompactProps {
  image: Image;
  className?: string;
}

export function ImageMetadataCompact({ image, className = '' }: ImageMetadataCompactProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className={`text-xs text-muted-foreground space-y-1 ${className}`}>
      <div className="flex items-center gap-2">
        <span>{formatFileSize(image.fileSize)}</span>
        {image.width && image.height && (
          <span>•</span>
        )}
        {image.width && image.height && (
          <span>{image.width}×{image.height}</span>
        )}
      </div>
      
      {image.capturedAt && (
        <div>
          Captured: {new Date(image.capturedAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}