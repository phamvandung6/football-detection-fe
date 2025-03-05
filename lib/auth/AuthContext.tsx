"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { API_URL } from "@/lib/utils";
import Cookies from "js-cookie";

// Định nghĩa kiểu dữ liệu cho User
export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  last_login: string | null;
}

// Định nghĩa kiểu dữ liệu cho AuthState
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Định nghĩa kiểu dữ liệu cho AuthContext
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    fullName: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

// Tạo context với giá trị mặc định
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Khởi tạo auth state từ cookie khi component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = Cookies.get("auth_token");
        if (token) {
          const user = await fetchCurrentUser(token);
          setState({
            user,
            token,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setState({
            user: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        Cookies.remove("auth_token");
        setState({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    initializeAuth();
  }, []);

  // Hàm đăng nhập
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Login failed");
      }

      const data = await response.json();
      const { access_token, user } = data;

      // Lưu token vào cookie
      Cookies.set("auth_token", access_token, {
        expires: 7, // Hết hạn sau 7 ngày
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      // Cập nhật state
      setState({
        user,
        token: access_token,
        isLoading: false,
        isAuthenticated: true,
      });

      toast.success("Đăng nhập thành công");
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error instanceof Error ? error.message : "Đăng nhập thất bại"
      );
      return false;
    }
  };

  // Hàm đăng ký
  const register = async (
    fullName: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          full_name: fullName,
          password,
          is_active: true,
          is_admin: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Registration failed");
      }

      toast.success("Đăng ký thành công. Vui lòng đăng nhập.");
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error instanceof Error ? error.message : "Đăng ký thất bại");
      return false;
    }
  };

  // Hàm đăng xuất
  const logout = () => {
    Cookies.remove("auth_token", { path: "/" });
    setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
    toast.info("Đã đăng xuất");
  };

  // Hàm lấy thông tin người dùng hiện tại
  const fetchCurrentUser = async (token: string): Promise<User> => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }

    return await response.json();
  };

  // Hàm làm mới thông tin người dùng
  const refreshUser = async (): Promise<void> => {
    if (!state.token) return;

    try {
      const user = await fetchCurrentUser(state.token);
      setState((prev) => ({
        ...prev,
        user,
      }));
    } catch (error) {
      console.error("Failed to refresh user:", error);
      if (error instanceof Error && error.message === "Failed to fetch user") {
        logout();
      }
    }
  };

  // Giá trị context
  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// Hook để sử dụng AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
