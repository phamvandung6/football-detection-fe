"use client";

import { NextIntlClientProvider } from "next-intl";
import { ReactNode } from "react";

type NextIntlProviderProps = {
  locale: string;
  children: ReactNode;
  messages: Record<string, any>;
};

export function NextIntlProvider({
  locale,
  children,
  messages,
}: NextIntlProviderProps) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone="Asia/Ho_Chi_Minh"
    >
      {children}
    </NextIntlClientProvider>
  );
}
