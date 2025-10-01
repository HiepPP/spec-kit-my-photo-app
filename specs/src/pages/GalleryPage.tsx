import React, { useState, useEffect } from 'react';
import { Image, User } from '../types';
import { ImageGallery } from '../components/ImageGallery/ImageGallery';
import { ImageDetailModal } from '../components/ImageDetailModal/ImageDetailModal';
import { useImageDetail } from '../hooks/useImageDetail';
import { ImageService } from '../services/imageService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, Upload, Filter } from 'lucide-react';

interface GalleryPageProps {
  className?: string;
}

export function GalleryPage({ className = '' }: GalleryPageProps) {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { state, openDetail, closeDetail } = useImageDetail();

  // Load images on component mount
  useEffect(() => {
    loadImages();
  }, []);

  // Load user when modal opens with image
  useEffect(() => {
    if (state.isOpen && state.selectedImage && !selectedUser) {
      loadUser(state.selectedImage.uploadedBy);
    }
  }, [state.isOpen, state.selectedImage, selectedUser]);

  const loadImages = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await ImageService.getAllImages();
      setImages(result.images);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const loadUser = async (userId: string) => {
    try {
      const user = await ImageService.getUser(userId);
      setSelectedUser(user);
    } catch (err) {
      console.error('Failed to load user:', err);
    }
  };

  const handleImageClick = (image: Image) => {
    openDetail(image);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadImages();
      return;
    }

    setLoading(true);
    try {
      const searchResults = await ImageService.searchImages(searchQuery);
      setImages(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = () => {
    // This would open an upload dialog
    console.log('Upload functionality to be implemented');
  };

  const filteredImages = images; // Add more filtering logic as needed

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Photo Gallery</h1>
              <p className="text-muted-foreground mt-1">
                {images.length} {images.length === 1 ? 'photo' : 'photos'}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search photos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              
              <Button onClick={handleSearch} variant="outline">
                Search
              </Button>
              
              <Button onClick={handleUpload}>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Filters and Controls */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              All
            </Button>
            <Button variant="ghost" size="sm">
              Recent
            </Button>
            <Button variant="ghost" size="sm">
              Favorites
            </Button>
          </div>
        </div>

        {/* Gallery */}
        <ImageGallery
          images={filteredImages}
          loading={loading}
          error={error}
          onImageClick={handleImageClick}
        />

        {/* Empty State */}
        {!loading && !error && filteredImages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📷</div>
            <h2 className="text-xl font-semibold mb-2">No photos found</h2>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? 'No photos match your search.' 
                : 'Start by uploading some photos!'
              }
            </p>
            {!searchQuery && (
              <Button onClick={handleUpload}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Photos
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Image Detail Modal */}
      <ImageDetailModal
        isOpen={state.isOpen}
        onClose={closeDetail}
        image={state.selectedImage}
        user={selectedUser}
      />
    </div>
  );
}

// Export a default version
export default GalleryPage;