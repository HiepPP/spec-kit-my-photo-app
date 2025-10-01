export interface Image {
  id: string;
  filename: string;
  path: string;
  url: string;
  caption?: string;
  uploadedBy: string;
  uploadedAt: Date;
  capturedAt?: Date;
  fileSize: number;
  width?: number;
  height?: number;
  mimeType: string;
  cameraModel?: string;
  location?: string;
  tags: string[];
}

export interface ImageFormData {
  file: File;
  caption?: string;
  tags?: string[];
}

export interface ImageUpdateData {
  caption?: string;
  tags?: string[];
}

export interface ImageQueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'uploadedAt' | 'capturedAt' | 'filename';
  sortOrder?: 'asc' | 'desc';
  tags?: string[];
  uploadedBy?: string;
}