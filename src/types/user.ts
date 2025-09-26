export interface User {
  id: string;
  username: string;
  displayName?: string;
  email: string;
  avatarUrl?: string;
}

export interface UserFormData {
  username: string;
  displayName?: string;
  email: string;
  password: string;
}

export interface UserUpdateData {
  displayName?: string;
  email?: string;
  avatarUrl?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  imageDisplayMode: 'grid' | 'list';
  imageSortOrder: 'newest' | 'oldest' | 'name';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface UserProfile {
  user: User;
  imageCount: number;
  totalFileSize: number;
  joinDate: Date;
  preferences: UserPreferences;
}

export interface UserWithStats extends User {
  imageCount: number;
  totalFileSize: number;
  joinDate: Date;
}