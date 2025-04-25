"use client";

// import { useAuth } from "./AuthContext"; // Xóa import cũ
import { useAuthSession } from "./useAuthSession"; // Import hook mới

/**
 * Hook để kiểm tra quyền truy cập dựa trên session hiện tại
 * @returns Các hàm kiểm tra quyền truy cập
 */
export function usePermissions() {
  // Lấy user và trạng thái xác thực từ hook session
  const { user, isAuthenticated } = useAuthSession();

  /**
   * Kiểm tra xem người dùng có phải là admin không
   * Dựa vào mảng roles trong user object
   * @returns true nếu người dùng là admin, false nếu không phải
   */
  const isAdmin = (): boolean => {
    // Kiểm tra xem mảng roles có tồn tại và chứa 'admin' không
    return isAuthenticated && Array.isArray(user?.roles) && user.roles.includes('admin');
  };

  /**
   * Kiểm tra xem người dùng có phải là chủ sở hữu của tài nguyên không
   * @param resourceUserId ID của người dùng sở hữu tài nguyên
   * @returns true nếu người dùng là chủ sở hữu, false nếu không phải
   */
  const isOwner = (resourceUserId: string | undefined): boolean => {
    // Thêm kiểm tra resourceUserId không phải undefined
    return isAuthenticated && !!resourceUserId && user?.id === resourceUserId;
  };

  /**
   * Kiểm tra xem người dùng có quyền chỉnh sửa tài nguyên không
   * @param resourceUserId ID của người dùng sở hữu tài nguyên (optional)
   * @returns true nếu người dùng có quyền chỉnh sửa, false nếu không có quyền
   */
  const canEdit = (resourceUserId?: string): boolean => {
    // Nếu là admin thì luôn có quyền
    // Nếu không phải admin, chỉ có quyền nếu là chủ sở hữu
    return isAdmin() || (!!resourceUserId && isOwner(resourceUserId));
  };

  /**
   * Kiểm tra xem người dùng có quyền xóa tài nguyên không
   * @param resourceUserId ID của người dùng sở hữu tài nguyên (optional)
   * @returns true nếu người dùng có quyền xóa, false nếu không có quyền
   */
  const canDelete = (resourceUserId?: string): boolean => {
     // Logic tương tự canEdit, có thể điều chỉnh nếu cần
    return isAdmin() || (!!resourceUserId && isOwner(resourceUserId));
  };

  return {
    isAdmin,
    isOwner,
    canEdit,
    canDelete,
    // Có thể thêm isLoading từ useAuthSession nếu component cần biết
    // isLoadingPermissions: isLoading 
  };
}
