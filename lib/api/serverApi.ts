import { API_URL } from "@/lib/utils";
import { cookies } from "next/headers";

/**
 * Loại method HTTP hỗ trợ
 */
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/**
 * Cấu hình request
 */
interface RequestConfig {
  cache?: RequestCache;
  headers?: HeadersInit;
  body?: any;
  next?: NextFetchRequestConfig;
}

/**
 * Định dạng chuẩn cho dữ liệu lỗi từ API
 */
interface ApiErrorResponse {
  message?: string;
  status?: number;
  error?: string;
  [key: string]: any;
}

/**
 * API Client cho Server Components
 * Tự động lấy token từ cookies và thêm vào headers
 */
export async function getServerApi() {
  // Lấy token từ cookies
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  // Hàm xử lý response
  async function handleResponse(response: Response) {
    if (response.ok) {
      const data = await response.json();
      return data.data || data; // Hỗ trợ cả API trả về { data: ... } hoặc trực tiếp data
    }

    // Xử lý lỗi
    if (response.status === 401 && refreshToken) {
      const refreshed = await refreshAccessToken(refreshToken);
      if (refreshed) {
        // Thử gọi lại API với token mới
        // Cài đặt này sẽ được triển khai sau
      }
    }

    const errorData = (await response
      .json()
      .catch(() => ({ message: "Unknown error" }))) as ApiErrorResponse;

    const errorMessage =
      errorData.message || errorData.error || "Unknown error";
    console.error(`[API Error] ${response.status}: ${errorMessage}`);
    throw new Error(errorMessage || `API error (${response.status})`);
  }

  /**
   * Thực hiện request API
   */
  async function fetchApi(
    url: string,
    method: HttpMethod = "GET",
    config: RequestConfig = {}
  ) {
    const fullUrl = url.startsWith("http") ? url : `${API_URL}${url}`;

    // Chuẩn bị headers sử dụng Headers class
    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    // Thêm token vào header nếu có
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // Thêm các headers bổ sung từ config
    if (config.headers) {
      const configHeaders =
        config.headers instanceof Headers
          ? config.headers
          : new Headers(config.headers as Record<string, string>);

      configHeaders.forEach((value, key) => {
        headers.set(key, value);
      });
    }

    // Chuẩn bị body nếu cần
    let bodyData = undefined;
    if (config.body) {
      if (headers.get("Content-Type") === "application/json") {
        bodyData = JSON.stringify(config.body);
      } else {
        bodyData = config.body; // Dành cho FormData
      }
    }

    // Thực hiện request
    console.log(`[Server API] ${method} ${fullUrl}`);
    const response = await fetch(fullUrl, {
      method,
      headers,
      body: bodyData,
      cache: config.cache || "no-store", // Mặc định không cache để đảm bảo dữ liệu mới
      ...config.next,
    });

    return handleResponse(response);
  }

  // Trả về các method cho từng loại HTTP request
  return {
    get: (url: string, config: RequestConfig = {}) =>
      fetchApi(url, "GET", config),
    post: (url: string, data: any, config: RequestConfig = {}) =>
      fetchApi(url, "POST", { ...config, body: data }),
    put: (url: string, data: any, config: RequestConfig = {}) =>
      fetchApi(url, "PUT", { ...config, body: data }),
    delete: (url: string, config: RequestConfig = {}) =>
      fetchApi(url, "DELETE", config),
    patch: (url: string, data: any, config: RequestConfig = {}) =>
      fetchApi(url, "PATCH", { ...config, body: data }),
  };
}

/**
 * Hàm refresh token (sẽ được cài đặt sau)
 */
async function refreshAccessToken(refreshToken: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`[Refresh Token Error] ${response.status}`);
      return false;
    }

    const data = await response.json();
    if (!data.success) {
      console.error(
        `[Refresh Token Failed] ${data.message || "No message provided"}`
      );
      return false;
    }

    // Cập nhật cookies với token mới
    const { accessToken, refreshToken: newRefreshToken } = data.data;
    const cookieStore = cookies();

    // Note: Trong Server Components, cookies() là read-only
    // Thực tế cần dùng NextResponse để set cookies hoặc dùng một server action
    // Điều này sẽ được cài đặt đầy đủ ở phần sau

    return true;
  } catch (error) {
    console.error("[Refresh Token Error]", error);
    return false;
  }
}
