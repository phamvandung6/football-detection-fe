import { refreshTokenAction } from "@/app/[locale]/auth/refreshToken";
import { API_URL } from "@/lib/utils";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * API Proxy Route
 * Chuyển tiếp request từ client đến backend API
 * Tự động thêm token và xử lý refresh token
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleApiRequest(request, params.path, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleApiRequest(request, params.path, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleApiRequest(request, params.path, "PUT");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleApiRequest(request, params.path, "DELETE");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleApiRequest(request, params.path, "PATCH");
}

/**
 * Xử lý request API và thêm token
 */
async function handleApiRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
): Promise<NextResponse> {
  try {
    // Tạo URL tới backend API
    const path = pathSegments.join("/");
    const queryString = request.nextUrl.search;
    const apiUrl = `${API_URL}/${path}${queryString}`;

    // Lấy token từ cookies
    const cookieStore = await cookies();
    let token = cookieStore.get("auth_token")?.value;
    const refreshToken = cookieStore.get("refresh_token")?.value;

    // Nếu không có token và có refresh token, thử refresh
    if (!token && refreshToken) {
      console.log("[API Proxy] No token found, attempting to refresh");
      const refreshResult = await refreshTokenAction(refreshToken);
      if (refreshResult.success && refreshResult.newToken) {
        token = refreshResult.newToken;
      }
    }

    // Chuẩn bị headers cho request đến backend
    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // Copy các header cần thiết từ request của client
    for (const [key, value] of request.headers.entries()) {
      if (
        !["host", "connection", "content-length"].includes(key.toLowerCase())
      ) {
        headers.set(key, value);
      }
    }

    // Đọc body nếu cần
    let body = null;
    if (method !== "GET" && method !== "HEAD") {
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        body = await request.json();
      } else if (contentType.includes("multipart/form-data")) {
        body = await request.formData();
      } else {
        body = await request.text();
      }
    }

    // Gửi request đến backend
    console.log(`[API Proxy] ${method} ${apiUrl}`);
    const response = await fetch(apiUrl, {
      method,
      headers,
      body: body
        ? typeof body === "string"
          ? body
          : JSON.stringify(body)
        : null,
      redirect: "follow",
    });

    // Xử lý khi token hết hạn (401)
    if (response.status === 401 && refreshToken) {
      console.log("[API Proxy] Received 401, attempting to refresh token");
      const refreshResult = await refreshTokenAction(refreshToken);

      if (refreshResult.success && refreshResult.newToken) {
        // Thử lại request với token mới
        headers.set("Authorization", `Bearer ${refreshResult.newToken}`);
        console.log("[API Proxy] Retrying with new token");

        const retryResponse = await fetch(apiUrl, {
          method,
          headers,
          body: body
            ? typeof body === "string"
              ? body
              : JSON.stringify(body)
            : null,
          redirect: "follow",
        });

        return NextResponse.json(await retryResponse.json(), {
          status: retryResponse.status,
          headers: {
            "Content-Type": "application/json",
          },
        });
      } else {
        // Nếu refresh token cũng thất bại, trả về lỗi 401
        console.error("[API Proxy] Failed to refresh token");
      }
    }

    // Trả về response từ backend API
    const responseData = await response.json().catch(() => ({}));

    return NextResponse.json(responseData, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[API Proxy Error]", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
