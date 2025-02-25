import { notFound } from "next/navigation";
import { NextIntlProvider } from "@/lib/i18n/provider";
import { locales } from "@/lib/i18n/locales";
import { SiteLayout } from "./site-layout";

// Import messages
import enMessages from "@/lib/i18n/messages/en.json";
import viMessages from "@/lib/i18n/messages/vi.json";

const messages: Record<string, any> = {
  en: enMessages,
  vi: viMessages,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Await params before accessing its properties
  const { locale } = await params;

  // Validate that the incoming locale is supported
  if (!locales.includes(locale as any)) {
    notFound();
  }

  return (
    <NextIntlProvider locale={locale} messages={messages[locale]}>
      <SiteLayout locale={locale}>{children}</SiteLayout>
    </NextIntlProvider>
  );
}
