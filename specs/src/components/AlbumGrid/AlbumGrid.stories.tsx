import type { Meta, StoryObj } from '@storybook/react'
import AlbumGrid from './index'
import { Album } from '../../types'

// Sample album data generator
const generateSampleAlbum = (id: number): Album => ({
  id,
  name: `Album ${id}`,
  captureDate: new Date(2024 - Math.floor(id / 12), (id % 12), 15),
  displayOrder: id,
  thumbnailPhotoId: 100 + id,
  photoCount: Math.floor(Math.random() * 100) + 5,
  createdAt: new Date(),
  updatedAt: new Date(),
})

// Generate sample albums
const sampleAlbums = Array.from({ length: 6 }, (_, i) => generateSampleAlbum(i + 1))
const manyAlbums = Array.from({ length: 21 }, (_, i) => generateSampleAlbum(i + 1))

// Named albums for specific stories
const namedAlbums: Album[] = [
  {
    id: 1,
    name: 'Summer Vacation 2024',
    captureDate: new Date('2024-07-15'),
    displayOrder: 1,
    thumbnailPhotoId: 101,
    photoCount: 24,
    createdAt: new Date('2024-07-15T10:00:00Z'),
    updatedAt: new Date('2024-07-15T10:00:00Z'),
  },
  {
    id: 2,
    name: 'Wedding Photography',
    captureDate: new Date('2024-06-10'),
    displayOrder: 2,
    thumbnailPhotoId: 102,
    photoCount: 156,
    createdAt: new Date('2024-06-10T14:00:00Z'),
    updatedAt: new Date('2024-06-10T14:00:00Z'),
  },
  {
    id: 3,
    name: 'Daily Life Moments',
    captureDate: new Date('2024-08-20'),
    displayOrder: 3,
    thumbnailPhotoId: null,
    photoCount: 43,
    createdAt: new Date('2024-08-20T09:00:00Z'),
    updatedAt: new Date('2024-08-20T09:00:00Z'),
  },
]

const meta: Meta<typeof AlbumGrid> = {
  title: 'Components/AlbumGrid',
  component: AlbumGrid,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
The AlbumGrid component displays a responsive grid of album tiles with support for:
- Responsive layout (1 column mobile, 2 columns tablet, 3 columns desktop)
- Keyboard navigation with arrow keys, Home, End
- Accessibility features including ARIA labels and live regions
- Loading states with skeleton placeholders
- Drag and drop reordering
        `,
      },
    },
    viewport: {
      defaultViewport: 'responsive',
    },
  },
  tags: ['autodocs'],
  argTypes: {
    albums: {
      description: 'Array of album data objects to display',
      control: { type: 'object' },
    },
    onAlbumClick: {
      description: 'Callback function called when an album is clicked',
      action: 'album-clicked',
    },
    onAlbumReorder: {
      description: 'Callback function called when albums are reordered',
      action: 'album-reordered',
    },
    onAlbumDelete: {
      description: 'Optional callback function for deleting albums',
      action: 'album-deleted',
    },
    loading: {
      description: 'Loading state indicator',
      control: { type: 'boolean' },
    },
    className: {
      description: 'Additional CSS classes to apply',
      control: { type: 'text' },
    },
  },
  args: {
    onAlbumClick: (albumId: number) => console.log(`Album ${albumId} clicked`),
    onAlbumReorder: (albumId: number, newOrder: number) =>
      console.log(`Album ${albumId} moved to order ${newOrder}`),
  },
  decorators: [
    (Story) => (
      <div className="p-8 min-h-screen bg-gray-50">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

// Default grid with few albums
export const Default: Story = {
  args: {
    albums: namedAlbums,
  },
}

// Loading state
export const Loading: Story = {
  args: {
    albums: [],
    loading: true,
  },
}

// Empty state
export const Empty: Story = {
  args: {
    albums: [],
    loading: false,
  },
}

// Many albums (scrollable)
export const ManyAlbums: Story = {
  args: {
    albums: manyAlbums,
  },
  parameters: {
    docs: {
      description: {
        story: 'Grid with many albums to demonstrate responsive behavior and scrolling.',
      },
    },
  },
}

// With delete functionality
export const WithDelete: Story = {
  args: {
    albums: namedAlbums,
    onAlbumDelete: (albumId: number) => console.log(`Delete album ${albumId}`),
  },
  parameters: {
    docs: {
      description: {
        story: 'Albums with delete buttons visible on hover.',
      },
    },
  },
}

// Responsive demonstration
export const ResponsiveDemo: Story = {
  args: {
    albums: sampleAlbums,
  },
  parameters: {
    viewport: {
      viewports: {
        mobile: { name: 'Mobile', styles: { width: '375px', height: '667px' } },
        tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop', styles: { width: '1200px', height: '800px' } },
      },
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story: `
Responsive grid layout:
- Mobile (< 640px): 1 column
- Tablet (640px - 1024px): 2 columns
- Desktop (> 1024px): 3 columns

Try changing the viewport using the toolbar to see the responsive behavior.
        `,
      },
    },
  },
}

// Accessibility focused
export const AccessibilityDemo: Story = {
  args: {
    albums: namedAlbums.slice(0, 6),
  },
  parameters: {
    docs: {
      description: {
        story: `
Accessibility features demonstration:
- Tab navigation support
- Arrow key navigation (Left/Right/Up/Down)
- Home/End key support for first/last items
- ARIA labels and grid role
- Screen reader announcements

Try using keyboard navigation: Tab to focus grid, then use arrow keys to navigate between albums.
        `,
      },
    },
  },
  play: async ({ canvasElement }) => {
    // Auto-focus the grid for accessibility demo
    const grid = canvasElement.querySelector('[role="grid"]') as HTMLElement
    if (grid) {
      grid.focus()
      // Focus first album tile
      const firstTile = grid.querySelector('[role="button"]') as HTMLElement
      if (firstTile) {
        firstTile.focus()
      }
    }
  },
}

// Single album
export const SingleAlbum: Story = {
  args: {
    albums: [namedAlbums[0]],
  },
}

// Loading with existing albums (progressive loading)
export const ProgressiveLoading: Story = {
  args: {
    albums: namedAlbums.slice(0, 3),
    loading: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates progressive loading where some albums are shown while more are loading.',
      },
    },
  },
}

// Custom styling
export const CustomStyling: Story = {
  args: {
    albums: namedAlbums,
    className: 'gap-8 grid-cols-1 sm:grid-cols-1 lg:grid-cols-2',
  },
  parameters: {
    docs: {
      description: {
        story: 'Grid with custom spacing and column configuration (2 columns max instead of 3).',
      },
    },
  },
}