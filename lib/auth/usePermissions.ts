"use client";

import { useAuth } from "./AuthContext";

/**
 * Hook để kiểm tra quyền truy cập
 * @returns Các hàm kiểm tra quyền truy cập
 */
export function usePermissions() {
  const { user, isAuthenticated } = useAuth();

  /**
   * Kiểm tra xem người dùng có phải là admin không
   * @returns true nếu người dùng là admin, false nếu không phải
   */
  const isAdmin = (): boolean => {
    return isAuthenticated && user?.is_admin === true;
  };

  /**
   * Kiểm tra xem người dùng có phải là chủ sở hữu của tài nguyên không
   * @param resourceUserId ID của người dùng sở hữu tài nguyên
   * @returns true nếu người dùng là chủ sở hữu, false nếu không phải
   */
  const isOwner = (resourceUserId: string): boolean => {
    return isAuthenticated && user?.id === resourceUserId;
  };

  /**
   * Kiểm tra xem người dùng có quyền chỉnh sửa tài nguyên không
   * @param resourceUserId ID của người dùng sở hữu tài nguyên
   * @returns true nếu người dùng có quyền chỉnh sửa, false nếu không có quyền
   */
  const canEdit = (resourceUserId: string): boolean => {
    return isAdmin() || isOwner(resourceUserId);
  };

  /**
   * Kiểm tra xem người dùng có quyền xóa tài nguyên không
   * @param resourceUserId ID của người dùng sở hữu tài nguyên
   * @returns true nếu người dùng có quyền xóa, false nếu không có quyền
   */
  const canDelete = (resourceUserId: string): boolean => {
    return isAdmin() || isOwner(resourceUserId);
  };

  return {
    isAdmin,
    isOwner,
    canEdit,
    canDelete,
  };
}
