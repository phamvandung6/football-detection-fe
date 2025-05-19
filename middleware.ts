import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, locales } from "./lib/i18n/locales";

// === Cấu hình Route ===
const publicRoutes = ["/"];
const authRoutes = ["/auth/login", "/auth/register", "/auth/forgot-password"];
const protectedRoutes = ["/dashboard", "/upload", "/videos"];
const adminRoutes = [
  "/admin",
  "/admin/users",
  "/admin/videos",
  "/admin/settings",
];

// === Regex để bỏ qua các đường dẫn ===
const PUBLIC_FILE = /\.(.*)$/;
const SKIPPED_PATHS = ["/api/", "/_next/"];

// === Hàm tiện ích ===

// Hàm kiểm tra route có match với pattern không (Đã cập nhật logic)
function matchPathname(
  pathname: string,
  patterns: string[]
): {
  match: boolean;
  pathnameWithoutLocale: string;
} {
  let pathnameWithoutLocale = pathname;
  const detectedLocale = locales.find((loc) => pathname.startsWith(`/${loc}/`));

  if (detectedLocale) {
    pathnameWithoutLocale =
      pathname.substring(detectedLocale.length + 1) || "/";
  } else if (
    pathname.startsWith("/") &&
    locales.includes(pathname.substring(1) as any) &&
    pathname.length === 3
  ) {
    pathnameWithoutLocale = "/";
  }

  let isMatch = false;
  if (pathnameWithoutLocale === "/") {
    isMatch = patterns.includes("/");
  } else {
    isMatch = patterns.some((route) => {
      if (route === "/" && pathnameWithoutLocale !== "/") return false;
      return (
        pathnameWithoutLocale === route ||
        pathnameWithoutLocale.startsWith(route + "/")
      );
    });
  }
  return { match: isMatch, pathnameWithoutLocale };
}

// Hàm sanitize callbackUrl (Đã cập nhật logic)
function sanitizeCallbackUrl(callbackUrl: string | null): string | null {
  if (!callbackUrl) return null;
  try {
    const decodedUrl = decodeURIComponent(callbackUrl);
    const urlObject = new URL(decodedUrl, "http://localhost"); // Cần base URL giả để parse
    let pathWithoutLocale = urlObject.pathname;

    const detectedLocale = locales.find((loc) =>
      pathWithoutLocale.startsWith(`/${loc}/`)
    );
    if (detectedLocale) {
      pathWithoutLocale =
        pathWithoutLocale.substring(detectedLocale.length + 1) || "/";
    } else if (
      pathWithoutLocale.startsWith("/") &&
      locales.includes(pathWithoutLocale.substring(1) as any) &&
      pathWithoutLocale.length === 3
    ) {
      pathWithoutLocale = "/";
    }

    if (
      authRoutes.some(
        (route) =>
          pathWithoutLocale === route ||
          pathWithoutLocale.startsWith(route + "/")
      )
    ) {
      // Lỗi nghiêm trọng vẫn nên log
      console.warn(
        "[Sanitize Callback] Removing callbackUrl pointing to auth route:",
        decodedUrl
      );
      return null;
    }
    return decodedUrl;
  } catch (error) {
    // Lỗi nghiêm trọng vẫn nên log
    console.error(
      "[Sanitize Callback Error]:",
      error,
      "Original URL:",
      callbackUrl
    );
    return null;
  }
}

// === Middleware chính ===

// Định nghĩa cấu hình i18n một lần
const i18nConfig = {
  locales,
  defaultLocale,
  localePrefix: "always" as const,
};

// Tạo middleware i18n
const handleI18nRouting = createMiddleware(i18nConfig);

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Khởi tạo i18n middleware
  const response = handleI18nRouting(request);
  const effectiveLocale =
    response.headers.get("x-middleware-request-nextintl-locale") ||
    defaultLocale;

  // Set X-NEXT-INTL-LOCALE header cho server actions
  // Đảm bảo luôn có giá trị hợp lệ bằng cách kiểm tra nếu locale không nằm trong danh sách
  const validLocale = locales.includes(effectiveLocale as any) 
    ? effectiveLocale 
    : defaultLocale;
  response.headers.set("X-NEXT-INTL-LOCALE", validLocale);

  // Kiểm tra xác thực bằng cách đọc trực tiếp từ cookie
  const authToken = request.cookies.get("auth_token")?.value;
  const isAuthenticated = !!authToken;

  // Xây dựng URL mới nếu cần redirect (để giữ locale)
  const newUrl = request.nextUrl.clone();

  // 1. Kiểm tra các route cần xác thực
  const isProtectedRoute = protectedRoutes.some(
    (route) =>
      pathname.startsWith(`/${effectiveLocale}${route}`) ||
      pathname.startsWith(route)
  );

  // 2. Kiểm tra các route chỉ dành cho người dùng chưa đăng nhập
  const isPublicOnlyRoute = authRoutes.some(
    (route) =>
      pathname.startsWith(`/${effectiveLocale}${route}`) ||
      pathname.startsWith(route)
  );

  // Người dùng chưa đăng nhập nhưng đang cố truy cập route được bảo vệ
  if (isProtectedRoute && !isAuthenticated) {
    newUrl.pathname = `/${validLocale}/auth/login`;
    return NextResponse.redirect(newUrl);
  }

  // Người dùng đã đăng nhập nhưng đang cố truy cập các route chỉ dành cho người chưa đăng nhập
  if (isPublicOnlyRoute && isAuthenticated) {
    newUrl.pathname = `/${validLocale}`;
    return NextResponse.redirect(newUrl);
  }

  // Trả về response với header X-NEXT-INTL-LOCALE đã được thiết lập
  return response;
}

// Đảm bảo bạn có export config.matcher phù hợp
export const config = {
  // Matcher cập nhật để loại trừ tài nguyên tĩnh
  matcher: [
    // Áp dụng cho tất cả các đường dẫn trừ những đường dẫn tĩnh/api
    "/((?!api|_next/static|_next/image|images|videos|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
