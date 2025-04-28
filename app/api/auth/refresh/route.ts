import { refreshTokenAction } from "@/app/[locale]/auth/refreshToken";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Lấy refresh token từ cookies
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "No refresh token found" },
        { status: 401 }
      );
    }

    // Gọi server action để refresh token
    const result = await refreshTokenAction(refreshToken);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || "Failed to refresh token",
        },
        { status: 401 }
      );
    }

    // Trả về token mới cho client (để client-side code có thể biết đã refresh thành công)
    return NextResponse.json({
      success: true,
      message: "Token refreshed successfully",
      newToken: result.newToken,
    });
  } catch (error) {
    console.error("[Refresh API Error]", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
