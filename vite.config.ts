import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  build: {
    // Enable rollup optimizations
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // React and related libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // UI component libraries
          'ui-vendor': ['@radix-ui/react-slot', 'lucide-react'],

          // Drag and drop functionality
          'dnd-vendor': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],

          // Performance and virtualization
          'perf-vendor': ['react-window'],

          // Database and utilities
          'db-vendor': ['sql.js'],

          // Performance monitoring and preloading utilities
          'performance-utils': [
            'src/utils/performanceMonitor',
            'src/utils/imagePreloader'
          ],

          // Virtualization and hooks
          'virtualization': [
            'src/components/AlbumGrid/VirtualizedAlbumGrid',
            'src/hooks/useVirtualization',
            'src/hooks/useImagePreloading'
          ]
        },

        // Naming pattern for chunks
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId

          if (facadeModuleId) {
            // Create descriptive names for route chunks
            if (facadeModuleId.includes('pages/')) {
              const pageName = facadeModuleId.split('pages/')[1].split('/')[0].toLowerCase()
              return `pages/${pageName}.[hash].js`
            }

            // Create descriptive names for component chunks
            if (facadeModuleId.includes('components/')) {
              const componentName = facadeModuleId.split('components/')[1].split('/')[0].toLowerCase()
              return `components/${componentName}.[hash].js`
            }
          }

          return `chunks/[name].[hash].js`
        },

        // Asset naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') ?? []
          const ext = info[info.length - 1]

          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext ?? '')) {
            return `assets/images/[name].[hash][extname]`
          }

          if (/woff2?|eot|ttf|otf/i.test(ext ?? '')) {
            return `assets/fonts/[name].[hash][extname]`
          }

          return `assets/[name].[hash][extname]`
        },

        // Entry point naming
        entryFileNames: `js/[name].[hash].js`
      }
    },

    // Minification and optimization
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console logs in production
        drop_console: true,
        drop_debugger: true,
        // Remove unused code
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      },
      format: {
        // Remove comments
        comments: false
      }
    },

    // CSS code splitting
    cssCodeSplit: true,

    // Source maps for debugging (disable in production for smaller bundles)
    sourcemap: process.env.NODE_ENV === 'development',

    // Build target for modern browsers
    target: 'esnext',

    // Asset size limits
    chunkSizeWarningLimit: 1000, // 1MB warning
    assetsInlineLimit: 4096, // Inline assets smaller than 4KB
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
      'react-window',
      'sql.js'
    ],
    exclude: [
      // Exclude large libraries that should be loaded on demand
    ]
  },

  // Server configuration for development
  server: {
    // Enable HTTP/2 for better performance
    https: false, // Set to true with certificates for HTTP/2

    // Compression
    compress: true,

    // Pre-bundling for faster dev server startup
    prebundle: true
  }
})