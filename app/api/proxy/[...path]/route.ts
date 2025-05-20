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
  const awaitedParams = await params;
  return handleApiRequest(request, awaitedParams.path, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const awaitedParams = await params;
  return handleApiRequest(request, awaitedParams.path, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const awaitedParams = await params;
  return handleApiRequest(request, awaitedParams.path, "PUT");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const awaitedParams = await params;
  return handleApiRequest(request, awaitedParams.path, "DELETE");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const awaitedParams = await params;
  return handleApiRequest(request, awaitedParams.path, "PATCH");
}

// Helper để log với timestamp
const log = (message: string, ...data: any[]) => {
  console.log(`[API Proxy ${new Date().toISOString()}]`, message, ...data);
};

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

    // Kiểm tra nếu đây là endpoint processing-status hoặc download
    const isProcessingStatusEndpoint = path.includes("processing-status");
    const isDownloadEndpoint = path.includes("/download/");
    
    if (isProcessingStatusEndpoint) {
      log(`Processing status request for path: ${path}`);
    } else if (isDownloadEndpoint) {
      log(`Download request for path: ${path}`);
    } else {
      log(`Raw request to: ${apiUrl}, method: ${method}`);
    }

    // Lấy token từ cookies
    const cookieStore = await cookies();
    let token = cookieStore.get("auth_token")?.value;
    const refreshToken = cookieStore.get("refresh_token")?.value;

    // Nếu không có token và có refresh token, thử refresh
    if (!token && refreshToken) {
      log("No token found, attempting to refresh");
      const refreshResult = await refreshTokenAction(refreshToken);
      if (refreshResult.success && refreshResult.newToken) {
        token = refreshResult.newToken;
      }
    }

    // Chuẩn bị headers cho request đến backend
    const headers = new Headers();

    // Đặt content-type dựa trên request gốc (đặc biệt quan trọng cho multipart)
    const originalContentType = request.headers.get("content-type") || "application/json";
    
    if (isProcessingStatusEndpoint) {
      log(`Processing status request content-type: ${originalContentType}`);
      // Đảm bảo không sử dụng cache cho request status
      headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      headers.set('Pragma', 'no-cache');
      headers.set('Expires', '0');
    } else {
      log(`Original Content-Type: ${originalContentType}`);
    }
    
    // Không đặt Content-Type cho multipart/form-data request, để fetch API tự động xử lý boundary
    if (!originalContentType.includes("multipart/form-data")) {
      headers.set("Content-Type", originalContentType);
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // Copy các header cần thiết từ request của client
    for (const [key, value] of request.headers.entries()) {
      if (
        !["host", "connection", "content-length", "content-type"].includes(key.toLowerCase())
      ) {
        headers.set(key, value);
      }
    }

    // Đọc body nếu cần
    let body = null;
    const contentType = request.headers.get("content-type") || "";

    if (method !== "GET" && method !== "HEAD") {
      // Xử lý đặc biệt cho multipart/form-data
      if (contentType.includes("multipart/form-data")) {
        body = await request.formData();
        log("Processing multipart/form-data request");
        
        // Log FormData fields để debug
        log("FormData fields:");
        for (const pair of body.entries()) {
          const [key, value] = pair;
          if (value instanceof File) {
            log(`- ${key}: File (name: ${value.name}, size: ${value.size}, type: ${value.type})`);
          } else {
            log(`- ${key}: ${value}`);
          }
        }

        try {
          // Gửi request đến backend
          log(`${method} ${apiUrl} (multipart)`);
          const response = await fetch(apiUrl, {
            method,
            headers,
            body, // FormData được truyền trực tiếp, không cần JSON.stringify
            redirect: "follow" as RequestRedirect,
          });

          log(`Response status: ${response.status}`);
          
          // Xử lý response
          let responseData;
          try {
            responseData = await response.json();
            log(`Response data:`, responseData);
          } catch (e) {
            console.error("Failed to parse response as JSON:", e);
            responseData = {};
          }

          return NextResponse.json(responseData, {
            status: response.status,
            headers: {
              "Content-Type": "application/json",
            },
          });
        } catch (error) {
          console.error("Error sending multipart request:", error);
          throw error;
        }
      } 
      // Xử lý các loại content-type khác
      else if (contentType.includes("application/json")) {
        body = await request.json();
      } else {
        body = await request.text();
      }
    }

    // Kiểm tra nếu không phải request multipart (đã xử lý ở trên)
    if (!(contentType.includes("multipart/form-data") && body)) {
      // Gửi request đến backend
      if (isProcessingStatusEndpoint) {
        log(`Sending processing status request: ${method} ${apiUrl}`);
      } else {
        log(`${method} ${apiUrl}`);
      }
      
      const response = await fetch(apiUrl, {
        method,
        headers,
        body: body
          ? typeof body === "string"
            ? body
            : JSON.stringify(body)
          : null,
        redirect: "follow" as RequestRedirect,
        cache: isProcessingStatusEndpoint ? 'no-store' : undefined,
      });

      // Đặc biệt log chi tiết cho endpoint processing-status
      if (isProcessingStatusEndpoint) {
        log(`Processing status response received: ${response.status}`);
        
        try {
          const responseData = await response.json();
          log(`Processing status response data:`, responseData);
          
          // Kiểm tra nếu response có định dạng đúng
          if (responseData.data && typeof responseData.data.progress === 'number') {
            log(`Validated processing progress: ${responseData.data.progress}%, status: ${responseData.data.status}`);
          } else {
            log(`Invalid processing status format:`, responseData);
          }
          
          return NextResponse.json(responseData, {
            status: response.status,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache, no-store, must-revalidate",
            },
          });
        } catch (e) {
          log(`Failed to parse processing status response as JSON:`, e);
          return NextResponse.json(
            { success: false, message: "Invalid response format from server" },
            { status: 500 }
          );
        }
      }
      
      // Xử lý đặc biệt cho endpoint download
      if (isDownloadEndpoint) {
        log(`Download response received: ${response.status}`);
        
        if (response.status === 200) {
          try {
            const responseData = await response.json();
            log(`Download response data structure:`, 
                typeof responseData === 'object' ? Object.keys(responseData) : typeof responseData);
            
            // Trường hợp 1: Response là ApiResponse<string> với URL trong trường data
            if (responseData && typeof responseData === 'object' && responseData.success && responseData.data) {
              log(`Found download URL in response.data:`, responseData.data);
              return NextResponse.json(responseData, { 
                status: 200,
                headers: { "Content-Type": "application/json" }
              });
            }
            
            // Trường hợp 2: Response trực tiếp là URL dạng string
            if (typeof responseData === 'string' && responseData.includes('http')) {
              log(`Response is direct URL string:`, responseData);
              return NextResponse.json({ success: true, data: responseData }, { 
                status: 200,
                headers: { "Content-Type": "application/json" }
              });
            }
            
            // Trả về response như nhận được
            log(`Returning original response data`);
            return NextResponse.json(responseData, {
              status: response.status,
              headers: { "Content-Type": "application/json" }
            });
          } catch (e) {
            log(`Failed to parse download response as JSON, might be binary data:`, e);
            
            // Trả về lỗi
            return NextResponse.json(
              { 
                success: false, 
                message: "Download endpoint did not return valid JSON with a URL" 
              },
              { status: 500 }
            );
          }
        } else {
          // Xử lý trường hợp error response
          log(`Download endpoint returned error status: ${response.status}`);
          const errorData = await response.json().catch(() => ({
            success: false,
            message: `Download failed with status ${response.status}`
          }));
          
          return NextResponse.json(errorData, {
            status: response.status,
            headers: { "Content-Type": "application/json" }
          });
        }
      }

      // Xử lý khi token hết hạn (401)
      if (response.status === 401 && refreshToken) {
        log("Received 401, attempting to refresh token");
        const refreshResult = await refreshTokenAction(refreshToken);

        if (refreshResult.success && refreshResult.newToken) {
          // Thử lại request với token mới
          headers.set("Authorization", `Bearer ${refreshResult.newToken}`);
          log("Retrying with new token");

          const retryResponse = await fetch(apiUrl, {
            method,
            headers,
            body: body
              ? typeof body === "string"
                ? body
                : JSON.stringify(body)
              : null,
            redirect: "follow" as RequestRedirect,
          });

          return NextResponse.json(await retryResponse.json(), {
            status: retryResponse.status,
            headers: {
              "Content-Type": "application/json",
            },
          });
        } else {
          // Nếu refresh token cũng thất bại, trả về lỗi 401
          log("Failed to refresh token");
        }
      }

      // Trả về response từ backend API (cho các endpoint không phải processing-status hoặc download)
      if (!isProcessingStatusEndpoint && !isDownloadEndpoint) {
        const responseData = await response.json().catch(() => ({}));
        return NextResponse.json(responseData, {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
    }

    // Thêm return mặc định cho TypeScript
    return NextResponse.json(
      {
        success: false,
        message: "Unexpected execution path",
      },
      { status: 500 }
    );
  } catch (error) {
    log("API Proxy Error", error);
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
