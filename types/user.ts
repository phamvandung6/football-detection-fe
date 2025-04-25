// types/user.ts

export interface User {
  id: string;
  username: string;
  email: string;
  name: string; // Hoặc displayName
  enabled: boolean;
  roles: string[]; // Ví dụ: ['user', 'admin']
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
  // Thêm các trường khác nếu cần: avatarUrl, etc.
}
