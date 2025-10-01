import { Image, User } from '../../src/types';

export function createTestUser(overrides?: Partial<User>): User {
  return {
    id: overrides?.id || '550e8400-e29b-41d4-a716-446655440000',
    username: overrides?.username || 'testuser',
    displayName: overrides?.displayName || 'Test User',
    email: overrides?.email || 'test@example.com',
    avatarUrl: overrides?.avatarUrl || 'https://example.com/avatar.jpg',
    ...overrides
  };
}

export function createTestImage(overrides?: Partial<Image>): Image {
  const testUser = createTestUser(overrides?.uploadedBy as Partial<User>);

  return {
    id: overrides?.id || '550e8400-e29b-41d4-a716-446655440000',
    filename: overrides?.filename || 'test-image.jpg',
    path: overrides?.path || '/images/test-image.jpg',
    url: overrides?.url || 'blob:https://app.example.com/test',
    caption: overrides?.caption || 'Test image caption',
    uploadedBy: overrides?.uploadedBy || testUser,
    uploadedAt: overrides?.uploadedAt || new Date('2024-09-26T14:30:00Z'),
    capturedAt: overrides?.capturedAt || new Date('2024-09-25T18:45:00Z'),
    fileSize: overrides?.fileSize || 2457600,
    width: overrides?.width || 4032,
    height: overrides?.height || 3024,
    mimeType: overrides?.mimeType || 'image/jpeg',
    cameraModel: overrides?.cameraModel || 'iPhone 14 Pro',
    location: overrides?.location || '37.7749,-122.4194',
    tags: overrides?.tags || ['test', 'nature'],
    ...overrides
  };
}

export function createMockImageResponse(image: Image) {
  return {
    ...image,
    uploadedAt: image.uploadedAt.toISOString(),
    capturedAt: image.capturedAt?.toISOString(),
  };
}

export function mockFetch(response: any, status = 200) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(response),
    blob: () => Promise.resolve(new Blob(['test'], { type: 'image/jpeg' })),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    headers: new Map(),
  });
}

export function mockFetchError(message: string, status = 400) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: () => Promise.resolve({ error: message }),
  });
}

export function mockNetworkError() {
  global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
}

export function setupTestEnvironment() {
  // Reset all mocks
  vi.clearAllMocks();

  // Mock window methods
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock URL methods
  global.URL.createObjectURL = vi.fn(() => 'blob:test-url');
  global.URL.revokeObjectURL = vi.fn();

  // Mock resize observer
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock intersection observer
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
}

export function cleanupTestEnvironment() {
  vi.restoreAllMocks();
}

// Mock localStorage
export function createMockLocalStorage() {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key]),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
  };
}

// Wait for async operations
export function waitForAsync() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

// Mock user event helpers
export async function type(element: HTMLElement, text: string) {
  await userEvent.type(element, text);
}

export async function click(element: HTMLElement) {
  await userEvent.click(element);
}

export async function tab() {
  await userEvent.tab();
}

export async function keyboard(key: string) {
  await userEvent.keyboard(key);
}