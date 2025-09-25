import type { Meta, StoryObj } from '@storybook/react'
import AlbumTile from './index'
import { Album } from '../../types'

// Sample album data for stories
const sampleAlbum: Album = {
  id: 1,
  name: 'Summer Vacation 2024',
  captureDate: new Date('2024-07-15'),
  displayOrder: 1,
  thumbnailPhotoId: 101,
  photoCount: 24,
  createdAt: new Date('2024-07-15T10:00:00Z'),
  updatedAt: new Date('2024-07-15T10:00:00Z'),
}

const largePhlotoCountAlbum: Album = {
  id: 2,
  name: 'Wedding Day - Sarah & John',
  captureDate: new Date('2024-06-10'),
  displayOrder: 2,
  thumbnailPhotoId: 102,
  photoCount: 1847,
  createdAt: new Date('2024-06-10T14:00:00Z'),
  updatedAt: new Date('2024-06-10T14:00:00Z'),
}

const noThumbnailAlbum: Album = {
  id: 3,
  name: 'Quick Snapshots',
  captureDate: new Date('2024-08-20'),
  displayOrder: 3,
  thumbnailPhotoId: null,
  photoCount: 3,
  createdAt: new Date('2024-08-20T09:00:00Z'),
  updatedAt: new Date('2024-08-20T09:00:00Z'),
}

const meta: Meta<typeof AlbumTile> = {
  title: 'Components/AlbumTile',
  component: AlbumTile,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A tile component that displays album information including thumbnail, name, photo count, and date.
Supports accessibility features like ARIA labels, keyboard navigation, and focus management.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    album: {
      description: 'Album data object containing all album information',
      control: { type: 'object' },
    },
    thumbnailSrc: {
      description: 'URL or data URL for the album thumbnail image',
      control: { type: 'text' },
    },
    onClick: {
      description: 'Callback function called when the album tile is clicked',
      action: 'clicked',
    },
    onDelete: {
      description: 'Optional callback function for deleting the album',
      action: 'deleted',
    },
    isDragging: {
      description: 'Visual state indicating if the tile is being dragged',
      control: { type: 'boolean' },
    },
    className: {
      description: 'Additional CSS classes to apply to the component',
      control: { type: 'text' },
    },
  },
  args: {
    onClick: () => console.log('Album clicked'),
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Default story with thumbnail
export const Default: Story = {
  args: {
    album: sampleAlbum,
    thumbnailSrc: 'https://picsum.photos/300/300?random=1',
  },
}

// Large photo count
export const LargePhotoCount: Story = {
  args: {
    album: largePhlotoCountAlbum,
    thumbnailSrc: 'https://picsum.photos/300/300?random=2',
  },
}

// No thumbnail (fallback state)
export const NoThumbnail: Story = {
  args: {
    album: noThumbnailAlbum,
    thumbnailSrc: undefined,
  },
}

// With delete button
export const WithDeleteButton: Story = {
  args: {
    album: sampleAlbum,
    thumbnailSrc: 'https://picsum.photos/300/300?random=3',
    onDelete: () => console.log('Delete clicked'),
  },
}

// Dragging state
export const Dragging: Story = {
  args: {
    album: sampleAlbum,
    thumbnailSrc: 'https://picsum.photos/300/300?random=4',
    isDragging: true,
  },
}

// Error loading thumbnail
export const ThumbnailError: Story = {
  args: {
    album: sampleAlbum,
    thumbnailSrc: 'https://invalid-url/404.jpg',
  },
}

// Accessibility focused
export const AccessibilityFocused: Story = {
  args: {
    album: sampleAlbum,
    thumbnailSrc: 'https://picsum.photos/300/300?random=5',
  },
  parameters: {
    docs: {
      description: {
        story: `
This story demonstrates the accessibility features of the AlbumTile component.
Try tabbing to focus on the tile and using Enter or Space to activate it.
        `,
      },
    },
  },
  play: async ({ canvasElement }) => {
    // Auto-focus the tile for accessibility demo
    const tile = canvasElement.querySelector('[role="button"]') as HTMLElement
    if (tile) {
      tile.focus()
    }
  },
}

// Interactive group
export const InteractiveGroup: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 max-w-2xl">
      <AlbumTile
        album={sampleAlbum}
        thumbnailSrc="https://picsum.photos/300/300?random=6"
        onClick={() => console.log('Summer Vacation clicked')}
        onDelete={() => console.log('Delete Summer Vacation')}
      />
      <AlbumTile
        album={largePhlotoCountAlbum}
        thumbnailSrc="https://picsum.photos/300/300?random=7"
        onClick={() => console.log('Wedding clicked')}
      />
      <AlbumTile
        album={noThumbnailAlbum}
        onClick={() => console.log('Quick Snapshots clicked')}
      />
      <AlbumTile
        album={{...sampleAlbum, id: 4, name: 'Birthday Party', photoCount: 67}}
        thumbnailSrc="https://picsum.photos/300/300?random=8"
        onClick={() => console.log('Birthday clicked')}
        isDragging={true}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: `
Multiple album tiles demonstrating different states including:
- Standard tile with delete button
- Large photo count
- No thumbnail fallback
- Dragging state
        `,
      },
    },
  },
}