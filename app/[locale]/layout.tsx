import { locales } from "@/lib/i18n/locales";
import { ReactQueryProvider } from "@/providers/query-provider";
import { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { Toaster } from "sonner";
import { defaultMetadata, viewport } from "./metadata";
import { SiteLayout } from "./site-layout";

// Metadata cho layout
export const metadata: Metadata = defaultMetadata;

// Export viewport
export { viewport };

// // Import các file ngôn ngữ (Xóa import tĩnh)
// import en from "@/lib/i18n/messages/en.json";
// import vi from "@/lib/i18n/messages/vi.json";

// const messages = {
//   en,
//   vi,
// };

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Explicitly await the params object as required by Next.js
  const awaitedParams = await params;
  const locale = awaitedParams.locale;

  // Debug log right after getting locale
  // console.log(`[LocaleLayout] Received locale after await: ${locale}`);

  // Validate locale
  if (!locales.includes(locale as any)) {
    // console.error(`[LocaleLayout] Locale validation failed for: ${locale}`);
    notFound();
  }

  // Lấy messages động, truyền locale tường minh
  let messages;
  try {
    // console.log(
    //  `[LocaleLayout] Calling getMessages explicitly with locale: ${locale}`
    // );
    messages = await getMessages({ locale });
    // console.log(`[LocaleLayout] Successfully got messages for: ${locale}`);
  } catch (error) {
    console.error(
      `[LocaleLayout] Error calling getMessages for locale ${locale}:`,
      error
    );
    // Nếu không lấy được messages (kể cả khi đã truyền locale đúng),
    // có thể là lỗi nghiêm trọng hơn, nên gọi notFound()
    notFound();
  }

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone="Asia/Ho_Chi_Minh"
    >
      <ReactQueryProvider>
        {/* <VideoProvider> */}
        <SiteLayout locale={locale}>{children}</SiteLayout>
        <Toaster position="top-right" richColors closeButton />
        {/* </VideoProvider> */}
      </ReactQueryProvider>
    </NextIntlClientProvider>
  );
}
