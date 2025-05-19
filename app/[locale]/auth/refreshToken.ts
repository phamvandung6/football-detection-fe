"use server";

import { API_URL } from "@/lib/utils";
import { cookies } from "next/headers";

interface RefreshResponse {
  success: boolean;
  message?: string;
  newToken?: string;
}

/**
 * Server Action để refresh token
 * Được gọi khi access token hết hạn
 */
export async function refreshTokenAction(
  refreshToken: string
): Promise<RefreshResponse> {
  if (!refreshToken) {
    return { success: false, message: "No refresh token provided" };
  }

  try {
    // Gọi API refresh token
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`[Refresh Token] API error: ${response.status}`);
      return {
        success: false,
        message: `Failed to refresh token: ${response.status}`,
      };
    }

    const data = await response.json();

    if (!data.success) {
      console.error(`[Refresh Token] Failed: ${data.message}`);
      return { success: false, message: data.message };
    }

    // Lấy token mới từ response
    const { accessToken, refreshToken: newRefreshToken } = data.data;

    // Cập nhật cookies
    const cookieStore = await cookies();
    const secure = process.env.NODE_ENV === "production";

    cookieStore.set("auth_token", accessToken, {
      httpOnly: true,
      secure: secure,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    if (newRefreshToken) {
      cookieStore.set("refresh_token", newRefreshToken, {
        httpOnly: true,
        secure: secure,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    console.log("[Refresh Token] Successfully refreshed access token");

    return {
      success: true,
      newToken: accessToken,
    };
  } catch (error) {
    console.error("[Refresh Token] Error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An unknown error occurred while refreshing token",
    };
  }
}
