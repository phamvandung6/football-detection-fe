"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Component bảo vệ route chỉ dành cho admin
 * Sử dụng component này để bọc các component chỉ admin mới có quyền truy cập
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Nếu đã tải xong và người dùng chưa đăng nhập, chuyển hướng đến trang đăng nhập
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    // Nếu đã tải xong, đã đăng nhập nhưng không phải admin, chuyển hướng đến trang chủ
    if (!isLoading && isAuthenticated && user && !user.is_admin) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router, user]);

  // Nếu đang tải, hiển thị trạng thái tải
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Nếu chưa đăng nhập hoặc không phải admin, không hiển thị nội dung
  if (!isAuthenticated || !user?.is_admin) {
    return null;
  }

  // Nếu đã đăng nhập và là admin, hiển thị nội dung
  return <>{children}</>;
}
