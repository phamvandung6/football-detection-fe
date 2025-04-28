"use client";

import { User } from "@/types/user";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import axios from "axios";

interface SessionData {
  isAuthenticated: boolean;
  user: User | null;
}

/**
 * Fetch thông tin phiên đăng nhập từ API
 * Lưu ý: Sử dụng axios trực tiếp vì đây là gọi đến Next.js API route, không phải backend
 */
const fetchSession = async (): Promise<SessionData> => {
  try {
    // Sử dụng axios trực tiếp thay vì apiClient
    // vì đây là gọi đến Next.js API route, không phải backend
    const { data } = await axios.get<SessionData>("/api/auth/session");

    // Log để debug
    console.log("[Auth] Fetched session data:", data.isAuthenticated);

    return data;
  } catch (error) {
    console.error("[Auth] Error fetching session:", error);
    return { isAuthenticated: false, user: null };
  }
};

/**
 * Hook cung cấp thông tin xác thực và các helpers
 */
export function useAuthSession() {
  const query: UseQueryResult<SessionData, Error> = useQuery<
    SessionData,
    Error
  >({
    queryKey: ["authSession"],
    queryFn: fetchSession,
    staleTime: 5 * 60 * 1000, // 5 phút
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const { data, isLoading, isError, error, refetch, isFetching } = query;

  /**
   * Lấy user role với default fallback
   */
  const getUserRole = (): string => {
    if (!data?.user?.roles || data.user.roles.length === 0) {
      return "USER";
    }
    return data.user.roles[0];
  };

  /**
   * Kiểm tra xem user có quyền hay không
   */
  const hasRole = (role: string): boolean => {
    if (!data?.isAuthenticated || !data.user?.roles) {
      return false;
    }
    return data.user.roles.includes(role);
  };

  /**
   * Lấy Authorization header để gọi API
   */
  const getAuthHeader = () => {
    // Token được quản lý bởi cookie HTTP-only
    // Lưu ý: Client không cần biết token thực tế,
    // vì nó được tự động xử lý bởi API proxy
    return {};
  };

  return {
    // Dữ liệu phiên
    session: data ?? { isAuthenticated: false, user: null },
    user: data?.user ?? null,
    isAuthenticated: data?.isAuthenticated ?? false,

    // Trạng thái query
    isLoading,
    isError,
    error,
    isFetchingSession: isFetching,

    // Helpers
    refetchSession: refetch,
    getUserRole,
    hasRole,
    getAuthHeader,

    // Query nguyên bản (nếu cần truy cập trực tiếp)
    query,
  };
}
