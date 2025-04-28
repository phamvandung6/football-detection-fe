import { User } from "@/types/user";
import { apiClient } from "./apiClient";

// Định nghĩa kiểu dữ liệu cho API response
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// Định nghĩa kiểu dữ liệu phân trang
interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// === Client-side functions === //
/**
 * Lấy danh sách người dùng - sử dụng từ client components
 * Tự động xử lý token qua API proxy
 */
export async function getUsers(
  page: number = 0,
  size: number = 10
): Promise<PageResponse<User>> {
  try {
    const { data } = await apiClient.get<PageResponse<User>>(
      `/users?page=${page}&size=${size}`
    );
    return data;
  } catch (error) {
    console.error("[User Service] Error fetching users:", error);
    throw new Error("Không thể lấy danh sách người dùng");
  }
}

/**
 * Lấy thông tin người dùng theo ID - sử dụng từ client components
 */
export async function getUserById(id: string): Promise<User> {
  try {
    const { data } = await apiClient.get<User>(`/users/${id}`);
    return data;
  } catch (error) {
    console.error(`[User Service] Error fetching user ${id}:`, error);
    throw new Error("Không thể lấy thông tin người dùng");
  }
}

/**
 * Lấy thông tin người dùng hiện tại - sử dụng từ client components
 */
export async function getCurrentUser(): Promise<User> {
  try {
    const { data } = await apiClient.get<User>("/users/me");
    return data;
  } catch (error) {
    console.error("[User Service] Error fetching current user:", error);
    throw new Error("Không thể lấy thông tin người dùng hiện tại");
  }
}

/**
 * Cập nhật thông tin người dùng - sử dụng từ client components
 */
export async function updateUser(
  id: string,
  userData: Partial<User>
): Promise<User> {
  try {
    const { data } = await apiClient.patch<User>(`/users/${id}`, userData);
    return data;
  } catch (error) {
    console.error(`[User Service] Error updating user ${id}:`, error);
    throw new Error("Không thể cập nhật thông tin người dùng");
  }
}

/**
 * Xóa người dùng - sử dụng từ client components
 */
export async function deleteUser(id: string): Promise<boolean> {
  try {
    await apiClient.delete(`/users/${id}`);
    return true;
  } catch (error) {
    console.error(`[User Service] Error deleting user ${id}:`, error);
    return false;
  }
}

/**
 * Thay đổi quyền admin - sử dụng từ client components
 */
export async function toggleAdminStatus(
  id: string,
  isAdmin: boolean
): Promise<User> {
  // API mới không có trường is_admin mà sử dụng mảng roles
  // Nên chúng ta cần thêm/xóa role ROLE_ADMIN từ mảng roles
  const userData = {
    roles: isAdmin ? ["ROLE_USER", "ROLE_ADMIN"] : ["ROLE_USER"],
  };

  return updateUser(id, userData);
}

// === Server-side functions === //
// Các hàm này dành cho Server Components và Server Actions

import { getServerApi } from "./serverApi";

/**
 * Lấy danh sách người dùng - sử dụng từ server components/actions
 */
export async function getUsersFromServer(
  page: number = 0,
  size: number = 10
): Promise<PageResponse<User>> {
  const serverApi = await getServerApi();
  return serverApi.get(`/users?page=${page}&size=${size}`);
}

/**
 * Lấy thông tin người dùng theo ID - sử dụng từ server components/actions
 */
export async function getUserByIdFromServer(id: string): Promise<User> {
  const serverApi = await getServerApi();
  return serverApi.get(`/users/${id}`);
}

/**
 * Lấy thông tin người dùng hiện tại - sử dụng từ server components/actions
 */
export async function getCurrentUserFromServer(): Promise<User> {
  const serverApi = await getServerApi();
  return serverApi.get("/users/me");
}

/**
 * Cập nhật thông tin người dùng - sử dụng từ server components/actions
 */
export async function updateUserFromServer(
  id: string,
  userData: Partial<User>
): Promise<User> {
  const serverApi = await getServerApi();
  return serverApi.patch(`/users/${id}`, userData);
}

/**
 * Xóa người dùng - sử dụng từ server components/actions
 */
export async function deleteUserFromServer(id: string): Promise<boolean> {
  try {
    const serverApi = await getServerApi();
    await serverApi.delete(`/users/${id}`);
    return true;
  } catch (error) {
    console.error(`[Server] Error deleting user ${id}:`, error);
    return false;
  }
}
