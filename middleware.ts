import { defaultLocale, locales } from "@/lib/i18n/locales";
import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

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
      console.warn(
        "[Sanitize Callback] Removing callbackUrl pointing to auth route:",
        decodedUrl
      );
      return null;
    }
    return decodedUrl;
  } catch (error) {
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
  // --- Bước 1: Để next-intl xử lý routing và locale trước ---
  // Nó sẽ tự động redirect từ '/' sang '/{locale}' nếu localePrefix là 'always'
  // và xử lý các prefix locale khác.
  const i18nResponse = handleI18nRouting(request);

  // Nếu next-intl trả về một response (ví dụ: redirect), trả về nó ngay lập tức.
  // Lưu ý: Kiểm tra response có tồn tại và có status code là redirect (3xx) hoặc rewrite (200 nhưng có header x-middleware-rewrite)
  // Cách kiểm tra đơn giản nhất là xem nó có phải là NextResponse không và có header đặc biệt không,
  // nhưng thường thì nếu next-intl cần làm gì đó, nó sẽ trả về một response khác với request ban đầu.
  // Để đơn giản, chúng ta có thể giả định nếu nó trả về response, thì đó là response cuối cùng từ góc độ i18n.
  // Tuy nhiên, cần cẩn thận vì nó có thể chỉ rewrite URL trong request mà không trả về response mới.
  // -> Cách an toàn hơn là thực hiện logic auth SAU KHI i18n đã chạy và có thể đã sửa đổi request.

  // Chạy i18n middleware để nó có thể sửa đổi request (ví dụ: thêm locale vào nextUrl)
  // Chúng ta sẽ không return response từ đây ngay mà để logic auth quyết định.
  // i18nMiddleware(request); // Gọi lại hàm gốc có vẻ không đúng nếu dùng createMiddleware

  // --> Cách tiếp cận tốt hơn: Để i18n chạy và lấy response/request đã được sửa đổi từ nó.
  const response = handleI18nRouting(request);

  // Nếu i18n thực hiện redirect (ví dụ: từ / sang /en), response.headers sẽ có 'location'.
  if (response.headers.has("location")) {
    console.log(
      "[Middleware] i18n redirected request. Returning i18n response."
    );
    return response; // Trả về redirect của i18n
  }
  // Nếu i18n chỉ rewrite URL (ví dụ: thêm locale), response sẽ là request đã sửa đổi.

  // --- Bước 2: Logic xác thực và chuyển hướng tùy chỉnh (chạy sau i18n) ---
  const token = request.cookies.get("auth_token")?.value;
  // Lấy thông tin từ request CÓ THỂ đã được i18n sửa đổi
  const currentFullUrl = request.url;
  const currentPathname = request.nextUrl.pathname; // Pathname này có thể đã có locale prefix
  const effectiveLocale = request.nextUrl.locale || defaultLocale; // Lấy locale mà i18n đã xác định

  const { match: isAuthRoute, pathnameWithoutLocale } = matchPathname(
    currentPathname,
    authRoutes
  );
  const { match: isPublicRoute } = matchPathname(currentPathname, publicRoutes);
  const { match: isProtectedRoute } = matchPathname(
    currentPathname,
    protectedRoutes
  );
  const { match: isAdminRoute } = matchPathname(currentPathname, adminRoutes);

  console.log(
    `[Middleware] After i18n: Path=${currentPathname}, Path w/o locale=${pathnameWithoutLocale}, Locale=${effectiveLocale}`
  );
  console.log(
    `[Middleware] Route checks: Auth=${isAuthRoute}, Public=${isPublicRoute}, Protected=${isProtectedRoute}, Admin=${isAdminRoute}`
  );

  // Xử lý Callback URL (có thể giữ nguyên)
  const originalCallbackUrl = request.nextUrl.searchParams.get("callbackUrl");
  const sanitizedCallback = sanitizeCallbackUrl(originalCallbackUrl);

  if (originalCallbackUrl && sanitizedCallback !== originalCallbackUrl) {
    console.log(
      `[Middleware] Sanitizing callbackUrl: "${originalCallbackUrl}" -> "${sanitizedCallback}"`
    );
    const newUrl = new URL(currentPathname, currentFullUrl);
    request.nextUrl.searchParams.forEach((value, key) => {
      if (key !== "callbackUrl") newUrl.searchParams.set(key, value);
    });
    if (sanitizedCallback)
      newUrl.searchParams.set("callbackUrl", sanitizedCallback);
    return NextResponse.redirect(newUrl); // Redirect ngay
  }

  // Logic chuyển hướng chính
  if (token && isAuthRoute) {
    console.log("[Middleware] Redirecting logged-in user from auth route.");
    // Chuyển hướng về trang gốc có locale
    return NextResponse.redirect(new URL(`/${effectiveLocale}`, request.url));
  }

  if (!token && (isProtectedRoute || isAdminRoute)) {
    console.log(
      "[Middleware] No token, redirecting to login for protected/admin route."
    );
    const loginUrl = new URL(`/${effectiveLocale}/auth/login`, request.url);
    const validCallback = sanitizeCallbackUrl(currentFullUrl); // Dùng URL hiện tại (có thể đã có locale)
    if (validCallback) {
      loginUrl.searchParams.set("callbackUrl", validCallback);
      console.log(
        `[Middleware] Adding callbackUrl to login redirect: ${validCallback}`
      );
    }
    return NextResponse.redirect(loginUrl);
  }

  // Nếu không có redirect nào ở trên, trả về response gốc từ i18n
  // (có thể đã được rewrite hoặc là NextResponse.next() ngầm định)
  console.log(
    "[Middleware] No auth redirect needed. Allowing request processed by i18n to proceed for path:",
    currentPathname
  );
  return response; // Trả về response cuối cùng (có thể là request đã rewrite hoặc response gốc)
}

// Đảm bảo bạn có export config.matcher phù hợp
export const config = {
  // Matcher chuẩn, không loại trừ '/'
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
