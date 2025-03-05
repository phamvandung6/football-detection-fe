import { defaultLocale, locales } from "@/lib/i18n/locales";
import { jwtDecode } from "jwt-decode";
import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

// Định nghĩa kiểu dữ liệu cho payload của token
interface TokenPayload {
  sub: string;
  email: string;
  is_admin: boolean;
  exp: number;
}

// Danh sách các route công khai (không cần đăng nhập)
// Bao gồm cả trang chủ có locale
const publicRoutes = ["/"];

// Danh sách các route auth (chỉ cho phép khi chưa đăng nhập)
const authRoutes = ["/auth/login", "/auth/register", "/auth/forgot-password"];

// Danh sách các route yêu cầu đăng nhập
const protectedRoutes = ["/upload", "/videos"];

// Danh sách các route chỉ dành cho admin
const adminRoutes = [
  "/admin",
  "/admin/users",
  "/admin/videos",
  "/admin/settings",
];

// Hàm kiểm tra token có hợp lệ không
function isValidToken(token: string): {
  isValid: boolean;
  payload?: TokenPayload;
  error?: string;
} {
  try {
    const decoded = jwtDecode<TokenPayload>(token);

    // Kiểm tra các trường bắt buộc của token
    if (
      !decoded.sub ||
      !decoded.email ||
      typeof decoded.is_admin !== "boolean"
    ) {
      return { isValid: false, error: "Missing required fields in token" };
    }

    // Kiểm tra token hết hạn
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return { isValid: false, error: "Token has expired" };
    }

    return { isValid: true, payload: decoded };
  } catch (error) {
    console.error("[Token Validation Error]:", error);
    return { isValid: false, error: "Invalid token format" };
  }
}

// Hàm kiểm tra route có match với pattern không
function matchRoute(pathname: string, patterns: string[]): boolean {
  // Xóa locale prefix nếu có (ví dụ: /vi/dashboard -> /dashboard)
  const pathWithoutLocale = pathname.replace(/^\/[^/]+\//, "/");

  // Nếu pathname sau khi xóa locale là rỗng hoặc chỉ có "/", chỉ match với "/"
  if (pathWithoutLocale === "" || pathWithoutLocale === "/") {
    return patterns.includes("/");
  }

  return patterns.some((route) => {
    // Xử lý đặc biệt cho root path "/"
    if (route === "/" && pathWithoutLocale !== "/") {
      return false;
    }
    return (
      pathWithoutLocale === route || pathWithoutLocale.startsWith(route + "/")
    );
  });
}

// Tạo middleware cho i18n - đặt ở đây để có thể sử dụng trong middleware chính
const intlMiddleware = createIntlMiddleware({
  locales: locales,
  defaultLocale,
  localePrefix: "always", // Luôn sử dụng prefix locale để tránh redirect loop
});

// Hàm lấy locale từ pathname
function getLocaleFromPath(pathname: string): string {
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return locale;
    }
  }
  return defaultLocale;
}

// Hàm kiểm tra xem pathname có chứa locale không
function hasLocaleInPath(pathname: string): boolean {
  return locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
}

// Hàm kiểm tra xem pathname có phải là trang chủ có locale không
function isHomePageWithLocale(pathname: string): boolean {
  return locales.some((locale) => pathname === `/${locale}`);
}

// Hàm kiểm tra và sửa callbackUrl để tránh redirect loop
function sanitizeCallbackUrl(callbackUrl: string | null): string | null {
  if (!callbackUrl) return null;

  try {
    // Giải mã URL nếu đã được mã hóa
    const decodedUrl = decodeURIComponent(callbackUrl);

    // Kiểm tra xem callbackUrl có chứa đường dẫn auth không
    if (decodedUrl.includes("/auth/")) {
      return null;
    }

    // Kiểm tra xem callbackUrl có chứa locale trùng lặp không
    for (const locale of locales) {
      const duplicateLocalePattern = new RegExp(`/${locale}/${locale}/`);
      if (duplicateLocalePattern.test(decodedUrl)) {
        // Loại bỏ locale trùng lặp
        return decodedUrl.replace(duplicateLocalePattern, `/${locale}/`);
      }
    }

    return decodedUrl;
  } catch (error) {
    console.error("Error sanitizing callback URL:", error);
    return null;
  }
}

export default async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  console.log("[Middleware] Processing request:", pathname);

  // Kiểm tra xem có phải là trang chủ có locale không
  const isHomePage = isHomePageWithLocale(pathname);

  // Nếu là trang chủ có locale, cho phép truy cập mà không cần kiểm tra thêm
  if (isHomePage) {
    return intlMiddleware(request);
  }

  // Kiểm tra và xử lý callbackUrl để tránh redirect loop
  const callbackUrl = searchParams.get("callbackUrl");
  const sanitizedCallback = sanitizeCallbackUrl(callbackUrl);

  // Nếu callbackUrl không hợp lệ hoặc đã được sửa đổi, tạo URL mới không có callbackUrl
  if (
    callbackUrl &&
    (!sanitizedCallback || sanitizedCallback !== callbackUrl)
  ) {
    const newUrl = new URL(request.nextUrl.pathname, request.url);

    // Sao chép tất cả các query params ngoại trừ callbackUrl
    searchParams.forEach((value, key) => {
      if (key !== "callbackUrl") {
        newUrl.searchParams.set(key, value);
      }
    });

    // Thêm callbackUrl đã được sửa nếu có
    if (sanitizedCallback) {
      newUrl.searchParams.set("callbackUrl", sanitizedCallback);
    }

    return NextResponse.redirect(newUrl);
  }

  // Xử lý locale trong URL
  if (!hasLocaleInPath(pathname) && pathname !== "/") {
    // Nếu URL không có locale, thêm locale mặc định vào URL
    const newUrl = new URL(`/${defaultLocale}${pathname}`, request.url);

    // Sao chép tất cả các query params
    searchParams.forEach((value, key) => {
      newUrl.searchParams.set(key, value);
    });

    return NextResponse.redirect(newUrl);
  }

  // Lấy locale từ URL
  const locale = getLocaleFromPath(pathname);

  // Lấy token từ cookie
  const token = request.cookies.get("auth_token")?.value;

  // Kiểm tra các loại route
  const isAuthRoute = matchRoute(pathname, authRoutes);
  const isPublicRoute = matchRoute(pathname, publicRoutes);
  const isProtectedRoute = matchRoute(pathname, protectedRoutes);
  const isAdminRoute = matchRoute(pathname, adminRoutes);

  // Nếu đã đăng nhập và cố truy cập route auth, chuyển hướng về trang chủ
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // Nếu là route công khai hoặc route auth, cho phép truy cập
  if (isPublicRoute || isAuthRoute) {
    return intlMiddleware(request);
  }

  // Nếu không có token, chuyển hướng đến trang đăng nhập
  if (!token) {
    const loginUrl = new URL(`/${locale}/auth/login`, request.url);

    // Chỉ thêm callbackUrl nếu không phải là trang auth và là đường dẫn hợp lệ
    if (!isAuthRoute && pathname !== `/${locale}/auth/login`) {
      // Lưu đường dẫn hiện tại làm callbackUrl, đảm bảo giữ nguyên locale
      loginUrl.searchParams.set("callbackUrl", pathname);
    }

    return NextResponse.redirect(loginUrl);
  }

  // Kiểm tra token có hợp lệ không
  const { isValid, payload, error } = isValidToken(token);

  if (!isValid) {
    // Log chi tiết lỗi để dễ debug
    console.error("[Middleware] Token validation failed:", {
      error,
      pathname,
      tokenPreview: token ? `${token.substring(0, 20)}...` : "no token",
    });

    // Nếu token không hợp lệ, xóa token và chuyển hướng đến trang đăng nhập
    const response = NextResponse.redirect(
      new URL(`/${locale}/auth/login`, request.url)
    );
    response.cookies.delete("auth_token");
    return response;
  }

  // Nếu là route admin, kiểm tra quyền admin
  if (isAdminRoute) {
    console.log("[Middleware] Admin route access:", {
      pathname,
      isAdmin: payload?.is_admin,
      userEmail: payload?.email,
    });

    // Kiểm tra quyền admin từ payload đã được validate
    if (!payload?.is_admin) {
      console.warn(
        "[Middleware] Access denied - Not an admin:",
        payload?.email
      );
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }
  }

  // Xử lý i18n và trả về response cho tất cả các route khác
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - ... files in the public folder
  // - ... files with extensions (e.g. favicon.ico)
  // - ... API routes
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
