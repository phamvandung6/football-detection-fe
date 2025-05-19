import { ThemeProvider } from "@/components/common/ThemeProvider";
import { ProcessingNotifications } from "@/components/videos/ProcessingNotifications";
import { defaultLocale, locales } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";
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
  const locale = awaitedParams.locale || defaultLocale;

  // Debug log right after getting locale
  // console.log(`[LocaleLayout] Received locale after await: ${locale}`);

  // Validate locale
  if (!locales.includes(locale as any)) {
    console.warn(`[LocaleLayout] Invalid locale: ${locale}, redirecting to 404`);
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
    // Thử lấy messages cho locale mặc định nếu không thể lấy messages cho locale hiện tại
    try {
      messages = await getMessages({ locale: defaultLocale });
      console.warn(
        `[LocaleLayout] Falling back to default locale messages: ${defaultLocale}`
      );
    } catch (fallbackError) {
      console.error(
        `[LocaleLayout] Critical error: Failed to load even default messages:`,
        fallbackError
      );
      // Nếu không lấy được messages cho locale mặc định (lỗi nghiêm trọng), trả về notFound
      notFound();
    }
  }

  return (
    <div
      className={cn(
        "min-h-screen bg-background font-sans antialiased"
      )}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
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
            <ProcessingNotifications locale={locale} />
          </ReactQueryProvider>
        </NextIntlClientProvider>
      </ThemeProvider>
    </div>
  );
}
