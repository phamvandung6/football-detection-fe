import { defineRouting } from "next-intl/routing";
import { defaultLocale, locales } from "./locales";

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Luôn hiển thị tiền tố locale trong URL
  localePrefix: "always",
});
