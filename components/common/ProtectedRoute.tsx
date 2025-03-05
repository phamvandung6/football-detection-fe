"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Component bảo vệ route yêu cầu đăng nhập
 * Sử dụng component này để bọc các component cần xác thực
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Nếu đã tải xong và người dùng chưa đăng nhập, chuyển hướng đến trang đăng nhập
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Nếu đang tải, hiển thị trạng thái tải
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Nếu chưa đăng nhập, không hiển thị nội dung
  if (!isAuthenticated) {
    return null;
  }

  // Nếu đã đăng nhập, hiển thị nội dung
  return <>{children}</>;
}
