import { getRequestConfig } from "next-intl/server";
import { defaultLocale, locales } from "./lib/i18n/locales"; // Import thêm defaultLocale

export default getRequestConfig(async ({ locale }) => {
  let finalLocale = locale;
  let finalMessages: any;

  // Xác thực locale và xử lý fallback
  if (!finalLocale || !locales.includes(finalLocale as any)) {
    console.error(
      `[i18n.ts] Invalid or missing locale received: ${finalLocale}. Falling back to default: ${defaultLocale}`
    );
    // notFound(); // <-- Don't call notFound() immediately
    finalLocale = defaultLocale; // Use default locale instead
  }

  console.log(
    `[i18n.ts] Attempting to load messages for locale: ${finalLocale}`
  );

  try {
    // Tải tệp message tương ứng với finalLocale
    finalMessages = (await import(`./lib/i18n/messages/${finalLocale}.json`))
      .default;
    console.log(`[i18n.ts] Successfully loaded messages for: ${finalLocale}`);
  } catch (error) {
    console.error(
      `[i18n.ts] Failed to load messages for locale ${finalLocale}. Trying default locale messages as fallback: `,
      error
    );
    // Nếu không tải được messages cho locale hợp lệ (hoặc locale default), thử lại với default một lần nữa
    // hoặc trả về messages rỗng để tránh lỗi hoàn toàn.
    try {
      finalMessages = (
        await import(`./lib/i18n/messages/${defaultLocale}.json`)
      ).default;
      console.warn(
        `[i18n.ts] Loaded default messages for ${defaultLocale} as fallback.`
      );
      // Nếu dùng default messages, có thể cần set lại finalLocale thành defaultLocale?
      // finalLocale = defaultLocale; // Cân nhắc nếu logic yêu cầu locale phải khớp messages
    } catch (fallbackError) {
      console.error(
        `[i18n.ts] CRITICAL: Failed to load even default messages (${defaultLocale}). Returning empty messages.`,
        fallbackError
      );
      finalMessages = {};
      // Trong trường hợp này, có thể muốn gọi notFound() vì không có bản dịch nào
      // notFound();
    }
  }

  // Trả về đúng cấu trúc RequestConfig
  return {
    locale: finalLocale as string, // Return the locale that was actually used (potentially the default)
    messages: finalMessages,
  };
});
