import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";

// Biến lưu trạng thái đang refresh token
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;
// Queue các request bị lỗi 401 để retry sau khi refresh token
const failedRequests: {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}[] = [];

/**
 * Interface mô tả cấu trúc dữ liệu lỗi API
 */
interface ApiErrorResponse {
  message?: string;
  error?: string;
  status?: number;
  [key: string]: any;
}

/**
 * Tạo một axios client instance với cấu hình mặc định
 */
export const createApiClient = (): AxiosInstance => {
  const axiosInstance = axios.create({
    baseURL: "/api/proxy", // Sử dụng API route proxy thay vì gọi trực tiếp API_URL
    timeout: 15000, // 15 giây timeout
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor - thực hiện trước mỗi request
  axiosInstance.interceptors.request.use(
    (config) => {
      // Token được xử lý tự động bởi API route proxy (không cần thêm ở đây)
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => {
      console.error("[API Request Error]", error);
      return Promise.reject(error);
    }
  );

  // Response interceptor - xử lý sau mỗi response
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Dự án này trả về data trong { data: ... }
      // Giải nén để client không cần .data.data
      if (response.data && response.data.data !== undefined) {
        return {
          ...response,
          data: response.data.data,
        };
      }
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config;
      if (!originalRequest) {
        return Promise.reject(error);
      }

      // Kiểm tra nếu lỗi 401 (Unauthorized) và chưa thử lại
      if (error.response?.status === 401 && !(originalRequest as any)._retry) {
        console.log("[API] Got 401 error, attempting to refresh token");

        // Đánh dấu request này đã thử refresh
        (originalRequest as any)._retry = true;

        try {
          // Gọi API route để refresh token
          const newToken = await refreshAccessToken();

          if (newToken) {
            console.log("[API] Token refreshed, retrying request");
            // Retry request với token mới (tự động qua API route)
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          console.error("[API] Failed to refresh token", refreshError);
          // Chuyển hướng đến trang login nếu cần
          window.location.href = "/auth/login";
          return Promise.reject(refreshError);
        }
      }

      // Xử lý các lỗi khác
      const errorResponse = error.response?.data as
        | ApiErrorResponse
        | undefined;
      const errorMessage =
        errorResponse?.message ||
        errorResponse?.error ||
        error.message ||
        "Unknown error";

      console.error(
        `[API Error] ${error.response?.status || "Unknown"}: ${errorMessage}`
      );
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

/**
 * Hàm refresh token
 * Tạo một promise singleton để nhiều request cùng sử dụng
 */
async function refreshAccessToken(): Promise<string | null> {
  // Nếu đang refresh, trả về promise hiện tại
  if (isRefreshing) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = new Promise<string | null>(async (resolve, reject) => {
    try {
      // Gọi API route refresh token
      const { data } = await axios.post("/api/auth/refresh");

      if (data.success && data.newToken) {
        resolve(data.newToken);

        // Process các request bị lỗi 401 trước đó
        failedRequests.forEach((request) => request.resolve(data.newToken));
      } else {
        resolve(null);
        failedRequests.forEach((request) =>
          request.reject(new Error("Failed to refresh token"))
        );
      }
    } catch (error) {
      console.error("[Token Refresh Error]", error);
      reject(error);
      failedRequests.forEach((request) => request.reject(error));
    } finally {
      // Reset trạng thái
      isRefreshing = false;
      refreshPromise = null;
      failedRequests.length = 0;
    }
  });

  return refreshPromise;
}

// Export API client singleton
export const apiClient = createApiClient();
