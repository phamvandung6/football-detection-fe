import { User } from "@/lib/auth/AuthContext";
import { API_URL } from "../utils";

// Hàm lấy danh sách người dùng (chỉ admin mới có quyền)
export async function getUsers(token: string): Promise<User[]> {
  const response = await fetch(`${API_URL}/users/?skip=0&limit=100`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return await response.json();
}

// Hàm lấy chi tiết người dùng
export async function getUserById(id: string, token: string): Promise<User> {
  const response = await fetch(`${API_URL}/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  return await response.json();
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
    throw new Error("Failed to update user");
  }

  return await response.json();
}

// Hàm thay đổi trạng thái người dùng (kích hoạt/vô hiệu hóa)
export async function toggleUserStatus(
  id: string,
  isActive: boolean,
  token: string
): Promise<User> {
  return updateUser(id, { is_active: isActive }, token);
}

// Hàm thay đổi quyền admin
export async function toggleAdminStatus(
  id: string,
  isAdmin: boolean,
  token: string
): Promise<User> {
  return updateUser(id, { is_admin: isAdmin }, token);
}
