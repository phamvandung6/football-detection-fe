import { User } from "@/types/user";
import { API_URL } from "../utils";

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

// Hàm lấy danh sách người dùng
export async function getUsers(
  token: string,
  page: number = 0,
  size: number = 10
): Promise<PageResponse<User>> {
  const response = await fetch(`${API_URL}/users?page=${page}&size=${size}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Không thể lấy danh sách người dùng");
  }

  const responseData: ApiResponse<PageResponse<User>> = await response.json();

  if (!responseData.success) {
    throw new Error(responseData.message);
  }

  return responseData.data;
}

// Hàm lấy chi tiết người dùng
export async function getUserById(id: string, token: string): Promise<User> {
  const response = await fetch(`${API_URL}/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Không thể lấy thông tin người dùng");
  }

  const responseData: ApiResponse<User> = await response.json();

  if (!responseData.success) {
    throw new Error(responseData.message);
  }

  return responseData.data;
}

// Hàm lấy thông tin người dùng hiện tại
export async function getCurrentUser(token: string): Promise<User> {
  const response = await fetch(`${API_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Không thể lấy thông tin người dùng hiện tại"
    );
  }

  const responseData: ApiResponse<User> = await response.json();

  if (!responseData.success) {
    throw new Error(responseData.message);
  }

  return responseData.data;
}

// Hàm cập nhật thông tin người dùng
export async function updateUser(
  id: string,
  userData: Partial<User>,
  token: string
): Promise<User> {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Không thể cập nhật thông tin người dùng"
    );
  }

  const responseData: ApiResponse<User> = await response.json();

  if (!responseData.success) {
    throw new Error(responseData.message);
  }

  return responseData.data;
}

// Hàm xóa người dùng
export async function deleteUser(id: string, token: string): Promise<boolean> {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Không thể xóa người dùng");
  }

  const responseData: ApiResponse<void> = await response.json();

  return responseData.success;
}

// Hàm thay đổi quyền admin - sử dụng hàm updateUser
export async function toggleAdminStatus(
  id: string,
  isAdmin: boolean,
  token: string
): Promise<User> {
  // API mới không có trường is_admin mà sử dụng mảng roles
  // Nên chúng ta cần thêm/xóa role ROLE_ADMIN từ mảng roles
  const userData = {
    roles: isAdmin ? ["ROLE_USER", "ROLE_ADMIN"] : ["ROLE_USER"],
  };

  return updateUser(id, userData, token);
}
