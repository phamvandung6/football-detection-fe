import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "@/lib/i18n/locales";

export default createMiddleware({
  // A list of all locales that are supported
  locales: locales,

  // Used when no locale matches
  defaultLocale,

  // This is the default: locales are represented as separate URL paths
  localePrefix: "as-needed",
});

export const config = {
  // Match all pathnames except for
  // - ... files in the public folder
  // - ... files with extensions (e.g. favicon.ico)
  // - ... the API route prefix
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
